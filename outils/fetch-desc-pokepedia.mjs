// Récupère sur Poképédia (wiki francophone, licence CC BY-NC-SA) les descriptions du Pokédex
// des Pokémon qui n'en ont pas en français dans PokéAPI. Résultat : outils/desc-pokepedia.json
// Usage : node outils/fetch-desc-pokepedia.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'outils', 'desc-pokepedia.json');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/data.js'), 'utf8'), ctx);
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'assets/js/data-desc.js'), 'utf8'), ctx);
const { pokemon } = ctx.window.PKDATA;
const known = ctx.window.PKDESC;
const result = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

// Jeux par ordre de préférence (Écarlate, Violet, Légendes Arceus, Légendes Z-A, puis les autres)
const PREF = ['Ec', 'Vi', 'LPA', 'LZA', 'EB', 'DEPS'];
const SKIP = ['Sleep', 'GO', 'Pokopia', 'Champions'];

function clean(t) {
  return t
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')   // [[lien|texte]] -> texte
    .replace(/\{\{[^{}|]*\|([^{}]*)\}\}/g, '$1')         // {{modèle|texte}} -> texte
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/'''?/g, '').replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ').trim();
}

function extract(wikitext) {
  const start = wikitext.search(/==\s*Descriptions du \[\[Pokédex\]\]/);
  if (start < 0) return null;
  const end = wikitext.indexOf('\n== ', start + 5);
  const sec = wikitext.slice(start, end < 0 ? undefined : end);
  const entries = [];
  let games = [];
  for (const line of sec.split('\n')) {
    if (line.startsWith(';')) games = [...line.matchAll(/\{\{Jeu\|([^}|]+)/g)].map(m => m[1]);
    else if (line.startsWith(':') && games.length) { entries.push({ games, text: clean(line.slice(1)) }); games = []; }
  }
  for (const g of PREF) { const e = entries.find(x => x.games.includes(g) && x.text); if (e) return e.text; }
  const e = entries.find(x => x.text && !x.games.some(g => SKIP.includes(g)));
  return e ? e.text : null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const todo = pokemon.filter(p => !known[p.id] && !result[p.id]);
console.log(todo.length, 'Pokémon à récupérer');
for (const p of todo) {
  const url = 'https://www.pokepedia.fr/api.php?action=parse&prop=wikitext&format=json&formatversion=2&redirects=1&page=' + encodeURIComponent(p.n);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'PokeMondeFanSite/1.0 (site de fans non commercial)' } });
    const j = await res.json();
    const t = j.parse && extract(j.parse.wikitext);
    if (t) result[p.id] = t; else console.log('  pas de description :', p.id, p.n);
  } catch (e) { console.log('  erreur :', p.id, p.n, e.message); }
  await sleep(400);
}
fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
console.log('OK :', Object.keys(result).length, 'descriptions dans', OUT);
