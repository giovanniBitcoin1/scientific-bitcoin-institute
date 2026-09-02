/* SBI Event Globe — motore del globo interattivo (three.js r128).
   I pin arrivano dall'Event Journal via window.SBI_EVENTS: vedi il blocco
   EVENTI qui sotto. Non aggiungere tappe a mano in questo file. */
"use strict";
(function(){
/* ================================================================
   EVENTI — NON si modificano piu' qui.
   I pin sono generati automaticamente dai JSON dell'Event Journal
   (src/data/journal/*.json): EventGlobe.jsx li legge con lo stesso
   import.meta.glob delle pagine del Journal, li ordina nella stessa
   timeline cronologica crescente dell'indice, numera le tappe e
   passa il risultato qui in window.SBI_EVENTS.
   Per aggiungere una tappa basta quindi aggiungere l'evento al
   Journal con i campi "coords" e "place".
   Ogni voce ha: num, status, title, place, venue, date, lat, lng, url.
   Non ci sono eccezioni: una tappa senza un JSON nel Journal non ha
   un pin. Niente elenchi di tappe scritti a mano in questo file.
   ================================================================ */
const EVENTS = Array.isArray(window.SBI_EVENTS) ? window.SBI_EVENTS : [];
/* Percorso delle texture: di default in /sbi-event-globe/textures/.
   Si puo' cambiare qui oppure dal tag script:
   <script src="sbi-event-globe.js" data-assets="/altro/percorso/"></script> */
const ASSET_PATH = (document.currentScript && document.currentScript.dataset.assets) || "/sbi-event-globe/textures/";
const TEX_DAY    = ASSET_PATH + "earth-day.jpg";
const TEX_BUMP   = ASSET_PATH + "earth-bump.jpg";
const TEX_SPEC   = ASSET_PATH + "earth-spec.jpg";
const TEX_CLOUDS = ASSET_PATH + "earth-clouds.png";

  const wrap    = document.getElementById("sbigStage");
  const canvas  = document.getElementById("sbigCanvas");
  const tooltip = document.getElementById("sbigTooltip");
  const ttTitle = document.getElementById("sbigTtTitle");
  const ttMeta  = document.getElementById("sbigTtMeta");
  const card    = document.getElementById("sbigCard");
  const cardPlace = document.getElementById("sbigCardPlace");
  const cardRows  = document.getElementById("sbigCardRows");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---- un segnaposto per citta' ----
     Si raggruppa sul campo "place" dell'evento, non sulla distanza: due
     eventi finiscono nello stesso pin solo se sono davvero nella stessa
     citta' (i 3 di Lugano, i 2 di Praga). Una soglia in gradi univa invece
     citta' diverse ma vicine, per esempio San Marino e Cervia.
     Il pin si posiziona sulla media delle sedi di quella citta'. */
  const clusters = [];
  EVENTS.forEach(ev => {
    const key = (ev.place || ev.title || "").trim().toLowerCase();
    let c = clusters.find(c => c.key === key);
    if (!c){ c = { key: key, label: ev.place || ev.title, lat: ev.lat, lng: ev.lng, events: [] }; clusters.push(c); }
    c.events.push(ev);
    c.lat = c.events.reduce((s, e) => s + e.lat, 0) / c.events.length;
    c.lng = c.events.reduce((s, e) => s + e.lng, 0) / c.events.length;
  });
  clusters.forEach(c => {
    // Una citta' con almeno una tappa gia' fatta resta un pin "past";
    // diventa "upcoming" (vuoto) solo se tutti i suoi eventi sono futuri.
    c.hasPast = c.events.some(e => e.status === "past");
    c.hasUpcoming = c.events.some(e => e.status === "upcoming");
    // Numero mostrato nel pin: la PRIMA tappa di quella citta' sulla
    // timeline del Journal (3 per Praga, 5 per Lugano). Il dettaglio dei
    // singoli eventi, ciascuno col suo numero, sta nella scheda.
    const nums = c.events.map(e => e.num).filter(n => n);
    c.num = nums.length ? Math.min.apply(null, nums) : null;
  });

  // lat/lng -> punto 3D sulla sfera
  function ll2v(lat, lng, r){
    const phi = (90 - lat) * Math.PI / 180;
    const th  = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(th),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(th)
    );
  }

  /* ---------- scena ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 2.92);

  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  tilt.add(spin);
  scene.add(tilt);
  tilt.rotation.x = 0.30;

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xfff4e0, 0.72);
  sun.position.set(-2, 1.4, 2.6);
  scene.add(sun);

  /* ---- Terra realistica: texture NASA ---- */
  const maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
  const manager = new THREE.LoadingManager(() => { wrap.classList.add("sbig-ready"); });
  const loader = new THREE.TextureLoader(manager);
  function tex(src, srgb){
    const t = loader.load(src);
    if (srgb) t.encoding = THREE.sRGBEncoding;
    t.anisotropy = maxAniso;
    return t;
  }
  const dayTex    = tex(TEX_DAY, true);
  const bumpTex   = tex(TEX_BUMP, false);
  const specTex   = tex(TEX_SPEC, false);
  const cloudsTex = tex(TEX_CLOUDS, true);
  setTimeout(() => wrap.classList.add("sbig-ready"), 2000);

  spin.add(new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 96),
    new THREE.MeshPhongMaterial({
      map: dayTex,
      bumpMap: bumpTex, bumpScale: 0.05,
      specularMap: specTex, specular: new THREE.Color(0x2c3f52), shininess: 11
    })
  ));

  // Nuvole (strato separato, deriva lentamente)
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(1.008, 96, 96),
    new THREE.MeshLambertMaterial({ map: cloudsTex, transparent: true, opacity: 0.7, depthWrite: false })
  );
  spin.add(clouds);

  // Bordo atmosferico sul lembo del pianeta
  const rimVert = "varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  spin.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.011, 96, 96),
    new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(0x8fc0ff) } },
      vertexShader: rimVert,
      fragmentShader: "uniform vec3 c; varying vec3 vN; void main(){ float i = pow(1.0 - abs(vN.z), 3.0); gl_FragColor = vec4(c, 1.0) * i * 0.38; }",
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    })
  ));

  // Alone atmosferico esterno (fusione normale: visibile anche su sfondo chiaro)
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 96, 96),
    new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(0x6fa8ff) } },
      vertexShader: rimVert,
      fragmentShader: "uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.62 - vN.z, 3.0); gl_FragColor = vec4(c, clamp(i, 0.0, 1.0) * 0.55); }",
      side: THREE.BackSide, transparent: true, depthWrite: false
    })
  ));

  /* ---------- segnaposti (uno per gruppo di eventi) ---------- */
  const PIN = 0xf7931a; // colore dei segnaposti: cambia qui per provarne un altro (es. 0xe63946 = rosso)

  // Cerchio col numero di tappa disegnato sopra la goccia del pin.
  function countSprite(n){
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    g.fillStyle = "#" + PIN.toString(16).padStart(6, "0");
    g.beginPath(); g.arc(32, 32, 25, 0, Math.PI * 2); g.fill();
    g.lineWidth = 5; g.strokeStyle = "#ffffff"; g.stroke();
    g.fillStyle = "#ffffff";
    g.font = "700 30px Arial";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(String(n), 32, 34);
    const m = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(0.11);
    s.position.z = 0.108;
    return { s, m };
  }

  function glowSprite(){
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const col = "#" + PIN.toString(16).padStart(6, "0");
    const rg = g.createRadialGradient(64, 64, 0, 64, 64, 62);
    rg.addColorStop(0, col + "d9");
    rg.addColorStop(0.4, col + "59");
    rg.addColorStop(1, col + "00");
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
    const m = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
    return { s: new THREE.Sprite(m), m };
  }

  const pins = [];
  const hitMeshes = [];
  const UP_Z = new THREE.Vector3(0, 0, 1);
  clusters.forEach((cl, i) => {
    const dir = ll2v(cl.lat, cl.lng, 1).normalize();
    const g = new THREE.Group();
    g.position.copy(dir);
    g.quaternion.setFromUnitVectors(UP_Z, dir);

    const pinGroup = new THREE.Group(); // la goccia intera (galleggia e si ingrandisce al passaggio)
    g.add(pinGroup);

    // goccia da mappa: cono + testa + puntino.
    // Tappe gia' fatte: goccia arancione con puntino bianco.
    // Tappe solo in programma: goccia bianca con puntino arancione (piu' l'anello fisso).
    const isFuture = !cl.hasPast;
    const dropColor = isFuture ? 0xffffff : PIN;
    const dotColor  = isFuture ? PIN : 0xffffff;
    const coneMat = new THREE.MeshBasicMaterial({ color: dropColor, transparent: true });
    const coneGeo = new THREE.ConeGeometry(0.017, 0.042, 24);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.translate(0, 0, 0.025);
    const cone = new THREE.Mesh(coneGeo, coneMat);

    const headMat = new THREE.MeshBasicMaterial({ color: dropColor, transparent: true });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.024, 20, 20), headMat);
    head.position.z = 0.05;

    const dotMat = new THREE.MeshBasicMaterial({ color: dotColor, transparent: true });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 14, 14), dotMat);
    dot.position.z = 0.066;

    const gl = glowSprite();
    gl.s.scale.setScalar(0.16);
    gl.s.position.z = 0.045;

    const ringMat = new THREE.MeshBasicMaterial({ color: PIN, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.030, 0.040, 40), ringMat);
    ring.position.z = 0.012;

    pinGroup.add(cone, head, dot, gl.s);

    const extraMats = [];
    if (cl.hasUpcoming){
      // anello fisso "in programma qui": bianco sotto + arancione sopra
      const nwMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false });
      const nw = new THREE.Mesh(new THREE.RingGeometry(0.046, 0.061, 44), nwMat);
      nw.position.z = 0.011;
      const noMat = new THREE.MeshBasicMaterial({ color: PIN, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthWrite: false });
      const no = new THREE.Mesh(new THREE.RingGeometry(0.049, 0.058, 44), noMat);
      no.position.z = 0.0115;
      g.add(nw, no);
      extraMats.push(nwMat, noMat);
    }

    let cSprite = null;
    if (cl.num){
      cSprite = countSprite(cl.num);
      pinGroup.add(cSprite.s);
    }

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, depthTest: false })
    );
    hit.position.z = 0.045;
    hit.userData.idx = i;

    g.add(ring, hit);
    spin.add(g);
    hitMeshes.push(hit);
    pins.push({ cl, g, pinGroup, head, mats: [coneMat, headMat, dotMat], glowMat: gl.m, ring, ringMat, extraMats, cSprite, phase: (i * 0.37) % 1 });
  });

  /* ---------- etichette geografiche ----------
     k: "c" continenti, "o" oceani e mari, "n" nazioni.
     Continenti e oceani sono sempre visibili; le nazioni (e le voci
     con z:1) compaiono zoomando. Aggiungere una voce = una riga. */
  const LABELS = [
    { t:"North America", k:"c", z:0, lat:48,    lng:-102 },
    { t:"South America", k:"c", z:0, lat:-14,   lng:-59 },
    { t:"Europe",        k:"c", z:0, lat:57,    lng:38 },
    { t:"Africa",        k:"c", z:0, lat:4,     lng:21 },
    { t:"Asia",          k:"c", z:0, lat:47,    lng:95 },
    { t:"Oceania",       k:"c", z:0, lat:-19,   lng:157 },
    { t:"Antarctica",    k:"c", z:0, lat:-73,   lng:15 },
    { t:"Pacific Ocean", k:"o", z:0, lat:3,     lng:-152 },
    { t:"Atlantic Ocean",k:"o", z:0, lat:-18,   lng:-28 },
    { t:"Indian Ocean",  k:"o", z:0, lat:-22,   lng:78 },
    { t:"Southern Ocean",k:"o", z:0, lat:-59,   lng:-135 },
    { t:"Arctic Ocean",  k:"o", z:0, lat:77,    lng:55 },
    { t:"Mediterranean Sea", k:"o", z:1, lat:34.5, lng:17.5 },
    { t:"Caribbean Sea",     k:"o", z:1, lat:15.8, lng:-75 },
    { t:"Arabian Sea",       k:"o", z:1, lat:13.5, lng:64.5 },
    { t:"Gulf of Mexico",    k:"o", z:2, lat:25.4, lng:-91.5 },
    { t:"North Sea",         k:"o", z:2, lat:56.8, lng:3.2 },
    { t:"Black Sea",         k:"o", z:2, lat:43.3, lng:34.3 },
    { t:"Caspian Sea",       k:"o", z:2, lat:41.8, lng:50.8 },
    { t:"South China Sea",   k:"o", z:2, lat:13.8, lng:115.8 },
    { t:"Bay of Bengal",     k:"o", z:2, lat:13.2, lng:88.5 },
    { t:"Tasman Sea",        k:"o", z:2, lat:-40.5,lng:160.5 },
    { t:"Canada",        k:"n", z:1, lat:60,    lng:-108 },
    { t:"United States", k:"n", z:1, lat:39.5,  lng:-99 },
    { t:"Mexico",        k:"n", z:1, lat:23.8,  lng:-103 },
    { t:"Greenland",     k:"n", z:1, lat:72.5,  lng:-41 },
    { t:"Brazil",        k:"n", z:1, lat:-9.5,  lng:-52 },
    { t:"Argentina",     k:"n", z:1, lat:-35.5, lng:-65.5 },
    { t:"Colombia",      k:"n", z:1, lat:4,     lng:-73.5 },
    { t:"Peru",          k:"n", z:1, lat:-10,   lng:-75.5 },
    { t:"Chile",         k:"n", z:1, lat:-31.5, lng:-71 },
    { t:"United Kingdom",k:"n", z:1, lat:53.8,  lng:-3.2 },
    { t:"France",        k:"n", z:1, lat:46.8,  lng:2.4 },
    { t:"Spain",         k:"n", z:1, lat:40,    lng:-3.8 },
    { t:"Germany",       k:"n", z:1, lat:51.6,  lng:10.2 },
    { t:"Italy",         k:"n", z:1, lat:40.8,  lng:15.6 },
    { t:"Poland",        k:"n", z:1, lat:52.3,  lng:19.5 },
    { t:"Ukraine",       k:"n", z:1, lat:49.3,  lng:31.5 },
    { t:"Turkey",        k:"n", z:1, lat:39,    lng:35.5 },
    { t:"Russia",        k:"n", z:1, lat:61,    lng:94 },
    { t:"Kazakhstan",    k:"n", z:1, lat:48.2,  lng:67.5 },
    { t:"Egypt",         k:"n", z:1, lat:26.5,  lng:29.5 },
    { t:"Algeria",       k:"n", z:1, lat:27.5,  lng:2.8 },
    { t:"Nigeria",       k:"n", z:1, lat:9.5,   lng:8 },
    { t:"Ethiopia",      k:"n", z:1, lat:8.5,   lng:39.8 },
    { t:"DR Congo",      k:"n", z:1, lat:-2.8,  lng:23.2 },
    { t:"South Africa",  k:"n", z:1, lat:-29.5, lng:24.5 },
    { t:"Saudi Arabia",  k:"n", z:1, lat:23.8,  lng:45 },
    { t:"Iran",          k:"n", z:1, lat:32.5,  lng:54.5 },
    { t:"Pakistan",      k:"n", z:1, lat:29,    lng:67.5 },
    { t:"India",         k:"n", z:1, lat:21.5,  lng:79 },
    { t:"China",         k:"n", z:1, lat:33.5,  lng:102.5 },
    { t:"Japan",         k:"n", z:1, lat:36.5,  lng:138.8 },
    { t:"Indonesia",     k:"n", z:1, lat:-2.5,  lng:117.5 },
    { t:"Australia",     k:"n", z:1, lat:-25.5, lng:134 },
    { t:"Madagascar",    k:"n", z:1, lat:-19.5, lng:46.8 },
    { t:"Portugal",      k:"n", z:2, lat:39.5,  lng:-8.1 },
    { t:"Ireland",       k:"n", z:2, lat:53.2,  lng:-8.3 },
    { t:"Iceland",       k:"n", z:2, lat:64.9,  lng:-18.7 },
    { t:"Norway",        k:"n", z:2, lat:61.3,  lng:8.8 },
    { t:"Sweden",        k:"n", z:2, lat:62.8,  lng:16 },
    { t:"Finland",       k:"n", z:2, lat:63.3,  lng:26.8 },
    { t:"Austria",       k:"n", z:2, lat:47.4,  lng:14.6 },
    { t:"Hungary",       k:"n", z:2, lat:47,    lng:19.4 },
    { t:"Romania",       k:"n", z:2, lat:45.8,  lng:25 },
    { t:"Greece",        k:"n", z:2, lat:39.2,  lng:22.3 },
    { t:"Morocco",       k:"n", z:2, lat:31.6,  lng:-6.8 },
    { t:"Libya",         k:"n", z:2, lat:27,    lng:17.8 },
    { t:"Sudan",         k:"n", z:2, lat:15.8,  lng:30.2 },
    { t:"Mali",          k:"n", z:2, lat:17.6,  lng:-3.8 },
    { t:"Kenya",         k:"n", z:2, lat:0.4,   lng:37.8 },
    { t:"Tanzania",      k:"n", z:2, lat:-6.5,  lng:35 },
    { t:"Angola",        k:"n", z:2, lat:-12.4, lng:17.6 },
    { t:"Namibia",       k:"n", z:2, lat:-22,   lng:17.2 },
    { t:"Mozambique",    k:"n", z:2, lat:-17.5, lng:35.7 },
    { t:"Iraq",          k:"n", z:2, lat:32.8,  lng:43.5 },
    { t:"Afghanistan",   k:"n", z:2, lat:33.8,  lng:66.2 },
    { t:"Uzbekistan",    k:"n", z:2, lat:41.6,  lng:63.5 },
    { t:"Myanmar",       k:"n", z:2, lat:21,    lng:96.2 },
    { t:"Thailand",      k:"n", z:2, lat:15.6,  lng:101.2 },
    { t:"Vietnam",       k:"n", z:2, lat:14.2,  lng:108.6 },
    { t:"Malaysia",      k:"n", z:2, lat:3.6,   lng:102.2 },
    { t:"Philippines",   k:"n", z:2, lat:12.8,  lng:122.6 },
    { t:"South Korea",   k:"n", z:2, lat:36.4,  lng:128 },
    { t:"Mongolia",      k:"n", z:2, lat:46.6,  lng:104 },
    { t:"New Zealand",   k:"n", z:2, lat:-42.5, lng:172.3 },
    { t:"Cuba",          k:"n", z:2, lat:21.9,  lng:-78.8 },
    { t:"Venezuela",     k:"n", z:2, lat:7.6,   lng:-66.2 },
    { t:"Bolivia",       k:"n", z:2, lat:-16.6, lng:-64.5 }
  ];

  function textSprite(t, kind){
    const c = document.createElement("canvas");
    let g = c.getContext("2d");
    const big = (kind !== "n");
    const fs = big ? 26 : 22;
    const weight = big ? "700" : "600";
    const style = (kind === "o") ? "italic " : "";
    const spacing = big ? 6 : 1;
    const text = big ? t.toUpperCase() : t;
    g.font = style + weight + " " + fs + "px Arial, sans-serif";
    let wpx = 0;
    for (const ch of text) wpx += g.measureText(ch).width + spacing;
    c.width = Math.ceil(wpx + 24); c.height = 48;
    g = c.getContext("2d");
    g.font = style + weight + " " + fs + "px Arial, sans-serif";
    g.textBaseline = "middle";
    g.shadowColor = "rgba(4,10,24,.85)"; g.shadowBlur = 7;
    g.fillStyle = "rgba(255,255,255,.95)";
    let x = 12;
    for (const ch of text){ g.fillText(ch, x, 25); x += g.measureText(ch).width + spacing; }
    const m = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false });
    const s = new THREE.Sprite(m);
    const hWorld = big ? 0.052 : 0.044;
    s.userData.w = hWorld * c.width / c.height;
    s.userData.h = hWorld;
    return { s, m };
  }
  const glabels = [];
  LABELS.forEach(L => {
    const o = textSprite(L.t, L.k);
    o.s.position.copy(ll2v(L.lat, L.lng, 1.02));
    spin.add(o.s);
    glabels.push({ L, s: o.s, m: o.m });
  });

  /* ---------- mappa piatta ---------- */
  const mapEl = document.getElementById("sbigMap");
  const btnViewGlobe = document.getElementById("sbigViewGlobe");
  const btnViewMap = document.getElementById("sbigViewMap");
  const zoomBox = wrap.querySelector(".sbig-zoom");
  let view = "globe";
  mapEl.style.backgroundImage = "url(" + TEX_DAY + ")";
  let mapBaseW = 0, mapBaseH = 0, mapS = 1, mapX = 0, mapY = 0, mapMoved = 0;
  const MAP_SMAX = 4;
  function mapLayout(){
    const w = wrap.clientWidth, h = wrap.clientHeight;
    const mw = mapBaseW * mapS, mh = mapBaseH * mapS;
    mapX = (mw <= w) ? (w - mw) / 2 : Math.min(0, Math.max(w - mw, mapX));
    mapY = (mh <= h) ? (h - mh) / 2 : Math.min(0, Math.max(h - mh, mapY));
    mapEl.style.width = mw + "px"; mapEl.style.height = mh + "px";
    mapEl.style.left = mapX + "px"; mapEl.style.top = mapY + "px";
    updateMapLabels();
  }
  function mapZoomAt(fx, fy, s2){
    s2 = Math.min(MAP_SMAX, Math.max(1, s2));
    const ux = (fx - mapX) / (mapBaseW * mapS);
    const uy = (fy - mapY) / (mapBaseH * mapS);
    mapS = s2;
    mapX = fx - ux * mapBaseW * mapS;
    mapY = fy - uy * mapBaseH * mapS;
    hideTooltip();
    mapLayout();
  }
  const mPointers = new Map();
  let mPinch = false, mPinchDist = 0, mPinchS = 1, mLastX = 0, mLastY = 0, mDragging = false;
  mapEl.addEventListener("pointerdown", e => {
    mPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    mapMoved = 0;
    if (mPointers.size === 2){
      mPinch = true; mDragging = false;
      mapEl.classList.remove("sbig-mdrag");
      const [a, b] = [...mPointers.values()];
      mPinchDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      mPinchS = mapS;
    } else if (e.target === mapEl){
      mDragging = true; mLastX = e.clientX; mLastY = e.clientY;
      mapEl.classList.add("sbig-mdrag");
      mapEl.setPointerCapture(e.pointerId);
    }
  });
  mapEl.addEventListener("pointermove", e => {
    if (mPointers.has(e.pointerId)) mPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (mPinch && mPointers.size >= 2){
      const [a, b] = [...mPointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = wrap.getBoundingClientRect();
      if (d > 0) mapZoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, mPinchS * d / mPinchDist);
      mapMoved = 99;
      return;
    }
    if (!mDragging) return;
    const dx = e.clientX - mLastX, dy = e.clientY - mLastY;
    mLastX = e.clientX; mLastY = e.clientY;
    mapMoved += Math.abs(dx) + Math.abs(dy);
    mapX += dx; mapY += dy;
    hideTooltip();
    mapLayout();
  });
  function mEnd(e){
    mPointers.delete(e.pointerId);
    if (mPointers.size < 2) mPinch = false;
    mDragging = false;
    mapEl.classList.remove("sbig-mdrag");
  }
  mapEl.addEventListener("pointerup", mEnd);
  mapEl.addEventListener("pointercancel", mEnd);
  mapEl.addEventListener("wheel", e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const r = wrap.getBoundingClientRect();
    mapZoomAt(e.clientX - r.left, e.clientY - r.top, mapS * Math.exp(-e.deltaY * 0.0016));
  }, { passive: false });
  clusters.forEach((cl, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sbig-mpin" + (cl.hasPast ? "" : " sbig-mpin-future") + (cl.hasUpcoming ? " sbig-mpin-up" : "");
    b.style.left = ((cl.lng + 180) / 360 * 100) + "%";
    b.style.top  = ((90 - cl.lat) / 180 * 100) + "%";
    b.setAttribute("aria-label",
      (cl.num ? "Stop " + cl.num + ": " : "") + cl.label + " — " +
      cl.events.length + (cl.events.length > 1 ? " events" : " event"));
    if (cl.num){
      const n = document.createElement("span");
      n.className = "sbig-mcount";
      n.textContent = cl.num;
      b.appendChild(n);
    }
    b.addEventListener("click", () => { if (mapMoved > 6) return; openCard(i); });
    b.addEventListener("mouseenter", () => showMapTooltip(i, b));
    b.addEventListener("mouseleave", hideTooltip);
    b.addEventListener("focus", () => showMapTooltip(i, b));
    b.addEventListener("blur", hideTooltip);
    mapEl.appendChild(b);
  });

  LABELS.forEach(L => {
    const d = document.createElement("div");
    d.className = "sbig-lbl sbig-lbl-" + L.k + (L.z ? " sbig-lz" + L.z : "");
    d.textContent = (L.k === "n") ? L.t : L.t.toUpperCase();
    d.style.left = ((L.lng + 180) / 360 * 100) + "%";
    d.style.top  = ((90 - L.lat) / 180 * 100) + "%";
    mapEl.appendChild(d);
  });
  function updateMapLabels(){
    mapEl.classList.toggle("sbig-z1", mapS >= 1.5);
    mapEl.classList.toggle("sbig-z2", mapS >= 2.4);
  }
  function showMapTooltip(i, el){
    const cl = clusters[i];
    const pr = el.getBoundingClientRect(), sr = wrap.getBoundingClientRect();
    tooltip.style.left = (pr.left + pr.width / 2 - sr.left) + "px";
    tooltip.style.top  = (pr.top - sr.top) + "px";
    ttTitle.textContent = cl.label;
    ttMeta.textContent = cl.events.length > 1
      ? cl.events.length + " events — click to view"
      : cl.events[0].date + " — " + cl.events[0].venue;
    tooltip.hidden = false;
  }
  function setView(v){
    if (v === view) return;
    view = v;
    const globeMode = (v === "globe");
    canvas.style.display = globeMode ? "" : "none";
    mapEl.hidden = globeMode;
    btnViewGlobe.classList.toggle("sbig-active", globeMode);
    btnViewMap.classList.toggle("sbig-active", !globeMode);
    btnViewGlobe.setAttribute("aria-pressed", String(globeMode));
    btnViewMap.setAttribute("aria-pressed", String(!globeMode));
    hideTooltip(); closeCard();
    if (globeMode) start(); else stop();
  }
  btnViewGlobe.addEventListener("click", () => setView("globe"));
  btnViewMap.addEventListener("click", () => setView("map"));

  /* ---------- interazione ---------- */
  let dragging = false, px = 0, py = 0, movedPx = 0, vx = 0, vy = 0;
  let idleTime = 10;
  let focusTarget = null;
  let hovered = -1, selected = -1;
  const raycaster = new THREE.Raycaster();
  const mouseN = new THREE.Vector2();
  let mouseInside = false;
  const autoSpeed = reduced ? 0 : 0.055;
  const MINZ = 1.6; let MAXZ = 3.8;         // limiti di zoom (vicino / lontano)
  let baseZ = 2.92, camZ = 2.92, camZTarget = 2.92, userZoomed = false;
  const pointers = new Map();
  let pinching = false, pinchStartDist = 0, pinchStartZ = 0;
  function setZoom(z){ camZTarget = clamp(z, MINZ, MAXZ); userZoomed = true; }

  const nearestAngle = (cur, target) => target + 2 * Math.PI * Math.round((cur - target) / (2 * Math.PI));

  function focusOn(cl){
    const p = ll2v(cl.lat, cl.lng, 1);
    const ry = Math.atan2(-p.x, p.z);
    const rx = clamp(Math.atan2(p.y, Math.hypot(p.x, p.z)), -0.95, 0.95);
    focusTarget = { ry: nearestAngle(spin.rotation.y, ry), rx };
    idleTime = -6;
  }

  (function initialView(){
    let cl = clusters[0] || { lat: 45, lng: 9, events: [] };
    for (const c of clusters) if (c.events.length > (cl.events ? cl.events.length : 0)) cl = c;
    const p = ll2v(cl.lat, cl.lng, 1);
    spin.rotation.y = Math.atan2(-p.x, p.z);
  })();

  function openCard(i){
    selected = i;
    const cl = clusters[i];
    cardPlace.textContent = cl.label;
    cardRows.textContent = "";
    // Gli eventi di una stessa citta' sono elencati nell'ordine della
    // timeline del Journal; le tappe senza pagina non hanno numero ne' link.
    cl.events.slice().sort((a, b) => (a.num || 99) - (b.num || 99)).forEach(ev => {
      const row = document.createElement("div"); row.className = "sbig-row";
      if (ev.num){
        const num = document.createElement("span");
        num.className = "sbig-num";
        num.textContent = ev.num;
        row.appendChild(num);
      }
      const pill = document.createElement("span");
      pill.className = "sbig-pill " + (ev.status === "past" ? "sbig-pill-past" : "sbig-pill-next");
      pill.textContent = ev.status === "past" ? "Past" : "Upcoming";
      const meta = document.createElement("p"); meta.className = "sbig-rmeta";
      meta.textContent = ev.date + " · " + ev.venue;
      const title = document.createElement("p"); title.className = "sbig-rtitle";
      title.textContent = ev.title;
      row.append(pill, meta, title);
      if (ev.url){
        const a = document.createElement("a");
        a.className = "sbig-view"; a.href = ev.url;
        a.textContent = "View event →";
        row.appendChild(a);
      }
      cardRows.appendChild(row);
    });
    card.hidden = false;
    requestAnimationFrame(() => card.classList.add("sbig-show"));
    if (view === "globe") focusOn(cl);
  }
  function closeCard(){
    if (selected < 0 && card.hidden) return;
    selected = -1;
    card.classList.remove("sbig-show");
    setTimeout(() => { if (selected < 0) card.hidden = true; }, 200);
  }
  document.getElementById("sbigCardClose").addEventListener("click", closeCard);

  function hideTooltip(){ tooltip.hidden = true; }

  function updateMouse(e){
    const r = canvas.getBoundingClientRect();
    mouseN.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    mouseN.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
  }

  canvas.addEventListener("pointerdown", e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    focusTarget = null;
    hideTooltip();
    if (pointers.size === 2){
      // due dita: pizzica per zoomare
      pinching = true; dragging = false; movedPx = 99;
      canvas.classList.remove("sbig-dragging");
      const [a, b] = [...pointers.values()];
      pinchStartDist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      pinchStartZ = camZTarget;
      return;
    }
    dragging = true; movedPx = 0;
    px = e.clientX; py = e.clientY;
    vx = vy = 0;
    canvas.classList.add("sbig-dragging");
  });

  canvas.addEventListener("pointermove", e => {
    updateMouse(e);
    mouseInside = true;
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinching && pointers.size >= 2){
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0) setZoom(pinchStartZ * pinchStartDist / d);
      idleTime = 0;
      return;
    }
    if (!dragging) return;
    const zf = camZ / baseZ; // da vicino il trascinamento diventa piu' fine
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    movedPx += Math.abs(dx) + Math.abs(dy);
    spin.rotation.y += dx * 0.0052 * zf;
    tilt.rotation.x = clamp(tilt.rotation.x + dy * 0.0032 * zf, -1.05, 1.05);
    vx = dx * 0.0052 * zf; vy = dy * 0.0032 * zf;
    idleTime = 0;
  });

  function endDrag(e){
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinching = false;
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("sbig-dragging");
    idleTime = 0;
    if (movedPx < 7){
      updateMouse(e);
      raycaster.setFromCamera(mouseN, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      const WPl = new THREE.Vector3();
      const front = hits.find(h => {
        h.object.getWorldPosition(WPl);
        return WPl.z > 0.12;
      });
      if (front) openCard(front.object.userData.idx);
      else closeCard();
    }
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", () => { mouseInside = false; hovered = -1; hideTooltip(); });

  // Ctrl/Cmd + rotellina (o pizzico sul trackpad): zoom senza bloccare lo scorrimento della pagina
  canvas.addEventListener("wheel", e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    setZoom(camZTarget * Math.exp(e.deltaY * 0.0016));
    idleTime = 0;
  }, { passive: false });

  document.getElementById("sbigZoomIn").addEventListener("click", () => {
    if (view === "globe"){ setZoom(camZTarget * 0.78); idleTime = 0; }
    else mapZoomAt(wrap.clientWidth / 2, wrap.clientHeight / 2, mapS * 1.35);
  });
  document.getElementById("sbigZoomOut").addEventListener("click", () => {
    if (view === "globe"){ setZoom(camZTarget * 1.28); idleTime = 0; }
    else mapZoomAt(wrap.clientWidth / 2, wrap.clientHeight / 2, mapS / 1.35);
  });

  wrap.addEventListener("keydown", e => {
    const K = e.key;
    if (view !== "globe"){
      const cw = wrap.clientWidth, ch = wrap.clientHeight;
      if (K === "+" || K === "=") { mapZoomAt(cw / 2, ch / 2, mapS * 1.3); e.preventDefault(); }
      if (K === "-" || K === "_") { mapZoomAt(cw / 2, ch / 2, mapS / 1.3); e.preventDefault(); }
      if (K === "ArrowLeft")  { mapX += 60; hideTooltip(); mapLayout(); e.preventDefault(); }
      if (K === "ArrowRight") { mapX -= 60; hideTooltip(); mapLayout(); e.preventDefault(); }
      if (K === "ArrowUp")    { mapY += 60; hideTooltip(); mapLayout(); e.preventDefault(); }
      if (K === "ArrowDown")  { mapY -= 60; hideTooltip(); mapLayout(); e.preventDefault(); }
      if (K === "Escape") closeCard();
      return;
    }
    if (K === "ArrowLeft")  { spin.rotation.y -= 0.14; idleTime = 0; e.preventDefault(); }
    if (K === "ArrowRight") { spin.rotation.y += 0.14; idleTime = 0; e.preventDefault(); }
    if (K === "ArrowUp")    { tilt.rotation.x = clamp(tilt.rotation.x - 0.09, -1.05, 1.05); idleTime = 0; e.preventDefault(); }
    if (K === "ArrowDown")  { tilt.rotation.x = clamp(tilt.rotation.x + 0.09, -1.05, 1.05); idleTime = 0; e.preventDefault(); }
    if (K === "+" || K === "=") { setZoom(camZTarget * 0.8); idleTime = 0; e.preventDefault(); }
    if (K === "-" || K === "_") { setZoom(camZTarget * 1.25); idleTime = 0; e.preventDefault(); }
    if (K === "Escape") closeCard();
  });

  /* ---------- loop ---------- */
  const WP = new THREE.Vector3();
  const clock = new THREE.Clock();
  let elapsed = 0, running = false, rafId = 0;
  let introT = reduced ? 1 : 0;

  function step(dt){
    elapsed += dt;

    if (introT < 1){
      introT = Math.min(1, introT + dt / 1.1);
      const s = 0.86 + 0.14 * (1 - Math.pow(1 - introT, 3));
      tilt.scale.setScalar(s);
    }

    if (!reduced) clouds.rotation.y += dt * 0.006;

    // zoom morbido verso la distanza scelta
    camZ += (camZTarget - camZ) * Math.min(1, dt * 7);
    camera.position.z = camZ;

    if (focusTarget){
      const k = Math.min(1, dt * 5.5);
      spin.rotation.y += (focusTarget.ry - spin.rotation.y) * k;
      tilt.rotation.x += (focusTarget.rx - tilt.rotation.x) * k;
      if (Math.abs(focusTarget.ry - spin.rotation.y) < 0.0006 &&
          Math.abs(focusTarget.rx - tilt.rotation.x) < 0.0006) focusTarget = null;
    } else if (!dragging){
      spin.rotation.y += vx * dt * 60;
      tilt.rotation.x = clamp(tilt.rotation.x + vy * dt * 60, -1.05, 1.05);
      const damp = Math.exp(-dt * 3.4);
      vx *= damp; vy *= damp;
      idleTime += dt;
      const resume = clamp((idleTime - 2.2) / 1.8, 0, 1);
      spin.rotation.y += autoSpeed * dt * resume * clamp(camZ / baseZ, 0.35, 1);
    }

    for (let i = 0; i < pins.length; i++){
      const p = pins[i];
      p.g.getWorldPosition(WP);
      const f = clamp((WP.z + 0.05) / 0.33, 0, 1);
      p.g.scale.setScalar(clamp(camZ / baseZ, 0.5, 1.15));
      for (const m of p.mats) m.opacity = f;
      p.glowMat.opacity = 0.75 * f;
      for (const m of p.extraMats) m.opacity = 0.95 * f;
      if (p.cSprite) p.cSprite.m.opacity = f;
      const active = (i === hovered || i === selected);
      const lift = reduced ? 0 : Math.sin(elapsed * 1.7 + p.phase * 6.283) * 0.006;
      p.pinGroup.position.z = lift + (active ? 0.014 : 0);
      p.pinGroup.scale.setScalar(active ? 1.18 : 1);
      if (!reduced){
        const t = (elapsed * 0.55 + p.phase) % 1;
        p.ring.scale.setScalar(1 + t * 2.1);
        p.ringMat.opacity = (1 - t) * (active ? 0.85 : 0.65) * f;
      } else {
        p.ring.scale.setScalar(1.35);
        p.ringMat.opacity = 0.35 * f;
      }
    }

    const zf2 = camZ / baseZ;
    const v1 = clamp((0.88 - zf2) / 0.12, 0, 1);
    const v2 = clamp((0.64 - zf2) / 0.10, 0, 1);
    for (let i = 0; i < glabels.length; i++){
      const lb = glabels[i];
      lb.s.getWorldPosition(WP);
      const f = clamp((WP.z + 0.05) / 0.33, 0, 1);
      const tierV = lb.L.z === 2 ? v2 : (lb.L.z === 1 ? v1 : 1);
      lb.m.opacity = f * tierV * 0.95;
      lb.s.scale.set(lb.s.userData.w * zf2, lb.s.userData.h * zf2, 1);
    }

    if (!dragging && mouseInside){
      raycaster.setFromCamera(mouseN, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      let idx = -1;
      for (const h of hits){
        h.object.getWorldPosition(WP);
        if (WP.z > 0.12){ idx = h.object.userData.idx; break; }
      }
      hovered = idx;
      if (idx >= 0){
        const cl = clusters[idx];
        pins[idx].head.getWorldPosition(WP);
        WP.project(camera);
        const r = canvas.getBoundingClientRect();
        tooltip.style.left = ((WP.x * 0.5 + 0.5) * r.width)  + "px";
        tooltip.style.top  = ((-WP.y * 0.5 + 0.5) * r.height) + "px";
        ttTitle.textContent = cl.label;
        ttMeta.textContent = cl.events.length > 1
          ? cl.events.length + " events — click to view"
          : cl.events[0].date + " — " + cl.events[0].venue;
        tooltip.hidden = false;
        canvas.style.cursor = "pointer";
      } else {
        hideTooltip();
        canvas.style.cursor = "";
      }
    }
  }

  function loop(){
    rafId = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    step(dt);
    renderer.render(scene, camera);
  }
  function start(){ if (!running){ running = true; clock.start(); loop(); } }
  function stop(){ if (running){ running = false; cancelAnimationFrame(rafId); clock.stop(); } }
  document.addEventListener("visibilitychange", () => { document.hidden ? stop() : (view === "globe" && start()); });

  function resize(){
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    const prevW = mapBaseW * mapS || 1, prevH = mapBaseH * mapS || 1;
    const cfx = (w / 2 - mapX) / prevW, cfy = (h / 2 - mapY) / prevH;
    mapBaseW = Math.min(w, h * 2); mapBaseH = mapBaseW / 2;
    mapX = w / 2 - cfx * mapBaseW * mapS;
    mapY = h / 2 - cfy * mapBaseH * mapS;
    mapLayout();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // distanza che fa entrare tutta la sfera (atmosfera inclusa) nell'inquadratura, con margine
    const halfV = camera.fov * Math.PI / 360;
    const halfH = Math.atan(Math.tan(halfV) * camera.aspect);
    const half  = Math.min(halfV, halfH);
    baseZ = (1.13 / Math.sin(half)) * 1.06;
    MAXZ = baseZ * 1.35;
    if (!userZoomed){ camZ = camZTarget = baseZ; }
    else { camZTarget = clamp(camZTarget, MINZ, MAXZ); }
    camera.updateProjectionMatrix();
  }
  if (window.ResizeObserver) new ResizeObserver(resize).observe(wrap);
  window.addEventListener("resize", resize);
  resize();

  start();
})();
