var F = Object.defineProperty;
var P = (t, i, e) => i in t ? F(t, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[i] = e;
var w = (t, i, e) => P(t, typeof i != "symbol" ? i + "" : i, e);
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
  const i = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : C
  };
}
function R(t) {
  const i = t.entity_filter ?? {
    hide_entity_categories: C
  }, e = new Set(
    t.devices.filter((n) => n.area_id === t.area.area_id).map((n) => n.id)
  );
  return B(t.entities, i).filter(
    (n) => n.area_id === t.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && e.has(n.device_id)
  ).map((n) => n.entity_id);
}
function B(t, i) {
  const e = new Set(i.hide_entity_categories);
  return t.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !e.has(n.entity_category));
}
function $(t, i) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    e[O(t, n)].push(n);
  return e;
}
function O(t, i) {
  var o;
  const e = i.split(".")[0] ?? "", n = (o = t.states[i]) == null ? void 0 : o.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) || ["temperature", "humidity"].includes(String(n)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function U(t, i) {
  const e = t.states[i], n = ["current_temperature", "temperature"];
  for (const o of n) {
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
function S(t, i) {
  var e;
  return ((e = t.states[i]) == null ? void 0 : e.attributes.friendly_name) ?? i;
}
function E(t) {
  return !["lights", "climate", "security"].includes(t);
}
function K(t, i, e, n, o, a, s) {
  const l = new Map(i.map((r) => [r.floor_id, r])), c = new Map(
    i.slice().sort(T).map((r, d) => [r.floor_id, d])
  );
  return t.map((r) => {
    const d = x(f(r.name || r.area_id), s), m = r.floor_id ? l.get(r.floor_id) : void 0;
    return {
      title: r.name,
      path: d,
      icon: r.icon ?? "mdi:floor-plan",
      stateEntityId: q(a, r, e, n, o),
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: r.floor_id ? c.get(r.floor_id) ?? i.length : i.length
    };
  });
}
function q(t, i, e, n, o) {
  return R({ area: i, devices: e, entities: n, entity_filter: o }).find((a) => {
    const s = t.states[a];
    return a.startsWith("sensor.") && (s == null ? void 0 : s.attributes.device_class) === "temperature" && Number.isFinite(U(t, a));
  });
}
function T(t, i) {
  return typeof t.level == "number" && typeof i.level == "number" && t.level !== i.level ? t.level - i.level : typeof t.level == "number" ? -1 : typeof i.level == "number" ? 1 : t.name.localeCompare(i.name);
}
function Y(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const n = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(n) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function D(t, i) {
  const e = t.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${e}/${n}`;
}
function z(t, i = []) {
  const e = new Set(i);
  return t.map((n) => {
    const o = f(n.path ?? n.title);
    return {
      ...n,
      path: x(o, e)
    };
  });
}
function x(t, i) {
  const e = i instanceof Set ? i : new Set(i.filter(Boolean)), n = f(t || "view") || "view";
  let o = n, a = 2;
  for (; e.has(o); )
    o = `${n}-${a}`, a += 1;
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
    var n;
    const e = ((n = this.config) == null ? void 0 : n.items) ?? [];
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
function X(t, i) {
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
      navigation_path: D(i, t.path)
    }
  };
  return t.stateEntityId && (e.entity = t.stateEntityId), e;
}
function J(t, i) {
  return {
    type: `custom:${y}-summary-buttons`,
    items: t.map((e) => ({
      title: e.title,
      icon: e.icon,
      path: e.path ? D(i, e.path) : void 0
    }))
  };
}
function H(t, i, e, n = !1) {
  return n && e ? Q(t, i, e) : V(t, i);
}
function Q(t, i, e) {
  const n = new Map(e.entities.map((s) => [s.entity_id, s])), o = new Map(e.devices.map((s) => [s.id, s])), a = /* @__PURE__ */ new Map();
  for (const s of i) {
    const l = n.get(s), c = (l == null ? void 0 : l.device_id) ?? s;
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
function v(t, i, e, n) {
  const o = e.get(t), a = i[0];
  return (o == null ? void 0 : o.name_by_user) ?? (o == null ? void 0 : o.name) ?? (a && n ? S(n, a) : "Weitere");
}
function V(t, i) {
  const e = t ? i.filter((r) => ie(t, r)) : [], n = new Set(e), o = [], a = [], s = [], l = [], c = [];
  for (const r of i)
    if (ee(r))
      a.push(r);
    else {
      if (n.has(r))
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
  const i = t.split(".")[0] ?? "";
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
  ].includes(i);
}
function ee(t) {
  return t.split(".")[0] === "camera";
}
function te(t) {
  return t.split(".")[0] === "media_player";
}
function ie(t, i) {
  var o;
  const e = i.split(".")[0] ?? "", n = String(((o = t.states[i]) == null ? void 0 : o.attributes.device_class) ?? "");
  return e === "sensor" && ["temperature", "humidity"].includes(n);
}
function k(t) {
  return t.replace(/[&<>"']/g, (i) => {
    switch (i) {
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
        return i;
    }
  });
}
function ne(t, i, e, n, o) {
  const a = t.config.location_name ?? "Home", s = oe(i, o), l = re(e, n);
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
function oe(t, i) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const o = n.floorName ?? "Weitere Räume";
    e.set(o, [...e.get(o) ?? [], n]);
  }
  return Array.from(e.entries()).sort(([, n], [, o]) => {
    const a = n[0], s = o[0];
    return ((a == null ? void 0 : a.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || ((a == null ? void 0 : a.floorName) ?? "").localeCompare((s == null ? void 0 : s.floorName) ?? "");
  }).flatMap(([n, o]) => {
    var a;
    return [
      {
        type: "heading",
        heading: n,
        heading_style: "title",
        icon: ((a = o[0]) == null ? void 0 : a.floorIcon) ?? "mdi:home-floor-0"
      },
      ...o.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => X(s, i))
    ];
  });
}
function re(t, i) {
  const e = t.map((n) => ({
    title: n.title,
    path: n.path ?? f(n.title),
    icon: n.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      path: i.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      path: i.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      path: i.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      path: i.media,
      icon: "mdi:music-box-outline"
    },
    ...e
  ];
}
function ae(t, i, e, n, o, a, s) {
  const l = ce(e, n, o, a), c = {};
  return { views: L.map((d) => {
    const m = x(d.path, s);
    return c[d.key] = m, {
      title: N(d.key),
      path: m,
      icon: d.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: i[d.key].length > 0 ? se(t, { ...d, title: N(d.key) }, i[d.key], l, {
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
function se(t, i, e, n, o) {
  const a = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of e) {
    const c = n.get(l) ?? {
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
      }), d.push(...H(t, h, o, E(i.key)));
    return [
      {
        type: "grid",
        cards: d
      }
    ];
  });
}
function ce(t, i, e, n) {
  const o = new Map(i.map((c) => [c.area_id, c])), a = new Map(e.map((c) => [c.id, c])), s = new Map(n.map((c) => [c.floor_id, c])), l = new Map(
    n.slice().sort(T).map((c, r) => [c.floor_id, r])
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
          sortIndex: h ? l.get(h) ?? n.length : n.length
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
  const i = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && i.push(de(t.shopping));
  for (const n of t.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || i.push({
      title: n.title,
      path: n.path ?? f(n.id),
      icon: n.icon ?? "mdi:shape-outline",
      type: "sections",
      max_columns: 2,
      sections: [
        {
          type: "grid",
          cards: n.cards
        }
      ]
    });
  return z(i, ["dashboard"]);
}
function de(t = {}) {
  const i = M(t, {
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
    panel: !0,
    cards: [
      {
        type: "grid",
        columns: 2,
        square: !1,
        cards: [i, e]
      }
    ]
  };
}
function M(t, i) {
  const e = {
    addon_slug: t.addon_slug ?? "ktor_app",
    ...i
  };
  return t.backend_url && (delete e.addon_slug, e.backend_url = t.backend_url), e;
}
function ue(t, i, e) {
  if (i.length === 0)
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
  const n = $(t, i), o = [];
  for (const a of A) {
    const s = n[a.key];
    s.length !== 0 && o.push(me(t, a, s, e, !E(a.key)));
  }
  return o;
}
function me(t, i, e, n, o = !0) {
  const a = o ? [
    {
      type: "heading",
      heading: i.title,
      heading_style: "subtitle",
      icon: i.icon
    }
  ] : [];
  return a.push(...H(t, e, n, E(i.key))), {
    type: "grid",
    cards: a
  };
}
class pe extends HTMLElement {
  static getCreateSuggestions(i) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(i, e) {
    const [n, o, a] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = W(i), c = n.filter((u) => u.area_id && u.name).sort((u, _) => u.name.localeCompare(_.name)), r = le(i), d = /* @__PURE__ */ new Set(["dashboard", ...r.map((u) => u.path).filter(Boolean)]), m = K(c, s, o, a, l, e, d), h = B(a, l).map((u) => u.entity_id).filter((u) => e.states[u]), p = $(e, h), g = ae(e, p, a, c, o, s, d), G = Y([
      "dashboard",
      ...r.map((u) => u.path).filter((u) => !!u),
      ...g.views.map((u) => u.path).filter((u) => !!u),
      ...m.map((u) => u.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        ne(e, m, r, g.pathByKey, G),
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
  static async generate(i, e) {
    const n = R(i).filter((o) => e.states[o]).sort((o, a) => S(e, o).localeCompare(S(e, a)));
    return {
      sections: ue(e, n, {
        devices: i.devices,
        entities: i.entities
      })
    };
  }
}
function ye() {
  console.info(`[HAStrategy] loaded ${I}`);
  const t = pe, i = he;
  customElements.get(`${y}-summary-buttons`) || customElements.define(`${y}-summary-buttons`, j), customElements.define(`ll-strategy-dashboard-${y}`, t), customElements.define(`ll-strategy-view-${y}`, i), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: y,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${I}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
ye();
//# sourceMappingURL=HAStrategy.js.map
