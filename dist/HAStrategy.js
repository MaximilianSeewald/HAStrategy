const u = "max-home-dashboard", E = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline" },
  { key: "media", title: "Media", icon: "mdi:speaker" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], _ = ["config", "diagnostic"];
class k extends HTMLElement {
  static getCreateSuggestions(i) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(i, t) {
    const [n, o, r] = await Promise.all([
      t.callWS({ type: "config/area_registry/list" }),
      t.callWS({ type: "config/device_registry/list" }),
      t.callWS({ type: "config/entity_registry/list" })
    ]), s = await t.callWS({ type: "config/floor_registry/list" }).catch(() => []), a = K(i), d = n.filter((c) => c.area_id && c.name).sort((c, p) => c.name.localeCompare(p.name)), m = T(i), S = /* @__PURE__ */ new Set(["dashboard", ...m.map((c) => c.path).filter(Boolean)]), g = x(d, s, S);
    return {
      title: i.title ?? "Max Home",
      views: [
        A(t, g, m, r, a),
        ...m,
        ...d.map((c, p) => {
          const h = g[p];
          return {
            title: c.name,
            path: (h == null ? void 0 : h.path) ?? l(c.name || c.area_id),
            icon: c.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${u}`,
              area: c,
              devices: o,
              entities: r,
              entity_filter: a
            }
          };
        })
      ]
    };
  }
}
class C extends HTMLElement {
  static async generate(i, t) {
    const n = B(i).filter((o) => t.states[o]).sort((o, r) => f(t, o).localeCompare(f(t, r)));
    return {
      sections: F(t, i.area, n)
    };
  }
}
function A(e, i, t, n, o) {
  const r = e.config.location_name ?? "Home", s = N(i), a = I(e, t, n, o);
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
          {
            type: "grid",
            columns: 1,
            square: !1,
            cards: a.map(M)
          }
        ]
      }
    ].filter((d) => d.cards.length > 0)
  };
}
function x(e, i, t) {
  const n = new Map(i.map((r) => [r.floor_id, r])), o = new Map(
    i.slice().sort(q).map((r, s) => [r.floor_id, s])
  );
  return e.map((r) => {
    const s = v(l(r.name || r.area_id), t), a = r.floor_id ? n.get(r.floor_id) : void 0;
    return {
      title: r.name,
      path: s,
      icon: r.icon ?? "mdi:floor-plan",
      floorId: r.floor_id,
      floorName: (a == null ? void 0 : a.name) ?? "Weitere Räume",
      floorIcon: (a == null ? void 0 : a.icon) ?? "mdi:home-floor-0",
      sortIndex: r.floor_id ? o.get(r.floor_id) ?? i.length : i.length
    };
  });
}
function N(e) {
  const i = /* @__PURE__ */ new Map();
  for (const t of e) {
    const n = t.floorName ?? "Weitere Räume";
    i.set(n, [...i.get(n) ?? [], t]);
  }
  return Array.from(i.entries()).sort(([, t], [, n]) => {
    const o = t[0], r = n[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((r == null ? void 0 : r.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((r == null ? void 0 : r.floorName) ?? "");
  }).flatMap(([t, n]) => {
    var o;
    return [
      {
        type: "heading",
        heading: t,
        heading_style: "subtitle",
        icon: ((o = n[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      {
        type: "grid",
        columns: 3,
        square: !1,
        cards: n.slice().sort((r, s) => r.title.localeCompare(s.title)).map((r) => ({
          type: "tile",
          name: r.title,
          icon: r.icon,
          color: "primary",
          tap_action: {
            action: "navigate",
            navigation_path: `/${r.path}`
          }
        }))
      }
    ];
  });
}
function I(e, i, t, n) {
  const o = w(t, n).map((a) => a.entity_id).filter((a) => e.states[a]), r = b(e, o), s = i.map((a) => ({
    title: a.title,
    subtitle: "Öffnen",
    path: a.path ?? l(a.title),
    icon: a.icon ?? "mdi:shape-outline",
    color: a.title.toLowerCase() === "shopping" ? "green" : "primary"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: W(e, r.lights),
      icon: "mdi:lamps-outline",
      color: "amber"
    },
    {
      title: "Raumklima",
      subtitle: D(e, r.climate),
      icon: "mdi:home-thermometer-outline",
      color: "deep-orange"
    },
    {
      title: "Sicherheit",
      subtitle: L(e, r.security),
      icon: "mdi:shield-home-outline",
      color: "blue-grey"
    },
    {
      title: "Mediaplayer",
      subtitle: V(e, r.media),
      icon: "mdi:music-box-outline",
      color: "cyan"
    },
    ...s
  ];
}
function M(e) {
  return {
    type: "tile",
    name: e.title,
    icon: e.icon,
    color: e.color,
    state_content: e.subtitle,
    tap_action: e.path ? {
      action: "navigate",
      navigation_path: `/${e.path}`
    } : {
      action: "none"
    }
  };
}
function T(e) {
  var t;
  const i = [];
  ((t = e.shopping) == null ? void 0 : t.enabled) !== !1 && i.push($(e.shopping));
  for (const n of e.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || i.push({
      title: n.title,
      path: n.path ?? l(n.id),
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
  return G(i, ["dashboard"]);
}
function $(e = {}) {
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
    type: "sections",
    max_columns: 2,
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: e.title ?? "Shopping",
            heading_style: "title",
            icon: e.icon ?? "mdi:cart-outline"
          },
          i
        ]
      }
    ]
  };
}
function F(e, i, t) {
  if (t.length === 0)
    return [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: i.name,
            heading_style: "title",
            icon: i.icon ?? "mdi:floor-plan"
          },
          {
            type: "markdown",
            content: "No visible entities are assigned to this room yet."
          }
        ]
      }
    ];
  const n = b(e, t), o = [
    {
      type: "grid",
      cards: [
        {
          type: "heading",
          heading: i.name,
          heading_style: "title",
          icon: i.icon ?? "mdi:floor-plan"
        }
      ]
    }
  ];
  for (const r of E) {
    const s = n[r.key];
    s.length !== 0 && o.push(H(r, s));
  }
  return o;
}
function H(e, i) {
  const t = i.filter(y), n = i.filter((r) => !y(r)), o = [
    {
      type: "heading",
      heading: e.title,
      heading_style: "subtitle",
      icon: e.icon
    }
  ];
  return t.length > 0 && o.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: t.map((r) => ({
      type: "tile",
      entity: r
    }))
  }), n.length > 0 && o.push({
    type: "entities",
    show_header_toggle: !1,
    entities: n
  }), {
    type: "grid",
    cards: o
  };
}
function y(e) {
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
function b(e, i) {
  const t = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    t[R(e, n)].push(n);
  return t;
}
function R(e, i) {
  var o;
  const t = i.split(".")[0] ?? "", n = (o = e.states[i]) == null ? void 0 : o.attributes.device_class;
  return t === "light" || t === "switch" || t === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(t) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(t) ? "security" : ["media_player", "remote", "vacuum"].includes(t) ? "media" : t === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function W(e, i) {
  const t = i.filter((n) => {
    var o;
    return ["on", "open", "opening"].includes(((o = e.states[n]) == null ? void 0 : o.state) ?? "");
  }).length;
  return t === 0 ? "Alle aus" : `${t} aktiv`;
}
function D(e, i) {
  const t = i.map((o) => P(e, o)).filter((o) => Number.isFinite(o));
  return t.length === 0 ? "Keine Werte" : `${(t.reduce((o, r) => o + r, 0) / t.length).toFixed(1).replace(".", ",")}°`;
}
function L(e, i) {
  const t = i.filter(
    (n) => {
      var o;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((o = e.states[n]) == null ? void 0 : o.state) ?? "");
    }
  ).length;
  return t === 0 ? "Alles ruhig" : `${t} aktiv`;
}
function V(e, i) {
  const t = i.filter((n) => {
    var o;
    return ((o = e.states[n]) == null ? void 0 : o.state) === "playing";
  }).length;
  return t === 0 ? "Keine Wiedergabe" : `${t} Wiedergabe`;
}
function P(e, i) {
  const t = e.states[i], n = ["current_temperature", "temperature"];
  for (const o of n) {
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
function q(e, i) {
  return typeof e.level == "number" && typeof i.level == "number" && e.level !== i.level ? e.level - i.level : typeof e.level == "number" ? -1 : typeof i.level == "number" ? 1 : e.name.localeCompare(i.name);
}
function G(e, i = []) {
  const t = new Set(i);
  return e.map((n) => {
    const o = l(n.path ?? n.title);
    return {
      ...n,
      path: v(o, t)
    };
  });
}
function v(e, i) {
  const t = i instanceof Set ? i : new Set(i.filter(Boolean)), n = l(e || "view") || "view";
  let o = n, r = 2;
  for (; t.has(o); )
    o = `${n}-${r}`, r += 1;
  return t.add(o), o;
}
function B(e) {
  const i = e.entity_filter ?? {
    hide_entity_categories: _
  }, t = new Set(
    e.devices.filter((n) => n.area_id === e.area.area_id).map((n) => n.id)
  );
  return w(e.entities, i).filter(
    (n) => n.area_id === e.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && t.has(n.device_id)
  ).map((n) => n.entity_id);
}
function w(e, i) {
  const t = new Set(i.hide_entity_categories);
  return e.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !t.has(n.entity_category));
}
function K(e) {
  var t;
  const i = (t = e.entity_filter) == null ? void 0 : t.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : _
  };
}
function f(e, i) {
  var t;
  return ((t = e.states[i]) == null ? void 0 : t.attributes.friendly_name) ?? i;
}
function l(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function O() {
  customElements.define(`ll-strategy-dashboard-${u}`, k), customElements.define(`ll-strategy-view-${u}`, C), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: u,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
O();
//# sourceMappingURL=HAStrategy.js.map
