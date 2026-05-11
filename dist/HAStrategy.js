const g = "max-home-dashboard", F = "0.2.1", k = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], V = k.filter((t) => t.path), A = ["config", "diagnostic"];
class W extends HTMLElement {
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
    ]), a = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), c = se(n), l = i.filter((u) => u.area_id && u.name).sort((u, _) => u.name.localeCompare(_.name)), s = X(n), m = /* @__PURE__ */ new Set(["dashboard", ...s.map((u) => u.path).filter(Boolean)]), d = G(l, a, r, o, c, e, m), h = T(o, c).map((u) => u.entity_id).filter((u) => e.states[u]), p = R(e, h), f = Y(e, p, o, l, r, a, m), B = j([
      "dashboard",
      ...s.map((u) => u.path).filter((u) => !!u),
      ...f.views.map((u) => u.path).filter((u) => !!u),
      ...d.map((u) => u.path)
    ]);
    return {
      title: n.title ?? "Max Home",
      views: [
        H(e, d, s, p, f.pathByKey, B),
        ...s,
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
              devices: r,
              entities: o,
              entity_filter: c
            }
          };
        })
      ]
    };
  }
}
class D extends HTMLElement {
  static async generate(n, e) {
    const i = $(n).filter((r) => e.states[r]).sort((r, o) => N(e, r).localeCompare(N(e, o)));
    return {
      sections: Q(e, n.area, i)
    };
  }
}
function H(t, n, e, i, r, o) {
  const a = t.config.location_name ?? "Home", c = O(n, o), l = L(t, e, i, r);
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
          K(l, o)
        ]
      }
    ].filter((s) => s.cards.length > 0)
  };
}
function G(t, n, e, i, r, o, a) {
  const c = new Map(n.map((s) => [s.floor_id, s])), l = new Map(
    n.slice().sort(x).map((s, m) => [s.floor_id, m])
  );
  return t.map((s) => {
    const m = v(y(s.name || s.area_id), a), d = s.floor_id ? c.get(s.floor_id) : void 0;
    return {
      title: s.name,
      path: m,
      icon: s.icon ?? "mdi:floor-plan",
      stateEntityId: U(o, s, e, i, r),
      floorId: s.floor_id,
      floorName: (d == null ? void 0 : d.name) ?? "Weitere Räume",
      floorIcon: (d == null ? void 0 : d.icon) ?? "mdi:home-floor-0",
      sortIndex: s.floor_id ? l.get(s.floor_id) ?? n.length : n.length
    };
  });
}
function O(t, n) {
  const e = /* @__PURE__ */ new Map();
  for (const i of t) {
    const r = i.floorName ?? "Weitere Räume";
    e.set(r, [...e.get(r) ?? [], i]);
  }
  return Array.from(e.entries()).sort(([, i], [, r]) => {
    const o = i[0], a = r[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((a == null ? void 0 : a.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((a == null ? void 0 : a.floorName) ?? "");
  }).flatMap(([i, r]) => {
    var o;
    return [
      {
        type: "heading",
        heading: i,
        heading_style: "title",
        icon: ((o = r[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      ...r.slice().sort((a, c) => a.title.localeCompare(c.title)).map((a) => P(a, n))
    ];
  });
}
function P(t, n) {
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
      navigation_path: I(n, t.path)
    }
  };
  return t.stateEntityId && (e.entity = t.stateEntityId), e;
}
function L(t, n, e, i) {
  const r = n.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? y(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: ie(t, e.lights),
      path: i.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: ne(t, e.climate),
      path: i.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: re(t, e.security),
      path: i.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: oe(t, e.media),
      path: i.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function K(t, n) {
  return {
    type: "entities",
    show_header_toggle: !1,
    entities: t.map((e) => ({
      type: "button",
      name: `${e.title} ${e.subtitle}`,
      icon: e.icon,
      tap_action: e.path ? {
        action: "navigate",
        navigation_path: I(n, e.path)
      } : {
        action: "none"
      }
    }))
  };
}
function U(t, n, e, i, r) {
  return $({ area: n, devices: e, entities: i, entity_filter: r }).find((o) => {
    const a = t.states[o];
    return o.startsWith("sensor.") && (a == null ? void 0 : a.attributes.device_class) === "temperature" && Number.isFinite(C(t, o));
  });
}
function Y(t, n, e, i, r, o, a) {
  const c = z(e, i, r, o), l = {};
  return { views: V.map((m) => {
    const d = v(m.path, a);
    return l[m.key] = d, {
      title: S(m.key),
      path: d,
      icon: m.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: n[m.key].length > 0 ? q(t, { ...m, title: S(m.key) }, n[m.key], c) : [
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
function q(t, n, e, i) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const a of e) {
    const c = i.get(a) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, l = r.get(c.floorName) ?? /* @__PURE__ */ new Map();
    l.set(c.areaName, [...l.get(c.areaName) ?? [], a]), r.set(c.floorName, l), o.set(c.floorName, c);
  }
  return Array.from(r.entries()).sort(([a], [c]) => {
    const l = o.get(a), s = o.get(c);
    return ((l == null ? void 0 : l.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || a.localeCompare(c);
  }).flatMap(([a, c]) => {
    const l = o.get(a), s = [
      {
        type: "heading",
        heading: a,
        heading_style: "title",
        icon: (l == null ? void 0 : l.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, d] of Array.from(c.entries()).sort(([h], [p]) => h.localeCompare(p)))
      s.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), s.push(...M(t, d));
    return [
      {
        type: "grid",
        cards: s
      }
    ];
  });
}
function z(t, n, e, i) {
  const r = new Map(n.map((l) => [l.area_id, l])), o = new Map(e.map((l) => [l.id, l])), a = new Map(i.map((l) => [l.floor_id, l])), c = new Map(
    i.slice().sort(x).map((l, s) => [l.floor_id, s])
  );
  return new Map(
    t.map((l) => {
      const s = l.device_id ? o.get(l.device_id) : void 0, m = l.area_id ?? (s == null ? void 0 : s.area_id) ?? void 0, d = m ? r.get(m) : void 0, h = (d == null ? void 0 : d.floor_id) ?? (s == null ? void 0 : s.floor_id) ?? void 0, p = h ? a.get(h) : void 0;
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
function S(t) {
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
function j(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const i = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(i) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function I(t, n) {
  const e = t.replace(/\/+$/g, ""), i = n.replace(/^\/+/g, "");
  return `${e}/${i}`;
}
function X(t) {
  var e;
  const n = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && n.push(J(t.shopping));
  for (const i of t.categories ?? [])
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
function J(t = {}) {
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
function Q(t, n, e) {
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
  const i = R(t, e), r = [];
  for (const o of k) {
    const a = i[o.key];
    a.length !== 0 && r.push(Z(t, o, a));
  }
  return r;
}
function Z(t, n, e, i = !0) {
  const r = i ? [
    {
      type: "heading",
      heading: n.title,
      heading_style: "subtitle",
      icon: n.icon
    }
  ] : [];
  return r.push(...M(t, e)), {
    type: "grid",
    cards: r
  };
}
function M(t, n) {
  const e = n.filter(w), i = t ? n.filter((c) => ee(t, c)) : [], r = n.filter(
    (c) => !w(c) && !i.includes(c) && E(c)
  ), o = n.filter(
    (c) => !w(c) && !i.includes(c) && !E(c)
  ), a = [];
  for (const c of e)
    a.push({
      type: "picture-entity",
      entity: c,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  return i.length > 0 && a.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: i
  }), r.length > 0 && a.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: r.map((c) => ({
      type: "tile",
      entity: c
    }))
  }), o.length > 0 && a.push({
    type: "entities",
    show_header_toggle: !1,
    entities: o
  }), a;
}
function E(t) {
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
function w(t) {
  return t.split(".")[0] === "camera";
}
function ee(t, n) {
  var r;
  const e = n.split(".")[0] ?? "", i = String(((r = t.states[n]) == null ? void 0 : r.attributes.device_class) ?? "");
  return e === "sensor" && ["temperature", "humidity"].includes(i);
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
    e[te(t, i)].push(i);
  return e;
}
function te(t, n) {
  var r;
  const e = n.split(".")[0] ?? "", i = (r = t.states[n]) == null ? void 0 : r.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) || ["temperature", "humidity"].includes(String(i)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(i)) ? "sensors" : "other";
}
function ie(t, n) {
  const e = n.filter((i) => {
    var r;
    return ["on", "open", "opening"].includes(((r = t.states[i]) == null ? void 0 : r.state) ?? "");
  }).length;
  return e === 0 ? "Alle aus" : `${e} aktiv`;
}
function ne(t, n) {
  const e = n.map((r) => C(t, r)).filter((r) => Number.isFinite(r));
  return e.length === 0 ? "Keine Werte" : `${(e.reduce((r, o) => r + o, 0) / e.length).toFixed(1).replace(".", ",")}°`;
}
function re(t, n) {
  const e = n.filter(
    (i) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = t.states[i]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return e === 0 ? "Alles ruhig" : `${e} aktiv`;
}
function oe(t, n) {
  const e = n.filter((i) => {
    var r;
    return ((r = t.states[i]) == null ? void 0 : r.state) === "playing";
  }).length;
  return e === 0 ? "Keine Wiedergabe" : `${e} Wiedergabe`;
}
function C(t, n) {
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
function x(t, n) {
  return typeof t.level == "number" && typeof n.level == "number" && t.level !== n.level ? t.level - n.level : typeof t.level == "number" ? -1 : typeof n.level == "number" ? 1 : t.name.localeCompare(n.name);
}
function ae(t, n = []) {
  const e = new Set(n);
  return t.map((i) => {
    const r = y(i.path ?? i.title);
    return {
      ...i,
      path: v(r, e)
    };
  });
}
function v(t, n) {
  const e = n instanceof Set ? n : new Set(n.filter(Boolean)), i = y(t || "view") || "view";
  let r = i, o = 2;
  for (; e.has(r); )
    r = `${i}-${o}`, o += 1;
  return e.add(r), r;
}
function $(t) {
  const n = t.entity_filter ?? {
    hide_entity_categories: A
  }, e = new Set(
    t.devices.filter((i) => i.area_id === t.area.area_id).map((i) => i.id)
  );
  return T(t.entities, n).filter(
    (i) => i.area_id === t.area.area_id || !i.area_id && i.device_id !== null && i.device_id !== void 0 && e.has(i.device_id)
  ).map((i) => i.entity_id);
}
function T(t, n) {
  const e = new Set(n.hide_entity_categories);
  return t.filter((i) => !i.hidden_by && !i.disabled_by).filter((i) => !i.entity_category || !e.has(i.entity_category));
}
function se(t) {
  var e;
  const n = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(n) ? n : A
  };
}
function N(t, n) {
  var e;
  return ((e = t.states[n]) == null ? void 0 : e.attributes.friendly_name) ?? n;
}
function y(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function ce() {
  customElements.define(`ll-strategy-dashboard-${g}`, W), customElements.define(`ll-strategy-view-${g}`, D), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: g,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${F}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
ce();
//# sourceMappingURL=HAStrategy.js.map
