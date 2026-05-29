# Inova Ride API — EasyPanel Deployment Guide

This guide walks you through deploying the **Inova Ride backend** on [EasyPanel](https://easypanel.io). Follow each section in order. No secrets should ever be committed to Git.

---

## 1. Prerequisites

- A GitHub repository with the `backend/` folder on the `main` branch
- An EasyPanel server (VPS) with Docker support
- A domain name (e.g. `yourdomain.com`)
- Optional: Konnect, Cloudinary, and SMTP accounts for payments, uploads, and email

---

## 2. MongoDB Service

Create MongoDB **before** the API service so the connection string is ready.

| Setting | Value |
|---------|-------|
| **Service name** | `inova-ride-mongo` |
| **Image** | `mongo:7` |
| **Volume** | Mount `/data/db` to a **persistent volume** |
| **Internal hostname** | `mongo` (EasyPanel assigns this on the internal network) |
| **Public port** | **Do NOT expose** MongoDB to the internet |

After creation, use this connection string in the API service:

```
MONGODB_URI=mongodb://mongo:27017/inova-ride
```

If your EasyPanel MongoDB service uses authentication, adjust the URI accordingly (e.g. `mongodb://user:pass@mongo:27017/inova-ride?authSource=admin`).

---

## 3. API Service Configuration

| Setting | Value |
|---------|-------|
| **Name** | `inova-ride-api` |
| **Source** | GitHub repo, branch: `main` |
| **Root directory** | `backend` (if monorepo) |
| **Build method** | Dockerfile |
| **Dockerfile path** | `Dockerfile` |
| **Port** | `5000` |
| **Health check path** | `/health` |

EasyPanel will build the multi-stage Dockerfile and run the container as non-root user `nodeuser`.

---

## 4. Environment Variables

Set all variables in the **EasyPanel dashboard** for the `inova-ride-api` service. **Never commit these to Git.**

### Core

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb://mongo:27017/inova-ride
```

### JWT (generate strong secrets)

```bash
# Run locally to generate JWT_SECRET:
openssl rand -hex 64

# Generate a different value for JWT_REFRESH_SECRET:
openssl rand -hex 64
```

```env
JWT_SECRET=<output of openssl rand -hex 64>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<different 64-byte hex secret>
JWT_REFRESH_EXPIRES_IN=30d
```

### Cloudinary (file uploads)

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Email (SMTP)

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@inovaride.com
EMAIL_FROM_NAME=Inova Ride
```

### Konnect (online payments)

```env
KONNECT_API_URL=https://api.konnect.network
KONNECT_API_KEY=
KONNECT_WALLET_ID=
KONNECT_WEBHOOK_SECRET=
```

Register the webhook URL in your **Konnect dashboard**:

```
https://api.yourdomain.com/api/payments/webhook
```

### Rate limiting & logging

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=warn
```

---

## 5. Nginx / Domain (EasyPanel)

EasyPanel manages Nginx reverse proxy and SSL for you.

| Setting | Value |
|---------|-------|
| **Domain** | `api.yourdomain.com` |
| **SSL** | Let's Encrypt (auto) |
| **Proxy target** | `inova-ride-api:5000` |

**Extra proxy headers** (if EasyPanel allows custom Nginx config):

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

The app sets `trust proxy` so rate limiting and `req.ip` use the real client IP behind Nginx.

---

## 6. GitHub Actions CI/CD

Workflow file: `backend/.github/workflows/deploy.yml` (mirror at repo root: `.github/workflows/backend-deploy.yml`)

GitHub Actions only auto-discovers workflows under `.github/workflows/` at the **repository root**. The root copy is the one that runs in CI; keep both files in sync.

On every push to `main` that touches `backend/**`, GitHub Actions will:

1. Install dependencies
2. Run `npm run type-check`
3. Run `npm run build`
4. Trigger an EasyPanel redeploy via webhook

### Required GitHub secret

| Secret | Description |
|--------|-------------|
| `EASYPANEL_BACKEND_WEBHOOK_URL` | Deploy webhook URL from EasyPanel (Settings → Webhooks) |

In EasyPanel, create a **Deploy Webhook** for the `inova-ride-api` service and paste the URL into GitHub repository secrets.

---

## 7. Local Docker Verification (before going live)

From the `backend/` directory:

```bash
# Build
docker build -t inova-ride-api .

# Run (requires a .env file with at least MONGODB_URI and JWT secrets)
docker run -p 5000:5000 --env-file .env inova-ride-api

# Health check
curl http://localhost:5000/health
# Expected: {"status":"ok",...}

# Image size (target: under 250 MB)
docker images inova-ride-api

# Container health (after ~30s)
docker inspect --format='{{.State.Health.Status}}' <container_id>
# Expected: healthy
```

---

## 8. Post-deploy Checklist

- [ ] `GET https://api.yourdomain.com/health` returns `200`
- [ ] Frontend `FRONTEND_URL` matches your production Next.js URL (CORS)
- [ ] Konnect webhook URL registered and test payment works
- [ ] Cloudinary uploads work from the admin panel
- [ ] SMTP test email sends (reservation confirmation)
- [ ] MongoDB volume is persistent (data survives container restart)
- [ ] Cron jobs run in production (`NODE_ENV=production`)

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Container exits immediately | Missing `MONGODB_URI` or invalid JWT secrets | Check EasyPanel env vars and logs |
| `502 Bad Gateway` | API not listening on port `5000` | Verify `PORT=5000` and service port mapping |
| CORS errors from frontend | Wrong `FRONTEND_URL` | Set exact origin including `https://` |
| Rate limit too aggressive | Shared IP behind proxy | Confirm `trust proxy` is enabled (default in app) |
| Uploads fail | Cloudinary vars missing | Set all three `CLOUDINARY_*` variables |
| Webhook not received | Wrong Konnect URL or firewall | Use public `https://api.yourdomain.com/api/payments/webhook` |

---

## 10. Security Reminders

- Never expose MongoDB port `27017` publicly
- Rotate `JWT_SECRET` and `JWT_REFRESH_SECRET` if compromised
- Use EasyPanel secrets / env UI — not `.env` in the repo
- Keep `LOG_LEVEL=warn` in production to reduce log volume
- Container runs as non-root user `nodeuser` (UID 1001)
