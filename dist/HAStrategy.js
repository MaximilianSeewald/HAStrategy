const h = "max-home-dashboard", E = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], D = E.filter((e) => e.path), $ = ["config", "diagnostic"];
class B extends HTMLElement {
  static getCreateSuggestions(i) {
    return {
      title: "Max Home",
      icon: "mdi:home-assistant"
    };
  }
  static async generate(i, t) {
    const [n, r, o] = await Promise.all([
      t.callWS({ type: "config/area_registry/list" }),
      t.callWS({ type: "config/device_registry/list" }),
      t.callWS({ type: "config/entity_registry/list" })
    ]), s = await t.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = re(i), u = n.filter((c) => c.area_id && c.name).sort((c, y) => c.name.localeCompare(y.name)), a = Y(i), m = /* @__PURE__ */ new Set(["dashboard", ...a.map((c) => c.path).filter(Boolean)]), d = P(u, s, r, o, l, t, m), F = T(o, l).map((c) => c.entity_id).filter((c) => t.states[c]), w = N(t, F), g = z(t, w, m), H = O([
      "dashboard",
      ...a.map((c) => c.path).filter((c) => !!c),
      ...g.views.map((c) => c.path).filter((c) => !!c),
      ...d.map((c) => c.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        I(t, d, a, w, g.pathByKey, H),
        ...a,
        ...g.views,
        ...u.map((c, y) => {
          const f = d[y];
          return {
            title: c.name,
            path: (f == null ? void 0 : f.path) ?? p(c.name || c.area_id),
            icon: c.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${h}`,
              area: c,
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
class V extends HTMLElement {
  static async generate(i, t) {
    const n = M(i).filter((r) => t.states[r]).sort((r, o) => x(t, r).localeCompare(x(t, o)));
    return {
      sections: j(t, i.area, n)
    };
  }
}
function I(e, i, t, n, r, o) {
  const s = e.config.location_name ?? "Home", l = W(i, o), u = G(e, t, n, r);
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
          ...u.map((a) => K(a, o))
        ]
      }
    ].filter((a) => a.cards.length > 0)
  };
}
function P(e, i, t, n, r, o, s) {
  const l = new Map(i.map((a) => [a.floor_id, a])), u = new Map(
    i.slice().sort(ie).map((a, m) => [a.floor_id, m])
  );
  return e.map((a) => {
    const m = v(p(a.name || a.area_id), s), d = a.floor_id ? l.get(a.floor_id) : void 0;
    return {
      title: a.name,
      path: m,
      icon: a.icon ?? "mdi:floor-plan",
      subtitle: U(o, a, t, n, r),
      floorId: a.floor_id,
      floorName: (d == null ? void 0 : d.name) ?? "Weitere Räume",
      floorIcon: (d == null ? void 0 : d.icon) ?? "mdi:home-floor-0",
      sortIndex: a.floor_id ? u.get(a.floor_id) ?? i.length : i.length
    };
  });
}
function W(e, i) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.floorName ?? "Weitere Räume";
    t.set(r, [...t.get(r) ?? [], n]);
  }
  return Array.from(t.entries()).sort(([, n], [, r]) => {
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
      ...r.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => L(s, i))
    ];
  });
}
function L(e, i) {
  const t = e.subtitle ? `<div style="font-size: 12px; line-height: 1.2; margin-top: 4px;">${b(e.subtitle)}</div>` : "";
  return {
    type: "markdown",
    content: `<div style="text-align: center; min-height: 74px; display: flex; flex-direction: column; align-items: center; justify-content: center;"><ha-icon icon="${b(e.icon)}" style="--mdc-icon-size: 28px;"></ha-icon><div style="font-size: 13px; font-weight: 600; line-height: 1.2; margin-top: 8px;">${b(e.title)}</div>${t}</div>`,
    grid_options: {
      columns: 4,
      rows: 2
    },
    tap_action: {
      action: "navigate",
      navigation_path: A(i, e.path)
    }
  };
}
function G(e, i, t, n) {
  const r = i.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? p(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: X(e, t.lights),
      path: n.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: Z(e, t.climate),
      path: n.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: ee(e, t.security),
      path: n.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: te(e, t.media),
      path: n.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function K(e, i) {
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
      navigation_path: A(i, e.path)
    } : {
      action: "none"
    }
  };
}
function U(e, i, t, n, r) {
  const o = M({ area: i, devices: t, entities: n, entity_filter: r }).map((l) => R(e, l)).filter((l) => Number.isFinite(l));
  return o.length === 0 ? void 0 : `${(o.reduce((l, u) => l + u, 0) / o.length).toFixed(1).replace(".", ",")} °C`;
}
function z(e, i, t) {
  const n = {};
  return { views: D.map((o) => {
    const s = v(o.path, t);
    return n[o.key] = s, {
      title: S(o.key),
      path: s,
      icon: o.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: i[o.key].length > 0 ? [
        C(
          e,
          { ...o, title: S(o.key) },
          i[o.key],
          !1
        )
      ] : [
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
  }), pathByKey: n };
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
function O(e) {
  const t = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (t.length === 0)
    return "";
  const n = decodeURIComponent(t[t.length - 1] ?? "");
  return e.includes(n) ? `/${t.slice(0, -1).join("/")}` : `/${t.join("/")}`;
}
function A(e, i) {
  const t = e.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${t}/${n}`;
}
function Y(e) {
  var t;
  const i = [];
  ((t = e.shopping) == null ? void 0 : t.enabled) !== !1 && i.push(q(e.shopping));
  for (const n of e.categories ?? [])
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
  return ne(i, ["dashboard"]);
}
function q(e = {}) {
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
function j(e, i, t) {
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
  const n = N(e, t), r = [];
  for (const o of E) {
    const s = n[o.key];
    s.length !== 0 && r.push(C(e, o, s));
  }
  return r;
}
function C(e, i, t, n = !0) {
  const r = t.filter(_), o = e ? t.filter((a) => J(e, a)) : [], s = t.filter(
    (a) => !_(a) && !o.includes(a) && k(a)
  ), l = t.filter(
    (a) => !_(a) && !o.includes(a) && !k(a)
  ), u = n ? [
    {
      type: "heading",
      heading: i.title,
      heading_style: "subtitle",
      icon: i.icon
    }
  ] : [];
  for (const a of r)
    u.push({
      type: "picture-entity",
      entity: a,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  return o.length > 0 && u.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: o
  }), s.length > 0 && u.push({
    type: "grid",
    columns: 2,
    square: !1,
    cards: s.map((a) => ({
      type: "tile",
      entity: a
    }))
  }), l.length > 0 && u.push({
    type: "entities",
    show_header_toggle: !1,
    entities: l
  }), {
    type: "grid",
    cards: u
  };
}
function k(e) {
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
function _(e) {
  return e.split(".")[0] === "camera";
}
function J(e, i) {
  var r;
  const t = i.split(".")[0] ?? "", n = String(((r = e.states[i]) == null ? void 0 : r.attributes.device_class) ?? "");
  return t === "sensor" && ["temperature", "humidity"].includes(n);
}
function N(e, i) {
  const t = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    t[Q(e, n)].push(n);
  return t;
}
function Q(e, i) {
  var r;
  const t = i.split(".")[0] ?? "", n = (r = e.states[i]) == null ? void 0 : r.attributes.device_class;
  return t === "light" || t === "switch" || t === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(t) || ["temperature", "humidity"].includes(String(n)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(t) ? "security" : ["media_player", "remote", "vacuum"].includes(t) ? "media" : t === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function X(e, i) {
  const t = i.filter((n) => {
    var r;
    return ["on", "open", "opening"].includes(((r = e.states[n]) == null ? void 0 : r.state) ?? "");
  }).length;
  return t === 0 ? "Alle aus" : `${t} aktiv`;
}
function Z(e, i) {
  const t = i.map((r) => R(e, r)).filter((r) => Number.isFinite(r));
  return t.length === 0 ? "Keine Werte" : `${(t.reduce((r, o) => r + o, 0) / t.length).toFixed(1).replace(".", ",")}°`;
}
function ee(e, i) {
  const t = i.filter(
    (n) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = e.states[n]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return t === 0 ? "Alles ruhig" : `${t} aktiv`;
}
function te(e, i) {
  const t = i.filter((n) => {
    var r;
    return ((r = e.states[n]) == null ? void 0 : r.state) === "playing";
  }).length;
  return t === 0 ? "Keine Wiedergabe" : `${t} Wiedergabe`;
}
function R(e, i) {
  const t = e.states[i], n = ["current_temperature", "temperature"];
  for (const r of n) {
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
function ie(e, i) {
  return typeof e.level == "number" && typeof i.level == "number" && e.level !== i.level ? e.level - i.level : typeof e.level == "number" ? -1 : typeof i.level == "number" ? 1 : e.name.localeCompare(i.name);
}
function ne(e, i = []) {
  const t = new Set(i);
  return e.map((n) => {
    const r = p(n.path ?? n.title);
    return {
      ...n,
      path: v(r, t)
    };
  });
}
function v(e, i) {
  const t = i instanceof Set ? i : new Set(i.filter(Boolean)), n = p(e || "view") || "view";
  let r = n, o = 2;
  for (; t.has(r); )
    r = `${n}-${o}`, o += 1;
  return t.add(r), r;
}
function M(e) {
  const i = e.entity_filter ?? {
    hide_entity_categories: $
  }, t = new Set(
    e.devices.filter((n) => n.area_id === e.area.area_id).map((n) => n.id)
  );
  return T(e.entities, i).filter(
    (n) => n.area_id === e.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && t.has(n.device_id)
  ).map((n) => n.entity_id);
}
function T(e, i) {
  const t = new Set(i.hide_entity_categories);
  return e.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !t.has(n.entity_category));
}
function re(e) {
  var t;
  const i = (t = e.entity_filter) == null ? void 0 : t.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : $
  };
}
function x(e, i) {
  var t;
  return ((t = e.states[i]) == null ? void 0 : t.attributes.friendly_name) ?? i;
}
function p(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function b(e) {
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
function oe() {
  customElements.define(`ll-strategy-dashboard-${h}`, B), customElements.define(`ll-strategy-view-${h}`, V), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: h,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
oe();
//# sourceMappingURL=HAStrategy.js.map
