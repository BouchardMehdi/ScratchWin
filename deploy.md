# Deploiement VPS Linux

Ce projet est pense pour etre clone dans:

```bash
/home/projects/scratchwin
```

## 1. Cloner le projet

```bash
cd /home/projects
git clone <URL_DU_REPO> scratchwin
cd scratchwin
```

## 2. Renseigner les variables d'environnement

### Backend

Copier le fichier d'exemple:

```bash
cp back/.env.example back/.env
```

Exemple de `back/.env`:

```env
PORT=3000
NODE_ENV=production
PROJECT_SLUG=scratchwin
CORS_ORIGINS=https://example.com
TRUST_PROXY=1
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=scratchwin
DB_PASSWORD=change_me
DB_NAME=scratchwin
JWT_SECRET=change_this_secret
ACCESS_TOKEN_EXPIRES_IN=2h
REFRESH_TOKEN_EXPIRES_DAYS=30
```

### Frontend

Le frontend utilise les valeurs de build definies dans `docker-compose.yml`.

Par defaut:

- base frontend: `/scratchwin/`
- base API: `/scratchwin/api`

## 3. Build et lancement

Depuis la racine du projet:

```bash
docker compose up -d --build
```

## 4. Ports exposes localement

Les conteneurs sont relies a l'hote en loopback uniquement:

- frontend: `127.0.0.1:4173`
- backend: `127.0.0.1:3000`

L'idee est de laisser Nginx du VPS faire le reverse proxy public.

## 5. Configuration Nginx du VPS

Exemple complet:

```nginx
server {
    listen 80;
    server_name example.com;

    location = / {
        return 302 https://example.com/autre-page/;
    }

    location /scratchwin/api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    location /scratchwin/ {
        proxy_pass http://127.0.0.1:4173/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

## 6. Reload Nginx

Apres avoir ajoute la config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Mise a jour future

Quand tu mets le projet a jour:

```bash
cd /home/projects/scratchwin
git pull
docker compose up -d --build
```

## Notes importantes

- le frontend est construit pour fonctionner sous `/scratchwin/`
- le backend reste monte sous `/api` a l'interieur du conteneur
- c'est Nginx du VPS qui ajoute le prefixe public `/scratchwin/api/`
- aucun `localhost` n'est utilise dans le code frontend de production
