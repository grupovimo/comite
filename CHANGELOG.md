# Cambios

## 0.2.0 — 2026-11-20
- `scripts/preparar.sh`: crea la copia limpia, copia el flujo y deja el `.gitignore` en un solo paso, e imprime los argumentos para Workflow. `scripts/limpiar.sh` borra la copia y su rama sólo si ya está integrada.
- Techo duro de agentes por escala (25, 55 y 105 en el peor caso), comprobado en la simulación. La verificación individual tiene su propio tope y el resto va en lotes.
- Si hay un presupuesto de tokens y queda poco, toda la verificación va en lotes.
- El mapa y el juez se reintentan una vez si no devuelven nada. Si la deduplicación devuelve vacío, se usan los hallazgos crudos.
- En la copia limpia se ignora todo `.comite/`, así nada del comité entra a los commits.
- Plantillas de issues.

## 0.1.1 — 2026-11-20
- El instalador remoto fallaba en algunos shells (`Bajando comite $REF…`). Ahora el CI prueba también la instalación remota.

## 0.1.0 — 2026-11-20

Primera versión pública.

**Modo plan**
- 8 ángulos, un juez y un contrajuez opcional.
- Veredicto *construir / ajustar / no construir*, con el plan corregido.

**Modo revisión**
- Mapa del repo y catálogo de 21 ángulos según las superficies, con cupos por familia y ángulos obligatorios.
- Una sola instancia levantada, con capturas base en claro, oscuro y 375 px, que se baja siempre.
- Pruebas de base en paralelo con el comité.
- Deduplicado y verificación escéptica según la severidad, con lotes para media y baja. La existencia decide; criticar el arreglo sólo lo corrige.
- Arreglos por área según el archivo, vueltas de control y crítico de completitud.
- Veredicto calculado sin agentes.
- Informe `.md` y `.json` en el repo principal; se puede retomar con `desde`.

**Para todos los modos**
- Perfil y lecciones: se suman el global y el del repo, y el del repo se lee de la rama base.
- Reglas que no se negocian, por encima del perfil.
- Plugin de Claude Code, instalador con versión fija y copia de respaldo, y modo sin Workflow.
