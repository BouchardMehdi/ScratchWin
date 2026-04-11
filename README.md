# ScratchWin

Petit projet full-stack portfolio-friendly autour de tickets a gratter.

## Stack

- Backend: Node.js, Express, JWT, bcrypt, mysql2
- Frontend: Vue 3, Vite, Vue Router, Pinia
- Base de donnees: MySQL

## Structure

```text
ScratchWin/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- db/scratchwin.sql
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- router/
|   |   |-- stores/
|   |   `-- views/
|   `-- package.json
`-- README.md
```

## Fonctionnalites MVP

- inscription et connexion
- profil utilisateur avec solde
- liste de 5 tickets
- achat d'un ticket
- resultat genere cote serveur
- mise a jour du solde
- historique des parties
- filtre simple sur l'historique

## Base MySQL

Le schema fourni a ete repris dans [backend/src/db/scratchwin.sql](backend/src/db/scratchwin.sql) avec les memes tables principales:

- `users`
- `tickets`
- `ticket_rewards`
- `games`

Le fichier SQL inclut aussi le seed initial des 5 tickets.

## Lancer le projet

### 1. Creer la base

Importe le schema:

```bash
mysql -u root -P 3308 -p < backend/src/db/scratchwin.sql
```

### 2. Installer le backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### 3. Installer le frontend

Dans un autre terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 4. Ouvrir l'application

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000/api`

## API principale

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tickets`
- `POST /api/games/play`
- `GET /api/games/history`

## Notes

- Le ticket est genere cote serveur au moment de l'achat.
- Le grattage est simule cote frontend avec des cases a reveler.
- Le code privilegie la lisibilite et un decoupage simple plutot que des abstractions inutiles.
