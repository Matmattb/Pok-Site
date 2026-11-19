(function () {
  const { P, byId, art, typesHtml, GAMES, dailyRng, pick, fmtH, fmtW, num, bst } = PK;

  // Pokémon du jour
  const d = pick(P.filter(p => window.PKDESC && PKDESC[p.id]), dailyRng('accueil'));
  const desc = (window.PKDESC && PKDESC[d.id]) || 'Aucune description disponible.';
  document.getElementById('daily').innerHTML = `
    <img src="${art(d.id)}" alt="${d.n}">
    <div>
      <div class="muted"><b>${num(d.id)}</b> · ${d.g} · Génération ${d.gen}</div>
      <h2>${d.n}</h2>
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
