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
- Docker est utilise pour lancer un conteneur frontend et un conteneur backend

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

Depuis la racine:

```bash
docker compose up -d --build
```

Ports exposes localement par Docker:

- frontend: `127.0.0.1:4173`
- backend: `127.0.0.1:3000`

## Deploiement VPS

La procedure complete de deploiement et la configuration Nginx VPS sont dans [deploy.md](deploy.md).
