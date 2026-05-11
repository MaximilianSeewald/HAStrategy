const d = "max-home-dashboard", f = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline" },
  { key: "media", title: "Media", icon: "mdi:speaker" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
];
class w extends HTMLElement {
  static getCreateSuggestions(t) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(t, e) {
    const [n, a, s] = await Promise.all([
      e.callWS({ type: "config/area_registry/list" }),
      e.callWS({ type: "config/device_registry/list" }),
      e.callWS({ type: "config/entity_registry/list" })
    ]), c = n.filter((o) => o.area_id && o.name).sort((o, l) => o.name.localeCompare(l.name)), u = b(t), _ = new Set(u.map((o) => o.path).filter(Boolean)), p = c.map((o) => {
      const l = y(r(o.name || o.area_id), _);
      return {
        title: o.name,
        path: l,
        icon: o.icon ?? "mdi:floor-plan"
      };
    });
    return {
      title: t.title ?? "Max Home",
      views: [
        v(e, p, u),
        ...u,
        ...c.map((o, l) => {
          const m = p[l];
          return {
            title: o.name,
            path: (m == null ? void 0 : m.path) ?? r(o.name || o.area_id),
            icon: o.icon ?? void 0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${d}`,
              area: o,
              devices: a,
              entities: s
            }
          };
        })
      ]
    };
  }
}
class S extends HTMLElement {
  static async generate(t, e) {
    const n = C(t).filter((a) => e.states[a]).sort((a, s) => g(e, a).localeCompare(g(e, s)));
    return {
      sections: x(e, t.area, n)
    };
  }
}
function v(i, t, e) {
  const n = i.config.location_name ?? "Home", a = e.map((s) => ({
    title: s.title,
    path: s.path ?? r(s.title),
    icon: s.icon ?? "mdi:shape-outline"
  }));
  return {
    title: "Home",
    path: "home",
    icon: "mdi:home-variant-outline",
    type: "sections",
    max_columns: 3,
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: n,
            heading_style: "title",
            icon: "mdi:home-heart"
          }
        ]
      },
      h("Categories", a, "mdi:shape-outline"),
      h("Rooms", t, "mdi:floor-plan")
    ].filter((s) => s.cards.length > 0)
  };
}
function b(i) {
  var e;
  const t = [];
  ((e = i.shopping) == null ? void 0 : e.enabled) !== !1 && t.push(k(i.shopping));
  for (const n of i.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || t.push({
      title: n.title,
      path: n.path ?? r(n.id),
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
  return A(t);
}
function k(i = {}) {
  const t = {
    type: "custom:ktor-shopping-list-card",
    title: "Shopping List",
    addon_slug: i.addon_slug ?? "ktor_app",
    show_completed: i.show_completed ?? !0
  };
  return i.backend_url && (delete t.addon_slug, t.backend_url = i.backend_url), {
    title: i.title ?? "Shopping",
    path: i.path ?? "shopping",
    icon: i.icon ?? "mdi:cart-outline",
    type: "sections",
    max_columns: 2,
    sections: [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: i.title ?? "Shopping",
            heading_style: "title",
            icon: i.icon ?? "mdi:cart-outline"
          },
          t
        ]
      }
    ]
  };
}
function h(i, t, e) {
  return t.length === 0 ? {
    type: "grid",
    cards: []
  } : {
    type: "grid",
    cards: [
      {
        type: "heading",
        heading: i,
        heading_style: "subtitle",
        icon: e
      },
      {
        type: "grid",
        columns: 2,
        square: !1,
        cards: t.map((n) => ({
          type: "tile",
          name: n.title,
          icon: n.icon || e,
          color: "primary",
          tap_action: {
            action: "navigate",
            navigation_path: `/${n.path}`
          }
        }))
      }
    ]
  };
}
function x(i, t, e) {
  if (e.length === 0)
    return [
      {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: t.name,
            heading_style: "title",
            icon: t.icon ?? "mdi:floor-plan"
          },
          {
            type: "markdown",
            content: "No visible entities are assigned to this room yet."
          }
        ]
      }
    ];
  const n = E(i, e), a = [
    {
      type: "grid",
      cards: [
        {
          type: "heading",
          heading: t.name,
          heading_style: "title",
          icon: t.icon ?? "mdi:floor-plan"
        }
      ]
    }
  ];
  for (const s of f) {
    const c = n[s.key];
    c.length !== 0 && a.push({
      type: "grid",
      cards: [
        {
          type: "entities",
          title: s.title,
          icon: s.icon,
          show_header_toggle: !1,
          entities: c
        }
      ]
    });
  }
  return a;
}
function E(i, t) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of t)
    e[H(i, n)].push(n);
  return e;
}
function H(i, t) {
  var a;
  const e = t.split(".")[0] ?? "", n = (a = i.states[t]) == null ? void 0 : a.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function A(i) {
  const t = /* @__PURE__ */ new Set();
  return i.map((e) => {
    const n = r(e.path ?? e.title);
    return {
      ...e,
      path: y(n, t)
    };
  });
}
function y(i, t) {
  const e = t instanceof Set ? t : new Set(t.filter(Boolean)), n = r(i || "view") || "view";
  let a = n, s = 2;
  for (; e.has(a); )
    a = `${n}-${s}`, s += 1;
  return e.add(a), a;
}
function C(i) {
  const t = new Set(
    i.devices.filter((e) => e.area_id === i.area.area_id).map((e) => e.id)
  );
  return i.entities.filter((e) => !e.hidden_by && !e.disabled_by).filter(
    (e) => e.area_id === i.area.area_id || !e.area_id && e.device_id !== null && e.device_id !== void 0 && t.has(e.device_id)
  ).map((e) => e.entity_id);
}
function g(i, t) {
  var e;
  return ((e = i.states[t]) == null ? void 0 : e.attributes.friendly_name) ?? t;
}
function r(i) {
  return i.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function M() {
  customElements.define(`ll-strategy-dashboard-${d}`, w), customElements.define(`ll-strategy-view-${d}`, S), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: d,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
M();
//# sourceMappingURL=HAStrategy.js.map
