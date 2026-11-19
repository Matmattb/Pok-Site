
/* ==========================================================
   PokéMonde — ambiances légendaires de l'accueil
   Sept mises en scène (Sinnoh, Hoenn, Unys, Kalos, Alola, Galar, Golems).
   Par défaut une ambiance au hasard à chaque visite ; le bouton 🎨 permet d'en choisir une (retenue).
   ========================================================== */
(function () {
  const $ = id => document.getElementById(id);
  const ART = PK.art('').slice(0, -4); // dossier des illustrations officielles (PokéAPI)
  const TYPE_COLORS = ["#9FA19F","#FF8000","#81B9EF","#9141CB","#915121","#AFA981","#91A119","#704170","#60A1B8","#E62829","#2980EF","#3FA129","#FAC000","#EF4179","#3DCEF3","#5060E1","#624D4E","#EF70EF"];
  const P = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r].map(v => +v.toFixed(1));
  const range = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const img = (id, cls = '', alt = '', style = '') => `<img class="${cls}" src="${ART}${id}.png" alt="${alt}"${style ? ` style="${style}"` : ''}>`;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CTA = () => `<a class="btn" href="jeux.html">🎮 Jouer maintenant</a><a class="btn ghost" href="pokedex.html">📖 Ouvrir le Pokédex</a>`;
  const LEAD = `Le repaire des dresseurs francophones : un Pokédex complet, des outils pour les fans et plein de mini-jeux pour tester tes connaissances, en défi du jour ou en mode illimité.`;
  const BR = { a: '⠁', c: '⠉', d: '⠙', e: '⠑', g: '⠛', i: '⠊', k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', r: '⠗', s: '⠎', t: '⠞', ' ': ' ' };
  const braille = s => [...s.toLowerCase()].map(c => BR[c] || '').join('');
  const hooks = { sp: 0, e: 0, u: 0 };

  /* ---------- Sinnoh ---------- */
  const dial = c => { const t = range(60, i => { const a = i / 60 * 6.283, big = i % 5 === 0, [x1, y1] = P(100, 100, big ? 74 : 80, a), [x2, y2] = P(100, 100, 86, a); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${big ? 1.4 : .6}" stroke-opacity="${big ? .8 : .35}"/>`; });
    return `<g class="spin-slow" stroke="${c}" fill="none"><circle cx="100" cy="100" r="96" stroke-opacity=".5" stroke-width=".8"/>${t}</g><line class="spin-mid" x1="100" y1="100" x2="100" y2="48" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/><line class="spin-fast" x1="100" y1="100" x2="100" y2="22" stroke="${c}" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>`; };
  const rift = (a, b) => [[96, 40, a, .5], [80, 33, b, .45], [62, 26, a, .4], [44, 18, b, .45], [24, 10, '#fff', .5]].map(([rx, ry, c, o], i) => `<ellipse class="warp" style="animation-delay:${-i * 1.5}s" cx="100" cy="100" rx="${rx}" ry="${ry}" fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width=".8"/>`).join('');
  const arceusHalo = () => {
    const spokes = range(4, i => { const a = i * 1.571 + .785, [x1, y1] = P(150, 150, 50, a), [x2, y2] = P(150, 150, 120, a); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; });
    const plates = TYPE_COLORS.map((c, i) => { const [x, y] = P(150, 150, 138, i / 18 * 6.283 - 1.571); return `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}" stroke="#ffe7a3" stroke-width=".8"/>`; }).join('');
    return `<defs><radialGradient id="snglow"><stop offset="0" stop-color="#ffe7a3" stop-opacity=".5"/><stop offset=".55" stop-color="#f2c75c" stop-opacity=".12"/><stop offset="1" stop-color="#f2c75c" stop-opacity="0"/></radialGradient></defs><circle cx="150" cy="150" r="150" fill="url(#snglow)"/><g class="rot-a" fill="none" stroke="#f2c75c"><circle cx="150" cy="150" r="120" stroke-width="1.6" stroke-opacity=".7"/><circle cx="150" cy="150" r="106" stroke-width=".8" stroke-opacity=".35" stroke-dasharray="2 8"/><g stroke-opacity=".3">${spokes}</g></g><g class="rot-b">${plates}</g>`;
  };

  /* ---------- Kalos ---------- */
  const arch = () => {
    const vines = range(14, i => { const t = i / 13, y = 480 - t * 300, x = 30 + Math.sin(t * 9) * 6; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4" transform="rotate(${i % 2 ? 35 : -35} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#9be15d" fill-opacity=".55"/>`; });
    return `<g fill="none" stroke="#d9b65c" stroke-linecap="round">
      <path d="M30 500 V210 C30 92 118 26 200 14 C282 26 370 92 370 210 V500" stroke-width="3"/>
      <path d="M50 500 V214 C50 108 130 50 200 38 C270 50 350 108 350 214 V500" stroke-width="1"/>
      <path d="M30 300 C2 300 -4 262 18 250 C34 242 44 262 30 272" stroke-width="1.6"/><path d="M370 300 C398 300 404 262 382 250 C366 242 356 262 370 272" stroke-width="1.6"/>
      <path d="M200 14 C190 -6 170 -10 160 4 M200 14 C210 -6 230 -10 240 4" stroke-width="1.6"/>
      <circle cx="200" cy="14" r="9" fill="#0c2a28" stroke-width="2"/><circle cx="200" cy="14" r="3" fill="#d9b65c"/></g>
      <g>${vines}</g><g transform="matrix(-1 0 0 1 400 0)">${vines}</g>`;
  };
  const deadTree = () => { let d = ''; const br = (x, y, a, len, n) => { if (!n) return; const [x2, y2] = P(x, y, len, a); d += `M${x.toFixed(1)} ${y.toFixed(1)} L${x2} ${y2} `; br(x2, y2, a - .5, len * .7, n - 1); br(x2, y2, a + .42, len * .72, n - 1); }; br(450, 400, -1.571, 110, 8);
    return `<svg viewBox="0 0 900 400"><path d="${d}" fill="none" stroke="#5a0a14" stroke-width="2" stroke-linecap="round"/></svg>`; };
  const hexCol = () => { const hex = (cx, cy, r) => range(6, i => { const [x, y] = P(cx, cy, r, i / 6 * 6.283 + .52); return `${i ? 'L' : 'M'}${x} ${y} `; }) + 'Z';
    return `<svg class="ka-cells" viewBox="0 0 140 900" preserveAspectRatio="xMaxYMid slice">${range(26, i => { const x = 40 + (i % 3) * 32 + (Math.floor(i / 3) % 2) * 16, y = 30 + Math.floor(i / 3) * 104 + (i % 3) * 18; return `<path d="${hex(x, y, 12)}" fill="#0b120a" fill-opacity=".6" stroke="#8be04e" stroke-opacity=".5"/><circle cx="${x}" cy="${y}" r="3.2" fill="#9be15d" style="animation: pulse ${2 + (i % 4)}s ease-in-out infinite ${-i * .3}s"/>`; })}</svg>`; };

  /* ---------- Alola ---------- */
  const palm = side => `<svg class="al-palms ${side}" viewBox="0 0 200 400"><path d="M70 400 C76 300 86 220 108 150 L116 152 C96 222 88 300 86 400 Z"/>${range(7, i => { const a = -2.9 + i * .38; const [x, y] = P(112, 150, 92, a), [cx, cy] = P(112, 150, 60, a - .25); return `<path d="M112 150 Q${cx} ${cy - 20} ${x} ${y + 24} Q${cx + 6} ${cy} 112 156 Z"/>`; })}</svg>`;

  /* ---------- Galar ---------- */
  const crest = () => `<svg class="ga-crest" viewBox="0 0 400 520" aria-hidden="true"><defs>
      <linearGradient id="gablade" x1="0" x2="1"><stop offset="0" stop-color="#5d8fd8"/><stop offset=".5" stop-color="#eaf4ff"/><stop offset="1" stop-color="#3a6ab8"/></linearGradient>
      <linearGradient id="gashield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a5a" stop-opacity=".3"/><stop offset="1" stop-color="#8a0f2e" stop-opacity=".12"/></linearGradient>
      <linearGradient id="gagleam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="gaclip"><path d="M186 128 H214 V440 L200 500 L186 440 Z"/></clipPath></defs>
    <path d="M50 70 H350 V250 C350 380 270 450 200 500 C130 450 50 380 50 250 Z" fill="url(#gashield)" stroke="#ff6a5a" stroke-width="4"/>
    <path d="M72 92 H328 V250 C328 366 258 428 200 472 C142 428 72 366 72 250 Z" fill="none" stroke="#ffb0a0" stroke-opacity=".45" stroke-width="1.5"/>
    <path d="M72 210 H328" stroke="#ff6a5a" stroke-opacity=".3" stroke-width="1.5"/>
    <path d="M186 128 H214 V440 L200 500 L186 440 Z" fill="url(#gablade)" stroke="#cfe6ff" stroke-width="1.5"/>
    <path d="M200 132 V470" stroke="#2f5da8" stroke-opacity=".5" stroke-width="1.5"/>
    <g clip-path="url(#gaclip)"><rect class="ga-gleam" x="180" y="40" width="40" height="80" fill="url(#gagleam)"/></g>
    <path d="M118 104 H282 L270 128 H130 Z" fill="#6fb2ff" stroke="#e6f2ff" stroke-width="1.5"/>
    <circle cx="200" cy="116" r="10" fill="#ffd23f" stroke="#fff" stroke-width="1.5"/>
    <rect x="191" y="34" width="18" height="70" rx="4" fill="#24407a" stroke="#8fc4ff" stroke-width="1.5"/>
    <circle cx="200" cy="26" r="13" fill="#6fb2ff" stroke="#e6f2ff" stroke-width="1.5"/></svg>`;

  /* ================= Les thèmes ================= */
  const THEMES = {
    sinnoh: { name: 'Sinnoh', sub: 'La Genèse',
      stage: () => `<div class="sn-neb"></div><svg class="sn-dial" viewBox="0 0 200 200" overflow="visible">${dial('#5cc8ff')}</svg><svg class="sn-rift" viewBox="0 0 200 200" overflow="visible">${rift('#f28fd2', '#c99bff')}</svg>${img(483, 'sn-dialga')}${img(484, 'sn-palkia')}<div class="sn-under"></div><svg class="sn-tear" viewBox="0 0 1000 300" preserveAspectRatio="none">${range(7, i => `<path d="M0 ${300 - i * 34} C 180 ${250 - i * 40} 320 ${300 - i * 10} 500 ${230 - i * 36} S 820 ${300 - i * 30} 1000 ${250 - i * 34}" fill="none" stroke="${i % 2 ? '#c99bff' : '#ff5a8a'}" stroke-opacity="${(.5 - i * .05).toFixed(2)}" stroke-width="1.2" class="warp" style="transform-origin:500px 300px;animation-delay:${-i * 1.2}s"/>`)}</svg>${img(10007, 'sn-gira-st')}<div class="sn-edge l">Dialga · Le Temps · #0483</div><div class="sn-edge r">Palkia · L'Espace · #0484</div>`,
      hero: () => `<div class="sn-hero"><div class="sn-beam"></div><div class="sn-throne"><svg viewBox="0 0 300 300">${arceusHalo()}</svg>${img(493, '', 'Arceus')}</div>
        <h1>Bienvenue dans le <em>PokéMonde</em></h1>
        <p class="sn-verse">Avant toute chose, Arceus façonna l'univers. De lui naquirent Dialga, qui fit couler le temps, et Palkia, qui déploya l'espace.</p>
        <p class="sn-lead">${LEAD}</p><div class="cta">${CTA()}</div>
        <div class="sn-plates">${TYPE_COLORS.map(c => `<i style="color:${c}"></i>`).join('')}</div></div>`,
      coda: () => `<div class="sn-distortion"><span class="sn-isle" style="left:6%;top:18%;width:150px;height:70px"></span><span class="sn-isle" style="right:8%;top:40%;width:110px;height:54px;animation-delay:-3s"></span><span class="sn-isle" style="left:18%;bottom:12%;width:80px;height:40px;animation-delay:-5s"></span>
        <p class="sn-mirror">Monde Distorsion</p>
        <p>Il y avait un troisième dragon. Banni pour sa violence, Giratina observe notre monde depuis l'envers du décor. Plus tu descends, plus il s'approche.</p><small>Giratina · Forme Originelle · #0487 · Le Renégat</small></div>`,
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, 1], n: 260, c: ['191,234,255', '255,231,163', '255,209,240', '255,255,255'] }, { k: 'meteor', x: [0, 1], y: [0, .5], n: .004, c: ['255,231,163'] }] },

    hoenn: { name: 'Hoenn', sub: 'Le Choc',
      stage: () => `<div class="hz-sky"></div><div class="hz-rays"></div><span class="hz-cloud" style="left:-20vw;top:4vh"></span><span class="hz-cloud" style="right:-25vw;top:14vh;animation-delay:-19s"></span><div class="hz-ring"></div><span class="hz-cloud" style="left:10vw;top:30vh;height:9vh;animation-delay:-8s"></span><div class="hz-land"></div><div class="hz-sea"></div><div class="hz-horizon"></div><svg class="hz-seam" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="56,44 54,50 55,55 51,61 53,67 48,73 49,79 45,85 46,90 42,95 40,100" fill="none" stroke="#fff" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`,
      hero: () => `<div class="hz-hero"><span class="hz-glyph om">Ω</span><span class="hz-glyph al">α</span><span class="hz-sky-lab">Pilier Céleste</span>
        ${img(384, 'hz-ray', 'Rayquaza')}${img(383, 'hz-gro', 'Groudon')}${img(382, 'hz-kyo', 'Kyogre')}
        <div class="hz-copy"><div class="hz-kick"><span style="color:#ff7a3a">Terre</span><span style="color:#4fe08f">Ciel</span><span style="color:#4fb0ff">Mer</span></div>
        <h1>PokéMonde</h1>
        <p>Groudon soulève les continents, Kyogre gonfle les océans. Leur combat a failli engloutir Hoenn, jusqu'à ce que Rayquaza descende du ciel pour les séparer.</p>
        <p style="font-weight:600">${LEAD}</p><div class="cta">${CTA()}</div></div></div>`,
      parts: [{ k: 'rise', x: [0, .5], y: [.46, 1], n: 80, c: ['255,140,40', '255,200,80', '255,90,30'], s: [.8, 2.6], v: [.3, 1.2] },
              { k: 'rain', x: [.45, 1.08], y: [.44, 1], n: 130, c: ['190,225,255'], s: [10, 24], v: [8, 13] },
              { k: 'twinkle', x: [0, 1], y: [0, .4], n: 60, c: ['200,255,220', '255,255,255'], s: [.4, 1.2] },
              { k: 'bolt', x: [.15, .85], y: [0, .44], n: .014, c: ['215,255,225'] },
              { k: 'bolt', x: [.42, .58], y: [.44, 1], n: .008, c: ['255,250,220'] }] },

    unys: { name: 'Unys', sub: 'Noir & Blanc',
      stage: () => `<div class="un-split"></div>`,
      hero: () => `<div class="un-hero">
        <div class="un-labels"><span>Vérité</span><span>Idéal</span></div>
        <div class="un-arena">
          <svg class="un-taiji" viewBox="-100 -100 200 200"><circle r="96" fill="none" stroke="#fff" stroke-width="1.2"/><path fill="#fff" fill-rule="evenodd" d="M0 -96 A96 96 0 0 1 0 96 A48 48 0 0 1 0 0 A48 48 0 0 0 0 -96 Z M14 48 A14 14 0 1 0 -14 48 A14 14 0 1 0 14 48 Z"/><circle cy="-48" r="14" fill="#fff"/></svg>
          <button type="button" class="un-dragon un-resh" data-f="white" aria-pressed="false" aria-label="Fusionner Reshiram avec Kyurem">${img(643, '', 'Reshiram')}</button>
          <button type="button" class="un-dragon un-zek" data-f="black" aria-pressed="false" aria-label="Fusionner Zekrom avec Kyurem">${img(644, '', 'Zekrom')}</button>
          <button type="button" class="un-kyurem" id="un-ky" data-f="none" aria-label="Kyurem">${img(646, '', 'Kyurem')}</button>
          <small class="un-kyname" id="un-kyname">Kyurem · le vide</small>
        </div>
        <p class="un-hint" id="un-hint">Touche Reshiram ou Zekrom pour le rendre à Kyurem</p>
        <h1 class="un-title">PokéMonde</h1>
        <div class="un-copy"><p class="un-verse">Jadis, un seul dragon régnait sur Unys. Deux frères se disputèrent la vérité et l'idéal, et le dragon se brisa en deux. Ce qui resta, une enveloppe vide, se figea dans la glace.</p><p>${LEAD}</p></div>
        <div class="un-cta"><a class="btn w" href="jeux.html">Jouer</a><a class="btn b" href="pokedex.html">Pokédex</a></div></div>`,
      parts: [{ k: 'rise', x: [0, .5], y: [.15, 1], n: 80, c: ['255,255,255', '220,235,255'], s: [1, 3], v: [.4, 1.3] },
              { k: 'bolt', x: [.52, 1], y: [0, .8], n: .03, c: ['10,10,14'] },
              { k: 'fall', x: [.4, .6], y: [.4, 1], n: 40, c: ['143,216,255'], s: [.8, 2], v: [.3, .8] }] },

    kalos: { name: 'Kalos', sub: 'La Vie & la Mort',
      stage: () => `${hexCol()}<img class="ka-zyg" id="ka-zyg" data-f="10" src="${ART}10181.png" alt="">`,
      hero: () => `<div class="ka-hero"><div class="ka-portal"><div class="ka-aura"></div><svg viewBox="0 0 400 500">${arch()}</svg>${img(716, '', 'Xerneas')}</div>
        <div class="ka-copy"><div class="ka-eyebrow">Xerneas · Zygarde · Yveltal</div><h1>Bienvenue dans le Poké<span>Monde</span></h1>
        <p class="ka-verse"><b class="x">Xerneas</b> offre la vie et fait fleurir les forêts de Kalos. <b class="y">Yveltal</b>, au bout du chemin, la reprend. Entre eux, <b class="z">Zygarde</b> veille sur l'équilibre.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div><p class="ka-hint">⬢ Six cellules de Zygarde se cachent sur cette page…</p></div></div>`,
      coda: () => `<div class="ka-end">${deadTree()}${img(717, '', 'Yveltal')}<p>Mais toute vie a une fin. Quand Yveltal déploie ses ailes, il absorbe l'énergie de tout ce qui l'entoure, puis s'endort dans un cocon pour mille ans.</p><small>Yveltal · #0717 · La Destruction</small></div>`,
      parts: [{ k: 'fall', x: [0, 1], y: [0, 1], n: 46, c: ['255,182,193', '255,214,120', '130,210,255', '190,170,255'], s: [3, 6], v: [.4, 1], sh: 'leaf', w: () => 1 - hooks.sp },
              { k: 'fall', x: [0, 1], y: [0, 1], n: 46, c: ['150,20,35', '60,8,14', '20,4,8'], s: [3, 6], v: [.5, 1.2], sh: 'leaf', w: () => hooks.sp }] },

    alola: { name: 'Alola', sub: "L'Éclipse",
      hero: () => `<div class="al-hero" id="al-hero"><div class="al-sticky"><div class="al-day"></div><div class="al-night"></div><div class="al-gold"></div><div class="al-rays"></div>
        ${palm('l')}${palm('r')}<div class="al-sea"></div>
        <div class="al-disc al-sun">${img(791, '', 'Solgaleo')}</div><div class="al-disc al-moon">${img(792, '', 'Lunala')}</div>
        <div class="al-corona"></div>${img(800, 'al-necro', 'Necrozma')}${img(789, 'al-cosmog', 'Cosmog')}
        <figure class="al-fuse al-dusk">${img(10155, '', 'Necrozma Crinière du Couchant')}<figcaption>Crinière du Couchant</figcaption></figure>
        <figure class="al-fuse al-dawn">${img(10156, '', "Necrozma Ailes de l'Aurore")}<figcaption>Ailes de l'Aurore</figcaption></figure>
        ${img(10157, 'al-ultra', 'Ultra-Necrozma')}
        <div class="al-ultra-cap">Ultra-Explosion<b>Ultra-Necrozma</b></div><div class="al-flash"></div>
        <div class="al-copy gutter"><h1>PokéMonde</h1><p>Solgaleo porte la lumière du soleil, Lunala celle de la lune. Quand ils se rejoignent, Necrozma surgit, les absorbe et dévore la lumière, jusqu'à ce qu'elle explose.</p><p style="font-weight:600">${LEAD}</p><div class="cta">${CTA()}</div><p class="al-hints"><span class="al-hint">Fais défiler pour provoquer l'éclipse ↓</span><span class="al-hint two">Continue… Necrozma a encore faim ↓</span></p></div></div></div>`,
      pre: () => `<div class="section-title"><h2>Les gardiens des îles</h2></div><div class="al-tapus">
        ${[[785, 'Tokorico', 'Mele-Mele', '#f4d35e'], [786, 'Tokopiyon', 'Akala', '#ff8fb8'], [787, 'Tokotoro', 'Ula-Ula', '#ff6b5a'], [788, 'Tokopisco', 'Poni', '#a98bff']].map(([id, n, isl, c]) => `<div class="al-totem" style="--c:${c}">${img(id, '', n)}<b>${n}</b><span>Île de ${isl}</span></div>`).join('')}</div>`,
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, .7], n: 200, c: ['255,255,255', '210,200,255'], w: () => hooks.e - hooks.u },
              { k: 'rise', x: [0, 1], y: [.3, 1], n: 50, c: ['255,214,120', '255,170,80', '255,240,200'], s: [1, 2.4], v: [.3, .8], w: () => 1 - hooks.e },
              { k: 'rise', x: [.15, .85], y: [.1, 1], n: 90, c: ['255,255,235', '255,226,122', '255,190,80'], s: [1.5, 3.5], v: [.8, 2], sh: 'star', w: () => hooks.u }] },

    galar: { name: 'Galar', sub: 'La Nuit Noire',
      stage: () => `<div class="ga-sky"></div><div class="ga-vortex"></div>${img(890, 'ga-eter')}${[[4, 70, 0], [16, 52, -1.2], [30, 80, -2.5], [66, 74, -.6], [80, 58, -1.9], [92, 82, -3]].map(([l, h, d]) => `<span class="ga-pillar" style="left:${l}%;height:${h}vh;animation-delay:${d}s"></span>`).join('')}`,
      hero: () => `<div class="ga-hero"><p class="ga-present">PokéMonde présente</p>
        <div class="ga-duo">${crest()}${img(10189, 'zama', 'Zamazenta Bouclier Suprême')}${img(10188, 'zaci', 'Zacian Épée Suprême')}</div>
        <div class="ga-roles"><div><b>Le Bouclier</b><small>Zamazenta · Bouclier Suprême</small></div><i>✕</i><div><b>L'Épée</b><small>Zacian · Épée Suprême</small></div></div>
        <h1 class="ga-title">La Nuit Noire</h1><p class="ga-tag">Quand Éthernatos s'éveille, l'épée et le bouclier se lèvent</p>
        <p class="lead">${LEAD}</p><div class="cta"><a class="btn" href="jeux.html">⚔️ Jouer maintenant</a><a class="btn ghost" href="pokedex.html">🛡️ Ouvrir le Pokédex</a></div>
        <div class="ga-credits"><span class="s">une légende de</span> Galar <span class="s">avec</span> Zacian <span class="s">et</span> Zamazenta <span class="s">et la participation de</span> Éthernatos <span class="s">d'après</span> 1025 Pokémon <span class="s">sur</span> 9 générations <span class="s">pokédex</span> mini-jeux <span class="s">classements</span> défis du jour</div>
        <div class="ga-date">Bienvenue dans le PokéMonde</div></div>`,
      parts: [{ k: 'rise', x: [0, 1], y: [.3, 1], n: 130, c: ['255,60,120', '255,130,175', '200,40,90'], s: [1, 3], v: [.4, 1.4] }, { k: 'bolt', x: [.2, .8], y: [0, .4], n: .01, c: ['255,80,140'] }] },

    regi: { name: 'Golems', sub: 'Le Temple',
      stage: () => `<div class="go-wall"></div><div class="go-braille">${braille('regigigas pokemonde regirock regice registeel regieleki regidrago ').repeat(40)}</div><div class="go-dark" id="go-dark"></div>`,
      hero: () => `<div class="go-hero"><p class="go-key">${braille('regigigas')}</p><div class="go-door">${img(486, '', 'Regigigas')}</div>
        <div class="go-niches">${[[894, 'Regieleki', 0], [377, 'Regirock', 18], [379, 'Registeel', 28], [378, 'Regice', 18], [895, 'Regidrago', 0]].map(([id, n, dy]) => `<div class="go-niche" style="translate:0 ${dy}px">${img(id, '', n)}<span class="br">${braille(n)}</span><b>${n}</b></div>`).join('')}</div>
        <h1>PokéMonde</h1><p class="go-br">${braille('pokemonde')}</p>
        <div class="go-copy"><p class="go-verse">On raconte que Regigigas a tiré les continents avec des cordes pour les mettre en place. De l'argile, de la glace et du magma, il façonna des golems à son image. Bien plus tard s'éveillèrent Regieleki et Regidrago.</p><p>${LEAD}</p><div class="cta">${CTA()}</div><p class="go-hint">Déplace ta torche pour lire les inscriptions</p></div></div>`,
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, 1], n: 90, c: ['255,200,120', '230,170,90'], s: [.5, 1.6] }] },
  };

  /* ================= Particules ================= */
  const cv = $('fx'), ctx = cv.getContext('2d');
  const rnd = (a, b) => a + Math.random() * (b - a);
  let W = 0, H = 0, systems = [];
  function build(parts) {
    const k = Math.max(.35, (W * H) / (1440 * 900));
    systems = parts.map(p => {
      const R = { x0: p.x[0] * W, x1: p.x[1] * W, y0: p.y[0] * H, y1: p.y[1] * H }, s = p.s || [.3, 1.5], v = p.v || [1, 1];
      const make = any => ({ x: rnd(R.x0, R.x1), y: any ? rnd(R.y0, R.y1) : (p.k === 'rise' ? R.y1 + 10 : R.y0 - 10), s: rnd(s[0], s[1]), v: rnd(v[0], v[1]), ph: rnd(0, 6.28), c: p.c[Math.floor(Math.random() * p.c.length)], rot: rnd(0, 6.28) });
      const n = (p.k === 'bolt' || p.k === 'meteor') ? 0 : Math.round(p.n * k);
      return { ...p, R, make, list: Array.from({ length: n }, () => make(true)), fx: [] };
    });
  }
  function shape(sh, x, y, s, rot) {
    ctx.beginPath();
    if (sh === 'leaf') ctx.ellipse(x, y, s, s * .35, rot, 0, 6.283);
    else if (sh === 'star') { ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * .4, y - s * .4); ctx.lineTo(x + s * 2, y); ctx.lineTo(x + s * .4, y + s * .4); ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * .4, y + s * .4); ctx.lineTo(x - s * 2, y); ctx.lineTo(x - s * .4, y - s * .4); ctx.closePath(); }
    else if (sh === 'sq') ctx.rect(x - s, y - s, s * 2, s * 2);
    else ctx.arc(x, y, s, 0, 6.283);
  }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    for (const S of systems) {
      const w = S.w ? Math.max(0, Math.min(1, S.w())) : 1; if (w <= .01) continue;
      const R = S.R;
      if (S.k === 'bolt') {
        if (Math.random() < S.n) { let x = rnd(R.x0, R.x1), y = R.y0; const pts = [[x, y]], end = rnd(R.y0 + (R.y1 - R.y0) * .5, R.y1); while (y < end) { x += rnd(-22, 22); y += rnd(14, 34); pts.push([x, y]); } S.fx.push({ pts, life: 1 }); }
        for (const b of S.fx) { ctx.strokeStyle = `rgba(${S.c[0]},${b.life * w})`; ctx.lineWidth = 2.2; ctx.shadowColor = `rgba(${S.c[0]},1)`; ctx.shadowBlur = 14; ctx.beginPath(); b.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); b.life -= .07; }
        ctx.shadowBlur = 0; S.fx = S.fx.filter(b => b.life > 0); continue;
      }
      if (S.k === 'meteor') {
        if (Math.random() < S.n) S.fx.push({ x: rnd(R.x0, R.x1), y: R.y0 - 10, vx: rnd(-4, 4), vy: rnd(4, 7), life: 1 });
        for (const m of S.fx) { m.x += m.vx; m.y += m.vy; m.life -= .015; const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 10, m.y - m.vy * 10); g.addColorStop(0, `rgba(${S.c[0]},${m.life})`); g.addColorStop(1, `rgba(${S.c[0]},0)`); ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 10, m.y - m.vy * 10); ctx.stroke(); }
        S.fx = S.fx.filter(m => m.life > 0); continue;
      }
      if (S.k === 'rain') {
        ctx.lineWidth = 1; ctx.beginPath(); ctx.strokeStyle = `rgba(${S.c[0]},${.45 * w})`;
        for (const d of S.list) { d.y += d.v; d.x -= d.v * .25; ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.s * .25, d.y - d.s); if (d.y > R.y1 + 20) Object.assign(d, S.make(false), { y: R.y0 - 20 }); }
        ctx.stroke(); continue;
      }
      for (const d of S.list) {
        let a = 1, x = d.x;
        if (S.k === 'twinkle') a = .25 + .75 * Math.abs(Math.sin(d.ph + t * .0006 * (1 + d.v)));
        else if (S.k === 'rise') { d.y -= d.v; d.ph += .03; x = d.x + Math.sin(d.ph) * 8; a = Math.max(0, Math.min(1, (d.y - R.y0) / ((R.y1 - R.y0) * .6))); if (d.y < R.y0) Object.assign(d, S.make(false)); }
        else if (S.k === 'fall') { d.y += d.v; d.ph += .02; d.rot += .01; x = d.x + Math.sin(d.ph) * 14; if (d.y > R.y1 + 10) Object.assign(d, S.make(false)); }
        ctx.fillStyle = `rgba(${d.c},${(a * .9 * w).toFixed(3)})`; shape(S.sh, x, d.y, d.s, d.rot); ctx.fill();
      }
    }
    if (!still) requestAnimationFrame(frame);
  }

  /* ================= Comportements propres à certains thèmes ================= */
  const INIT = {
    unys() {
      const ky = $('un-ky'), kimg = ky.querySelector('img'), name = $('un-kyname'), hint = $('un-hint');
      const F = { none: [646, 'Kyurem · le vide', 'Kyurem'], white: [10023, 'Kyurem Blanc · la Vérité', 'Kyurem Blanc'], black: [10022, 'Kyurem Noir · l’Idéal', 'Kyurem Noir'] };
      [10022, 10023].forEach(id => { new Image().src = `${ART}${id}.png`; });
      let state = 'none', tid = 0;
      const set = s => {
        state = s;
        document.querySelectorAll('.un-dragon').forEach(b => { const on = b.dataset.f === s; b.classList.toggle('absorbed', on); b.setAttribute('aria-pressed', on); });
        hint.textContent = s === 'none' ? 'Touche Reshiram ou Zekrom pour le rendre à Kyurem' : `Touche Kyurem pour libérer ${s === 'white' ? 'Reshiram' : 'Zekrom'}`;
        clearTimeout(tid);
        tid = setTimeout(() => { kimg.src = `${ART}${F[s][0]}.png`; kimg.alt = F[s][2]; name.textContent = F[s][1]; ky.dataset.f = s; ky.classList.remove('burst'); void ky.offsetWidth; ky.classList.add('burst'); }, still ? 0 : (s === 'none' ? 150 : 700));
      };
      document.querySelectorAll('.un-dragon').forEach(b => b.onclick = () => set(state === b.dataset.f ? 'none' : b.dataset.f));
      ky.onclick = () => { if (state !== 'none') set('none'); };
      return { stop() { clearTimeout(tid); } };
    },
    kalos() {
      const TOTAL = 6, cellSvg = `<svg viewBox="-13 -13 26 26"><path d="M0 -12 L10.4 -6 L10.4 6 L0 12 L-10.4 6 L-10.4 -6 Z" fill="#0b120a" fill-opacity=".7" stroke="#8be04e" stroke-width="1.6"/><circle class="core" r="4" fill="#9be15d"/><circle r="1.6" fill="#ff5a5a"/></svg>`;
      const spots = [
        ['#hero .ka-portal', 'left:2%;top:34%'],
        ['main .daily', 'right:14px;bottom:14px'],
        ['main .grid-games .game-card:nth-child(5)', 'right:16px;top:16px'],
        ['main .stats-row .stat-box:nth-child(4)', 'right:8px;bottom:8px'],
        ['#coda .ka-end', 'left:24%;top:38%'],
        ['.site-footer', 'right:max(16px, 4vw);top:20px'],
      ];
      const added = [];
      let found = 0, hideT = 0;
      const zyg = $('ka-zyg');
      const form = n => n >= TOTAL ? ['100', 10120] : n >= 2 ? ['50', 718] : ['10', 10181];
      [718, 10120].forEach(id => { new Image().src = `${ART}${id}.png`; });
      const footer = document.querySelector('.site-footer'); const footPos = footer.style.position; footer.style.position = 'relative';
      const counter = document.createElement('div'); counter.className = 'ka-count'; counter.hidden = true; counter.setAttribute('role', 'status'); document.body.appendChild(counter); added.push(counter);
      const showPerfect = () => {
        const o = document.createElement('div'); o.className = 'ka-perfect'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Zygarde Forme Parfaite');
        o.innerHTML = `<div>${img(10120, '', 'Zygarde Forme Parfaite')}<h2>Zygarde · <span>Forme Parfaite</span></h2><p>Les six cellules se sont rassemblées. Quand l'équilibre de Kalos est menacé, Zygarde réunit toutes ses cellules et libère 100 % de sa puissance.</p><button class="btn" type="button">Retourner à Kalos</button></div>`;
        o.querySelector('button').onclick = () => o.remove();
        document.body.appendChild(o); added.push(o); o.querySelector('button').focus();
      };
      const collect = btn => {
        btn.classList.add('got'); btn.disabled = true; found++;
        const [f, id] = form(found), prev = zyg.dataset.f;
        if (f !== prev) { zyg.classList.add('swap'); setTimeout(() => { zyg.src = `${ART}${id}.png`; zyg.dataset.f = f; zyg.classList.remove('swap'); }, 400); }
        counter.hidden = false;
        counter.textContent = `⬢ ${found}/${TOTAL} cellules${f !== prev ? ` · Zygarde passe à ${f} %` : ''}`;
        counter.classList.remove('bump'); void counter.offsetWidth; counter.classList.add('bump');
        if (found >= TOTAL) setTimeout(showPerfect, 700);
      };
      spots.forEach(([sel, pos], i) => {
        const host = document.querySelector(sel); if (!host) return;
        const b = document.createElement('button'); b.type = 'button'; b.className = 'ka-cell'; b.style.cssText = pos; b.setAttribute('aria-label', `Cellule de Zygarde ${i + 1}`);
        b.innerHTML = cellSvg; b.onclick = () => collect(b); host.appendChild(b); added.push(b);
      });
      return { stop() { clearTimeout(hideT); added.forEach(el => el.remove()); footer.style.position = footPos; } };
    },
    alola() {
      const hero = $('al-hero');
      const cl = v => Math.max(0, Math.min(1, v));
      return { scroll() { const r = hero.getBoundingClientRect(); const P = cl(-r.top / Math.max(1, r.height - innerHeight));
        const e = cl(P / .42), f = cl((P - .48) / .52); hooks.e = e; hooks.u = cl((f - .78) * 5);
        hero.style.setProperty('--e', e.toFixed(3)); hero.style.setProperty('--f', f.toFixed(3)); } };
    },
    regi() {
      const dark = $('go-dark'); let mouse = false, raf = 0; const t0 = performance.now();
      const move = e => { if (e.pointerType !== 'mouse') return; mouse = true; dark.style.setProperty('--mx', e.clientX + 'px'); dark.style.setProperty('--my', e.clientY + 'px'); };
      addEventListener('pointermove', move);
      const loop = t => { dark.style.setProperty('--tr', (250 + Math.sin(t / 90) * 8 + Math.sin(t / 37) * 5).toFixed(0) + 'px');
        if (!mouse) { const s = (t - t0) / 3000; dark.style.setProperty('--mx', (50 + Math.sin(s) * 30).toFixed(1) + '%'); dark.style.setProperty('--my', (35 + Math.sin(s * 1.7) * 18).toFixed(1) + '%'); }
        if (!still) raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
      return { stop() { removeEventListener('pointermove', move); cancelAnimationFrame(raf); } };
    },
  };

  /* ================= Application ================= */
  let current = null, active = {};
  const root = document.documentElement;
  function onScroll() {
    root.style.setProperty('--p', Math.min(1, scrollY / (innerHeight * .9)).toFixed(3));
    hooks.sp = Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight));
    root.style.setProperty('--g', Math.max(0, Math.min(1, (hooks.sp - .3) / .6)).toFixed(3));
    active.scroll && active.scroll();
  }
  const IDS = Object.keys(THEMES);
  function apply(id, animate) {
    const t = THEMES[id]; if (!t || id === current) return;
    const go = () => {
      active.stop && active.stop();
      current = id;
      document.body.classList.remove('swapping', ...IDS.map(k => 't-' + k));
      document.body.classList.add('t-' + id);
      $('stage').innerHTML = t.stage ? t.stage() : '';
      $('hero').innerHTML = t.hero();
      $('pre').innerHTML = t.pre ? t.pre() : '';
      $('coda').innerHTML = t.coda ? t.coda() : '';
      active = INIT[id] ? INIT[id]() : {};
      hooks.e = 0; hooks.u = 0; onScroll();
      build(t.parts); if (still) frame(0);
      markMenu();
    };
    if (animate && !still) { document.body.classList.add('swapping'); setTimeout(() => { scrollTo({ top: 0, behavior: 'instant' }); go(); }, 350); } else go();
  }

  /* ================= Choix de l'ambiance (bouton 🎨) ================= */
  const amb = document.createElement('div');
  amb.className = 'amb';
  amb.innerHTML = `<div class="amb-menu" id="amb-menu" role="menu" hidden><p>Ambiance de l'accueil</p>
      <button type="button" role="menuitemradio" data-id="random">🎲 Au hasard<small>à chaque visite</small></button>
      ${IDS.map(id => `<button type="button" role="menuitemradio" data-id="${id}">${THEMES[id].name}<small>${THEMES[id].sub}</small></button>`).join('')}</div>
    <button type="button" class="amb-btn" aria-label="Changer l'ambiance de l'accueil" aria-expanded="false" aria-controls="amb-menu">🎨</button>`;
  const menu = amb.querySelector('.amb-menu'), toggle = amb.querySelector('.amb-btn');
  function markMenu() {
    const choice = PK.store.get('ambiance', 'random');
    menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.id === (choice === 'random' ? 'random' : current)));
  }
  const openMenu = v => { menu.hidden = !v; toggle.setAttribute('aria-expanded', v); };
  toggle.onclick = () => openMenu(menu.hidden);
  menu.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const id = b.dataset.id;
    PK.store.set('ambiance', id);
    openMenu(false);
    if (id === 'random') markMenu(); else apply(id, true);
  });
  document.addEventListener('click', e => { if (!amb.contains(e.target)) openMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openMenu(false); });

  function start() {
    document.body.appendChild(amb);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', resize); resize();
    const choice = PK.store.get('ambiance', 'random');
    apply(THEMES[choice] ? choice : PK.pick(IDS), false);
    if (!still) requestAnimationFrame(frame);
  }
  function resize() { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); if (current) { build(THEMES[current].parts); if (still) frame(0); } }
  // Après common.js, qui ajoute l'en-tête et le pied de page au chargement
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
