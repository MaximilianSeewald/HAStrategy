import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  LovelaceCardConfig,
} from "./home-assistant";

export const STRATEGY_TYPE = "max-home-dashboard";
export const STRATEGY_VERSION = "0.2.2";

export interface DashboardStrategyConfig {
  title?: string;
  shopping?: ShoppingCategoryConfig;
  categories?: CategoryStrategyConfig[];
  entity_filter?: EntityFilterConfig;
}

interface EntityFilterConfig {
  hide_entity_categories?: string[];
}

export interface ShoppingCategoryConfig {
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

export interface AreaViewStrategyConfig {
  area: AreaRegistryEntry;
  devices: DeviceRegistryEntry[];
  entities: EntityRegistryEntry[];
  entity_filter?: ResolvedEntityFilterConfig;
}

export interface ResolvedEntityFilterConfig {
  hide_entity_categories: string[];
}

export type EntityGroupKey = "lights" | "climate" | "security" | "media" | "sensors" | "other";

export interface EntityGroupDefinition {
  key: EntityGroupKey;
  title: string;
  icon: string;
  path?: string;
}

export const ENTITY_GROUPS: EntityGroupDefinition[] = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" },
];

export const DASHBOARD_SUMMARY_GROUPS = ENTITY_GROUPS.filter((group) => group.path);

export const DEFAULT_HIDDEN_ENTITY_CATEGORIES = ["config", "diagnostic"];

export function resolveEntityFilter(config: DashboardStrategyConfig): ResolvedEntityFilterConfig {
  const configuredCategories = config.entity_filter?.hide_entity_categories;

  return {
    hide_entity_categories: Array.isArray(configuredCategories) ? configuredCategories : DEFAULT_HIDDEN_ENTITY_CATEGORIES,
  };
}
