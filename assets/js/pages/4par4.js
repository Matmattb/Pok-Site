(function () {
  const { P, ALL, byId, byCat, sprite, store, toast, confetti, shuffle } = PK;
  const $ = id => document.getElementById(id);
  const MAX_ERR = 4;
  const COLORS = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)'];
  const EMO = ['🟨', '🟩', '🟦', '🟪'];
  let kind = store.get('q4:kind', 'jour');
  let forms = store.get('q4:forms', true);   // inclure les formes (régionales, Méga…) en mode illimité
  let groups, order, solved, errors, sel, history, over;

  const dayKey = () => 'q4:day2:' + PK.todayKey();
  const serialize = () => ({ g: groups.map(g => ({ c: g.cat.id, m: g.mons.map(p => p.id) })), o: order, s: solved, e: errors, h: history, v: over });
  function deserialize(s) {
    try {
      groups = s.g.map((g, i) => ({ cat: byCat[g.c], mons: g.m.map(i => byId[i]), color: COLORS[i] }));
      if (groups.some(g => !g.cat)) return false;
      order = s.o; solved = s.s; errors = s.e; history = (s.h || []).filter(h => h && h.g); over = s.v; sel = [];
      return true;
    } catch (e) { return false; }
  }
  const save = () => store.set(kind === 'jour' ? dayKey() : 'q4:current2', serialize());

  function newGame(force) {
    const key = kind === 'jour' ? dayKey() : 'q4:current2';
    const s = (kind === 'jour' || !force) && store.get(key, null);
    if (!(s && deserialize(s))) {
      const r = kind === 'jour' ? PK.dailyRng('4par4') : Math.random;
      groups = PK.genQ4(r, kind === 'jour' || forms ? ALL : P);
      order = shuffle(groups.flatMap(g => g.mons.map(p => p.id)), r);
      solved = []; errors = 0; history = []; over = false; sel = [];
    }
    save(); render();
  }

  const groupOf = id => groups.findIndex(g => g.mons.some(p => p.id === id));

  function render() {
    document.querySelectorAll('#kinds .tab').forEach(b => b.classList.toggle('active', b.dataset.kind === kind));
    $('forms-opt').style.display = kind === 'illimite' ? '' : 'none';
    $('newq4').style.display = kind === 'illimite' && !over ? '' : 'none';
    const showGroups = over ? [...solved, ...[0, 1, 2, 3].filter(i => !solved.includes(i))] : solved;
    $('solved').innerHTML = showGroups.map(i => {
      const g = groups[i];
      return `<div class="q4-solved" style="background:${g.color}" title="${g.cat.desc}"><h3>${g.cat.label}</h3>
        <div class="mons">${g.mons.map(p => `<div><img src="${sprite(p.id)}" alt="">${p.n}</div>`).join('')}</div></div>`;
    }).join('');
    const rest = order.filter(id => !showGroups.includes(groupOf(id)));
    $('grid').innerHTML = rest.map(id => `<div class="q4-tile${sel.includes(id) ? ' sel' : ''}" data-id="${id}"><img src="${sprite(id)}" alt=""><span>${byId[id].n}</span></div>`).join('');
    $('grid').querySelectorAll('.q4-tile').forEach(t => t.onclick = () => toggle(+t.dataset.id));
    $('lives').innerHTML = over ? '' : 'Erreurs restantes : ' + Array.from({ length: MAX_ERR }, (_, i) => `<i class="${i < errors ? 'lost' : ''}"></i>`).join('');
    $('actions').style.display = over ? 'none' : '';
    $('submit').disabled = sel.length !== 4;
    if (over) {
      const won = solved.length === 4;
      $('result').innerHTML = `<div class="card result-box"><h2>${won ? (errors === 0 ? '🏆 Parfait, sans erreur !' : '🎉 Bravo !') : '😢 Perdu…'}</h2>
        <p style="font-size:1.4rem;line-height:1.3">${history.map(h => h.g.map(i => EMO[i]).join('')).join('<br>')}</p>
        <div class="flex center">${kind === 'illimite' ? '<button class="btn" id="again">🔁 Nouvelle grille</button>' : '<button class="btn blue" id="share">📋 Partager</button><button class="btn ghost" id="go-unl">♾️ Mode illimité</button>'}</div></div>`;
      $('again') && ($('again').onclick = () => newGame(true));
      $('go-unl') && ($('go-unl').onclick = () => setKind('illimite'));
      $('share') && ($('share').onclick = () => {
        const txt = `PokéMonde · 4 par 4 du ${new Date().toLocaleDateString('fr-FR')}\n` + history.map(h => h.g.map(i => EMO[i]).join('')).join('\n');
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

  function submit() {
    if (sel.length !== 4) return;
    const key = sel.slice().sort().join(',');
    if (history.some(h => h.k === key)) return toast('Déjà proposé !');
    const gi = sel.map(groupOf);
    history.push({ g: gi, k: key });
    const counts = {}; gi.forEach(i => counts[i] = (counts[i] || 0) + 1);
    const best = Math.max(...Object.values(counts));
    if (best === 4) {
      solved.push(gi[0]); sel = [];
      toast('✅ ' + groups[gi[0]].cat.label);
      if (solved.length === 4) { over = true; confetti(); }
    } else {
      errors++;
      toast(best === 3 ? '🤏 Presque ! Il en manque un…' : '❌ Ce n\'est pas un groupe');
      $('grid').classList.remove('shake'); void $('grid').offsetWidth; $('grid').classList.add('shake');
      if (errors >= MAX_ERR) { over = true; sel = []; }
    }
    save(); setTimeout(render, best === 4 ? 0 : 400);
  }

  function setKind(k) { kind = k; store.set('q4:kind', k); newGame(); }
  $('forms').checked = forms;
  $('forms').onchange = () => { forms = $('forms').checked; store.set('q4:forms', forms); newGame(true); };
  document.querySelectorAll('#kinds .tab').forEach(b => b.onclick = () => setKind(b.dataset.kind));
  $('shuffle').onclick = () => { order = shuffle(order); save(); render(); };
  $('newq4').onclick = () => newGame(true);
  $('clear').onclick = () => { sel = []; render(); };
  $('submit').onclick = submit;
  newGame();
})();
