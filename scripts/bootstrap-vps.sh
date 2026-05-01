#!/usr/bin/env bash
# =============================================================================
# bootstrap-vps.sh — One-time VPS setup for cdp.unizik.qverselearning.org
# -----------------------------------------------------------------------------
# Run ONCE on a fresh VPS before the first deploy, then never again.
# SAFE: completely idempotent — re-running is harmless.
# SCOPE: only installs missing global tools (Node, PM2, Nginx, Certbot).
#        Does NOT modify other apps, other Nginx vhosts, or other PM2 processes.
#
# Usage:
#   bash scripts/bootstrap-vps.sh [deploy-user]
#
# Prerequisite: The SSH user must have passwordless sudo for apt, nginx,
#   certbot, npm, and systemctl commands.
# =============================================================================
set -euo pipefail

DEPLOY_USER="${1:-$(whoami)}"

echo "============================================"
echo "  VPS Bootstrap"
echo "  User: ${DEPLOY_USER}"
echo "============================================"

# ── Node.js 22 ────────────────────────────────────────────────────────────────
NODE_MAJOR=$(node -e "process.stdout.write(process.version.split('.')[0].replace('v',''))" 2>/dev/null || echo "0")
if [[ "${NODE_MAJOR}" -lt 22 ]]; then
    echo "Installing Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js $(node -v) installed"
else
    echo "✅ Node.js $(node -v) already installed"
fi

# ── PM2 ───────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
    echo "Installing PM2 globally..."
    sudo npm install -g pm2
    echo "✅ PM2 $(pm2 -v) installed"
else
    echo "✅ PM2 $(pm2 -v) already installed"
fi

# ── PM2 systemd startup (current user) ───────────────────────────────────────
# Only registers the service if it isn't already active.
# This ensures PM2 restarts on server reboot — no other services are touched.
PM2_SERVICE="pm2-${DEPLOY_USER}"
if ! systemctl is-enabled "${PM2_SERVICE}" &>/dev/null; then
    echo "Registering PM2 startup service for user '${DEPLOY_USER}'..."
    PM2_STARTUP_CMD=$(pm2 startup 2>/dev/null | grep -E "^sudo " | head -1 || true)
    if [[ -n "${PM2_STARTUP_CMD}" ]]; then
        eval "${PM2_STARTUP_CMD}"
        echo "✅ PM2 startup service registered"
    else
        echo "⚠️  Could not auto-register PM2 startup. Run 'pm2 startup' manually."
    fi
else
    echo "✅ PM2 startup service already registered"
fi

# ── Nginx ─────────────────────────────────────────────────────────────────────
if ! command -v nginx &>/dev/null; then
    echo "Installing Nginx..."
    sudo apt-get update -y
    sudo apt-get install -y nginx
fi
sudo systemctl enable nginx &>/dev/null || true
sudo systemctl start  nginx &>/dev/null || true
echo "✅ Nginx is running"

# ── Certbot (with Nginx plugin) ───────────────────────────────────────────────
if ! command -v certbot &>/dev/null; then
    echo "Installing Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
    echo "✅ Certbot installed"
else
    echo "✅ Certbot already installed"
fi

# ── ACME challenge webroot ────────────────────────────────────────────────────
sudo mkdir -p /var/www/html/.well-known/acme-challenge
echo "✅ ACME challenge directory ready"

# ── Port 80 conflict check ────────────────────────────────────────────────────
# If Apache (or anything else) is already bound to port 80, Nginx cannot start
# on that port and requests will be served by the wrong process.
# This script will NOT touch Apache — it only warns so you can act safely.
if sudo ss -tlnp 2>/dev/null | grep ':80' | grep -qiv nginx; then
    echo ""
    echo "⚠️  WARNING: Something other than Nginx is listening on port 80:"
    sudo ss -tlnp 2>/dev/null | grep ':80' || true
    echo ""
    echo "   If it is Apache serving this domain, disable only its default vhost"
    echo "   (this does NOT affect other Apache-hosted sites on this server):"
    echo ""
    echo "     sudo a2dissite 000-default.conf"
    echo "     sudo systemctl reload apache2"
    echo ""
    echo "   After that, Nginx will take over port 80 and proxy to Next.js."
    echo ""
fi

echo ""
echo "============================================"
echo "  ✅ Bootstrap complete!"
echo "  The server is ready for app deployments."
echo "============================================"
