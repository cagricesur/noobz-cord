#!/usr/bin/env bash
# Run once on a fresh Ubuntu 22.04/24.04 VPS as a user with sudo.
set -euo pipefail

echo "==> System update"
sudo apt update && sudo apt upgrade -y

echo "==> Base packages"
sudo apt install -y git curl wget nginx certbot python3-certbot-nginx ufw

echo "==> Firewall"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3478/udp
sudo ufw allow 50000:50100/udp
sudo ufw --force enable

echo "==> Docker"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "Log out and back in so the docker group applies, then re-run remaining steps."
fi

echo "==> .NET 10"
if ! command -v dotnet &>/dev/null; then
  wget "https://packages.microsoft.com/config/ubuntu/$(. /etc/os-release && echo "$VERSION_ID")/packages-microsoft-prod.deb" -O /tmp/packages-microsoft-prod.deb
  sudo dpkg -i /tmp/packages-microsoft-prod.deb
  sudo apt update
  sudo apt install -y dotnet-sdk-10.0 aspnetcore-runtime-10.0
fi

echo "==> Node.js 20"
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

echo "==> dotnet-ef"
if ! dotnet ef --version &>/dev/null 2>&1; then
  dotnet tool install --global dotnet-ef
  grep -q '.dotnet/tools' ~/.bashrc || echo 'export PATH="$PATH:$HOME/.dotnet/tools"' >> ~/.bashrc
fi

echo "==> Directories"
sudo mkdir -p /opt/noobz-cord/postgres /opt/noobz-cord/livekit /var/noobz-cord/app /etc/noobz-cord

echo "Baseline setup done. Configure postgres, livekit, clone repo, and nginx next."
