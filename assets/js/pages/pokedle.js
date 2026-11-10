(function () {
  const { P, ALL, D, byId, art, sprite, cry, typesHtml, store, toast, confetti, L } = PK;
  const O = PK.online;
  const $ = id => document.getElementById(id);
  const DESC = window.PKDESC || {};

  const params = new URLSearchParams(location.search);
  let mode = params.get('mode') || store.get('dle:mode', 'classique');
  let kind = store.get('dle:kind', 'jour');
  let gens = store.get('dle:gens', [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  let withForms = store.get('dle:forms', false);   // formes (régionales, Méga…) en mode illimité
  // Les formes ne servent qu'en Classique et Silhouette (elles partagent description et cri avec leur espèce)
  const formsActive = () => kind === 'illimite' && withForms && (mode === 'classique' || mode === 'silhouette');

  // État commun aux deux types de partie.
  // rows : propositions [{id, ok, cells?}] · target : id du mystère (connu seulement à la fin pour le défi du jour)
  let S = null, busy = false, gameToken = 0;

  const RULES = {
    classique: 'Vert = identique · Orange = type présent mais pas à cette place · Rouge = différent · ↑/↓ = la valeur du Pokémon mystère est plus haute/basse.',
    silhouette: 'Reconnais le Pokémon à sa silhouette. Des indices se débloquent après 3 et 6 erreurs.',
    description: 'Retrouve le Pokémon à partir de sa description du Pokédex (son nom est masqué). Indices après 3 et 6 erreurs.',
    cri: 'Écoute le cri et retrouve le Pokémon ! Indices après 3 et 6 erreurs.',
  };
  const RULES_DAY = ' Défi du jour : la réponse est gardée sur le serveur et change à minuit (heure de Paris). Points : 100 au 1er essai, puis −8 par essai (minimum 20).';

  const unlPool = () => (formsActive() ? ALL : P).filter(p => gens.includes(p.gen));
  const wrongCount = () => S.rows.filter(r => !r.ok).length;
  const guestKey = () => `dle:srv:${mode}:${S.day}`;

  /* ---------- Démarrage d'une partie ---------- */
  async function newGame() {
    const token = ++gameToken;
    if (kind === 'illimite') {
      let pool = unlPool();
      if (mode === 'description') pool = pool.filter(p => DESC[p.id]);
      const T = PK.pick(pool);
      S = { local: true, T, target: T.id, rows: [], over: false, won: false, clue: {} };
      return render();
    }
    S = null; render();
    $('clue').innerHTML = '<p class="center muted">Chargement du défi du jour…</p>';
    try {
      await O.ready;
      const st = await O.call('dle-state', { mode });
      if (token !== gameToken) return;
      S = { local: false, day: st.day, clue: st.clue, rows: [], over: false, won: false, hints: L.dleHints({ g: '', n: ' ', t: [] }, mode, 0) };
      if (O.user) {
        S.rows = st.rows || []; S.over = !!st.done; S.target = st.target; S.hints = st.hints || S.hints;
        S.won = S.rows.some(r => r.ok);
      } else {
        const saved = store.get(guestKey(), null);
        if (saved) Object.assign(S, saved);
      }
      render();
    } catch (e) {
      if (token !== gameToken) return;
      $('clue').innerHTML = `<p class="center">⚠️ ${e.message}</p><div class="flex center"><button class="btn" id="retry">🔁 Réessayer</button><button class="btn ghost" id="go-unl2">♾️ Jouer en illimité</button></div>`;
      $('retry').onclick = newGame;
      $('go-unl2').onclick = () => setKind('illimite');
    }
  }

  function saveGuest() {
    if (!S.local && !O.user) store.set(guestKey(), { rows: S.rows, over: S.over, won: S.won, target: S.target, hints: S.hints });
  }

  /* ---------- Affichage ---------- */
  function hintsHtml() {
    const hs = S.local ? L.dleHints(S.T, mode, wrongCount()) : S.hints;
    const h = hs.map(x => x.k === 'genus' ? `💡 Catégorie : <b>${x.v}</b>`
      : x.k === 'letter' ? `💡 Commence par <b>${x.v}</b>`
        : x.k === 'types' ? `💡 Types : ${typesHtml({ t: x.v })}`
          : x.k === 'gen' ? `💡 Génération <b>${x.v}</b>`
            : `<span class="muted">Indice dans ${x.v} essai(s)</span>`);
    return `<div class="hint-list">${h.map(x => `<span class="pill">${x}</span>`).join('')}</div>`;
  }

  function cellsHtml(r, animate) {
    const cells = [['img', `<img src="${sprite(r.id)}" alt="" title="${byId[r.id].n}">`]].concat(r.cells.map(([c, t, a]) => [c, t + (a ? `<span class="arr">${a}</span>` : '')]));
    return cells.map(([cls, h], i) => `<div class="dle-cell ${cls === 'img' ? '' : cls}" style="animation-delay:${animate ? i * 0.12 : 0}s">${h}</div>`).join('');
  }

  function renderClue() {
    const T = S.target ? byId[S.target] : null;
    let h = '';
    if (mode === 'classique') h = `<div class="center"><b>Quel est ce Pokémon ?</b> ${!S.local ? '— Défi du ' + new Date().toLocaleDateString('fr-FR') : ''}</div>`;
    if (mode === 'silhouette') {
      const src = S.over && T ? art(T.id) : S.local ? art(S.T.id) : S.clue.image;
      h = `<img class="silhouette${S.over ? ' reveal' : ''}" src="${src}" alt="Silhouette" draggable="false">`;
    }
    if (mode === 'description') h = `<p class="desc-box">« ${S.over && T ? DESC[T.id] : S.local ? L.maskDesc(S.T, DESC[S.T.id]) : S.clue.text} »</p>`;
    if (mode === 'cri') h = `<div class="center"><button class="btn blue" id="play">🔊 Écouter le cri</button>${S.over && T ? `<br><img src="${art(T.id)}" style="width:180px" alt="">` : ''}</div>`;
    $('clue').innerHTML = h + (S.over ? '' : hintsHtml());
    const pl = $('play');
    if (pl) pl.onclick = () => {
      const src = S.local || (S.over && T) ? cry((T || S.T).id) : S.clue.audio;
      const a = new Audio(src); a.volume = .5; a.play().catch(() => toast('Lecture impossible (format .ogg non supporté ?)'));
    };
    if (S.over && T) {
      const n = S.rows.length;
      $('result').innerHTML = `<div class="card result-box">
      <h2>${S.won ? '🎉 Bravo !' : '😢 Perdu…'}</h2>
      <img src="${art(T.id)}" alt="">
      <h3>C'était <a href="pokemon.html?id=${T.id}">${T.n}</a> !</h3>
      <p>${S.won ? `Trouvé en <b>${n}</b> essai${n > 1 ? 's' : ''}.` : 'Tu feras mieux la prochaine fois.'}</p>
      ${!S.local && O.user && S.won ? O.resultHtml({ label: `${n} essai${n > 1 ? 's' : ''}`, points: L.dlePoints(n) }) : ''}
      ${!S.local && !O.user ? '<p class="muted"><a href="profil.html">Crée un compte</a> pour gagner des points et entrer dans le <a href="classements.html">classement du jour</a>.</p>' : ''}
      <div class="flex center">${S.local ? '<button class="btn" id="again">🔁 Nouveau Pokémon</button>' : '<button class="btn blue" id="share">📋 Partager</button><a class="btn ghost" href="classements.html?jeu=pokedle-' + mode + '">🏆 Classement</a><button class="btn ghost" id="go-unl">♾️ Mode illimité</button>'}</div>
    </div>`;
    } else $('result').innerHTML = '';
    $('again') && ($('again').onclick = () => newGame());
    $('go-unl') && ($('go-unl').onclick = () => setKind('illimite'));
    $('share') && ($('share').onclick = share);
  }

  function share() {
    let txt = `PokéMonde · Pokédle ${mode} du ${new Date().toLocaleDateString('fr-FR')} — ${S.rows.length} essai(s)\n`;
    if (mode === 'classique') txt += S.rows.map(r => r.cells.map(([c]) => c === 'ok' ? '🟩' : c === 'mid' ? '🟧' : '🟥').join('')).join('\n');
    txt += '\n' + location.href.split('?')[0];
    navigator.clipboard && navigator.clipboard.writeText(txt).then(() => toast('Résultat copié !'));
  }

  function renderBoard(animateLast) {
    if (mode === 'classique') {
      const heads = ['Pokémon', 'Type 1', 'Type 2', 'Génération', 'Stade', 'Couleur', 'Taille', 'Poids'];
      $('board').innerHTML = S.rows.length ? `<div class="dle-scroll"><div class="dle-grid">${heads.map(h => `<div class="dle-head">${h}</div>`).join('')}
        ${S.rows.slice().reverse().map((r, i) => cellsHtml(r, animateLast && i === 0)).join('')}</div></div>` : '';
    } else {
      $('board').innerHTML = `<div class="wrong-list">${S.rows.filter(r => !r.ok).map(r => `<span><img src="${sprite(r.id)}" alt="">${byId[r.id].n}</span>`).join('')}</div>`;
    }
  }

  function render(animateLast) {
    document.querySelectorAll('#modes .tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    document.querySelectorAll('#kinds .tab').forEach(b => b.classList.toggle('active', b.dataset.kind === kind));
    $('rules').textContent = RULES[mode] + (kind === 'jour' ? RULES_DAY : '');
    $('gens').innerHTML = kind === 'illimite' ? '<b class="muted">Générations :</b> ' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => `<label class="pill"><input type="checkbox" value="${g}" ${gens.includes(g) ? 'checked' : ''}> ${g}</label>`).join('')
      + ((mode === 'classique' || mode === 'silhouette') ? ` <label class="toggle pill" title="Raichu d'Alola, Méga-Dracaufeu X, Motisma Lavage…"><input type="checkbox" id="dle-forms" ${withForms ? 'checked' : ''}> Inclure les formes</label>` : '') : '';
    $('dle-forms') && ($('dle-forms').onchange = e => { withForms = e.target.checked; store.set('dle:forms', withForms); newGame(); });
    $('gens').querySelectorAll('input[value]').forEach(i => i.onchange = () => {
      const sel = [...$('gens').querySelectorAll('input[value]:checked')].map(x => +x.value);
      if (!sel.length) { i.checked = true; return toast('Garde au moins une génération'); }
      gens = sel; store.set('dle:gens', gens); newGame();
    });
    $('rank').style.display = kind === 'jour' ? '' : 'none';
    if (!S) { $('pick').style.display = 'none'; $('actions').innerHTML = ''; $('result').innerHTML = ''; $('board').innerHTML = ''; return; }
    $('pick').style.display = S.over ? 'none' : '';
    $('actions').innerHTML = !S.over && S.local ? '<button class="btn ghost small" id="giveup">🏳️ Abandonner</button><button class="btn ghost small" id="skip">⏭️ Passer</button>' : '';
    $('giveup') && ($('giveup').onclick = () => { S.over = true; render(); });
    $('skip') && ($('skip').onclick = () => newGame());
    renderClue(); renderBoard(animateLast);
    if (!S.over) picker.focus();
  }

  function stat() {
    const st = store.get('dle:stats', {}); const k = mode + ':' + kind;
    st[k] = st[k] || { w: 0, tries: 0 }; st[k].w++; st[k].tries += S.rows.length; store.set('dle:stats', st);
  }

  async function guess(p) {
    if (!S || S.over || busy) return;
    if (S.local) {
      const fb = L.dleFeedback(p, S.T);
      S.rows.push(mode === 'classique' ? fb : { id: p.id, ok: fb.ok });
      if (fb.ok) { S.over = S.won = true; confetti(); stat(); }
    } else {
      busy = true;
      try {
        const res = await O.call('dle-guess', { mode, id: p.id, wrong: wrongCount() });
        S.rows.push(res.row); S.hints = res.hints;
        if (res.win) { S.over = S.won = true; S.target = res.target; confetti(); stat(); if (O.user) O.refresh(); }
        saveGuest();
      } catch (e) { toast(e.message); return; } finally { busy = false; }
    }
    render(true);
    if (!S.over && mode !== 'classique') { $('clue').classList.remove('shake'); void $('clue').offsetWidth; $('clue').classList.add('shake'); }
  }

  const picker = PK.picker($('pick'), {
    pool: () => kind === 'jour' ? P : unlPool(),
    exclude: () => new Set(S ? S.rows.map(r => r.id) : []),
    onPick: guess,
  });

  function setKind(k) { kind = k; store.set('dle:kind', k); newGame(); }
  document.querySelectorAll('#modes .tab').forEach(b => b.onclick = () => { mode = b.dataset.mode; store.set('dle:mode', mode); newGame(); });
  document.querySelectorAll('#kinds .tab').forEach(b => b.onclick = () => setKind(b.dataset.kind));
  O.rankBanner($('rank'));
  // connexion / déconnexion : on recharge le défi du jour avec le bon état
  let lastUser = undefined;
  O.onChange(u => { const id = u ? u.id : null; if (lastUser !== undefined && id !== lastUser && kind === 'jour') newGame(); lastUser = id; });
  newGame();
})();
