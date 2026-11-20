#!/bin/sh
# Prueba preparar.sh y limpiar.sh en un repo desechable.
set -eu
P="$(cd "$(dirname "$0")/.." && pwd)/skills/comite/scripts"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
mkdir -p "$T/repo" "$T/sesion"
cd "$T/repo" && git init -q -b main && mkdir .comite && echo p > .comite/perfil.md && echo a > a && git add -A && git -c user.name=t -c user.email=t@t commit -qm uno
cd "$T/sesion"
falla() { echo "MAL: $1"; exit 1; }

sh "$P/preparar.sh" plan | grep -q '"scriptPath":".*/.comite/.flujos/plan.js"' || falla "plan no copió el flujo"
out="$(sh "$P/preparar.sh" revision "$T/repo" "tema raro!")"
C="$(node -p 'JSON.parse(process.argv[1]).carpeta' "$out")"
node -e 'const o=JSON.parse(process.argv[1]); if(!/^[0-9a-f]{40}$/.test(o.base)||o.etiqueta!=="tema-raro") process.exit(1)' "$out" || falla "JSON de revisión"
[ -f .comite/.flujos/revision.js ] || falla "no copió el flujo de revisión"
[ -z "$(git -C "$C" status --porcelain)" ] || falla "la copia limpia no quedó limpia"
sh "$P/preparar.sh" revision "$T/repo" "tema raro!" 2>/dev/null && falla "dejó pisar una copia existente"
echo b > "$C/b" && git -C "$C" add b && git -C "$C" -c user.name=t -c user.email=t@t commit -qm dos
sh "$P/limpiar.sh" "$C" 2>/dev/null && falla "borró una rama sin integrar"
git -C "$T/repo" merge -q --no-edit comite-tema-raro
sh "$P/limpiar.sh" "$C" >/dev/null || falla "no limpió una rama integrada"
[ ! -e "$C" ] && ! git -C "$T/repo" show-ref --quiet refs/heads/comite-tema-raro || falla "quedaron restos"
echo "scripts: ok"
