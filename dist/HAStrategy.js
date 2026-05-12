var G = Object.defineProperty;
var F = (e, i, t) => i in e ? G(e, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[i] = t;
var w = (e, i, t) => F(e, typeof i != "symbol" ? i + "" : i, t);
const y = "max-home-dashboard", I = "0.2.2", M = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], P = M.filter((e) => e.path), A = ["config", "diagnostic"];
function L(e) {
  var t;
  const i = (t = e.entity_filter) == null ? void 0 : t.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : A
  };
}
function C(e) {
  const i = e.entity_filter ?? {
    hide_entity_categories: A
  }, t = new Set(
    e.devices.filter((n) => n.area_id === e.area.area_id).map((n) => n.id)
  );
  return R(e.entities, i).filter(
    (n) => n.area_id === e.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && t.has(n.device_id)
  ).map((n) => n.entity_id);
}
function R(e, i) {
  const t = new Set(i.hide_entity_categories);
  return e.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !t.has(n.entity_category));
}
function B(e, i) {
  const t = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    t[W(e, n)].push(n);
  return t;
}
function W(e, i) {
  var o;
  const t = i.split(".")[0] ?? "", n = (o = e.states[i]) == null ? void 0 : o.attributes.device_class;
  return t === "light" || t === "switch" || t === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(t) || ["temperature", "humidity"].includes(String(n)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(t) ? "security" : ["media_player", "remote", "vacuum"].includes(t) ? "media" : t === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function O(e, i) {
  const t = e.states[i], n = ["current_temperature", "temperature"];
  for (const o of n) {
    const a = t == null ? void 0 : t.attributes[o];
    if (typeof a == "number")
      return a;
  }
  if ((t == null ? void 0 : t.attributes.device_class) === "temperature") {
    const o = Number.parseFloat(t.state);
    if (Number.isFinite(o))
      return o;
  }
}
function S(e, i) {
  var t;
  return ((t = e.states[i]) == null ? void 0 : t.attributes.friendly_name) ?? i;
}
function E(e) {
  return !["lights", "climate", "security"].includes(e);
}
function U(e, i, t, n, o, a, s) {
  const l = new Map(i.map((r) => [r.floor_id, r])), c = new Map(
    i.slice().sort($).map((r, d) => [r.floor_id, d])
  );
  return e.map((r) => {
    const d = x(f(r.name || r.area_id), s), m = r.floor_id ? l.get(r.floor_id) : void 0;
    return {
      title: r.name,
      path: d,
      icon: r.icon ?? "mdi:floor-plan",
      stateEntityId: K(a, r, t, n, o),
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: r.floor_id ? c.get(r.floor_id) ?? i.length : i.length
    };
  });
}
function K(e, i, t, n, o) {
  return C({ area: i, devices: t, entities: n, entity_filter: o }).find((a) => {
    const s = e.states[a];
    return a.startsWith("sensor.") && (s == null ? void 0 : s.attributes.device_class) === "temperature" && Number.isFinite(O(e, a));
  });
}
function $(e, i) {
  return typeof e.level == "number" && typeof i.level == "number" && e.level !== i.level ? e.level - i.level : typeof e.level == "number" ? -1 : typeof i.level == "number" ? 1 : e.name.localeCompare(i.name);
}
function Y(e) {
  const t = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (t.length === 0)
    return "";
  const n = decodeURIComponent(t[t.length - 1] ?? "");
  return e.includes(n) ? `/${t.slice(0, -1).join("/")}` : `/${t.join("/")}`;
}
function T(e, i) {
  const t = e.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${t}/${n}`;
}
function q(e, i = []) {
  const t = new Set(i);
  return e.map((n) => {
    const o = f(n.path ?? n.title);
    return {
      ...n,
      path: x(o, t)
    };
  });
}
function x(e, i) {
  const t = i instanceof Set ? i : new Set(i.filter(Boolean)), n = f(e || "view") || "view";
  let o = n, a = 2;
  for (; t.has(o); )
    o = `${n}-${a}`, a += 1;
  return t.add(o), o;
}
function f(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
class z extends HTMLElement {
  constructor() {
    super(...arguments);
    w(this, "config");
    w(this, "root", this.attachShadow({ mode: "open" }));
  }
  setConfig(t) {
    this.config = t, this.render();
  }
  getCardSize() {
    return 1;
  }
  render() {
    var n;
    const t = ((n = this.config) == null ? void 0 : n.items) ?? [];
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
        ${t.map(
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
        const a = Number(o.dataset.index), s = (l = t[a]) == null ? void 0 : l.path;
        s && (window.history.pushState(null, "", s), window.dispatchEvent(new Event("location-changed")));
      });
    });
  }
}
function j(e, i) {
  const t = {
    type: "button",
    name: e.title,
    icon: e.icon,
    icon_height: "22px",
    show_icon: !0,
    show_name: !0,
    show_state: !!e.stateEntityId,
    grid_options: {
      columns: 4,
      rows: 2
    },
    tap_action: {
      action: "navigate",
      navigation_path: T(i, e.path)
    }
  };
  return e.stateEntityId && (t.entity = e.stateEntityId), t;
}
function X(e, i) {
  return {
    type: `custom:${y}-summary-buttons`,
    items: e.map((t) => ({
      title: t.title,
      icon: t.icon,
      path: t.path ? T(i, t.path) : void 0
    }))
  };
}
function D(e, i, t, n = !1) {
  return n && t ? J(e, i, t) : H(e, i);
}
function J(e, i, t) {
  const n = new Map(t.entities.map((s) => [s.entity_id, s])), o = new Map(t.devices.map((s) => [s.id, s])), a = /* @__PURE__ */ new Map();
  for (const s of i) {
    const l = n.get(s), c = (l == null ? void 0 : l.device_id) ?? s;
    a.set(c, [...a.get(c) ?? [], s]);
  }
  return Array.from(a.entries()).sort(([s, l], [c, r]) => {
    const d = v(s, l, o, e), m = v(c, r, o, e);
    return d.localeCompare(m);
  }).flatMap(([s, l]) => [
    {
      type: "heading",
      heading: v(s, l, o, e),
      heading_style: "subtitle",
      icon: "mdi:devices"
    },
    ...H(e, l)
  ]);
}
function v(e, i, t, n) {
  const o = t.get(e), a = i[0];
  return (o == null ? void 0 : o.name_by_user) ?? (o == null ? void 0 : o.name) ?? (a && n ? S(n, a) : "Weitere");
}
function H(e, i) {
  const t = e ? i.filter((r) => te(e, r)) : [], n = new Set(t), o = [], a = [], s = [], l = [], c = [];
  for (const r of i)
    if (Z(r))
      a.push(r);
    else {
      if (n.has(r))
        continue;
      ee(r) ? s.push(r) : Q(r) ? l.push(r) : c.push(r);
    }
  for (const r of a)
    o.push({
      type: "picture-entity",
      entity: r,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  t.length > 0 && o.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: t
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
function Q(e) {
  const i = e.split(".")[0] ?? "";
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
function Z(e) {
  return e.split(".")[0] === "camera";
}
function ee(e) {
  return e.split(".")[0] === "media_player";
}
function te(e, i) {
  var o;
  const t = i.split(".")[0] ?? "", n = String(((o = e.states[i]) == null ? void 0 : o.attributes.device_class) ?? "");
  return t === "sensor" && ["temperature", "humidity"].includes(n);
}
function k(e) {
  return e.replace(/[&<>"']/g, (i) => {
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
function ie(e, i, t, n, o) {
  const a = e.config.location_name ?? "Home", s = ne(i, o), l = oe(t, n);
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
          X(l, o)
        ]
      }
    ].filter((c) => c.cards.length > 0)
  };
}
function ne(e, i) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const o = n.floorName ?? "Weitere Räume";
    t.set(o, [...t.get(o) ?? [], n]);
  }
  return Array.from(t.entries()).sort(([, n], [, o]) => {
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
      ...o.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => j(s, i))
    ];
  });
}
function oe(e, i) {
  const t = e.map((n) => ({
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
    ...t
  ];
}
function re(e, i, t, n, o, a, s) {
  const l = se(t, n, o, a), c = {};
  return { views: P.map((d) => {
    const m = x(d.path, s);
    return c[d.key] = m, {
      title: N(d.key),
      path: m,
      icon: d.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: i[d.key].length > 0 ? ae(e, { ...d, title: N(d.key) }, i[d.key], l, {
        devices: o,
        entities: t
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
function ae(e, i, t, n, o) {
  const a = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of t) {
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
      }), d.push(...D(e, h, o, E(i.key)));
    return [
      {
        type: "grid",
        cards: d
      }
    ];
  });
}
function se(e, i, t, n) {
  const o = new Map(i.map((c) => [c.area_id, c])), a = new Map(t.map((c) => [c.id, c])), s = new Map(n.map((c) => [c.floor_id, c])), l = new Map(
    n.slice().sort($).map((c, r) => [c.floor_id, r])
  );
  return new Map(
    e.map((c) => {
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
function N(e) {
  switch (e) {
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
function ce(e) {
  var t;
  const i = [];
  ((t = e.shopping) == null ? void 0 : t.enabled) !== !1 && i.push(le(e.shopping));
  for (const n of e.categories ?? [])
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
  return q(i, ["dashboard"]);
}
function le(e = {}) {
  const i = {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    addon_slug: e.addon_slug ?? "ktor_app",
    show_completed: e.show_completed ?? !0
  };
  return e.backend_url && (delete i.addon_slug, i.backend_url = e.backend_url), {
    title: e.title ?? "Shopping",
    path: e.path ?? "shopping",
    icon: e.icon ?? "mdi:cart-outline",
    panel: !0,
    cards: [i]
  };
}
function de(e, i, t) {
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
  const n = B(e, i), o = [];
  for (const a of M) {
    const s = n[a.key];
    s.length !== 0 && o.push(ue(e, a, s, t, !E(a.key)));
  }
  return o;
}
function ue(e, i, t, n, o = !0) {
  const a = o ? [
    {
      type: "heading",
      heading: i.title,
      heading_style: "subtitle",
      icon: i.icon
    }
  ] : [];
  return a.push(...D(e, t, n, E(i.key))), {
    type: "grid",
    cards: a
  };
}
class me extends HTMLElement {
  static getCreateSuggestions(i) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(i, t) {
    const [n, o, a] = await Promise.all([
      t.callWS({ type: "config/area_registry/list" }),
      t.callWS({ type: "config/device_registry/list" }),
      t.callWS({ type: "config/entity_registry/list" })
    ]), s = await t.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = L(i), c = n.filter((u) => u.area_id && u.name).sort((u, _) => u.name.localeCompare(_.name)), r = ce(i), d = /* @__PURE__ */ new Set(["dashboard", ...r.map((u) => u.path).filter(Boolean)]), m = U(c, s, o, a, l, t, d), h = R(a, l).map((u) => u.entity_id).filter((u) => t.states[u]), p = B(t, h), g = re(t, p, a, c, o, s, d), V = Y([
      "dashboard",
      ...r.map((u) => u.path).filter((u) => !!u),
      ...g.views.map((u) => u.path).filter((u) => !!u),
      ...m.map((u) => u.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        ie(t, m, r, g.pathByKey, V),
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
class pe extends HTMLElement {
  static async generate(i, t) {
    const n = C(i).filter((o) => t.states[o]).sort((o, a) => S(t, o).localeCompare(S(t, a)));
    return {
      sections: de(t, n, {
        devices: i.devices,
        entities: i.entities
      })
    };
  }
}
function he() {
  console.info(`[HAStrategy] loaded ${I}`);
  const e = me, i = pe;
  customElements.get(`${y}-summary-buttons`) || customElements.define(`${y}-summary-buttons`, z), customElements.define(`ll-strategy-dashboard-${y}`, e), customElements.define(`ll-strategy-view-${y}`, i), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: y,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${I}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
he();
//# sourceMappingURL=HAStrategy.js.map
