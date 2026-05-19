#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/noobz-cord/src}"
PUBLISH_DIR="${PUBLISH_DIR:-/var/noobz-cord/app}"

cd "$REPO_DIR"
git pull

cd Web/NC.Web/NC.Web.Client
npm ci
npm run build
rm -rf ../NC.Web.Server/wwwroot/*
cp -r dist/* ../NC.Web.Server/wwwroot/

cd "$REPO_DIR"
#!dotnet ef database update \
#!  --project NC.Entities \
#!  --startup-project Web/NC.Web/NC.Web.Server

dotnet publish Web/NC.Web/NC.Web.Server/NC.Web.Server.csproj \
  -c Release -o "$PUBLISH_DIR"

sudo chown -R www-data:www-data "$PUBLISH_DIR"
sudo systemctl restart noobzcord

echo "Deploy complete."
