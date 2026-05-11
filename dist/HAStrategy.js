const d = "max-home-dashboard", E = [
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
  static async generate(i, e) {
    const [n, o, r] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), a = K(i), u = n.filter((c) => c.area_id && c.name).sort((c, p) => c.name.localeCompare(p.name)), m = M(i), S = /* @__PURE__ */ new Set(["dashboard", ...m.map((c) => c.path).filter(Boolean)]), g = N(u, s, S);
    return {
      title: i.title ?? "Max Home",
      views: [
        A(e, g, m, r, a),
        ...m,
        ...u.map((c, p) => {
          const h = g[p];
          return {
            title: c.name,
            path: (h == null ? void 0 : h.path) ?? l(c.name || c.area_id),
            icon: c.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${d}`,
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
  static async generate(i, e) {
    const n = B(i).filter((o) => e.states[o]).sort((o, r) => f(e, o).localeCompare(f(e, r)));
    return {
      sections: F(e, i.area, n)
    };
  }
}
function A(t, i, e, n, o) {
  const r = t.config.location_name ?? "Home", s = x(i), a = I(t, e, n, o);
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
            cards: a.map($)
          }
        ]
      }
    ].filter((u) => u.cards.length > 0)
  };
}
function N(t, i, e) {
  const n = new Map(i.map((r) => [r.floor_id, r])), o = new Map(
    i.slice().sort(q).map((r, s) => [r.floor_id, s])
  );
  return t.map((r) => {
    const s = v(l(r.name || r.area_id), e), a = r.floor_id ? n.get(r.floor_id) : void 0;
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
function x(t) {
  const i = /* @__PURE__ */ new Map();
  for (const e of t) {
    const n = e.floorName ?? "Weitere Räume";
    i.set(n, [...i.get(n) ?? [], e]);
  }
  return Array.from(i.entries()).sort(([, e], [, n]) => {
    const o = e[0], r = n[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((r == null ? void 0 : r.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((r == null ? void 0 : r.floorName) ?? "");
  }).flatMap(([e, n]) => {
    var o;
    return [
      {
        type: "heading",
        heading: e,
        heading_style: "subtitle",
        icon: ((o = n[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      {
        type: "grid",
        columns: 3,
        square: !1,
        cards: n.slice().sort((r, s) => r.title.localeCompare(s.title)).map((r) => ({
          type: "button",
          name: r.title,
          icon: r.icon,
          tap_action: {
            action: "navigate",
            navigation_path: `/${r.path}`
          }
        }))
      }
    ];
  });
}
function I(t, i, e, n) {
  const o = w(e, n).map((a) => a.entity_id).filter((a) => t.states[a]), r = b(t, o), s = i.map((a) => ({
    title: a.title,
    subtitle: "Öffnen",
    path: a.path ?? l(a.title),
    icon: a.icon ?? "mdi:shape-outline",
    color: a.title.toLowerCase() === "shopping" ? "green" : "primary"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: W(t, r.lights),
      icon: "mdi:lamps-outline",
      color: "amber"
    },
    {
      title: "Raumklima",
      subtitle: D(t, r.climate),
      icon: "mdi:home-thermometer-outline",
      color: "deep-orange"
    },
    {
      title: "Sicherheit",
      subtitle: L(t, r.security),
      icon: "mdi:shield-home-outline",
      color: "blue-grey"
    },
    {
      title: "Mediaplayer",
      subtitle: V(t, r.media),
      icon: "mdi:music-box-outline",
      color: "cyan"
    },
    ...s
  ];
}
function $(t) {
  return {
    type: "button",
    name: `${t.title}
${t.subtitle}`,
    icon: t.icon,
    show_icon: !0,
    show_name: !0,
    tap_action: t.path ? {
      action: "navigate",
      navigation_path: `/${t.path}`
    } : {
      action: "none"
    }
  };
}
function M(t) {
  var e;
  const i = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && i.push(T(t.shopping));
  for (const n of t.categories ?? [])
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
function T(t = {}) {
  const i = {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    addon_slug: t.addon_slug ?? "ktor_app",
    show_completed: t.show_completed ?? !0
  };
  return t.backend_url && (delete i.addon_slug, i.backend_url = t.backend_url), {
    title: t.title ?? "Shopping",
    path: t.path ?? "shopping",
    icon: t.icon ?? "mdi:cart-outline",
    panel: !0,
    cards: [i]
  };
}
function F(t, i, e) {
  if (e.length === 0)
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
  const n = b(t, e), o = [
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
function H(t, i) {
  const e = i.filter(y), n = i.filter((r) => !y(r)), o = [
    {
      type: "heading",
      heading: t.title,
      heading_style: "subtitle",
      icon: t.icon
    }
  ];
  return e.length > 0 && o.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: e.map((r) => ({
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
function y(t) {
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
function b(t, i) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    e[R(t, n)].push(n);
  return e;
}
function R(t, i) {
  var o;
  const e = i.split(".")[0] ?? "", n = (o = t.states[i]) == null ? void 0 : o.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function W(t, i) {
  const e = i.filter((n) => {
    var o;
    return ["on", "open", "opening"].includes(((o = t.states[n]) == null ? void 0 : o.state) ?? "");
  }).length;
  return e === 0 ? "Alle aus" : `${e} aktiv`;
}
function D(t, i) {
  const e = i.map((o) => P(t, o)).filter((o) => Number.isFinite(o));
  return e.length === 0 ? "Keine Werte" : `${(e.reduce((o, r) => o + r, 0) / e.length).toFixed(1).replace(".", ",")}°`;
}
function L(t, i) {
  const e = i.filter(
    (n) => {
      var o;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((o = t.states[n]) == null ? void 0 : o.state) ?? "");
    }
  ).length;
  return e === 0 ? "Alles ruhig" : `${e} aktiv`;
}
function V(t, i) {
  const e = i.filter((n) => {
    var o;
    return ((o = t.states[n]) == null ? void 0 : o.state) === "playing";
  }).length;
  return e === 0 ? "Keine Wiedergabe" : `${e} Wiedergabe`;
}
function P(t, i) {
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
function q(t, i) {
  return typeof t.level == "number" && typeof i.level == "number" && t.level !== i.level ? t.level - i.level : typeof t.level == "number" ? -1 : typeof i.level == "number" ? 1 : t.name.localeCompare(i.name);
}
function G(t, i = []) {
  const e = new Set(i);
  return t.map((n) => {
    const o = l(n.path ?? n.title);
    return {
      ...n,
      path: v(o, e)
    };
  });
}
function v(t, i) {
  const e = i instanceof Set ? i : new Set(i.filter(Boolean)), n = l(t || "view") || "view";
  let o = n, r = 2;
  for (; e.has(o); )
    o = `${n}-${r}`, r += 1;
  return e.add(o), o;
}
function B(t) {
  const i = t.entity_filter ?? {
    hide_entity_categories: _
  }, e = new Set(
    t.devices.filter((n) => n.area_id === t.area.area_id).map((n) => n.id)
  );
  return w(t.entities, i).filter(
    (n) => n.area_id === t.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && e.has(n.device_id)
  ).map((n) => n.entity_id);
}
function w(t, i) {
  const e = new Set(i.hide_entity_categories);
  return t.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !e.has(n.entity_category));
}
function K(t) {
  var e;
  const i = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : _
  };
}
function f(t, i) {
  var e;
  return ((e = t.states[i]) == null ? void 0 : e.attributes.friendly_name) ?? i;
}
function l(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function O() {
  customElements.define(`ll-strategy-dashboard-${d}`, k), customElements.define(`ll-strategy-view-${d}`, C), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: d,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
O();
//# sourceMappingURL=HAStrategy.js.map
