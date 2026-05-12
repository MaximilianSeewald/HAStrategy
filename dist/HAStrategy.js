var G = Object.defineProperty;
var V = (t, n, e) => n in t ? G(t, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[n] = e;
var w = (t, n, e) => V(t, typeof n != "symbol" ? n + "" : n, e);
const y = "max-home-dashboard", k = "0.2.2", M = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], L = M.filter((t) => t.path), A = ["config", "diagnostic"];
function P(t) {
  var e;
  const n = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(n) ? n : A
  };
}
function C(t) {
  const n = t.entity_filter ?? {
    hide_entity_categories: A
  }, e = new Set(
    t.devices.filter((i) => i.area_id === t.area.area_id).map((i) => i.id)
  );
  return $(t.entities, n).filter(
    (i) => i.area_id === t.area.area_id || !i.area_id && i.device_id !== null && i.device_id !== void 0 && e.has(i.device_id)
  ).map((i) => i.entity_id);
}
function $(t, n) {
  const e = new Set(n.hide_entity_categories);
  return t.filter((i) => !i.hidden_by && !i.disabled_by).filter((i) => !i.entity_category || !e.has(i.entity_category));
}
function R(t, n) {
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
function K(t, n) {
  const e = n.filter((i) => {
    var o;
    return ["on", "open", "opening"].includes(((o = t.states[i]) == null ? void 0 : o.state) ?? "");
  }).length;
  return e === 0 ? "Alle aus" : `${e} aktiv`;
}
function U(t, n) {
  const e = n.map((o) => B(t, o)).filter((o) => Number.isFinite(o));
  return e.length === 0 ? "Keine Werte" : `${(e.reduce((o, r) => o + r, 0) / e.length).toFixed(1).replace(".", ",")}°`;
}
function Y(t, n) {
  const e = n.filter(
    (i) => {
      var o;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((o = t.states[i]) == null ? void 0 : o.state) ?? "");
    }
  ).length;
  return e === 0 ? "Alles ruhig" : `${e} aktiv`;
}
function q(t, n) {
  const e = n.filter((i) => {
    var o;
    return ((o = t.states[i]) == null ? void 0 : o.state) === "playing";
  }).length;
  return e === 0 ? "Keine Wiedergabe" : `${e} Wiedergabe`;
}
function B(t, n) {
  const e = t.states[n], i = ["current_temperature", "temperature"];
  for (const o of i) {
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
function S(t, n) {
  var e;
  return ((e = t.states[n]) == null ? void 0 : e.attributes.friendly_name) ?? n;
}
function E(t) {
  return !["lights", "climate", "security"].includes(t);
}
function z(t, n, e, i, o, r, s) {
  const l = new Map(n.map((a) => [a.floor_id, a])), c = new Map(
    n.slice().sort(T).map((a, u) => [a.floor_id, u])
  );
  return t.map((a) => {
    const u = x(f(a.name || a.area_id), s), m = a.floor_id ? l.get(a.floor_id) : void 0;
    return {
      title: a.name,
      path: u,
      icon: a.icon ?? "mdi:floor-plan",
      stateEntityId: j(r, a, e, i, o),
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: a.floor_id ? c.get(a.floor_id) ?? n.length : n.length
    };
  });
}
function j(t, n, e, i, o) {
  return C({ area: n, devices: e, entities: i, entity_filter: o }).find((r) => {
    const s = t.states[r];
    return r.startsWith("sensor.") && (s == null ? void 0 : s.attributes.device_class) === "temperature" && Number.isFinite(B(t, r));
  });
}
function T(t, n) {
  return typeof t.level == "number" && typeof n.level == "number" && t.level !== n.level ? t.level - n.level : typeof t.level == "number" ? -1 : typeof n.level == "number" ? 1 : t.name.localeCompare(n.name);
}
function X(t) {
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
function J(t, n = []) {
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
  let o = i, r = 2;
  for (; e.has(o); )
    o = `${i}-${r}`, r += 1;
  return e.add(o), o;
}
function f(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
class Q extends HTMLElement {
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
      (o, r) => `
              <button data-index="${r}" ${o.path ? "" : "disabled"}>
                <ha-icon icon="${I(o.icon)}"></ha-icon>
                <span class="label">${I(`${o.title} ${o.subtitle}`)}</span>
              </button>
            `
    ).join("")}
      </div>
    `, this.root.querySelectorAll("button[data-index]").forEach((o) => {
      o.addEventListener("click", () => {
        var l;
        const r = Number(o.dataset.index), s = (l = e[r]) == null ? void 0 : l.path;
        s && (window.history.pushState(null, "", s), window.dispatchEvent(new Event("location-changed")));
      });
    });
  }
}
function Z(t, n) {
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
function ee(t, n) {
  return {
    type: `custom:${y}-summary-buttons`,
    items: t.map((e) => ({
      title: e.title,
      subtitle: e.subtitle,
      icon: e.icon,
      path: e.path ? D(n, e.path) : void 0
    }))
  };
}
function H(t, n, e, i = !1) {
  return i && e ? te(t, n, e) : F(t, n);
}
function te(t, n, e) {
  const i = new Map(e.entities.map((s) => [s.entity_id, s])), o = new Map(e.devices.map((s) => [s.id, s])), r = /* @__PURE__ */ new Map();
  for (const s of n) {
    const l = i.get(s), c = (l == null ? void 0 : l.device_id) ?? s;
    r.set(c, [...r.get(c) ?? [], s]);
  }
  return Array.from(r.entries()).sort(([s, l], [c, a]) => {
    const u = v(s, l, o, t), m = v(c, a, o, t);
    return u.localeCompare(m);
  }).flatMap(([s, l]) => [
    {
      type: "heading",
      heading: v(s, l, o, t),
      heading_style: "subtitle",
      icon: "mdi:devices"
    },
    ...F(t, l)
  ]);
}
function v(t, n, e, i) {
  const o = e.get(t), r = n[0];
  return (o == null ? void 0 : o.name_by_user) ?? (o == null ? void 0 : o.name) ?? (r && i ? S(i, r) : "Weitere");
}
function F(t, n) {
  const e = t ? n.filter((a) => re(t, a)) : [], i = new Set(e), o = [], r = [], s = [], l = [], c = [];
  for (const a of n)
    if (ie(a))
      r.push(a);
    else {
      if (i.has(a))
        continue;
      oe(a) ? s.push(a) : ne(a) ? l.push(a) : c.push(a);
    }
  for (const a of r)
    o.push({
      type: "picture-entity",
      entity: a,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  e.length > 0 && o.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: e
  });
  for (const a of s)
    o.push({
      type: "media-control",
      entity: a
    });
  return l.length > 0 && o.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: l.map((a) => ({
      type: "tile",
      entity: a
    }))
  }), c.length > 0 && o.push({
    type: "entities",
    show_header_toggle: !1,
    entities: c
  }), o;
}
function ne(t) {
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
function ie(t) {
  return t.split(".")[0] === "camera";
}
function oe(t) {
  return t.split(".")[0] === "media_player";
}
function re(t, n) {
  var o;
  const e = n.split(".")[0] ?? "", i = String(((o = t.states[n]) == null ? void 0 : o.attributes.device_class) ?? "");
  return e === "sensor" && ["temperature", "humidity"].includes(i);
}
function I(t) {
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
function ae(t, n, e, i, o, r) {
  const s = t.config.location_name ?? "Home", l = se(n, r), c = ce(t, e, i, o);
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
            heading: `Willkommen ${s}`,
            heading_style: "title",
            icon: "mdi:home-heart"
          },
          {
            type: "heading",
            heading: " ",
            heading_style: "subtitle"
          },
          ...l
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
          ee(c, r)
        ]
      }
    ].filter((a) => a.cards.length > 0)
  };
}
function se(t, n) {
  const e = /* @__PURE__ */ new Map();
  for (const i of t) {
    const o = i.floorName ?? "Weitere Räume";
    e.set(o, [...e.get(o) ?? [], i]);
  }
  return Array.from(e.entries()).sort(([, i], [, o]) => {
    const r = i[0], s = o[0];
    return ((r == null ? void 0 : r.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || ((r == null ? void 0 : r.floorName) ?? "").localeCompare((s == null ? void 0 : s.floorName) ?? "");
  }).flatMap(([i, o]) => {
    var r;
    return [
      {
        type: "heading",
        heading: i,
        heading_style: "title",
        icon: ((r = o[0]) == null ? void 0 : r.floorIcon) ?? "mdi:home-floor-0"
      },
      ...o.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => Z(s, n))
    ];
  });
}
function ce(t, n, e, i) {
  const o = n.map((r) => ({
    title: r.title,
    subtitle: "Öffnen",
    path: r.path ?? f(r.title),
    icon: r.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: K(t, e.lights),
      path: i.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: U(t, e.climate),
      path: i.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: Y(t, e.security),
      path: i.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: q(t, e.media),
      path: i.media,
      icon: "mdi:music-box-outline"
    },
    ...o
  ];
}
function le(t, n, e, i, o, r, s) {
  const l = de(e, i, o, r), c = {};
  return { views: L.map((u) => {
    const m = x(u.path, s);
    return c[u.key] = m, {
      title: N(u.key),
      path: m,
      icon: u.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: n[u.key].length > 0 ? ue(t, { ...u, title: N(u.key) }, n[u.key], l, {
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
function ue(t, n, e, i, o) {
  const r = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of e) {
    const c = i.get(l) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, a = r.get(c.floorName) ?? /* @__PURE__ */ new Map();
    a.set(c.areaName, [...a.get(c.areaName) ?? [], l]), r.set(c.floorName, a), s.set(c.floorName, c);
  }
  return Array.from(r.entries()).sort(([l], [c]) => {
    const a = s.get(l), u = s.get(c);
    return ((a == null ? void 0 : a.sortIndex) ?? 0) - ((u == null ? void 0 : u.sortIndex) ?? 0) || l.localeCompare(c);
  }).flatMap(([l, c]) => {
    const a = s.get(l), u = [
      {
        type: "heading",
        heading: l,
        heading_style: "title",
        icon: (a == null ? void 0 : a.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, h] of Array.from(c.entries()).sort(([p], [g]) => p.localeCompare(g)))
      u.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), u.push(...H(t, h, o, E(n.key)));
    return [
      {
        type: "grid",
        cards: u
      }
    ];
  });
}
function de(t, n, e, i) {
  const o = new Map(n.map((c) => [c.area_id, c])), r = new Map(e.map((c) => [c.id, c])), s = new Map(i.map((c) => [c.floor_id, c])), l = new Map(
    i.slice().sort(T).map((c, a) => [c.floor_id, a])
  );
  return new Map(
    t.map((c) => {
      const a = c.device_id ? r.get(c.device_id) : void 0, u = c.area_id ?? (a == null ? void 0 : a.area_id) ?? void 0, m = u ? o.get(u) : void 0, h = (m == null ? void 0 : m.floor_id) ?? (a == null ? void 0 : a.floor_id) ?? void 0, p = h ? s.get(h) : void 0;
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
function me(t) {
  var e;
  const n = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && n.push(pe(t.shopping));
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
  return J(n, ["dashboard"]);
}
function pe(t = {}) {
  const n = {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    addon_slug: t.addon_slug ?? "ktor_app",
    show_completed: t.show_completed ?? !0
  };
  return t.backend_url && (delete n.addon_slug, n.backend_url = t.backend_url), {
    title: t.title ?? "Shopping",
    path: t.path ?? "shopping",
    icon: t.icon ?? "mdi:cart-outline",
    panel: !0,
    cards: [n]
  };
}
function he(t, n, e) {
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
  const i = R(t, n), o = [];
  for (const r of M) {
    const s = i[r.key];
    s.length !== 0 && o.push(ye(t, r, s, e, !E(r.key)));
  }
  return o;
}
function ye(t, n, e, i, o = !0) {
  const r = o ? [
    {
      type: "heading",
      heading: n.title,
      heading_style: "subtitle",
      icon: n.icon
    }
  ] : [];
  return r.push(...H(t, e, i, E(n.key))), {
    type: "grid",
    cards: r
  };
}
class fe extends HTMLElement {
  static getCreateSuggestions(n) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(n, e) {
    const [i, o, r] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = P(n), c = i.filter((d) => d.area_id && d.name).sort((d, _) => d.name.localeCompare(_.name)), a = me(n), u = /* @__PURE__ */ new Set(["dashboard", ...a.map((d) => d.path).filter(Boolean)]), m = z(c, s, o, r, l, e, u), h = $(r, l).map((d) => d.entity_id).filter((d) => e.states[d]), p = R(e, h), g = le(e, p, r, c, o, s, u), W = X([
      "dashboard",
      ...a.map((d) => d.path).filter((d) => !!d),
      ...g.views.map((d) => d.path).filter((d) => !!d),
      ...m.map((d) => d.path)
    ]);
    return {
      title: n.title ?? "Max Home",
      views: [
        ae(e, m, a, p, g.pathByKey, W),
        ...a,
        ...g.views,
        ...c.map((d, _) => {
          const b = m[_];
          return {
            title: d.name,
            path: (b == null ? void 0 : b.path) ?? f(d.name || d.area_id),
            icon: d.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${y}`,
              area: d,
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
class ge extends HTMLElement {
  static async generate(n, e) {
    const i = C(n).filter((o) => e.states[o]).sort((o, r) => S(e, o).localeCompare(S(e, r)));
    return {
      sections: he(e, i, {
        devices: n.devices,
        entities: n.entities
      })
    };
  }
}
function _e() {
  console.info(`[HAStrategy] loaded ${k}`), customElements.get(`${y}-summary-buttons`) || customElements.define(`${y}-summary-buttons`, Q), customElements.define(`ll-strategy-dashboard-${y}`, fe), customElements.define(`ll-strategy-view-${y}`, ge), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: y,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${k}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
_e();
//# sourceMappingURL=HAStrategy.js.map
