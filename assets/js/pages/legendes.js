
/* ==========================================================
   PokéMonde — ambiances légendaires de l'accueil
   Seize mises en scène : Sinnoh, Hoenn, Unys, Kalos, Alola, Galar, Golems,
   puis Ogerpon, les Fléaux, Sylveroy, le Dojo, les Forces, les Lames, les Lacs, Rêve & Cauchemar et la Méga-Évolution.
   Par défaut une ambiance au hasard à chaque visite ; le bouton 🎨 permet d'en choisir une (retenue).
   ========================================================== */
(function () {
  const $ = id => document.getElementById(id);
  const ART = PK.art('').slice(0, -4); // dossier des illustrations officielles (PokéAPI)
  const TYPE_COLORS = ["#9FA19F","#FF8000","#81B9EF","#9141CB","#915121","#AFA981","#91A119","#704170","#60A1B8","#E62829","#2980EF","#3FA129","#FAC000","#EF4179","#3DCEF3","#5060E1","#624D4E","#EF70EF"];
  const P = (cx, cy, r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r].map(v => +v.toFixed(1));
  const range = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const img = (id, cls = '', alt = '', style = '', extra = '') => `<img class="${cls}" src="${ART}${id}.png" alt="${alt}"${style ? ` style="${style}"` : ''}${extra}>`;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CTA = () => `<a class="btn" href="jeux.html">🎮 Jouer maintenant</a><a class="btn ghost" href="pokedex.html">📖 Ouvrir le Pokédex</a>`;
  const LEAD = `Le repaire des dresseurs francophones : un Pokédex complet, des outils pour les fans et plein de mini-jeux pour tester tes connaissances, en défi du jour ou en mode illimité.`;
  const BR = { a: '⠁', c: '⠉', d: '⠙', e: '⠑', g: '⠛', i: '⠊', k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', r: '⠗', s: '⠎', t: '⠞', ' ': ' ' };
  const braille = s => [...s.toLowerCase()].map(c => BR[c] || '').join('');
  const hooks = { sp: 0, e: 0, u: 0, mc: '63,200,140', g: 0, nm: 0, gx: 0, burst: () => {} };
  let toastT = 0;
  const toast = msg => { document.querySelectorAll('.lg-toast').forEach(t => t.remove()); clearTimeout(toastT); const t = document.createElement('div'); t.className = 'lg-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); toastT = setTimeout(() => t.remove(), 4200); };
  const repop = el => { el.classList.remove('popped'); void el.offsetWidth; el.classList.add('popped'); };
  const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const TYPES = { normal: ['Normal', '#9FA19F'], fighting: ['Combat', '#FF8000'], flying: ['Vol', '#81B9EF'], poison: ['Poison', '#9141CB'], ground: ['Sol', '#915121'], rock: ['Roche', '#AFA981'], bug: ['Insecte', '#91A119'], ghost: ['Spectre', '#704170'], steel: ['Acier', '#60A1B8'], fire: ['Feu', '#E62829'], water: ['Eau', '#2980EF'], grass: ['Plante', '#3FA129'], electric: ['Électrik', '#FAC000'], psychic: ['Psy', '#EF4179'], ice: ['Glace', '#3DCEF3'], dragon: ['Dragon', '#5060E1'], dark: ['Ténèbres', '#624D4E'], fairy: ['Fée', '#EF70EF'] };
  const typeTag = t => `<span class="type" style="background:${TYPES[t][1]}">${TYPES[t][0]}</span>`;


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

  /* ---------- Ogerpon : guirlandes de lanternes, collines, masques ---------- */
  const lanterns = () => {
    let s = '<defs><radialGradient id="oglg"><stop offset="0" stop-color="#fff3c8" stop-opacity=".9"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient></defs>';
    [[30, 90, 16, 0], [110, 120, 22, 1]].forEach(([y0, sag, n, k]) => {
      const at = t => [-40 + t * 1680, y0 + sag * (1 - Math.pow(2 * t - 1, 2))];
      s += `<path d="${range(41, i => { const [x, y] = at(i / 40); return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `; })}" fill="none" stroke="#1a1020" stroke-width="2"/>`;
      for (let i = 1; i < n; i++) {
        const [x, y] = at(i / n).map(v => +v.toFixed(1)), red = (i + k) % 2, c = red ? '#e8402a' : '#fff0d8', rib = red ? '#a8241a' : '#d8b890', cy = y + 34;
        s += `<g class="og-lan" style="transform-origin:${x}px ${y}px;animation-delay:${(-(i * .37 + k) % 4).toFixed(2)}s"><line x1="${x}" y1="${y}" x2="${x}" y2="${cy - 22}" stroke="#1a1020" stroke-width="1.5"/><circle class="glow" cx="${x}" cy="${cy}" r="36" fill="url(#oglg)" style="animation-delay:${-i * .4}s"/><ellipse cx="${x}" cy="${cy}" rx="14" ry="20" fill="${c}"/><ellipse cx="${x}" cy="${cy}" rx="14" ry="10" fill="none" stroke="${rib}" stroke-width="1"/><ellipse cx="${x}" cy="${cy}" rx="7" ry="20" fill="none" stroke="${rib}" stroke-width="1"/><rect x="${x - 7}" y="${cy - 23}" width="14" height="5" rx="1" fill="#1a1020"/><rect x="${x - 7}" y="${cy + 18}" width="14" height="5" rx="1" fill="#1a1020"/></g>`;
      }
    });
    return `<svg class="og-strings" viewBox="0 0 1600 330" preserveAspectRatio="xMidYMin slice">${s}</svg>`;
  };
  const ogHills = () => {
    const cedars = range(34, i => { const x = i * 50 + (i % 3) * 11, h = 60 + (i * 37 % 50), b = 400 - (i % 4) * 8 - 46; return `<path d="M${x} ${b - h} L${x + 16} ${b} L${x - 16} ${b} Z"/>`; });
    const stalls = range(7, i => { const x = 80 + i * 230; return `<rect x="${x}" y="356" width="120" height="44" fill="#120a1c"/><path d="M${x - 12} 358 L${x + 60} 336 L${x + 132} 358 Z" fill="#120a1c"/><rect x="${x + 10}" y="366" width="100" height="12" fill="#ffb060" opacity=".55" style="animation: pulse ${3 + i % 3}s ease-in-out infinite ${-i}s"/>`; });
    return `<svg class="og-hills" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice"><path d="M0 250 L180 150 L300 210 L460 110 L640 220 L820 140 L1000 230 L1180 120 L1360 210 L1600 150 V400 H0 Z" fill="#1c1338"/><path d="M0 300 L220 230 L420 290 L620 240 L860 300 L1100 236 L1320 290 L1600 250 V400 H0 Z" fill="#140d2a"/>
      <g fill="#0e0820">${cedars}</g><g transform="translate(1180 232)" fill="#0e0820"><rect x="-44" y="0" width="88" height="7"/><rect x="-36" y="12" width="72" height="5"/><rect x="-30" y="0" width="6" height="58"/><rect x="24" y="0" width="6" height="58"/></g>${stalls}</svg>`;
  };
  const MASKS = [
    [1017, 'Masque Turquoise', 'Plante', '#2fae7a', '63,200,140', 'M50 22 C42 30 44 38 50 40 C56 38 58 30 50 22 Z'],
    [10273, 'Masque du Puits', 'Eau', '#2f7fe0', '80,150,255', 'M38 30 Q44 24 50 30 Q56 36 62 30'],
    [10274, 'Masque du Fourneau', 'Feu', '#e2402c', '255,90,50', 'M50 20 C56 28 58 32 54 38 C52 34 48 34 46 38 C42 32 44 28 50 20 Z'],
    [10275, 'Masque de la Pierre', 'Roche', '#9a9284', '210,200,180', 'M40 24 L48 32 L44 38 M56 22 L54 30 L62 36'],
  ];
  const maskSvg = (c, sym) => `<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M28 24 L18 2 L40 16 Z M72 24 L82 2 L60 16 Z" fill="#fff0dc" stroke="#1a1020" stroke-width="2"/><path d="M50 10 C78 10 90 30 88 56 C86 82 70 104 50 106 C30 104 14 82 12 56 C10 30 22 10 50 10 Z" fill="${c}" stroke="#1a1020" stroke-width="2.5"/><path d="${sym}" fill="none" stroke="#fff0dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 44 Q34 34 46 44 M54 44 Q66 34 78 44" fill="none" stroke="#1a1020" stroke-width="5" stroke-linecap="round"/><ellipse cx="34" cy="54" rx="9" ry="6" fill="#1a1020"/><ellipse cx="66" cy="54" rx="9" ry="6" fill="#1a1020"/><circle cx="36" cy="53" r="2" fill="#ffe27a"/><circle cx="68" cy="53" r="2" fill="#ffe27a"/><circle cx="24" cy="70" r="6" fill="#fff" opacity=".18"/><circle cx="76" cy="70" r="6" fill="#fff" opacity=".18"/><path d="M30 78 Q50 96 70 78 Q50 86 30 78 Z" fill="#1a1020"/><path d="M38 81 L41 89 L44 82 Z M56 82 L59 89 L62 81 Z" fill="#fff"/></svg>`;
  const tomoe = () => `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="rgba(40,22,14,.55)" stroke="#d8342a" stroke-width="3"/><circle cx="100" cy="100" r="88" fill="none" stroke="#ffd9a8" stroke-opacity=".35" stroke-dasharray="1 7" stroke-width="3"/><g class="tomoe" fill="#ffd9a8" fill-opacity=".1">${range(3, i => `<path transform="rotate(${i * 120} 100 100)" d="M100 100 m0 -52 a26 26 0 1 1 0 52 a52 52 0 0 0 -26 -46 a26 26 0 0 1 26 -6 Z"/>`)}</g></svg>`;

  /* ---------- Les Quatre Fléaux ---------- */
  const ruClouds = () => `<svg class="ru-clouds" aria-hidden="true"><defs><pattern id="ruc" width="180" height="110" patternUnits="userSpaceOnUse"><path d="M10 70 C10 50 40 46 46 62 C50 72 38 78 32 70 C28 64 36 58 40 64 M46 62 C54 44 86 44 90 62 C94 76 76 82 70 72 C66 66 74 60 78 66 M90 62 C104 58 124 64 136 74 M0 84 H150" fill="none" stroke="#e8b84a" stroke-width="2" stroke-linecap="round"/><path d="M100 18 C100 6 118 4 120 14 C122 22 112 24 110 18 M120 14 C130 4 150 8 150 18 M86 26 H170" fill="none" stroke="#e8b84a" stroke-width="1.6" stroke-linecap="round"/></pattern></defs><rect width="100%" height="100%" fill="url(#ruc)"/></svg>`;
  const RUIN = [[1001, 'Chongjian', '简', 'Né de tablettes de bois', '#6fd06a', "Affaiblit l'Attaque"], [1002, 'Baojian', '剑', "Né d'une épée", '#7ad8ff', 'Affaiblit la Défense'], [1003, 'Dinglu', '鼎', "Né d'un chaudron rituel", '#e8a650', "Affaiblit l'Atq. Spé."], [1004, 'Yuyu', '玉', 'Né de perles de jade', '#ff6a3a', 'Affaiblit la Déf. Spé.']];

  /* ---------- Sylveroy ---------- */
  const carrot = c => `<svg viewBox="0 0 22 30" aria-hidden="true"><path d="M11 8 C17 8 17 12 15 18 L11 30 L7 18 C5 12 5 8 11 8 Z" fill="${c}"/><path d="M8 13 H12 M9 18 H13 M10 23 H12" stroke="rgba(0,0,0,.3)" stroke-width="1"/><path d="M11 9 C9 4 6 3 5 1 M11 9 C11 4 12 2 12 0 M11 9 C13 5 16 4 18 2" stroke="#6ad86a" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  const caMount = () => `<svg class="ca-mount" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax slice"><path d="M0 260 L160 120 L260 190 L420 60 L560 200 L700 110 L860 230 L1000 90 L1160 210 L1300 130 L1440 220 L1600 140 V400 H0 Z" fill="#1f2752"/><path d="M0 320 L240 260 L480 310 L760 250 L1040 320 L1300 266 L1600 300 V400 H0 Z" fill="#151b3e"/><path d="M0 360 C300 330 600 350 800 340 C1000 330 1300 350 1600 336 V400 H0 Z" fill="#dfe8ff" opacity=".18"/></svg>`;
  const crown = () => `<svg class="crown" viewBox="0 0 120 50" aria-hidden="true"><path d="M8 46 L4 12 L30 30 L44 4 L60 24 L76 4 L90 30 L116 12 L112 46 Z" fill="#a6e872" stroke="#e6ffd0" stroke-width="2" stroke-linejoin="round"/><circle cx="44" cy="6" r="4" fill="#fff"/><circle cx="76" cy="6" r="4" fill="#fff"/><circle cx="60" cy="36" r="5" fill="#6a3aa0" stroke="#e6ffd0"/></svg>`;
  const field = () => `<svg class="ca-field" viewBox="0 0 900 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M0 56 H900" stroke="#6a5a3a" stroke-width="3"/>${range(30, i => { const x = 15 + i * 30; return `<g class="sp" style="animation-delay:${-(i * .27).toFixed(2)}s"><path d="M${x} 56 V36" stroke="#6ad86a" stroke-width="2"/><path d="M${x} 40 C${x - 12} 34 ${x - 12} 26 ${x - 2} 28 Z M${x} 38 C${x + 12} 30 ${x + 14} 22 ${x + 3} 24 Z" fill="#8ae86a"/></g>`; })}</svg>`;

  /* ---------- Forces de la Nature ---------- */
  const FORCES = [['n', 641, 10019, 'Boréas', 'Vent', '#5ce08c'], ['e', 642, 10020, 'Fulguris', 'Foudre', '#6aa8ff'], ['s', 645, 10021, 'Démétéros', 'Terre', '#ffb347'], ['w', 905, 10249, 'Amovénus', 'Amour', '#ff8ac8']];
  const rose = () => { const pts = range(16, i => { const a = i / 16 * 6.283 - 1.571, r = i % 4 === 0 ? 190 : i % 2 ? 90 : 130, [x, y] = P(200, 200, r, a), [lx, ly] = P(200, 200, 26, a - .2), [rx, ry] = P(200, 200, 26, a + .2); return `<path d="M${lx} ${ly} L${x} ${y} L${rx} ${ry} Z" fill="${i % 4 === 0 ? 'rgba(255,207,74,.22)' : 'rgba(255,255,255,.07)'}" stroke="rgba(255,255,255,.25)" stroke-width=".8"/>`; });
    return `<svg viewBox="0 0 400 400" aria-hidden="true"><g class="turn"><circle cx="200" cy="200" r="196" fill="none" stroke="rgba(255,255,255,.2)" stroke-dasharray="2 6"/><circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,207,74,.25)"/>${pts}</g></svg>`; };
  const mirror = () => `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="fnglass" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#bfe6ff"/><stop offset="1" stop-color="#4a6aa8"/></radialGradient></defs>${range(8, i => { const [x, y] = P(50, 50, 46, i / 8 * 6.283); return `<circle cx="${x}" cy="${y}" r="5" fill="#ffcf4a" stroke="#7a5a10"/>`; })}<circle cx="50" cy="50" r="42" fill="#d8a83a" stroke="#7a5a10" stroke-width="2"/><circle cx="50" cy="50" r="34" fill="url(#fnglass)" stroke="#fff0b8" stroke-width="2"/><path class="shine" d="M32 36 Q40 26 52 26" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;

  /* ---------- Lames de la Justice ---------- */
  const lis = () => `<svg class="lj-lis" aria-hidden="true"><defs><pattern id="ljp" width="90" height="100" patternUnits="userSpaceOnUse"><g transform="translate(45 50)" fill="#d8c07a"><path d="M0 -30 C10 -18 10 -6 0 6 C-10 -6 -10 -18 0 -30 Z"/><path d="M-4 0 C-20 -14 -32 -2 -22 10 C-16 4 -10 4 -4 8 Z"/><path d="M4 0 C20 -14 32 -2 22 10 C16 4 10 4 4 8 Z"/><rect x="-14" y="8" width="28" height="5" rx="2"/><path d="M-3 13 L0 28 L3 13 Z"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#ljp)"/></svg>`;
  const cross = () => `<svg class="lj-cross" viewBox="-100 -100 200 200" aria-hidden="true"><g fill="#d8c07a">${range(4, i => `<path transform="rotate(${i * 90})" d="M-12 -12 L-16 -78 C-28 -80 -30 -94 -18 -96 C-12 -88 -6 -92 0 -100 C6 -92 12 -88 18 -96 C30 -94 28 -80 16 -78 L12 -12 Z"/>`)}</g></svg>`;
  const rapier = () => `<path d="M200 14 L203 120 L197 120 Z" fill="#dfe8f2" stroke="#8aa0b8" stroke-width=".8"/><path d="M178 122 Q200 112 222 122" fill="none" stroke="#d8c07a" stroke-width="4" stroke-linecap="round"/><path d="M200 120 C186 126 186 138 200 138 C214 138 214 126 200 120" fill="none" stroke="#d8c07a" stroke-width="2"/><rect x="197" y="124" width="6" height="22" rx="2" fill="#5a3a1a"/><circle cx="200" cy="150" r="5" fill="#d8c07a"/>`;
  const blades = () => `<svg class="lj-blades" viewBox="0 0 400 160" aria-hidden="true">${[['a', -34], ['b', 0], ['c', 34]].map(([k, a]) => `<g class="bl ${k}"><g transform="rotate(${a} 200 150)">${rapier()}</g></g>`).join('')}</svg>`;
  const LAMES = [[638, 'Cobaltium', 'Le chef au cœur de fer', '#6aa8e8'], [639, 'Terrakium', 'La force de la roche', '#c8a070'], [640, 'Viridium', "L'agilité du vent", '#7ad87a']];

  /* ---------- Trois Lacs ---------- */
  const lcMount = () => `<svg class="lc-mount" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice"><path d="M0 300 L0 200 L140 90 L240 150 L380 30 L520 160 L640 100 L780 200 L900 70 L1040 170 L1180 60 L1320 160 L1460 110 L1600 180 V300 Z" fill="#3a4a7a" opacity=".85"/><path d="M0 300 L0 250 L260 180 L520 240 L800 190 L1080 250 L1340 200 L1600 240 V300 Z" fill="#24335c"/></svg>`;
  const LACS = [[480, 'Créhelf', 'Lac Savoir', 'Le Savoir', '#f5d76e', '« Qui croise son regard perd la mémoire »'], [481, 'Créfollet', 'Lac Vérité', "L'Émotion", '#ff9ec7', '« Il apprit aux humains la joie et la peine »'], [482, 'Créfadet', 'Lac Courage', 'La Volonté', '#6fb6ff', '« Qui lui fait du mal ne peut plus bouger »']];

  /* ---------- Rêve & Cauchemar ---------- */
  const smoke = () => `<svg class="rv-smoke" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">${range(9, i => { const x = 60 + i * 110; return `<path style="animation-delay:${-i * 1.1}s" d="M${x} 600 C${x - 60} 460 ${x + 70} 380 ${x - 10} 260 C${x - 60} 190 ${x + 30} 120 ${x} 60" fill="none" stroke="${i % 3 ? '#0a0208' : '#3a0614'}" stroke-width="${40 + (i % 3) * 18}" stroke-linecap="round" opacity=".75"/>`; })}</svg>`;

  /* ---------- Méga-Évolution ---------- */
  const MEGAS = [[10033,3,"Méga-Florizarre","xy",["grass","poison"]],[10034,6,"Méga-Dracaufeu X","xy",["fire","dragon"]],[10035,6,"Méga-Dracaufeu Y","xy",["fire","flying"]],[10036,9,"Méga-Tortank","xy",["water"]],[10090,15,"Méga-Dardargnan","rosa",["bug","poison"]],[10073,18,"Méga-Roucarnage","rosa",["normal","flying"]],[10304,26,"Méga-Raichu X","zad",["electric"]],[10305,26,"Méga-Raichu Y","zad",["electric"]],[10278,36,"Méga-Mélodelfe","za",["fairy","flying"]],[10037,65,"Méga-Alakazam","xy",["psychic"]],[10279,71,"Méga-Empiflor","za",["grass","poison"]],[10071,80,"Méga-Flagadoss","rosa",["water","psychic"]],[10038,94,"Méga-Ectoplasma","xy",["ghost","poison"]],[10039,115,"Méga-Kangourex","xy",["normal"]],[10280,121,"Méga-Staross","za",["water","psychic"]],[10040,127,"Méga-Scarabrute","xy",["bug","flying"]],[10041,130,"Méga-Léviator","xy",["water","dark"]],[10042,142,"Méga-Ptéra","xy",["rock","flying"]],[10281,149,"Méga-Dracolosse","za",["dragon","flying"]],[10043,150,"Méga-Mewtwo X","xy",["psychic","fighting"]],[10044,150,"Méga-Mewtwo Y","xy",["psychic"]],[10282,154,"Méga-Méganium","za",["grass","fairy"]],[10283,160,"Méga-Aligatueur","za",["water","dragon"]],[10045,181,"Méga-Pharamp","xy",["electric","dragon"]],[10072,208,"Méga-Steelix","rosa",["steel","ground"]],[10046,212,"Méga-Cizayox","xy",["bug","steel"]],[10047,214,"Méga-Scarhino","xy",["bug","fighting"]],[10284,227,"Méga-Airmure","za",["steel","flying"]],[10048,229,"Méga-Démolosse","xy",["dark","fire"]],[10049,248,"Méga-Tyranocif","xy",["rock","dark"]],[10065,254,"Méga-Jungko","rosa",["grass","dragon"]],[10050,257,"Méga-Braségali","xy",["fire","fighting"]],[10064,260,"Méga-Laggron","rosa",["water","ground"]],[10051,282,"Méga-Gardevoir","xy",["psychic","fairy"]],[10066,302,"Méga-Ténéfix","rosa",["dark","ghost"]],[10052,303,"Méga-Mysdibule","xy",["steel","fairy"]],[10053,306,"Méga-Galeking","xy",["steel"]],[10054,308,"Méga-Charmina","xy",["fighting","psychic"]],[10055,310,"Méga-Élecsprint","xy",["electric"]],[10070,319,"Méga-Sharpedo","rosa",["water","dark"]],[10087,323,"Méga-Camérupt","rosa",["fire","ground"]],[10067,334,"Méga-Altaria","rosa",["dragon","fairy"]],[10056,354,"Méga-Branette","xy",["ghost"]],[10306,358,"Méga-Éoko","zad",["psychic","steel"]],[10057,359,"Méga-Absol","xy",["dark"]],[10307,359,"Méga-Absol Z","zad",["dark","ghost"]],[10074,362,"Méga-Oniglali","rosa",["ice"]],[10089,373,"Méga-Drattak","rosa",["dragon","flying"]],[10076,376,"Méga-Métalosse","rosa",["steel","psychic"]],[10062,380,"Méga-Latias","xy",["dragon","psychic"]],[10063,381,"Méga-Latios","xy",["dragon","psychic"]],[10077,382,"Primo-Kyogre","p",["water"]],[10078,383,"Primo-Groudon","p",["ground","fire"]],[10079,384,"Méga-Rayquaza","rosa",["dragon","flying"]],[10308,398,"Méga-Étouraptor","zad",["fighting","flying"]],[10088,428,"Méga-Lockpin","rosa",["normal","fighting"]],[10058,445,"Méga-Carchacrok","xy",["dragon","ground"]],[10309,445,"Méga-Carchacrok Z","zad",["dragon"]],[10059,448,"Méga-Lucario","xy",["fighting","steel"]],[10310,448,"Méga-Lucario Z","zad",["fighting","steel"]],[10060,460,"Méga-Blizzaroi","xy",["grass","ice"]],[10068,475,"Méga-Gallame","rosa",["psychic","fighting"]],[10285,478,"Méga-Momartik","za",["ice","ghost"]],[10311,485,"Méga-Heatran","zad",["fire","steel"]],[10312,491,"Méga-Darkrai","zad",["dark"]],[10286,500,"Méga-Roitiflam","za",["fire","fighting"]],[10287,530,"Méga-Minotaupe","za",["ground","steel"]],[10069,531,"Méga-Nanméouïe","rosa",["normal","fairy"]],[10288,545,"Méga-Brutapode","za",["bug","poison"]],[10289,560,"Méga-Baggaïd","za",["dark","fighting"]],[10290,604,"Méga-Ohmassacre","za",["electric"]],[10291,609,"Méga-Lugulabre","za",["ghost","fire"]],[10313,623,"Méga-Golemastoc","zad",["ground","ghost"]],[10292,652,"Méga-Blindépique","za",["grass","fighting"]],[10293,655,"Méga-Goupelin","za",["fire","psychic"]],[10294,658,"Méga-Amphinobi","za",["water","dark"]],[10295,668,"Méga-Némélios","za",["fire","normal"]],[10296,670,"Méga-Floette","za",["fairy"]],[10314,678,"Méga-Mistigrix ♂","zad",["psychic"]],[10326,678,"Méga-Mistigrix ♀","zad",["psychic"]],[10297,687,"Méga-Sepiatroce","za",["dark","psychic"]],[10298,689,"Méga-Golgopathe","za",["rock","fighting"]],[10299,691,"Méga-Kravarech","za",["poison","dragon"]],[10300,701,"Méga-Brutalibré","za",["fighting","flying"]],[10301,718,"Méga-Zygarde","za",["dragon","ground"]],[10075,719,"Méga-Diancie","rosa",["rock","fairy"]],[10315,740,"Méga-Crabominable","zad",["fighting","ice"]],[10316,768,"Méga-Sarmuraï","zad",["bug","steel"]],[10302,780,"Méga-Draïeul","za",["normal","dragon"]],[10317,801,"Méga-Magearna","zad",["steel","fairy"]],[10318,801,"Méga-Magearna Couleur du Passé","zad",["steel","fairy"]],[10319,807,"Méga-Zeraora","zad",["electric"]],[10303,870,"Méga-Hexadron","za",["fighting"]],[10320,952,"Méga-Scovilain","zad",["grass","fire"]],[10321,970,"Méga-Floréclat","zad",["rock","poison"]],[10322,978,"Méga-Nigirigon (Courbée)","zad",["dragon","water"]],[10323,978,"Méga-Nigirigon (Affalée)","zad",["dragon","water"]],[10324,978,"Méga-Nigirigon (Raide)","zad",["dragon","water"]],[10325,998,"Méga-Glaivodo","zad",["dragon","ice"]]];
  const SETS = { xy: ['X & Y', 'XY'], rosa: ['Rubis Oméga & Saphir Alpha', 'ROSA'], za: ['Légendes Z-A', 'Z-A'], zad: ['Z-A · Méga Dimension', 'DLC'] };
  const megaSym = () => `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="mgrb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a9a"/><stop offset=".25" stop-color="#ffe66a"/><stop offset=".5" stop-color="#6aff9a"/><stop offset=".75" stop-color="#5ad8ff"/><stop offset="1" stop-color="#b49aff"/></linearGradient><radialGradient id="mgcore"><stop offset="0" stop-color="#7af0ff" stop-opacity=".35"/><stop offset="1" stop-color="#7af0ff" stop-opacity="0"/></radialGradient></defs><circle cx="100" cy="100" r="96" fill="url(#mgcore)"/><g class="turn" fill="none" stroke="url(#mgrb)"><circle cx="100" cy="100" r="92" stroke-width="2.5"/><circle cx="100" cy="100" r="84" stroke-width="1" stroke-dasharray="3 9"/>${range(12, i => { const [x1, y1] = P(100, 100, 86, i / 12 * 6.283), [x2, y2] = P(100, 100, 98, i / 12 * 6.283); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="2"/>`; })}</g><path d="M100 22 C150 40 150 90 112 104 C80 116 70 150 100 178 C50 160 50 110 88 96 C120 84 130 50 100 22 Z" fill="url(#mgrb)" opacity=".16"/></svg>`;
  const megaCard = (m, i) => `<button type="button" class="mg-card" data-i="${i}" aria-label="${m[2]}"><span class="set${m[3] === 'p' ? ' p' : ''}">${m[3] === 'p' ? 'PRIMO' : SETS[m[3]][1]}</span><div class="pic">${img(m[0], 'm', '', '', ' loading="lazy"')}${img(m[1], 'b', '', '', ' loading="lazy"')}</div><b>${m[2]}</b><div class="ty">${m[4].map(typeTag).join('')}</div></button>`;

  /* ================= Les thèmes ================= */
  const THEMES2 = {
    ogerpon: { name: 'Ogerpon', sub: 'Fête des Masques',
      stage: () => `<div class="og-sky"></div><div class="og-moon"></div>${ogHills()}${lanterns()}`,
      hero: () => `<div class="og-hero"><p class="og-kick">Septentrion · La Fête des Masques</p>
        <div class="og-ring" id="og-ring">${tomoe()}${img(1017, '', 'Ogerpon', '', ' id="og-img"')}</div>
        <p class="og-form" id="og-form">Ogerpon · Masque Turquoise<small>Type Plante</small></p>
        <div class="og-stall"><div class="og-roof"></div><span class="og-noren">お面 · Choisis un masque</span>
          <div class="og-masks">${MASKS.map(([id, n, t, c], i) => `<button type="button" class="og-mask" data-i="${i}" style="--c:${c}" aria-pressed="${i === 0}">${maskSvg(c, MASKS[i][5])}${n.replace('Masque ', '')}<small>${t}</small></button>`).join('')}</div></div>
        <h1>PokéMonde</h1>
        <p class="og-verse">Chaque année, le village fête les <b>Adoramis</b>, trois héros qui auraient chassé un ogre terrible. Mais la vérité est tout autre : l'ogre, <b>Ogerpon</b>, protégeait le village, et ce sont les Adoramis qui lui avaient volé ses masques.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div></div>`,
      pre: () => `<div class="section-title"><h2>Les Adoramis</h2></div><div class="og-banners" id="og-banners">
        ${[[1014, 'Félicanis', 'Poison · Combat', '#9a3aff'], [1015, 'Fortusimia', 'Poison · Psy', '#ff6ab0'], [1016, 'Favianos', 'Poison · Fée', '#3ad8a0']].map(([id, n, t, c]) => `<div class="og-nobori" style="--c:${c}">${img(id, '', n)}<b>${n}</b><span>${t}</span></div>`).join('')}</div>
        <button type="button" class="og-mochi" id="og-mochi"><i></i>Un mochi à la pêche traîne sur l'étal… y goûter ?</button><p class="og-tale muted" id="og-tale"></p>`,
      parts: [{ k: 'firework', x: [.05, .95], y: [.06, .42], n: .025, c: () => [hooks.mc, '255,214,140', '255,120,80', '255,255,255'] }, { k: 'twinkle', x: [0, 1], y: [0, .5], n: 90, c: ['255,240,220', '255,255,255'], s: [.4, 1.2] }] },

    ruin: { name: 'Les Fléaux', sub: 'Le Sceau Chinois',
      stage: () => `<div class="ru-sky"></div><div class="ru-sun"></div>${ruClouds()}<div class="ru-hanzi l">灾</div><div class="ru-hanzi r">封</div>`,
      hero: () => `<div class="ru-hero"><p class="ru-kick">Paldea · Les Quatre Trésors du Fléau</p><h1>PokéMonde<span class="ru-seal">四宝</span></h1>
        <div class="ru-screen">${RUIN.map(([id, n, hz, o, c, eff]) => `<button type="button" class="ru-panel" style="--c:${c}" aria-label="Retirer le sceau de ${n}"><span class="hz">${hz}</span>${img(id, '', n)}<span class="ru-fu" aria-hidden="true"><span>封</span><span>印</span></span><span class="lab"><b>${n}</b><small>${o}</small><i>${eff} de tous les autres</i></span></button>`).join('')}</div>
        <div class="ru-copy"><p class="ru-verse">Une tablette, une épée, un chaudron, des perles de jade. Chargés de la rancune d'un roi cruel, quatre trésors devinrent des Pokémon, et leur seule présence affaiblissait tout ce qui les entourait. On les enferma dans quatre sanctuaires, scellés par des pieux.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div><p class="ru-hint" id="ru-hint">Touche un sceau pour le briser</p></div></div>`,
      parts: [{ k: 'rise', x: [0, 1], y: [.2, 1.05], n: 26, c: ['255,150,60', '255,190,90', '255,110,50'], s: [5, 9], v: [.25, .6], sh: 'lantern' }, { k: 'rise', x: [0, 1], y: [.4, 1], n: 60, c: ['255,200,120', '255,120,60'], s: [.6, 1.6], v: [.3, .9] }] },

    calyrex: { name: 'Sylveroy', sub: 'Le Roi des Moissons',
      stage: () => `<div class="ca-sky"></div><div class="ca-tint"></div>${caMount()}`,
      hero: () => `<div class="ca-hero"><svg class="ca-frame" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true"><rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(200,210,255,.35)" vector-effect="non-scaling-stroke"/><rect x="1" y="1.2" width="98" height="97.6" fill="none" stroke="rgba(166,232,114,.3)" vector-effect="non-scaling-stroke"/></svg>
        <p class="ca-kick">Il était une fois, dans les Terres Enneigées…</p>
        <div class="ca-row">
          <div class="ca-stall" id="ca-ice" style="--c:#8ad8ff;--dx:60%"><div class="arch">${img(896, '', 'Blizzeval')}</div><b>Blizzeval</b><small>le destrier de glace</small><button type="button" class="ca-carrot" data-r="ice" aria-pressed="false">${carrot('#bfe8ff')}Carotte Givrée</button></div>
          <div class="ca-throne">${crown()}<div class="seat">${img(898, '', 'Sylveroy', '', ' id="ca-img"')}</div><div class="dais"></div><p class="ca-name" id="ca-name">Sylveroy<small>Pokémon Roi · Psy · Plante</small></p></div>
          <div class="ca-stall" id="ca-shadow" style="--c:#b27aff;--dx:-60%"><div class="arch">${img(897, '', 'Spectreval')}</div><b>Spectreval</b><small>le destrier spectral</small><button type="button" class="ca-carrot" data-r="shadow" aria-pressed="false">${carrot('#6a3aa0')}Carotte Sombre</button></div>
        </div>${field()}
        <h1>PokéMonde</h1>
        <p class="ca-verse">Il y a fort longtemps, <i>Sylveroy</i> régnait sur Galar. D'un geste, il apaisait les cœurs et faisait germer les récoltes. Mais ses deux fidèles destriers l'ont quitté. Offre à l'un d'eux la carotte qu'il aime, et le roi retrouvera sa monture.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div></div>`,
      parts: [{ k: 'fall', x: [0, .55], y: [0, 1], n: 110, c: ['255,255,255', '210,235,255'], s: [1, 2.6], v: [.4, 1.2] }, { k: 'rise', x: [.45, 1], y: [.2, 1], n: 50, c: ['178,122,255', '120,70,220', '220,190,255'], s: [1.5, 3.5], v: [.3, .8] }, { k: 'twinkle', x: [0, 1], y: [0, .5], n: 70, c: ['255,255,255'] }] },

    dojo: { name: 'Le Dojo', sub: 'Wushours & Shifours',
      stage: () => `<div class="dj-wall"></div><div class="dj-beam" style="top:10vh"></div><div class="dj-shoji l"></div><div class="dj-shoji r"></div><div class="dj-beam" style="top:62vh"></div><div class="dj-floor"></div><div class="dj-max"></div><div class="dj-swirl"></div>`,
      hero: () => `<div class="dj-hero">
        <button type="button" class="dj-scroll" data-s="ss" style="--c:#e23b2e" aria-pressed="false"><span class="kj">悪</span><span class="tw">Tour des Ténèbres</span><small>Style Poing Final</small></button>
        <div class="dj-center"><p class="dj-kick">L'Île Solitaire de l'Armure · Le Dojo</p>
          <div class="dj-ring" id="dj-ring">${img(891, 'kub', 'Wushours', '', ' id="dj-img"')}</div>
          <p class="dj-name" id="dj-name">Wushours<small>Pokémon Kung-fu · Combat</small></p>
          <div class="dj-acts" id="dj-acts"><span class="muted" style="align-self:center">Choisis la tour que Wushours va gravir</span></div>
          <h1>PokéMonde</h1>
          <p class="dj-verse">Wushours s'entraîne au dojo depuis l'aube. Pour évoluer, il doit gravir l'une des deux tours : celle des <span class="d">Ténèbres</span> forge le Style Poing Final, un seul coup mais décisif ; celle des <span class="w">Eaux</span> forge le Style Mille Poings, une pluie de coups fluides comme le courant.</p>
          <p>${LEAD}</p><div class="cta">${CTA()}</div></div>
        <button type="button" class="dj-scroll" data-s="rs" style="--c:#2a7ae2" aria-pressed="false"><span class="kj">水</span><span class="tw">Tour des Eaux</span><small>Style Mille Poings</small></button></div>`,
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, 1], n: 60, c: ['255,230,180'], s: [.5, 1.4] }, { k: 'rise', x: [0, 1], y: [.2, 1], n: 120, c: ['255,60,120', '255,140,170', '255,30,80'], s: [1, 3.2], v: [.6, 1.8], w: () => hooks.gx }, { k: 'bolt', x: [.1, .9], y: [0, .35], n: .02, c: ['255,90,140'], w: () => hooks.gx }] },

    forces: { name: 'Les Forces', sub: 'Avatar & Totémique',
      stage: () => `<div class="fn-sky"></div><span class="fn-cloud" style="left:-10vw;top:6vh"></span><span class="fn-cloud" style="right:-15vw;top:28vh;animation-delay:-14s"></span><span class="fn-cloud" style="left:20vw;top:60vh;animation-delay:-26s"></span>`,
      hero: () => `<div class="fn-hero"><p class="fn-kick">Unys · Hisui · Les Forces de la Nature</p>
        <div class="fn-rose">${rose()}${FORCES.map(([p, a, , n, el, c]) => `<div class="fn-q ${p}" style="--c:${c}">${img(a, '', n)}<b>${n}</b><small>${el}</small></div>`).join('')}
          <button type="button" class="fn-mirror" id="fn-mirror" aria-label="Tendre le miroir pour changer de forme">${mirror()}</button></div>
        <p class="fn-state" id="fn-state">Forme Avatar · touche le miroir</p>
        <h1>PokéMonde</h1>
        <p class="fn-verse"><span class="t">Boréas</span> déchaîne les vents, <span class="h">Fulguris</span> fait gronder l'orage. Quand leurs querelles ravagent les campagnes, <span class="l">Démétéros</span> descend les calmer et rend les champs fertiles. <span class="a">Amovénus</span>, elle, annonce le printemps et tient les trois autres en respect. Tends-leur le miroir : ils révèleront leur forme véritable.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div></div>`,
      parts: [{ k: 'wind', x: [0, .55], y: [0, .5], n: 26, c: ['170,255,200'] }, { k: 'bolt', x: [.55, 1], y: [0, .5], n: .02, c: ['190,215,255'] }, { k: 'rise', x: [0, .5], y: [.5, 1], n: 50, c: ['255,200,90', '230,160,60'], s: [.8, 2], v: [.2, .6] }, { k: 'fall', x: [.5, 1], y: [.3, 1], n: 40, c: ['255,160,210', '255,200,230'], s: [3, 5], v: [.4, 1], sh: 'leaf' }] },

    lames: { name: 'Les Lames', sub: 'Les Mousquetaires',
      stage: () => `<div class="lj-bg"></div>${lis()}${cross()}`,
      hero: () => `<div class="lj-hero"><p class="lj-kick">Unys · Les Lames de la Justice</p>
        <div class="lj-gallery">${LAMES.map(([id, n, t, c]) => `<div class="lj-port" style="--c:${c}"><div class="oval">${img(id, '', n)}</div><span class="lj-plate"><b>${n}</b><small>${t}</small></span></div>`).join('')}</div>
        <div class="lj-keldeo">${blades()}${img(647, '', 'Keldeo', '', ' id="lj-img"')}</div>
        <p class="lj-motto" id="lj-motto"></p>
        <div class="cta" style="justify-content:center;margin:10px 0 0"><button type="button" class="btn ghost" id="lj-oath">⚔️ Keldeo prête serment</button></div>
        <h1>PokéMonde</h1><p class="lj-sub">ou les quatre mousquetaires d'Unys</p>
        <p class="lj-verse">Ils étaient trois : <b>Cobaltium</b>, le chef au cœur de fer, <b>Terrakium</b>, la force brute, et <b>Viridium</b>, l'escrimeur rapide comme le vent. Jadis, ils sauvèrent les Pokémon des incendies allumés par les guerres des hommes. Puis vint un jeune poulain, <b>Keldeo</b>, qu'ils prirent sous leur aile — comme d'Artagnan arrivant à Paris.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div></div>`,
      parts: [{ k: 'fall', x: [0, 1], y: [0, 1], n: 30, c: ['216,192,122', '246,232,188', '122,216,122'], s: [3, 5], v: [.3, .8], sh: 'leaf' }, { k: 'twinkle', x: [0, 1], y: [0, 1], n: 60, c: ['246,232,188'], s: [.4, 1.2] }] },

    lacs: { name: 'Les Lacs', sub: 'Savoir · Émotion · Volonté',
      stage: () => `<div class="lc-sky"></div>${lcMount()}<div class="lc-shine"></div><span class="lc-mist" style="top:50vh"></span><span class="lc-mist" style="top:62vh;left:30vw;animation-delay:-12s"></span>`,
      hero: () => `<div class="lc-hero"><p class="lc-kick">Sinnoh · Les Esprits des Lacs</p>
        <div class="lc-trio">${LACS.map(([id, n, l, v, c, leg], i) => `<button type="button" class="lc-lake" data-i="${i}" style="--c:${c}"><div class="up">${img(id, '', n)}</div><div class="pool">${img(id, '', '')}<i></i><i></i></div><b>${n}</b><small>${l} · ${v}</small><em>${leg}</em></button>`).join('')}</div>
        <h1 id="lc-title">PokéMonde</h1>
        <div class="lc-copy"><p class="lc-verse">On raconte que Créhelf, Créfollet et Créfadet proviennent du même Œuf. <span class="u">Créhelf</span> offrit aux humains le savoir, <span class="m">Créfollet</span> leur apprit à ressentir, <span class="a">Créfadet</span> leur donna la volonté d'agir. Chacun dort au fond d'un lac de Sinnoh.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div><p class="muted" style="font-size:.82rem;margin-top:14px">Approche-toi des lacs… si tu l'oses.</p></div></div>`,
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, .45], n: 90, c: ['255,255,255', '255,230,240'], s: [.4, 1.2] }, { k: 'rise', x: [0, 1], y: [.5, 1], n: 40, c: ['245,215,110', '255,158,199', '111,182,255'], s: [1, 2.4], v: [.2, .5] }] },

    reve: { name: 'Rêve', sub: '& Cauchemar',
      stage: () => `<div class="rv-dream"></div><span class="rv-cloud" style="left:-10vw;top:56vh"></span><span class="rv-cloud" style="right:-12vw;top:70vh;animation-delay:-18s"></span><div class="rv-night"></div><div class="rv-eye"></div>${smoke()}${img(491, 'rv-dk')}`,
      hero: () => `<div class="rv-hero" id="rv-hero"><p class="rv-kick">Cresselia · Darkrai</p>
        <div class="rv-sky"><button type="button" class="rv-moon" id="rv-moon" aria-label="Changer la lune : croissant ou nouvelle lune"><span class="disc"></span><span class="nm"></span></button>${img(488, 'rv-cr', 'Cresselia')}${img(491, 'rv-dr', 'Darkrai')}</div>
        <h1>PokéMonde</h1><p class="rv-wish" id="rv-wish">Fais de beaux rêves…</p>
        <p class="rv-verse"><span class="c">Cresselia</span>, l'avatar du croissant de lune, protège le sommeil : dormir avec une de ses plumes à la main offre de beaux rêves. Mais les nuits de nouvelle lune, <span class="d">Darkrai</span> se montre, et ceux qu'il croise sombrent dans d'interminables cauchemars.</p>
        <p>${LEAD}</p><div class="cta">${CTA()}</div><p class="rv-hint">Touche la lune · descends pour t'enfoncer dans le cauchemar ↓</p></div>`,
      coda: () => `<div class="rv-end"><h2>Au plus profond du cauchemar…</h2>${img(10312, '', 'Méga-Darkrai')}<p>Personne ne s'était jamais aventuré si loin dans le sommeil. Ici, Darkrai a trouvé une forme que nul n'avait jamais vue.</p><small>Méga-Darkrai · Légendes Pokémon Z-A</small></div>`,
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, .7], n: 140, c: ['255,240,255', '255,210,250', '255,255,255'], s: [.6, 1.8], sh: 'star', w: () => (1 - hooks.g) * (1 - hooks.nm) },
              { k: 'rise', x: [0, 1], y: [.2, 1], n: 60, c: ['60,10,40', '90,20,50', '30,0,20'], s: [10, 24], v: [.3, .8], w: () => Math.max(hooks.g, hooks.nm) * .3 },
              { k: 'rise', x: [0, 1], y: [.3, 1], n: 50, c: ['255,60,80', '200,20,50'], s: [.8, 2], v: [.4, 1.2], w: () => Math.max(hooks.g, hooks.nm) }] },

    mega: { name: 'Méga', sub: 'Toutes les Mégas',
      stage: () => `<div class="mg-bg"></div><div class="mg-hex"></div><div class="mg-ring"></div>`,
      hero: () => `<div class="mg-hero"><p class="mg-kick">Kalos · Hoenn · Illumis · La Méga-Évolution</p>
        <div class="mg-show" id="mg-show">${megaSym()}<img class="base" id="mg-base" alt=""><img class="mega" id="mg-mega" alt=""><span class="mg-orb"></span></div>
        <div class="mg-info"><h1 id="mg-name"></h1><div class="mg-meta" id="mg-meta"></div></div>
        <div class="mg-acts"><button type="button" class="btn" id="mg-go">✦ Méga-Évoluer</button><button type="button" class="btn ghost" id="mg-rnd">🎲 Au hasard</button></div>
        <p class="mg-site">Bienvenue dans le PokéMonde</p>
        <p>Au contact d'une Méga-Gemme et du lien qui l'unit à son dresseur, un Pokémon dépasse l'évolution et prend, le temps d'un combat, une forme bien plus puissante. ${LEAD}</p><div class="cta">${CTA()}</div></div>`,
      pre: () => { const n = k => MEGAS.filter(m => k === 'all' || m[3] === k).length;
        return `<div class="section-title"><h2>Toutes les Méga-Évolutions</h2></div>
        <div class="mg-tools" id="mg-tools">${[['all', 'Toutes'], ['xy', 'X & Y'], ['rosa', 'Rubis Oméga & Saphir Alpha'], ['za', 'Légendes Z-A'], ['zad', 'Méga Dimension'], ['p', 'Primo-Résurgences']].map(([k, l], i) => `<button type="button" class="mg-chip" data-k="${k}" aria-pressed="${i === 0}">${l} <span>${n(k)}</span></button>`).join('')}<input class="mg-search" id="mg-q" type="search" placeholder="Chercher un Pokémon…" aria-label="Chercher une Méga-Évolution"></div>
        <p class="mg-count" id="mg-count"></p><div class="mg-grid" id="mg-grid"></div>`; },
      parts: [{ k: 'twinkle', x: [0, 1], y: [0, 1], n: 120, c: ['255,122,154', '255,230,106', '106,255,154', '90,216,255', '180,154,255'], s: [.5, 1.6] }] },
  };

  Object.assign(THEMES, THEMES2);

  /* ================= Particules ================= */
  const cv = $('fx'), ctx = cv.getContext('2d');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let W = 0, H = 0, systems = [], B = [];
  const cols = p => typeof p.c === 'function' ? p.c() : p.c;
  function build(parts) {
    const k = Math.max(.35, (W * H) / (1440 * 900));
    B = [];
    systems = parts.map(p => {
      const R = { x0: p.x[0] * W, x1: p.x[1] * W, y0: p.y[0] * H, y1: p.y[1] * H }, s = p.s || [.3, 1.5], v = p.v || [1, 1];
      const make = any => ({ x: rnd(R.x0, R.x1), y: any ? rnd(R.y0, R.y1) : (p.k === 'rise' ? R.y1 + 10 : R.y0 - 10), s: rnd(s[0], s[1]), v: rnd(v[0], v[1]), ph: rnd(0, 6.28), c: pick(cols(p)), rot: rnd(0, 6.28) });
      const n = (p.k === 'bolt' || p.k === 'meteor' || p.k === 'firework') ? 0 : Math.round(p.n * k);
      return { ...p, R, make, list: Array.from({ length: n }, () => make(true)), fx: [] };
    });
  }
  hooks.burst = (x, y, colors, sh = 'dot', n = 36, sp = 3.4) => { if (still) return; for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(.6, sp); B.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, s: rnd(2, sh === 'dot' ? 3 : 7), c: pick(colors), life: 1, sh, rot: rnd(0, 6.28) }); } };
  function shape(sh, x, y, s, rot) {
    ctx.beginPath();
    if (sh === 'leaf') ctx.ellipse(x, y, s, s * .35, rot, 0, 6.283);
    else if (sh === 'star') { ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * .4, y - s * .4); ctx.lineTo(x + s * 2, y); ctx.lineTo(x + s * .4, y + s * .4); ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * .4, y + s * .4); ctx.lineTo(x - s * 2, y); ctx.lineTo(x - s * .4, y - s * .4); ctx.closePath(); }
    else if (sh === 'heart') { ctx.moveTo(x, y + s * .9); ctx.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .7, y - s * 1.4, x, y - s * .5); ctx.bezierCurveTo(x + s * .7, y - s * 1.4, x + s * 1.6, y - s * .2, x, y + s * .9); }
    else if (sh === 'tear') { ctx.moveTo(x, y - s * 1.4); ctx.quadraticCurveTo(x + s, y, x, y + s * .8); ctx.quadraticCurveTo(x - s, y, x, y - s * 1.4); }
    else if (sh === 'sq') ctx.rect(x - s, y - s, s * 2, s * 2);
    else if (sh === 'lantern') ctx.roundRect ? ctx.roundRect(x - s * .7, y - s, s * 1.4, s * 2, s * .5) : ctx.rect(x - s * .7, y - s, s * 1.4, s * 2);
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
      if (S.k === 'firework') {
        if (Math.random() < S.n) { const x = rnd(R.x0, R.x1), y = rnd(R.y0, R.y1), c = pick(cols(S)), n = 50; for (let i = 0; i < n; i++) { const a = i / n * 6.283, v = rnd(1.6, 3.2); S.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c, life: 1 }); } }
        for (const f of S.fx) { f.x += f.vx; f.y += f.vy; f.vx *= .97; f.vy = f.vy * .97 + .035; f.life -= .012; ctx.fillStyle = `rgba(${f.c},${(f.life * w).toFixed(3)})`; ctx.beginPath(); ctx.arc(f.x, f.y, 1.8, 0, 6.283); ctx.fill(); }
        S.fx = S.fx.filter(f => f.life > 0); continue;
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
      if (S.k === 'wind') {
        ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (const d of S.list) { d.x += 3 + d.v * 3; d.ph += .05; if (d.x > R.x1 + 200) Object.assign(d, S.make(true), { x: R.x0 - 200 }); const len = 60 + d.s * 30, y = d.y + Math.sin(d.ph) * 6;
          ctx.strokeStyle = `rgba(${d.c},${(.35 * w).toFixed(3)})`; ctx.beginPath(); ctx.moveTo(d.x - len, y); ctx.quadraticCurveTo(d.x - len / 2, y - 10, d.x, y); ctx.stroke(); }
        continue;
      }
      for (const d of S.list) {
        let a = 1, x = d.x;
        if (S.k === 'twinkle') a = .25 + .75 * Math.abs(Math.sin(d.ph + t * .0006 * (1 + d.v)));
        else if (S.k === 'rise') { d.y -= d.v; d.ph += .03; x = d.x + Math.sin(d.ph) * 8; a = Math.max(0, Math.min(1, (d.y - R.y0) / ((R.y1 - R.y0) * .6))); if (d.y < R.y0) Object.assign(d, S.make(false)); }
        else if (S.k === 'fall') { d.y += d.v; d.ph += .02; d.rot += .01; x = d.x + Math.sin(d.ph) * 14; if (d.y > R.y1 + 10) Object.assign(d, S.make(false)); }
        if (S.sh === 'lantern') { ctx.shadowColor = `rgba(${d.c},.9)`; ctx.shadowBlur = 16; }
        ctx.fillStyle = `rgba(${d.c},${(a * .9 * w).toFixed(3)})`; shape(S.sh, x, d.y, d.s, d.rot); ctx.fill();
        if (S.sh === 'lantern') ctx.shadowBlur = 0;
      }
    }
    for (const p of B) { p.x += p.vx; p.y += p.vy; p.vy += .06; p.vx *= .985; p.life -= .014; p.rot += .05; ctx.fillStyle = `rgba(${p.c},${Math.max(0, p.life).toFixed(3)})`; shape(p.sh, p.x, p.y, p.s, p.rot); ctx.fill(); }
    B = B.filter(p => p.life > 0);
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

  const INIT2 = {
    ogerpon() {
      const ring = $('og-ring'), im = $('og-img'), form = $('og-form');
      MASKS.forEach(m => { new Image().src = `${ART}${m[0]}.png`; });
      document.querySelectorAll('.og-mask').forEach(b => b.onclick = () => {
        const [id, n, t, c, rgb] = MASKS[+b.dataset.i];
        document.querySelectorAll('.og-mask').forEach(x => x.setAttribute('aria-pressed', x === b));
        ring.style.setProperty('--m', c); form.style.setProperty('--m', c); hooks.mc = rgb;
        im.src = `${ART}${id}.png`; im.alt = `Ogerpon ${n}`; repop(im);
        form.innerHTML = `Ogerpon · ${n}<small>Type ${t}</small>`;
        const [x, y] = centerOf(im); hooks.burst(x, y, [rgb, '255,240,220'], 'star', 30);
      });
      const mochi = $('og-mochi');
      mochi.onclick = () => { mochi.remove(); const ban = $('og-banners'); ban.classList.add('og-chained');
        ban.insertAdjacentHTML('beforeend', `<div class="og-nobori boss">${img(1025, '', 'Pêchaminus')}<b>Pêchaminus</b><span>Poison · Spectre</span></div>`);
        $('og-tale').textContent = "C'était lui depuis le début ! Avec ses mochis empoisonnés, Pêchaminus avait fait des Adoramis ses serviteurs. Heureusement, tu n'en as pris qu'une bouchée.";
        const [x, y] = centerOf(ban.lastElementChild); hooks.burst(x, y, ['176,74,255', '255,198,224', '120,26,255'], 'dot', 50); };
      hooks.mc = MASKS[0][4];
      return {};
    },
    ruin() {
      let freed = 0; const hint = $('ru-hint');
      document.querySelectorAll('.ru-panel').forEach(p => p.onclick = () => {
        if (p.classList.contains('free')) return;
        p.classList.add('free'); p.setAttribute('aria-pressed', 'true'); freed++;
        const [x, y] = centerOf(p); hooks.burst(x, y - 40, ['255,160,60', '255,220,120', '200,40,20'], 'dot', 40);
        hint.textContent = freed < 4 ? `${freed} sceau${freed > 1 ? 'x' : ''} sur 4 brisé${freed > 1 ? 's' : ''}…` : 'Les quatre Fléaux sont libres. Tout autour d\'eux, les forces déclinent.';
        if (freed === 4) { hint.classList.add('ru-done'); document.querySelector('.ru-hero h1').classList.add('popped'); }
      });
      return {};
    },
    calyrex() {
      const im = $('ca-img'), name = $('ca-name'); let cur = null;
      const R = { ice: [10193, 'Sylveroy Cavalier du Froid', 'Psy · Glace', '140,220,255'], shadow: [10194, "Sylveroy Cavalier d'Effroi", 'Psy · Spectre', '178,122,255'] };
      [10193, 10194].forEach(id => { new Image().src = `${ART}${id}.png`; });
      const set = r => {
        cur = r; document.body.dataset.r = r || '';
        $('ca-ice').classList.toggle('gone', r === 'ice'); $('ca-shadow').classList.toggle('gone', r === 'shadow');
        document.querySelectorAll('.ca-carrot').forEach(b => { b.setAttribute('aria-pressed', b.dataset.r === r); b.lastChild.textContent = b.dataset.r === r ? 'Libérer la monture' : (b.dataset.r === 'ice' ? 'Carotte Givrée' : 'Carotte Sombre'); });
        setTimeout(() => { const d = r ? R[r] : [898, 'Sylveroy', 'Psy · Plante'];
          im.src = `${ART}${d[0]}.png`; im.alt = d[1]; repop(im); name.innerHTML = `${d[1]}<small>Pokémon Roi · ${d[2]}</small>`;
          if (r) { const [x, y] = centerOf(im); hooks.burst(x, y, [R[r][3], '255,255,255', '166,232,114'], 'star', 34); } }, still ? 0 : 700);
      };
      document.querySelectorAll('.ca-carrot').forEach(b => b.onclick = () => set(cur === b.dataset.r ? null : b.dataset.r));
      return { stop() { delete document.body.dataset.r; } };
    },
    dojo() {
      const im = $('dj-img'), name = $('dj-name'), acts = $('dj-acts'), stage = $('stage');
      const S = { ss: [892, 10226, 'Style Poing Final', 'Combat · Ténèbres'], rs: [10191, 10227, 'Style Mille Poings', 'Combat · Eau'] };
      [892, 10191, 10226, 10227].forEach(id => { new Image().src = `${ART}${id}.png`; });
      let style = null, gmax = false;
      const render = () => {
        document.querySelectorAll('.dj-scroll').forEach(b => b.setAttribute('aria-pressed', b.dataset.s === style));
        document.body.classList.toggle('dj-gmax', gmax); stage.style.setProperty('--x', gmax ? 1 : 0); hooks.gx = gmax ? 1 : 0;
        if (!style) { im.src = ART + '891.png'; im.alt = 'Wushours'; im.className = 'kub'; name.innerHTML = 'Wushours<small>Pokémon Kung-fu · Combat</small>';
          acts.innerHTML = '<span class="muted" style="align-self:center">Choisis la tour que Wushours va gravir</span>'; return; }
        const d = S[style]; im.className = ''; im.src = `${ART}${gmax ? d[1] : d[0]}.png`; im.alt = `Shifours ${d[2]}${gmax ? ' Gigamax' : ''}`; repop(im);
        name.innerHTML = `Shifours${gmax ? ' Gigamax' : ''}<small>${d[2]} · ${d[3]}</small>`;
        acts.innerHTML = `<button type="button" class="btn dj-gbtn" id="dj-g">${gmax ? '⬢ Fin du Gigamax' : '⬢ Gigamax !'}</button><button type="button" class="btn ghost" id="dj-r">↺ Recommencer</button>`;
        $('dj-g').onclick = () => { gmax = !gmax; render(); if (gmax) { const [x, y] = centerOf(im); hooks.burst(x, y, ['255,60,120', '255,180,200', '255,30,80'], 'dot', 60, 5); } };
        $('dj-r').onclick = () => { style = null; gmax = false; render(); };
      };
      document.querySelectorAll('.dj-scroll').forEach(b => b.onclick = () => { style = b.dataset.s; gmax = false; render(); const [x, y] = centerOf(im); hooks.burst(x, y, style === 'ss' ? ['226,59,46', '255,215,160'] : ['42,122,226', '160,210,255'], 'star', 30); });
      return { stop() { document.body.classList.remove('dj-gmax'); hooks.gx = 0; } };
    },
    forces() {
      let tot = false; const st = $('fn-state');
      FORCES.forEach(f => { new Image().src = `${ART}${f[2]}.png`; });
      $('fn-mirror').onclick = () => {
        tot = !tot; document.body.classList.toggle('fn-tot', tot);
        if (!still) { const fl = document.createElement('div'); fl.className = 'fn-flash'; document.body.appendChild(fl); setTimeout(() => fl.remove(), 900); }
        document.querySelectorAll('.fn-q').forEach((q, i) => { q.classList.add('swap'); setTimeout(() => { const f = FORCES[i], im = q.querySelector('img'); im.src = `${ART}${tot ? f[2] : f[1]}.png`; im.alt = `${f[3]} Forme ${tot ? 'Totémique' : 'Avatar'}`; q.classList.remove('swap'); }, still ? 0 : 350); });
        st.textContent = tot ? 'Forme Totémique · leur vraie nature' : 'Forme Avatar · touche le miroir';
      };
      return { stop() { document.body.classList.remove('fn-tot'); } };
    },
    lames() {
      const hero = document.querySelector('.lj-hero'), im = $('lj-img'), motto = $('lj-motto'), btn = $('lj-oath');
      new Image().src = ART + '10024.png';
      btn.onclick = () => { const on = !hero.classList.contains('lj-oath'); hero.classList.toggle('lj-oath', on);
        im.src = `${ART}${on ? 10024 : 647}.png`; im.alt = on ? 'Keldeo Aspect Décidé' : 'Keldeo'; repop(im);
        motto.textContent = on ? '« Un pour tous, tous pour un ! »' : ''; motto.classList.toggle('on', on);
        btn.textContent = on ? '↺ Keldeo, Aspect Normal' : '⚔️ Keldeo prête serment';
        if (on) { const [x, y] = centerOf(im); hooks.burst(x, y, ['246,232,188', '216,192,122', '120,200,255'], 'star', 40); toast('Keldeo passe en Aspect Décidé : le voilà mousquetaire à part entière.'); } };
      return {};
    },
    lacs() {
      const title = $('lc-title'); let tid = 0;
      const acts = [
        b => { document.body.classList.add('lc-forget'); title.textContent = 'Poké… quoi ?'; toast("Créhelf a ouvert les yeux… Tu as tout oublié. Enfin, presque tout.");
          clearTimeout(tid); tid = setTimeout(() => { document.body.classList.remove('lc-forget'); title.textContent = 'PokéMonde'; }, 3600); },
        b => { const [x, y] = centerOf(b.querySelector('.up')); hooks.burst(x, y, ['255,158,199', '255,110,160', '255,220,235'], 'heart', 24, 4); hooks.burst(x, y, ['111,182,255', '170,215,255'], 'tear', 16, 3);
          toast('Tu as touché Créfollet : en un instant, tu as connu la joie et la peine.'); },
        b => { if (!still) { const f = document.createElement('div'); f.className = 'lc-frost'; document.body.appendChild(f); setTimeout(() => f.remove(), 3300); }
          toast("Te voilà figé… Heureusement, tu ne lui voulais aucun mal. Ça passe."); },
      ];
      document.querySelectorAll('.lc-lake').forEach(b => b.onclick = () => acts[+b.dataset.i](b));
      return { stop() { clearTimeout(tid); document.body.classList.remove('lc-forget'); document.querySelectorAll('.lc-frost').forEach(f => f.remove()); } };
    },
    reve() {
      const hero = $('rv-hero'), wish = $('rv-wish');
      $('rv-moon').onclick = () => { const on = !hero.classList.contains('rv-new'); hero.classList.toggle('rv-new', on); hooks.nm = on ? 1 : 0; $('stage').style.setProperty('--nm', on ? 1 : 0);
        wish.textContent = on ? 'Fais de beaux cauchemars…' : 'Fais de beaux rêves…'; };
      return { stop() { hooks.nm = 0; } };
    },
    mega() {
      const show = $('mg-show'), base = $('mg-base'), mega = $('mg-mega'), nm = $('mg-name'), meta = $('mg-meta'), go = $('mg-go');
      let cur = 0, on = false, tid = 0, filt = 'all', q = '';
      const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const baseName = m => m[2].replace(/^(Méga|Primo)-/, '').replace(/ (X|Y|Z)$/, '').replace(/ \(.*\)| ♂| ♀| Couleur du Passé/, '');
      const load = i => { cur = i; on = false; clearTimeout(tid); const m = MEGAS[i]; show.classList.remove('on', 'charging', 'burst');
        base.src = `${ART}${m[1]}.png`; base.alt = baseName(m); mega.src = `${ART}${m[0]}.png`; mega.alt = m[2];
        nm.textContent = baseName(m); meta.innerHTML = `<span>${m[3] === 'p' ? 'Primo-Résurgence' : 'Méga-Évolution'} · ${m[3] === 'p' ? 'Rubis Oméga & Saphir Alpha' : SETS[m[3]][0]}</span>`;
        go.textContent = m[3] === 'p' ? '✦ Primo-Résurgence' : '✦ Méga-Évoluer'; };
      const evolve = () => { const m = MEGAS[cur];
        if (on) { load(cur); return; }
        show.classList.add('charging');
        tid = setTimeout(() => { on = true; show.classList.remove('charging'); show.classList.add('on'); show.classList.remove('burst'); void show.offsetWidth; show.classList.add('burst');
          nm.textContent = m[2]; meta.innerHTML = m[4].map(typeTag).join('') + `<span>· ${m[3] === 'p' ? 'Rubis Oméga & Saphir Alpha' : SETS[m[3]][0]}</span>`; go.textContent = '↺ Forme normale';
          const [x, y] = centerOf(show); hooks.burst(x, y, ['255,122,154', '255,230,106', '106,255,154', '90,216,255', '180,154,255'], 'star', 60, 5); }, still ? 0 : 650); };
      go.onclick = evolve;
      $('mg-rnd').onclick = () => { let i; do { i = Math.floor(Math.random() * MEGAS.length); } while (i === cur && MEGAS.length > 1); load(i); };
      const grid = $('mg-grid'), count = $('mg-count');
      const draw = () => { const items = MEGAS.map((m, i) => [m, i]).filter(([m]) => (filt === 'all' || m[3] === filt) && (!q || norm(m[2]).includes(q)));
        grid.innerHTML = items.length ? items.map(([m, i]) => megaCard(m, i)).join('') : '<p class="mg-empty">Aucune Méga-Évolution ne correspond.</p>';
        count.textContent = `${items.length} forme${items.length > 1 ? 's' : ''} · survole une carte pour voir le Pokémon avant sa Méga-Évolution, touche-la pour la lancer en haut de page`; };
      $('mg-tools').addEventListener('click', e => { const c = e.target.closest('.mg-chip'); if (!c) return; filt = c.dataset.k; document.querySelectorAll('.mg-chip').forEach(x => x.setAttribute('aria-pressed', x === c)); draw(); });
      $('mg-q').addEventListener('input', e => { q = norm(e.target.value.trim()); draw(); });
      grid.addEventListener('click', e => { const c = e.target.closest('.mg-card'); if (!c) return; load(+c.dataset.i); scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); setTimeout(evolve, still ? 0 : 700); });
      load(Math.floor(Math.random() * MEGAS.length)); draw();
      return { stop() { clearTimeout(tid); } };
    },
  };

  Object.assign(INIT, INIT2);

  /* ================= Application ================= */
  let current = null, active = {};
  const root = document.documentElement;
  function onScroll() {
    root.style.setProperty('--p', Math.min(1, scrollY / (innerHeight * .9)).toFixed(3));
    hooks.sp = Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight));
    hooks.g = Math.max(0, Math.min(1, (hooks.sp - .3) / .6)); root.style.setProperty('--g', hooks.g.toFixed(3));
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
      document.querySelectorAll('.lg-toast').forEach(x => x.remove());
      $('stage').removeAttribute('style');
      $('stage').innerHTML = t.stage ? t.stage() : '';
      $('hero').innerHTML = t.hero();
      $('pre').innerHTML = t.pre ? t.pre() : '';
      $('coda').innerHTML = t.coda ? t.coda() : '';
      hooks.gx = 0; hooks.nm = 0;
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
