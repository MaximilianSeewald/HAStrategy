var F = Object.defineProperty;
var P = (t, n, e) => n in t ? F(t, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[n] = e;
var w = (t, n, e) => P(t, typeof n != "symbol" ? n + "" : n, e);
const y = "max-home-dashboard", I = "0.2.2", A = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], L = A.filter((t) => t.path), C = ["config", "diagnostic"];
function W(t) {
  var e;
  const n = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(n) ? n : C
  };
}
function R(t) {
  const n = t.entity_filter ?? {
    hide_entity_categories: C
  }, e = new Set(
    t.devices.filter((i) => i.area_id === t.area.area_id).map((i) => i.id)
  );
  return B(t.entities, n).filter(
    (i) => i.area_id === t.area.area_id || !i.area_id && i.device_id !== null && i.device_id !== void 0 && e.has(i.device_id)
  ).map((i) => i.entity_id);
}
function B(t, n) {
  const e = new Set(n.hide_entity_categories);
  return t.filter((i) => !i.hidden_by && !i.disabled_by).filter((i) => !i.entity_category || !e.has(i.entity_category));
}
function $(t, n) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const i of n)
    e[O(t, i)].push(i);
  return e;
}
function O(t, n) {
  var o;
  const e = n.split(".")[0] ?? "", i = (o = t.states[n]) == null ? void 0 : o.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) || ["temperature", "humidity"].includes(String(i)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(i)) ? "sensors" : "other";
}
function U(t, n) {
  const e = t.states[n], i = ["current_temperature", "temperature"];
  for (const o of i) {
    const a = e == null ? void 0 : e.attributes[o];
    if (typeof a == "number")
      return a;
  }
  if ((e == null ? void 0 : e.attributes.device_class) === "temperature") {
    const o = Number.parseFloat(e.state);
    if (Number.isFinite(o))
      return o;
  }
}
function S(t, n) {
  var e;
  return ((e = t.states[n]) == null ? void 0 : e.attributes.friendly_name) ?? n;
}
function E(t) {
  return !["lights", "climate", "security"].includes(t);
}
function K(t, n, e, i, o, a, s) {
  const l = new Map(n.map((r) => [r.floor_id, r])), c = new Map(
    n.slice().sort(T).map((r, d) => [r.floor_id, d])
  );
  return t.map((r) => {
    const d = x(f(r.name || r.area_id), s), m = r.floor_id ? l.get(r.floor_id) : void 0;
    return {
      title: r.name,
      path: d,
      icon: r.icon ?? "mdi:floor-plan",
      stateEntityId: Y(a, r, e, i, o),
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: r.floor_id ? c.get(r.floor_id) ?? n.length : n.length
    };
  });
}
function Y(t, n, e, i, o) {
  return R({ area: n, devices: e, entities: i, entity_filter: o }).find((a) => {
    const s = t.states[a];
    return a.startsWith("sensor.") && (s == null ? void 0 : s.attributes.device_class) === "temperature" && Number.isFinite(U(t, a));
  });
}
function T(t, n) {
  return typeof t.level == "number" && typeof n.level == "number" && t.level !== n.level ? t.level - n.level : typeof t.level == "number" ? -1 : typeof n.level == "number" ? 1 : t.name.localeCompare(n.name);
}
function q(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const i = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(i) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function D(t, n) {
  const e = t.replace(/\/+$/g, ""), i = n.replace(/^\/+/g, "");
  return `${e}/${i}`;
}
function z(t, n = []) {
  const e = new Set(n);
  return t.map((i) => {
    const o = f(i.path ?? i.title);
    return {
      ...i,
      path: x(o, e)
    };
  });
}
function x(t, n) {
  const e = n instanceof Set ? n : new Set(n.filter(Boolean)), i = f(t || "view") || "view";
  let o = i, a = 2;
  for (; e.has(o); )
    o = `${i}-${a}`, a += 1;
  return e.add(o), o;
}
function f(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
class j extends HTMLElement {
  constructor() {
    super(...arguments);
    w(this, "config");
    w(this, "root", this.attachShadow({ mode: "open" }));
  }
  setConfig(e) {
    this.config = e, this.render();
  }
  getCardSize() {
    return 1;
  }
  render() {
    var i;
    const e = ((i = this.config) == null ? void 0 : i.items) ?? [];
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
        ${e.map(
      (o, a) => `
              <button data-index="${a}" ${o.path ? "" : "disabled"}>
                <ha-icon icon="${k(o.icon)}"></ha-icon>
                <span class="label">${k(o.title)}</span>
              </button>
            `
    ).join("")}
      </div>
    `, this.root.querySelectorAll("button[data-index]").forEach((o) => {
      o.addEventListener("click", () => {
        var l;
        const a = Number(o.dataset.index), s = (l = e[a]) == null ? void 0 : l.path;
        s && (window.history.pushState(null, "", s), window.dispatchEvent(new Event("location-changed")));
      });
    });
  }
}
function X(t, n) {
  const e = {
    type: "button",
    name: t.title,
    icon: t.icon,
    icon_height: "22px",
    show_icon: !0,
    show_name: !0,
    show_state: !!t.stateEntityId,
    grid_options: {
      columns: 4,
      rows: 2
    },
    tap_action: {
      action: "navigate",
      navigation_path: D(n, t.path)
    }
  };
  return t.stateEntityId && (e.entity = t.stateEntityId), e;
}
function J(t, n) {
  return {
    type: `custom:${y}-summary-buttons`,
    items: t.map((e) => ({
      title: e.title,
      icon: e.icon,
      path: e.path ? D(n, e.path) : void 0
    }))
  };
}
function H(t, n, e, i = !1) {
  return i && e ? Q(t, n, e) : V(t, n);
}
function Q(t, n, e) {
  const i = new Map(e.entities.map((s) => [s.entity_id, s])), o = new Map(e.devices.map((s) => [s.id, s])), a = /* @__PURE__ */ new Map();
  for (const s of n) {
    const l = i.get(s), c = (l == null ? void 0 : l.device_id) ?? s;
    a.set(c, [...a.get(c) ?? [], s]);
  }
  return Array.from(a.entries()).sort(([s, l], [c, r]) => {
    const d = v(s, l, o, t), m = v(c, r, o, t);
    return d.localeCompare(m);
  }).flatMap(([s, l]) => [
    {
      type: "heading",
      heading: v(s, l, o, t),
      heading_style: "subtitle",
      icon: "mdi:devices"
    },
    ...V(t, l)
  ]);
}
function v(t, n, e, i) {
  const o = e.get(t), a = n[0];
  return (o == null ? void 0 : o.name_by_user) ?? (o == null ? void 0 : o.name) ?? (a && i ? S(i, a) : "Weitere");
}
function V(t, n) {
  const e = t ? n.filter((r) => ne(t, r)) : [], i = new Set(e), o = [], a = [], s = [], l = [], c = [];
  for (const r of n)
    if (ee(r))
      a.push(r);
    else {
      if (i.has(r))
        continue;
      te(r) ? s.push(r) : Z(r) ? l.push(r) : c.push(r);
    }
  for (const r of a)
    o.push({
      type: "picture-entity",
      entity: r,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  e.length > 0 && o.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: e
  });
  for (const r of s)
    o.push({
      type: "media-control",
      entity: r
    });
  return l.length > 0 && o.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: l.map((r) => ({
      type: "tile",
      entity: r
    }))
  }), c.length > 0 && o.push({
    type: "entities",
    show_header_toggle: !1,
    entities: c
  }), o;
}
function Z(t) {
  const n = t.split(".")[0] ?? "";
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
    "water_heater"
  ].includes(n);
}
function ee(t) {
  return t.split(".")[0] === "camera";
}
function te(t) {
  return t.split(".")[0] === "media_player";
}
function ne(t, n) {
  var o;
  const e = n.split(".")[0] ?? "", i = String(((o = t.states[n]) == null ? void 0 : o.attributes.device_class) ?? "");
  return e === "sensor" && ["temperature", "humidity"].includes(i);
}
function k(t) {
  return t.replace(/[&<>"']/g, (n) => {
    switch (n) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return n;
    }
  });
}
function ie(t, n, e, i, o) {
  const a = t.config.location_name ?? "Home", s = oe(n, o), l = re(e, i);
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
            heading: `Willkommen ${a}`,
            heading_style: "title",
            icon: "mdi:home-heart"
          },
          {
            type: "heading",
            heading: " ",
            heading_style: "subtitle"
          },
          ...s
        ]
      },
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: "Kategorien",
            heading_style: "subtitle",
            icon: "mdi:view-dashboard-outline"
          },
          J(l, o)
        ]
      }
    ].filter((c) => c.cards.length > 0)
  };
}
function oe(t, n) {
  const e = /* @__PURE__ */ new Map();
  for (const i of t) {
    const o = i.floorName ?? "Weitere Räume";
    e.set(o, [...e.get(o) ?? [], i]);
  }
  return Array.from(e.entries()).sort(([, i], [, o]) => {
    const a = i[0], s = o[0];
    return ((a == null ? void 0 : a.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || ((a == null ? void 0 : a.floorName) ?? "").localeCompare((s == null ? void 0 : s.floorName) ?? "");
  }).flatMap(([i, o]) => {
    var a;
    return [
      {
        type: "heading",
        heading: i,
        heading_style: "title",
        icon: ((a = o[0]) == null ? void 0 : a.floorIcon) ?? "mdi:home-floor-0"
      },
      ...o.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => X(s, n))
    ];
  });
}
function re(t, n) {
  const e = t.map((i) => ({
    title: i.title,
    path: i.path ?? f(i.title),
    icon: i.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      path: n.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      path: n.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      path: n.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      path: n.media,
      icon: "mdi:music-box-outline"
    },
    ...e
  ];
}
function ae(t, n, e, i, o, a, s) {
  const l = ce(e, i, o, a), c = {};
  return { views: L.map((d) => {
    const m = x(d.path, s);
    return c[d.key] = m, {
      title: N(d.key),
      path: m,
      icon: d.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: n[d.key].length > 0 ? se(t, { ...d, title: N(d.key) }, n[d.key], l, {
        devices: o,
        entities: e
      }) : [
        {
          type: "grid",
          cards: [
            {
              type: "markdown",
              content: "Keine sichtbaren Entitäten in dieser Kategorie."
            }
          ]
        }
      ]
    };
  }), pathByKey: c };
}
function se(t, n, e, i, o) {
  const a = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of e) {
    const c = i.get(l) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, r = a.get(c.floorName) ?? /* @__PURE__ */ new Map();
    r.set(c.areaName, [...r.get(c.areaName) ?? [], l]), a.set(c.floorName, r), s.set(c.floorName, c);
  }
  return Array.from(a.entries()).sort(([l], [c]) => {
    const r = s.get(l), d = s.get(c);
    return ((r == null ? void 0 : r.sortIndex) ?? 0) - ((d == null ? void 0 : d.sortIndex) ?? 0) || l.localeCompare(c);
  }).flatMap(([l, c]) => {
    const r = s.get(l), d = [
      {
        type: "heading",
        heading: l,
        heading_style: "title",
        icon: (r == null ? void 0 : r.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, h] of Array.from(c.entries()).sort(([p], [g]) => p.localeCompare(g)))
      d.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), d.push(...H(t, h, o, E(n.key)));
    return [
      {
        type: "grid",
        cards: d
      }
    ];
  });
}
function ce(t, n, e, i) {
  const o = new Map(n.map((c) => [c.area_id, c])), a = new Map(e.map((c) => [c.id, c])), s = new Map(i.map((c) => [c.floor_id, c])), l = new Map(
    i.slice().sort(T).map((c, r) => [c.floor_id, r])
  );
  return new Map(
    t.map((c) => {
      const r = c.device_id ? a.get(c.device_id) : void 0, d = c.area_id ?? (r == null ? void 0 : r.area_id) ?? void 0, m = d ? o.get(d) : void 0, h = (m == null ? void 0 : m.floor_id) ?? (r == null ? void 0 : r.floor_id) ?? void 0, p = h ? s.get(h) : void 0;
      return [
        c.entity_id,
        {
          areaName: (m == null ? void 0 : m.name) ?? "Ohne Raum",
          floorName: (p == null ? void 0 : p.name) ?? "Weitere Räume",
          floorIcon: (p == null ? void 0 : p.icon) ?? "mdi:home-floor-0",
          sortIndex: h ? l.get(h) ?? i.length : i.length
        }
      ];
    })
  );
}
function N(t) {
  switch (t) {
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
function le(t) {
  var e;
  const n = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && n.push(de(t.shopping));
  for (const i of t.categories ?? [])
    !i.id || !i.title || !Array.isArray(i.cards) || n.push({
      title: i.title,
      path: i.path ?? f(i.id),
      icon: i.icon ?? "mdi:shape-outline",
      type: "sections",
      max_columns: 2,
      sections: [
        {
          type: "grid",
          cards: i.cards
        }
      ]
    });
  return z(n, ["dashboard"]);
}
function de(t = {}) {
  const n = M(t, {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    show_completed: t.show_completed ?? !0
  }), e = M(t, {
    type: "custom:ktor-recipe-list-card",
    title: "Recipes"
  });
  return {
    title: t.title ?? "Shopping",
    path: t.path ?? "shopping",
    icon: t.icon ?? "mdi:cart-outline",
    type: "sections",
    max_columns: 4,
    sections: [
      {
        type: "grid",
        column_span: 2,
        cards: [n]
      },
      {
        type: "grid",
        column_span: 2,
        cards: [e]
      }
    ]
  };
}
function M(t, n) {
  const e = {
    addon_slug: t.addon_slug ?? "ktor_app",
    ...n
  };
  return t.backend_url && (delete e.addon_slug, e.backend_url = t.backend_url), e;
}
function ue(t, n, e) {
  if (n.length === 0)
    return [
      {
        type: "grid",
        cards: [
          {
            type: "markdown",
            content: "No visible entities are assigned to this room yet."
          }
        ]
      }
    ];
  const i = $(t, n), o = [];
  for (const a of A) {
    const s = i[a.key];
    s.length !== 0 && o.push(me(t, a, s, e, !E(a.key)));
  }
  return o;
}
function me(t, n, e, i, o = !0) {
  const a = o ? [
    {
      type: "heading",
      heading: n.title,
      heading_style: "subtitle",
      icon: n.icon
    }
  ] : [];
  return a.push(...H(t, e, i, E(n.key))), {
    type: "grid",
    cards: a
  };
}
class pe extends HTMLElement {
  static getCreateSuggestions(n) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(n, e) {
    const [i, o, a] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = W(n), c = i.filter((u) => u.area_id && u.name).sort((u, _) => u.name.localeCompare(_.name)), r = le(n), d = /* @__PURE__ */ new Set(["dashboard", ...r.map((u) => u.path).filter(Boolean)]), m = K(c, s, o, a, l, e, d), h = B(a, l).map((u) => u.entity_id).filter((u) => e.states[u]), p = $(e, h), g = ae(e, p, a, c, o, s, d), G = q([
      "dashboard",
      ...r.map((u) => u.path).filter((u) => !!u),
      ...g.views.map((u) => u.path).filter((u) => !!u),
      ...m.map((u) => u.path)
    ]);
    return {
      title: n.title ?? "Max Home",
      views: [
        ie(e, m, r, g.pathByKey, G),
        ...r,
        ...g.views,
        ...c.map((u, _) => {
          const b = m[_];
          return {
            title: u.name,
            path: (b == null ? void 0 : b.path) ?? f(u.name || u.area_id),
            icon: u.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${y}`,
              area: u,
              devices: o,
              entities: a,
              entity_filter: l
            }
          };
        })
      ]
    };
  }
}
class he extends HTMLElement {
  static async generate(n, e) {
    const i = R(n).filter((o) => e.states[o]).sort((o, a) => S(e, o).localeCompare(S(e, a)));
    return {
      sections: ue(e, i, {
        devices: n.devices,
        entities: n.entities
      })
    };
  }
}
function ye() {
  console.info(`[HAStrategy] loaded ${I}`);
  const t = pe, n = he;
  customElements.get(`${y}-summary-buttons`) || customElements.define(`${y}-summary-buttons`, j), customElements.define(`ll-strategy-dashboard-${y}`, t), customElements.define(`ll-strategy-view-${y}`, n), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: y,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${I}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
ye();
//# sourceMappingURL=HAStrategy.js.map
