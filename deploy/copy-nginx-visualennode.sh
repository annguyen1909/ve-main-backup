#!/usr/bin/env bash
set -euo pipefail

# Helper script: copy nginx config to remote server and enable it
# Edit REMOTE_USER and REMOTE_HOST at the top, then run locally:
# ./deploy/copy-nginx-visualennode.sh

# Update these to match your target server. For DO use something like root@visualennode.com
REMOTE_USER="root"
REMOTE_HOST="visualennode.com"
# Optional: if your SSH listens on a non-standard port, set SSH_PORT (leave empty to use default)
SSH_PORT=""
# Optional: specify an identity file to use for scp/ssh (e.g. -i /path/to/key). Leave empty to use default ssh agent.
SSH_IDENTITY_FILE=""
LOCAL_CONF_PATH="deploy/nginx/visualennode.conf"
REMOTE_TMP_PATH="/tmp/visualennode.conf"
REMOTE_CONF_PATH="/etc/nginx/sites-available/visualennode"
REMOTE_ENABLED_PATH="/etc/nginx/sites-enabled/visualennode"

if [ ! -f "$LOCAL_CONF_PATH" ]; then
  echo "Local nginx config not found: $LOCAL_CONF_PATH"
  exit 1
fi

SSH_OPTS=()
if [ -n "$SSH_PORT" ]; then
  SSH_OPTS+=( -P "$SSH_PORT" )
fi
SCP_CMD=(scp)
SSH_CMD=(ssh)
if [ -n "$SSH_IDENTITY_FILE" ]; then
  SCP_CMD+=( -i "$SSH_IDENTITY_FILE" )
  SSH_CMD+=( -i "$SSH_IDENTITY_FILE" )
fi
if [ -n "$SSH_PORT" ]; then
  SCP_CMD+=( -P "$SSH_PORT" )
  SSH_CMD+=( -p "$SSH_PORT" )
fi

echo "Copying $LOCAL_CONF_PATH to $REMOTE_USER@$REMOTE_HOST:$REMOTE_TMP_PATH"
"${SCP_CMD[@]}" "$LOCAL_CONF_PATH" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_TMP_PATH"

echo "Moving into place, enabling site and reloading nginx on remote host"
ssh "$REMOTE_USER@$REMOTE_HOST" bash -lc $'\
  set -e\n\
  echo "Backing up any existing remote config (if present)"\n\
  if [ -f "'"${REMOTE_CONF_PATH}"'" ]; then sudo cp "'"${REMOTE_CONF_PATH}"'" "'"${REMOTE_CONF_PATH}"'".bak.$(date +%F-%H%M%S) || true; fi\n\
  sudo mv "'"${REMOTE_TMP_PATH}"'" "'"${REMOTE_CONF_PATH}"'"\n\
  sudo ln -sf "'"${REMOTE_CONF_PATH}"'" "'"${REMOTE_ENABLED_PATH}"'"\n\
  sudo nginx -t\n\
  sudo systemctl reload nginx\n'

echo "Remote nginx config deployed and reloaded. Verify with: ssh $REMOTE_USER@$REMOTE_HOST 'sudo nginx -t && sudo systemctl status nginx'"

echo "Reminder: Do NOT change api.visualennode.com DNS/records unless you intend to. This script only modifies the visualennode site on the target server."
