// Génère assets/js/data.js et assets/js/data-desc.js à partir des CSV de PokéAPI.
// Usage : node outils/build-data.mjs <dossier_csv>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CSV_DIR = process.argv[2];
if (!CSV_DIR) { console.error('Usage: node build-data.mjs <csv_dir>'); process.exit(1); }
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'js');
const FR = '5', EN = '9';
const MAX_ID = 1025;

function parseCSV(text) {
  const rows = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const head = rows.shift();
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}
const load = n => parseCSV(fs.readFileSync(path.join(CSV_DIR, n + '.csv'), 'utf8'));

const species = load('pokemon_species').filter(s => +s.id <= MAX_ID);
const pokemon = load('pokemon');
const names = load('pokemon_species_names');
const ptypes = load('pokemon_types');
const typeNames = load('type_names');
const colorNames = load('pokemon_color_names');
const stats = load('pokemon_stats');
const pabil = load('pokemon_abilities');
const abilNames = load('ability_names');
const evos = load('pokemon_evolution');
const items = load('items');
const itemNames = load('item_names');
const eff = load('type_efficacy');
const flavor = load('pokemon_species_flavor_text');

const nameFr = {}, nameEn = {}, genusFr = {};
for (const r of names) {
  if (r.local_language_id === FR) { nameFr[r.pokemon_species_id] = r.name; genusFr[r.pokemon_species_id] = r.genus; }
  if (r.local_language_id === EN) nameEn[r.pokemon_species_id] = r.name;
}
const TYPE_COLORS = ['#9FA19F','#FF8000','#81B9EF','#9141CB','#915121','#AFA981','#91A119','#704170','#60A1B8','#E62829','#2980EF','#3FA129','#FAC000','#EF4179','#3DCEF3','#5060E1','#624D4E','#EF70EF'];
const types = [];
for (let t = 1; t <= 18; t++) types.push({ id: t, name: typeNames.find(r => r.type_id == t && r.local_language_id === FR).name, color: TYPE_COLORS[t - 1] });
const colors = [];
for (let c = 1; c <= 10; c++) colors.push(colorNames.find(r => r.pokemon_color_id == c && r.local_language_id === FR).name);

const abilFr = {};
for (const r of abilNames) if (r.local_language_id === FR) abilFr[r.ability_id] = r.name;
const itemFr = {}, itemIdent = {};
for (const r of items) itemIdent[r.id] = r.identifier;
for (const r of itemNames) if (r.local_language_id === FR) itemFr[r.item_id] = r.name;
const STONES = new Set(['sun-stone','moon-stone','fire-stone','thunder-stone','water-stone','leaf-stone','shiny-stone','dusk-stone','dawn-stone','ice-stone']);

// ---------- Formes ----------
const formsCsv = load('pokemon_forms');
const formNames = load('pokemon_form_names');
const vgGen = {};
for (const v of load('version_groups')) vgGen[v.id] = +v.generation_id;
const formToPk = {}, defFormOfPk = {};
for (const f of formsCsv) { formToPk[f.id] = f.pokemon_id; if (f.is_default === '1') defFormOfPk[f.pokemon_id] = f; }
const formNameFr = {}, formNameEn = {};
for (const r of formNames) {
  if (r.local_language_id === FR) formNameFr[r.pokemon_form_id] = (r.pokemon_name || r.form_name).replace(/’/g, "'");
  if (r.local_language_id === EN) formNameEn[r.pokemon_form_id] = r.pokemon_name || r.form_name;
}
const REGIONS = ['alola', 'galar', 'hisui', 'paldea'];
const REG_FR = { alola: "d'Alola", galar: 'de Galar', hisui: 'de Hisui', paldea: 'de Paldea' };
function formKind(ident) {
  if (/-mega(-|$)/.test(ident)) return 'mega';
  if (/-primal$/.test(ident)) return 'primal';
  if (/-gmax$/.test(ident)) return 'gmax';
  if (REGIONS.some(r => ident.includes('-' + r))) return 'reg';
  return 'autre';
}
const regionOf = ident => REGIONS.find(r => ident.includes('-' + r)) || '';

const pokById = Object.fromEntries(pokemon.filter(p => p.is_default === '1').map(p => [p.species_id, p]));
const statsBy = {};
for (const r of stats) (statsBy[r.pokemon_id] ||= [])[+r.stat_id - 1] = +r.base_stat;
const typesBy = {};
for (const r of ptypes) (typesBy[r.pokemon_id] ||= [])[+r.slot - 1] = +r.type_id;
const abilBy = {};
for (const r of pabil) (abilBy[r.pokemon_id] ||= []).push(r);

// Espèces possédant des formes spéciales (pour « Possède une Méga-Évolution », etc.)
const megaSet = new Set(), gmaxSet = new Set(), regional = {};
for (const p of pokemon) {
  const sid = +p.species_id; if (sid > MAX_ID || p.is_default === '1') continue;
  const id = p.identifier, k = formKind(id);
  if (k === 'mega') megaSet.add(sid);
  if (k === 'gmax') gmaxSet.add(sid);
  if (k === 'reg' && !/-cap|-totem/.test(id)) (regional[sid] ||= new Set()).add(regionOf(id));
}

// ---------- Évolutions (par forme) ----------
const byId = Object.fromEntries(species.map(s => [s.id, s]));
// Pour chaque ligne : _to = Pokémon obtenu, _from = forme précise requise (sinon la forme par défaut)
for (const e of evos) {
  e._to = e.evolved_pokemon_form_id ? formToPk[e.evolved_pokemon_form_id] : pokById[e.evolved_species_id]?.id;
  e._from = e.required_pokemon_form_id ? formToPk[e.required_pokemon_form_id] : null;
}
const rowsTo = {}, rowsFromSpecies = {};
for (const e of evos) {
  (rowsTo[e._to] ||= []).push(e);
  const pre = byId[e.evolved_species_id]?.evolves_from_species_id;
  if (pre) (rowsFromSpecies[pre] ||= []).push(e);
}
function evoMethod(rows) {
  if (!rows || !rows.length) return '';
  const e = rows.find(r => r.is_default === '1') || rows[0];
  const parts = [];
  switch (e.evolution_trigger_id) {
    case '1':
      if (e.minimum_level) parts.push('Niveau ' + e.minimum_level);
      else if (e.minimum_happiness) parts.push('Bonheur');
      else if (e.minimum_affection) parts.push('Affection');
      else if (e.known_move_id) parts.push('Connaît une capacité');
      else if (e.location_id) parts.push('Lieu spécial');
      else if (e.held_item_id) parts.push('Tient ' + (itemFr[e.held_item_id] || 'un objet'));
      else parts.push('Montée de niveau');
      if (e.time_of_day === 'day') parts.push('(jour)');
      if (e.time_of_day === 'night') parts.push('(nuit)');
      break;
    case '2': parts.push('Échange' + (e.held_item_id ? ' en tenant ' + (itemFr[e.held_item_id] || 'un objet') : '')); break;
    case '3': parts.push(itemFr[e.trigger_item_id] || 'Objet'); break;
    default: parts.push('Méthode spéciale');
  }
  return parts.join(' ');
}
function stageOf(s) { let st = 1, cur = s; while (cur.evolves_from_species_id) { st++; cur = byId[cur.evolves_from_species_id]; } return st; }
const evoFlags = rows => {
  const f = [];
  if (rows.some(e => e.evolution_trigger_id === '3' && STONES.has(itemIdent[e.trigger_item_id]))) f.push('stone');
  if (rows.some(e => e.evolution_trigger_id === '2')) f.push('trade');
  return f;
};

// Lignées spéciales
const STARTERS = [1,4,7,152,155,158,252,255,258,387,390,393,495,498,501,650,653,656,722,725,728,810,813,816,906,909,912];
const starterChains = new Set(STARTERS.map(i => byId[i].evolution_chain_id));
const PSEUDO = [149,248,373,376,445,635,706,784,887,998];
const pseudoChains = new Set(PSEUDO.map(i => byId[i].evolution_chain_id));
const FOSSILS = new Set([138,139,140,141,142,345,346,347,348,408,409,410,411,564,565,566,567,696,697,698,699,880,881,882,883]);
const ULTRA = new Set([793,794,795,796,797,798,799,803,804,805,806]);
const PARADOX = new Set([984,985,986,987,988,989,990,991,992,993,994,995,1005,1006,1009,1010,1020,1021,1022,1023]);
const EEVEE = new Set([133,134,135,136,196,197,470,471,700]);
const PIKACLONES = new Set([311,312,417,587,702,777,877,921,922,923]);

const abilities = pid => (abilBy[pid] || []).sort((a, b) => a.slot - b.slot).map(a => (abilFr[a.ability_id] || '?') + (a.is_hidden === '1' ? '*' : ''));
function speciesFlags(s) {
  const sid = +s.id, flags = [];
  if (s.is_legendary === '1') flags.push('leg');
  if (s.is_mythical === '1') flags.push('myth');
  if (s.is_baby === '1') flags.push('baby');
  if (starterChains.has(s.evolution_chain_id)) flags.push('starter');
  if (STARTERS.includes(sid)) flags.push('starter0');
  if (pseudoChains.has(s.evolution_chain_id)) flags.push('pseudo');
  if (FOSSILS.has(sid)) flags.push('fossil');
  if (ULTRA.has(sid)) flags.push('ultra');
  if (PARADOX.has(sid)) flags.push('paradox');
  if (EEVEE.has(sid)) flags.push('eevee');
  if (PIKACLONES.has(sid)) flags.push('pikaclone');
  return flags;
}

const out = [];
for (const s of species) {
  const sid = s.id, p = pokById[sid];
  const flags = speciesFlags(s);
  if (megaSet.has(+sid)) flags.push('mega');
  if (gmaxSet.has(+sid)) flags.push('gmax');
  const to = rowsTo[p.id] || [];
  flags.push(...evoFlags(to));
  const fromRows = rowsFromSpecies[sid] || [];
  out.push({
    id: +sid, n: nameFr[sid], en: nameEn[sid], g: genusFr[sid] || '', gen: +s.generation_id,
    t: typesBy[p.id], c: +s.color_id, h: +p.height, w: +p.weight, st: statsBy[p.id],
    ab: abilities(p.id), pre: s.evolves_from_species_id ? +s.evolves_from_species_id : 0, ch: +s.evolution_chain_id,
    stg: stageOf(s), evo: fromRows.some(e => !e._from || e._from === p.id) ? 1 : 0, em: evoMethod(to),
    reg: regional[sid] ? [...regional[sid]] : [], f: flags,
  });
}

// Formes alternatives
const EXCLUDE = /-totem|-cap$|-cap-|-starter$|power-construct|-meteor$|^minior-(orange|yellow|green|blue|indigo|violet)$/;
const forms = [];
for (const p of pokemon) {
  const sid = p.species_id;
  if (p.is_default === '1' || +sid > MAX_ID || EXCLUDE.test(p.identifier)) continue;
  const f0 = defFormOfPk[p.id]; if (!f0) continue;
  const d = pokById[sid], s = byId[sid];
  const k = formKind(p.identifier), rg = regionOf(p.identifier);
  const typesDiff = typesBy[p.id].join() !== typesBy[d.id].join();
  const statsDiff = statsBy[p.id].join() !== statsBy[d.id].join();
  if (k === 'autre' && !typesDiff && !statsDiff) continue; // forme purement esthétique
  let n = formNameFr[f0.id];
  if (!n) n = k === 'mega' ? 'Méga-' + nameFr[sid] : k === 'gmax' ? nameFr[sid] + ' Gigamax' : k === 'reg' ? nameFr[sid] + ' ' + REG_FR[rg] : nameFr[sid] + ' (' + p.identifier + ')';
  if (k === 'gmax' && !/gigamax/i.test(n)) n = nameFr[sid] + ' Gigamax';
  n = n.replace(/Paldéa/g, 'Paldea');
  if (/-female-mega$/.test(p.identifier)) n += ' ♀';
  if (/-male-mega$/.test(p.identifier)) n += ' ♂';
  // méthode d'évolution : celle de la forme, sinon celle d'une forme sœur de la même région, sinon celle de la forme normale
  const sib = k === 'reg' && pokemon.find(q => q.species_id === sid && q.id !== p.id && regionOf(q.identifier) === rg && rowsTo[q.id]?.length);
  // (les formes de combat, comme le Mode Transe, ne s'obtiennent pas par évolution)
  const to = f0.is_battle_only === '1' ? [] : rowsTo[p.id]?.length ? rowsTo[p.id] : sib ? rowsTo[sib.id] : (k === 'reg' ? rowsTo[d.id] || [] : []);
  const fromRows = rowsFromSpecies[sid] || [];
  let evo = fromRows.some(e => e._from === p.id);
  if (!evo && k === 'reg' && fromRows.some(e => !e._from)) {
    // l'évolution « normale » existe-t-elle aussi dans cette région ? (ex. Ponyta de Galar -> Galopa de Galar)
    const kids = new Set(fromRows.filter(e => !e._from).map(e => e.evolved_species_id));
    evo = [...kids].some(k2 => regional[k2] && regional[k2].has(rg));
  }
  const flags = speciesFlags(s).concat(evoFlags(to));
  forms.push({
    id: +p.id, sp: +sid, n, en: formNameEn[f0.id] || p.identifier, k, rg,
    game: (k === 'mega' || k === 'primal' || k === 'reg' || (k === 'autre' && typesDiff)) ? 1 : 0,
    gen: vgGen[f0.introduced_in_version_group_id] || +s.generation_id,
    t: typesBy[p.id], c: +s.color_id, h: +p.height, w: +p.weight, st: statsBy[p.id], ab: abilities(p.id),
    pre: s.evolves_from_species_id ? +s.evolves_from_species_id : 0, ch: +s.evolution_chain_id,
    stg: stageOf(s), evo: evo ? 1 : 0, em: evoMethod(to), reg: [], f: flags,
  });
}

// Table des types : eff[attaque][défense] (index 0..17)
const effM = Array.from({ length: 18 }, () => Array(18).fill(1));
for (const r of eff) { const a = +r.damage_type_id, d = +r.target_type_id; if (a <= 18 && d <= 18) effM[a - 1][d - 1] = +r.damage_factor / 100; }

// Descriptions FR (dernière version disponible)
const desc = {};
for (const r of flavor) {
  if (r.language_id !== FR || +r.species_id > MAX_ID) continue;
  const v = +r.version_id;
  if (!desc[r.species_id] || v > desc[r.species_id].v) desc[r.species_id] = { v, t: r.flavor_text.replace(/[\n\f\u000c­]+/g, ' ').replace(/\s+/g, ' ').trim() };
}
const descOut = {};
for (const k in desc) descOut[k] = desc[k].t;
// Descriptions complémentaires récupérées sur Poképédia (outils/fetch-desc-pokepedia.mjs)
const PP = path.join(path.dirname(fileURLToPath(import.meta.url)), 'desc-pokepedia.json');
if (fs.existsSync(PP)) { const pp = JSON.parse(fs.readFileSync(PP, 'utf8')); for (const k in pp) if (!descOut[k]) descOut[k] = pp[k]; }

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'data.js'), '// Généré par outils/build-data.mjs — données PokéAPI\nwindow.PKDATA=' + JSON.stringify({ types, colors, eff: effM, pokemon: out, forms }) + ';\n');
fs.writeFileSync(path.join(OUT, 'data-desc.js'), '// Généré par outils/build-data.mjs\nwindow.PKDESC=' + JSON.stringify(descOut) + ';\n');
console.log('Pokémon:', out.length, 'formes:', forms.length, 'formes jouables:', forms.filter(f => f.game).length, 'descriptions:', Object.keys(descOut).length);
console.log('Sans nom FR:', out.filter(p => !p.n).map(p => p.id));
console.log('Sans types:', out.filter(p => !p.t).map(p => p.id));
