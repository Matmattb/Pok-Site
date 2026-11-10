// Copie le code partagé (données + logique de jeu) vers la fonction serveur Supabase,
// pour que le serveur rejoue les parties avec EXACTEMENT le même code que le site.
// À lancer avant chaque déploiement : node outils/sync-serveur.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'supabase', 'functions', '_shared');
fs.mkdirSync(DEST, { recursive: true });
fs.writeFileSync(path.join(DEST, 'setup.js'), '// Les scripts du site écrivent dans « window » : sur le serveur, window = globalThis\nglobalThis.window = globalThis;\n');
for (const f of ['data.js', 'data-desc.js', 'common.js', 'categories.js', 'logic.js']) {
  fs.copyFileSync(path.join(ROOT, 'assets', 'js', f), path.join(DEST, f));
}
console.log('Fichiers partagés copiés dans', DEST);
