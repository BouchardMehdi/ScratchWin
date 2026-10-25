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

La base est initialisee automatiquement avec `back/src/db/scratchwin.sql` au
premier demarrage sur un volume vide. Les donnees sont conservees dans le volume
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
