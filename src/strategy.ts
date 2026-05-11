import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceDashboardConfig,
  LovelaceSectionConfig,
  LovelaceViewConfig,
} from "./home-assistant";

const STRATEGY_TYPE = "max-home-dashboard";

interface DashboardStrategyConfig {
  title?: string;
  shopping?: ShoppingCategoryConfig;
  categories?: CategoryStrategyConfig[];
  entity_filter?: EntityFilterConfig;
}

interface EntityFilterConfig {
  hide_entity_categories?: string[];
}

interface ShoppingCategoryConfig {
  enabled?: boolean;
  title?: string;
  icon?: string;
  path?: string;
  addon_slug?: string;
  backend_url?: string;
  show_completed?: boolean;
}

interface CategoryStrategyConfig {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  cards: LovelaceCardConfig[];
}

interface AreaViewStrategyConfig {
  area: AreaRegistryEntry;
  devices: DeviceRegistryEntry[];
  entities: EntityRegistryEntry[];
  entity_filter?: ResolvedEntityFilterConfig;
}

interface DashboardNavigationItem {
  title: string;
  path: string;
  icon: string;
  subtitle?: string;
  floorId?: string | null;
  floorName?: string;
  floorIcon?: string;
  sortIndex: number;
}

interface DashboardSummaryItem {
  title: string;
  subtitle: string;
  path?: string;
  icon: string;
}

interface ResolvedEntityFilterConfig {
  hide_entity_categories: string[];
}

interface EntityCategoryViews {
  views: LovelaceViewConfig[];
  pathByKey: Partial<Record<EntityGroupKey, string>>;
}

type EntityGroupKey = "lights" | "climate" | "security" | "media" | "sensors" | "other";

interface EntityGroupDefinition {
  key: EntityGroupKey;
  title: string;
  icon: string;
  path?: string;
}

const ENTITY_GROUPS: EntityGroupDefinition[] = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" },
];

const DASHBOARD_SUMMARY_GROUPS = ENTITY_GROUPS.filter((group) => group.path);

const DEFAULT_HIDDEN_ENTITY_CATEGORIES = ["config", "diagnostic"];

export class MaxHomeDashboardStrategy extends HTMLElement {
  static getCreateSuggestions(_hass: HomeAssistant): { title: string; icon: string } {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant",
    };
  }

  static async generate(
    config: DashboardStrategyConfig,
    hass: HomeAssistant,
  ): Promise<LovelaceDashboardConfig> {
    const [areas, devices, entities] = await Promise.all([
      hass.callWS<AreaRegistryEntry[]>({ type: "config/area_registry/list" }),
      hass.callWS<DeviceRegistryEntry[]>({ type: "config/device_registry/list" }),
      hass.callWS<EntityRegistryEntry[]>({ type: "config/entity_registry/list" }),
    ]);
    const floors = await hass
      .callWS<FloorRegistryEntry[]>({ type: "config/floor_registry/list" })
      .catch((): FloorRegistryEntry[] => []);
    const entityFilter = resolveEntityFilter(config);

    const visibleAreas = areas
      .filter((area) => area.area_id && area.name)
      .sort((left, right) => left.name.localeCompare(right.name));

    const categoryViews = createCategoryViews(config);
    const pathRegistry = new Set(["dashboard", ...categoryViews.map((view) => view.path).filter(Boolean) as string[]]);
    const areaNavigation = createAreaNavigation(visibleAreas, floors, devices, entities, entityFilter, hass, pathRegistry);
    const visibleEntityIds = getVisibleEntities(entities, entityFilter)
      .map((entity) => entity.entity_id)
      .filter((entityId) => hass.states[entityId]);
    const groupedEntityIds = groupEntities(hass, visibleEntityIds);
    const entityCategoryViews = createEntityCategoryViews(hass, groupedEntityIds, entities, visibleAreas, devices, floors, pathRegistry);
    const dashboardRootPath = getDashboardRootPath([
      "dashboard",
      ...categoryViews.map((view) => view.path).filter((path): path is string => Boolean(path)),
      ...entityCategoryViews.views.map((view) => view.path).filter((path): path is string => Boolean(path)),
      ...areaNavigation.map((area) => area.path),
    ]);

    return {
      title: config.title ?? "Max Home",
      views: [
        createDashboardView(hass, areaNavigation, categoryViews, groupedEntityIds, entityCategoryViews.pathByKey, dashboardRootPath),
        ...categoryViews,
        ...entityCategoryViews.views,
        ...visibleAreas.map((area, index) => {
          const navigation = areaNavigation[index];

          return {
            title: area.name,
            path: navigation?.path ?? slugify(area.name || area.area_id),
            icon: area.icon ?? undefined,
            subview: true,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${STRATEGY_TYPE}`,
              area,
              devices,
              entities,
              entity_filter: entityFilter,
            },
          };
        }),
      ],
    };
  }
}

export class MaxHomeAreaViewStrategy extends HTMLElement {
  static async generate(
    config: AreaViewStrategyConfig,
    hass: HomeAssistant,
  ): Promise<Pick<LovelaceViewConfig, "sections">> {
    const entityIds = getEntitiesForArea(config)
      .filter((entityId) => hass.states[entityId])
      .sort((left, right) => friendlyName(hass, left).localeCompare(friendlyName(hass, right)));

    return {
      sections: buildAreaSections(hass, config.area, entityIds),
    };
  }
}

function createDashboardView(
  hass: HomeAssistant,
  areas: DashboardNavigationItem[],
  categories: LovelaceViewConfig[],
  groupedEntityIds: Record<EntityGroupKey, string[]>,
  entityCategoryPaths: Partial<Record<EntityGroupKey, string>>,
  dashboardRootPath: string,
): LovelaceViewConfig {
  const locationName = hass.config.location_name ?? "Home";
  const roomSections = createFloorRoomCards(areas, dashboardRootPath);
  const summaryItems = createDashboardSummaryItems(hass, categories, groupedEntityIds, entityCategoryPaths);

  return {
    title: "Dashboard",
    path: "dashboard",
    icon: "mdi:home-variant-outline",
    type: "sections",
    max_columns: 3,
    sections: [
      {
        type: "grid",
        column_span: 2,
        cards: [
          {
            type: "heading",
            heading: `Willkommen ${locationName}`,
            heading_style: "title",
            icon: "mdi:home-heart",
          },
          {
            type: "heading",
            heading: " ",
            heading_style: "subtitle",
          },
          ...roomSections,
        ],
      },
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Kategorien",
            heading_style: "subtitle",
            icon: "mdi:view-dashboard-outline",
          },
          ...summaryItems.map((item) => createSummaryCard(item, dashboardRootPath)),
        ],
      },
    ].filter((section) => section.cards.length > 0),
  };
}

function createAreaNavigation(
  areas: AreaRegistryEntry[],
  floors: FloorRegistryEntry[],
  devices: DeviceRegistryEntry[],
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
  hass: HomeAssistant,
  pathRegistry: Set<string>,
): DashboardNavigationItem[] {
  const floorById = new Map(floors.map((floor) => [floor.floor_id, floor]));
  const floorSortOrder = new Map(
    floors
      .slice()
      .sort(compareFloors)
      .map((floor, index) => [floor.floor_id, index]),
  );

  return areas.map((area) => {
    const path = uniquePath(slugify(area.name || area.area_id), pathRegistry);
    const floor = area.floor_id ? floorById.get(area.floor_id) : undefined;

    return {
      title: area.name,
      path,
      icon: area.icon ?? "mdi:floor-plan",
      subtitle: getAreaTemperatureSummary(hass, area, devices, entities, entityFilter),
      floorId: area.floor_id,
      floorName: floor?.name ?? "Weitere Räume",
      floorIcon: floor?.icon ?? "mdi:home-floor-0",
      sortIndex: area.floor_id ? floorSortOrder.get(area.floor_id) ?? floors.length : floors.length,
    };
  });
}

function createFloorRoomCards(areas: DashboardNavigationItem[], dashboardRootPath: string): LovelaceCardConfig[] {
  const groupedAreas = new Map<string, DashboardNavigationItem[]>();

  for (const area of areas) {
    const floorName = area.floorName ?? "Weitere Räume";
    groupedAreas.set(floorName, [...(groupedAreas.get(floorName) ?? []), area]);
  }

  return Array.from(groupedAreas.entries())
    .sort(([, leftAreas], [, rightAreas]) => {
      const left = leftAreas[0];
      const right = rightAreas[0];

      return (left?.sortIndex ?? 0) - (right?.sortIndex ?? 0) || (left?.floorName ?? "").localeCompare(right?.floorName ?? "");
    })
    .flatMap(([floorName, floorAreas]) => [
      {
        type: "heading",
        heading: floorName,
        heading_style: "subtitle",
        icon: floorAreas[0]?.floorIcon ?? "mdi:home-floor-0",
      },
      ...floorAreas
        .slice()
        .sort((left, right) => left.title.localeCompare(right.title))
        .map((area) => createRoomNavigationCard(area, dashboardRootPath)),
    ]);
}

function createRoomNavigationCard(area: DashboardNavigationItem, dashboardRootPath: string): LovelaceCardConfig {
  const navigationPath = createNavigationPath(dashboardRootPath, area.path);
  const subtitle = area.subtitle ? `<br><span style="font-size: 12px; font-weight: 600;">${escapeHtml(area.subtitle)}</span>` : "";

  return {
    type: "markdown",
    content: `<a href="${escapeHtml(navigationPath)}" style="color: inherit; display: block; min-height: 94px; padding-top: 10px; text-align: center; text-decoration: none;"><ha-icon icon="${escapeHtml(area.icon)}" style="--mdc-icon-size: 22px; color: var(--state-icon-color, var(--primary-color));"></ha-icon><br><br><span style="font-size: 12px; font-weight: 700; line-height: 1.2;">${escapeHtml(area.title)}</span>${subtitle}</a>`,
    grid_options: {
      columns: 4,
      rows: 2,
    },
  };
}

function createDashboardSummaryItems(
  hass: HomeAssistant,
  categories: LovelaceViewConfig[],
  groupedEntities: Record<EntityGroupKey, string[]>,
  entityCategoryPaths: Partial<Record<EntityGroupKey, string>>,
): DashboardSummaryItem[] {
  const categoryItems = categories.map((category) => ({
    title: category.title,
    subtitle: "Öffnen",
    path: category.path ?? slugify(category.title),
    icon: category.icon ?? "mdi:shape-outline",
  }));

  return [
    {
      title: "Beleuchtung",
      subtitle: createLightSummary(hass, groupedEntities.lights),
      path: entityCategoryPaths.lights,
      icon: "mdi:lamps-outline",
    },
    {
      title: "Raumklima",
      subtitle: createClimateSummary(hass, groupedEntities.climate),
      path: entityCategoryPaths.climate,
      icon: "mdi:home-thermometer-outline",
    },
    {
      title: "Sicherheit",
      subtitle: createSecuritySummary(hass, groupedEntities.security),
      path: entityCategoryPaths.security,
      icon: "mdi:shield-home-outline",
    },
    {
      title: "Mediaplayer",
      subtitle: createMediaSummary(hass, groupedEntities.media),
      path: entityCategoryPaths.media,
      icon: "mdi:music-box-outline",
    },
    ...categoryItems,
  ];
}

function createSummaryCard(item: DashboardSummaryItem, dashboardRootPath: string): LovelaceCardConfig {
  const navigationPath = item.path ? createNavigationPath(dashboardRootPath, item.path) : undefined;
  const content = `<a href="${escapeHtml(navigationPath ?? "#")}" style="align-items: center; color: inherit; display: flex; gap: 14px; min-height: 48px; text-decoration: none;"><ha-icon icon="${escapeHtml(item.icon)}" style="--mdc-icon-size: 22px; color: var(--state-icon-color, var(--primary-color)); flex: 0 0 auto;"></ha-icon><span style="display: flex; flex-direction: column; line-height: 1.2;"><strong style="font-size: 13px;">${escapeHtml(item.title)}</strong><span style="font-size: 12px;">${escapeHtml(item.subtitle)}</span></span></a>`;

  return {
    type: "markdown",
    content,
    grid_options: {
      columns: "full",
      rows: 1,
    },
  };
}

function getAreaTemperatureSummary(
  hass: HomeAssistant,
  area: AreaRegistryEntry,
  devices: DeviceRegistryEntry[],
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
): string | undefined {
  const temperatures = getEntitiesForArea({ area, devices, entities, entity_filter: entityFilter })
    .map((entityId) => getEntityTemperature(hass, entityId))
    .filter((temperature): temperature is number => Number.isFinite(temperature));

  if (temperatures.length === 0) {
    return undefined;
  }

  const average = temperatures.reduce((sum, temperature) => sum + temperature, 0) / temperatures.length;

  return `${average.toFixed(1).replace(".", ",")} °C`;
}

function createEntityCategoryViews(
  hass: HomeAssistant,
  groupedEntityIds: Record<EntityGroupKey, string[]>,
  entities: EntityRegistryEntry[],
  areas: AreaRegistryEntry[],
  devices: DeviceRegistryEntry[],
  floors: FloorRegistryEntry[],
  pathRegistry: Set<string>,
): EntityCategoryViews {
  const entityLocations = createEntityLocationResolver(entities, areas, devices, floors);
  const pathByKey: Partial<Record<EntityGroupKey, string>> = {};
  const views = DASHBOARD_SUMMARY_GROUPS.map((group) => {
    const path = uniquePath(group.path, pathRegistry);
    pathByKey[group.key] = path;

    return {
      title: getLocalizedGroupTitle(group.key),
      path,
      icon: group.icon,
      subview: true,
      type: "sections",
      max_columns: 3,
      sections:
        groupedEntityIds[group.key].length > 0
          ? createLocatedEntitySections(hass, { ...group, title: getLocalizedGroupTitle(group.key) }, groupedEntityIds[group.key], entityLocations)
          : [
              {
                type: "grid",
                cards: [
                  {
                    type: "markdown",
                    content: "Keine sichtbaren Entitäten in dieser Kategorie.",
                  },
                ],
              },
            ],
    };
  });

  return { views, pathByKey };
}

interface EntityLocation {
  areaName: string;
  floorName: string;
  floorIcon: string;
  sortIndex: number;
}

function createLocatedEntitySections(
  hass: HomeAssistant,
  group: EntityGroupDefinition,
  entityIds: string[],
  entityLocations: Map<string, EntityLocation>,
): LovelaceSectionConfig[] {
  const groupedByFloor = new Map<string, Map<string, string[]>>();
  const locationByFloor = new Map<string, EntityLocation>();

  for (const entityId of entityIds) {
    const location = entityLocations.get(entityId) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER,
    };
    const floorAreas = groupedByFloor.get(location.floorName) ?? new Map<string, string[]>();
    floorAreas.set(location.areaName, [...(floorAreas.get(location.areaName) ?? []), entityId]);
    groupedByFloor.set(location.floorName, floorAreas);
    locationByFloor.set(location.floorName, location);
  }

  return Array.from(groupedByFloor.entries())
    .sort(([leftFloor], [rightFloor]) => {
      const leftLocation = locationByFloor.get(leftFloor);
      const rightLocation = locationByFloor.get(rightFloor);

      return (leftLocation?.sortIndex ?? 0) - (rightLocation?.sortIndex ?? 0) || leftFloor.localeCompare(rightFloor);
    })
    .flatMap(([floorName, areasForFloor]) => {
      const floorLocation = locationByFloor.get(floorName);
      const cards: LovelaceCardConfig[] = [
        {
          type: "heading",
          heading: floorName,
          heading_style: "subtitle",
          icon: floorLocation?.floorIcon ?? "mdi:home-floor-0",
        },
      ];

      for (const [areaName, areaEntityIds] of Array.from(areasForFloor.entries()).sort(([left], [right]) => left.localeCompare(right))) {
        cards.push({
          type: "heading",
          heading: areaName,
          heading_style: "subtitle",
          icon: "mdi:chevron-right",
        });
        cards.push(...createEntityCards(hass, areaEntityIds));
      }

      return [
        {
          type: "grid",
          cards,
        },
      ];
    });
}

function createEntityLocationResolver(
  entities: EntityRegistryEntry[],
  areas: AreaRegistryEntry[],
  devices: DeviceRegistryEntry[],
  floors: FloorRegistryEntry[],
): Map<string, EntityLocation> {
  const areaById = new Map(areas.map((area) => [area.area_id, area]));
  const deviceById = new Map(devices.map((device) => [device.id, device]));
  const floorById = new Map(floors.map((floor) => [floor.floor_id, floor]));
  const floorSortOrder = new Map(
    floors
      .slice()
      .sort(compareFloors)
      .map((floor, index) => [floor.floor_id, index]),
  );

  return new Map(
    entities.map((entity) => {
      const device = entity.device_id ? deviceById.get(entity.device_id) : undefined;
      const areaId = entity.area_id ?? device?.area_id ?? undefined;
      const area = areaId ? areaById.get(areaId) : undefined;
      const floorId = area?.floor_id ?? device?.floor_id ?? undefined;
      const floor = floorId ? floorById.get(floorId) : undefined;

      return [
        entity.entity_id,
        {
          areaName: area?.name ?? "Ohne Raum",
          floorName: floor?.name ?? "Weitere Räume",
          floorIcon: floor?.icon ?? "mdi:home-floor-0",
          sortIndex: floorId ? floorSortOrder.get(floorId) ?? floors.length : floors.length,
        },
      ];
    }),
  );
}

function getLocalizedGroupTitle(groupKey: EntityGroupKey): string {
  switch (groupKey) {
    case "lights":
      return "Beleuchtung";
    case "climate":
      return "Raumklima";
    case "security":
      return "Sicherheit";
    case "media":
      return "Mediaplayer";
    case "sensors":
      return "Sensoren";
    case "other":
      return "Sonstige";
  }
}

function getDashboardRootPath(viewPaths: string[]): string {
  const currentPath = window.location.pathname.replace(/\/+$/g, "");
  const parts = currentPath.split("/").filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  const currentViewPath = decodeURIComponent(parts[parts.length - 1] ?? "");

  if (viewPaths.includes(currentViewPath)) {
    return `/${parts.slice(0, -1).join("/")}`;
  }

  return `/${parts.join("/")}`;
}

function createNavigationPath(dashboardRootPath: string, viewPath: string): string {
  const root = dashboardRootPath.replace(/\/+$/g, "");
  const target = viewPath.replace(/^\/+/g, "");

  return `${root}/${target}`;
}

function createCategoryViews(config: DashboardStrategyConfig): LovelaceViewConfig[] {
  const views: LovelaceViewConfig[] = [];

  if (config.shopping?.enabled !== false) {
    views.push(createShoppingView(config.shopping));
  }

  for (const category of config.categories ?? []) {
    if (!category.id || !category.title || !Array.isArray(category.cards)) {
      continue;
    }

    views.push({
      title: category.title,
      path: category.path ?? slugify(category.id),
      icon: category.icon ?? "mdi:shape-outline",
      type: "sections",
      max_columns: 2,
      sections: [
        {
          type: "grid",
          cards: category.cards,
        },
      ],
    });
  }

  return ensureUniqueViewPaths(views, ["dashboard"]);
}

function createShoppingView(config: ShoppingCategoryConfig = {}): LovelaceViewConfig {
  const card: LovelaceCardConfig = {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    addon_slug: config.addon_slug ?? "ktor_app",
    show_completed: config.show_completed ?? true,
  };

  if (config.backend_url) {
    delete card.addon_slug;
    card.backend_url = config.backend_url;
  }

  return {
    title: config.title ?? "Shopping",
    path: config.path ?? "shopping",
    icon: config.icon ?? "mdi:cart-outline",
    panel: true,
    cards: [card],
  };
}

function buildAreaSections(hass: HomeAssistant, area: AreaRegistryEntry, entityIds: string[]): LovelaceSectionConfig[] {
  if (entityIds.length === 0) {
    return [
      {
        type: "grid",
        cards: [
          {
            type: "markdown",
            content: "No visible entities are assigned to this room yet.",
          },
        ],
      },
    ];
  }

  const groups = groupEntities(hass, entityIds);
  const sections: LovelaceSectionConfig[] = [];

  for (const group of ENTITY_GROUPS) {
    const groupedEntityIds = groups[group.key];

    if (groupedEntityIds.length === 0) {
      continue;
    }

    sections.push(createEntityGroupSection(hass, group, groupedEntityIds));
  }

  return sections;
}

function createEntityGroupSection(
  hass: HomeAssistant | undefined,
  group: EntityGroupDefinition,
  entityIds: string[],
  showHeading = true,
): LovelaceSectionConfig {
  const cards: LovelaceCardConfig[] = showHeading
    ? [
        {
          type: "heading",
          heading: group.title,
          heading_style: "subtitle",
          icon: group.icon,
        },
      ]
    : [];

  cards.push(...createEntityCards(hass, entityIds));

  return {
    type: "grid",
    cards,
  };
}

function createEntityCards(hass: HomeAssistant | undefined, entityIds: string[]): LovelaceCardConfig[] {
  const cameraEntities = entityIds.filter(isCameraEntity);
  const historyEntities = hass ? entityIds.filter((entityId) => shouldRenderAsHistoryGraph(hass, entityId)) : [];
  const tileEntities = entityIds.filter(
    (entityId) => !isCameraEntity(entityId) && !historyEntities.includes(entityId) && shouldRenderAsTile(entityId),
  );
  const rowEntities = entityIds.filter(
    (entityId) => !isCameraEntity(entityId) && !historyEntities.includes(entityId) && !shouldRenderAsTile(entityId),
  );
  const cards: LovelaceCardConfig[] = [];

  for (const entityId of cameraEntities) {
    cards.push({
      type: "picture-entity",
      entity: entityId,
      camera_view: "live",
      show_name: true,
      show_state: false,
    });
  }

  if (historyEntities.length > 0) {
    cards.push({
      type: "history-graph",
      hours_to_show: 24,
      entities: historyEntities,
    });
  }

  if (tileEntities.length > 0) {
    cards.push({
      type: "grid",
      columns: 2,
      square: false,
      cards: tileEntities.map((entityId) => ({
        type: "tile",
        entity: entityId,
      })),
    });
  }

  if (rowEntities.length > 0) {
    cards.push({
      type: "entities",
      show_header_toggle: false,
      entities: rowEntities,
    });
  }

  return cards;
}

function shouldRenderAsTile(entityId: string): boolean {
  const domain = entityId.split(".")[0] ?? "";

  return [
    "button",
    "climate",
    "cover",
    "fan",
    "humidifier",
    "input_number",
    "light",
    "lock",
    "media_player",
    "number",
    "remote",
    "select",
    "switch",
    "text",
    "vacuum",
    "water_heater",
  ].includes(domain);
}

function isCameraEntity(entityId: string): boolean {
  return entityId.split(".")[0] === "camera";
}

function shouldRenderAsHistoryGraph(hass: HomeAssistant, entityId: string): boolean {
  const domain = entityId.split(".")[0] ?? "";
  const deviceClass = String(hass.states[entityId]?.attributes.device_class ?? "");

  return domain === "sensor" && ["temperature", "humidity"].includes(deviceClass);
}

function groupEntities(hass: HomeAssistant, entityIds: string[]): Record<EntityGroupKey, string[]> {
  const groups: Record<EntityGroupKey, string[]> = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: [],
  };

  for (const entityId of entityIds) {
    groups[classifyEntity(hass, entityId)].push(entityId);
  }

  return groups;
}

function classifyEntity(hass: HomeAssistant, entityId: string): EntityGroupKey {
  const domain = entityId.split(".")[0] ?? "";
  const deviceClass = hass.states[entityId]?.attributes.device_class;

  if (domain === "light" || domain === "switch" || domain === "cover") {
    return "lights";
  }

  if (
    ["climate", "fan", "humidifier", "water_heater"].includes(domain) ||
    ["temperature", "humidity"].includes(String(deviceClass))
  ) {
    return "climate";
  }

  if (["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(domain)) {
    return "security";
  }

  if (["media_player", "remote", "vacuum"].includes(domain)) {
    return "media";
  }

  if (
    domain === "sensor" ||
    ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(deviceClass))
  ) {
    return "sensors";
  }

  return "other";
}

function createLightSummary(hass: HomeAssistant, entityIds: string[]): string {
  const activeCount = entityIds.filter((entityId) => ["on", "open", "opening"].includes(hass.states[entityId]?.state ?? "")).length;

  return activeCount === 0 ? "Alle aus" : `${activeCount} aktiv`;
}

function createClimateSummary(hass: HomeAssistant, entityIds: string[]): string {
  const temperatures = entityIds
    .map((entityId) => getEntityTemperature(hass, entityId))
    .filter((temperature): temperature is number => Number.isFinite(temperature));

  if (temperatures.length === 0) {
    return "Keine Werte";
  }

  const average = temperatures.reduce((sum, temperature) => sum + temperature, 0) / temperatures.length;

  return `${average.toFixed(1).replace(".", ",")}°`;
}

function createSecuritySummary(hass: HomeAssistant, entityIds: string[]): string {
  const activeCount = entityIds.filter((entityId) =>
    ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(hass.states[entityId]?.state ?? ""),
  ).length;

  return activeCount === 0 ? "Alles ruhig" : `${activeCount} aktiv`;
}

function createMediaSummary(hass: HomeAssistant, entityIds: string[]): string {
  const playingCount = entityIds.filter((entityId) => hass.states[entityId]?.state === "playing").length;

  return playingCount === 0 ? "Keine Wiedergabe" : `${playingCount} Wiedergabe`;
}

function getEntityTemperature(hass: HomeAssistant, entityId: string): number | undefined {
  const state = hass.states[entityId];
  const temperatureAttributes = ["current_temperature", "temperature"];

  for (const attribute of temperatureAttributes) {
    const value = state?.attributes[attribute];

    if (typeof value === "number") {
      return value;
    }
  }

  if (state?.attributes.device_class === "temperature") {
    const stateValue = Number.parseFloat(state.state);

    if (Number.isFinite(stateValue)) {
      return stateValue;
    }
  }

  return undefined;
}

function compareFloors(left: FloorRegistryEntry, right: FloorRegistryEntry): number {
  if (typeof left.level === "number" && typeof right.level === "number" && left.level !== right.level) {
    return left.level - right.level;
  }

  if (typeof left.level === "number") {
    return -1;
  }

  if (typeof right.level === "number") {
    return 1;
  }

  return left.name.localeCompare(right.name);
}

function ensureUniqueViewPaths(views: LovelaceViewConfig[], reservedPaths: string[] = []): LovelaceViewConfig[] {
  const seen = new Set(reservedPaths);

  return views.map((view) => {
    const basePath = slugify(view.path ?? view.title);

    return {
      ...view,
      path: uniquePath(basePath, seen),
    };
  });
}

function uniquePath(path: string | undefined, existing: Set<string> | Array<string | undefined>): string {
  const seen = existing instanceof Set ? existing : new Set(existing.filter(Boolean) as string[]);
  const basePath = slugify(path || "view") || "view";
  let candidate = basePath;
  let index = 2;

  while (seen.has(candidate)) {
    candidate = `${basePath}-${index}`;
    index += 1;
  }

  seen.add(candidate);
  return candidate;
}

function getEntitiesForArea(config: AreaViewStrategyConfig): string[] {
  const entityFilter = config.entity_filter ?? {
    hide_entity_categories: DEFAULT_HIDDEN_ENTITY_CATEGORIES,
  };
  const areaDeviceIds = new Set(
    config.devices.filter((device) => device.area_id === config.area.area_id).map((device) => device.id),
  );

  return getVisibleEntities(config.entities, entityFilter)
    .filter(
      (entity) =>
        entity.area_id === config.area.area_id ||
        (!entity.area_id && entity.device_id !== null && entity.device_id !== undefined && areaDeviceIds.has(entity.device_id)),
    )
    .map((entity) => entity.entity_id);
}

function getVisibleEntities(
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
): EntityRegistryEntry[] {
  const hiddenCategories = new Set(entityFilter.hide_entity_categories);

  return entities
    .filter((entity) => !entity.hidden_by && !entity.disabled_by)
    .filter((entity) => !entity.entity_category || !hiddenCategories.has(entity.entity_category));
}

function resolveEntityFilter(config: DashboardStrategyConfig): ResolvedEntityFilterConfig {
  const configuredCategories = config.entity_filter?.hide_entity_categories;

  return {
    hide_entity_categories: Array.isArray(configuredCategories) ? configuredCategories : DEFAULT_HIDDEN_ENTITY_CATEGORIES,
  };
}

function friendlyName(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.attributes.friendly_name ?? entityId;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

export function registerStrategies(): void {
  customElements.define(`ll-strategy-dashboard-${STRATEGY_TYPE}`, MaxHomeDashboardStrategy);
  customElements.define(`ll-strategy-view-${STRATEGY_TYPE}`, MaxHomeAreaViewStrategy);

  window.customStrategies = window.customStrategies || [];
  window.customStrategies.push({
    type: STRATEGY_TYPE,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/",
  });
}

declare global {
  interface Window {
    customStrategies?: Array<{
      type: string;
      strategyType: "dashboard" | "view";
      name?: string;
      description?: string;
      documentationURL?: string;
    }>;
  }
}
