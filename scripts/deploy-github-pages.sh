#!/usr/bin/env bash
# Publica dist/ em GitHub Pages (HTTPS). Origem estável do iPod.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

origin="$(git remote get-url origin 2>/dev/null || true)"
if [[ -z "$origin" ]]; then
  echo "sem remote origin" >&2
  exit 1
fi

node scripts/build.js

tmp="$(mktemp -d)"
cleanup() { rm -rf "$tmp"; }
trap cleanup EXIT

cp -a dist/. "$tmp/"
touch "$tmp/.nojekyll"
git -C "$tmp" init -q -b gh-pages
git -C "$tmp" add -A
git -C "$tmp" \
  -c user.name="$(git config user.name)" \
  -c user.email="$(git config user.email)" \
  commit -q -m "deploy habitos $(date -Iseconds)"
git -C "$tmp" remote add origin "$origin"
git -C "$tmp" push -u origin gh-pages
echo "deploy: branch gh-pages enviada"
