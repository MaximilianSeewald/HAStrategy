import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
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
}

interface DashboardNavigationItem {
  title: string;
  path: string;
  icon: string;
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

    const visibleAreas = areas
      .filter((area) => area.area_id && area.name)
      .sort((left, right) => left.name.localeCompare(right.name));

    const categoryViews = createCategoryViews(config);
    const pathRegistry = new Set(categoryViews.map((view) => view.path).filter(Boolean) as string[]);
    const areaNavigation = visibleAreas.map((area) => {
      const path = uniquePath(slugify(area.name || area.area_id), pathRegistry);

      return {
        title: area.name,
        path,
        icon: area.icon ?? "mdi:floor-plan",
      };
    });

    return {
      title: config.title ?? "Max Home",
      views: [
        createOverviewView(hass, areaNavigation, categoryViews),
        ...categoryViews,
        ...visibleAreas.map((area, index) => {
          const navigation = areaNavigation[index];

          return {
            title: area.name,
            path: navigation?.path ?? slugify(area.name || area.area_id),
            icon: area.icon ?? undefined,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${STRATEGY_TYPE}`,
              area,
              devices,
              entities,
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

function createOverviewView(
  hass: HomeAssistant,
  areas: DashboardNavigationItem[],
  categories: LovelaceViewConfig[],
): LovelaceViewConfig {
  const locationName = hass.config.location_name ?? "Home";
  const categoryItems = categories.map((category) => ({
    title: category.title,
    path: category.path ?? slugify(category.title),
    icon: category.icon ?? "mdi:shape-outline",
  }));

  return {
    title: "Home",
    path: "home",
    icon: "mdi:home-variant-outline",
    type: "sections",
    max_columns: 3,
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: locationName,
            heading_style: "title",
            icon: "mdi:home-heart",
          },
        ],
      },
      createNavigationSection("Categories", categoryItems, "mdi:shape-outline"),
      createNavigationSection("Rooms", areas, "mdi:floor-plan"),
    ].filter((section) => section.cards.length > 0),
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

  return ensureUniqueViewPaths(views);
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
    type: "sections",
    max_columns: 2,
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: config.title ?? "Shopping",
            heading_style: "title",
            icon: config.icon ?? "mdi:cart-outline",
          },
          card,
        ],
      },
    ],
  };
}

function createNavigationSection(
  title: string,
  items: DashboardNavigationItem[],
  fallbackIcon: string,
): LovelaceSectionConfig {
  if (items.length === 0) {
    return {
      type: "grid",
      cards: [],
    };
  }

  return {
    type: "grid",
    cards: [
      {
        type: "heading",
        heading: title,
        heading_style: "subtitle",
        icon: fallbackIcon,
      },
      {
        type: "grid",
        columns: 2,
        square: false,
        cards: items.map((item) => ({
          type: "tile",
          name: item.title,
          icon: item.icon || fallbackIcon,
          color: "primary",
          tap_action: {
            action: "navigate",
            navigation_path: `/${item.path}`,
          },
        })),
      },
    ],
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

    sections.push({
      type: "grid",
      cards: [
        {
          type: "entities",
          title: group.title,
          icon: group.icon,
          show_header_toggle: false,
          entities: groupedEntityIds,
        },
      ],
    });
  }

  return sections;
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

function ensureUniqueViewPaths(views: LovelaceViewConfig[]): LovelaceViewConfig[] {
  const seen = new Set<string>();

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
  const areaDeviceIds = new Set(
    config.devices.filter((device) => device.area_id === config.area.area_id).map((device) => device.id),
  );

  return config.entities
    .filter((entity) => !entity.hidden_by && !entity.disabled_by)
    .filter(
      (entity) =>
        entity.area_id === config.area.area_id ||
        (!entity.area_id && entity.device_id !== null && entity.device_id !== undefined && areaDeviceIds.has(entity.device_id)),
    )
    .map((entity) => entity.entity_id);
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
