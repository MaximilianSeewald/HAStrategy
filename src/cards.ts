import type { DeviceRegistryEntry, EntityRegistryEntry, HomeAssistant, LovelaceCardConfig, LovelaceCardElement } from "./home-assistant";
import type { DashboardNavigationItem } from "./navigation";
import type { DashboardSummaryItem } from "./views";
import { STRATEGY_TYPE } from "./config";
import { friendlyName } from "./entities";
import { createNavigationPath } from "./navigation";

interface CompactSummaryButtonConfig {
  title: string;
  icon: string;
  path?: string;
}

interface CompactSummaryButtonsCardConfig extends LovelaceCardConfig {
  items: CompactSummaryButtonConfig[];
}

interface WideCardsCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[];
}

export interface EntityCardContext {
  devices: DeviceRegistryEntry[];
  entities: EntityRegistryEntry[];
}

export class CompactSummaryButtonsCard extends HTMLElement implements LovelaceCardElement {
  private config?: CompactSummaryButtonsCardConfig;
  private root = this.attachShadow({ mode: "open" });

  setConfig(config: CompactSummaryButtonsCardConfig): void {
    this.config = config;
    this.render();
  }

  getCardSize(): number {
    return 1;
  }

  private render(): void {
    const items = this.config?.items ?? [];

    this.root.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .buttons {
          display: grid;
          gap: 8px;
          grid-template-columns: 1fr;
        }

        button {
          align-items: center;
          background: var(--chip-background-color, rgba(var(--rgb-primary-text-color), 0.15));
          border: 0;
          border-radius: 999px;
          color: var(--primary-text-color);
          cursor: pointer;
          display: grid;
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          gap: 8px;
          grid-template-columns: 20px 1fr;
          height: 34px;
          justify-self: stretch;
          line-height: 20px;
          padding: 0 14px;
          text-align: left;
          width: 100%;
        }

        button:hover {
          background: var(--secondary-background-color);
        }

        button:focus-visible {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }

        button[disabled] {
          cursor: default;
          opacity: 0.6;
        }

        ha-icon {
          color: var(--secondary-text-color);
          height: 18px;
          width: 18px;
        }

        .label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>
      <div class="buttons">
        ${items
          .map(
            (item, index) => `
              <button data-index="${index}" ${item.path ? "" : "disabled"}>
                <ha-icon icon="${escapeHtml(item.icon)}"></ha-icon>
                <span class="label">${escapeHtml(item.title)}</span>
              </button>
            `,
          )
          .join("")}
      </div>
    `;

    this.root.querySelectorAll<HTMLButtonElement>("button[data-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const path = items[index]?.path;

        if (!path) {
          return;
        }

        window.history.pushState(null, "", path);
        window.dispatchEvent(new Event("location-changed"));
      });
    });
  }
}

export class WideCardsCard extends HTMLElement implements LovelaceCardElement {
  private config?: WideCardsCardConfig;
  private currentHass?: HomeAssistant;
  private root = this.attachShadow({ mode: "open" });

  setConfig(config: WideCardsCardConfig): void {
    this.config = config;
    this.render();
  }

  set hass(hass: HomeAssistant) {
    this.currentHass = hass;
    this.propagateHass();
  }

  getCardSize(): number {
    return 8;
  }

  private render(): void {
    const cards = this.config?.cards ?? [];

    this.root.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .layout {
          box-sizing: border-box;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 520px), 1fr));
          margin: 0 auto;
          padding: 24px;
          width: 100%;
        }

        .layout > * {
          min-width: 0;
          width: 100%;
        }

        @media (max-width: 720px) {
          .layout {
            gap: 16px;
            grid-template-columns: 1fr;
            padding: 12px;
          }
        }
      </style>
      <div class="layout"></div>
    `;

    const layout = this.root.querySelector<HTMLDivElement>(".layout");

    for (const cardConfig of cards) {
      const elementName = cardConfig.type.replace(/^custom:/, "");
      const element = document.createElement(elementName) as LovelaceCardElement & { hass?: HomeAssistant };

      layout?.appendChild(element);

      if (typeof element.setConfig === "function") {
        element.setConfig(cardConfig);
      } else {
        customElements.whenDefined(elementName).then(() => {
          element.setConfig(cardConfig);

          if (this.currentHass) {
            element.hass = this.currentHass;
          }
        });
      }

      if (this.currentHass) {
        element.hass = this.currentHass;
      }
    }
  }

  private propagateHass(): void {
    this.root
      .querySelectorAll<LovelaceCardElement & { hass?: HomeAssistant }>(".layout > *")
      .forEach((element) => {
        element.hass = this.currentHass;
      });
  }
}

export function createRoomNavigationCard(area: DashboardNavigationItem, dashboardRootPath: string): LovelaceCardConfig {
  const card: LovelaceCardConfig = {
    type: "button",
    name: area.title,
    icon: area.icon,
    icon_height: "22px",
    show_icon: true,
    show_name: true,
    show_state: Boolean(area.stateEntityId),
    grid_options: {
      columns: 4,
      rows: 2,
    },
    tap_action: {
      action: "navigate",
      navigation_path: createNavigationPath(dashboardRootPath, area.path),
    },
  };

  if (area.stateEntityId) {
    card.entity = area.stateEntityId;
  }

  return card;
}

export function createSummaryButtonCard(items: DashboardSummaryItem[], dashboardRootPath: string): LovelaceCardConfig {
  return {
    type: `custom:${STRATEGY_TYPE}-summary-buttons`,
    items: items.map((item) => ({
      title: item.title,
      icon: item.icon,
      path: item.path ? createNavigationPath(dashboardRootPath, item.path) : undefined,
    })),
  };
}

export function createEntityCards(
  hass: HomeAssistant | undefined,
  entityIds: string[],
  cardContext?: EntityCardContext,
  groupByDevice = false,
): LovelaceCardConfig[] {
  if (groupByDevice && cardContext) {
    return createDeviceGroupedEntityCards(hass, entityIds, cardContext);
  }

  return createUngroupedEntityCards(hass, entityIds);
}

function createDeviceGroupedEntityCards(
  hass: HomeAssistant | undefined,
  entityIds: string[],
  cardContext: EntityCardContext,
): LovelaceCardConfig[] {
  const entityById = new Map(cardContext.entities.map((entity) => [entity.entity_id, entity]));
  const deviceById = new Map(cardContext.devices.map((device) => [device.id, device]));
  const groupedByDevice = new Map<string, string[]>();

  for (const entityId of entityIds) {
    const registryEntry = entityById.get(entityId);
    const key = registryEntry?.device_id ?? entityId;

    groupedByDevice.set(key, [...(groupedByDevice.get(key) ?? []), entityId]);
  }

  return Array.from(groupedByDevice.entries())
    .sort(([leftKey, leftEntities], [rightKey, rightEntities]) => {
      const leftName = getDeviceGroupTitle(leftKey, leftEntities, deviceById, hass);
      const rightName = getDeviceGroupTitle(rightKey, rightEntities, deviceById, hass);

      return leftName.localeCompare(rightName);
    })
    .flatMap(([deviceKey, deviceEntityIds]) => [
      {
        type: "heading",
        heading: getDeviceGroupTitle(deviceKey, deviceEntityIds, deviceById, hass),
        heading_style: "subtitle",
        icon: "mdi:devices",
      },
      ...createUngroupedEntityCards(hass, deviceEntityIds),
    ]);
}

function getDeviceGroupTitle(
  deviceKey: string,
  entityIds: string[],
  deviceById: Map<string, DeviceRegistryEntry>,
  hass: HomeAssistant | undefined,
): string {
  const device = deviceById.get(deviceKey);
  const entityId = entityIds[0];

  return device?.name_by_user ?? device?.name ?? (entityId && hass ? friendlyName(hass, entityId) : "Weitere");
}

function createUngroupedEntityCards(hass: HomeAssistant | undefined, entityIds: string[]): LovelaceCardConfig[] {
  const historyEntities = hass ? entityIds.filter((entityId) => shouldRenderAsHistoryGraph(hass, entityId)) : [];
  const historyEntityIds = new Set(historyEntities);
  const cards: LovelaceCardConfig[] = [];
  const cameraEntities: string[] = [];
  const mediaPlayerEntities: string[] = [];
  const tileEntities: string[] = [];
  const rowEntities: string[] = [];

  for (const entityId of entityIds) {
    if (isCameraEntity(entityId)) {
      cameraEntities.push(entityId);
    } else if (historyEntityIds.has(entityId)) {
      continue;
    } else if (isMediaPlayerEntity(entityId)) {
      mediaPlayerEntities.push(entityId);
    } else if (shouldRenderAsTile(entityId)) {
      tileEntities.push(entityId);
    } else {
      rowEntities.push(entityId);
    }
  }

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

  for (const entityId of mediaPlayerEntities) {
    cards.push({
      type: "media-control",
      entity: entityId,
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

function isMediaPlayerEntity(entityId: string): boolean {
  return entityId.split(".")[0] === "media_player";
}

function shouldRenderAsHistoryGraph(hass: HomeAssistant, entityId: string): boolean {
  const domain = entityId.split(".")[0] ?? "";
  const deviceClass = String(hass.states[entityId]?.attributes.device_class ?? "");

  return domain === "sensor" && ["temperature", "humidity"].includes(deviceClass);
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
