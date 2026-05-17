#!/usr/bin/env bash
set -euo pipefail
export PATH="$PATH:/root/.dotnet/tools"

source /etc/noobz-cord/generated.secrets

# Clone or update repo
if [[ -d /opt/noobz-cord/src/.git ]]; then
  cd /opt/noobz-cord/src && git pull
else
  git clone https://github.com/cagricesur/noobz-cord.git /opt/noobz-cord/src
fi

# Nginx configs
cp /opt/noobz-cord/src/deploy/nginx/livekit.noobzcord.com.conf /etc/nginx/sites-available/livekit.noobzcord.com
cp /opt/noobz-cord/src/deploy/nginx/noobzcord.com.conf /etc/nginx/sites-available/noobzcord.com
ln -sf /etc/nginx/sites-available/livekit.noobzcord.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/noobzcord.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# SSL (non-interactive)
certbot --nginx -d livekit.noobzcord.com --non-interactive --agree-tos --register-unsafely-without-email --redirect || true
certbot --nginx -d noobzcord.com -d www.noobzcord.com --non-interactive --agree-tos --register-unsafely-without-email --redirect || true

# App environment
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

# Build and publish
cd /opt/noobz-cord/src/Web/NC.Web/NC.Web.Client
npm ci
npm run build
mkdir -p ../NC.Web.Server/wwwroot
rm -rf ../NC.Web.Server/wwwroot/*
cp -r dist/* ../NC.Web.Server/wwwroot/

cd /opt/noobz-cord/src
dotnet ef database update --project NC.Entities --startup-project Web/NC.Web/NC.Web.Server
dotnet publish Web/NC.Web/NC.Web.Server/NC.Web.Server.csproj -c Release -o /var/noobz-cord/app

cp /opt/noobz-cord/src/deploy/noobzcord.service /etc/systemd/system/noobzcord.service
chown -R www-data:www-data /var/noobz-cord/app
systemctl daemon-reload
systemctl enable noobzcord
systemctl restart noobzcord

sleep 3
systemctl is-active noobzcord
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/ || true
echo ""
docker ps --format "table {{.Names}}\t{{.Status}}"
echo "Deploy app phase done."
