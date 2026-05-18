import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  LovelaceDashboardConfig,
  LovelaceDashboardStrategyConstructor,
  LovelaceViewConfig,
  LovelaceViewStrategyConstructor,
} from "./home-assistant";
import type { AreaViewStrategyConfig, DashboardStrategyConfig } from "./config";
import { STRATEGY_TYPE, STRATEGY_VERSION, resolveEntityFilter } from "./config";
import { CompactSummaryButtonsCard, WideCardsCard } from "./cards";
import { friendlyName, getEntitiesForArea, getVisibleEntities, groupEntities } from "./entities";
import { createAreaNavigation, getDashboardRootPath, slugify } from "./navigation";
import { buildAreaSections, createCategoryViews, createDashboardView, createEntityCategoryViews } from "./views";

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
    const pathRegistry = new Set(["dashboard", ...(categoryViews.map((view) => view.path).filter(Boolean) as string[])]);
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
        createDashboardView(hass, areaNavigation, categoryViews, entityCategoryViews.pathByKey, dashboardRootPath),
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
      sections: buildAreaSections(hass, entityIds, {
        devices: config.devices,
        entities: config.entities,
      }),
    };
  }
}

export function registerStrategies(): void {
  console.info(`[HAStrategy] loaded ${STRATEGY_VERSION}`);
  const dashboardStrategy = MaxHomeDashboardStrategy satisfies LovelaceDashboardStrategyConstructor<DashboardStrategyConfig>;
  const areaViewStrategy = MaxHomeAreaViewStrategy satisfies LovelaceViewStrategyConstructor<AreaViewStrategyConfig>;

  if (!customElements.get(`${STRATEGY_TYPE}-summary-buttons`)) {
    customElements.define(`${STRATEGY_TYPE}-summary-buttons`, CompactSummaryButtonsCard);
  }

  if (!customElements.get(`${STRATEGY_TYPE}-wide-cards`)) {
    customElements.define(`${STRATEGY_TYPE}-wide-cards`, WideCardsCard);
  }

  customElements.define(`ll-strategy-dashboard-${STRATEGY_TYPE}`, dashboardStrategy);
  customElements.define(`ll-strategy-view-${STRATEGY_TYPE}`, areaViewStrategy);

  window.customStrategies = window.customStrategies || [];
  window.customStrategies.push({
    type: STRATEGY_TYPE,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${STRATEGY_VERSION}.`,
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
