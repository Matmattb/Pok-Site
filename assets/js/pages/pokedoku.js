(function () {
  const { P, ALL, byId, sprite, store, toast, confetti, byCat } = PK;
  const $ = id => document.getElementById(id);
  const MAX_TRIES = 9;
  let kind = store.get('doku:kind', 'jour');
  let level = store.get('doku:level', 'normal');
  let forms = store.get('doku:forms', true);   // formes (régionales, Méga…) acceptées en mode illimité
  let grid, filled, tries, over, fm;
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
    if (kind === 'jour') store.set(dayKey(), serialize());
    else store.set('doku:current', serialize());
  }

  function newGame(force) {
    if (kind === 'jour') {
      const s = store.get(dayKey(), null);
      if (!(s && deserialize(s))) { fm = true; load(PK.genDoku('normal', PK.dailyRng('pokedoku'), ALL)); }
    } else {
      const s = !force && store.get('doku:current', null);
      if (!(s && deserialize(s))) { fm = forms; load(PK.genDoku(level, Math.random, pool())); }
    }
    save(); render();
  }

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
        const cnt = over ? `<span class="cnt">${grid.cells[k].length} rép.</span>` : '';
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
    $('giveup') && ($('giveup').onclick = () => { if (confirm('Révéler les réponses et terminer la grille ?')) finish(); });
    if (over) {
      const rar = filled.reduce((s, pid, k) => s + (pid ? 100 / grid.cells[k].length : 0), 0);
      $('result').innerHTML = `<div class="card result-box"><h2>${score === 9 ? '🏆 Grille parfaite !' : score >= 6 ? '👏 Bien joué !' : '💪 Continue !'}</h2>
        <p>Score : <b>${score}/9</b> · Originalité : <b>${Math.round(rar)}</b> pts <span class="muted">(plus tes réponses sont rares, plus tu gagnes de points)</span></p>
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
      onPick: p => {
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
  newGame();
})();
