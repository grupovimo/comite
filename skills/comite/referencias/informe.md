# Forma del informe

**Dónde queda.** En `.comite/informes/` del **repo principal**, no en el worktree, así sobrevive a la limpieza. Cada corrida deja dos archivos:
- `<fecha>-<etiqueta>-revision.md` o `<fecha>-<etiqueta>-plan.md`: para que una persona decida en dos minutos.
- `<fecha>-<etiqueta>-revision.json`: el resultado completo con todos los hallazgos confirmados. Sirve para retomar con `desde`.

**Qué no se versiona.** El `.comite/.gitignore` interno deja afuera informes, capturas y flujos copiados; sólo se versionan `perfil.md` y `lecciones.md`. Si querés el historial en git, sacá `informes/` de ese ignore.

## Revisión
```markdown
# Comité 2026-11-20 — aprobar con reservas
Se arreglaron los 2 bloqueantes; queda una pregunta sobre el menú y Android sin compilar.

**7 ángulos · 23 confirmados · 19 arreglados · 11 descartados · 31 agentes · visto en vivo**

## Para decidir
- [alta] Mover «Citas» al menú secundario. Toca una decisión protegida. Propuesta: …

## Arreglado
| Hallazgo | Severidad | Commit | Antes / después |
|---|---|---|---|

## No arreglado
## No cubierto
(lo grave primero; aparte, «pendiente fuera del comité»)
## Pruebas
## Descartado
## Lecciones propuestas
```

## Plan
```markdown
# Comité previo 2026-11-20 — ajustar
<resumen>

## Para decidir
## Cambios al plan
## Riesgos
## Votos
| Ángulo | Veredicto | Por qué |
|---|---|---|
## Descartado
## Plan corregido
```

## Lo que devuelve el flujo

**Revisión:**
- `veredicto`, `informe`, `datos`, `escala`, `base`
- `angulos`, `quedaronAfuera`, `recortados`, `enVivo`
- `pruebas`, `confirmados`, `arreglados`, `noArreglados`
- `preguntas`, `descartados`, `conflictos`, `control`
- `noCubierto`, `leccionesPropuestas`
- `agentes`: cuántos agentes se usaron en cada fase

**Plan:**
- `veredicto`, `resumen`, `cambios`, `preguntas`, `riesgos`
- `descartadas`, `planCorregido`, `votos`
- `correccionesDelContrajuez`, `informe`, `agentes`
