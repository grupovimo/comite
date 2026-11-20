# comite

**Un comité de agentes para Claude Code que revisa tu trabajo como lo haría un estudio de primer nivel**, antes de construir y antes de entregar.

*English summary below.*

Cuando trabajás rápido con agentes, lo caro no es escribir el código: es iterar diez veces sobre algo que no hacía falta, o que llegó roto a las personas. `comite` pone un filtro en cada punta.

- **Antes de construir (`plan`).** Ocho miradas discuten el plan contra tu repo:
  - producto: ¿hace falta?
  - dos usuarios escépticos
  - un abogado del diablo, que busca la versión más simple
  - diseño
  - seguridad y privacidad
  - negocio y costos
  - arquitectura

  Un juez decide si se construye, se ajusta o no se construye, y te devuelve el plan corregido.
- **Después de construir (`revision`).** Corre sobre una copia limpia del repo:
  - Un mapa detecta qué tiene el producto: web, apps, pagos, IA, datos personales…
  - Se levanta una sola instancia con datos realistas y se capturan las pantallas a 375 px, en claro y en oscuro.
  - Corren en paralelo los ángulos que aplican, de un catálogo de 21.
  - Escépticos intentan refutar cada hallazgo.
  - Un desarrollador por área arregla lo confirmado, con commits chicos.
  - Las vueltas de control revisan esos arreglos y corren todas las pruebas.
  - Al final queda un informe con veredicto: *aprobar*, *aprobar con reservas* o *bloquear*.

Nada se recorta en silencio: lo que no se miró figura en el informe como «no cubierto», y el costo de cada corrida queda medido.

## Requisitos

- **[Claude Code](https://claude.com/claude-code) con la herramienta Workflow**, que orquesta varios agentes. Para saber si la tenés, preguntale a Claude «¿tenés la herramienta Workflow?». Sin ella, la skill corre un **modo reducido**: pocos ángulos con subagentes comunes y sin arreglos.
- Para el modo revisión, un repo de git: el comité trabaja sobre un worktree.

## Instalar

Como plugin de Claude Code (recomendado):
```
/plugin marketplace add grupovimo/comite
/plugin install comite@comite
```

O con el instalador, que baja la última versión publicada:
```sh
curl -fsSL https://raw.githubusercontent.com/grupovimo/comite/main/install.sh | sh
```
- Queda en `~/.claude/skills/comite`.
- `… | sh -s -- --proyecto` lo instala sólo en el repo actual.
- `COMITE_REF=v0.1.0` fija una versión.
- Si ya había una instalación, se guarda como `comite.bak`.

También está el `comite.zip` de [Releases](https://github.com/grupovimo/comite/releases), para descomprimir en `~/.claude/skills/`.

## Usar

En Claude Code, con tus palabras:

> Pasá este plan por el comité antes de empezar.
> Revisá con el comité los cambios de hoy antes de mergear.
> Auditá la app entera con el comité, escala completa.

Claude arma la copia limpia, corre el flujo, lee el informe y te trae el veredicto, lo que tenés que decidir y las lecciones propuestas. Integrar y desplegar queda en tus manos.

## Hacelo tuyo: el perfil

El comité rinde de verdad cuando conoce a tu equipo. Escribí un `.comite/perfil.md` en el repo, o `~/.claude/comite/perfil.md` para todos tus proyectos, a partir de [la plantilla](skills/comite/referencias/perfil.md). Ahí van:

- **Estándar y diseño:** qué es «terminado», dónde están los diseños de referencia.
- **Usuarios:** de ahí salen las personas que prueban el producto.
- **Cómo levantar y probar**, y el **entorno de prueba**.
- **Ángulos obligatorios:** los que corren siempre, como el modo oscuro.
- **Decisiones protegidas:** el comité nunca las cambia; vuelven como pregunta.
- **Reglas por ángulo:** las trampas de tu stack.

Hay ejemplos completos para un [SaaS web](skills/comite/ejemplos/perfil-saas-web.md) y para [apps nativas](skills/comite/ejemplos/perfil-apps-nativas.md).

Al lado del perfil va `.comite/lecciones.md`. Cada informe propone lecciones («esto se nos escapó, revisarlo siempre»); las que aprobás se inyectan en todas las corridas siguientes, y si nombran un ángulo, ese ángulo pasa a correr siempre. Así el comité aprende de sus errores.

## Escalas y costo

| Escala | Plan | Revisión | Agentes |
|---|---|---|---|
| `rapida` | 4 ángulos + juez | 3 ángulos, sin arreglos | 6 / 8–14 |
| `media` | 8 ángulos + juez | 7 ángulos, arreglos, 1 vuelta de control | 10 / 18–45 |
| `completa` | + contrajuez | todos los que aplican, hasta 2 vueltas | 11 / 40–110 |

- **Topes:** cada ángulo tiene un máximo de hallazgos (5, 8 o 12).
- **Verificación:** los bloqueantes se verifican con hasta tres escépticos cada uno; las medias y bajas van en lotes por área.
- **Costo real:** el informe dice cuántos agentes usó cada fase.

Una revisión `completa` de un producto mediano puede llevar una hora y varios millones de tokens. Empezá por `rapida`.

## Datos, seguridad y límites

- **Qué sale de tu máquina:** el código, las capturas y las salidas de comandos que leen los agentes van al proveedor del modelo que use tu sesión de Claude Code. Usá datos de prueba, nunca dumps de producción.
- **Las reglas son instrucciones, no un aislamiento.** A los agentes se les indica no hacer push ni deploy, no tocar producción, no salirse de la carpeta, bajar lo que levantan y no usar datos reales. Para que sea una garantía:
  - bloqueá push y deploy con `permissions.deny` en Claude Code
  - no dejes credenciales de producción en el entorno
  - para código de terceros, corré dentro de un contenedor o una VM, o con `soloInforme: true, levantar: false`
- **Las reglas del repo no se pueden reescribir desde el cambio.** El perfil y las lecciones se leen de la rama base, y un cambio que los toca vuelve como pregunta bloqueante.
- Reportá vulnerabilidades de la skill según [SECURITY.md](SECURITY.md).

## Estructura

```
skills/comite/
  SKILL.md                 lo que lee Claude
  flujos/plan.js           comité previo
  flujos/revision.js       comité posterior
  referencias/             ángulos, severidad y veredicto, plantilla de perfil, forma del informe
  ejemplos/                perfiles de ejemplo
pruebas/simular.mjs        recorre los flujos con agentes simulados: node pruebas/simular.mjs
```

Las contribuciones son bienvenidas. Antes de abrir un PR, corré `node pruebas/simular.mjs`. Es un proyecto que se mantiene en lo que da el tiempo, sin soporte garantizado.

## English summary

`comite` is a Claude Code skill that runs a **committee of agents** over your work, twice:

- **`plan`, before building.** Product, two skeptical users, a devil's advocate, design, security and privacy, business and cost, and architecture each review your plan against the repo. A judge rules *build*, *adjust* or *don't build*, and returns the corrected plan.
- **`revision`, after building**, on a clean git worktree:
  - a map step detects what the product has
  - one shared local instance is started and screenshotted at 375 px, in light and dark
  - up to 21 review angles run in parallel
  - skeptics try to refute every finding
  - one developer per area fixes what survives, in small commits
  - control rounds re-check the fixes and run the full test suite
  - a report ends with a verdict: *approve*, *approve with reservations* or *block*

Make it yours with a team profile (`.comite/perfil.md`): your standard, your users, how to run and test the product, mandatory angles, protected decisions and stack-specific rules. Lessons approved after each run are injected into every later run. Prompts and reports are in Spanish; the report follows your profile's language.

Install with `/plugin marketplace add grupovimo/comite`, then `/plugin install comite@comite`. MIT licensed.

## Licencia

MIT. Hecho por [Grupo Vimo](https://github.com/grupovimo).
