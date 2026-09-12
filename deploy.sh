#!/usr/bin/env bash
set -e

echo "======================================================"
echo "[LibertApp] Iniciando deploy automatizado via GitHub"
echo "======================================================"

APP_DIR="/home/ubuntu/apps/LibertApp"
cd "$APP_DIR"

echo "[1/5] Buscando as alteracoes mais recentes no GitHub (main)..."
git fetch origin main
git reset --hard origin/main

echo "[2/5] Configurando permissoes de execucao..."
chmod +x deploy.sh 2>/dev/null || true

echo "[3/5] Reconstruindo imagens dos containers..."
docker compose build

echo "[4/5] Atualizando servicos com Docker Compose..."
docker compose up -d --remove-orphans

echo "[5/5] Limpando imagens orfas..."
docker image prune -f

echo "======================================================"
echo "[LibertApp] Deploy concluido com sucesso!"
echo "URL da Aplicacao: https://libertapp.tccodes.com.br"
echo "======================================================"
docker compose ps
