const g = "max-home-dashboard", F = "0.2.1", I = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], V = I.filter((e) => e.path), k = ["config", "diagnostic"];
class D extends HTMLElement {
  static getCreateSuggestions(n) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(n, t) {
    const [i, o, r] = await Promise.all([
      t.callWS({ type: "config/area_registry/list" }),
      t.callWS({ type: "config/device_registry/list" }),
      t.callWS({ type: "config/entity_registry/list" })
    ]), s = await t.callWS({ type: "config/floor_registry/list" }).catch(() => []), c = se(n), l = i.filter((u) => u.area_id && u.name).sort((u, _) => u.name.localeCompare(_.name)), a = X(n), m = /* @__PURE__ */ new Set(["dashboard", ...a.map((u) => u.path).filter(Boolean)]), d = G(l, s, o, r, c, t, m), h = T(r, c).map((u) => u.entity_id).filter((u) => t.states[u]), p = R(t, h), f = Y(t, p, r, l, o, s, m), B = j([
      "dashboard",
      ...a.map((u) => u.path).filter((u) => !!u),
      ...f.views.map((u) => u.path).filter((u) => !!u),
      ...d.map((u) => u.path)
    ]);
    return {
      title: n.title ?? "Max Home",
      views: [
        W(t, d, a, p, f.pathByKey, B),
        ...a,
        ...f.views,
        ...l.map((u, _) => {
          const b = d[_];
          return {
            title: u.name,
            path: (b == null ? void 0 : b.path) ?? y(u.name || u.area_id),
            icon: u.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${g}`,
              area: u,
              devices: o,
              entities: r,
              entity_filter: c
            }
          };
        })
      ]
    };
  }
}
class H extends HTMLElement {
  static async generate(n, t) {
    const i = $(n).filter((o) => t.states[o]).sort((o, r) => N(t, o).localeCompare(N(t, r)));
    return {
      sections: Q(t, n.area, i)
    };
  }
}
function W(e, n, t, i, o, r) {
  const s = e.config.location_name ?? "Home", c = O(n, r), l = L(e, t, i, o);
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
          ...c
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
          ...l.map((a) => K(a, r))
        ]
      }
    ].filter((a) => a.cards.length > 0)
  };
}
function G(e, n, t, i, o, r, s) {
  const c = new Map(n.map((a) => [a.floor_id, a])), l = new Map(
    n.slice().sort(x).map((a, m) => [a.floor_id, m])
  );
  return e.map((a) => {
    const m = v(y(a.name || a.area_id), s), d = a.floor_id ? c.get(a.floor_id) : void 0;
    return {
      title: a.name,
      path: m,
      icon: a.icon ?? "mdi:floor-plan",
      stateEntityId: U(r, a, t, i, o),
      floorId: a.floor_id,
      floorName: (d == null ? void 0 : d.name) ?? "Weitere Räume",
      floorIcon: (d == null ? void 0 : d.icon) ?? "mdi:home-floor-0",
      sortIndex: a.floor_id ? l.get(a.floor_id) ?? n.length : n.length
    };
  });
}
function O(e, n) {
  const t = /* @__PURE__ */ new Map();
  for (const i of e) {
    const o = i.floorName ?? "Weitere Räume";
    t.set(o, [...t.get(o) ?? [], i]);
  }
  return Array.from(t.entries()).sort(([, i], [, o]) => {
    const r = i[0], s = o[0];
    return ((r == null ? void 0 : r.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || ((r == null ? void 0 : r.floorName) ?? "").localeCompare((s == null ? void 0 : s.floorName) ?? "");
  }).flatMap(([i, o]) => {
    var r;
    return [
      {
        type: "heading",
        heading: i,
        heading_style: "subtitle",
        icon: ((r = o[0]) == null ? void 0 : r.floorIcon) ?? "mdi:home-floor-0"
      },
      ...o.slice().sort((s, c) => s.title.localeCompare(c.title)).map((s) => P(s, n))
    ];
  });
}
function P(e, n) {
  const t = {
    type: "button",
    name: e.title,
    icon: e.icon,
    icon_height: "24px",
    show_icon: !0,
    show_name: !0,
    show_state: !!e.stateEntityId,
    grid_options: {
      columns: 4,
      rows: 2
    },
    tap_action: {
      action: "navigate",
      navigation_path: A(n, e.path)
    }
  };
  return e.stateEntityId && (t.entity = e.stateEntityId), t;
}
function L(e, n, t, i) {
  const o = n.map((r) => ({
    title: r.title,
    subtitle: "Öffnen",
    path: r.path ?? y(r.title),
    icon: r.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: ie(e, t.lights),
      path: i.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: ne(e, t.climate),
      path: i.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: oe(e, t.security),
      path: i.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: re(e, t.media),
      path: i.media,
      icon: "mdi:music-box-outline"
    },
    ...o
  ];
}
function K(e, n) {
  return {
    type: "button",
    name: `${e.title} ${e.subtitle}`,
    icon: e.icon,
    icon_height: "22px",
    show_icon: !0,
    show_name: !0,
    grid_options: {
      columns: "full",
      rows: 1
    },
    tap_action: e.path ? {
      action: "navigate",
      navigation_path: A(n, e.path)
    } : {
      action: "none"
    }
  };
}
function U(e, n, t, i, o) {
  return $({ area: n, devices: t, entities: i, entity_filter: o }).find(
    (r) => Number.isFinite(C(e, r))
  );
}
function Y(e, n, t, i, o, r, s) {
  const c = z(t, i, o, r), l = {};
  return { views: V.map((m) => {
    const d = v(m.path, s);
    return l[m.key] = d, {
      title: S(m.key),
      path: d,
      icon: m.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: n[m.key].length > 0 ? q(e, { ...m, title: S(m.key) }, n[m.key], c) : [
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
  }), pathByKey: l };
}
function q(e, n, t, i) {
  const o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const s of t) {
    const c = i.get(s) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, l = o.get(c.floorName) ?? /* @__PURE__ */ new Map();
    l.set(c.areaName, [...l.get(c.areaName) ?? [], s]), o.set(c.floorName, l), r.set(c.floorName, c);
  }
  return Array.from(o.entries()).sort(([s], [c]) => {
    const l = r.get(s), a = r.get(c);
    return ((l == null ? void 0 : l.sortIndex) ?? 0) - ((a == null ? void 0 : a.sortIndex) ?? 0) || s.localeCompare(c);
  }).flatMap(([s, c]) => {
    const l = r.get(s), a = [
      {
        type: "heading",
        heading: s,
        heading_style: "subtitle",
        icon: (l == null ? void 0 : l.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, d] of Array.from(c.entries()).sort(([h], [p]) => h.localeCompare(p)))
      a.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), a.push(...M(e, d));
    return [
      {
        type: "grid",
        cards: a
      }
    ];
  });
}
function z(e, n, t, i) {
  const o = new Map(n.map((l) => [l.area_id, l])), r = new Map(t.map((l) => [l.id, l])), s = new Map(i.map((l) => [l.floor_id, l])), c = new Map(
    i.slice().sort(x).map((l, a) => [l.floor_id, a])
  );
  return new Map(
    e.map((l) => {
      const a = l.device_id ? r.get(l.device_id) : void 0, m = l.area_id ?? (a == null ? void 0 : a.area_id) ?? void 0, d = m ? o.get(m) : void 0, h = (d == null ? void 0 : d.floor_id) ?? (a == null ? void 0 : a.floor_id) ?? void 0, p = h ? s.get(h) : void 0;
      return [
        l.entity_id,
        {
          areaName: (d == null ? void 0 : d.name) ?? "Ohne Raum",
          floorName: (p == null ? void 0 : p.name) ?? "Weitere Räume",
          floorIcon: (p == null ? void 0 : p.icon) ?? "mdi:home-floor-0",
          sortIndex: h ? c.get(h) ?? i.length : i.length
        }
      ];
    })
  );
}
function S(e) {
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
function j(e) {
  const t = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (t.length === 0)
    return "";
  const i = decodeURIComponent(t[t.length - 1] ?? "");
  return e.includes(i) ? `/${t.slice(0, -1).join("/")}` : `/${t.join("/")}`;
}
function A(e, n) {
  const t = e.replace(/\/+$/g, ""), i = n.replace(/^\/+/g, "");
  return `${t}/${i}`;
}
function X(e) {
  var t;
  const n = [];
  ((t = e.shopping) == null ? void 0 : t.enabled) !== !1 && n.push(J(e.shopping));
  for (const i of e.categories ?? [])
    !i.id || !i.title || !Array.isArray(i.cards) || n.push({
      title: i.title,
      path: i.path ?? y(i.id),
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
  return ae(n, ["dashboard"]);
}
function J(e = {}) {
  const n = {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    addon_slug: e.addon_slug ?? "ktor_app",
    show_completed: e.show_completed ?? !0
  };
  return e.backend_url && (delete n.addon_slug, n.backend_url = e.backend_url), {
    title: e.title ?? "Shopping",
    path: e.path ?? "shopping",
    icon: e.icon ?? "mdi:cart-outline",
    panel: !0,
    cards: [n]
  };
}
function Q(e, n, t) {
  if (t.length === 0)
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
  const i = R(e, t), o = [];
  for (const r of I) {
    const s = i[r.key];
    s.length !== 0 && o.push(Z(e, r, s));
  }
  return o;
}
function Z(e, n, t, i = !0) {
  const o = i ? [
    {
      type: "heading",
      heading: n.title,
      heading_style: "subtitle",
      icon: n.icon
    }
  ] : [];
  return o.push(...M(e, t)), {
    type: "grid",
    cards: o
  };
}
function M(e, n) {
  const t = n.filter(w), i = e ? n.filter((c) => ee(e, c)) : [], o = n.filter(
    (c) => !w(c) && !i.includes(c) && E(c)
  ), r = n.filter(
    (c) => !w(c) && !i.includes(c) && !E(c)
  ), s = [];
  for (const c of t)
    s.push({
      type: "picture-entity",
      entity: c,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  return i.length > 0 && s.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: i
  }), o.length > 0 && s.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: o.map((c) => ({
      type: "tile",
      entity: c
    }))
  }), r.length > 0 && s.push({
    type: "entities",
    show_header_toggle: !1,
    entities: r
  }), s;
}
function E(e) {
  const n = e.split(".")[0] ?? "";
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
function w(e) {
  return e.split(".")[0] === "camera";
}
function ee(e, n) {
  var o;
  const t = n.split(".")[0] ?? "", i = String(((o = e.states[n]) == null ? void 0 : o.attributes.device_class) ?? "");
  return t === "sensor" && ["temperature", "humidity"].includes(i);
}
function R(e, n) {
  const t = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const i of n)
    t[te(e, i)].push(i);
  return t;
}
function te(e, n) {
  var o;
  const t = n.split(".")[0] ?? "", i = (o = e.states[n]) == null ? void 0 : o.attributes.device_class;
  return t === "light" || t === "switch" || t === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(t) || ["temperature", "humidity"].includes(String(i)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(t) ? "security" : ["media_player", "remote", "vacuum"].includes(t) ? "media" : t === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(i)) ? "sensors" : "other";
}
function ie(e, n) {
  const t = n.filter((i) => {
    var o;
    return ["on", "open", "opening"].includes(((o = e.states[i]) == null ? void 0 : o.state) ?? "");
  }).length;
  return t === 0 ? "Alle aus" : `${t} aktiv`;
}
function ne(e, n) {
  const t = n.map((o) => C(e, o)).filter((o) => Number.isFinite(o));
  return t.length === 0 ? "Keine Werte" : `${(t.reduce((o, r) => o + r, 0) / t.length).toFixed(1).replace(".", ",")}°`;
}
function oe(e, n) {
  const t = n.filter(
    (i) => {
      var o;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((o = e.states[i]) == null ? void 0 : o.state) ?? "");
    }
  ).length;
  return t === 0 ? "Alles ruhig" : `${t} aktiv`;
}
function re(e, n) {
  const t = n.filter((i) => {
    var o;
    return ((o = e.states[i]) == null ? void 0 : o.state) === "playing";
  }).length;
  return t === 0 ? "Keine Wiedergabe" : `${t} Wiedergabe`;
}
function C(e, n) {
  const t = e.states[n], i = ["current_temperature", "temperature"];
  for (const o of i) {
    const r = t == null ? void 0 : t.attributes[o];
    if (typeof r == "number")
      return r;
  }
  if ((t == null ? void 0 : t.attributes.device_class) === "temperature") {
    const o = Number.parseFloat(t.state);
    if (Number.isFinite(o))
      return o;
  }
}
function x(e, n) {
  return typeof e.level == "number" && typeof n.level == "number" && e.level !== n.level ? e.level - n.level : typeof e.level == "number" ? -1 : typeof n.level == "number" ? 1 : e.name.localeCompare(n.name);
}
function ae(e, n = []) {
  const t = new Set(n);
  return e.map((i) => {
    const o = y(i.path ?? i.title);
    return {
      ...i,
      path: v(o, t)
    };
  });
}
function v(e, n) {
  const t = n instanceof Set ? n : new Set(n.filter(Boolean)), i = y(e || "view") || "view";
  let o = i, r = 2;
  for (; t.has(o); )
    o = `${i}-${r}`, r += 1;
  return t.add(o), o;
}
function $(e) {
  const n = e.entity_filter ?? {
    hide_entity_categories: k
  }, t = new Set(
    e.devices.filter((i) => i.area_id === e.area.area_id).map((i) => i.id)
  );
  return T(e.entities, n).filter(
    (i) => i.area_id === e.area.area_id || !i.area_id && i.device_id !== null && i.device_id !== void 0 && t.has(i.device_id)
  ).map((i) => i.entity_id);
}
function T(e, n) {
  const t = new Set(n.hide_entity_categories);
  return e.filter((i) => !i.hidden_by && !i.disabled_by).filter((i) => !i.entity_category || !t.has(i.entity_category));
}
function se(e) {
  var t;
  const n = (t = e.entity_filter) == null ? void 0 : t.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(n) ? n : k
  };
}
function N(e, n) {
  var t;
  return ((t = e.states[n]) == null ? void 0 : t.attributes.friendly_name) ?? n;
}
function y(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function ce() {
  customElements.define(`ll-strategy-dashboard-${g}`, D), customElements.define(`ll-strategy-view-${g}`, H), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: g,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${F}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
ce();
//# sourceMappingURL=HAStrategy.js.map
