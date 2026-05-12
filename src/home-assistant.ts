export interface HomeAssistant {
  states: Record<string, HassEntity>;
  config: {
    location_name?: string;
  };
  callWS<T = unknown>(message: Record<string, unknown>): Promise<T>;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    icon?: string;
    device_class?: string;
    unit_of_measurement?: string;
    [key: string]: unknown;
  };
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  icon?: string | null;
  floor_id?: string | null;
}

export interface FloorRegistryEntry {
  floor_id: string;
  name: string;
  icon?: string | null;
  level?: number | null;
}

export interface DeviceRegistryEntry {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  area_id?: string | null;
  floor_id?: string | null;
}

export interface EntityRegistryEntry {
  entity_id: string;
  area_id?: string | null;
  device_id?: string | null;
  hidden_by?: string | null;
  disabled_by?: string | null;
  entity_category?: string | null;
}

export interface LovelaceCardConfig {
  type: string;
  [key: string]: unknown;
}

export interface LovelaceSectionConfig {
  type: string;
  cards: LovelaceCardConfig[];
  [key: string]: unknown;
}

export interface LovelaceViewConfig {
  title: string;
  path?: string;
  icon?: string;
  type?: string;
  cards?: LovelaceCardConfig[];
  sections?: LovelaceSectionConfig[];
  strategy?: StrategyConfig;
  [key: string]: unknown;
}

export interface LovelaceDashboardConfig {
  title?: string;
  views: LovelaceViewConfig[];
}

export interface StrategyConfig {
  type: string;
  [key: string]: unknown;
}
