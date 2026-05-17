#!/usr/bin/env bash
set -euo pipefail

# Fix ACME webroot (root, not alias)
cat >/etc/nginx/sites-available/noobzcord.com <<'NGINX'
server {
    listen 80;
    server_name noobzcord.com www.noobzcord.com;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        default_type text/plain;
    }

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX

# Stop LiveKit binding :443 so nginx can terminate TLS for both domains
source /etc/noobz-cord/generated.secrets
cat >/opt/noobz-cord/livekit/livekit.yaml <<LK
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
  external_tls: true
LK

cd /opt/noobz-cord/livekit && docker compose restart

sleep 3
nginx -t && systemctl reload nginx

mkdir -p /var/www/certbot/.well-known/acme-challenge
echo test-acme > /var/www/certbot/.well-known/acme-challenge/ping
curl -sf http://127.0.0.1/.well-known/acme-challenge/ping -H 'Host: noobzcord.com' | grep test-acme

certbot certonly --webroot -w /var/www/certbot \
  -d noobzcord.com -d www.noobzcord.com \
  --non-interactive --agree-tos --register-unsafely-without-email

# HTTPS for main app
cat >/etc/nginx/sites-available/noobzcord.com <<'NGINX'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name noobzcord.com www.noobzcord.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name noobzcord.com www.noobzcord.com;

    ssl_certificate /etc/letsencrypt/live/noobzcord.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/noobzcord.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX

# HTTPS for LiveKit (proxy to local signaling)
cat >/etc/nginx/sites-available/livekit.noobzcord.com <<'NGINX'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name livekit.noobzcord.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name livekit.noobzcord.com;

    ssl_certificate /etc/letsencrypt/live/livekit.noobzcord.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/livekit.noobzcord.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:7880;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX

nginx -t && systemctl reload nginx

# Sync env with DB password
DB_PASS=$(grep '^POSTGRES_PASSWORD=' /opt/noobz-cord/postgres/.env | cut -d= -f2)
source /etc/noobz-cord/generated.secrets
cat >/etc/noobz-cord/env <<EOF
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://127.0.0.1:5000
ConnectionStrings__NoobzCord=Host=127.0.0.1;Port=5432;Database=NoobzCord;Username=noobz;Password=${DB_PASS}
JwtSettings__Secret=${JWT_SECRET}
JwtSettings__Issuer=NoobzCord
JwtSettings__Audience=NoobzCord
JwtSettings__Expiration=1800
LiveKitSettings__Server=wss://livekit.noobzcord.com
LiveKitSettings__ApiKey=${LIVEKIT_API_KEY}
LiveKitSettings__ApiSecret=${LIVEKIT_API_SECRET}
LiveKitSettings__RoomName=NoobzCord
SmtpSettings__UserName=
SmtpSettings__Password=
SmtpSettings__Host=smtp.gmail.com
SmtpSettings__Port=587
EOF
chmod 600 /etc/noobz-cord/env
systemctl restart noobzcord

ss -tlnp | grep ':443' || true
curl -sf -o /dev/null -w "https_app=%{http_code}\n" https://noobzcord.com/
curl -sf -o /dev/null -w "https_lk=%{http_code}\n" https://livekit.noobzcord.com/
echo SSL_FINAL_OK
