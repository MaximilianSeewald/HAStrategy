const h = "max-home-dashboard", k = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], T = k.filter((t) => t.path), A = ["config", "diagnostic"];
class F extends HTMLElement {
  static getCreateSuggestions(i) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(i, e) {
    const [n, r, o] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = ee(i), d = n.filter((a) => a.area_id && a.name).sort((a, g) => a.name.localeCompare(g.name)), c = U(i), m = /* @__PURE__ */ new Set(["dashboard", ...c.map((a) => a.path).filter(Boolean)]), u = H(d, s, r, o, l, e, m), I = M(o, l).map((a) => a.entity_id).filter((a) => e.states[a]), v = x(e, I), y = K(v, m), R = G([
      "dashboard",
      ...c.map((a) => a.path).filter((a) => !!a),
      ...y.views.map((a) => a.path).filter((a) => !!a),
      ...u.map((a) => a.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        B(e, u, c, v, y.pathByKey, R),
        ...c,
        ...y.views,
        ...d.map((a, g) => {
          const f = u[g];
          return {
            title: a.name,
            path: (f == null ? void 0 : f.path) ?? p(a.name || a.area_id),
            icon: a.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${h}`,
              area: a,
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
class D extends HTMLElement {
  static async generate(i, e) {
    const n = N(i).filter((r) => e.states[r]).sort((r, o) => S(e, r).localeCompare(S(e, o)));
    return {
      sections: Y(e, i.area, n)
    };
  }
}
function B(t, i, e, n, r, o) {
  const s = t.config.location_name ?? "Home", l = V(i, o), d = P(t, e, n, r);
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
          ...d.map((c) => W(c, o))
        ]
      }
    ].filter((c) => c.cards.length > 0)
  };
}
function H(t, i, e, n, r, o, s) {
  const l = new Map(i.map((c) => [c.floor_id, c])), d = new Map(
    i.slice().sort(X).map((c, m) => [c.floor_id, m])
  );
  return t.map((c) => {
    const m = b(p(c.name || c.area_id), s), u = c.floor_id ? l.get(c.floor_id) : void 0;
    return {
      title: c.name,
      path: m,
      icon: c.icon ?? "mdi:floor-plan",
      subtitle: L(o, c, e, n, r),
      floorId: c.floor_id,
      floorName: (u == null ? void 0 : u.name) ?? "Weitere Räume",
      floorIcon: (u == null ? void 0 : u.icon) ?? "mdi:home-floor-0",
      sortIndex: c.floor_id ? d.get(c.floor_id) ?? i.length : i.length
    };
  });
}
function V(t, i) {
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const r = n.floorName ?? "Weitere Räume";
    e.set(r, [...e.get(r) ?? [], n]);
  }
  return Array.from(e.entries()).sort(([, n], [, r]) => {
    const o = n[0], s = r[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((s == null ? void 0 : s.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((s == null ? void 0 : s.floorName) ?? "");
  }).flatMap(([n, r]) => {
    var o;
    return [
      {
        type: "heading",
        heading: n,
        heading_style: "subtitle",
        icon: ((o = r[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      ...r.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => ({
        type: "button",
        name: s.subtitle ? `${s.title}
${s.subtitle}` : s.title,
        icon: s.icon,
        icon_height: "28px",
        show_icon: !0,
        show_name: !0,
        grid_options: {
          columns: 4,
          rows: 2
        },
        tap_action: {
          action: "navigate",
          navigation_path: E(i, s.path)
        }
      }))
    ];
  });
}
function P(t, i, e, n) {
  const r = i.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? p(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: z(t, e.lights),
      path: n.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: j(t, e.climate),
      path: n.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: J(t, e.security),
      path: n.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: Q(t, e.media),
      path: n.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function W(t, i) {
  return {
    type: "button",
    name: `${t.title}
${t.subtitle}`,
    icon: t.icon,
    icon_height: "22px",
    show_icon: !0,
    show_name: !0,
    grid_options: {
      columns: "full",
      rows: 1
    },
    tap_action: t.path ? {
      action: "navigate",
      navigation_path: E(i, t.path)
    } : {
      action: "none"
    }
  };
}
function L(t, i, e, n, r) {
  const o = N({ area: i, devices: e, entities: n, entity_filter: r }).map((l) => C(t, l)).filter((l) => Number.isFinite(l));
  return o.length === 0 ? void 0 : `${(o.reduce((l, d) => l + d, 0) / o.length).toFixed(1).replace(".", ",")} °C`;
}
function K(t, i) {
  const e = {};
  return { views: T.map((r) => {
    const o = b(r.path, i);
    return e[r.key] = o, {
      title: _(r.key),
      path: o,
      icon: r.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: t[r.key].length > 0 ? [$({ ...r, title: _(r.key) }, t[r.key])] : [
        {
          type: "grid",
          cards: [
            {
              type: "heading",
              heading: _(r.key),
              heading_style: "title",
              icon: r.icon
            },
            {
              type: "markdown",
              content: "Keine sichtbaren Entitäten in dieser Kategorie."
            }
          ]
        }
      ]
    };
  }), pathByKey: e };
}
function _(t) {
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
function G(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const n = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(n) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function E(t, i) {
  const e = t.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${e}/${n}`;
}
function U(t) {
  var e;
  const i = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && i.push(O(t.shopping));
  for (const n of t.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || i.push({
      title: n.title,
      path: n.path ?? p(n.id),
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
  return Z(i, ["dashboard"]);
}
function O(t = {}) {
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
function Y(t, i, e) {
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
  const n = x(t, e), r = [
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
  for (const o of k) {
    const s = n[o.key];
    s.length !== 0 && r.push($(o, s));
  }
  return r;
}
function $(t, i) {
  const e = i.filter(w), n = i.filter((o) => !w(o)), r = [
    {
      type: "heading",
      heading: t.title,
      heading_style: "subtitle",
      icon: t.icon
    }
  ];
  return e.length > 0 && r.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: e.map((o) => ({
      type: "tile",
      entity: o
    }))
  }), n.length > 0 && r.push({
    type: "entities",
    show_header_toggle: !1,
    entities: n
  }), {
    type: "grid",
    cards: r
  };
}
function w(t) {
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
function x(t, i) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    e[q(t, n)].push(n);
  return e;
}
function q(t, i) {
  var r;
  const e = i.split(".")[0] ?? "", n = (r = t.states[i]) == null ? void 0 : r.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function z(t, i) {
  const e = i.filter((n) => {
    var r;
    return ["on", "open", "opening"].includes(((r = t.states[n]) == null ? void 0 : r.state) ?? "");
  }).length;
  return e === 0 ? "Alle aus" : `${e} aktiv`;
}
function j(t, i) {
  const e = i.map((r) => C(t, r)).filter((r) => Number.isFinite(r));
  return e.length === 0 ? "Keine Werte" : `${(e.reduce((r, o) => r + o, 0) / e.length).toFixed(1).replace(".", ",")}°`;
}
function J(t, i) {
  const e = i.filter(
    (n) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = t.states[n]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return e === 0 ? "Alles ruhig" : `${e} aktiv`;
}
function Q(t, i) {
  const e = i.filter((n) => {
    var r;
    return ((r = t.states[n]) == null ? void 0 : r.state) === "playing";
  }).length;
  return e === 0 ? "Keine Wiedergabe" : `${e} Wiedergabe`;
}
function C(t, i) {
  const e = t.states[i], n = ["current_temperature", "temperature"];
  for (const r of n) {
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
function X(t, i) {
  return typeof t.level == "number" && typeof i.level == "number" && t.level !== i.level ? t.level - i.level : typeof t.level == "number" ? -1 : typeof i.level == "number" ? 1 : t.name.localeCompare(i.name);
}
function Z(t, i = []) {
  const e = new Set(i);
  return t.map((n) => {
    const r = p(n.path ?? n.title);
    return {
      ...n,
      path: b(r, e)
    };
  });
}
function b(t, i) {
  const e = i instanceof Set ? i : new Set(i.filter(Boolean)), n = p(t || "view") || "view";
  let r = n, o = 2;
  for (; e.has(r); )
    r = `${n}-${o}`, o += 1;
  return e.add(r), r;
}
function N(t) {
  const i = t.entity_filter ?? {
    hide_entity_categories: A
  }, e = new Set(
    t.devices.filter((n) => n.area_id === t.area.area_id).map((n) => n.id)
  );
  return M(t.entities, i).filter(
    (n) => n.area_id === t.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && e.has(n.device_id)
  ).map((n) => n.entity_id);
}
function M(t, i) {
  const e = new Set(i.hide_entity_categories);
  return t.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !e.has(n.entity_category));
}
function ee(t) {
  var e;
  const i = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : A
  };
}
function S(t, i) {
  var e;
  return ((e = t.states[i]) == null ? void 0 : e.attributes.friendly_name) ?? i;
}
function p(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function te() {
  customElements.define(`ll-strategy-dashboard-${h}`, F), customElements.define(`ll-strategy-view-${h}`, D), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: h,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
te();
//# sourceMappingURL=HAStrategy.js.map
