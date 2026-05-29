# Déploiement Inova Ride — Frontend (EasyPanel)

Guide pour déployer le frontend Next.js sur un VPS avec [EasyPanel](https://easypanel.io), via Docker et déploiement automatique GitHub.

## Prérequis

- Dépôt GitHub avec la branche `main`
- Domaine pointant vers le VPS (ex. `app.votredomaine.com`)
- API backend accessible (ex. `https://api.votredomaine.com`)

## 1. Créer le service dans EasyPanel

1. Ouvrez EasyPanel sur votre VPS.
2. Créez un nouveau projet (ou utilisez un existant).
3. Ajoutez un service de type **App**.
4. Nom suggéré : `inova-ride-frontend`.

## 2. Source Git

1. **Source** : connectez le dépôt GitHub.
2. **Branche** : `main`.
3. **Répertoire de build** (si monorepo) : `frontend`.
4. Activez **Auto-deploy** via webhook (voir section 8).

## 3. Build Docker

EasyPanel peut builder depuis le `Dockerfile` du dossier `frontend/` :

```bash
docker build -t inova-ride-frontend .
```

**Build argument recommandé** (variables `NEXT_PUBLIC_*` injectées au build) :

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.votredomaine.com \
  -t inova-ride-frontend \
  .
```

Dans EasyPanel, configurez le même argument de build si l’interface le permet, en plus des variables d’environnement runtime.

## 4. Port du conteneur

| Paramètre | Valeur |
|-----------|--------|
| **Port interne** | `3000` |
| **Protocole** | HTTP |

Le conteneur écoute sur `0.0.0.0:3000` (`HOSTNAME=0.0.0.0`, `PORT=3000`).

## 5. Domaine et SSL

1. Dans EasyPanel, attachez votre domaine (ex. `app.votredomaine.com`).
2. Activez **Let’s Encrypt** pour le certificat SSL.
3. Vérifiez que le DNS (enregistrement `A` ou `CNAME`) pointe vers le VPS.

## 6. Variables d’environnement

À définir dans le tableau de bord EasyPanel :

| Variable | Exemple | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Mode production Node |
| `NEXT_PUBLIC_API_URL` | `https://api.votredomaine.com` | URL de l’API (également en build arg) |
| `PORT` | `3000` | Port HTTP (défaut dans l’image) |
| `HOSTNAME` | `0.0.0.0` | Écoute sur toutes les interfaces |
| `NEXT_TELEMETRY_DISABLED` | `1` | Désactive la télémétrie Next.js |

> **Important** : `NEXT_PUBLIC_*` est intégré au bundle au moment du **build**. Après modification, relancez un build complet (pas seulement un redémarrage).

## 7. Health check

Configurez la sonde EasyPanel :

| Champ | Valeur |
|-------|--------|
| **Méthode** | `GET` |
| **Chemin** | `/api/health` |
| **Port** | `3000` |
| **Réponse attendue** | HTTP `200`, corps JSON `{ "status": "ok" }` |

## 8. Auto-deploy (webhook GitHub)

### Côté EasyPanel

1. Ouvrez le service → **Deploy** / **Webhooks**.
2. Copiez l’URL du webhook de redéploiement.

### Côté GitHub

1. **Settings** → **Secrets and variables** → **Actions**.
2. Ajoutez le secret `EASYPANEL_WEBHOOK_URL` avec l’URL copiée.
3. (Optionnel) `NEXT_PUBLIC_API_URL` pour le build CI.

Le workflow GitHub Actions est à la **racine du dépôt** : `.github/workflows/frontend-deploy.yml` (obligatoire pour les monorepos). Une copie miroir existe dans `frontend/.github/workflows/deploy.yml`.

Le pipeline :

- Se déclenche sur chaque push vers `main`.
- Exécute `npm ci`, `npm run type-check`, `npm run build`.
- En cas de succès, appelle le webhook EasyPanel.

## Test local avant déploiement

Depuis le dossier `frontend/` :

```bash
# Build
docker build --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 -t inova-ride-frontend .

# Run
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  inova-ride-frontend

# Health check
curl http://localhost:3000/api/health
```

Vérifier la taille de l’image :

```bash
docker images inova-ride-frontend
```

Objectif : **&lt; 350 Mo** (cible &lt; 300 Mo avec Alpine + sortie `standalone`).

## Architecture de l’image Docker

| Stage | Rôle |
|-------|------|
| `deps` | `npm ci` — dépendances pour la compilation |
| `builder` | `next build` — sortie `standalone` |
| `runner` | `node server.js` uniquement — pas de `node_modules` complet |

Configuration Next.js : `output: 'standalone'` dans `next.config.mjs` (Next.js 14 ; passer à `next.config.ts` avec Next.js 15+).

## Dépannage

| Problème | Piste |
|----------|--------|
| Build échoue sur `next build` | Vérifier les logs ; `NEXT_PUBLIC_API_URL` au build |
| 502 après deploy | Health check `/api/health` ; port `3000` mappé |
| API inaccessible depuis le navigateur | Mauvaise `NEXT_PUBLIC_API_URL` ou CORS backend |
| Image trop volumineuse | Vérifier `.dockerignore` ; pas de `node_modules` dans le contexte |

## Fichiers de déploiement

```
frontend/
├── Dockerfile
├── .dockerignore
├── next.config.mjs     # output: 'standalone'
├── DEPLOY.md           # ce fichier
└── .github/workflows/deploy.yml
```
