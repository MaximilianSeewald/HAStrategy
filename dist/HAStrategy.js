const g = "max-home-dashboard", M = "0.2.2", C = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], V = C.filter((t) => t.path), R = ["config", "diagnostic"];
class P extends HTMLElement {
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
    ]), s = await e.callWS({ type: "config/floor_registry/list" }).catch(() => []), l = me(i), a = n.filter((d) => d.area_id && d.name).sort((d, _) => d.name.localeCompare(_.name)), c = ee(i), u = /* @__PURE__ */ new Set(["dashboard", ...c.map((d) => d.path).filter(Boolean)]), m = K(a, s, r, o, l, e, u), h = G(o, l).map((d) => d.entity_id).filter((d) => e.states[d]), p = T(e, h), f = X(e, p, o, a, r, s, u), H = Z([
      "dashboard",
      ...c.map((d) => d.path).filter((d) => !!d),
      ...f.views.map((d) => d.path).filter((d) => !!d),
      ...m.map((d) => d.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        L(e, m, c, p, f.pathByKey, H),
        ...c,
        ...f.views,
        ...a.map((d, _) => {
          const b = m[_];
          return {
            title: d.name,
            path: (b == null ? void 0 : b.path) ?? y(d.name || d.area_id),
            icon: d.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${g}`,
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
class O extends HTMLElement {
  static async generate(i, e) {
    const n = W(i).filter((r) => e.states[r]).sort((r, o) => E(e, r).localeCompare(E(e, o)));
    return {
      sections: ie(e, i.area, n, {
        devices: i.devices,
        entities: i.entities
      })
    };
  }
}
function L(t, i, e, n, r, o) {
  const s = t.config.location_name ?? "Home", l = U(i, o), a = q(t, e, n, r);
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
          ...z(a, o)
        ]
      }
    ].filter((c) => c.cards.length > 0)
  };
}
function K(t, i, e, n, r, o, s) {
  const l = new Map(i.map((c) => [c.floor_id, c])), a = new Map(
    i.slice().sort(F).map((c, u) => [c.floor_id, u])
  );
  return t.map((c) => {
    const u = k(y(c.name || c.area_id), s), m = c.floor_id ? l.get(c.floor_id) : void 0;
    return {
      title: c.name,
      path: u,
      icon: c.icon ?? "mdi:floor-plan",
      stateEntityId: j(o, c, e, n, r),
      floorId: c.floor_id,
      floorName: (m == null ? void 0 : m.name) ?? "Weitere Räume",
      floorIcon: (m == null ? void 0 : m.icon) ?? "mdi:home-floor-0",
      sortIndex: c.floor_id ? a.get(c.floor_id) ?? i.length : i.length
    };
  });
}
function U(t, i) {
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
        heading_style: "title",
        icon: ((o = r[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      ...r.slice().sort((s, l) => s.title.localeCompare(l.title)).map((s) => Y(s, i))
    ];
  });
}
function Y(t, i) {
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
      navigation_path: x(i, t.path)
    }
  };
  return t.stateEntityId && (e.entity = t.stateEntityId), e;
}
function q(t, i, e, n) {
  const r = i.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? y(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: se(t, e.lights),
      path: n.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: ce(t, e.climate),
      path: n.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: le(t, e.security),
      path: n.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: ue(t, e.media),
      path: n.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function z(t, i) {
  return t.map((e) => ({
    type: "button",
    name: `${e.title} ${e.subtitle}`,
    icon: e.icon,
    icon_height: "8px",
    show_icon: !0,
    show_name: !0,
    show_state: !1,
    grid_options: {
      columns: 12,
      rows: 1
    },
    card_mod: {
      style: `
        ha-card {
          min-height: 24px;
          height: 24px;
        }
      `
    },
    tap_action: e.path ? {
      action: "navigate",
      navigation_path: x(i, e.path)
    } : {
      action: "none"
    }
  }));
}
function j(t, i, e, n, r) {
  return W({ area: i, devices: e, entities: n, entity_filter: r }).find((o) => {
    const s = t.states[o];
    return o.startsWith("sensor.") && (s == null ? void 0 : s.attributes.device_class) === "temperature" && Number.isFinite(D(t, o));
  });
}
function X(t, i, e, n, r, o, s) {
  const l = Q(e, n, r, o), a = {};
  return { views: V.map((u) => {
    const m = k(u.path, s);
    return a[u.key] = m, {
      title: A(u.key),
      path: m,
      icon: u.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: i[u.key].length > 0 ? J(t, { ...u, title: A(u.key) }, i[u.key], l, {
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
function J(t, i, e, n, r) {
  const o = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
  for (const l of e) {
    const a = n.get(l) ?? {
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
    for (const [m, h] of Array.from(a.entries()).sort(([p], [f]) => p.localeCompare(f)))
      u.push({
        type: "heading",
        heading: m,
        heading_style: "subtitle",
        icon: "mdi:chevron-right"
      }), u.push(...B(t, h, r, N(i.key)));
    return [
      {
        type: "grid",
        cards: u
      }
    ];
  });
}
function Q(t, i, e, n) {
  const r = new Map(i.map((a) => [a.area_id, a])), o = new Map(e.map((a) => [a.id, a])), s = new Map(n.map((a) => [a.floor_id, a])), l = new Map(
    n.slice().sort(F).map((a, c) => [a.floor_id, c])
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
          sortIndex: h ? l.get(h) ?? n.length : n.length
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
function Z(t) {
  const e = window.location.pathname.replace(/\/+$/g, "").split("/").filter(Boolean);
  if (e.length === 0)
    return "";
  const n = decodeURIComponent(e[e.length - 1] ?? "");
  return t.includes(n) ? `/${e.slice(0, -1).join("/")}` : `/${e.join("/")}`;
}
function x(t, i) {
  const e = t.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${e}/${n}`;
}
function ee(t) {
  var e;
  const i = [];
  ((e = t.shopping) == null ? void 0 : e.enabled) !== !1 && i.push(te(t.shopping));
  for (const n of t.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || i.push({
      title: n.title,
      path: n.path ?? y(n.id),
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
  return de(i, ["dashboard"]);
}
function te(t = {}) {
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
function ie(t, i, e, n) {
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
  const r = T(t, e), o = [];
  for (const s of C) {
    const l = r[s.key];
    l.length !== 0 && o.push(ne(t, s, l, n, !N(s.key)));
  }
  return o;
}
function ne(t, i, e, n, r = !0) {
  const o = r ? [
    {
      type: "heading",
      heading: i.title,
      heading_style: "subtitle",
      icon: i.icon
    }
  ] : [];
  return o.push(...B(t, e, n, N(i.key))), {
    type: "grid",
    cards: o
  };
}
function B(t, i, e, n = !1) {
  return n && e ? re(t, i, e) : $(t, i);
}
function re(t, i, e) {
  const n = new Map(e.entities.map((s) => [s.entity_id, s])), r = new Map(e.devices.map((s) => [s.id, s])), o = /* @__PURE__ */ new Map();
  for (const s of i) {
    const l = n.get(s), a = (l == null ? void 0 : l.device_id) ?? s;
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
    ...$(t, l)
  ]);
}
function w(t, i, e, n) {
  const r = e.get(t), o = i[0];
  return (r == null ? void 0 : r.name_by_user) ?? (r == null ? void 0 : r.name) ?? (o && n ? E(n, o) : "Weitere");
}
function $(t, i) {
  const e = i.filter(v), n = i.filter(S), r = t ? i.filter((a) => oe(t, a)) : [], o = i.filter(
    (a) => !v(a) && !S(a) && !r.includes(a) && I(a)
  ), s = i.filter(
    (a) => !v(a) && !S(a) && !r.includes(a) && !I(a)
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
  for (const a of n)
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
function N(t) {
  return !["lights", "climate", "security"].includes(t);
}
function I(t) {
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
function v(t) {
  return t.split(".")[0] === "camera";
}
function S(t) {
  return t.split(".")[0] === "media_player";
}
function oe(t, i) {
  var r;
  const e = i.split(".")[0] ?? "", n = String(((r = t.states[i]) == null ? void 0 : r.attributes.device_class) ?? "");
  return e === "sensor" && ["temperature", "humidity"].includes(n);
}
function T(t, i) {
  const e = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    e[ae(t, n)].push(n);
  return e;
}
function ae(t, i) {
  var r;
  const e = i.split(".")[0] ?? "", n = (r = t.states[i]) == null ? void 0 : r.attributes.device_class;
  return e === "light" || e === "switch" || e === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(e) || ["temperature", "humidity"].includes(String(n)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(e) ? "security" : ["media_player", "remote", "vacuum"].includes(e) ? "media" : e === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function se(t, i) {
  const e = i.filter((n) => {
    var r;
    return ["on", "open", "opening"].includes(((r = t.states[n]) == null ? void 0 : r.state) ?? "");
  }).length;
  return e === 0 ? "Alle aus" : `${e} aktiv`;
}
function ce(t, i) {
  const e = i.map((r) => D(t, r)).filter((r) => Number.isFinite(r));
  return e.length === 0 ? "Keine Werte" : `${(e.reduce((r, o) => r + o, 0) / e.length).toFixed(1).replace(".", ",")}°`;
}
function le(t, i) {
  const e = i.filter(
    (n) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = t.states[n]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return e === 0 ? "Alles ruhig" : `${e} aktiv`;
}
function ue(t, i) {
  const e = i.filter((n) => {
    var r;
    return ((r = t.states[n]) == null ? void 0 : r.state) === "playing";
  }).length;
  return e === 0 ? "Keine Wiedergabe" : `${e} Wiedergabe`;
}
function D(t, i) {
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
function F(t, i) {
  return typeof t.level == "number" && typeof i.level == "number" && t.level !== i.level ? t.level - i.level : typeof t.level == "number" ? -1 : typeof i.level == "number" ? 1 : t.name.localeCompare(i.name);
}
function de(t, i = []) {
  const e = new Set(i);
  return t.map((n) => {
    const r = y(n.path ?? n.title);
    return {
      ...n,
      path: k(r, e)
    };
  });
}
function k(t, i) {
  const e = i instanceof Set ? i : new Set(i.filter(Boolean)), n = y(t || "view") || "view";
  let r = n, o = 2;
  for (; e.has(r); )
    r = `${n}-${o}`, o += 1;
  return e.add(r), r;
}
function W(t) {
  const i = t.entity_filter ?? {
    hide_entity_categories: R
  }, e = new Set(
    t.devices.filter((n) => n.area_id === t.area.area_id).map((n) => n.id)
  );
  return G(t.entities, i).filter(
    (n) => n.area_id === t.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && e.has(n.device_id)
  ).map((n) => n.entity_id);
}
function G(t, i) {
  const e = new Set(i.hide_entity_categories);
  return t.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !e.has(n.entity_category));
}
function me(t) {
  var e;
  const i = (e = t.entity_filter) == null ? void 0 : e.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : R
  };
}
function E(t, i) {
  var e;
  return ((e = t.states[i]) == null ? void 0 : e.attributes.friendly_name) ?? i;
}
function y(t) {
  return t.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function pe() {
  console.info(`[HAStrategy] loaded ${M}`), customElements.define(`ll-strategy-dashboard-${g}`, P), customElements.define(`ll-strategy-view-${g}`, O), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: g,
    strategyType: "dashboard",
    name: "Max Home",
    description: `Generates an area-based Home Assistant dashboard. Version ${M}.`,
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
pe();
//# sourceMappingURL=HAStrategy.js.map
