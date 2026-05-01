#!/usr/bin/env bash
# =============================================================================
# Deploy script — cdp.unizik.qverselearning.org
# -----------------------------------------------------------------------------
# SCOPE: This script touches ONLY resources belonging to this application.
#   - Nginx:  writes /etc/nginx/conf.d/${DOMAIN}.conf only
#   - PM2:    manages only the process named "${APP_NAME}"
#   - Files:  writes inside ${APP_DIR} only
#   - SSL:    certbot targets -d ${DOMAIN} only
# Other apps and vhosts on this VPS are never modified.
#
# Run as the deploy user (plain bash, NOT sudo bash).
# Uses sudo internally only for Nginx conf write, nginx reload, and certbot.
# Prerequisite: run scripts/bootstrap-vps.sh once before the first deploy.
# =============================================================================
set -euo pipefail

APP_DIR="${1:-/home/qverselearning/cdp.unizik.qverselearning.org}"
APP_NAME="${2:-cdp.unizik.qverselearning.org}"
APP_PORT="${3:-3800}"
DOMAIN="${4:-cdp.unizik.qverselearning.org}"
LE_EMAIL="${5:-support@qverselearning.com}"

ARCHIVE="next-deploy.tar.gz"
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"
ENV_FILE="${APP_DIR}/.env.production"

echo "============================================"
echo "  Deploy: ${APP_NAME}"
echo "  Dir   : ${APP_DIR}"
echo "  Port  : ${APP_PORT}"
echo "  Domain: ${DOMAIN}"
echo "============================================"

# ── App directory ─────────────────────────────────────────────────────────────
mkdir -p "${APP_DIR}"
cd "${APP_DIR}"

# ── Extract archive (if CI placed it in home or app dir) ─────────────────────
for ARCHIVE_PATH in "${HOME}/${ARCHIVE}" "${APP_DIR}/${ARCHIVE}"; do
  if [[ -f "${ARCHIVE_PATH}" ]]; then
    echo "Extracting ${ARCHIVE_PATH}..."
    tar -xzf "${ARCHIVE_PATH}" -C "${APP_DIR}"
    rm -f "${ARCHIVE_PATH}"
    break
  fi
done

# ── Write .env.production (app-scoped, mode 600) ─────────────────────────────
# Next.js reads this file automatically when NODE_ENV=production.
# AUTH_SECRET and NEXTAUTH_SECRET are required at runtime by NextAuth.
cat > "${ENV_FILE}" <<ENVEOF
PORT=${APP_PORT}
NODE_ENV=production
ENVEOF

# Append runtime secrets injected by CI/CD via environment variables
printenv | grep -E '^(AUTH_SECRET=|NEXTAUTH_SECRET=|NEXT_PUBLIC_)' >> "${ENV_FILE}" 2>/dev/null || true

# Derive NEXTAUTH_SECRET from AUTH_SECRET when not explicitly set
if grep -q "^AUTH_SECRET=" "${ENV_FILE}" && ! grep -q "^NEXTAUTH_SECRET=" "${ENV_FILE}"; then
    _auth_val=$(grep "^AUTH_SECRET=" "${ENV_FILE}" | cut -d'=' -f2-)
    echo "NEXTAUTH_SECRET=${_auth_val}" >> "${ENV_FILE}"
fi

chmod 600 "${ENV_FILE}"
echo "✅ .env.production written"

# ── Nginx vhost for THIS domain only ─────────────────────────────────────────
# Only /etc/nginx/conf.d/${DOMAIN}.conf is written. No other file is touched.
echo "Writing ${NGINX_CONF}..."
sudo tee "${NGINX_CONF}" > /dev/null <<NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy /api/v1/* → backend subdomain
    location /api/v1/ {
        proxy_pass            https://cdp.api.unizik.qverselearning.org/api/v1/;
        proxy_ssl_server_name on;
        proxy_set_header      Host cdp.api.unizik.qverselearning.org;
        proxy_set_header      X-Real-IP \$remote_addr;
        proxy_set_header      X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header      X-Forwarded-Proto \$scheme;
        proxy_read_timeout    30s;
        proxy_connect_timeout 10s;
    }

    # Proxy all other traffic → Next.js app
    location / {
        proxy_pass            http://127.0.0.1:${APP_PORT};
        proxy_http_version    1.1;
        proxy_set_header      Upgrade \$http_upgrade;
        proxy_set_header      Connection 'upgrade';
        proxy_set_header      Host \$host;
        proxy_set_header      X-Real-IP \$remote_addr;
        proxy_set_header      X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header      X-Forwarded-Proto \$scheme;
        proxy_cache_bypass    \$http_upgrade;
        proxy_read_timeout    60s;
        proxy_connect_timeout 10s;
    }
}
NGINXEOF

# Validate then gracefully reload Nginx.
# nginx -t checks ALL vhosts but reload is graceful — other sites keep serving.
if sudo nginx -t 2>&1; then
    sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx config test failed — aborting deploy"
    exit 1
fi

# ── SSL certificate for THIS domain only ─────────────────────────────────────
# certbot -d ${DOMAIN} modifies only this domain's conf. Other certs untouched.
if command -v certbot &>/dev/null; then
    if sudo certbot certificates 2>/dev/null | grep -q "Domains:.*${DOMAIN}"; then
        echo "Renewing existing SSL certificate for ${DOMAIN}..."
        sudo certbot renew --nginx --cert-name "${DOMAIN}" --non-interactive 2>/dev/null || true
    else
        echo "Obtaining SSL certificate for ${DOMAIN}..."
        sudo certbot --nginx --non-interactive --agree-tos --redirect \
            -m "${LE_EMAIL}" -d "${DOMAIN}" 2>/dev/null || true
    fi
    echo "✅ SSL handled"
else
    echo "⚠️  Certbot not found — skipping SSL. Run bootstrap-vps.sh to install it."
fi

# ── Stop THIS app before installing deps ──────────────────────────────────────
# pm2 stop by name — only this process is affected
if pm2 list 2>/dev/null | grep -q "${APP_NAME}"; then
    echo "Stopping ${APP_NAME}..."
    pm2 stop "${APP_NAME}"
fi

# ── Install production dependencies ──────────────────────────────────────────
echo "Installing production dependencies..."
npm ci --omit=dev || {
    echo "npm ci failed — cleaning node_modules and retrying..."
    rm -rf node_modules
    npm cache clean --force
    npm ci --omit=dev
}
echo "✅ Dependencies installed"

# ── Start / reload THIS app via PM2 ──────────────────────────────────────────
# All pm2 commands below are scoped to APP_NAME — other processes are untouched.
if pm2 list 2>/dev/null | grep -q "${APP_NAME}"; then
    echo "Reloading ${APP_NAME}..."
    pm2 reload "${APP_NAME}" --update-env || pm2 restart "${APP_NAME}"
else
    echo "Starting ${APP_NAME} via ecosystem.config.js..."
    APP_NAME="${APP_NAME}" APP_PORT="${APP_PORT}" pm2 start ecosystem.config.js
fi

# Persist the current PM2 process list (saves all running apps, not just this one)
pm2 save
echo "✅ PM2 process saved"

# ── Health check ──────────────────────────────────────────────────────────────
echo "Running health check on port ${APP_PORT}..."
MAX_RETRIES=6
for i in $(seq 1 "${MAX_RETRIES}"); do
    if curl -sf "http://127.0.0.1:${APP_PORT}" > /dev/null 2>&1; then
        echo "✅ App is responding on port ${APP_PORT}"
        break
    fi
    if [[ "${i}" -eq "${MAX_RETRIES}" ]]; then
        echo "❌ App is NOT responding after ${MAX_RETRIES} attempts"
        echo "--- PM2 logs ---"
        pm2 logs "${APP_NAME}" --lines 60 --nostream
        exit 1
    fi
    echo "   Attempt ${i}/${MAX_RETRIES} — retrying in 5s..."
    sleep 5
done

echo ""
echo "============================================"
echo "  ✅ Deployment complete!"
echo "  App : http://127.0.0.1:${APP_PORT}"
echo "  URL : https://${DOMAIN}"
echo "============================================"