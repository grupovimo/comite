#!/bin/sh
# Instala la skill «comite» para Claude Code.
#   curl -fsSL https://raw.githubusercontent.com/grupovimo/comite/main/install.sh | sh
#   … | sh -s -- --proyecto        sólo en el repo actual (.claude/skills)
#   COMITE_REF=v0.1.0 … | sh       una versión fija (por defecto, la última publicada)
set -eu
REPO="${COMITE_REPO:-grupovimo/comite}"
DESTINO="$HOME/.claude/skills"
[ "${1:-}" = "--proyecto" ] && DESTINO="$(pwd)/.claude/skills"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

case "$0" in *install.sh) LOCAL="$(cd "$(dirname "$0")" && pwd)/skills/comite" ;; *) LOCAL="" ;; esac
if [ -n "$LOCAL" ] && [ -f "$LOCAL/SKILL.md" ] && [ -z "${COMITE_REF:-}" ]; then
  ORIGEN="$LOCAL"   # corrido desde un clon del repo
else
  REF="${COMITE_REF:-}"
  if [ -z "$REF" ]; then
    REF="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" 2>/dev/null | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -1)"
    [ -n "$REF" ] || REF=main
  fi
  echo "Bajando comite $REF…"
  curl -fsSL "https://github.com/$REPO/archive/$REF.tar.gz" | tar -xz -C "$TMP"
  ORIGEN="$(find "$TMP" -maxdepth 3 -type d -path '*/skills/comite' | head -1)"
fi
[ -n "$ORIGEN" ] && [ -f "$ORIGEN/SKILL.md" ] || { echo "comite: no encontré la skill" >&2; exit 1; }

mkdir -p "$DESTINO"
if [ -e "$DESTINO/comite" ] || [ -L "$DESTINO/comite" ]; then
  rm -rf "$DESTINO/comite.bak"
  mv "$DESTINO/comite" "$DESTINO/comite.bak"
  echo "La instalación anterior quedó en $DESTINO/comite.bak"
fi
cp -R "$ORIGEN" "$DESTINO/comite"
echo "Listo: skill instalada en $DESTINO/comite"
echo "Siguiente paso: armá tu perfil a partir de $DESTINO/comite/referencias/perfil.md"
echo "y guardalo en .comite/perfil.md (por repo) o en ~/.claude/comite/perfil.md (para todos)."
