# ScratchWin

ScratchWin est une webapp full-stack de tickets a gratter structuree pour un deploiement propre sur VPS Linux.

## Structure

```text
ScratchWin/
|-- front/
|-- back/
|-- docker-compose.yml
|-- .gitignore
|-- README.md
`-- deploy.md
```

## Architecture

- `front/` contient le frontend Vue 3 + Vite
- `back/` contient l'API Node.js + Express
- le frontend est pense pour etre servi sous `/scratchwin/`
- l'API est pensee pour etre servie sous `/scratchwin/api/`
- le reverse proxy principal est Nginx sur le VPS
- Docker lance le frontend, le backend et MySQL 8.4

## Frontend

- Vite avec `base` configure pour `/scratchwin/`
- Vue Router configure avec `import.meta.env.BASE_URL`
- fonction centralisee pour les appels API dans `front/src/api/http.js`
- aucun `localhost` hardcode pour la production

## Backend

- Express avec prefixe API `/api`
- endpoints minimum:
  - `GET /api/health`
  - `GET /api/hello`
- architecture `src/` claire et prete a accueillir plus de logique
- variables d'environnement centralisees dans `back/src/config/env.js`

## Lancement local en dev

### Backend

```bash
cd back
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd front
npm install
cp .env.example .env
npm run dev
```

En developpement:

- frontend sur `http://localhost:5173/scratchwin/`
- backend sur `http://localhost:3000/api`

## Lancement avec Docker

Depuis la racine, avec Docker Desktop demarre et `DB_PASSWORD` renseigne dans `back/.env`:

```bash
docker compose --env-file back/.env up -d --build
```

Ouvrir ensuite <http://localhost:4173/scratchwin/>.

Compose configure le backend pour joindre `db:3306`, avec la base et l'utilisateur
`scratchwin`, et reutilise `DB_PASSWORD` de `back/.env` pour MySQL et l'API.
Ces parametres remplacent les valeurs `DB_HOST`, `DB_PORT`, `DB_NAME` et `DB_USER`
du fichier pour le backend Docker uniquement.

Le backend applique les migrations versionnees avant d'ouvrir l'API. Le schema et
les tickets sont crees automatiquement, y compris sur une base vide. Les migrations
s'appliquent aussi aux volumes existants sans supprimer comptes, soldes ou parties.
Les donnees sont conservees dans le volume
`mysql_data` lors des redemarrages et reconstructions. MySQL n'expose aucun port sur l'hote.
Une base MySQL existante hors Docker n'est pas importee automatiquement.

Pour arreter les services en conservant les donnees:

```bash
docker compose --env-file back/.env down
```

Ne pas ajouter `-v` a cette commande pour conserver les donnees.

Ports exposes localement par Docker:

- frontend: `127.0.0.1:4173`
- backend: `127.0.0.1:3000`

## Deploiement VPS

La procedure complete de deploiement et la configuration Nginx VPS sont dans [deploy.md](deploy.md).

## Verification

Tests du moteur de jeu et du client HTTP (Node.js 22) :

```bash
npm --prefix back test
npm --prefix front test
npm --prefix front run build
```

Tests avec une vraie base MySQL isolee, sans ports exposes ni volume persistant :

```bash
docker compose -p scratchwin-tests -f docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from tests
docker compose -p scratchwin-tests -f docker-compose.test.yml down
```

Ces tests verifient les achats concurrents, le rollback du solde, les rotations et
expirations de session, la pagination et la conservation des donnees par les migrations.

## Securite et sessions

- En production, `JWT_SECRET` doit etre aleatoire, contenir au moins 32 octets et
  remplacer toute valeur d'exemple. Pour generer un secret :
  `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.
- Les nouveaux mots de passe ont au moins 10 caracteres et au plus 72 octets UTF-8
  (limite bcrypt). Les comptes existants continuent de fonctionner.
- La connexion autorise 10 echecs par IP sur 15 minutes ; l'inscription autorise
  5 tentatives par IP et par heure. Le compteur est en memoire pour une instance
  backend ; plusieurs replicas necessiteraient un stockage partage.
- `TRUST_PROXY` doit correspondre au nombre de proxies de confiance : `0` en acces
  direct, `1` avec un seul Nginx. Le port backend doit rester en loopback sur le VPS.
- Le client partage une seule rotation de session entre les appels et utilise
  Web Locks entre onglets quand le navigateur le permet. La deconnexion vide les
  donnees du joueur en memoire et empeche un refresh tardif de retablir la session.
- Les jetons restent dans localStorage ; une evolution vers des cookies HttpOnly
  pourrait reduire leur exposition aux scripts en cas de faille XSS.

## Base de donnees et equilibrage

Les migrations sont enregistrees dans `schema_migrations` et serialisees par un
verrou MySQL. Pour les appliquer sans lancer le serveur :

```bash
npm --prefix back run db:migrate
```

`back/src/db/scratchwin.sql` est un bootstrap non destructif utilise par la premiere
migration. Les evolutions suivantes sont ajoutees dans `back/src/db/migrate.js` avec
un nouvel identifiant ; une migration deja appliquee ne doit pas etre modifiee.
En cas de changement du schema, sauvegarder la base avant le deploiement.
Changer `DB_PASSWORD` ne modifie pas automatiquement les identifiants d'un volume
MySQL deja initialise.

Les montants des lots restent identiques. La migration d'equilibrage ajuste les
probabilites des nouvelles parties uniquement :

| Ticket | Probabilite de gain | Retour theorique |
| --- | --- | --- |
| Flash | 35 % | 87,50 % |
| Fortune | 24 % | 83,52 % |
| Jackpot | 19 % | 83,13 % |
| Mystere | 12,5 % | 84,38 % |
| Lucky 7 | 15,5 % | 83,18 % |

Le retour theorique correspond au gain brut moyen divise par le prix ; il ne
constitue pas une garantie sur une session de jeu. Les tirages utilisent `node:crypto`.
L'historique accepte `page` (1 a 100000) et `pageSize` (1 a 50, 20 par defaut) et
renvoie `{ games, pagination: { page, pageSize, hasMore } }`.
