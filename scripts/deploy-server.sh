#!/usr/bin/env bash
# Deploy script for cdp.unizik.qverselearning.org (nginx with auto-config)
set -euo pipefail

APP_DIR="${1:-/home/qverselearning/cdp.unizik.qverselearning.org}"
APP_NAME="${2:-cdp.unizik.qverselearning.org}"
APP_PORT="${3:-3800}"
DOMAIN="${4:-cdp.unizik.qverselearning.org}"
ARCHIVE="next-deploy.tar.gz"
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"
LE_EMAIL="${5:-support@qverselearning.com}"
ENV_FILE="${APP_DIR}/.env.production"  # Add this line

echo "== Deploy starting =="
echo " APP_DIR=${APP_DIR}"
echo " APP_NAME=${APP_NAME}"
echo " APP_PORT=${APP_PORT}"
echo " DOMAIN=${DOMAIN}"

DEPLOY_USER="${SUDO_USER:-$(whoami)}"

# Ensure app directory exists
sudo mkdir -p "${APP_DIR}"
sudo chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"
cd "${APP_DIR}"

# Extract archive if present
if [ -f "${ARCHIVE}" ]; then
  echo "Extracting ${ARCHIVE} into ${APP_DIR}"
  tar -xzf "${ARCHIVE}"
  rm -f "${ARCHIVE}"
fi

# Install Node 22 if needed
if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs -y
fi

# Install pm2 if needed
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm i -g pm2
fi

# ============================================
# AUTOMATE NGINX CONFIGURATION
# ============================================
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"

echo "Writing Nginx config to ${NGINX_CONF}..."
# Notice we are ONLY writing the HTTP port 80 block. 
# Certbot will automatically inject the port 443 block and SSL paths later.
sudo tee "${NGINX_CONF}" > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy /api/v1/* to remote backend
    location /api/v1/ {
        proxy_pass https://cdp.api.unizik.qverselearning.org/api/v1/;
        proxy_ssl_server_name on;
        proxy_set_header Host cdp.api.unizik.qverselearning.org;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Proxy to Next.js app
    location / {
        proxy_pass         http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Test nginx config (This will now pass because it only looks for standard HTTP directives)
if sudo nginx -t 2>/dev/null; then
  echo "✅ Nginx config OK, reloading..."
  sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null
else
  echo "❌ Nginx config test failed"
  sudo nginx -t
  exit 1
fi

# ============================================
# SSL Setup
# ============================================
if command -v certbot >/dev/null 2>&1; then
  echo "Attempting SSL setup..."
  # The --redirect flag tells Certbot to automatically add the 301 redirect to the config
  sudo certbot --nginx --non-interactive --agree-tos --redirect \
    -m "${LE_EMAIL}" -d "${DOMAIN}" 2>/dev/null || true
else
  echo "Certbot not found, skipping SSL"
fi

# ============================================
# ENVIRONMENT & DEPENDENCIES
# ============================================
cat > "${ENV_FILE}" <<EOF
PORT=${APP_PORT}
NODE_ENV=production
EOF

# Append additional env vars (these come from CI/CD session)
printenv | grep -E '^(NEXT_PUBLIC_)' >> "${ENV_FILE}" 2>/dev/null || true

chmod 600 "${ENV_FILE}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${ENV_FILE}"

# ============================================
# STOP APP BEFORE INSTALLING DEPS
# ============================================
if pm2 list 2>/dev/null | grep -q "${APP_NAME}"; then
  echo "Stopping ${APP_NAME} before dependency install..."
  pm2 stop "${APP_NAME}"
fi

# ============================================
# INSTALL DEPENDENCIES
# ============================================

echo "Installing production dependencies..."
npm ci --omit=dev || {
  echo "npm ci failed, cleaning node_modules and retrying..."
  rm -rf node_modules
  npm cache clean --force
  npm ci --omit=dev
}

# ============================================
# PM2 APPLICATION MANAGEMENT
# ============================================
if pm2 list 2>/dev/null | grep -q "${APP_NAME}"; then
  echo "Reloading ${APP_NAME}..."
  pm2 reload "${APP_NAME}" --update-env 2>/dev/null || pm2 restart "${APP_NAME}"
else
  echo "Starting ${APP_NAME}..."
  PORT=${APP_PORT} pm2 start npm --name "${APP_NAME}" -- start
fi

pm2 save

# ============================================
# check if app is actually working
# ============================================
echo "Waiting for app to start..."
sleep 5

if curl -sf http://127.0.0.1:${APP_PORT} > /dev/null 2>&1; then
  echo "✅ App is responding on port ${APP_PORT}"
else
  echo "❌ App is NOT responding — check pm2 logs"
  pm2 logs "${APP_NAME}" --lines 50 --nostream
  exit 1
fi

echo "✅ Deployment finished!"
echo "📍 Application running at http://localhost:${APP_PORT}"
echo "🌐 Public URL: http://${DOMAIN}"