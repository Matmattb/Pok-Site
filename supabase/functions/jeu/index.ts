// ==========================================================
// PokéMonde — fonction serveur « jeu »
// Rejoue et vérifie les parties avant d'enregistrer un score. Les réponses des défis
// du jour (Pokédle, 4 par 4) ne quittent jamais le serveur avant la fin de la partie.
// Les fichiers de _shared/ sont des copies de assets/js (outils/sync-serveur.mjs).
// ==========================================================
import '../_shared/setup.js';
import '../_shared/data.js';
import '../_shared/data-desc.js';
import '../_shared/common.js';
import '../_shared/categories.js';
import '../_shared/logic.js';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';

// deno-lint-ignore no-explicit-any
const PK: any = (globalThis as any).PK;
// deno-lint-ignore no-explicit-any
const DESC: Record<string, string> = (globalThis as any).PKDESC;
const L = PK.L;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
let SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
if (!SERVICE_KEY) {
  try { const k = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); SERVICE_KEY = k.default || Object.values(k)[0] as string; } catch { /* */ }
}
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const SECRET = Deno.env.get('DAILY_SECRET') || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
class Oups extends Error { constructor(msg: string, public status = 400) { super(msg); } }
const check = (cond: unknown, msg: string) => { if (!cond) throw new Oups(msg); };

const PARIS = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
const parisDay = (offset = 0) => PARIS.format(new Date(Date.now() + offset * 86400000));
// Graine secrète : la réponse du jour est impossible à calculer depuis le navigateur
const secretRng = (salt: string, day: string) => PK.rng(PK.hashStr(SECRET + ':' + day + ':' + salt));
const isId = (id: unknown) => Number.isInteger(id) && !!PK.byId[id as number];

// deno-lint-ignore no-explicit-any
async function getUser(req: Request): Promise<any> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token || token.split('.').length !== 3) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user;
}

// ---------- Accès base ----------
async function loadState(uid: string, game: string, day: string) {
  const { data, error } = await db.from('game_states').select('data').eq('user_id', uid).eq('game', game).eq('day', day).maybeSingle();
  if (error) throw error;
  return data ? data.data : null;
}
async function saveState(uid: string, game: string, day: string, data: unknown) {
  const { error } = await db.from('game_states').upsert({ user_id: uid, game, day, data, updated_at: new Date().toISOString() });
  if (error) throw error;
}
async function saveResult(uid: string, game: string, day: string, kind: string, score: number, points: number, label: string) {
  const { error } = await db.rpc('save_result', { p_user: uid, p_game: game, p_day: day, p_kind: kind, p_score: score, p_points: points, p_label: label });
  if (error) throw error;
}

// ---------- Images et cris (envoyés en données pour ne pas révéler le numéro du Pokémon) ----------
const mediaCache = new Map<string, string>();
async function asDataUrl(url: string, mime: string) {
  if (mediaCache.has(url)) return mediaCache.get(url)!;
  const res = await fetch(url);
  if (!res.ok) throw new Oups('Média indisponible', 502);
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  const out = `data:${mime};base64,` + btoa(bin);
  if (mediaCache.size > 40) mediaCache.clear();
  mediaCache.set(url, out);
  return out;
}

// ================= POKÉDLE DU JOUR =================
const DLE_MODES = ['classique', 'silhouette', 'description', 'cri'];
const dleTarget = (mode: string, day: string) => PK.pick(PK.P, secretRng('pokedle-' + mode, day));
// deno-lint-ignore no-explicit-any
function dleRow(mode: string, g: any, T: any) {
  return mode === 'classique' ? L.dleFeedback(g, T) : { id: g.id, ok: g.id === T.id };
}
// deno-lint-ignore no-explicit-any
async function dleClue(mode: string, T: any) {
  if (mode === 'silhouette') return { image: await asDataUrl(PK.art(T.id), 'image/png') };
  if (mode === 'cri') return { audio: await asDataUrl(PK.cry(T.id), 'audio/ogg') };
  if (mode === 'description') return { text: L.maskDesc(T, DESC[T.id]) };
  return {};
}
// deno-lint-ignore no-explicit-any
async function pokedle(action: string, body: any, user: any) {
  const mode = body.mode; check(DLE_MODES.includes(mode), 'Mode inconnu');
  const day = parisDay(), T = dleTarget(mode, day), game = 'pokedle-' + mode;
  if (action === 'dle-state') {
    const out: Record<string, unknown> = { day, clue: await dleClue(mode, T) };
    if (user) {
      const st = (await loadState(user.id, game, day)) || { g: [], done: false };
      out.rows = st.g.map((id: number) => dleRow(mode, PK.byId[id], T));
      out.done = st.done;
      out.hints = L.dleHints(T, mode, st.g.filter((id: number) => id !== T.id).length);
      if (st.done) out.target = T.id;
    }
    return out;
  }
  // dle-guess
  const id = body.id; check(isId(id) && id <= 1025, 'Pokémon inconnu');
  const g = PK.byId[id];
  if (!user) {
    // invité : rien n'est enregistré, on renvoie seulement la comparaison
    const prev = Math.max(0, Math.min(50, parseInt(body.wrong) || 0)) + (id === T.id ? 0 : 1);
    return { day, row: dleRow(mode, g, T), win: id === T.id, hints: L.dleHints(T, mode, prev), target: id === T.id ? T.id : undefined };
  }
  const st = (await loadState(user.id, game, day)) || { g: [], done: false };
  check(!st.done, 'Défi déjà terminé'); check(!st.g.includes(id), 'Déjà proposé'); check(st.g.length < 200, 'Trop d\'essais');
  st.g.push(id);
  const win = id === T.id;
  let points = 0;
  if (win) {
    st.done = true; points = L.dlePoints(st.g.length);
    await saveResult(user.id, game, day, 'jour', points, points, `${st.g.length} essai${st.g.length > 1 ? 's' : ''}`);
  }
  await saveState(user.id, game, day, st);
  return { day, row: dleRow(mode, g, T), win, points, n: st.g.length, hints: L.dleHints(T, mode, st.g.filter((x: number) => x !== T.id).length), target: win ? T.id : undefined };
}

// ================= POKÉDOKU DU JOUR =================
// La grille est publique (même tirage que dans le navigateur) ; le serveur valide et calcule la rareté.
const dokuGrids = new Map<string, any>();
function dokuGrid(day: string) {
  if (!dokuGrids.has(day)) { if (dokuGrids.size > 5) dokuGrids.clear(); dokuGrids.set(day, PK.genDoku('normal', PK.dailyRng('pokedoku', day), PK.ALL)); }
  return dokuGrids.get(day);
}
// deno-lint-ignore no-explicit-any
async function pokedoku(action: string, body: any, user: any) {
  check(user, 'Connecte-toi pour jouer en classé');
  const day = parisDay(), grid = dokuGrid(day), game = 'pokedoku';
  // deno-lint-ignore no-explicit-any
  const st: any = (await loadState(user.id, game, day)) || { f: Array(9).fill(0), t: 9, s: Array(9).fill(0), done: false };
  const view = () => ({ day, rows: grid.rows.map((c: any) => c.id), cols: grid.cols.map((c: any) => c.id), f: st.f, t: st.t, s: st.s, done: st.done, points: st.points || 0 });
  async function finish() {
    st.done = true;
    st.points = st.f.reduce((sum: number, id: number, k: number) => sum + (id ? L.dokuCellPoints(st.s[k]) : 0), 0);
    const ok = st.f.filter(Boolean).length;
    await saveResult(user.id, game, day, 'jour', st.points, st.points, `${ok}/9 cases`);
  }
  if (action === 'doku-state') return view();
  check(!st.done, 'Grille déjà terminée');
  if (action === 'doku-giveup') { await finish(); await saveState(user.id, game, day, st); return view(); }
  // doku-guess
  const cell = body.cell, id = body.id;
  check(Number.isInteger(cell) && cell >= 0 && cell < 9, 'Case inconnue'); check(isId(id), 'Pokémon inconnu');
  check(!st.f[cell], 'Case déjà remplie'); check(!st.f.includes(id), 'Pokémon déjà utilisé'); check(st.t > 0, 'Plus d\'essais');
  const p = PK.byId[id], r = grid.rows[Math.floor(cell / 3)], c = grid.cols[cell % 3];
  check(!p.form || p.game, 'Forme non jouable');
  st.t--;
  const ok = r.test(p) && c.test(p);
  let share = 0;
  if (ok) {
    const { data, error } = await db.rpc('doku_add', { p_day: day, p_cell: cell, p_pid: id });
    if (error) throw error;
    const row = data && data[0];
    share = row && row.total ? row.n / Number(row.total) : 0;
    st.f[cell] = id; st.s[cell] = share;
  }
  if (st.f.every(Boolean) || st.t <= 0) await finish();
  await saveState(user.id, game, day, st);
  return { ...view(), ok, share };
}

// ================= 4 PAR 4 DU JOUR =================
const q4Grids = new Map<string, any>();
function q4Grid(day: string) {
  if (!q4Grids.has(day)) {
    if (q4Grids.size > 5) q4Grids.clear();
    const groups = PK.genQ4(secretRng('4par4', day), PK.ALL);
    const tiles = PK.shuffle(groups.flatMap((g: any) => g.mons.map((p: any) => p.id)), secretRng('4par4-ordre', day));
    q4Grids.set(day, { groups, tiles });
  }
  return q4Grids.get(day);
}
// deno-lint-ignore no-explicit-any
const groupView = (g: any, i: number) => ({ i, label: g.cat.label, desc: g.cat.desc, ids: g.mons.map((p: any) => p.id) });
// deno-lint-ignore no-explicit-any
async function q4(action: string, body: any, user: any) {
  if (action === 'q4-hier') {
    const day = parisDay(-1), G = q4Grid(day);
    return { day, groups: G.groups.map(groupView) };
  }
  const day = parisDay(), G = q4Grid(day), game = '4par4';
  const groupOf = (id: number) => G.groups.findIndex((g: any) => g.mons.some((p: any) => p.id === id));
  // deno-lint-ignore no-explicit-any
  const st: any = user ? ((await loadState(user.id, game, day)) || { s: [], e: 0, h: [], done: false }) : null;
  const view = () => st ? { day, tiles: G.tiles, solved: st.s.map((i: number) => groupView(G.groups[i], i)), errors: st.e, history: st.h.map((x: any) => x.g), done: st.done, all: st.done ? G.groups.map(groupView) : undefined } : { day, tiles: G.tiles };
  if (action === 'q4-state') return view();
  // q4-guess
  const ids = body.ids;
  check(Array.isArray(ids) && ids.length === 4 && new Set(ids).size === 4 && ids.every((id: number) => G.tiles.includes(id)), 'Sélection invalide');
  const gi = ids.map(groupOf);
  const counts: Record<number, number> = {}; gi.forEach((i: number) => counts[i] = (counts[i] || 0) + 1);
  const best = Math.max(...Object.values(counts));
  const result = best === 4 ? 'ok' : best === 3 ? 'presque' : 'ko';
  if (!user) return { day, result, group: best === 4 ? groupView(G.groups[gi[0]], gi[0]) : undefined };
  check(!st.done, 'Grille déjà terminée');
  const key = ids.slice().sort((a: number, b: number) => a - b).join(',');
  check(!st.h.some((x: any) => x.k === key), 'Déjà proposé');
  check(!(best === 4 && st.s.includes(gi[0])), 'Groupe déjà trouvé');
  st.h.push({ g: gi, k: key });
  if (best === 4) st.s.push(gi[0]); else st.e++;
  const won = st.s.length === 4;
  if (won || st.e >= 4) {
    st.done = true;
    const pts = L.q4Points(won, st.e, st.s.length);
    await saveResult(user.id, game, day, 'jour', pts, pts, won ? `${st.e} erreur${st.e > 1 ? 's' : ''}` : `${st.s.length}/4 groupes`);
    st.points = pts;
  }
  await saveState(user.id, game, day, st);
  return { ...view(), result, group: best === 4 ? groupView(G.groups[gi[0]], gi[0]) : undefined, points: st.points || 0 };
}

// ================= ARCADE CLASSÉE =================
// deno-lint-ignore no-explicit-any
function arcadeGame(game: string, params: any) {
  if (game === 'quiz') return { id: 'quiz' };
  if (game === 'hl') { check(L.HL_CRITS[params?.crit], 'Critère inconnu'); return { id: 'hl-' + params.crit }; }
  if (game === 'memory') { check(L.MEMORY_SIZES.includes(params?.n), 'Taille inconnue'); return { id: 'memory-' + params.n }; }
  if (game === 'chrono') {
    check(Number.isInteger(params?.gen) && params.gen >= 0 && params.gen <= 9 && L.CHRONO_DURATIONS.includes(params?.dur), 'Paramètres inconnus');
    return { id: `chrono-${params.gen}-${params.dur}` };
  }
  throw new Oups('Jeu inconnu');
}
// deno-lint-ignore no-explicit-any
async function loadSession(user: any, id: string) {
  check(typeof id === 'string' && /^[0-9a-f-]{36}$/.test(id), 'Partie inconnue');
  const { data, error } = await db.from('sessions').select('*').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  check(data, 'Partie inconnue'); check(!data.done, 'Partie déjà terminée');
  check(Date.now() - new Date(data.started_at).getTime() < 3 * 3600 * 1000, 'Partie expirée');
  return data;
}
// deno-lint-ignore no-explicit-any
async function endSession(user: any, s: any, score: number, points: number, label: string) {
  await db.from('sessions').update({ done: true, data: s.data }).eq('id', s.id);
  const day = parisDay();
  // record personnel précédent (pour l'afficher)
  const { data: prev } = await db.from('results').select('score').eq('user_id', user.id).eq('game', s.data.gid).order('score', { ascending: false }).limit(1);
  const record = !prev || !prev.length || score > prev[0].score;
  if (points > 0 || score > 0) await saveResult(user.id, s.data.gid, day, 'arcade', score, Math.min(points, 1000), label);
  return { score, points, label, record, game: s.data.gid };
}
// deno-lint-ignore no-explicit-any
async function arcade(action: string, body: any, user: any) {
  check(user, 'Connecte-toi pour jouer en classé');
  if (action === 'arc-start') {
    const { id: gid } = arcadeGame(body.game, body.params);
    // limite anti-abus : 300 parties classées par jour et par joueur
    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await db.from('sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('started_at', since);
    check((count || 0) < 300, 'Trop de parties aujourd\'hui, reviens demain !');
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    // deno-lint-ignore no-explicit-any
    const data: any = { gid, params: body.params || {} };
    if (body.game === 'memory') { data.deck = L.memoryDeck(body.params.n, PK.rng(seed)); data.open = []; data.found = []; data.moves = 0; }
    const { data: s, error } = await db.from('sessions').insert({ user_id: user.id, game: body.game, seed, data }).select('id').single();
    if (error) throw error;
    // pour le Memory, la graine n'est pas envoyée (elle révélerait les cartes)
    return { session: s.id, seed: body.game === 'memory' ? undefined : seed, n: body.game === 'memory' ? data.deck.length : undefined };
  }
  const s = await loadSession(user, body.session);
  const elapsed = Date.now() - new Date(s.started_at).getTime();

  if (action === 'mem-flip') {
    check(s.game === 'memory', 'Mauvais jeu');
    const i = body.i, d = s.data;
    check(Number.isInteger(i) && i >= 0 && i < d.deck.length, 'Carte inconnue');
    check(!d.found.includes(i) && !d.open.includes(i), 'Carte déjà retournée');
    if (d.open.length === 2) d.open = [];
    d.open.push(i);
    let match = null, end = null;
    if (d.open.length === 2) {
      d.moves++;
      const [a, b] = d.open;
      match = d.deck[a] === d.deck[b];
      if (match) { d.found.push(a, b); d.open = []; }
    }
    if (d.found.length === d.deck.length) {
      const sec = Math.round(elapsed / 1000), n = d.deck.length / 2;
      end = await endSession(user, s, L.memoryScore(d.moves, sec), L.memoryPoints(n, d.moves), `${d.moves} coups · ${sec} s`);
    } else await db.from('sessions').update({ data: d }).eq('id', s.id);
    return { id: d.deck[i], match, moves: d.moves, end };
  }

  // arc-finish : on rejoue la partie à partir de la graine
  const answers = body.answers;
  check(Array.isArray(answers) && answers.length <= 2000, 'Réponses invalides');
  const r = PK.rng(Number(s.seed));
  if (s.game === 'quiz') {
    let score = 0, lives = 3, n = 0;
    for (const a of answers) { const q = L.quizGen(r); n++; if (a === q.m) score++; else if (--lives <= 0) break; }
    check(elapsed >= n * 300, 'Réponses trop rapides');
    return await endSession(user, s, score, Math.min(150, score * 3), `série de ${score}`);
  }
  if (s.game === 'hl') {
    const crit = s.data.params.crit;
    let A = PK.pick(PK.P, r), B = L.hlOther(A, r), score = 0;
    for (const dir of answers) { if (!L.hlCorrect(crit, A, B, dir)) break; score++; A = B; B = L.hlOther(A, r); }
    check(elapsed >= score * 400, 'Réponses trop rapides');
    return await endSession(user, s, score, Math.min(150, score * 3), `série de ${score}`);
  }
  if (s.game === 'chrono') {
    const { gen, dur } = s.data.params;
    check(elapsed <= dur * 1000 + 20000, 'Temps dépassé');
    const pool = new Set(L.chronoPool(gen).map((p: any) => p.id));
    const found = new Set(answers.filter((id: number) => pool.has(id)));
    check(elapsed >= found.size * 700, 'Réponses trop rapides');
    return await endSession(user, s, found.size, Math.min(300, found.size), `${found.size}/${pool.size} trouvés`);
  }
  throw new Oups('Action inconnue');
}

// ================= COMPTE =================
// deno-lint-ignore no-explicit-any
async function account(action: string, user: any) {
  check(user, 'Non connecté');
  if (action === 'delete-account') {
    const { error } = await db.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return { ok: true };
  }
  throw new Oups('Action inconnue');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    check(req.method === 'POST', 'POST attendu');
    check(SECRET, 'Serveur mal configuré');
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const user = await getUser(req);
    if (action === 'ping') return json({ ok: true, day: parisDay(), user: user ? user.id : null });
    if (action.startsWith('dle-')) return json(await pokedle(action, body, user));
    if (action.startsWith('doku-')) return json(await pokedoku(action, body, user));
    if (action.startsWith('q4-')) return json(await q4(action, body, user));
    if (action.startsWith('arc-') || action === 'mem-flip') return json(await arcade(action, body, user));
    if (action === 'delete-account') return json(await account(action, user));
    throw new Oups('Action inconnue');
  } catch (e) {
    const status = e instanceof Oups ? e.status : 500;
    if (status === 500) console.error(e);
    return json({ error: e instanceof Oups ? e.message : 'Erreur serveur' }, status);
  }
});
