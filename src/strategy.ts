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
  color: string;
}

interface ResolvedEntityFilterConfig {
  hide_entity_categories: string[];
}

type EntityGroupKey = "lights" | "climate" | "security" | "media" | "sensors" | "other";

interface EntityGroupDefinition {
  key: EntityGroupKey;
  title: string;
  icon: string;
}

const ENTITY_GROUPS: EntityGroupDefinition[] = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline" },
  { key: "media", title: "Media", icon: "mdi:speaker" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" },
];

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
    const areaNavigation = createAreaNavigation(visibleAreas, floors, pathRegistry);

    return {
      title: config.title ?? "Max Home",
      views: [
        createDashboardView(hass, areaNavigation, categoryViews, entities, entityFilter),
        ...categoryViews,
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
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
): LovelaceViewConfig {
  const locationName = hass.config.location_name ?? "Home";
  const roomSections = createFloorRoomCards(areas);
  const summaryItems = createDashboardSummaryItems(hass, categories, entities, entityFilter);

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
          {
            type: "grid",
            columns: 1,
            square: false,
            cards: summaryItems.map(createSummaryCard),
          },
        ],
      },
    ].filter((section) => section.cards.length > 0),
  };
}

function createAreaNavigation(
  areas: AreaRegistryEntry[],
  floors: FloorRegistryEntry[],
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
      floorId: area.floor_id,
      floorName: floor?.name ?? "Weitere Räume",
      floorIcon: floor?.icon ?? "mdi:home-floor-0",
      sortIndex: area.floor_id ? floorSortOrder.get(area.floor_id) ?? floors.length : floors.length,
    };
  });
}

function createFloorRoomCards(areas: DashboardNavigationItem[]): LovelaceCardConfig[] {
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
      {
        type: "grid",
        columns: 3,
        square: false,
        cards: floorAreas
          .slice()
          .sort((left, right) => left.title.localeCompare(right.title))
          .map((area) => ({
            type: "button",
            name: area.title,
            icon: area.icon,
            tap_action: {
              action: "navigate",
              navigation_path: `/${area.path}`,
            },
          })),
      },
    ]);
}

function createDashboardSummaryItems(
  hass: HomeAssistant,
  categories: LovelaceViewConfig[],
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
): DashboardSummaryItem[] {
  const visibleEntityIds = getVisibleEntities(entities, entityFilter)
    .map((entity) => entity.entity_id)
    .filter((entityId) => hass.states[entityId]);
  const groupedEntities = groupEntities(hass, visibleEntityIds);
  const categoryItems = categories.map((category) => ({
    title: category.title,
    subtitle: "Öffnen",
    path: category.path ?? slugify(category.title),
    icon: category.icon ?? "mdi:shape-outline",
    color: category.title.toLowerCase() === "shopping" ? "green" : "primary",
  }));

  return [
    {
      title: "Beleuchtung",
      subtitle: createLightSummary(hass, groupedEntities.lights),
      icon: "mdi:lamps-outline",
      color: "amber",
    },
    {
      title: "Raumklima",
      subtitle: createClimateSummary(hass, groupedEntities.climate),
      icon: "mdi:home-thermometer-outline",
      color: "deep-orange",
    },
    {
      title: "Sicherheit",
      subtitle: createSecuritySummary(hass, groupedEntities.security),
      icon: "mdi:shield-home-outline",
      color: "blue-grey",
    },
    {
      title: "Mediaplayer",
      subtitle: createMediaSummary(hass, groupedEntities.media),
      icon: "mdi:music-box-outline",
      color: "cyan",
    },
    ...categoryItems,
  ];
}

function createSummaryCard(item: DashboardSummaryItem): LovelaceCardConfig {
  return {
    type: "button",
    name: `${item.title}\n${item.subtitle}`,
    icon: item.icon,
    show_icon: true,
    show_name: true,
    tap_action: item.path
      ? {
          action: "navigate",
          navigation_path: `/${item.path}`,
        }
      : {
          action: "none",
        },
  };
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
            type: "heading",
            heading: area.name,
            heading_style: "title",
            icon: area.icon ?? "mdi:floor-plan",
          },
          {
            type: "markdown",
            content: "No visible entities are assigned to this room yet.",
          },
        ],
      },
    ];
  }

  const groups = groupEntities(hass, entityIds);
  const sections: LovelaceSectionConfig[] = [
    {
      type: "grid",
      cards: [
        {
          type: "heading",
          heading: area.name,
          heading_style: "title",
          icon: area.icon ?? "mdi:floor-plan",
        },
      ],
    },
  ];

  for (const group of ENTITY_GROUPS) {
    const groupedEntityIds = groups[group.key];

    if (groupedEntityIds.length === 0) {
      continue;
    }

    sections.push(createEntityGroupSection(group, groupedEntityIds));
  }

  return sections;
}

function createEntityGroupSection(group: EntityGroupDefinition, entityIds: string[]): LovelaceSectionConfig {
  const tileEntities = entityIds.filter(shouldRenderAsTile);
  const rowEntities = entityIds.filter((entityId) => !shouldRenderAsTile(entityId));
  const cards: LovelaceCardConfig[] = [
    {
      type: "heading",
      heading: group.title,
      heading_style: "subtitle",
      icon: group.icon,
    },
  ];

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

  return {
    type: "grid",
    cards,
  };
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

  if (["climate", "fan", "humidifier", "water_heater"].includes(domain)) {
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
