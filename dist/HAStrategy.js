const f = "max-home-dashboard", N = [
  { key: "lights", title: "Lights", icon: "mdi:lightbulb-outline", path: "beleuchtung" },
  { key: "climate", title: "Climate", icon: "mdi:thermostat", path: "raumklima" },
  { key: "security", title: "Security", icon: "mdi:shield-home-outline", path: "sicherheit" },
  { key: "media", title: "Media", icon: "mdi:speaker", path: "mediaplayer" },
  { key: "sensors", title: "Sensors", icon: "mdi:gauge" },
  { key: "other", title: "Other", icon: "mdi:dots-grid" }
], H = N.filter((e) => e.path), A = ["config", "diagnostic"];
class D extends HTMLElement {
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
    ]), c = await t.callWS({ type: "config/floor_registry/list" }).catch(() => []), a = se(i), l = n.filter((u) => u.area_id && u.name).sort((u, b) => u.name.localeCompare(b.name)), s = X(i), m = /* @__PURE__ */ new Set(["dashboard", ...s.map((u) => u.path).filter(Boolean)]), d = V(l, c, r, o, a, t, m), h = B(o, a).map((u) => u.entity_id).filter((u) => t.states[u]), p = C(t, h), _ = U(t, p, o, l, r, c, m), F = j([
      "dashboard",
      ...s.map((u) => u.path).filter((u) => !!u),
      ..._.views.map((u) => u.path).filter((u) => !!u),
      ...d.map((u) => u.path)
    ]);
    return {
      title: i.title ?? "Max Home",
      views: [
        W(t, d, s, p, _.pathByKey, F),
        ...s,
        ..._.views,
        ...l.map((u, b) => {
          const v = d[b];
          return {
            title: u.name,
            path: (v == null ? void 0 : v.path) ?? g(u.name || u.area_id),
            icon: u.icon ?? void 0,
            subview: !0,
            type: "sections",
            max_columns: 3,
            strategy: {
              type: `custom:${f}`,
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
class P extends HTMLElement {
  static async generate(i, t) {
    const n = T(i).filter((r) => t.states[r]).sort((r, o) => E(t, r).localeCompare(E(t, o)));
    return {
      sections: Q(t, i.area, n)
    };
  }
}
function W(e, i, t, n, r, o) {
  const c = e.config.location_name ?? "Home", a = z(i, o), l = L(e, t, n, r);
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
function V(e, i, t, n, r, o, c) {
  const a = new Map(i.map((s) => [s.floor_id, s])), l = new Map(
    i.slice().sort(R).map((s, m) => [s.floor_id, m])
  );
  return e.map((s) => {
    const m = S(g(s.name || s.area_id), c), d = s.floor_id ? a.get(s.floor_id) : void 0;
    return {
      title: s.name,
      path: m,
      icon: s.icon ?? "mdi:floor-plan",
      subtitle: K(o, s, t, n, r),
      floorId: s.floor_id,
      floorName: (d == null ? void 0 : d.name) ?? "Weitere Räume",
      floorIcon: (d == null ? void 0 : d.icon) ?? "mdi:home-floor-0",
      sortIndex: s.floor_id ? l.get(s.floor_id) ?? i.length : i.length
    };
  });
}
function z(e, i) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.floorName ?? "Weitere Räume";
    t.set(r, [...t.get(r) ?? [], n]);
  }
  return Array.from(t.entries()).sort(([, n], [, r]) => {
    const o = n[0], c = r[0];
    return ((o == null ? void 0 : o.sortIndex) ?? 0) - ((c == null ? void 0 : c.sortIndex) ?? 0) || ((o == null ? void 0 : o.floorName) ?? "").localeCompare((c == null ? void 0 : c.floorName) ?? "");
  }).flatMap(([n, r]) => {
    var o;
    return [
      {
        type: "heading",
        heading: n,
        heading_style: "subtitle",
        icon: ((o = r[0]) == null ? void 0 : o.floorIcon) ?? "mdi:home-floor-0"
      },
      ...r.slice().sort((c, a) => c.title.localeCompare(a.title)).map((c) => G(c, i))
    ];
  });
}
function G(e, i) {
  const t = M(i, e.path), n = e.subtitle ? `<br><span style="font-size: 12px; font-weight: 600;">${y(e.subtitle)}</span>` : "";
  return {
    type: "markdown",
    content: `<a href="${y(t)}" style="color: inherit; display: block; min-height: 94px; padding-top: 10px; text-align: center; text-decoration: none;"><ha-icon icon="${y(e.icon)}" style="--mdc-icon-size: 22px; color: var(--state-icon-color, var(--primary-color));"></ha-icon><br><br><span style="font-size: 12px; font-weight: 700; line-height: 1.2;">${y(e.title)}</span>${n}</a>`,
    grid_options: {
      columns: 4,
      rows: 2
    }
  };
}
function L(e, i, t, n) {
  const r = i.map((o) => ({
    title: o.title,
    subtitle: "Öffnen",
    path: o.path ?? g(o.title),
    icon: o.icon ?? "mdi:shape-outline"
  }));
  return [
    {
      title: "Beleuchtung",
      subtitle: ne(e, t.lights),
      path: n.lights,
      icon: "mdi:lamps-outline"
    },
    {
      title: "Raumklima",
      subtitle: ie(e, t.climate),
      path: n.climate,
      icon: "mdi:home-thermometer-outline"
    },
    {
      title: "Sicherheit",
      subtitle: re(e, t.security),
      path: n.security,
      icon: "mdi:shield-home-outline"
    },
    {
      title: "Mediaplayer",
      subtitle: oe(e, t.media),
      path: n.media,
      icon: "mdi:music-box-outline"
    },
    ...r
  ];
}
function O(e, i) {
  const t = e.path ? M(i, e.path) : void 0;
  return {
    type: "markdown",
    content: `<a href="${y(t ?? "#")}" style="align-items: center; color: inherit; display: flex; gap: 14px; min-height: 48px; text-decoration: none;"><ha-icon icon="${y(e.icon)}" style="--mdc-icon-size: 22px; color: var(--state-icon-color, var(--primary-color)); flex: 0 0 auto;"></ha-icon><span style="display: flex; flex-direction: column; line-height: 1.2;"><strong style="font-size: 13px;">${y(e.title)}</strong><span style="font-size: 12px;">${y(e.subtitle)}</span></span></a>`,
    grid_options: {
      columns: "full",
      rows: 1
    }
  };
}
function K(e, i, t, n, r) {
  const o = T({ area: i, devices: t, entities: n, entity_filter: r }).map((a) => I(e, a)).filter((a) => Number.isFinite(a));
  return o.length === 0 ? void 0 : `${(o.reduce((a, l) => a + l, 0) / o.length).toFixed(1).replace(".", ",")} °C`;
}
function U(e, i, t, n, r, o, c) {
  const a = q(t, n, r, o), l = {};
  return { views: H.map((m) => {
    const d = S(m.path, c);
    return l[m.key] = d, {
      title: x(m.key),
      path: d,
      icon: m.icon,
      subview: !0,
      type: "sections",
      max_columns: 3,
      sections: i[m.key].length > 0 ? Y(e, { ...m, title: x(m.key) }, i[m.key], a) : [
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
function Y(e, i, t, n) {
  const r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
  for (const c of t) {
    const a = n.get(c) ?? {
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
      }), s.push(...$(e, d));
    return [
      {
        type: "grid",
        cards: s
      }
    ];
  });
}
function q(e, i, t, n) {
  const r = new Map(i.map((l) => [l.area_id, l])), o = new Map(t.map((l) => [l.id, l])), c = new Map(n.map((l) => [l.floor_id, l])), a = new Map(
    n.slice().sort(R).map((l, s) => [l.floor_id, s])
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
          sortIndex: h ? a.get(h) ?? n.length : n.length
        }
      ];
    })
  );
}
function x(e) {
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
  const n = decodeURIComponent(t[t.length - 1] ?? "");
  return e.includes(n) ? `/${t.slice(0, -1).join("/")}` : `/${t.join("/")}`;
}
function M(e, i) {
  const t = e.replace(/\/+$/g, ""), n = i.replace(/^\/+/g, "");
  return `${t}/${n}`;
}
function X(e) {
  var t;
  const i = [];
  ((t = e.shopping) == null ? void 0 : t.enabled) !== !1 && i.push(J(e.shopping));
  for (const n of e.categories ?? [])
    !n.id || !n.title || !Array.isArray(n.cards) || i.push({
      title: n.title,
      path: n.path ?? g(n.id),
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
  return ae(i, ["dashboard"]);
}
function J(e = {}) {
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
function Q(e, i, t) {
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
  const n = C(e, t), r = [];
  for (const o of N) {
    const c = n[o.key];
    c.length !== 0 && r.push(Z(e, o, c));
  }
  return r;
}
function Z(e, i, t, n = !0) {
  const r = n ? [
    {
      type: "heading",
      heading: i.title,
      heading_style: "subtitle",
      icon: i.icon
    }
  ] : [];
  return r.push(...$(e, t)), {
    type: "grid",
    cards: r
  };
}
function $(e, i) {
  const t = i.filter(w), n = e ? i.filter((a) => ee(e, a)) : [], r = i.filter(
    (a) => !w(a) && !n.includes(a) && k(a)
  ), o = i.filter(
    (a) => !w(a) && !n.includes(a) && !k(a)
  ), c = [];
  for (const a of t)
    c.push({
      type: "picture-entity",
      entity: a,
      camera_view: "live",
      show_name: !0,
      show_state: !1
    });
  return n.length > 0 && c.push({
    type: "history-graph",
    hours_to_show: 24,
    entities: n
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
function w(e) {
  return e.split(".")[0] === "camera";
}
function ee(e, i) {
  var r;
  const t = i.split(".")[0] ?? "", n = String(((r = e.states[i]) == null ? void 0 : r.attributes.device_class) ?? "");
  return t === "sensor" && ["temperature", "humidity"].includes(n);
}
function C(e, i) {
  const t = {
    lights: [],
    climate: [],
    security: [],
    media: [],
    sensors: [],
    other: []
  };
  for (const n of i)
    t[te(e, n)].push(n);
  return t;
}
function te(e, i) {
  var r;
  const t = i.split(".")[0] ?? "", n = (r = e.states[i]) == null ? void 0 : r.attributes.device_class;
  return t === "light" || t === "switch" || t === "cover" ? "lights" : ["climate", "fan", "humidifier", "water_heater"].includes(t) || ["temperature", "humidity"].includes(String(n)) ? "climate" : ["alarm_control_panel", "binary_sensor", "camera", "lock"].includes(t) ? "security" : ["media_player", "remote", "vacuum"].includes(t) ? "media" : t === "sensor" || ["temperature", "humidity", "illuminance", "power", "energy", "battery"].includes(String(n)) ? "sensors" : "other";
}
function ne(e, i) {
  const t = i.filter((n) => {
    var r;
    return ["on", "open", "opening"].includes(((r = e.states[n]) == null ? void 0 : r.state) ?? "");
  }).length;
  return t === 0 ? "Alle aus" : `${t} aktiv`;
}
function ie(e, i) {
  const t = i.map((r) => I(e, r)).filter((r) => Number.isFinite(r));
  return t.length === 0 ? "Keine Werte" : `${(t.reduce((r, o) => r + o, 0) / t.length).toFixed(1).replace(".", ",")}°`;
}
function re(e, i) {
  const t = i.filter(
    (n) => {
      var r;
      return ["on", "open", "opening", "unlocked", "triggered", "armed_away", "armed_home"].includes(((r = e.states[n]) == null ? void 0 : r.state) ?? "");
    }
  ).length;
  return t === 0 ? "Alles ruhig" : `${t} aktiv`;
}
function oe(e, i) {
  const t = i.filter((n) => {
    var r;
    return ((r = e.states[n]) == null ? void 0 : r.state) === "playing";
  }).length;
  return t === 0 ? "Keine Wiedergabe" : `${t} Wiedergabe`;
}
function I(e, i) {
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
function R(e, i) {
  return typeof e.level == "number" && typeof i.level == "number" && e.level !== i.level ? e.level - i.level : typeof e.level == "number" ? -1 : typeof i.level == "number" ? 1 : e.name.localeCompare(i.name);
}
function ae(e, i = []) {
  const t = new Set(i);
  return e.map((n) => {
    const r = g(n.path ?? n.title);
    return {
      ...n,
      path: S(r, t)
    };
  });
}
function S(e, i) {
  const t = i instanceof Set ? i : new Set(i.filter(Boolean)), n = g(e || "view") || "view";
  let r = n, o = 2;
  for (; t.has(r); )
    r = `${n}-${o}`, o += 1;
  return t.add(r), r;
}
function T(e) {
  const i = e.entity_filter ?? {
    hide_entity_categories: A
  }, t = new Set(
    e.devices.filter((n) => n.area_id === e.area.area_id).map((n) => n.id)
  );
  return B(e.entities, i).filter(
    (n) => n.area_id === e.area.area_id || !n.area_id && n.device_id !== null && n.device_id !== void 0 && t.has(n.device_id)
  ).map((n) => n.entity_id);
}
function B(e, i) {
  const t = new Set(i.hide_entity_categories);
  return e.filter((n) => !n.hidden_by && !n.disabled_by).filter((n) => !n.entity_category || !t.has(n.entity_category));
}
function se(e) {
  var t;
  const i = (t = e.entity_filter) == null ? void 0 : t.hide_entity_categories;
  return {
    hide_entity_categories: Array.isArray(i) ? i : A
  };
}
function E(e, i) {
  var t;
  return ((t = e.states[i]) == null ? void 0 : t.attributes.friendly_name) ?? i;
}
function g(e) {
  return e.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function y(e) {
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
function ce() {
  customElements.define(`ll-strategy-dashboard-${f}`, D), customElements.define(`ll-strategy-view-${f}`, P), window.customStrategies = window.customStrategies || [], window.customStrategies.push({
    type: f,
    strategyType: "dashboard",
    name: "Max Home",
    description: "Generates an area-based Home Assistant dashboard.",
    documentationURL: "https://developers.home-assistant.io/docs/frontend/custom-ui/custom-strategy/"
  });
}
ce();
//# sourceMappingURL=HAStrategy.js.map
