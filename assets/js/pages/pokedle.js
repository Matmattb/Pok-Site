(function () {
  const { P, ALL, D, byId, art, sprite, cry, typesHtml, typeBadge, fmtH, fmtW, store, toast, confetti } = PK;
  const $ = id => document.getElementById(id);
  const DESC = window.PKDESC || {};

  const params = new URLSearchParams(location.search);
  let mode = params.get('mode') || store.get('dle:mode', 'classique');
  let kind = store.get('dle:kind', 'jour');
  let gens = store.get('dle:gens', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let withForms = store.get('dle:forms', false);   // formes (régionales, Méga…) en mode illimité
  // Les formes ne servent qu'en Classique et Silhouette (elles partagent description et cri avec leur espèce)
  const formsActive = () => kind === 'illimite' && withForms && (mode === 'classique' || mode === 'silhouette');
  let target, guesses, over, picker;

  const RULES = {
    classique: 'Vert = identique · Orange = type présent mais pas à cette place · Rouge = différent · ↑/↓ = la valeur du Pokémon mystère est plus haute/basse.',
    silhouette: 'Reconnais le Pokémon à sa silhouette. Des indices se débloquent après 3 et 6 erreurs.',
    description: 'Retrouve le Pokémon à partir de sa description du Pokédex (son nom est masqué). Indices après 3 et 6 erreurs.',
    cri: 'Écoute le cri et retrouve le Pokémon ! Indices après 3 et 6 erreurs.',
  };

  function pool(forTarget) {
    let l = kind === 'jour' ? P : (formsActive() ? ALL : P).filter(p => gens.includes(p.gen));
    if (forTarget && mode === 'description') l = l.filter(p => DESC[p.id]);
    return l;
  }
  const dailyKey = () => `dle:day:${mode}:${PK.todayKey()}`;

  function newGame(keepTarget) {
    over = false; guesses = [];
    if (kind === 'jour') {
      target = PK.pick(pool(true), PK.dailyRng('pokedle-' + mode));
      const saved = store.get(dailyKey(), null);
      if (saved && saved.t === target.id) { guesses = saved.g.map(i => byId[i]); over = saved.over; }
    } else if (!keepTarget) {
      target = PK.pick(pool(true));
    }
    render();
  }

  function save() {
    if (kind === 'jour') store.set(dailyKey(), { t: target.id, g: guesses.map(p => p.id), over });
  }

  function cmpNum(a, b) { return a === b ? ['ok', ''] : ['ko', a < b ? '↑' : '↓']; }
  function rowHtml(g, delay0) {
    const T = target, cells = [];
    cells.push(['img', `<img src="${sprite(g.id)}" alt="" title="${g.n}">`]);
    const t1 = g.t[0], t2 = g.t[1] || 0, T2 = T.t[1] || 0;
    cells.push([t1 === T.t[0] ? 'ok' : T.t.includes(t1) ? 'mid' : 'ko', D.types[t1 - 1].name]);
    cells.push([t2 === T2 ? 'ok' : (t2 && T.t.includes(t2)) ? 'mid' : 'ko', t2 ? D.types[t2 - 1].name : 'Aucun']);
    let [c, a] = cmpNum(g.gen, T.gen); cells.push([c, `Gén. ${g.gen}<span class="arr">${a}</span>`]);
    [c, a] = cmpNum(g.stg, T.stg); cells.push([c, `Stade ${g.stg}<span class="arr">${a}</span>`]);
    cells.push([g.c === T.c ? 'ok' : 'ko', D.colors[g.c - 1]]);
    [c, a] = cmpNum(g.h, T.h); cells.push([c, `${fmtH(g.h)}<span class="arr">${a}</span>`]);
    [c, a] = cmpNum(g.w, T.w); cells.push([c, `${fmtW(g.w)}<span class="arr">${a}</span>`]);
    return cells.map(([cls, h], i) => `<div class="dle-cell ${cls === 'img' ? '' : cls}" style="animation-delay:${delay0 ? i * 0.12 : 0}s">${h}</div>`).join('');
  }

  function maskDesc(p) {
    let t = DESC[p.id] || '';
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(esc(p.n), 'gi'), '???');
    return t;
  }

  function hints() {
    const wrong = guesses.filter(g => g.id !== target.id).length;
    const h = [];
    if (mode === 'classique') {
      if (wrong >= 5) h.push(`💡 Catégorie : <b>${target.g}</b>`);
      if (wrong >= 9) h.push(`💡 Commence par <b>${target.n[0]}</b>`);
      if (!h.length) h.push(`<span class="muted">Indice dans ${5 - wrong} essai(s)</span>`);
    } else {
      if (wrong >= 3) h.push(`💡 Types : ${typesHtml(target)}`);
      if (wrong >= 6) h.push(`💡 Génération <b>${target.gen}</b> · commence par <b>${target.n[0]}</b>`);
      if (wrong < 3) h.push(`<span class="muted">Indice dans ${3 - wrong} essai(s)</span>`);
    }
    return `<div class="hint-list">${h.map(x => `<span class="pill">${x}</span>`).join('')}</div>`;
  }

  function renderClue() {
    const won = over && guesses.some(g => g.id === target.id);
    let h = '';
    if (mode === 'classique') h = `<div class="center"><b>Quel est ce Pokémon ?</b> ${kind === 'jour' ? '— Défi du ' + new Date().toLocaleDateString('fr-FR') : ''}</div>`;
    if (mode === 'silhouette') h = `<img class="silhouette${over ? ' reveal' : ''}" src="${art(target.id)}" alt="Silhouette" draggable="false">`;
    if (mode === 'description') h = `<p class="desc-box">« ${over ? DESC[target.id] : maskDesc(target)} »</p>`;
    if (mode === 'cri') h = `<div class="center"><button class="btn blue" id="play">🔊 Écouter le cri</button>${over ? `<br><img src="${art(target.id)}" style="width:180px" alt="">` : ''}</div>`;
    $('clue').innerHTML = h + (over ? '' : hints());
    const pl = $('play');
    if (pl) pl.onclick = () => { const a = new Audio(cry(target.id)); a.volume = .5; a.play().catch(() => toast('Lecture impossible (format .ogg non supporté ?)')); };
    if (over) $('result').innerHTML = `<div class="card result-box">
      <h2>${won ? '🎉 Bravo !' : '😢 Perdu…'}</h2>
      <img src="${art(target.id)}" alt="">
      <h3>C'était <a href="pokemon.html?id=${target.id}">${target.n}</a> !</h3>
      <p>${won ? `Trouvé en <b>${guesses.length}</b> essai${guesses.length > 1 ? 's' : ''}.` : 'Tu feras mieux la prochaine fois.'}</p>
      <div class="flex center">${kind === 'illimite' ? '<button class="btn" id="again">🔁 Nouveau Pokémon</button>' : '<button class="btn blue" id="share">📋 Partager</button><button class="btn ghost" id="go-unl">♾️ Mode illimité</button>'}</div>
    </div>`;
    else $('result').innerHTML = '';
    $('again') && ($('again').onclick = () => newGame());
    $('go-unl') && ($('go-unl').onclick = () => setKind('illimite'));
    $('share') && ($('share').onclick = share);
  }

  function share() {
    let txt = `PokéMonde · Pokédle ${mode} du ${new Date().toLocaleDateString('fr-FR')} — ${guesses.length} essai(s)\n`;
    if (mode === 'classique') txt += guesses.map(g => rowHtml(g).match(/dle-cell (ok|mid|ko)/g).map(m => m.endsWith('ok') ? '🟩' : m.endsWith('mid') ? '🟧' : '🟥').join('')).join('\n');
    navigator.clipboard && navigator.clipboard.writeText(txt).then(() => toast('Résultat copié !'));
  }

  function renderBoard(animateLast) {
    if (mode === 'classique') {
      const heads = ['Pokémon', 'Type 1', 'Type 2', 'Génération', 'Stade', 'Couleur', 'Taille', 'Poids'];
      $('board').innerHTML = guesses.length ? `<div class="dle-scroll"><div class="dle-grid">${heads.map(h => `<div class="dle-head">${h}</div>`).join('')}
        ${guesses.slice().reverse().map((g, i) => rowHtml(g, animateLast && i === 0)).join('')}</div></div>` : '';
    } else {
      $('board').innerHTML = `<div class="wrong-list">${guesses.filter(g => g.id !== target.id).map(g => `<span><img src="${sprite(g.id)}" alt="">${g.n}</span>`).join('')}</div>`;
    }
  }

  function render(animateLast) {
    document.querySelectorAll('#modes .tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    document.querySelectorAll('#kinds .tab').forEach(b => b.classList.toggle('active', b.dataset.kind === kind));
    $('rules').textContent = RULES[mode];
    $('gens').innerHTML = kind === 'illimite' ? '<b class="muted">Générations :</b> ' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => `<label class="pill"><input type="checkbox" value="${g}" ${gens.includes(g) ? 'checked' : ''}> ${g}</label>`).join('')
      + ((mode === 'classique' || mode === 'silhouette') ? ` <label class="toggle pill" title="Raichu d'Alola, Méga-Dracaufeu X, Motisma Lavage…"><input type="checkbox" id="dle-forms" ${withForms ? 'checked' : ''}> Inclure les formes</label>` : '') : '';
    $('dle-forms') && ($('dle-forms').onchange = e => { withForms = e.target.checked; store.set('dle:forms', withForms); newGame(); });
    $('gens').querySelectorAll('input[value]').forEach(i => i.onchange = () => {
      const sel = [...$('gens').querySelectorAll('input[value]:checked')].map(x => +x.value);
      if (!sel.length) { i.checked = true; return toast('Garde au moins une génération'); }
      gens = sel; store.set('dle:gens', gens); newGame();
    });
    $('pick').style.display = over ? 'none' : '';
    $('actions').innerHTML = !over && kind === 'illimite' ? '<button class="btn ghost small" id="giveup">🏳️ Abandonner</button><button class="btn ghost small" id="skip">⏭️ Passer</button>' : '';
    $('giveup') && ($('giveup').onclick = () => { over = true; render(); });
    $('skip') && ($('skip').onclick = () => newGame());
    renderClue(); renderBoard(animateLast);
    if (!over) picker.focus();
  }

  function guess(p) {
    if (over) return;
    guesses.push(p);
    if (p.id === target.id) {
      over = true; confetti();
      const st = store.get('dle:stats', {}); const k = mode + ':' + kind;
      st[k] = st[k] || { w: 0, tries: 0 }; st[k].w++; st[k].tries += guesses.length; store.set('dle:stats', st);
    }
    save(); render(true);
    if (!over && mode !== 'classique') { $('clue').classList.remove('shake'); void $('clue').offsetWidth; $('clue').classList.add('shake'); }
  }

  picker = PK.picker($('pick'), {
    pool: () => kind === 'jour' ? P : (formsActive() ? ALL : P).filter(p => gens.includes(p.gen)),
    exclude: () => new Set(guesses.map(g => g.id)),
    onPick: guess,
  });

  function setKind(k) { kind = k; store.set('dle:kind', k); newGame(); }
  document.querySelectorAll('#modes .tab').forEach(b => b.onclick = () => { mode = b.dataset.mode; store.set('dle:mode', mode); newGame(); });
  document.querySelectorAll('#kinds .tab').forEach(b => b.onclick = () => setKind(b.dataset.kind));
  newGame();
})();
