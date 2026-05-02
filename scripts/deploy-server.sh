#!/usr/bin/env bash
# =============================================================================
# deploy-server.sh — Generic Next.js server-side deploy script
# -----------------------------------------------------------------------------
# REUSABLE: Copy this file unchanged to any Next.js project. All app-specific
# values come in as arguments — configure them in your CI/CD workflow only.
#
# SCOPE: This script touches ONLY resources belonging to the target app.
#   - Apache: writes cPanel userdata for ${DOMAIN} only
#   - Nginx:  writes /etc/nginx/conf.d/${DOMAIN}.conf only
#   - PM2:    manages only the process named "${APP_NAME}"
#   - Files:  writes inside ${APP_DIR} only
#   - SSL:    certbot targets -d ${DOMAIN} only
# Other apps and vhosts on this server are NEVER modified.
#
# Run as the deploy user (plain bash, NOT sudo bash).
# Uses sudo internally only for web server conf writes, reloads, and certbot.
# Prerequisite: run scripts/bootstrap-vps.sh once before the first deploy.
#
# Usage:
#   bash deploy-server.sh <APP_DIR> <APP_NAME> <APP_PORT> <DOMAIN> <LE_EMAIL> [BACKEND_URL]
#
# Arguments:
#   APP_DIR     — absolute path where the app lives      e.g. /home/user/myapp.com
#   APP_NAME    — PM2 process name                       e.g. myapp.com
#   APP_PORT    — port Next.js listens on                e.g. 3000
#   DOMAIN      — public domain name                     e.g. myapp.com
#   LE_EMAIL    — Let's Encrypt / AutoSSL contact email  e.g. admin@example.com
#   BACKEND_URL — (optional) backend API base URL to proxy /api/v1/* to.
#                 e.g. https://api.myapp.com/api/v1/     (trailing slash required)
#                 Omit or leave empty when there is no external backend proxy.
# =============================================================================
set -euo pipefail

APP_DIR="${1:-/home/qverselearning/cdp.unizik.qverselearning.org}"
APP_NAME="${2:-cdp.unizik.qverselearning.org}"
APP_PORT="${3:-3800}"
DOMAIN="${4:-cdp.unizik.qverselearning.org}"
LE_EMAIL="${5:-support@qverselearning.com}"
BACKEND_URL="${6:-https://cdp.api.unizik.qverselearning.org/api/v1/}"   # optional — trailing slash required

ARCHIVE="next-deploy.tar.gz"
NGINX_CONF="/etc/nginx/conf.d/${DOMAIN}.conf"
ENV_FILE="${APP_DIR}/.env.production"

# ── Precompute backend proxy blocks ───────────────────────────────────────────
# Inserted into web server config heredocs below. All are empty strings when
# BACKEND_URL is not set — meaning the app has no /api/v1/ passthrough proxy.
_BACKEND_PROXY_BLOCK=""    # Apache ProxyPass pair
_HTACCESS_BACKEND_RULE=""  # .htaccess RewriteRule
_NGINX_BACKEND_LOC=""      # Nginx location block

if [[ -n "${BACKEND_URL}" ]]; then
    _BACKEND_PROXY_BLOCK="    # Proxy /api/v1/* to remote backend
    ProxyPass        /api/v1/ ${BACKEND_URL}
    ProxyPassReverse /api/v1/ ${BACKEND_URL}"

    _HTACCESS_BACKEND_RULE="
    # Proxy /api/v1/* to remote backend
    RewriteRule ^api/v1/(.*)\$ ${BACKEND_URL}\$1 [P,L]"

    _BACKEND_HOST=$(echo "${BACKEND_URL}" | sed -E 's|https?://([^/]+).*|\1|')
    _NGINX_BACKEND_LOC="    location /api/v1/ {
        proxy_pass            ${BACKEND_URL};
        proxy_ssl_server_name on;
        proxy_set_header      Host ${_BACKEND_HOST};
        proxy_set_header      X-Real-IP \$remote_addr;
        proxy_set_header      X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header      X-Forwarded-Proto \$scheme;
        proxy_read_timeout    30s;
        proxy_connect_timeout 10s;
    }
"
fi

echo "============================================"
echo "  Deploy  : ${APP_NAME}"
echo "  Dir     : ${APP_DIR}"
echo "  Port    : ${APP_PORT}"
echo "  Domain  : ${DOMAIN}"
echo "  Backend : ${BACKEND_URL:-none}"
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

# ── Detect environment ────────────────────────────────────────────────────────
# Determines: (1) which web server owns port 80, (2) whether this is cPanel.
# Config is written ONLY for this domain — all other vhosts are never touched.
DEPLOY_USER="$(whoami)"
IS_CPANEL=false
if [[ -d /usr/local/cpanel ]] || [[ -x /scripts/rebuildhttpdconf ]]; then
    IS_CPANEL=true
fi

WEBSERVER="nginx"  # default
_port80=$(sudo ss -tlnp 2>/dev/null | grep -E ' :80 | :80$' || true)
if echo "${_port80}" | grep -qiE '"httpd"|"apache2"'; then
    WEBSERVER="apache"
elif echo "${_port80}" | grep -qi '"nginx"'; then
    WEBSERVER="nginx"
else
    # Fallback when ss output lacks process names
    if sudo systemctl is-active httpd &>/dev/null 2>&1; then
        WEBSERVER="apache"
    fi
fi

# On cPanel, Apache is ALWAYS the app server (httpd on port 81/444) even when
# Nginx sits in front on port 80 as a reverse proxy. Override to apache.
if [[ "${IS_CPANEL}" == "true" ]]; then
    WEBSERVER="apache"
fi

echo "  Web server : ${WEBSERVER}"
echo "  cPanel env : ${IS_CPANEL}"

# =============================================================================
if [[ "${IS_CPANEL}" == "true" && "${WEBSERVER}" == "apache" ]]; then
# =============================================================================
# ── cPanel/CloudLinux: Apache vhost via cPanel userdata system ───────────────
#
# WHY userdata, not /etc/httpd/conf.d/:
#   cPanel regenerates /etc/httpd/conf.d/ from its own internal database on
#   every "rebuild". Any file written there directly is silently overwritten.
#   The supported, stable location for per-domain custom directives is:
#     /usr/local/apache/conf/userdata/std/2_4/<user>/<domain>/
#     /usr/local/apache/conf/userdata/ssl/2_4/<user>/<domain>/
#   cPanel includes these files verbatim inside the matching <VirtualHost>
#   block when it rebuilds httpd.conf. They are domain-scoped — touching
#   one domain's userdata directory never affects any other domain.
#
# The proxy directives below replace the default document-root file serving
# with a full proxy to the Next.js app, eliminating the .htaccess 403.

    CPANEL_STD_DIR="/usr/local/apache/conf/userdata/std/2_4/${DEPLOY_USER}/${DOMAIN}"
    CPANEL_SSL_DIR="/usr/local/apache/conf/userdata/ssl/2_4/${DEPLOY_USER}/${DOMAIN}"

    sudo mkdir -p "${CPANEL_STD_DIR}" "${CPANEL_SSL_DIR}"

    # Shared proxy content written to both HTTP and SSL vhost userdata
    write_proxy_conf() {
        local TARGET="$1"
        sudo tee "${TARGET}" > /dev/null <<PROXYEOF
# Managed by deploy-server.sh — do not edit manually.
# Proxies all traffic for ${DOMAIN} to Next.js on port ${APP_PORT}.
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests     Off

    # WebSocket support required by Next.js
    <IfModule mod_proxy_wstunnel.c>
        RewriteEngine On
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteRule ^/(.*) ws://127.0.0.1:${APP_PORT}/\$1 [P,L]
    </IfModule>

${_BACKEND_PROXY_BLOCK}

    # Proxy all other traffic → Next.js app on port ${APP_PORT}
    ProxyPass        / http://127.0.0.1:${APP_PORT}/
    ProxyPassReverse / http://127.0.0.1:${APP_PORT}/
</IfModule>
PROXYEOF
    }

    echo "Writing cPanel userdata proxy config for ${DOMAIN} (HTTP + SSL)..."
    write_proxy_conf "${CPANEL_STD_DIR}/nextjs-proxy.conf"
    write_proxy_conf "${CPANEL_SSL_DIR}/nextjs-proxy.conf"
    echo "✅ cPanel userdata written"

    # ── .htaccess in document root (APP_DIR IS the cPanel subdomain docroot) ───
    # Writing directly to APP_DIR — no guessing needed.
    # The archive also ships a .htaccess so it is present immediately on extract.
    HTACCESS="${APP_DIR}/.htaccess"
    echo "Writing ${HTACCESS}..."
    cat > "${HTACCESS}" <<HTEOF
# Managed by deploy-server.sh — do not edit manually.
# Proxies all requests for ${DOMAIN} to Next.js on port ${APP_PORT}.
Options -Indexes
DirectoryIndex disabled

<IfModule mod_rewrite.c>
    RewriteEngine On

    # Skip rewriting for .well-known (ACME/SSL challenges)
    RewriteRule ^\.well-known/ - [L]

    # WebSocket upgrade passthrough (required by Next.js)
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteRule ^(.*)$ ws://127.0.0.1:${APP_PORT}/\$1 [P,L]
${_HTACCESS_BACKEND_RULE}

    # Proxy everything else → Next.js app
    RewriteRule ^(.*)$ http://127.0.0.1:${APP_PORT}/\$1 [P,L]
</IfModule>
HTEOF
    chmod 644 "${HTACCESS}"
    echo "✅ .htaccess written to ${APP_DIR}"

    # ── Fix directory permissions so Apache can traverse to .htaccess ─────────
    # cPanel sets /home/<user> to 700 by default. Apache's worker process
    # (nobody/apache) cannot enter it, so it 403s before reading .htaccess.
    # 711 = owner has full access; group+other can traverse but NOT list — safe.
    # APP_DIR itself must be 755 so Apache can read files inside it.
    # These are scoped to this user's home and app dir only.
    sudo chmod 711 "$(dirname "${APP_DIR}")"   # /home/qverselearning  → 711
    chmod 755 "${APP_DIR}"                     # .../cdp.unizik...org  → 755
    chmod 644 "${APP_DIR}/.htaccess"
    echo "✅ Directory permissions fixed (711/755/644)"

    # Rebuild httpd.conf from all userdata, then gracefully reload Apache.
    # This regenerates the entire httpd.conf but every domain's config comes
    # from its own userdata — rebuilding does not change other domains.
    if [[ -x /scripts/rebuildhttpdconf ]]; then
        echo "Running /scripts/rebuildhttpdconf..."
        sudo /scripts/rebuildhttpdconf 2>/dev/null || true
    fi

    if sudo apachectl -t 2>&1 | grep -q "Syntax OK"; then
        sudo systemctl reload httpd 2>/dev/null || sudo service httpd reload
        echo "✅ Apache reloaded"
    else
        echo "❌ Apache config test failed — aborting deploy"
        sudo apachectl -t
        exit 1
    fi

    # ── SSL on cPanel ─────────────────────────────────────────────────────────
    # cPanel has AutoSSL (Let's Encrypt built-in). Running standalone certbot on
    # a cPanel server risks conflicting with cPanel's own cert renewal for ALL
    # domains on the server. Use cPanel's AutoSSL instead.
    echo ""
    echo "ℹ️  SSL ACTION REQUIRED (one-time, in cPanel UI):"
    echo "   cPanel → SSL/TLS → AutoSSL → Run AutoSSL for '${DOMAIN}'"
    echo "   Once issued, HTTPS will work automatically. Do NOT run certbot."
    echo ""

# =============================================================================
elif [[ "${WEBSERVER}" == "apache" ]]; then
# =============================================================================
# ── Plain Apache (no cPanel): full VirtualHost in /etc/httpd/conf.d/ ─────────
# Only writes /etc/httpd/conf.d/${DOMAIN}.conf — no other vhost is touched.

    APACHE_CONF="/etc/httpd/conf.d/${DOMAIN}.conf"
    echo "Writing Apache vhost ${APACHE_CONF}..."
    sudo tee "${APACHE_CONF}" > /dev/null <<APACHEEOF
<VirtualHost *:80>
    ServerName ${DOMAIN}

    ProxyPreserveHost On
    ProxyRequests     Off
    RequestHeader     set X-Forwarded-Proto "http"

    <IfModule mod_proxy_wstunnel.c>
        RewriteEngine On
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule ^/(.*) ws://127.0.0.1:${APP_PORT}/\$1 [P,L]
    </IfModule>

${_BACKEND_PROXY_BLOCK}

    ProxyPass        / http://127.0.0.1:${APP_PORT}/
    ProxyPassReverse / http://127.0.0.1:${APP_PORT}/
</VirtualHost>
APACHEEOF

    if sudo apachectl -t 2>&1 | grep -q "Syntax OK"; then
        sudo systemctl reload httpd 2>/dev/null || sudo service httpd reload
        echo "✅ Apache vhost written and reloaded"
    else
        echo "❌ Apache config test failed — aborting deploy"
        sudo apachectl -t
        exit 1
    fi

    if command -v certbot &>/dev/null; then
        if sudo certbot certificates 2>/dev/null | grep -q "Domains:.*${DOMAIN}"; then
            sudo certbot renew --apache --cert-name "${DOMAIN}" --non-interactive 2>/dev/null || true
        else
            sudo certbot --apache --non-interactive --agree-tos --redirect \
                -m "${LE_EMAIL}" -d "${DOMAIN}" 2>/dev/null || true
        fi
        echo "✅ SSL handled"
    fi

# =============================================================================
else
# =============================================================================
# ── Nginx vhost for THIS domain only ─────────────────────────────────────────
# Only /etc/nginx/conf.d/${DOMAIN}.conf is written. No other file is touched.

    echo "Writing ${NGINX_CONF}..."
    sudo tee "${NGINX_CONF}" > /dev/null <<NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

${_NGINX_BACKEND_LOC}
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

    # nginx -t validates ALL vhosts; reload is graceful — other sites keep serving
    if sudo nginx -t 2>&1; then
        sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload
        echo "✅ Nginx reloaded"
    else
        echo "❌ Nginx config test failed — aborting deploy"
        exit 1
    fi

    if command -v certbot &>/dev/null; then
        if sudo certbot certificates 2>/dev/null | grep -q "Domains:.*${DOMAIN}"; then
            sudo certbot renew --nginx --cert-name "${DOMAIN}" --non-interactive 2>/dev/null || true
        else
            sudo certbot --nginx --non-interactive --agree-tos --redirect \
                -m "${LE_EMAIL}" -d "${DOMAIN}" 2>/dev/null || true
        fi
        echo "✅ SSL handled"
    else
        echo "⚠️  Certbot not found — skipping SSL."
    fi

fi  # end web server detection

# ── Stop THIS app before installing deps ──────────────────────────────────────
# pm2 stop by name — only this process is affected
if pm2 list 2>/dev/null | grep -q "${APP_NAME}"; then
    echo "Stopping ${APP_NAME}..."
    pm2 stop "${APP_NAME}"
fi

# ── Fix node_modules ownership if previously installed as root ────────────────
# This happens when a prior deploy ran the script via "sudo -E bash".
# We must own node_modules before npm ci can safely remove/replace it.
if [[ -d "${APP_DIR}/node_modules" ]]; then
    NM_OWNER=$(stat -c '%U' "${APP_DIR}/node_modules" 2>/dev/null || echo "")
    CURRENT_USER=$(whoami)
    if [[ "${NM_OWNER}" != "${CURRENT_USER}" ]]; then
        echo "node_modules owned by '${NM_OWNER}', fixing ownership for '${CURRENT_USER}'..."
        sudo rm -rf "${APP_DIR}/node_modules"
        echo "✅ Stale root-owned node_modules removed"
    fi
fi

# ── Install production dependencies ──────────────────────────────────────────
echo "Installing production dependencies..."
npm ci --omit=dev || {
    echo "npm ci failed — cleaning node_modules and retrying..."
    sudo rm -rf node_modules
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