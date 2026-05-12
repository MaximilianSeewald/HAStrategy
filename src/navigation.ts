import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  FloorRegistryEntry,
  HomeAssistant,
  LovelaceViewConfig,
} from "./home-assistant";
import type { ResolvedEntityFilterConfig } from "./config";
import { getEntitiesForArea, getEntityTemperature } from "./entities";

export interface DashboardNavigationItem {
  title: string;
  path: string;
  icon: string;
  stateEntityId?: string;
  floorName?: string;
  floorIcon?: string;
  sortIndex: number;
}

export function createAreaNavigation(
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
      stateEntityId: getAreaTemperatureEntityId(hass, area, devices, entities, entityFilter),
      floorName: floor?.name ?? "Weitere Räume",
      floorIcon: floor?.icon ?? "mdi:home-floor-0",
      sortIndex: area.floor_id ? floorSortOrder.get(area.floor_id) ?? floors.length : floors.length,
    };
  });
}

function getAreaTemperatureEntityId(
  hass: HomeAssistant,
  area: AreaRegistryEntry,
  devices: DeviceRegistryEntry[],
  entities: EntityRegistryEntry[],
  entityFilter: ResolvedEntityFilterConfig,
): string | undefined {
  return getEntitiesForArea({ area, devices, entities, entity_filter: entityFilter }).find((entityId) => {
    const state = hass.states[entityId];

    return entityId.startsWith("sensor.") && state?.attributes.device_class === "temperature" && Number.isFinite(getEntityTemperature(hass, entityId));
  });
}

export function compareFloors(left: FloorRegistryEntry, right: FloorRegistryEntry): number {
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

export function getDashboardRootPath(viewPaths: string[]): string {
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

export function createNavigationPath(dashboardRootPath: string, viewPath: string): string {
  const root = dashboardRootPath.replace(/\/+$/g, "");
  const target = viewPath.replace(/^\/+/g, "");

  return `${root}/${target}`;
}

export function ensureUniqueViewPaths(views: LovelaceViewConfig[], reservedPaths: string[] = []): LovelaceViewConfig[] {
  const seen = new Set(reservedPaths);

  return views.map((view) => {
    const basePath = slugify(view.path ?? view.title);

    return {
      ...view,
      path: uniquePath(basePath, seen),
    };
  });
}

export function uniquePath(path: string | undefined, existing: Set<string> | Array<string | undefined>): string {
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

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
