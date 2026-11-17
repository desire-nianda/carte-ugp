/* =========================================================
   CARTE INTERACTIVE — amCharts 5
   ========================================================= */

/* ---------- Réglages ---------- */
const COLORS = {
  empty:        0xdfe2ec,  // province sans site
  emptyHover:   0xd0d5e3,
  sites:        0x6a9a80,  // province avec sites
  sitesHover:   0x3f6d55,
  selected:     0x2f4f9f,  // province sélectionnée
  border:       0xffffff,
  label:        0x3a4152,
  box:          0x111827,  // cadre noir de sélection
  halo:         0xf59e0b,
  tooltipBg:    0x1c2541
};
const DOT_RADIUS = 4.5, DOT_RADIUS_ACTIVE = 6.5, DOT_RADIUS_HOVER = 8;

/* Fond de carte amCharts (chargé dans index.html) */
const GEODATA = window.am5geodata_congoDRHigh || window.am5geodata_congoDRLow;

/* ---------- Éléments du panneau ---------- */
const select    = document.getElementById("provinceSelect");
const legend    = document.getElementById("legend");
const badge     = document.getElementById("badge");
const badgeText = document.getElementById("badgeText");
const titleEl   = document.getElementById("detailTitle");
const subEl     = document.getElementById("detailSub");
const listEl    = document.getElementById("siteList");
const mapMsg    = document.getElementById("mapMessage");

/* ---------- Données dérivées ---------- */
const byId = {};
PROVINCES.forEach(p => { byId[p.id] = { ...p, sites: SITES[p.id] || [], featureId: null }; });

const state = {
  selected: null,
  hovered: null,
  polygons: {},      // id province -> MapPolygon amCharts
  dots: {},          // id province -> [{dot, halo}]
  chart: null
};

/* ---------- Liste déroulante + légende (indépendantes de la carte) ---------- */
[...PROVINCES]
  .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  .forEach(p => {
    const o = document.createElement("option");
    o.value = p.id; o.textContent = p.name;
    select.appendChild(o);
  });

Object.entries(CATEGORIES).forEach(([code, cat]) => {
  const li = document.createElement("li");
  li.innerHTML = `<span class="sw sw-dot" style="background:${cat.color}"></span><b>${code}</b> — ${cat.label}`;
  legend.appendChild(li);
});

select.addEventListener("change", () => {
  if (select.value) selectProvince(select.value);
  else resetSelection();
});

/* ---------- Correspondance province <-> polygone du fond de carte ----------
   On essaie d'abord le code ISO (CD-KN…), puis le nom (sans accents). */
const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z]/g, "");
const ALIASES = { bascongo: "kongo-central", kongocentral: "kongo-central", kasaioccidental: "kasai-central" };

function matchFeatures() {
  const isoMap = {}, nameMap = {};
  PROVINCES.forEach(p => { isoMap[p.iso] = p.id; nameMap[norm(p.name)] = p.id; });
  Object.entries(ALIASES).forEach(([k, v]) => (nameMap[k] = v));

  let matched = 0;
  GEODATA.features.forEach(f => {
    const fid = f.id || (f.properties && f.properties.id);
    const name = f.properties && f.properties.name;
    const pid = isoMap[fid] || nameMap[norm(name)];
    if (pid && !byId[pid].featureId) { byId[pid].featureId = fid; matched++; }
    else if (!pid) console.warn("Polygone non reconnu dans le fond de carte :", fid, name);
  });
  return matched;
}

function buildMap() {
  const matched = matchFeatures();
  if (matched < PROVINCES.length) {
    console.warn(`${matched}/${PROVINCES.length} provinces reconnues dans le fond de carte.`);
  }

  const root = am5.Root.new("chartdiv");
  root.setThemes([am5themes_Animated.new(root)]);
  root.locale = root.locale || {};

  const chart = root.container.children.push(am5map.MapChart.new(root, {
    panX: "translateX",
    panY: "translateY",
    wheelY: "zoom",
    pinchZoom: true,
    projection: am5map.geoMercator(),
    paddingTop: 18, paddingBottom: 18, paddingLeft: 18, paddingRight: 18,
    maxZoomLevel: 16
  }));
  state.chart = chart;

  /* Info-bulle commune (fond bleu nuit) */
  const makeTooltip = () => {
    const t = am5.Tooltip.new(root, { getFillFromSprite: false, labelText: "{name}" });
    t.get("background").setAll({ fill: am5.color(COLORS.tooltipBg), fillOpacity: 1, strokeOpacity: 0, cornerRadius: 7 });
    t.label.setAll({ fill: am5.color(0xffffff), fontSize: 12, fontFamily: "Lexend, sans-serif" });
    return t;
  };

  /* ===== 1. Provinces ===== */
  const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    geoJSON: GEODATA,
    tooltip: makeTooltip()
  }));
  state.polygonSeries = polygonSeries;

  polygonSeries.mapPolygons.template.setAll({
    interactive: true,
    fill: am5.color(COLORS.empty),
    stroke: am5.color(COLORS.border),
    strokeWidth: 1,
    cursorOverStyle: "pointer",
    tooltipText: "{name}"
  });

  // Texte de l'info-bulle : nom de la province + nombre de sites
  polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
    const pid = pidOf(target);
    if (!pid) return text;
    const n = byId[pid].sites.length;
    const info = n ? `${n} ${n > 1 ? "sites répertoriés" : "site répertorié"}` : "Aucun site répertorié";
    return `${byId[pid].name}\n[fontSize:11px #c5cbe0]${info}[/]`;
  });

  // Couleur initiale de chaque province, dès que les polygones existent
  polygonSeries.events.on("datavalidated", () => {
    polygonSeries.mapPolygons.each(poly => {
      const pid = pidOf(poly);
      if (pid) { state.polygons[pid] = poly; paint(pid, false); }
    });
    safe(buildLabels);
    if (state.selected) selectProvince(state.selected);
  });

  // Survol / clic
  polygonSeries.mapPolygons.template.events.on("pointerover", ev => {
    const pid = pidOf(ev.target);
    if (!pid) return;
    const prev = state.hovered;
    state.hovered = pid;
    if (prev && prev !== pid) paint(prev);
    paint(pid);
  });
  polygonSeries.mapPolygons.template.events.on("pointerout", ev => {
    const pid = pidOf(ev.target);
    if (!pid) return;
    if (state.hovered === pid) state.hovered = null;
    paint(pid);
  });
  polygonSeries.mapPolygons.template.events.on("click", ev => {
    const pid = pidOf(ev.target);
    if (pid) selectProvince(pid);
  });

  /* ===== 2. Cadre noir autour de la province sélectionnée ===== */
  const boxSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
  boxSeries.mapPolygons.template.setAll({
    fillOpacity: 0,
    stroke: am5.color(COLORS.box),
    strokeWidth: 2,
    interactive: false
  });
  state.boxSeries = boxSeries;

  /* ===== 3. Étiquettes des provinces ===== */
  const labelSeries = chart.series.push(am5map.MapPointSeries.new(root, {
    latitudeField: "latitude",
    longitudeField: "longitude"
  }));
  labelSeries.bullets.push((root, series, dataItem) => am5.Bullet.new(root, {
    sprite: am5.Label.new(root, {
      text: dataItem.dataContext.label,
      fontSize: 8,
      fontWeight: "600",
      fontFamily: "Lexend, sans-serif",
      fill: am5.color(COLORS.label),
      centerX: am5.p50,
      centerY: am5.p50,
      interactive: false
    })
  }));

  function buildLabels() {
    const data = [];
    Object.keys(byId).forEach(pid => {
      const f = featureOf(pid);
      if (!f) return;
      const c = labelPoint(f.geometry);
      data.push({ longitude: c[0], latitude: c[1], label: byId[pid].name.toUpperCase() });
    });
    labelSeries.data.setAll(data);
  }

  /* ===== 4. Sites ===== */
  const siteSeries = chart.series.push(am5map.MapPointSeries.new(root, {
    latitudeField: "latitude",
    longitudeField: "longitude",
    tooltip: makeTooltip()
  }));

  siteSeries.bullets.push((root, series, dataItem) => {
    const d = dataItem.dataContext;
    const container = am5.Container.new(root, {});
    const halo = container.children.push(am5.Circle.new(root, {
      radius: 0, fill: am5.color(COLORS.halo), fillOpacity: 0.35, interactive: false
    }));
    const dot = container.children.push(am5.Circle.new(root, {
      radius: DOT_RADIUS,
      fill: am5.color(d.color),
      stroke: am5.color(0xffffff),
      strokeWidth: 1.5,
      tooltipText: "{name}\n[fontSize:11px #c5cbe0]{details}[/]",
      cursorOverStyle: "pointer"
    }));
    dot.events.on("click", () => {
      if (state.selected !== d.pid) selectProvince(d.pid);
      setTimeout(() => highlightItem(d.idx), 30);
    });
    (state.dots[d.pid] ||= [])[d.idx] = { dot, halo };
    return am5.Bullet.new(root, { sprite: container });
  });

  const siteData = [];
  Object.entries(SITES).forEach(([pid, list]) => {
    list.forEach((s, idx) => siteData.push({
      pid, idx,
      name: s[0],
      longitude: s[2],
      latitude: s[3],
      color: CATEGORIES[s[1]].color,
      details: siteDetails(s)
    }));
  });
  siteSeries.data.setAll(siteData);

  /* ===== Zoom ===== */
  document.getElementById("zoomIn").addEventListener("click", () => chart.zoomIn());
  document.getElementById("zoomOut").addEventListener("click", () => chart.zoomOut());

  chart.appear(800, 100);
}

/* ---------- Outils carte ---------- */
const featureToPid = {};
function pidOf(sprite) {
  const di = sprite && sprite.dataItem;
  if (!di) return null;
  const fid = di.get("id") ?? (di.dataContext && di.dataContext.id);
  if (!Object.keys(featureToPid).length) {
    Object.values(byId).forEach(p => { if (p.featureId) featureToPid[p.featureId] = p.id; });
  }
  return featureToPid[fid] || null;
}
function featureOf(pid) {
  const fid = byId[pid] && byId[pid].featureId;
  if (!fid) return null;
  return GEODATA.features.find(f => (f.id || (f.properties && f.properties.id)) === fid) || null;
}
function polygonOf(pid) {
  if (state.polygons[pid]) return state.polygons[pid];
  const fid = byId[pid] && byId[pid].featureId;
  const di = fid && state.polygonSeries && state.polygonSeries.getDataItemById(fid);
  const poly = di && di.get("mapPolygon");
  if (poly) state.polygons[pid] = poly;
  return poly || null;
}
function safe(fn, ...args) {
  try { return fn(...args); } catch (e) { console.error(e); }
}

/* Point d'étiquette : centre de la plus grande partie du polygone */
function labelPoint(geom) {
  const rings = geom.type === "MultiPolygon" ? geom.coordinates.map(p => p[0]) : [geom.coordinates[0]];
  let best = null, bestA = -1;
  rings.forEach(r => {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const f = r[j][0] * r[i][1] - r[i][0] * r[j][1];
      a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f;
    }
    if (Math.abs(a) > bestA && a !== 0) { bestA = Math.abs(a); best = [cx / (3 * a), cy / (3 * a)]; }
  });
  return best || geom.coordinates.flat(3).slice(0, 2);
}

/* ---------- Couleurs des provinces ---------- */
function paint(pid, animated = true) {
  const poly = polygonOf(pid);
  if (!poly) return;
  const has = byId[pid].sites.length > 0;
  let c;
  if (state.selected === pid) c = COLORS.selected;
  else if (state.hovered === pid) c = has ? COLORS.sitesHover : COLORS.emptyHover;
  else c = has ? COLORS.sites : COLORS.empty;
  if (animated) poly.animate({ key: "fill", to: am5.color(c), duration: 180 });
  else poly.set("fill", am5.color(c));
}

/* ---------- Sélection ---------- */
function selectProvince(pid) {
  const p = byId[pid];
  if (!p) return;

  // 1. Panneau de droite et liste déroulante d'abord (ne dépendent pas de la carte)
  select.value = pid;
  renderDetail(p);

  // 2. Carte
  const prev = state.selected;
  state.selected = pid;
  if (!window.am5 || !state.polygonSeries) return;
  if (prev && prev !== pid) { safe(paint, prev); safe(setDotsActive, prev, false); }
  safe(paint, pid);
  safe(setDotsActive, pid, true);
  safe(() => { const poly = polygonOf(pid); if (poly) poly.toFront(); });
  safe(drawBox, pid);
}

function resetSelection() {
  const prev = state.selected;
  state.selected = null;
  if (prev && state.polygonSeries) { safe(paint, prev); safe(setDotsActive, prev, false); }
  if (state.boxSeries) safe(() => state.boxSeries.data.setAll([]));
  badge.classList.remove("active");
  badgeText.textContent = "Choisissez une province";
  titleEl.textContent = "Choisissez une province";
  subEl.textContent = "Sélectionnez une province pour consulter les sites couverts par le plan d’investissement.";
  listEl.innerHTML = "";
}

/* Rectangle (en lon/lat) qui englobe la province, avec une petite marge */
function drawBox(pid) {
  if (!state.boxSeries) return;
  const feature = featureOf(pid);
  if (!feature) { state.boxSeries.data.setAll([]); return; }

  let minX = 180, maxX = -180, minY = 90, maxY = -90;
  const walk = a => {
    if (typeof a[0] === "number") {
      minX = Math.min(minX, a[0]); maxX = Math.max(maxX, a[0]);
      minY = Math.min(minY, a[1]); maxY = Math.max(maxY, a[1]);
    } else a.forEach(walk);
  };
  walk(feature.geometry.coordinates);

  const pad = Math.max(0.25, (maxX - minX) * 0.04);
  minX -= pad; maxX += pad; minY -= pad; maxY += pad;

  // Beaucoup de points par côté pour que les bords restent bien droits
  const ring = [], N = 24;
  for (let i = 0; i <= N; i++) ring.push([minX + (maxX - minX) * i / N, maxY]);
  for (let i = 1; i <= N; i++) ring.push([maxX, maxY - (maxY - minY) * i / N]);
  for (let i = 1; i <= N; i++) ring.push([maxX - (maxX - minX) * i / N, minY]);
  for (let i = 1; i < N; i++) ring.push([minX, minY + (maxY - minY) * i / N]);
  ring.push(ring[0]);

  state.boxSeries.data.setAll([{ geometry: { type: "Polygon", coordinates: [ring] } }]);
}

function setDotsActive(pid, on) {
  (state.dots[pid] || []).forEach(o => {
    if (!o) return;
    o.dot.animate({ key: "radius", to: on ? DOT_RADIUS_ACTIVE : DOT_RADIUS, duration: 200 });
    o.halo.animate({ key: "radius", to: on ? DOT_RADIUS_ACTIVE + 3.5 : 0, duration: 200 });
    if (on) o.dot.parent?.toFront?.();
  });
}

function pulse(pid, idx, on) {
  const o = (state.dots[pid] || [])[idx];
  if (!o) return;
  o.dot.animate({ key: "radius", to: on ? DOT_RADIUS_HOVER : DOT_RADIUS_ACTIVE, duration: 150 });
  o.halo.animate({ key: "radius", to: on ? DOT_RADIUS_HOVER + 5 : DOT_RADIUS_ACTIVE + 3.5, duration: 150 });
}

/* ---------- Panneau de droite ---------- */
function siteDetails(s) {
  return `${s[1]} · ${CATEGORIES[s[1]].label}${s[4] ? " · Localisation indicative" : ""}`;
}

function renderDetail(p) {
  const n = p.sites.length;
  const txt = n === 0 ? "Aucun site répertorié"
            : n === 1 ? "1 site répertorié"
            : `${n} sites répertoriés`;

  badge.classList.toggle("active", n > 0);
  badgeText.textContent = txt;
  titleEl.textContent = p.name;
  subEl.textContent = n ? txt : "Aucun site n’est répertorié pour cette province dans cette vue.";

  listEl.innerHTML = "";
  p.sites.forEach((s, i) => {
    const li = document.createElement("li");
    li.className = "site-item";
    li.style.animationDelay = (i * 25) + "ms";
    li.innerHTML = `<span class="dot" style="background:${CATEGORIES[s[1]].color}"></span><div><h3>${s[0]}</h3><p>${siteDetails(s)}</p></div>`;
    li.addEventListener("mouseenter", () => pulse(p.id, i, true));
    li.addEventListener("mouseleave", () => pulse(p.id, i, false));
    li.addEventListener("click", () => highlightItem(i));
    listEl.appendChild(li);
  });
  listEl.scrollTop = 0;
  listEl.classList.toggle("scroll", n > 4);
}

function highlightItem(idx) {
  const items = listEl.querySelectorAll(".site-item");
  items.forEach(el => el.classList.remove("hl"));
  const el = items[idx];
  if (!el) return;
  el.classList.add("hl");
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function showMapMessage(text) {
  mapMsg.textContent = text;
  mapMsg.hidden = false;
}

/* ---------- Construction de la carte ---------- */
if (!window.am5 || !window.am5map) {
  showMapMessage("Impossible de charger amCharts. Vérifiez votre connexion Internet (la bibliothèque est chargée depuis cdn.amcharts.com).");
} else if (!GEODATA) {
  showMapMessage("amCharts est chargé, mais pas le fond de carte de la RDC (geodata/congoDRHigh.js).");
} else {
  am5.ready(() => { try { buildMap(); } catch (e) { console.error(e); showMapMessage("Erreur lors de la création de la carte : " + e.message); } });
}
