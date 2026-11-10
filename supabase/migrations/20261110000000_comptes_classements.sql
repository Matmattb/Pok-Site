-- ==========================================================
-- PokéMonde : comptes, scores, classements
-- Les scores ne sont JAMAIS écrits par le navigateur : seule la fonction serveur « jeu »
-- (qui rejoue les parties) peut enregistrer un résultat.
-- ==========================================================

create or replace function public.paris_today() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'Europe/Paris')::date $$;

-- ---------- Profils ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null check (char_length(pseudo) between 3 and 20 and pseudo ~ '^[A-Za-z0-9À-ÖØ-öø-ÿ_.-]+$'),
  avatar int not null default 25 check (avatar between 1 and 20000),
  created_at timestamptz not null default now()
);
create unique index profiles_pseudo_unique on public.profiles (lower(pseudo));
alter table public.profiles enable row level security;
create policy "Les profils sont publics" on public.profiles for select using (true);
create policy "Chacun modifie son profil" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (pseudo, avatar) on public.profiles to authenticated;

-- Création automatique du profil à l'inscription (pseudo choisi, rendu unique si besoin)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare p text := coalesce(nullif(trim(new.raw_user_meta_data->>'pseudo'), ''), 'Dresseur');
begin
  p := left(regexp_replace(p, '[^A-Za-z0-9À-ÖØ-öø-ÿ_.-]', '', 'g'), 20);
  if char_length(p) < 3 then p := 'Dresseur'; end if;
  while exists (select 1 from public.profiles where lower(pseudo) = lower(p)) loop
    p := left(p, 15) || (floor(random() * 90000) + 10000)::int;
  end loop;
  insert into public.profiles (id, pseudo) values (new.id, p);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.pseudo_available(p text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.profiles where lower(pseudo) = lower(trim(p)))
$$;

-- ---------- Résultats (un par joueur, par jeu et par jour) ----------
-- score  : valeur de classement (plus haut = meilleur)
-- points : points de dresseur gagnés (classement général)
-- label  : texte affiché (« 3 essais », « 12 coups · 41 s »…)
create table public.results (
  user_id uuid not null references public.profiles(id) on delete cascade,
  game text not null check (game ~ '^[a-z0-9-]{2,30}$'),
  day date not null,
  kind text not null check (kind in ('jour', 'arcade')),
  score int not null,
  points int not null default 0 check (points between 0 and 1000),
  label text not null default '' check (char_length(label) <= 60),
  updated_at timestamptz not null default now(),
  primary key (user_id, game, day)
);
create index results_day on public.results (day);
create index results_game_day on public.results (game, day);
alter table public.results enable row level security;
create policy "Les résultats sont publics" on public.results for select using (true);
revoke all on public.results from anon, authenticated;
grant select on public.results to anon, authenticated;

-- ---------- Tables internes (lues/écrites uniquement par le serveur) ----------
create table public.game_states (           -- progression des défis du jour
  user_id uuid not null references auth.users(id) on delete cascade,
  game text not null, day date not null, data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, game, day)
);
create table public.sessions (              -- parties d'arcade classées
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game text not null, seed bigint not null, data jsonb not null default '{}',
  started_at timestamptz not null default now(), done boolean not null default false
);
create index sessions_user on public.sessions (user_id, started_at);
create table public.doku_stats (            -- rareté des réponses du Pokédoku du jour
  day date not null, cell smallint not null, pokemon_id int not null, n int not null default 0,
  primary key (day, cell, pokemon_id)
);
alter table public.game_states enable row level security;
alter table public.sessions enable row level security;
alter table public.doku_stats enable row level security;
revoke all on public.game_states, public.sessions, public.doku_stats from anon, authenticated;

-- ---------- Écriture des résultats (réservée au serveur) ----------
create or replace function public.save_result(p_user uuid, p_game text, p_day date, p_kind text, p_score int, p_points int, p_label text)
returns void language sql security definer set search_path = '' as $$
  insert into public.results (user_id, game, day, kind, score, points, label)
  values (p_user, p_game, p_day, p_kind, p_score, p_points, p_label)
  on conflict (user_id, game, day) do update
    set score = excluded.score, points = excluded.points, label = excluded.label, updated_at = now()
    where excluded.score > public.results.score;
$$;
create or replace function public.doku_add(p_day date, p_cell int, p_pid int)
returns table (n int, total bigint) language plpgsql security definer set search_path = '' as $$
begin
  insert into public.doku_stats (day, cell, pokemon_id, n) values (p_day, p_cell, p_pid, 1)
  on conflict (day, cell, pokemon_id) do update set n = public.doku_stats.n + 1;
  return query select s.n, (select sum(t.n) from public.doku_stats t where t.day = p_day and t.cell = p_cell)
    from public.doku_stats s where s.day = p_day and s.cell = p_cell and s.pokemon_id = p_pid;
end $$;
revoke execute on function public.save_result, public.doku_add from public, anon, authenticated;

-- ---------- Lecture : classements ----------
-- p_game NULL = classement général (somme des points). Sinon classement d'un jeu :
--   défi du jour -> somme des points sur la période ; arcade -> meilleur score sur la période.
-- Renvoie le top p_limit + la ligne du joueur connecté s'il est plus loin.
create or replace function public.leaderboard(p_game text default null, p_period text default 'tout', p_limit int default 50)
returns table (rang bigint, user_id uuid, pseudo text, avatar int, valeur bigint, label text, parties bigint)
language sql stable security definer set search_path = '' as $$
  with r as (
    select * from public.results x
    where (p_game is null or x.game = p_game)
      and (p_period = 'tout'
        or (p_period = 'jour' and x.day = public.paris_today())
        or (p_period = 'semaine' and x.day >= date_trunc('week', public.paris_today())::date))
  ), agg as (
    select r.user_id,
      case when p_game is null or bool_or(r.kind = 'jour') then sum(r.points)::bigint else max(r.score)::bigint end as valeur,
      count(*)::bigint as parties,
      case when p_game is null then ''
           when bool_or(r.kind = 'jour') then case when count(*) = 1 then max(r.label) else count(*) || ' défis' end
           else (array_agg(r.label order by r.score desc))[1] end as label
    from r group by r.user_id
  ), ranked as (
    select rank() over (order by a.valeur desc) as rang, a.user_id, p.pseudo, p.avatar, a.valeur, a.label, a.parties
    from agg a join public.profiles p on p.id = a.user_id
  )
  select * from ranked where ranked.rang <= least(greatest(p_limit, 1), 200) or ranked.user_id = (select auth.uid())
  order by ranked.rang, ranked.pseudo;
$$;

-- Rareté du Pokédoku : visible pour les jours passés, ou aujourd'hui une fois sa grille terminée
create or replace function public.doku_rarity(p_day date)
returns table (cell smallint, pokemon_id int, n int)
language sql stable security definer set search_path = '' as $$
  select s.cell, s.pokemon_id, s.n from public.doku_stats s
  where s.day = p_day and (p_day < public.paris_today() or exists (
    select 1 from public.results x where x.user_id = (select auth.uid()) and x.game = 'pokedoku' and x.day = p_day))
  order by s.cell, s.n desc;
$$;

grant execute on function public.leaderboard, public.doku_rarity, public.pseudo_available, public.paris_today to anon, authenticated;
