/* ==========================================================
   Logique de jeu partagée entre le navigateur et le serveur de vérification
   (aucun accès à la page ici : ce fichier doit rester « pur »)
   ========================================================== */
(function (root) {
  const PK = root.PK;
  const { P, D, byId, effOn, bst, pick, fmtH, fmtW } = PK;

  /* ---------- Pokédle ---------- */
  // Compare une proposition au Pokémon mystère. Renvoie les 7 cases (classe, texte, flèche).
  function dleFeedback(g, T) {
    const arrow = (a, b) => a === b ? ['ok', ''] : ['ko', a < b ? '↑' : '↓'];
    const t1 = g.t[0], t2 = g.t[1] || 0, T2 = T.t[1] || 0;
    const cells = [];
    cells.push([t1 === T.t[0] ? 'ok' : T.t.includes(t1) ? 'mid' : 'ko', D.types[t1 - 1].name, '']);
    cells.push([t2 === T2 ? 'ok' : (t2 && T.t.includes(t2)) ? 'mid' : 'ko', t2 ? D.types[t2 - 1].name : 'Aucun', '']);
    let [c, a] = arrow(g.gen, T.gen); cells.push([c, 'Gén. ' + g.gen, a]);
    [c, a] = arrow(g.stg, T.stg); cells.push([c, 'Stade ' + g.stg, a]);
    cells.push([g.c === T.c ? 'ok' : 'ko', D.colors[g.c - 1], '']);
    [c, a] = arrow(g.h, T.h); cells.push([c, fmtH(g.h), a]);
    [c, a] = arrow(g.w, T.w); cells.push([c, fmtW(g.w), a]);
    return { id: g.id, ok: g.id === T.id, cells };
  }
  // Indices débloqués selon le nombre d'erreurs
  function dleHints(T, mode, wrong) {
    const h = [];
    if (mode === 'classique') {
      if (wrong >= 5) h.push({ k: 'genus', v: T.g });
      if (wrong >= 9) h.push({ k: 'letter', v: T.n[0] });
      if (wrong < 5) h.push({ k: 'wait', v: 5 - wrong });
    } else {
      if (wrong >= 3) h.push({ k: 'types', v: T.t });
      if (wrong >= 6) h.push({ k: 'gen', v: T.gen }, { k: 'letter', v: T.n[0] });
      if (wrong < 3) h.push({ k: 'wait', v: 3 - wrong });
    }
    return h;
  }
  const maskDesc = (p, text) => (text || '').replace(new RegExp(p.n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '???');
  const dlePoints = n => Math.max(20, 100 - 8 * (n - 1));

  /* ---------- Pokédoku ---------- */
  // 10 points par case + bonus de rareté (jusqu'à 10) : moins la réponse est donnée, plus elle rapporte
  const dokuCellPoints = share => 10 + Math.round(10 * (1 - share));

  /* ---------- 4 par 4 ---------- */
  const q4Points = (won, errors, solved) => won ? Math.max(25, 100 - 15 * errors) : 10 * solved;

  /* ---------- Quiz des types ---------- */
  function quizGen(r) {
    let atk, mon, m;
    do { atk = 1 + Math.floor(r() * 18); mon = pick(P, r); m = effOn(atk, mon.t); } while (m === 1 && r() < .6);
    return { atk, mon, m };
  }

  /* ---------- Plus ou Moins ---------- */
  const HL_CRITS = {
    poids: { label: '⚖️ Poids', v: p => p.w, f: fmtW },
    taille: { label: '📏 Taille', v: p => p.h, f: fmtH },
    stats: { label: '📊 Total des stats', v: bst, f: v => v },
    vitesse: { label: '💨 Vitesse', v: p => p.st[5], f: v => v },
    attaque: { label: '⚔️ Attaque', v: p => p.st[1], f: v => v },
  };
  function hlOther(p, r) { let q; do { q = pick(P, r); } while (q.id === p.id); return q; }
  const hlCorrect = (crit, A, B, dir) => { const a = HL_CRITS[crit].v(A), b = HL_CRITS[crit].v(B); return a === b || (dir > 0 ? b > a : b < a); };

  /* ---------- Memory ---------- */
  const MEMORY_SIZES = [6, 8, 12, 18];
  function memoryDeck(n, r) { const mons = PK.shuffle(P, r).slice(0, n); return PK.shuffle(mons.concat(mons).map(p => p.id), r); }
  // Score de classement (plus haut = meilleur) : d'abord le nombre de coups, puis le temps
  const memoryScore = (moves, sec) => 1000000 - moves * 1000 - Math.min(999, sec);
  const memoryPoints = (n, moves) => Math.max(10, 20 + 5 * n - 2 * (moves - n));

  /* ---------- Défi Pokédex ---------- */
  const CHRONO_DURATIONS = [180, 300, 600, 1200];
  const chronoPool = gen => P.filter(p => !gen || p.gen === gen);

  /* ---------- Noms des classements ---------- */
  const GAME_NAMES = {
    'pokedle-classique': 'Pokédle Classique', 'pokedle-silhouette': 'Pokédle Silhouette', 'pokedle-description': 'Pokédle Description', 'pokedle-cri': 'Pokédle Cri',
    'pokedoku': 'Pokédoku', '4par4': '4 par 4', 'quiz': 'Quiz des types',
  };
  for (const k in HL_CRITS) GAME_NAMES['hl-' + k] = 'Plus ou Moins — ' + HL_CRITS[k].label.replace(/^\S+\s/, '');
  for (const n of MEMORY_SIZES) GAME_NAMES['memory-' + n] = `Memory — ${n} paires`;
  for (let g = 0; g <= 9; g++) for (const d of CHRONO_DURATIONS) GAME_NAMES[`chrono-${g}-${d}`] = `Défi Pokédex — ${g ? 'Gén. ' + g : 'Tous'} · ${d / 60} min`;
  const DAILY_GAMES = ['pokedle-classique', 'pokedle-silhouette', 'pokedle-description', 'pokedle-cri', 'pokedoku', '4par4'];

  /* ---------- Niveaux de dresseur ---------- */
  const LEVELS = [
    [0, 'Débutant', '🥚'], [150, 'Dresseur', '🎒'], [500, 'Dresseur confirmé', '⭐'], [1200, 'As de la Ligue', '🏅'],
    [2500, "Champion d'arène", '🏟️'], [5000, 'Membre du Conseil 4', '🔥'], [10000, 'Maître Pokémon', '👑'], [20000, 'Légende', '🌟'],
  ];
  function levelOf(points) {
    let i = 0; while (i + 1 < LEVELS.length && points >= LEVELS[i + 1][0]) i++;
    const [min, name, icon] = LEVELS[i], next = LEVELS[i + 1];
    return { name, icon, min, next: next ? next[0] : null, nextName: next ? next[1] : null, progress: next ? (points - min) / (next[0] - min) : 1 };
  }

  PK.L = {
    dleFeedback, dleHints, maskDesc, dlePoints, dokuCellPoints, q4Points,
    quizGen, HL_CRITS, hlOther, hlCorrect, MEMORY_SIZES, memoryDeck, memoryScore, memoryPoints,
    CHRONO_DURATIONS, chronoPool, GAME_NAMES, DAILY_GAMES, LEVELS, levelOf,
  };
})(typeof window !== 'undefined' ? window : globalThis);
