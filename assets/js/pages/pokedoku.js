(function () {
  const { P, ALL, byId, sprite, store, toast, confetti, byCat, L } = PK;
  const O = PK.online;
  const $ = id => document.getElementById(id);
  const MAX_TRIES = 9;
  let kind = store.get('doku:kind', 'jour');
  let level = store.get('doku:level', 'normal');
  let forms = store.get('doku:forms', true);   // formes (régionales, Méga…) acceptées en mode illimité
  let grid, filled, tries, over, fm;
  // Grille du jour en étant connecté : le serveur valide chaque réponse et calcule la rareté
  let srv = null, busy = false, token = 0;
  const pool = () => fm ? ALL : P;

  const dayKey = () => 'doku:day:' + PK.todayKey();

  function load(g) {
    grid = g; filled = Array(9).fill(0); tries = MAX_TRIES; over = false;
  }
  function serialize() { return { r: grid.rows.map(c => c.id), c: grid.cols.map(c => c.id), f: filled, t: tries, o: over, fm: fm ? 1 : 0, v: 2 }; }
  function deserialize(s) {
    const rows = s.r.map(i => byCat[i]), cols = s.c.map(i => byCat[i]);
    if (s.v !== 2 || rows.some(x => !x) || cols.some(x => !x)) return false;
    fm = !!s.fm;
    grid = { rows, cols, cells: rows.flatMap(a => cols.map(b => pool().filter(p => a.test(p) && b.test(p)))) };
    filled = s.f; tries = s.t; over = s.o; return true;
  }
  function save() {
    if (srv) return;
    if (kind === 'jour') store.set(dayKey(), serialize());
    else store.set('doku:current', serialize());
  }

  async function newGame(force) {
    const tk = ++token;
    srv = null;
    if (kind === 'jour') {
      await O.ready;
      if (tk !== token) return;
      if (O.user) {
        $('doku').innerHTML = '<p class="muted">Chargement de ta grille…</p>'; $('result').innerHTML = ''; $('actions').innerHTML = '';
        try {
          const st = await O.call('doku-state');
          if (tk !== token) return;
          fm = true; load(PK.genDoku('normal', PK.dailyRng('pokedoku', st.day), ALL));
          srv = st; applySrv(st);
          if (over) loadRarity();
          return render();
        } catch (e) {
          if (tk !== token) return;
          toast('⚠️ ' + e.message + ' — grille jouée hors ligne (non classée)');
        }
      }
    }
    if (kind === 'jour') {
      const s = store.get(dayKey(), null);
      if (!(s && deserialize(s))) { fm = true; load(PK.genDoku('normal', PK.dailyRng('pokedoku'), ALL)); }
    } else {
      const s = !force && store.get('doku:current', null);
      if (!(s && deserialize(s))) { fm = forms; load(PK.genDoku(level, Math.random, pool())); }
    }
    save(); render();
  }

  function applySrv(st) { srv = st; filled = st.f.slice(); tries = st.t; over = st.done; }
  // Réponses les plus données par les joueurs (visible une fois sa grille finie)
  async function loadRarity() {
    try {
      const { data } = await O.sb.rpc('doku_rarity', { p_day: srv.day });
      if (!data || !srv) return;
      const byCell = Array.from({ length: 9 }, () => []);
      data.forEach(r => byCell[r.cell].push(r));
      srv.rar = byCell; render();
    } catch (e) { /* facultatif */ }
  }
  const pct = x => x < 0.01 ? '<1 %' : Math.round(x * 100) + ' %';

  const label = c => `<div class="doku-label" data-cat="${c.id}" title="${c.desc}" style="cursor:help"><span>${c.html}</span></div>`;

  function render() {
    document.querySelectorAll('#kinds .tab').forEach(b => b.classList.toggle('active', b.dataset.kind === kind));
    $('level').style.display = $('new').style.display = $('forms-opt').style.display = kind === 'illimite' ? '' : 'none';
    $('forms').checked = forms;
    $('level').value = level;
    const score = filled.filter(Boolean).length;
    let h = `<div class="doku-corner"><b>${tries}</b><span class="muted">essai${tries > 1 ? 's' : ''}</span></div>` + grid.cols.map(label).join('');
    grid.rows.forEach((r, i) => {
      h += label(r);
      for (let j = 0; j < 3; j++) {
        const k = i * 3 + j, pid = filled[k], p = byId[pid];
        const cnt = (over ? `<span class="cnt">${grid.cells[k].length} rép.</span>` : '') + (srv && pid ? `<span class="rar" title="Part des joueurs ayant donné cette réponse">${pct(srv.s[k])}</span>` : '');
        if (p) h += `<div class="doku-cell done" data-k="${k}">${cnt}<img src="${sprite(p.id)}" alt=""><span>${p.n}</span></div>`;
        else if (over) {
          const ex = grid.cells[k][0];
          h += `<div class="doku-cell revealed" data-k="${k}">${cnt}<img src="${sprite(ex.id)}" alt="" style="opacity:.5"><span class="muted">${ex.n} ?</span></div>`;
        } else h += `<div class="doku-cell" data-k="${k}"></div>`;
      }
    });
    $('doku').innerHTML = h;
    $('doku').querySelectorAll('.doku-label').forEach(el => el.onclick = () => { const c = byCat[el.dataset.cat]; PK.modal(`<h2>${c.label}</h2><p>${c.desc}</p><p class="muted">${c.members.length} Pokémon correspondent à ce critère.</p>`); });
    $('doku').querySelectorAll('.doku-cell').forEach(el => el.onclick = () => clickCell(+el.dataset.k));
    $('actions').innerHTML = over ? '' : '<button class="btn ghost small" id="giveup">🏳️ Abandonner</button>';
    $('giveup') && ($('giveup').onclick = async () => {
      if (!confirm('Révéler les réponses et terminer la grille ?')) return;
      if (srv) { try { applySrv(await O.call('doku-giveup')); O.refresh(); loadRarity(); } catch (e) { return toast(e.message); } }
      finish();
    });
    if (over && srv) {
      const tot = srv.rar ? srv.rar.map(l => l.reduce((a, r) => a + r.n, 0)) : null;
      $('result').innerHTML = `<div class="card result-box"><h2>${score === 9 ? '🏆 Grille parfaite !' : score >= 6 ? '👏 Bien joué !' : '💪 Continue !'}</h2>
        <p>Score : <b>${score}/9</b> · <b>${srv.points}</b> points <span class="muted">(10 par case + jusqu'à 10 de bonus si ta réponse est rare)</span></p>
        ${O.resultHtml({ label: score + '/9 cases', points: srv.points })}
        ${srv.rar ? `<h3 class="mt">Réponses les plus données aujourd'hui</h3><div class="rar-grid">${srv.rar.map((l, k) => `<div class="rar-cell">${l.slice(0, 3).map(r => `<div><img src="${sprite(r.pokemon_id)}" alt="">${byId[r.pokemon_id] ? byId[r.pokemon_id].n : '?'}<b>${pct(r.n / tot[k])}</b></div>`).join('') || '<span class="muted">Personne</span>'}</div>`).join('')}</div>` : ''}
        <div class="flex center mt"><a class="btn blue" href="classements.html?jeu=pokedoku">🏆 Classement</a><button class="btn ghost" id="go-unl">♾️ Mode illimité</button></div></div>`;
      $('go-unl').onclick = () => setKind('illimite');
    } else if (over) {
      const rar = filled.reduce((s, pid, k) => s + (pid ? 100 / grid.cells[k].length : 0), 0);
      $('result').innerHTML = `<div class="card result-box"><h2>${score === 9 ? '🏆 Grille parfaite !' : score >= 6 ? '👏 Bien joué !' : '💪 Continue !'}</h2>
        <p>Score : <b>${score}/9</b> · Originalité : <b>${Math.round(rar)}</b> pts <span class="muted">(plus tes réponses sont rares, plus tu gagnes de points)</span></p>
        ${kind === 'jour' && !O.user ? '<p class="muted"><a href="profil.html">Crée un compte</a> pour gagner des points, voir la rareté de tes réponses et entrer dans le classement.</p>' : ''}
        <div class="flex center">${kind === 'illimite' ? '<button class="btn" id="again">🔁 Nouvelle grille</button>' : '<button class="btn ghost" id="go-unl">♾️ Mode illimité</button>'}</div></div>`;
      $('again') && ($('again').onclick = () => newGame(true));
      $('go-unl') && ($('go-unl').onclick = () => setKind('illimite'));
    } else $('result').innerHTML = '';
  }

  function clickCell(k) {
    const r = grid.rows[Math.floor(k / 3)], c = grid.cols[k % 3];
    if (over) {
      const l = grid.cells[k];
      PK.modal(`<h3>${r.label} × ${c.label}</h3><p class="muted">${l.length} réponse(s) possible(s)</p>
        <div class="wrong-list">${l.map(p => `<span><img src="${sprite(p.id)}" alt="">${p.n}</span>`).join('')}</div>`);
      return;
    }
    if (filled[k]) return;
    const m = PK.modal(`<h3>${r.html} <br>×<br> ${c.html}</h3><div id="mpick" class="mt"></div><p class="muted mt">Essais restants : ${tries}</p>`);
    const pk = PK.picker(m.el.querySelector('#mpick'), {
      pool,
      exclude: () => new Set(filled.filter(Boolean)),
      onPick: async p => {
        if (srv) {
          if (busy) return; busy = true;
          try {
            const res = await O.call('doku-guess', { cell: k, id: p.id });
            applySrv(res);
            toast(res.ok ? `✅ ${p.n} ! (${pct(res.share)} des joueurs)` : '❌ ' + p.n + ' ne convient pas');
          } catch (e) { toast(e.message); return; } finally { busy = false; }
          m.close();
          if (over) { O.refresh(); loadRarity(); return finish(); }
          return render();
        }
        tries--;
        if (r.test(p) && c.test(p)) { filled[k] = p.id; toast('✅ ' + p.n + ' !'); }
        else toast('❌ ' + p.n + ' ne convient pas');
        m.close();
        if (filled.every(Boolean) || tries <= 0) return finish();
        save(); render();
      },
    });
    setTimeout(() => pk.focus(), 50);
  }

  function finish() {
    over = true; save(); render();
    if (filled.every(Boolean)) confetti();
    window.scrollTo({ top: $('result').offsetTop - 120, behavior: 'smooth' });
  }

  function setKind(k) { kind = k; store.set('doku:kind', k); newGame(); }
  document.querySelectorAll('#kinds .tab').forEach(b => b.onclick = () => setKind(b.dataset.kind));
  $('level').onchange = () => { level = $('level').value; store.set('doku:level', level); newGame(true); };
  $('new').onclick = () => newGame(true);
  $('forms').onchange = () => { forms = $('forms').checked; store.set('doku:forms', forms); newGame(true); };
  O.rankBanner($('rank'));
  let lastUser;
  O.onChange(u => { const id = u ? u.id : null; if (lastUser !== undefined && id !== lastUser && kind === 'jour') newGame(); lastUser = id; });
  newGame();
})();
