#!/usr/bin/env bash
set -euo pipefail

export PATH="$PATH:/root/.dotnet/tools"
mkdir -p /opt/noobz-cord/postgres /opt/noobz-cord/livekit /opt/noobz-cord/src /var/noobz-cord/app /etc/noobz-cord

# dotnet-ef
if ! dotnet ef --version &>/dev/null; then
  dotnet tool install --global dotnet-ef
fi

# Secrets (generated once)
SECRETS_FILE=/etc/noobz-cord/generated.secrets
if [[ ! -f "$SECRETS_FILE" ]]; then
  DB_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
  JWT_SECRET=$(openssl rand -hex 32)
  LIVEKIT_KEYS=$(docker run --rm livekit/livekit-server:latest generate-keys 2>/dev/null || true)
  LIVEKIT_API_KEY=$(echo "$LIVEKIT_KEYS" | awk '/API Key:/ {print $3}')
  LIVEKIT_API_SECRET=$(echo "$LIVEKIT_KEYS" | awk '/API Secret:/ {print $3}')
  cat >"$SECRETS_FILE" <<EOF
DB_PASS=$DB_PASS
JWT_SECRET=$JWT_SECRET
LIVEKIT_API_KEY=$LIVEKIT_API_KEY
LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET
EOF
  chmod 600 "$SECRETS_FILE"
fi
source "$SECRETS_FILE"

# Postgres
if [[ ! -f /opt/noobz-cord/postgres/.env ]]; then
  cat >/opt/noobz-cord/postgres/.env <<EOF
POSTGRES_USER=noobz
POSTGRES_PASSWORD=$DB_PASS
POSTGRES_DB=NoobzCord
EOF
fi

git clone --depth 1 https://github.com/cagricesur/noobz-cord.git /opt/noobz-cord/src-tmp 2>/dev/null || true
if [[ -d /opt/noobz-cord/src-tmp/deploy/postgres ]]; then
  cp /opt/noobz-cord/src-tmp/deploy/postgres/docker-compose.yml /opt/noobz-cord/postgres/
  cp /opt/noobz-cord/src-tmp/deploy/livekit/docker-compose.yml /opt/noobz-cord/livekit/
fi
rm -rf /opt/noobz-cord/src-tmp

cd /opt/noobz-cord/postgres
docker compose up -d

# LiveKit config
cat >/opt/noobz-cord/livekit/livekit.yaml <<EOF
port: 7880
bind_addresses:
  - "127.0.0.1"
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 50100
  use_external_ip: true
keys:
  ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}
turn:
  enabled: true
  domain: livekit.noobzcord.com
  tls_port: 443
  external_tls: true
EOF

cd /opt/noobz-cord/livekit
docker compose up -d

echo "Bootstrap phase 1 done."
