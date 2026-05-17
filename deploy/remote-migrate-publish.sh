#!/usr/bin/env bash
set -euo pipefail
export PATH="$PATH:/root/.dotnet/tools"

DB_PASS=$(grep '^POSTGRES_PASSWORD=' /opt/noobz-cord/postgres/.env | cut -d= -f2)
CONN="Host=127.0.0.1;Port=5432;Database=NoobzCord;Username=noobz;Password=${DB_PASS}"

cd /opt/noobz-cord/src
dotnet ef database update \
  --project NC.Entities \
  --startup-project Web/NC.Web/NC.Web.Server \
  --connection "$CONN"

dotnet publish Web/NC.Web/NC.Web.Server/NC.Web.Server.csproj -c Release -o /var/noobz-cord/app

cp deploy/noobzcord.service /etc/systemd/system/noobzcord.service
chown -R www-data:www-data /var/noobz-cord/app
systemctl daemon-reload
systemctl enable noobzcord
systemctl restart noobzcord

sleep 4
systemctl is-active noobzcord
curl -s -o /dev/null -w "http_code=%{http_code}\n" http://127.0.0.1:5000/

certbot --nginx -d noobzcord.com -d www.noobzcord.com --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo DONE
