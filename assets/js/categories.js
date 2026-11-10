/* ==========================================================
   Catégories de Pokémon (utilisées par Pokédoku et 4 par 4)
   + générateurs de grilles avec vérification de faisabilité
   ========================================================== */
(function (root) {
  const PK = root.PK;
  const { P, ALL, D, has, norm } = PK;

  const CATS = [];
  const add = (id, fam, label, test, o = {}) => CATS.push(Object.assign({ id, fam, label, test, doku: true, q4: false, check: false, diff: 2, desc: '' }, o));

  // Types
  D.types.forEach(t => add('type' + t.id, 'type', `Type ${t.name}`, p => p.t.includes(t.id),
    { html: `<span class="type" style="background:${t.color}">${t.name}</span>`, q4: true, check: true, diff: 1, desc: `Pokémon possédant le type ${t.name} (en type principal ou secondaire).` }));
  // Générations
  for (let g = 1; g <= 9; g++) add('gen' + g, 'gen', `Génération ${g}`, p => p.gen === g,
    { html: `Génération ${g}<br><small>${PK.GEN_NAMES[g]}</small>`, q4: true, check: true, diff: 2, desc: `Pokémon apparu pour la première fois en génération ${g} (${PK.GEN_NAMES[g]}). Les formes comptent pour la génération où elles sont apparues (ex. formes d'Alola = génération 7, Méga-Évolutions = génération 6 ou 9).` });

  // Statuts
  add('leg', 'statut', 'Légendaire', p => has(p, 'leg'), { q4: true, check: true, diff: 2, desc: 'Pokémon classé Légendaire (hors Fabuleux, Ultra-Chimères et Paradoxes).' });
  add('myth', 'statut', 'Fabuleux', p => has(p, 'myth'), { q4: true, check: true, diff: 3, desc: 'Pokémon Fabuleux (Mew, Celebi, Jirachi…).' });
  add('baby', 'statut', 'Bébé Pokémon', p => has(p, 'baby'), { q4: true, check: true, diff: 3, desc: 'Pokémon Bébé (Pichu, Togepi, Riolu…).' });
  add('ultra', 'statut', 'Ultra-Chimère', p => has(p, 'ultra'), { q4: true, check: true, diff: 3, desc: 'Les Ultra-Chimères venues d\'Ultra-Dimension (génération 7).' });
  add('paradox', 'statut', 'Pokémon Paradoxe', p => has(p, 'paradox'), { q4: true, check: true, diff: 3, desc: 'Formes anciennes ou futures découvertes à Paldea.' });
  add('fossil', 'groupe', 'Pokémon Fossile', p => has(p, 'fossil'), { q4: true, check: true, diff: 2, desc: 'Pokémon ressuscités à partir d\'un fossile, et leurs évolutions.' });
  add('starter', 'groupe', 'Lignée de starter', p => has(p, 'starter'), { q4: true, check: true, diff: 1, desc: 'Pokémon de départ des jeux principaux et leurs évolutions.' });
  add('pseudo', 'groupe', 'Lignée pseudo-légendaire', p => has(p, 'pseudo'), { q4: true, check: true, diff: 3, desc: 'Lignées à 600 de total de stats : Dracolosse, Tyranocif, Drattak, Métalosse, Carchacrok, Trioxhydre, Muplodocus, Ékaïser, Lanssorien, Glaivodo.' });
  add('eevee', 'groupe', 'Évoli et ses évolutions', p => has(p, 'eevee'), { doku: false, q4: true, check: true, diff: 1, desc: 'Évoli et les Évolitions.' });
  add('pikaclone', 'groupe', '« Pikaclones »', p => has(p, 'pikaclone'), { doku: false, q4: true, check: true, diff: 3, desc: 'Petits rongeurs Électrik inspirés de Pikachu : Posipi, Négapi, Pachirisu, Emolga, Dedenne, Togedemaru, Morpeko, lignée de Pohm.' });

  // Formes
  add('mega', 'forme', 'Possède une Méga-Évolution', p => has(p, 'mega'), { html: 'Possède une<br>Méga-Évolution', q4: true, check: true, diff: 3, desc: 'Espèce pouvant méga-évoluer (XY, ROSA, Légendes Z-A), ex. Dracaufeu. La Méga-Évolution elle-même (Méga-Dracaufeu X) ne compte pas.' });
  add('gmax', 'forme', 'Possède une forme Gigamax', p => has(p, 'gmax'), { html: 'Possède une<br>forme Gigamax', q4: true, check: true, diff: 3, desc: 'Pokémon disposant d\'une forme Gigamax (Épée et Bouclier).' });
  add('reg', 'forme', 'Possède une forme régionale', p => p.reg.length > 0, { html: 'Possède une<br>forme régionale', desc: 'Espèce ayant une forme d\'Alola, de Galar, de Hisui ou de Paldea (ex. Raichu). La forme régionale elle-même (Raichu d\'Alola) ne compte pas.' });
  for (const r of ['alola', 'galar', 'hisui']) add('reg-' + r, 'forme', `Possède une forme ${PK.REG_NAMES[r]}`, p => p.reg.includes(r),
    { html: `Possède une forme<br>${PK.REG_NAMES[r]}`, doku: false, q4: true, check: true, diff: 3, desc: `Pokémon ayant une forme régionale ${PK.REG_NAMES[r]}.` });

  // Les formes elles-mêmes (uniquement quand les formes sont incluses dans le jeu)
  add('isreg', 'forme2', 'Forme régionale', p => p.k === 'reg', { html: 'Est une<br>forme régionale', q4: false, desc: 'Forme régionale d\'un Pokémon (ex. Raichu d\'Alola, Caninos de Hisui, Axoloto de Paldea).' });
  add('ismega', 'forme2', 'Méga-Évolution', p => p.k === 'mega' || p.k === 'primal', { html: 'Est une<br>Méga-Évolution', q4: true, check: true, diff: 1, desc: 'Méga-Évolutions (et Primo-Résurgences de Kyogre et Groudon).' });
  for (const r of ['alola', 'galar', 'hisui']) add('isreg-' + r, 'forme2', `Formes ${PK.REG_NAMES[r]}`, p => p.k === 'reg' && p.rg === r,
    { doku: false, q4: true, check: true, diff: 1, desc: `Formes régionales ${PK.REG_NAMES[r]} (ex. ${r === 'alola' ? 'Goupix d\'Alola' : r === 'galar' ? 'Ponyta de Galar' : 'Caninos de Hisui'}).` });

  // Types simples / doubles
  add('mono', 'nbtype', 'Un seul type', p => p.t.length === 1, { desc: 'Pokémon n\'ayant qu\'un seul type.' });
  add('dual', 'nbtype', 'Double type', p => p.t.length === 2, { desc: 'Pokémon ayant deux types.' });

  // Stades d'évolution
  add('noevo', 'stade', 'N\'évolue pas', p => !p.pre && !p.evo, { desc: 'Pokémon sans pré-évolution ni évolution.' });
  add('base', 'stade', 'Premier stade (évolue)', p => !p.pre && p.evo, { html: 'Premier stade<br><small>et peut évoluer</small>', desc: 'Pokémon sans pré-évolution mais qui peut évoluer.' });
  add('mid', 'stade', 'Stade intermédiaire', p => p.pre && p.evo, { desc: 'Pokémon qui a une pré-évolution ET une évolution.' });
  add('final', 'stade', 'Évolution finale', p => p.pre && !p.evo, { html: 'Évolution finale<br><small>(a une pré-évolution)</small>', desc: 'Pokémon qui a une pré-évolution et n\'évolue plus.' });
  add('stone', 'methode', 'Évolue grâce à une pierre', p => has(p, 'stone'), { html: 'Obtenu avec une<br>pierre d\'évolution', q4: true, check: true, diff: 4, desc: 'Pokémon obtenu en faisant évoluer sa pré-évolution avec une pierre (Feu, Eau, Plante, Foudre, Lune, Soleil, Éclat, Nuit, Aube, Glace).' });
  add('trade', 'methode', 'Évolue par échange', p => has(p, 'trade'), { html: 'Obtenu par<br>échange', q4: true, check: true, diff: 4, desc: 'Pokémon obtenu en échangeant sa pré-évolution.' });

  // Mesures
  add('heavy', 'mesure', 'Pèse 100 kg ou plus', p => p.w >= 1000, { desc: 'Poids ≥ 100 kg.' });
  add('light', 'mesure', 'Pèse 5 kg ou moins', p => p.w <= 50, { desc: 'Poids ≤ 5 kg.' });
  add('tall', 'mesure', 'Mesure 2 m ou plus', p => p.h >= 20, { desc: 'Taille ≥ 2 m.' });
  add('vheavy', 'mesure', 'Pèse 300 kg ou plus', p => p.w >= 3000, { doku: false, q4: true, check: true, diff: 4, desc: 'Poids ≥ 300 kg.' });
  add('tiny', 'mesure', 'Mesure 30 cm ou moins', p => p.h <= 3, { doku: false, q4: true, check: true, diff: 4, desc: 'Taille ≤ 0,3 m.' });
  add('bst600', 'mesure', 'Total des stats ≥ 600', p => PK.bst(p) >= 600, { html: 'Total des stats<br>≥ 600', desc: 'Somme des statistiques de base supérieure ou égale à 600.' });

  // Initiale du nom (4 par 4 uniquement)
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(L => add('letter' + L, 'lettre', `Nom commençant par « ${L} »`, p => p._n[0] === L.toLowerCase(),
    { doku: false, q4: true, check: true, diff: 4, desc: `Nom français commençant par la lettre ${L}.` }));

  const byCat = {};
  CATS.forEach(c => { c.html = c.html || c.label; byCat[c.id] = c; c.members = ALL.filter(c.test); });

  /* ---------------- Pokédoku ---------------- */
  // Trouve une affectation de 9 Pokémon distincts (couplage biparti) — prouve que la grille est faisable
  function matching(cells) {
    const order = cells.map((c, i) => i).sort((a, b) => cells[a].length - cells[b].length);
    const used = new Set(), res = [];
    function go(k) {
      if (k === order.length) return true;
      for (const p of cells[order[k]]) {
        if (used.has(p.id)) continue;
        used.add(p.id); res[order[k]] = p;
        if (go(k + 1)) return true;
        used.delete(p.id);
      }
      return false;
    }
    return go(0) ? res : null;
  }

  const DOKU_LEVELS = {
    facile: { min: 10, fams: ['type', 'gen', 'stade', 'nbtype', 'statut'] },
    normal: { min: 4, fams: null },
    difficile: { min: 1, fams: null },
  };

  function genDoku(level = 'normal', r = Math.random, pool = P) {
    const pmOf = {};
    const L = DOKU_LEVELS[level] || DOKU_LEVELS.normal;
    const poolSet = new Set(pool.map(p => p.id));
    const cats = CATS.filter(c => c.doku && (!L.fams || L.fams.includes(c.fam)))
      .filter(c => (pmOf[c.id] = c.members.filter(p => poolSet.has(p.id))).length >= 6);
    const types = cats.filter(c => c.fam === 'type'), others = cats.filter(c => c.fam !== 'type');
    for (let tries = 0; tries < 20000; tries++) {
      // 2 à 4 types, le reste parmi les autres catégories
      const nt = 2 + Math.floor(r() * 3);
      const chosen = PK.shuffle(types, r).slice(0, nt).concat(PK.shuffle(others, r).slice(0, 6 - nt));
      const fam = {}; chosen.forEach(c => fam[c.fam] = (fam[c.fam] || 0) + 1);
      if ((fam.gen || 0) > 2 || (fam.stade || 0) > 2 || (fam.nbtype || 0) > 1 || (fam.mesure || 0) > 2 || (fam.forme2 || 0) > 1) continue;
      const sh = PK.shuffle(chosen, r);
      const rows = sh.slice(0, 3), cols = sh.slice(3);
      const cells = [];
      let ok = true;
      for (const a of rows) {
        for (const b of cols) {
          const m = pmOf[a.id].filter(p => b.test(p));
          // éviter les cases où un critère inclut entièrement l'autre de façon triviale (ex. Ultra-Chimère × Gén. 7)
          const small = Math.min(pmOf[a.id].length, pmOf[b.id].length);
          if (m.length < L.min || (m.length === small && small < 25)) { ok = false; break; }
          cells.push(m);
        }
        if (!ok) break;
      }
      if (!ok) continue;
      if (!matching(cells)) continue;
      return { rows, cols, cells };
    }
    return null;
  }

  /* ---------------- 4 par 4 ---------------- */
  const Q4_COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'];
  function genQ4(r = Math.random, pool = P) {
    const poolSet = new Set(pool.map(p => p.id));
    const q4 = CATS.filter(c => c.q4).map(c => Object.assign(c, { pm: c.members.filter(p => poolSet.has(p.id)) }))
      .filter(c => c.pm.length >= 4);
    const checks = CATS.filter(c => c.check);
    for (let tries = 0; tries < 30000; tries++) {
      // tirage de 4 catégories (familles variées)
      const chosen = [];
      const fam = {};
      for (const c of PK.shuffle(q4, r)) {
        const lim = c.fam === 'type' ? 2 : 1;
        if (c.fam === 'forme2' && (fam.forme2 || 0) >= 1) continue;
        if ((fam[c.fam] || 0) >= lim) continue;
        chosen.push(c); fam[c.fam] = (fam[c.fam] || 0) + 1;
        if (chosen.length === 4) break;
      }
      if (chosen.length < 4) continue;
      // au moins une catégorie « facile »
      if (!chosen.some(c => c.diff <= 2)) continue;
      // Pokémon qui ne vérifient QUE leur catégorie parmi les 4
      const groups = [];
      let ok = true;
      for (const c of chosen) {
        // si une catégorie « Possède une forme de… » est tirée, on n'affiche aucune forme régionale (pour éviter la confusion)
        const noReg = chosen.some(o => o.id.startsWith('reg-'));
        const noMega = chosen.some(o => o.id === 'mega');
        const excl = c.pm.filter(p => (!noReg || p.k !== 'reg') && (!noMega || (p.k !== 'mega' && p.k !== 'primal')) && chosen.every(o => o === c || !o.test(p)));
        if (excl.length < 4) { ok = false; break; }
        groups.push({ cat: c, mons: PK.shuffle(excl, r).slice(0, 4) });
      }
      if (!ok) continue;
      const all = groups.flatMap(g => g.mons);
      // Aucune autre catégorie ne doit former un « faux groupe » de 4 parmi les 16
      const gi = {}; groups.forEach((g, i) => g.mons.forEach(p => gi[p.id] = i));
      ok = checks.every(c => {
        if (chosen.includes(c)) return true;
        const m = all.filter(c.test);
        if (m.length < 4) return true;
        return m.every(p => gi[p.id] === gi[m[0].id]) && m.length <= 4;
      });
      if (!ok) continue;
      groups.sort((a, b) => a.cat.diff - b.cat.diff);
      groups.forEach((g, i) => g.color = Q4_COLORS[i]);
      return groups;
    }
    return null;
  }

  PK.CATS = CATS; PK.byCat = byCat; PK.genDoku = genDoku; PK.genQ4 = genQ4; PK.matching = matching;
})(typeof window !== 'undefined' ? window : globalThis);
