var P = Object.defineProperty;
var O = (t, n, e) => n in t ? P(t, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[n] = e;
var v = (t, n, e) => O(t, typeof n != "symbol" ? n + "" : n, e);
const y = "max-home-dashboard", M = "0.2.2", $ = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], K = $.filter((t) => t.path), R = ["config", "diagnostic"];
class U extends HTMLElement {
  static getCreateSuggestions(n) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(n, e) {
    const [i, r, o] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = ge(n), a = i.filter((d) => d.area_id && d.name).sort((d, _) => d.name.localeCompare(_.name)), c = oe(n), u = /* @__PURE__ */ new Set(["dashboard", ...c.map((d) => d.path).filter(Boolean)]), m = j(a, s, r, o, l, e, u), h = V(o, l).map((d) => d.entity_id).filter((d) => e.states[d]), p = H(e, h), g = te(e, p, o, a, r, s, u), L = re([
      "dashboard",
      ...c.map((d) => d.path).filter((d) => !!d),
      ...g.views.map((d) => d.path).filter((d) => !!d),
      ...m.map((d) => d.path)
    ]);
    return {
      title: n.title ?? "Max Home",
      views: [
        z(e, m, c, p, g.pathByKey, L),
        ...c,
        ...g.views,
        ...a.map((d, _) => {
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
              devices: r,
              entities: o,
              entity_filter: l
            }
          };
        })
      ]
    };
  }
}
class Y extends HTMLElement {
  static async generate(n, e) {
    const i = G(n).filter((r) => e.states[r]).sort((r, o) => x(e, r).localeCompare(x(e, o)));
    return {
      sections: se(e, n.area, i, {
        devices: n.devices,
        entities: n.entities
      })
    };
  }
}
class q extends HTMLElement {
  constructor() {
    super(...arguments);
    v(this, "config");
    v(this, "root", this.attachShadow({ mode: "open" }));
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
        ha-card {
          display: grid;
          gap: 6px;
          padding: 6px;
          background: transparent;
          box-shadow: none;
        }

        button {
          align-items: center;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border: 1px solid var(--divider-color);
          border-radius: var(--ha-card-border-radius, 12px);
          color: var(--primary-text-color);
          cursor: pointer;
          display: grid;
          font: inherit;
          gap: 10px;
          grid-template-columns: 22px 1fr;
          min-height: 34px;
          padding: 6px 10px;
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
          color: var(--primary-color);
          height: 18px;
          width: 18px;
        }

        .label {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>
      <ha-card>
        ${e.map(
      (r, o) => `
              <button data-index="${o}" ${r.path ? "" : "disabled"}>
                <ha-icon icon="${I(r.icon)}"></ha-icon>
                <span class="label">${I(`${r.title} ${r.subtitle}`)}</span>
              </button>
            `
    ).join("")}
      </ha-card>
    `, this.root.querySelectorAll("button[data-index]").forEach((r) => {
      r.addEventListener("click", () => {
        var l;
        const o = Number(r.dataset.index), s = (l = e[o]) == null ? void 0 : l.path;
        s && (window.history.pushState(null, "", s), window.dispatchEvent(new Event("location-changed")));
      });
    });
  }
}
function z(t, n, e, i, r, o) {
  const s = t.config.location_name ?? "Home", l = X(n, o), a = Q(t, e, i, r);
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
          Z(a, o)
        ]
      }
    ].filter((c) => c.cards.length > 0)
  };
}
function j(t, n, e, i, r, o, s) {
  const l = new Map(n.map((c) => [c.floor_id, c])), a = new Map(
    n.slice().sort(W).map((c, u) => [c.floor_id, u])
  );
  return t.map((c) => {
    const u = N(f(c.name || c.area_id), s), m = c.floor_id ? l.get(c.floor_id) : void 0;
    return {
      title: c.name,
      path: u,
      icon: c.icon ?? "mdi:floor-plan",
      stateEntityId: ee(o, c, e, i, r),
      floorId: c.floor_id,
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: c.floor_id ? a.get(c.floor_id) ?? n.length : n.length
    };
  });
}
function X(t, n) {
  const e = /* @__PURE__ */ new Map();
  for (const i of t) {
    const r = i.floorName ?? "Weitere Räume";
    e.set(r, [...e.get(r) ?? [], i]);
  }
  return Array.from(e.entries()).sort(([, i], [, r]) => {
    const o = i[0], s = r[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((s == null ? void 0 : s.floorName) ?? "");
  }).flatMap(([i, r]) => {
    var o;
    return [
      {
        type: "heading",
        heading: i,
        heading_style: "title",
        icon: ((o = r[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      ...r.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => J(s, n))
    ];
  });
}
function J(t, n) {
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
      navigation_path: B(n, t.path)
    }
  };
  return t.stateEntityId && (e.entity = t.stateEntityId), e;
}
function Q(t, n, e, i) {
  const r = n.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? f(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: me(t, e.lights),
      path: i.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: pe(t, e.climate),
      path: i.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: he(t, e.security),
      path: i.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: ye(t, e.media),
      path: i.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function Z(t, n) {
  return {
    type: `custom:${y}-summary-buttons`,
    items: t.map((e) => ({
      title: e.title,
      subtitle: e.subtitle,
      icon: e.icon,
      path: e.path ? B(n, e.path) : void 0
    }))
  };
}
function ee(t, n, e, i, r) {
  return G({ area: n, devices: e, entities: i, entity_filter: r }).find((o) => {
    const s = t.states[o];
    return o.startsWith("sensor.") && (s == null ? void 0 : s.attributes.device_class) === "temperature" && Number.isFinite(F(t, o));
  });
}
function te(t, n, e, i, r, o, s) {
  const l = ie(e, i, r, o), a = {};
  return { views: K.map((u) => {
    const m = N(u.path, s);
    return a[u.key] = m, {
      title: A(u.key),
      path: m,
      icon: u.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: n[u.key].length > 0 ? ne(t, { ...u, title: A(u.key) }, n[u.key], l, {
        devices: r,
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
  }), pathByKey: a };
}
function ne(t, n, e, i, r) {
  const o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of e) {
    const a = i.get(l) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, c = o.get(a.floorName) ?? /* @__PURE__ */ new Map();
    c.set(a.areaName, [...c.get(a.areaName) ?? [], l]), o.set(a.floorName, c), s.set(a.floorName, a);
  }
  return Array.from(o.entries()).sort(([l], [a]) => {
    const c = s.get(l), u = s.get(a);
    return ((c == null ? void 0 : c.sortIndex) ?? 0) - ((u == null ? void 0 : u.sortIndex) ?? 0) || l.localeCompare(a);
  }).flatMap(([l, a]) => {
    const c = s.get(l), u = [
      {
        type: "heading",
        heading: l,
        heading_style: "title",
        icon: (c == null ? void 0 : c.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, h] of Array.from(a.entries()).sort(([p], [g]) => p.localeCompare(g)))
      u.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), u.push(...T(t, h, r, k(n.key)));
    return [
      {
        type: "grid",
        cards: u
      }
    ];
  });
}
function ie(t, n, e, i) {
  const r = new Map(n.map((a) => [a.area_id, a])), o = new Map(e.map((a) => [a.id, a])), s = new Map(i.map((a) => [a.floor_id, a])), l = new Map(
    i.slice().sort(W).map((a, c) => [a.floor_id, c])
  );
  return new Map(
    t.map((a) => {
      const c = a.device_id ? o.get(a.device_id) : void 0, u = a.area_id ?? (c == null ? void 0 : c.area_id) ?? void 0, m = u ? r.get(u) : void 0, h = (m == null ? void 0 : m.floor_id) ?? (c == null ? void 0 : c.floor_id) ?? void 0, p = h ? s.get(h) : void 0;
      return [
        a.entity_id,
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
function A(t) {
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
function re(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const i = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(i) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function B(t, n) {
  const e = t.replace(/\/+$/g, ""), i = n.replace(/^\/+/g, "");
  return `${e}/${i}`;
}
function oe(t) {
  var e;
  const n = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && n.push(ae(t.shopping));
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
  return fe(n, ["dashboard"]);
}
function ae(t = {}) {
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
function se(t, n, e, i) {
  if (e.length === 0)
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
  const r = H(t, e), o = [];
  for (const s of $) {
    const l = r[s.key];
    l.length !== 0 && o.push(ce(t, s, l, i, !k(s.key)));
  }
  return o;
}
function ce(t, n, e, i, r = !0) {
  const o = r ? [
    {
      type: "heading",
      heading: n.title,
      heading_style: "subtitle",
      icon: n.icon
    }
  ] : [];
  return o.push(...T(t, e, i, k(n.key))), {
    type: "grid",
    cards: o
  };
}
function T(t, n, e, i = !1) {
  return i && e ? le(t, n, e) : D(t, n);
}
function le(t, n, e) {
  const i = new Map(e.entities.map((s) => [s.entity_id, s])), r = new Map(e.devices.map((s) => [s.id, s])), o = /* @__PURE__ */ new Map();
  for (const s of n) {
    const l = i.get(s), a = (l == null ? void 0 : l.device_id) ?? s;
    o.set(a, [...o.get(a) ?? [], s]);
  }
  return Array.from(o.entries()).sort(([s, l], [a, c]) => {
    const u = w(s, l, r, t), m = w(a, c, r, t);
    return u.localeCompare(m);
  }).flatMap(([s, l]) => [
    {
      type: "heading",
      heading: w(s, l, r, t),
      heading_style: "subtitle",
      icon: "mdi:devices"
    },
    ...D(t, l)
  ]);
}
function w(t, n, e, i) {
  const r = e.get(t), o = n[0];
  return (r == null ? void 0 : r.name_by_user) ?? (r == null ? void 0 : r.name) ?? (o && i ? x(i, o) : "Weitere");
}
function D(t, n) {
  const e = n.filter(S), i = n.filter(E), r = t ? n.filter((a) => ue(t, a)) : [], o = n.filter(
    (a) => !S(a) && !E(a) && !r.includes(a) && C(a)
  ), s = n.filter(
    (a) => !S(a) && !E(a) && !r.includes(a) && !C(a)
  ), l = [];
  for (const a of e)
    l.push({
      type: "picture-entity",
      entity: a,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  r.length > 0 && l.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: r
  });
  for (const a of i)
    l.push({
      type: "media-control",
      entity: a
    });
  return o.length > 0 && l.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: o.map((a) => ({
      type: "tile",
      entity: a
    }))
  }), s.length > 0 && l.push({
    type: "entities",
    show_header_toggle: !1,
    entities: s
  }), l;
}
function k(t) {
  return !["lights", "climate", "security"].includes(t);
}
function C(t) {
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
function S(t) {
  return t.split(".")[0] === "camera";
}
function E(t) {
  return t.split(".")[0] === "media_player";
}
function ue(t, n) {
  var r;
  const e = n.split(".")[0] ?? "", i = String(((r = t.states[n]) == null ? void 0 : r.attributes.device_class) ?? "");
  return e === "sensor" && ["temperature", "humidity"].includes(i);
}
function H(t, n) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const i of n)
    e[de(t, i)].push(i);
  return e;
}
function de(t, n) {
  var r;
  const e = n.split(".")[0] ?? "", i = (r = t.states[n]) == null ? void 0 : r.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) || ["temperature", "humidity"].includes(String(i)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(i)) ? "sensors" : "other";
}
function me(t, n) {
  const e = n.filter((i) => {
    var r;
    return ["on", "open", "opening"].includes(((r = t.states[i]) == null ? void 0 : r.state) ?? "");
  }).length;
  return e === 0 ? "Alle aus" : `${e} aktiv`;
}
function pe(t, n) {
  const e = n.map((r) => F(t, r)).filter((r) => Number.isFinite(r));
  return e.length === 0 ? "Keine Werte" : `${(e.reduce((r, o) => r + o, 0) / e.length).toFixed(1).replace(".", ",")}°`;
}
function he(t, n) {
  const e = n.filter(
    (i) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = t.states[i]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return e === 0 ? "Alles ruhig" : `${e} aktiv`;
}
function ye(t, n) {
  const e = n.filter((i) => {
    var r;
    return ((r = t.states[i]) == null ? void 0 : r.state) === "playing";
  }).length;
  return e === 0 ? "Keine Wiedergabe" : `${e} Wiedergabe`;
}
function F(t, n) {
  const e = t.states[n], i = ["current_temperature", "temperature"];
  for (const r of i) {
    const o = e == null ? void 0 : e.attributes[r];
    if (typeof o == "number")
      return o;
  }
  if ((e == null ? void 0 : e.attributes.device_class) === "temperature") {
    const r = Number.parseFloat(e.state);
    if (Number.isFinite(r))
      return r;
  }
}
function W(t, n) {
  return typeof t.level == "number" && typeof n.level == "number" && t.level !== n.level ? t.level - n.level : typeof t.level == "number" ? -1 : typeof n.level == "number" ? 1 : t.name.localeCompare(n.name);
}
function fe(t, n = []) {
  const e = new Set(n);
  return t.map((i) => {
    const r = f(i.path ?? i.title);
    return {
      ...i,
      path: N(r, e)
    };
  });
}
function N(t, n) {
  const e = n instanceof Set ? n : new Set(n.filter(Boolean)), i = f(t || "view") || "view";
  let r = i, o = 2;
  for (; e.has(r); )
    r = `${i}-${o}`, o += 1;
  return e.add(r), r;
}
function G(t) {
  const n = t.entity_filter ?? {
    hide_entity_categories: R
  }, e = new Set(
    t.devices.filter((i) => i.area_id === t.area.area_id).map((i) => i.id)
  );
  return V(t.entities, n).filter(
    (i) => i.area_id === t.area.area_id || !i.area_id && i.device_id !== null && i.device_id !== void 0 && e.has(i.device_id)
  ).map((i) => i.entity_id);
}
function V(t, n) {
  const e = new Set(n.hide_entity_categories);
  return t.filter((i) => !i.hidden_by && !i.disabled_by).filter((i) => !i.entity_category || !e.has(i.entity_category));
}
function ge(t) {
  var e;
  const n = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(n) ? n : R
  };
}
function x(t, n) {
  var e;
  return ((e = t.states[n]) == null ? void 0 : e.attributes.friendly_name) ?? n;
}
function f(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
function _e() {
  console.info(`[HAStrategy] loaded ${M}`), customElements.get(`${y}-summary-buttons`) || customElements.define(`${y}-summary-buttons`, q), customElements.define(`ll-strategy-dashboard-${y}`, U), customElements.define(`ll-strategy-view-${y}`, Y), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: y,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${M}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
_e();
//# sourceMappingURL=HAStrategy.js.map
