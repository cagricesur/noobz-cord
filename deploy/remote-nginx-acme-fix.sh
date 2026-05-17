#!/usr/bin/env bash
set -euo pipefail

cat >/etc/nginx/sites-available/noobzcord.com <<'NGINX'
server {
    listen 80;
    server_name noobzcord.com www.noobzcord.com;

    location ^~ /.well-known/acme-challenge/ {
        alias /var/www/certbot/.well-known/acme-challenge/;
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

nginx -t && systemctl reload nginx
curl -s http://127.0.0.1/.well-known/acme-challenge/testfile -H 'Host: noobzcord.com'
echo ""

certbot certonly --webroot -w /var/www/certbot \
  -d noobzcord.com -d www.noobzcord.com \
  --non-interactive --agree-tos --register-unsafely-without-email

certbot --nginx -d noobzcord.com -d www.noobzcord.com \
  --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo NGINX_SSL_OK
