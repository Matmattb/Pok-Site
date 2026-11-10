(function () {
  const { P, ALL, byId, byCat, sprite, store, toast, confetti, shuffle, L } = PK;
  const O = PK.online;
  const $ = id => document.getElementById(id);
  const MAX_ERR = 4;
  const COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'];
  const EMO = ['🟨', '🟩', '🟦', '🟪'];
  let kind = store.get('q4:kind', 'jour');
  let forms = store.get('q4:forms', true);   // inclure les formes (régionales, Méga…) en mode illimité

  // État commun : groups[i] = {label, desc, ids} (null tant qu'un groupe du jour est secret)
  // history : lignes d'émojis · solved : indices des groupes trouvés
  let groups, order, solved, errors, sel, history, over, won;
  let local = true, day = null, points = 0, busy = false, token = 0;

  const view = g => ({ label: g.cat.label, desc: g.cat.desc, ids: g.mons.map(p => p.id), c: g.cat.id });

  /* ---------- Illimité : tout se passe dans le navigateur ---------- */
  const serialize = () => ({ g: groups.map(g => ({ c: g.c, m: g.ids })), o: order, s: solved, e: errors, h: history, v: over, w: won, x: 3 });
  function deserialize(s) {
    try {
      if (s.x !== 3) return false;
      groups = s.g.map(g => { const c = byCat[g.c]; return c && { label: c.label, desc: c.desc, ids: g.m, c: g.c }; });
      if (groups.some(g => !g)) return false;
      order = s.o; solved = s.s; errors = s.e; history = s.h; over = s.v; won = s.w; sel = [];
      return true;
    } catch (e) { return false; }
  }
  const saveLocal = () => { if (local) store.set('q4:current3', serialize()); };

  /* ---------- Défi du jour : les groupes restent sur le serveur ---------- */
  const guestKey = () => 'q4:srv:' + day;
  const saveGuest = () => { if (!local && !O.user) store.set(guestKey(), { groups, solved, errors, history, over, won }); };
  function applyServer(st) {
    order = st.tiles; day = st.day;
    groups = [null, null, null, null];
    (st.all || st.solved).forEach(g => groups[g.i] = g);
    solved = st.solved.map(g => g.i); errors = st.errors; over = st.done; won = solved.length === 4;
    history = st.history.map(gi => gi.map(i => EMO[i]).join(''));
    points = st.points || 0;
  }

  async function newGame(force) {
    const tk = ++token;
    sel = [];
    if (kind === 'illimite') {
      local = true;
      const s = !force && store.get('q4:current3', null);
      if (!(s && deserialize(s))) {
        groups = PK.genQ4(Math.random, forms ? ALL : P).map(view);
        order = shuffle(groups.flatMap(g => g.ids));
        solved = []; errors = 0; history = []; over = false; won = false;
      }
      saveLocal(); return render();
    }
    local = false; groups = null;
    render();
    try {
      await O.ready;
      const st = await O.call('q4-state');
      if (tk !== token) return;
      if (O.user) applyServer(st);
      else {
        order = st.tiles; day = st.day;
        const g = store.get(guestKey(), null);
        if (g) ({ groups, solved, errors, history, over, won } = g);
        else { groups = [null, null, null, null]; solved = []; errors = 0; history = []; over = false; won = false; }
      }
      render();
    } catch (e) {
      if (tk !== token) return;
      $('grid').innerHTML = `<p class="center" style="grid-column:1/-1">⚠️ ${e.message}<br><button class="btn small mt" id="retry">🔁 Réessayer</button></p>`;
      $('retry').onclick = () => newGame();
    }
  }

  const groupOf = id => groups.findIndex(g => g && g.ids.includes(id));

  function groupHtml(g, i) {
    return `<div class="q4-solved" style="background:${COLORS[i]}" title="${g.desc}"><h3>${g.label}</h3>
        <div class="mons">${g.ids.map(id => `<div><img src="${sprite(id)}" alt="">${byId[id].n}</div>`).join('')}</div></div>`;
  }

  function render() {
    document.querySelectorAll('#kinds .tab').forEach(b => b.classList.toggle('active', b.dataset.kind === kind));
    $('forms-opt').style.display = kind === 'illimite' ? '' : 'none';
    $('rank').style.display = kind === 'jour' ? '' : 'none';
    if (!groups) {
      $('solved').innerHTML = ''; $('lives').innerHTML = ''; $('result').innerHTML = ''; $('actions').style.display = 'none'; $('newq4').style.display = 'none';
      $('grid').innerHTML = '<p class="muted center" style="grid-column:1/-1">Chargement de la grille du jour…</p>';
      return;
    }
    $('newq4').style.display = kind === 'illimite' && !over ? '' : 'none';
    const showGroups = over ? [...solved, ...[0, 1, 2, 3].filter(i => !solved.includes(i) && groups[i])] : solved;
    $('solved').innerHTML = showGroups.map(i => groupHtml(groups[i], i)).join('');
    const rest = order.filter(id => !showGroups.includes(groupOf(id)));
    $('grid').innerHTML = rest.map(id => `<div class="q4-tile${sel.includes(id) ? ' sel' : ''}${over ? ' off' : ''}" data-id="${id}"><img src="${sprite(id)}" alt=""><span>${byId[id].n}</span></div>`).join('');
    $('grid').querySelectorAll('.q4-tile').forEach(t => t.onclick = () => toggle(+t.dataset.id));
    $('lives').innerHTML = over ? '' : 'Erreurs restantes : ' + Array.from({ length: MAX_ERR }, (_, i) => `<i class="${i < errors ? 'lost' : ''}"></i>`).join('');
    $('actions').style.display = over ? 'none' : '';
    $('submit').disabled = sel.length !== 4 || busy;
    if (over) {
      const hidden = groups.some(g => !g);
      $('result').innerHTML = `<div class="card result-box"><h2>${won ? (errors === 0 ? '🏆 Parfait, sans erreur !' : '🎉 Bravo !') : '😢 Perdu…'}</h2>
        <p style="font-size:1.4rem;line-height:1.3">${history.join('<br>')}</p>
        ${!local && O.user ? O.resultHtml({ label: won ? `${errors} erreur${errors > 1 ? 's' : ''}` : `${solved.length}/4 groupes`, points }) : ''}
        ${hidden ? '<p class="muted">Les groupes restants seront dévoilés demain (bouton « Solution d\'hier »). Connecté, tu les vois dès la fin de ta partie.</p>' : ''}
        ${!local && !O.user ? '<p class="muted"><a href="profil.html">Crée un compte</a> pour gagner des points et entrer dans le <a href="classements.html?jeu=4par4">classement</a>.</p>' : ''}
        <div class="flex center">${local ? '<button class="btn" id="again">🔁 Nouvelle grille</button>' : '<button class="btn blue" id="share">📋 Partager</button><a class="btn ghost" href="classements.html?jeu=4par4">🏆 Classement</a><button class="btn ghost" id="go-unl">♾️ Mode illimité</button>'}</div></div>`;
      $('again') && ($('again').onclick = () => newGame(true));
      $('go-unl') && ($('go-unl').onclick = () => setKind('illimite'));
      $('share') && ($('share').onclick = () => {
        const txt = `PokéMonde · 4 par 4 du ${new Date().toLocaleDateString('fr-FR')}\n` + history.join('\n') + '\n' + location.href.split('?')[0];
        navigator.clipboard && navigator.clipboard.writeText(txt).then(() => toast('Résultat copié !'));
      });
    } else $('result').innerHTML = '';
  }

  function toggle(id) {
    if (over) return;
    if (sel.includes(id)) sel = sel.filter(x => x !== id);
    else if (sel.length < 4) sel.push(id);
    render();
  }

  function feedback(result, gi, push = true) {
    if (result === 'ok') {
      if (push) solved.push(gi);
      sel = [];
      toast('✅ ' + groups[gi].label);
      if (solved.length === 4) { over = won = true; confetti(); }
      else if (!push && over && won) confetti();
    } else {
      toast(result === 'presque' ? '🤏 Presque ! Il en manque un…' : '❌ Ce n\'est pas un groupe');
      $('grid').classList.remove('shake'); void $('grid').offsetWidth; $('grid').classList.add('shake');
    }
  }

  const triedKeys = new Set();
  async function submit() {
    if (sel.length !== 4 || busy) return;
    const key = sel.slice().sort((a, b) => a - b).join(',');
    const memo = (local ? 'L' : day) + ':' + key;
    if (triedKeys.has(memo)) return toast('Déjà proposé !');
    if (local) {
      const gi = sel.map(groupOf);
      const counts = {}; gi.forEach(i => counts[i] = (counts[i] || 0) + 1);
      const best = Math.max(...Object.values(counts));
      triedKeys.add(memo);
      history.push(gi.map(i => EMO[i]).join(''));
      if (best !== 4 && ++errors >= MAX_ERR) { over = true; sel = []; }
      feedback(best === 4 ? 'ok' : best === 3 ? 'presque' : 'ko', gi[0]);
      saveLocal(); return setTimeout(render, best === 4 ? 0 : 400);
    }
    busy = true; render();
    try {
      const res = await O.call('q4-guess', { ids: sel });
      triedKeys.add(memo);
      if (O.user) {
        applyServer(res);
        feedback(res.result, res.group && res.group.i, false);
        if (over) O.refresh();
      } else {
        if (res.group) groups[res.group.i] = res.group;
        history.push(res.result === 'ok' ? EMO[res.group.i].repeat(4) : res.result === 'presque' ? '🤏🤏🤏⬛' : '⬛⬛⬛⬛');
        if (res.result !== 'ok' && ++errors >= MAX_ERR) { over = true; sel = []; }
        feedback(res.result, res.group && res.group.i);
        saveGuest();
      }
    } catch (e) { toast(e.message); } finally { busy = false; }
    setTimeout(render, 300);
  }

  async function yesterday() {
    try {
      const h = await O.call('q4-hier');
      PK.modal(`<h2>Solution du ${new Date(h.day + 'T12:00').toLocaleDateString('fr-FR')}</h2>${h.groups.map(g => groupHtml(g, g.i)).join('')}`);
    } catch (e) { toast(e.message); }
  }

  function setKind(k) { kind = k; store.set('q4:kind', k); newGame(); }
  $('forms').checked = forms;
  $('forms').onchange = () => { forms = $('forms').checked; store.set('q4:forms', forms); newGame(true); };
  document.querySelectorAll('#kinds .tab').forEach(b => b.onclick = () => setKind(b.dataset.kind));
  $('shuffle').onclick = () => { order = shuffle(order); render(); };
  $('newq4').onclick = () => newGame(true);
  $('clear').onclick = () => { sel = []; render(); };
  $('submit').onclick = submit;
  $('hier').onclick = yesterday;
  O.rankBanner($('rank'));
  let lastUser;
  O.onChange(u => { const id = u ? u.id : null; if (lastUser !== undefined && id !== lastUser && kind === 'jour') newGame(); lastUser = id; });
  newGame();
})();
