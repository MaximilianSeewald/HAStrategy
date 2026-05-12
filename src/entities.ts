import type { EntityRegistryEntry, HomeAssistant } from "./home-assistant";
import type { AreaViewStrategyConfig, EntityGroupKey, ResolvedEntityFilterConfig } from "./config";
import { DEFAULT_HIDDEN_ENTITY_CATEGORIES } from "./config";

export function getEntitiesForArea(config: AreaViewStrategyConfig): string[] {
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

export function getVisibleEntities(
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
): EntityRegistryEntry[] {
  const hiddenCategories = new Set(entityFilter.hide_entity_categories);

  return entities
    .filter((entity) => !entity.hidden_by && !entity.disabled_by)
    .filter((entity) => !entity.entity_category || !hiddenCategories.has(entity.entity_category));
}

export function groupEntities(hass: HomeAssistant, entityIds: string[]): Record<EntityGroupKey, string[]> {
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

export function getEntityTemperature(hass: HomeAssistant, entityId: string): number | undefined {
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

export function friendlyName(hass: HomeAssistant, entityId: string): string {
  return hass.states[entityId]?.attributes.friendly_name ?? entityId;
}

export function shouldGroupEntitiesByDevice(groupKey: EntityGroupKey): boolean {
  return !["lights", "climate", "security"].includes(groupKey);
}
