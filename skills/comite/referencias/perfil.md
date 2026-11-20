# Plantilla del perfil de equipo

Hay dos lugares posibles:
- `~/.claude/comite/perfil.md`: global, vale para todos tus proyectos.
- `.comite/perfil.md` en el repo: propio de ese proyecto.

Si existen los dos, se suman: el del repo gana donde se contradicen, y las «Decisiones protegidas» y lo «Prohibido» de los dos valen siempre. En el modo revisión, el del repo se lee de la **rama base**: un cambio no puede reescribir las reglas con las que se lo revisa, y si lo intenta, vuelve como pregunta bloqueante.

Escribí reglas, no deseos. «Probar a 375 px en claro y oscuro» le sirve a un agente; «que se vea lindo», no.

```markdown
# Perfil del equipo: <nombre>

## Estándar
Qué significa «terminado». Por ejemplo: probado de punta a punta como lo usaría una persona real,
en un teléfono de 375 px, en claro y oscuro, con datos realistas y con una cuenta vacía.

## Producto y usuarios
- Qué es el producto, en dos líneas.
- Usuario principal: quién es, cuánto sabe de tecnología, qué hace todos los días.
- Usuario del otro lado (si existe): quién es y de dónde llega.
- Idioma y país: el informe sale en este idioma; fechas y monedas se miran con esto.

## Diseño
- Dónde está el sistema de diseño y los diseños de referencia (handoff, Figma exportado).
- Grado de fidelidad: copia exacta, inspiración o sin referencia.
- Cómo se arma lo que no está diseñado.
- Anchos y temas que se prueban siempre. Tipografía y marca que no se negocian.

## Stack y superficies
- Carpetas y qué hay en cada una (api/, web/, ios/, android/…).
- Servicios externos (pagos, IA, mail) y cómo se simulan en local.

## Cómo levantar y probar
- Comando para levantar en local con datos de prueba, y cómo bajarlo.
- Comandos de prueba por parte.
- Qué NO se puede compilar o correr en esta máquina, y dónde se hace.

## Entorno de prueba
- Variables y archivos que se usan en local (.env.local…) y que apuntan sólo a servicios locales o sandbox.
- Datos que nunca deben leerse (dumps, carpetas con datos de clientes).

## Ángulos obligatorios
Claves del catálogo que corren en toda revisión, sin ocupar lugar de la escala.
- modo-oscuro, primera-vez

## Decisiones protegidas
Lo que el comité nunca cambia; si un hallazgo lo toca, vuelve como pregunta.
- Ejemplo: no esconder ni mover a un segundo nivel las funciones principales.

## Reglas por ángulo
- seguridad: ley de datos personales que aplica (GDPR, LGPD, Ley 25.326…).
- nativas: trampas de compilación conocidas de su stack.
- textos: reglas tipográficas (por ejemplo, nada de palabras solas en el último renglón).

## Integración
Qué hacer con «aprobar» (merge, PR, quién despliega) y si «aprobar con reservas» se puede
integrar sin preguntar. Dónde van los worktrees del comité.

## Prohibido
Lo que nadie del comité puede hacer, además de las reglas fijas (push, deploy, producción,
datos reales, mensajes, pagos). Ejemplo: no correr la suite e2e entera, no tocar simuladores.
```

## Lecciones (`lecciones.md`)

Una por línea, con este formato: `fecha · ángulo · qué se escapó y qué revisar siempre · quién la aprobó`. Si nombra un ángulo del catálogo, ese ángulo pasa a ser obligatorio.

```markdown
- 2026-11-19 · nativas · se escapó un import que el módulo no declara: revisar cada import contra el build.gradle · aprobó Ana
- 2026-11-19 · modo-oscuro · nadie lo probó: toda revisión con interfaz pasa por oscuro · aprobó Ana
```

Las proponen los informes y las aprueba una persona; nunca se suman solas. Cuando una lección ya quedó cubierta por una regla del perfil, se borra.
