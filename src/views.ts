import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  LovelaceCardConfig,
  LovelaceSectionConfig,
  LovelaceViewConfig,
} from "./home-assistant";
import type {
  DashboardStrategyConfig,
  EntityGroupDefinition,
  EntityGroupKey,
  ShoppingCategoryConfig,
} from "./config";
import type { EntityCardContext } from "./cards";
import type { DashboardNavigationItem } from "./navigation";
import { DASHBOARD_SUMMARY_GROUPS, ENTITY_GROUPS } from "./config";
import { createEntityCards, createRoomNavigationCard, createSummaryButtonCard } from "./cards";
import { groupEntities, shouldGroupEntitiesByDevice } from "./entities";
import { compareFloors, ensureUniqueViewPaths, slugify, uniquePath } from "./navigation";

export interface EntityCategoryViews {
  views: LovelaceViewConfig[];
  pathByKey: Partial<Record<EntityGroupKey, string>>;
}

export interface DashboardSummaryItem {
  title: string;
  path?: string;
  icon: string;
}

interface EntityLocation {
  areaName: string;
  floorName: string;
  floorIcon: string;
  sortIndex: number;
}

export function createDashboardView(
  hass: HomeAssistant,
  areas: DashboardNavigationItem[],
  categories: LovelaceViewConfig[],
  entityCategoryPaths: Partial<Record<EntityGroupKey, string>>,
  dashboardRootPath: string,
): LovelaceViewConfig {
  const locationName = hass.config.location_name ?? "Home";
  const roomSections = createFloorRoomCards(areas, dashboardRootPath);
  const summaryItems = createDashboardSummaryItems(categories, entityCategoryPaths);

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
          createSummaryButtonCard(summaryItems, dashboardRootPath),
        ],
      },
    ].filter((section) => section.cards.length > 0),
  };
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
        heading_style: "title",
        icon: floorAreas[0]?.floorIcon ?? "mdi:home-floor-0",
      },
      ...floorAreas
        .slice()
        .sort((left, right) => left.title.localeCompare(right.title))
        .map((area) => createRoomNavigationCard(area, dashboardRootPath)),
    ]);
}

function createDashboardSummaryItems(
  categories: LovelaceViewConfig[],
  entityCategoryPaths: Partial<Record<EntityGroupKey, string>>,
): DashboardSummaryItem[] {
  const categoryItems = categories.map((category) => ({
    title: category.title,
    path: category.path ?? slugify(category.title),
    icon: category.icon ?? "mdi:shape-outline",
  }));

  return [
    {
      title: "Beleuchtung",
      path: entityCategoryPaths.lights,
      icon: "mdi:lamps-outline",
    },
    {
      title: "Raumklima",
      path: entityCategoryPaths.climate,
      icon: "mdi:home-thermometer-outline",
    },
    {
      title: "Sicherheit",
      path: entityCategoryPaths.security,
      icon: "mdi:shield-home-outline",
    },
    {
      title: "Mediaplayer",
      path: entityCategoryPaths.media,
      icon: "mdi:music-box-outline",
    },
    ...categoryItems,
  ];
}

export function createEntityCategoryViews(
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
          ? createLocatedEntitySections(hass, { ...group, title: getLocalizedGroupTitle(group.key) }, groupedEntityIds[group.key], entityLocations, {
              devices,
              entities,
            })
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

function createLocatedEntitySections(
  hass: HomeAssistant,
  group: EntityGroupDefinition,
  entityIds: string[],
  entityLocations: Map<string, EntityLocation>,
  cardContext: EntityCardContext,
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
          heading_style: "title",
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
        cards.push(...createEntityCards(hass, areaEntityIds, cardContext, shouldGroupEntitiesByDevice(group.key)));
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

export function createCategoryViews(config: DashboardStrategyConfig): LovelaceViewConfig[] {
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
  const shoppingCard = createKtorAppCard(config, {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    show_completed: config.show_completed ?? true,
  });
  const recipeCard = createKtorAppCard(config, {
    type: "custom:ktor-recipe-list-card",
    title: "Recipes",
  });

  return {
    title: config.title ?? "Shopping",
    path: config.path ?? "shopping",
    icon: config.icon ?? "mdi:cart-outline",
    type: "sections",
    max_columns: 2,
    sections: [
      {
        type: "grid",
        cards: [shoppingCard],
      },
      {
        type: "grid",
        cards: [recipeCard],
      },
    ],
  };
}

function createKtorAppCard(
  config: ShoppingCategoryConfig,
  cardConfig: LovelaceCardConfig,
): LovelaceCardConfig {
  const card: LovelaceCardConfig = {
    addon_slug: config.addon_slug ?? "ktor_app",
    ...cardConfig,
  };

  if (config.backend_url) {
    delete card.addon_slug;
    card.backend_url = config.backend_url;
  }

  return card;
}

export function buildAreaSections(
  hass: HomeAssistant,
  entityIds: string[],
  cardContext: EntityCardContext,
): LovelaceSectionConfig[] {
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

    sections.push(createEntityGroupSection(hass, group, groupedEntityIds, cardContext, !shouldGroupEntitiesByDevice(group.key)));
  }

  return sections;
}

function createEntityGroupSection(
  hass: HomeAssistant | undefined,
  group: EntityGroupDefinition,
  entityIds: string[],
  cardContext?: EntityCardContext,
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

  cards.push(...createEntityCards(hass, entityIds, cardContext, shouldGroupEntitiesByDevice(group.key)));

  return {
    type: "grid",
    cards,
  };
}
