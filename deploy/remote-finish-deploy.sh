#!/usr/bin/env bash
set -euo pipefail
export PATH="$PATH:/root/.dotnet/tools"
source /etc/noobz-cord/generated.secrets

if ! dotnet ef --version &>/dev/null; then
  dotnet tool install --global dotnet-ef
fi

cd /opt/noobz-cord/src
dotnet ef database update --project NC.Entities --startup-project Web/NC.Web/NC.Web.Server
dotnet publish Web/NC.Web/NC.Web.Server/NC.Web.Server.csproj -c Release -o /var/noobz-cord/app

cp /opt/noobz-cord/src/deploy/noobzcord.service /etc/systemd/system/noobzcord.service
chown -R www-data:www-data /var/noobz-cord/app
systemctl daemon-reload
systemctl enable noobzcord
systemctl restart noobzcord

sleep 4
systemctl status noobzcord --no-pager || true
curl -s -o /dev/null -w "local_http=%{http_code}\n" http://127.0.0.1:5000/

certbot --nginx -d noobzcord.com -d www.noobzcord.com --non-interactive --agree-tos --register-unsafely-without-email --redirect

echo "Finish deploy done."
