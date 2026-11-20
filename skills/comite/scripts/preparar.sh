#!/bin/sh
# Prepara una corrida del comité, desde el directorio de trabajo de la sesión.
#   preparar.sh plan                              copia el flujo de plan
#   preparar.sh revision <repo> <tema> [ref]      además crea la copia limpia (worktree) desde ref (por defecto HEAD)
# Imprime una línea JSON con lo que hay que pasarle a Workflow.
# COMITE_WORKTREES elige dónde van las copias (por defecto, <padre del repo>/.wt).
set -eu
MODO="${1:-}"
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
case "$MODO" in plan|revision) ;; *) echo "uso: preparar.sh plan | revision <repo> <tema> [ref]" >&2; exit 2 ;; esac

mkdir -p .comite/.flujos
cp -f "$SKILL/flujos/$MODO.js" .comite/.flujos/
[ -f .comite/.gitignore ] || printf '*\n!.gitignore\n!perfil.md\n!lecciones.md\n' > .comite/.gitignore
FLUJO="$(pwd)/.comite/.flujos/$MODO.js"
FECHA="$(date +%Y-%m-%d)"

if [ "$MODO" = plan ]; then
  printf '{"scriptPath":"%s","fecha":"%s"}\n' "$FLUJO" "$FECHA"
  exit 0
fi

REPO="${2:?falta el repo}"; TEMA="${3:?falta el tema}"; REF="${4:-HEAD}"
REPO="$(git -C "$REPO" rev-parse --show-toplevel)"
TEMA="$(printf '%s' "$TEMA" | tr -c 'A-Za-z0-9._-' '-' | sed 's/-*$//')"
RAIZ="${COMITE_WORKTREES:-$(dirname "$REPO")/.wt}"
CARPETA="$RAIZ/$(basename "$REPO")-comite-$TEMA"
RAMA="comite-$TEMA"
[ -e "$CARPETA" ] && { echo "comite: ya existe $CARPETA; borrala con limpiar.sh o elegí otro tema" >&2; exit 1; }
git -C "$REPO" show-ref --quiet "refs/heads/$RAMA" && { echo "comite: ya existe la rama $RAMA; elegí otro tema" >&2; exit 1; }
mkdir -p "$RAIZ"
git -C "$REPO" worktree add -q -b "$RAMA" "$CARPETA" "$REF"
BASE="$(git -C "$CARPETA" rev-parse HEAD)"
mkdir -p "$CARPETA/.comite"
# En la copia limpia se ignora todo .comite/, también este archivo: nada del comité entra a sus commits.
# (perfil.md y lecciones.md ya versionados siguen versionados; el comité los lee de la base).
[ -f "$CARPETA/.comite/.gitignore" ] || printf '*\n' > "$CARPETA/.comite/.gitignore"
printf '{"scriptPath":"%s","carpeta":"%s","base":"%s","fecha":"%s","etiqueta":"%s","rama":"%s"}\n' "$FLUJO" "$CARPETA" "$BASE" "$FECHA" "$TEMA" "$RAMA"
