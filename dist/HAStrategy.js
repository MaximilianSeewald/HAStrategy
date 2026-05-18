var L = Object.defineProperty;
var F = (t, i, e) => i in t ? L(t, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[i] = e;
var f = (t, i, e) => F(t, typeof i != "symbol" ? i + "" : i, e);
const h = "max-home-dashboard", I = "0.2.2", N = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], P = N.filter((t) => t.path), A = ["config", "diagnostic"];
function W(t) {
  var e;
  const i = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : A
  };
}
function H(t) {
  const i = t.entity_filter ?? {
    hide_entity_categories: A
  }, e = new Set(
    t.devices.filter((n) => n.area_id === t.area.area_id).map((n) => n.id)
  );
  return R(t.entities, i).filter(
    (n) => n.area_id === t.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && e.has(n.device_id)
  ).map((n) => n.entity_id);
}
function R(t, i) {
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
    const r = e == null ? void 0 : e.attributes[o];
    if (typeof r == "number")
      return r;
  }
  if ((e == null ? void 0 : e.attributes.device_class) === "temperature") {
    const o = Number.parseFloat(e.state);
    if (Number.isFinite(o))
      return o;
  }
}
function E(t, i) {
  var e;
  return ((e = t.states[i]) == null ? void 0 : e.attributes.friendly_name) ?? i;
}
function S(t) {
  return !["lights", "climate", "security"].includes(t);
}
function q(t, i, e, n, o, r, a) {
  const l = new Map(i.map((s) => [s.floor_id, s])), c = new Map(
    i.slice().sort(T).map((s, d) => [s.floor_id, d])
  );
  return t.map((s) => {
    const d = x(g(s.name || s.area_id), a), m = s.floor_id ? l.get(s.floor_id) : void 0;
    return {
      title: s.name,
      path: d,
      icon: s.icon ?? "mdi:floor-plan",
      stateEntityId: z(r, s, e, n, o),
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: s.floor_id ? c.get(s.floor_id) ?? i.length : i.length
    };
  });
}
function z(t, i, e, n, o) {
  return H({ area: i, devices: e, entities: n, entity_filter: o }).find((r) => {
    const a = t.states[r];
    return r.startsWith("sensor.") && (a == null ? void 0 : a.attributes.device_class) === "temperature" && Number.isFinite(U(t, r));
  });
}
function T(t, i) {
  return typeof t.level == "number" && typeof i.level == "number" && t.level !== i.level ? t.level - i.level : typeof t.level == "number" ? -1 : typeof i.level == "number" ? 1 : t.name.localeCompare(i.name);
}
function K(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const n = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(n) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function B(t, i) {
  const e = t.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${e}/${n}`;
}
function Y(t, i = []) {
  const e = new Set(i);
  return t.map((n) => {
    const o = g(n.path ?? n.title);
    return {
      ...n,
      path: x(o, e)
    };
  });
}
function x(t, i) {
  const e = i instanceof Set ? i : new Set(i.filter(Boolean)), n = g(t || "view") || "view";
  let o = n, r = 2;
  for (; e.has(o); )
    o = `${n}-${r}`, r += 1;
  return e.add(o), o;
}
function g(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
class j extends HTMLElement {
  constructor() {
    super(...arguments);
    f(this, "config");
    f(this, "root", this.attachShadow({ mode: "open" }));
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
      (o, r) => `
              <button data-index="${r}" ${o.path ? "" : "disabled"}>
                <ha-icon icon="${k(o.icon)}"></ha-icon>
                <span class="label">${k(o.title)}</span>
              </button>
            `
    ).join("")}
      </div>
    `, this.root.querySelectorAll("button[data-index]").forEach((o) => {
      o.addEventListener("click", () => {
        var l;
        const r = Number(o.dataset.index), a = (l = e[r]) == null ? void 0 : l.path;
        a && (window.history.pushState(null, "", a), window.dispatchEvent(new Event("location-changed")));
      });
    });
  }
}
class X extends HTMLElement {
  constructor() {
    super(...arguments);
    f(this, "config");
    f(this, "currentHass");
    f(this, "root", this.attachShadow({ mode: "open" }));
  }
  setConfig(e) {
    this.config = e, this.render();
  }
  set hass(e) {
    this.currentHass = e, this.propagateHass();
  }
  getCardSize() {
    return 8;
  }
  render() {
    var o;
    const e = ((o = this.config) == null ? void 0 : o.cards) ?? [];
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
    const n = this.root.querySelector(".layout");
    for (const r of e) {
      const a = r.type.replace(/^custom:/, ""), l = document.createElement(a);
      n == null || n.appendChild(l), typeof l.setConfig == "function" ? l.setConfig(r) : customElements.whenDefined(a).then(() => {
        l.setConfig(r), this.currentHass && (l.hass = this.currentHass);
      }), this.currentHass && (l.hass = this.currentHass);
    }
  }
  propagateHass() {
    this.root.querySelectorAll(".layout > *").forEach((e) => {
      e.hass = this.currentHass;
    });
  }
}
function J(t, i) {
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
      navigation_path: B(i, t.path)
    }
  };
  return t.stateEntityId && (e.entity = t.stateEntityId), e;
}
function Q(t, i) {
  return {
    type: `custom:${h}-summary-buttons`,
    items: t.map((e) => ({
      title: e.title,
      icon: e.icon,
      path: e.path ? B(i, e.path) : void 0
    }))
  };
}
function D(t, i, e, n = !1) {
  return n && e ? Z(t, i, e) : V(t, i);
}
function Z(t, i, e) {
  const n = new Map(e.entities.map((a) => [a.entity_id, a])), o = new Map(e.devices.map((a) => [a.id, a])), r = /* @__PURE__ */ new Map();
  for (const a of i) {
    const l = n.get(a), c = (l == null ? void 0 : l.device_id) ?? a;
    r.set(c, [...r.get(c) ?? [], a]);
  }
  return Array.from(r.entries()).sort(([a, l], [c, s]) => {
    const d = v(a, l, o, t), m = v(c, s, o, t);
    return d.localeCompare(m);
  }).flatMap(([a, l]) => [
    {
      type: "heading",
      heading: v(a, l, o, t),
      heading_style: "subtitle",
      icon: "mdi:devices"
    },
    ...V(t, l)
  ]);
}
function v(t, i, e, n) {
  const o = e.get(t), r = i[0];
  return (o == null ? void 0 : o.name_by_user) ?? (o == null ? void 0 : o.name) ?? (r && n ? E(n, r) : "Weitere");
}
function V(t, i) {
  const e = t ? i.filter((s) => ne(t, s)) : [], n = new Set(e), o = [], r = [], a = [], l = [], c = [];
  for (const s of i)
    if (te(s))
      r.push(s);
    else {
      if (n.has(s))
        continue;
      ie(s) ? a.push(s) : ee(s) ? l.push(s) : c.push(s);
    }
  for (const s of r)
    o.push({
      type: "picture-entity",
      entity: s,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  e.length > 0 && o.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: e
  });
  for (const s of a)
    o.push({
      type: "media-control",
      entity: s
    });
  return l.length > 0 && o.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: l.map((s) => ({
      type: "tile",
      entity: s
    }))
  }), c.length > 0 && o.push({
    type: "entities",
    show_header_toggle: !1,
    entities: c
  }), o;
}
function ee(t) {
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
function te(t) {
  return t.split(".")[0] === "camera";
}
function ie(t) {
  return t.split(".")[0] === "media_player";
}
function ne(t, i) {
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
function oe(t, i, e, n, o) {
  const r = t.config.location_name ?? "Home", a = re(i, o), l = se(e, n);
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
            heading: `Willkommen ${r}`,
            heading_style: "title",
            icon: "mdi:home-heart"
          },
          {
            type: "heading",
            heading: " ",
            heading_style: "subtitle"
          },
          ...a
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
          Q(l, o)
        ]
      }
    ].filter((c) => c.cards.length > 0)
  };
}
function re(t, i) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const o = n.floorName ?? "Weitere Räume";
    e.set(o, [...e.get(o) ?? [], n]);
  }
  return Array.from(e.entries()).sort(([, n], [, o]) => {
    const r = n[0], a = o[0];
    return ((r == null ? void 0 : r.sortIndex) ?? 0) - ((a == null ? void 0 : a.sortIndex) ?? 0) || ((r == null ? void 0 : r.floorName) ?? "").localeCompare((a == null ? void 0 : a.floorName) ?? "");
  }).flatMap(([n, o]) => {
    var r;
    return [
      {
        type: "heading",
        heading: n,
        heading_style: "title",
        icon: ((r = o[0]) == null ? void 0 : r.floorIcon) ?? "mdi:home-floor-0"
      },
      ...o.slice().sort((a, l) => a.title.localeCompare(l.title)).map((a) => J(a, i))
    ];
  });
}
function se(t, i) {
  const e = t.map((n) => ({
    title: n.title,
    path: n.path ?? g(n.title),
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
function ae(t, i, e, n, o, r, a) {
  const l = le(e, n, o, r), c = {};
  return { views: P.map((d) => {
    const m = x(d.path, a);
    return c[d.key] = m, {
      title: C(d.key),
      path: m,
      icon: d.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: i[d.key].length > 0 ? ce(t, { ...d, title: C(d.key) }, i[d.key], l, {
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
function ce(t, i, e, n, o) {
  const r = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
  for (const l of e) {
    const c = n.get(l) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, s = r.get(c.floorName) ?? /* @__PURE__ */ new Map();
    s.set(c.areaName, [...s.get(c.areaName) ?? [], l]), r.set(c.floorName, s), a.set(c.floorName, c);
  }
  return Array.from(r.entries()).sort(([l], [c]) => {
    const s = a.get(l), d = a.get(c);
    return ((s == null ? void 0 : s.sortIndex) ?? 0) - ((d == null ? void 0 : d.sortIndex) ?? 0) || l.localeCompare(c);
  }).flatMap(([l, c]) => {
    const s = a.get(l), d = [
      {
        type: "heading",
        heading: l,
        heading_style: "title",
        icon: (s == null ? void 0 : s.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, y] of Array.from(c.entries()).sort(([p], [_]) => p.localeCompare(_)))
      d.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), d.push(...D(t, y, o, S(i.key)));
    return [
      {
        type: "grid",
        cards: d
      }
    ];
  });
}
function le(t, i, e, n) {
  const o = new Map(i.map((c) => [c.area_id, c])), r = new Map(e.map((c) => [c.id, c])), a = new Map(n.map((c) => [c.floor_id, c])), l = new Map(
    n.slice().sort(T).map((c, s) => [c.floor_id, s])
  );
  return new Map(
    t.map((c) => {
      const s = c.device_id ? r.get(c.device_id) : void 0, d = c.area_id ?? (s == null ? void 0 : s.area_id) ?? void 0, m = d ? o.get(d) : void 0, y = (m == null ? void 0 : m.floor_id) ?? (s == null ? void 0 : s.floor_id) ?? void 0, p = y ? a.get(y) : void 0;
      return [
        c.entity_id,
        {
          areaName: (m == null ? void 0 : m.name) ?? "Ohne Raum",
          floorName: (p == null ? void 0 : p.name) ?? "Weitere Räume",
          floorIcon: (p == null ? void 0 : p.icon) ?? "mdi:home-floor-0",
          sortIndex: y ? l.get(y) ?? n.length : n.length
        }
      ];
    })
  );
}
function C(t) {
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
function de(t) {
  var e;
  const i = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && i.push(ue(t.shopping));
  for (const n of t.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || i.push({
      title: n.title,
      path: n.path ?? g(n.id),
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
  return Y(i, ["dashboard"]);
}
function ue(t = {}) {
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
        type: `custom:${h}-wide-cards`,
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
function me(t, i, e) {
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
  for (const r of N) {
    const a = n[r.key];
    a.length !== 0 && o.push(pe(t, r, a, e, !S(r.key)));
  }
  return o;
}
function pe(t, i, e, n, o = !0) {
  const r = o ? [
    {
      type: "heading",
      heading: i.title,
      heading_style: "subtitle",
      icon: i.icon
    }
  ] : [];
  return r.push(...D(t, e, n, S(i.key))), {
    type: "grid",
    cards: r
  };
}
class he extends HTMLElement {
  static getCreateSuggestions(i) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(i, e) {
    const [n, o, r] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), a = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = W(i), c = n.filter((u) => u.area_id && u.name).sort((u, b) => u.name.localeCompare(b.name)), s = de(i), d = /* @__PURE__ */ new Set(["dashboard", ...s.map((u) => u.path).filter(Boolean)]), m = q(c, a, o, r, l, e, d), y = R(r, l).map((u) => u.entity_id).filter((u) => e.states[u]), p = $(e, y), _ = ae(e, p, r, c, o, a, d), G = K([
      "dashboard",
      ...s.map((u) => u.path).filter((u) => !!u),
      ..._.views.map((u) => u.path).filter((u) => !!u),
      ...m.map((u) => u.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        oe(e, m, s, _.pathByKey, G),
        ...s,
        ..._.views,
        ...c.map((u, b) => {
          const w = m[b];
          return {
            title: u.name,
            path: (w == null ? void 0 : w.path) ?? g(u.name || u.area_id),
            icon: u.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${h}`,
              area: u,
              devices: o,
              entities: r,
              entity_filter: l
            }
          };
        })
      ]
    };
  }
}
class ye extends HTMLElement {
  static async generate(i, e) {
    const n = H(i).filter((o) => e.states[o]).sort((o, r) => E(e, o).localeCompare(E(e, r)));
    return {
      sections: me(e, n, {
        devices: i.devices,
        entities: i.entities
      })
    };
  }
}
function fe() {
  console.info(`[HAStrategy] loaded ${I}`);
  const t = he, i = ye;
  customElements.get(`${h}-summary-buttons`) || customElements.define(`${h}-summary-buttons`, j), customElements.get(`${h}-wide-cards`) || customElements.define(`${h}-wide-cards`, X), customElements.define(`ll-strategy-dashboard-${h}`, t), customElements.define(`ll-strategy-view-${h}`, i), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: h,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${I}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
fe();
//# sourceMappingURL=HAStrategy.js.map
