/* ==========================================================
   PokéMonde — fonctions communes à toutes les pages
   ========================================================== */
(function () {
  const D = window.PKDATA;
  const P = D.pokemon;
  const byId = {};
  P.forEach(p => byId[p.id] = p);

  const GEN_NAMES = ['', 'Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unys', 'Kalos', 'Alola', 'Galar', 'Paldea'];
  const STAT_NAMES = ['PV', 'Attaque', 'Défense', 'Att. Spé.', 'Déf. Spé.', 'Vitesse'];
  const REG_NAMES = { alola: "d'Alola", galar: 'de Galar', hisui: 'de Hisui', paldea: 'de Paldea' };

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  P.forEach(p => { p._n = norm(p.n); p._en = norm(p.en); });

  // Formes alternatives (régionales, Méga, Primo, Gigamax, autres formes)
  // f.k : 'reg' | 'mega' | 'primal' | 'gmax' | 'autre' — f.game = 1 si la forme est utilisable dans les jeux
  const F = D.forms || [];
  F.forEach(f => { const s = byId[f.sp]; f.form = 1; f.g = s.g; f._n = norm(f.n); f._en = norm(f.en); byId[f.id] = f; });
  const GF = F.filter(f => f.game);
  const ALL = P.concat(GF);
  const formsOf = sid => F.filter(f => f.sp === sid);
  const speciesOf = p => byId[p.sp || p.id];
  const FORM_LABEL = { reg: 'Forme régionale', mega: 'Méga-Évolution', primal: 'Primo-Résurgence', gmax: 'Gigamax', autre: 'Forme alternative' };

  const SPR = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  const sprite = id => SPR + id + '.png';
  const art = id => SPR + 'other/official-artwork/' + id + '.png';
  const artShiny = id => SPR + 'other/official-artwork/shiny/' + id + '.png';
  const home = id => SPR + 'other/home/' + id + '.png';
  const cry = id => 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/' + id + '.ogg';

  const type = t => D.types[t - 1];
  const typeBadge = t => `<span class="type" style="background:${type(t).color}">${type(t).name}</span>`;
  const typesHtml = p => p.t.map(typeBadge).join(' ');
  const fmtH = h => (h / 10).toLocaleString('fr-FR') + ' m';
  const fmtW = w => (w / 10).toLocaleString('fr-FR') + ' kg';
  const num = id => '#' + String(byId[id] && byId[id].sp || id).padStart(4, '0');
  const bst = p => p.st.reduce((a, b) => a + b, 0);
  const has = (p, f) => p.f.includes(f);

  // Multiplicateur de dégâts d'un type attaquant sur une liste de types défenseurs
  const effOn = (atk, defTypes) => defTypes.reduce((m, d) => m * D.eff[atk - 1][d - 1], 1);

  // Lignée évolutive (tous les membres de la même chaîne, triés par stade)
  const chainOf = p => P.filter(x => x.ch === p.ch).sort((a, b) => a.stg - b.stg || a.id - b.id);

  // Aléatoire avec graine (pour les défis du jour)
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // Le « jour » des défis est celui de Paris, pour que tout le monde (et le serveur) ait le même défi
  const PARIS = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
  const todayKey = () => PARIS.format(new Date());
  const dailyRng = (salt, day = todayKey()) => rng(hashStr(day + ':' + salt));
  const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
  function shuffle(arr, r = Math.random) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // Stockage local protégé (navigation privée, etc.)
  const store = {
    get(k, def) { try { const v = localStorage.getItem('pkm:' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('pkm:' + k, JSON.stringify(v)); } catch (e) { } },
  };

  function toast(msg, ms = 1800) {
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }
  function confetti(n = 80) {
    const cols = ['#ffcb05', '#e3350d', '#3d7dca', '#2ecc71', '#ffffff', '#c792ff'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = pick(cols);
      c.style.animationDuration = 1.8 + Math.random() * 2 + 's';
      c.style.animationDelay = Math.random() * .5 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5000);
    }
  }

  // Recherche de Pokémon par nom (FR ou EN)
  function search(q, pool = P, limit = 12) {
    const n = norm(q); if (!n) return [];
    const starts = [], contains = [];
    for (const p of pool) {
      if (p._n.startsWith(n) || p._en.startsWith(n)) starts.push(p);
      else if (p._n.includes(n) || p._en.includes(n)) contains.push(p);
    }
    return starts.concat(contains).slice(0, limit);
  }

  // Champ de saisie avec autocomplétion
  function picker(container, opts) {
    const o = Object.assign({ placeholder: 'Tape le nom d\'un Pokémon…', pool: () => P, exclude: () => new Set(), onPick: () => { }, showGen: true }, opts);
    container.classList.add('picker');
    container.innerHTML = `<input type="text" autocomplete="off" spellcheck="false" placeholder="${o.placeholder}"><div class="picker-list"></div>`;
    const input = container.querySelector('input'), list = container.querySelector('.picker-list');
    let items = [], sel = 0;
    function render() {
      const ex = o.exclude();
      items = search(input.value, o.pool()).filter(p => !ex.has(p.id));
      sel = 0;
      list.innerHTML = items.map((p, i) => `<div class="picker-item${i === 0 ? ' sel' : ''}" data-i="${i}"><img src="${sprite(p.id)}" alt="" loading="lazy"><b>${p.n}</b>${p.form ? '<span class="form-tag">forme</span>' : ''}${o.showGen ? `<small>Gén. ${p.gen}</small>` : ''}</div>`).join('');
      list.classList.toggle('show', items.length > 0);
    }
    function choose(i) {
      const p = items[i]; if (!p) return;
      input.value = ''; list.classList.remove('show');
      o.onPick(p);
    }
    input.addEventListener('input', render);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % Math.max(items.length, 1);
        list.querySelectorAll('.picker-item').forEach((el, i) => el.classList.toggle('sel', i === sel));
        list.children[sel] && list.children[sel].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
      else if (e.key === 'Escape') list.classList.remove('show');
    });
    list.addEventListener('mousedown', e => { const it = e.target.closest('.picker-item'); if (it) { e.preventDefault(); choose(+it.dataset.i); } });
    input.addEventListener('blur', () => setTimeout(() => list.classList.remove('show'), 150));
    return { input, focus: () => input.focus(), disable(v) { input.disabled = v; } };
  }

  // Modale simple
  function modal(html) {
    let bg = document.getElementById('modal-bg');
    if (!bg) {
      bg = document.createElement('div'); bg.id = 'modal-bg'; bg.className = 'modal-bg';
      bg.innerHTML = '<div class="modal card"><button class="close" aria-label="Fermer">×</button><div class="modal-body"></div></div>';
      document.body.appendChild(bg);
      bg.addEventListener('click', e => { if (e.target === bg || e.target.classList.contains('close')) bg.classList.remove('show'); });
    }
    bg.querySelector('.modal-body').innerHTML = html;
    bg.classList.add('show');
    return { close: () => bg.classList.remove('show'), el: bg.querySelector('.modal-body') };
  }

  // En-tête et pied de page
  const GAMES = [
    { href: 'jeu-pokedle.html', name: 'Pokédle', emoji: '🔎', deco: 150, desc: 'Devine le Pokémon mystère grâce aux indices : classique, silhouette, description et cri.' },
    { href: 'jeu-pokedoku.html', name: 'Pokédoku', emoji: '🧩', deco: 493, desc: 'Remplis la grille 3×3 avec des Pokémon qui respectent les deux critères.' },
    { href: 'jeu-4par4.html', name: '4 par 4', emoji: '🟨', deco: 132, desc: '16 Pokémon, 4 groupes cachés. Trouve ce qui les relie !' },
    { href: 'jeu-quiz-types.html', name: 'Quiz des types', emoji: '⚡', deco: 135, desc: 'Super efficace ou pas très efficace ? Teste ta maîtrise des types.' },
    { href: 'jeu-plus-ou-moins.html', name: 'Plus ou Moins', emoji: '⚖️', deco: 143, desc: 'Lequel est le plus lourd, le plus grand ou le plus fort ?' },
    { href: 'jeu-memory.html', name: 'Memory', emoji: '🃏', deco: 54, desc: 'Retrouve les paires de Pokémon le plus vite possible.' },
    { href: 'jeu-chrono.html', name: 'Défi Pokédex', emoji: '⏱️', deco: 137, desc: 'Cite un maximum de Pokémon avant la fin du chrono.' },
  ];
  function header() {
    const here = location.pathname.split('/').pop() || 'index.html';
    const a = (href, label) => `<a href="${href}" class="${here === href ? 'active' : ''}">${label}</a>`;
    const h = document.createElement('header');
    h.className = 'site-header';
    h.innerHTML = `<nav class="nav">
      <a class="logo" href="index.html"><div class="pokeball"></div><span>Poké<b>Monde</b></span></a>
      <button class="burger" aria-label="Menu">☰</button>
      <div class="nav-links">
        ${a('index.html', 'Accueil')}
        ${a('pokedex.html', 'Pokédex')}
        <div class="nav-drop"><button type="button">Jeux ▾</button>
          <div class="nav-drop-menu">${a('jeux.html', '🎮 Tous les jeux')}${GAMES.map(g => a(g.href, g.emoji + ' ' + g.name)).join('')}</div>
        </div>
        ${a('types.html', 'Types')}
        ${a('equipe.html', 'Équipe')}
        ${a('classements.html', '🏆 Classements')}
        <a href="profil.html" id="nav-account" class="${here === 'profil.html' ? 'active' : ''}">👤 Connexion</a>
      </div></nav>`;
    document.body.prepend(h);
    h.querySelector('.burger').onclick = () => h.querySelector('.nav-links').classList.toggle('open');
    h.querySelector('.nav-drop > button').onclick = e => e.currentTarget.parentElement.classList.toggle('open');
    const f = document.createElement('footer');
    f.className = 'site-footer';
    f.innerHTML = `PokéMonde — site de fans non officiel. Pokémon © Nintendo / Creatures Inc. / GAME FREAK inc. · <a href="confidentialite.html">Confidentialité</a><br>Données et images : <a href="https://pokeapi.co" target="_blank" rel="noopener">PokéAPI</a> · descriptions des générations 8-9 : <a href="https://www.pokepedia.fr" target="_blank" rel="noopener">Poképédia</a> (CC BY-NC-SA).`;
    document.body.appendChild(f);
  }
  // (ce fichier est aussi chargé par le serveur de vérification, où il n'y a pas de page)
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', header);
    // Si une petite image n'existe pas (certaines formes récentes), on utilise l'illustration officielle
    document.addEventListener('error', e => {
      const img = e.target;
      if (img.tagName === 'IMG' && img.src.startsWith(SPR) && !img.src.includes('/other/') && !img.dataset.fb) {
        img.dataset.fb = 1; img.src = art(img.src.split('/').pop().replace('.png', ''));
      }
    }, true);
  }

  window.PK = {
    D, P, F, GF, ALL, formsOf, speciesOf, FORM_LABEL, byId, GEN_NAMES, STAT_NAMES, REG_NAMES, GAMES,
    norm, sprite, art, artShiny, home, cry, type, typeBadge, typesHtml, fmtH, fmtW, num, bst, has, effOn, chainOf,
    rng, hashStr, todayKey, dailyRng, pick, shuffle, store, toast, confetti, search, picker, modal,
  };
})();
