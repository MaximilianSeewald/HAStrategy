const y = "max-home-dashboard", k = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], F = k.filter((e) => e.path), A = ["config", "diagnostic"];
class D extends HTMLElement {
  static getCreateSuggestions(n) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(n, t) {
    const [i, r, o] = await Promise.all([
      t.callWS({ type: "config/area_registry/list" }),
      t.callWS({ type: "config/device_registry/list" }),
      t.callWS({ type: "config/entity_registry/list" })
    ]), c = await t.callWS({ type: "config/floor_registry/list" }).catch(() => []), a = ae(n), l = i.filter((u) => u.area_id && u.name).sort((u, _) => u.name.localeCompare(_.name)), s = j(n), m = /* @__PURE__ */ new Set(["dashboard", ...s.map((u) => u.path).filter(Boolean)]), d = V(l, c, r, o, a, t, m), h = T(o, a).map((u) => u.entity_id).filter((u) => t.states[u]), p = C(t, h), f = U(t, p, o, l, r, c, m), B = q([
      "dashboard",
      ...s.map((u) => u.path).filter((u) => !!u),
      ...f.views.map((u) => u.path).filter((u) => !!u),
      ...d.map((u) => u.path)
    ]);
    return {
      title: n.title ?? "Max Home",
      views: [
        W(t, d, s, p, f.pathByKey, B),
        ...s,
        ...f.views,
        ...l.map((u, _) => {
          const b = d[_];
          return {
            title: u.name,
            path: (b == null ? void 0 : b.path) ?? g(u.name || u.area_id),
            icon: u.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${y}`,
              area: u,
              devices: r,
              entities: o,
              entity_filter: a
            }
          };
        })
      ]
    };
  }
}
class H extends HTMLElement {
  static async generate(n, t) {
    const i = $(n).filter((r) => t.states[r]).sort((r, o) => N(t, r).localeCompare(N(t, o)));
    return {
      sections: J(t, n.area, i)
    };
  }
}
function W(e, n, t, i, r, o) {
  const c = e.config.location_name ?? "Home", a = P(n, o), l = L(e, t, i, r);
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
            heading: `Willkommen ${c}`,
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
          ...l.map((s) => O(s, o))
        ]
      }
    ].filter((s) => s.cards.length > 0)
  };
}
function V(e, n, t, i, r, o, c) {
  const a = new Map(n.map((s) => [s.floor_id, s])), l = new Map(
    n.slice().sort(R).map((s, m) => [s.floor_id, m])
  );
  return e.map((s) => {
    const m = v(g(s.name || s.area_id), c), d = s.floor_id ? a.get(s.floor_id) : void 0;
    return {
      title: s.name,
      path: m,
      icon: s.icon ?? "mdi:floor-plan",
      subtitle: K(o, s, t, i, r),
      floorId: s.floor_id,
      floorName: (d == null ? void 0 : d.name) ?? "Weitere Räume",
      floorIcon: (d == null ? void 0 : d.icon) ?? "mdi:home-floor-0",
      sortIndex: s.floor_id ? l.get(s.floor_id) ?? n.length : n.length
    };
  });
}
function P(e, n) {
  const t = /* @__PURE__ */ new Map();
  for (const i of e) {
    const r = i.floorName ?? "Weitere Räume";
    t.set(r, [...t.get(r) ?? [], i]);
  }
  return Array.from(t.entries()).sort(([, i], [, r]) => {
    const o = i[0], c = r[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((c == null ? void 0 : c.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((c == null ? void 0 : c.floorName) ?? "");
  }).flatMap(([i, r]) => {
    var o;
    return [
      {
        type: "heading",
        heading: i,
        heading_style: "subtitle",
        icon: ((o = r[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      ...r.slice().sort((c, a) => c.title.localeCompare(a.title)).map((c) => G(c, n))
    ];
  });
}
function G(e, n) {
  return {
    type: "button",
    name: e.subtitle ? `${e.title}
${e.subtitle}` : e.title,
    icon: e.icon,
    icon_height: "24px",
    show_icon: !0,
    show_name: !0,
    card_mod: {
      style: `
        ha-card {
          --ha-card-border-radius: 8px;
        }
        #img-cell {
          margin-bottom: 14px;
        }
        #name {
          font-size: 12px;
          line-height: 1.25;
          white-space: pre-line;
        }
      `
    },
    grid_options: {
      columns: 4,
      rows: 2
    },
    tap_action: {
      action: "navigate",
      navigation_path: x(n, e.path)
    }
  };
}
function L(e, n, t, i) {
  const r = n.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? g(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: te(e, t.lights),
      path: i.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: ie(e, t.climate),
      path: i.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: ne(e, t.security),
      path: i.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: re(e, t.media),
      path: i.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function O(e, n) {
  return {
    type: "button",
    name: `${e.title}
${e.subtitle}`,
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
      navigation_path: x(n, e.path)
    } : {
      action: "none"
    }
  };
}
function K(e, n, t, i, r) {
  const o = $({ area: n, devices: t, entities: i, entity_filter: r }).map((a) => I(e, a)).filter((a) => Number.isFinite(a));
  return o.length === 0 ? void 0 : `${(o.reduce((a, l) => a + l, 0) / o.length).toFixed(1).replace(".", ",")} °C`;
}
function U(e, n, t, i, r, o, c) {
  const a = z(t, i, r, o), l = {};
  return { views: F.map((m) => {
    const d = v(m.path, c);
    return l[m.key] = d, {
      title: S(m.key),
      path: d,
      icon: m.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: n[m.key].length > 0 ? Y(e, { ...m, title: S(m.key) }, n[m.key], a) : [
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
function Y(e, n, t, i) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const c of t) {
    const a = i.get(c) ?? {
      areaName: "Ohne Raum",
      floorName: "Weitere Räume",
      floorIcon: "mdi:home-floor-0",
      sortIndex: Number.MAX_SAFE_INTEGER
    }, l = r.get(a.floorName) ?? /* @__PURE__ */ new Map();
    l.set(a.areaName, [...l.get(a.areaName) ?? [], c]), r.set(a.floorName, l), o.set(a.floorName, a);
  }
  return Array.from(r.entries()).sort(([c], [a]) => {
    const l = o.get(c), s = o.get(a);
    return ((l == null ? void 0 : l.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || c.localeCompare(a);
  }).flatMap(([c, a]) => {
    const l = o.get(c), s = [
      {
        type: "heading",
        heading: c,
        heading_style: "subtitle",
        icon: (l == null ? void 0 : l.floorIcon) ?? "mdi:home-floor-0"
      }
    ];
    for (const [m, d] of Array.from(a.entries()).sort(([h], [p]) => h.localeCompare(p)))
      s.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), s.push(...M(e, d));
    return [
      {
        type: "grid",
        cards: s
      }
    ];
  });
}
function z(e, n, t, i) {
  const r = new Map(n.map((l) => [l.area_id, l])), o = new Map(t.map((l) => [l.id, l])), c = new Map(i.map((l) => [l.floor_id, l])), a = new Map(
    i.slice().sort(R).map((l, s) => [l.floor_id, s])
  );
  return new Map(
    e.map((l) => {
      const s = l.device_id ? o.get(l.device_id) : void 0, m = l.area_id ?? (s == null ? void 0 : s.area_id) ?? void 0, d = m ? r.get(m) : void 0, h = (d == null ? void 0 : d.floor_id) ?? (s == null ? void 0 : s.floor_id) ?? void 0, p = h ? c.get(h) : void 0;
      return [
        l.entity_id,
        {
          areaName: (d == null ? void 0 : d.name) ?? "Ohne Raum",
          floorName: (p == null ? void 0 : p.name) ?? "Weitere Räume",
          floorIcon: (p == null ? void 0 : p.icon) ?? "mdi:home-floor-0",
          sortIndex: h ? a.get(h) ?? i.length : i.length
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
function q(e) {
  const t = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (t.length === 0)
    return "";
  const i = decodeURIComponent(t[t.length - 1] ?? "");
  return e.includes(i) ? `/${t.slice(0, -1).join("/")}` : `/${t.join("/")}`;
}
function x(e, n) {
  const t = e.replace(/\/+$/g, ""), i = n.replace(/^\/+/g, "");
  return `${t}/${i}`;
}
function j(e) {
  var t;
  const n = [];
  ((t = e.shopping) == null ? void 0 : t.enabled) !== !1 && n.push(X(e.shopping));
  for (const i of e.categories ?? [])
    !i.id || !i.title || !Array.isArray(i.cards) || n.push({
      title: i.title,
      path: i.path ?? g(i.id),
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
  return oe(n, ["dashboard"]);
}
function X(e = {}) {
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
function J(e, n, t) {
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
  const i = C(e, t), r = [];
  for (const o of k) {
    const c = i[o.key];
    c.length !== 0 && r.push(Q(e, o, c));
  }
  return r;
}
function Q(e, n, t, i = !0) {
  const r = i ? [
    {
      type: "heading",
      heading: n.title,
      heading_style: "subtitle",
      icon: n.icon
    }
  ] : [];
  return r.push(...M(e, t)), {
    type: "grid",
    cards: r
  };
}
function M(e, n) {
  const t = n.filter(w), i = e ? n.filter((a) => Z(e, a)) : [], r = n.filter(
    (a) => !w(a) && !i.includes(a) && E(a)
  ), o = n.filter(
    (a) => !w(a) && !i.includes(a) && !E(a)
  ), c = [];
  for (const a of t)
    c.push({
      type: "picture-entity",
      entity: a,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  return i.length > 0 && c.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: i
  }), r.length > 0 && c.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: r.map((a) => ({
      type: "tile",
      entity: a
    }))
  }), o.length > 0 && c.push({
    type: "entities",
    show_header_toggle: !1,
    entities: o
  }), c;
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
function Z(e, n) {
  var r;
  const t = n.split(".")[0] ?? "", i = String(((r = e.states[n]) == null ? void 0 : r.attributes.device_class) ?? "");
  return t === "sensor" && ["temperature", "humidity"].includes(i);
}
function C(e, n) {
  const t = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const i of n)
    t[ee(e, i)].push(i);
  return t;
}
function ee(e, n) {
  var r;
  const t = n.split(".")[0] ?? "", i = (r = e.states[n]) == null ? void 0 : r.attributes.device_class;
  return t === "light" || t === "switch" || t === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(t) || ["temperature", "humidity"].includes(String(i)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(t) ? "security" : ["media_player", "remote", "vacuum"].includes(t) ? "media" : t === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(i)) ? "sensors" : "other";
}
function te(e, n) {
  const t = n.filter((i) => {
    var r;
    return ["on", "open", "opening"].includes(((r = e.states[i]) == null ? void 0 : r.state) ?? "");
  }).length;
  return t === 0 ? "Alle aus" : `${t} aktiv`;
}
function ie(e, n) {
  const t = n.map((r) => I(e, r)).filter((r) => Number.isFinite(r));
  return t.length === 0 ? "Keine Werte" : `${(t.reduce((r, o) => r + o, 0) / t.length).toFixed(1).replace(".", ",")}°`;
}
function ne(e, n) {
  const t = n.filter(
    (i) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = e.states[i]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return t === 0 ? "Alles ruhig" : `${t} aktiv`;
}
function re(e, n) {
  const t = n.filter((i) => {
    var r;
    return ((r = e.states[i]) == null ? void 0 : r.state) === "playing";
  }).length;
  return t === 0 ? "Keine Wiedergabe" : `${t} Wiedergabe`;
}
function I(e, n) {
  const t = e.states[n], i = ["current_temperature", "temperature"];
  for (const r of i) {
    const o = t == null ? void 0 : t.attributes[r];
    if (typeof o == "number")
      return o;
  }
  if ((t == null ? void 0 : t.attributes.device_class) === "temperature") {
    const r = Number.parseFloat(t.state);
    if (Number.isFinite(r))
      return r;
  }
}
function R(e, n) {
  return typeof e.level == "number" && typeof n.level == "number" && e.level !== n.level ? e.level - n.level : typeof e.level == "number" ? -1 : typeof n.level == "number" ? 1 : e.name.localeCompare(n.name);
}
function oe(e, n = []) {
  const t = new Set(n);
  return e.map((i) => {
    const r = g(i.path ?? i.title);
    return {
      ...i,
      path: v(r, t)
    };
  });
}
function v(e, n) {
  const t = n instanceof Set ? n : new Set(n.filter(Boolean)), i = g(e || "view") || "view";
  let r = i, o = 2;
  for (; t.has(r); )
    r = `${i}-${o}`, o += 1;
  return t.add(r), r;
}
function $(e) {
  const n = e.entity_filter ?? {
    hide_entity_categories: A
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
function ae(e) {
  var t;
  const n = (t = e.entity_filter) == null ? void 0 : t.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(n) ? n : A
  };
}
function N(e, n) {
  var t;
  return ((t = e.states[n]) == null ? void 0 : t.attributes.friendly_name) ?? n;
}
function g(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function se() {
  customElements.define(`ll-strategy-dashboard-${y}`, D), customElements.define(`ll-strategy-view-${y}`, H), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: y,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
se();
//# sourceMappingURL=HAStrategy.js.map
