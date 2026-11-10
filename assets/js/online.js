/* ==========================================================
   PokéMonde — comptes et classements (Supabase)
   La clé ci-dessous est la clé PUBLIQUE du projet : elle est faite pour être dans le site.
   Les scores ne peuvent être écrits que par la fonction serveur « jeu », qui rejoue les parties.
   ========================================================== */
(function () {
  const SUPABASE_URL = 'https://tzguwsmjfzfrghldogcn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_T-Myz58nhLxeSUN9rbjJXw_vR7PMVgC';
  const SITE_URL = 'https://matmattb.github.io/Pok-Site/';

  const sb = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
  const listeners = [];
  const O = { enabled: !!sb, sb, user: null, profile: null, points: 0 };

  async function loadProfile() {
    if (!O.user) { O.profile = null; O.points = 0; return; }
    const [{ data: prof }, { data: pts }] = await Promise.all([
      sb.from('profiles').select('id,pseudo,avatar,created_at').eq('id', O.user.id).maybeSingle(),
      sb.from('results').select('points').eq('user_id', O.user.id),
    ]);
    O.profile = prof;
    O.points = (pts || []).reduce((s, r) => s + r.points, 0);
  }
  async function setUser(u) {
    const changed = (u && u.id) !== (O.user && O.user.id);
    O.user = u || null;
    if (changed || !O.profile) await loadProfile();
    renderHeader();
    listeners.forEach(f => { try { f(O.user); } catch (e) { console.error(e); } });
  }
  O.refresh = async () => { await loadProfile(); renderHeader(); listeners.forEach(f => f(O.user)); };
  O.onChange = f => { listeners.push(f); };

  O.ready = sb ? sb.auth.getSession().then(({ data }) => setUser(data.session ? data.session.user : null)).catch(() => setUser(null)) : Promise.resolve();
  if (sb) sb.auth.onAuthStateChange((event, session) => {
    // (on sort du rappel avant d'appeler Supabase, comme le recommande la documentation)
    setTimeout(() => {
      if (event === 'PASSWORD_RECOVERY') O.recovery = true;
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') setUser(session ? session.user : null);
    }, 0);
  });

  // Appel de la fonction serveur
  O.call = async (action, body = {}) => {
    if (!sb) throw new Error('Connexion au serveur impossible');
    const { data, error } = await sb.functions.invoke('jeu', { body: Object.assign({ action }, body) });
    if (error) {
      let msg = 'Le serveur ne répond pas, réessaie dans un instant.';
      try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch (e) { /* */ }
      throw new Error(msg);
    }
    return data;
  };

  // ---------- Compte ----------
  const frError = e => {
    const m = (e && e.message) || String(e);
    if (/Invalid login credentials/i.test(m)) return 'E-mail ou mot de passe incorrect.';
    if (/already registered|already been registered/i.test(m)) return 'Un compte existe déjà avec cet e-mail.';
    if (/Password should be at least/i.test(m)) return 'Le mot de passe doit contenir au moins 8 caractères.';
    if (/Email not confirmed/i.test(m)) return 'Confirme d\'abord ton adresse e-mail (regarde tes e-mails, et les spams).';
    if (/rate limit|too many/i.test(m)) return 'Trop de tentatives, réessaie dans quelques minutes.';
    if (/valid email|invalid email|email address .* is invalid/i.test(m)) return 'Adresse e-mail invalide.';
    if (/weak|pwned|leaked/i.test(m)) return 'Ce mot de passe est trop faible ou connu, choisis-en un autre.';
    if (/profiles_pseudo_unique|duplicate key/i.test(m)) return 'Ce pseudo est déjà pris.';
    if (/profiles_pseudo_check|violates check constraint/i.test(m)) return 'Pseudo invalide : 3 à 20 caractères (lettres, chiffres, . _ -).';
    return m;
  };
  O.frError = frError;
  O.PSEUDO_RE = /^[A-Za-z0-9À-ÖØ-öø-ÿ_.-]{3,20}$/;
  O.pseudoAvailable = async p => { const { data, error } = await sb.rpc('pseudo_available', { p }); if (error) throw error; return data; };
  O.signUp = async (email, password, pseudo) => {
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { pseudo }, emailRedirectTo: SITE_URL + 'profil.html' } });
    if (error) throw new Error(frError(error));
    return { needsConfirm: !data.session };
  };
  O.signIn = async (email, password) => {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(frError(error));
  };
  O.signOut = async () => { await sb.auth.signOut(); };
  O.resetPassword = async email => {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL + 'profil.html' });
    if (error) throw new Error(frError(error));
  };
  O.setPassword = async password => {
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw new Error(frError(error));
    O.recovery = false;
  };
  O.updateProfile = async fields => {
    const { error } = await sb.from('profiles').update(fields).eq('id', O.user.id);
    if (error) throw new Error(frError(error));
    await O.refresh();
  };
  O.deleteAccount = async () => { await O.call('delete-account'); await sb.auth.signOut(); };

  // ---------- Lecture ----------
  O.leaderboard = async (game = null, period = 'tout', limit = 50) => {
    const { data, error } = await sb.rpc('leaderboard', { p_game: game, p_period: period, p_limit: limit });
    if (error) throw error;
    return data || [];
  };
  O.myResults = async () => {
    const { data, error } = await sb.from('results').select('game,day,kind,score,points,label,updated_at').eq('user_id', O.user.id).order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  };

  // ---------- Affichage commun ----------
  function renderHeader() {
    const a = document.getElementById('nav-account');
    if (!a) return;
    if (O.user && O.profile) a.innerHTML = `<img src="${PK.sprite(O.profile.avatar)}" alt="" class="nav-avatar">${O.profile.pseudo}`;
    else a.innerHTML = '👤 Connexion';
  }
  document.addEventListener('DOMContentLoaded', renderHeader);

  // Bandeau « classé / non classé » pour les pages de jeux
  O.rankBanner = (el, text) => {
    if (!el) return;
    const draw = () => {
      el.innerHTML = O.user
        ? `<span class="rank-banner on">🏆 Partie classée — tes scores comptent pour les <a href="classements.html">classements</a>${text ? ' · ' + text : ''}</span>`
        : `<span class="rank-banner">👤 <a href="profil.html">Connecte-toi</a> pour enregistrer tes scores et apparaître dans les classements</span>`;
    };
    draw(); O.onChange(draw);
  };
  // Message de fin de partie classée
  O.resultHtml = end => end ? `<p class="saved">💾 Score enregistré : <b>${end.label}</b> · +${end.points} points${end.record ? ' · 🎉 nouveau record !' : ''}</p>` : '';

  // Partie d'arcade : classée (graine donnée par le serveur, qui rejoue la partie) si connecté, sinon locale
  O.arcade = async (game, params) => {
    await O.ready;
    if (O.user) {
      try {
        const s = await O.call('arc-start', { game, params });
        return { ranked: true, session: s.session, n: s.n, r: s.seed !== undefined ? PK.rng(s.seed) : null, answers: [] };
      } catch (e) { PK.toast('⚠️ ' + e.message + ' — partie non classée'); }
    }
    return { ranked: false, r: Math.random, answers: [] };
  };
  O.arcadeEnd = async g => {
    if (!g.ranked) return null;
    try { const end = await O.call('arc-finish', { session: g.session, answers: g.answers }); O.refresh(); return end; }
    catch (e) { PK.toast('⚠️ Score non enregistré : ' + e.message); return null; }
  };
  O.endHtml = (end, game) => end ? O.resultHtml(end) + `<p><a href="classements.html?jeu=${end.game || game}">🏆 Voir le classement</a></p>`
    : (O.user ? '' : '<p class="muted"><a href="profil.html">Connecte-toi</a> pour enregistrer tes records et entrer dans les classements.</p>');

  PK.online = O;
})();
