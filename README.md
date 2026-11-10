# PokéMonde — site de fans Pokémon (FR)

Ouvre simplement `index.html` dans ton navigateur (double-clic). Aucun serveur n'est nécessaire.
Une connexion Internet est requise pour les images et les cris (hébergés par PokéAPI sur GitHub).

## Pages
| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : héros, Pokémon du jour, jeux, pages fans, anecdotes |
| `pokedex.html` / `pokemon.html?id=N` | Pokédex des 1025 Pokémon + fiche détaillée |
| `types.html` | Table des types + calculateur de faiblesses |
| `equipe.html` | Créateur d'équipe avec analyse défensive/offensive |
| `jeux.html` | Liste des mini-jeux |
| `jeu-pokedle.html` | Pokédle : Classique, Silhouette, Description, Cri — du jour ou illimité |
| `jeu-pokedoku.html` | Pokédoku 3×3 — du jour ou illimité (facile/normal/difficile) |
| `jeu-4par4.html` | 4 groupes de 4 Pokémon à retrouver — du jour ou illimité |
| `jeu-quiz-types.html`, `jeu-plus-ou-moins.html`, `jeu-memory.html`, `jeu-chrono.html` | Autres mini-jeux |

## Personnaliser
- **Couleurs / polices** : variables en haut de `assets/css/style.css` (`:root`).
- **Menu et liste des jeux** : tableau `GAMES` dans `assets/js/common.js`.
- **Catégories du Pokédoku et du 4 par 4** : `assets/js/categories.js`.

## Grilles toujours faisables
- **Pokédoku** : chaque case a au moins N réponses (10 en facile, 4 en normal, 1 en difficile), et le générateur
  vérifie qu'il existe une solution complète avec 9 Pokémon **tous différents**.
- **4 par 4** : chaque Pokémon appartient à un seul des 4 groupes, et aucune autre catégorie du jeu ne permet de
  former un « faux groupe » de 4 parmi les 16.

## Formes
256 formes alternatives (régionales, Méga, Primo, Gigamax, Motisma, Plumeline…) sont visibles dans le Pokédex
(case « Afficher les formes ») et sur les fiches. 185 d'entre elles (régionales, Méga/Primo, formes qui changent de type)
sont utilisables dans les jeux :
- **Pokédoku** : réponses acceptées (toujours dans la grille du jour, option en illimité) + catégories « Est une forme régionale » / « Est une Méga-Évolution ».
- **4 par 4** : tuiles possibles (grille du jour, option en illimité) + groupes « Formes d'Alola / de Galar / de Hisui », « Méga-Évolution ».
- **Pokédle** : option en illimité (modes Classique et Silhouette).

Une forme compte pour la génération où elle est apparue (formes d'Alola = 7, Méga = 6 ou 9…).

## Régénérer les données
Les données (`assets/js/data.js`, `data-desc.js`) viennent des CSV de [PokéAPI](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).
Les descriptions des n° 899 à 1025, absentes de PokéAPI en français, viennent de [Poképédia](https://www.pokepedia.fr) (CC BY-NC-SA)
et sont stockées dans `outils/desc-pokepedia.json`.
```
node outils/fetch-desc-pokepedia.mjs            # (facultatif) récupère les descriptions manquantes
node outils/build-data.mjs <dossier_contenant_les_csv>
```

## Comptes et classements (Supabase)

- Connexion e-mail + mot de passe (`profil.html`), classements (`classements.html`), page `confidentialite.html`.
- `assets/js/online.js` : client Supabase (clé **publique** uniquement). `assets/js/logic.js` : règles partagées entre le site et le serveur.
- Les scores ne sont jamais écrits par le navigateur : la fonction serveur `supabase/functions/jeu` garde les réponses des défis du jour secrètes et rejoue les parties d'arcade avant d'enregistrer un score.
- Base : `supabase/migrations/*.sql`.
- Redéployer le serveur après avoir modifié `data.js`, `common.js`, `categories.js` ou `logic.js` :
  ```
  node outils/sync-serveur.mjs
  npx supabase functions deploy jeu --project-ref tzguwsmjfzfrghldogcn --use-api --no-verify-jwt
  ```
- Ne jamais mettre la clé `service_role`/secrète ni le mot de passe de la base dans le dépôt.
