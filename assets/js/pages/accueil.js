(function () {
  const { P, byId, art, typesHtml, GAMES, dailyRng, pick, fmtH, fmtW, num, bst } = PK;

  // Trio du héros : un trio différent à chaque visite
  const TRIOS = [[25, 1, 4], [6, 9, 3], [150, 151, 249], [384, 382, 383], [448, 445, 658], [887, 815, 812], [1007, 1008, 906], [94, 133, 143], [282, 700, 197]];
  const trio = pick(TRIOS);
  document.getElementById('hero-art').innerHTML = trio.map(id => `<img src="${art(id)}" alt="${byId[id].n}">`).join('');

  // Pokémon du jour
  const d = pick(P.filter(p => window.PKDESC && PKDESC[p.id]), dailyRng('accueil'));
  const desc = (window.PKDESC && PKDESC[d.id]) || 'Aucune description disponible.';
  document.getElementById('daily').innerHTML = `
    <img src="${art(d.id)}" alt="${d.n}">
    <div>
      <div class="muted"><b>${num(d.id)}</b> · ${d.g} · Génération ${d.gen}</div>
      <h2 style="font-size:2rem;margin:.2em 0">${d.n}</h2>
      <div>${typesHtml(d)}</div>
      <p style="font-style:italic">« ${desc} »</p>
      <div class="flex"><span class="pill">📏 ${fmtH(d.h)}</span><span class="pill">⚖️ ${fmtW(d.w)}</span><span class="pill">📊 Total ${bst(d)}</span></div>
      <a class="btn small mt" href="pokemon.html?id=${d.id}">Voir sa fiche →</a>
    </div>`;

  // Jeux
  document.getElementById('games').innerHTML = GAMES.map((g, i) => `
    <a class="game-card" href="${g.href}">
      ${i < 3 ? '<span class="tag">POPULAIRE</span>' : ''}
      <div class="emoji">${g.emoji}</div><h3>${g.name}</h3><p>${g.desc}</p>
      <img class="deco" src="${art(g.deco)}" alt="">
    </a>`).join('');

  // Faits calculés à partir des données
  const maxBy = f => P.reduce((a, b) => f(b) > f(a) ? b : a);
  const minBy = f => P.reduce((a, b) => f(b) < f(a) ? b : a);
  const heavy = maxBy(p => p.w), tall = maxBy(p => p.h), strong = maxBy(bst), weak = minBy(bst), fast = maxBy(p => p.st[5]);
  const facts = [
    [P.length, 'Pokémon dans le Pokédex national'],
    [heavy.n, `le plus lourd (${fmtW(heavy.w)})`],
    [tall.n, `le plus grand (${fmtH(tall.h)})`],
    [strong.n, `le plus haut total de stats (${bst(strong)})`],
    [fast.n, `le plus rapide (${fast.st[5]} en Vitesse)`],
    [weak.n, `le plus petit total de stats (${bst(weak)})`],
  ];
  document.getElementById('facts').innerHTML = facts.map(([b, s]) => `<div class="card stat-box"><b>${b}</b><span>${s}</span></div>`).join('');
})();
