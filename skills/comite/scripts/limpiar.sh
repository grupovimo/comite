#!/bin/sh
# Borra la copia limpia de una revisión ya integrada (o descartada). Los informes quedan en el repo principal.
#   limpiar.sh <carpeta-del-worktree> [--forzar]
# Sin --forzar, se niega si hay cambios sin commitear o si la rama no está integrada en la rama actual del repo principal.
set -eu
CARPETA="${1:?falta la carpeta del worktree}"
COMUN="$(git -C "$CARPETA" rev-parse --path-format=absolute --git-common-dir)"
REPO="$(dirname "$COMUN")"
RAMA="$(git -C "$CARPETA" rev-parse --abbrev-ref HEAD)"
if [ "${2:-}" != "--forzar" ]; then
  [ -z "$(git -C "$CARPETA" status --porcelain --untracked-files=no)" ] || { echo "comite: hay cambios sin commitear en $CARPETA" >&2; exit 1; }
  git -C "$REPO" merge-base --is-ancestor "$RAMA" HEAD || { echo "comite: $RAMA no está integrada en $(git -C "$REPO" rev-parse --abbrev-ref HEAD); usá --forzar si la descartás" >&2; exit 1; }
fi
git -C "$REPO" worktree remove --force "$CARPETA"
case "$RAMA" in comite-*) git -C "$REPO" branch -D "$RAMA" >/dev/null ;; esac
echo "Listo: se borró $CARPETA y la rama $RAMA"
