# Cambios

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
