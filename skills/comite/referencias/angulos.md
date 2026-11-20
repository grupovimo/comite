# Catálogo de ángulos

## Revisión (`flujos/revision.js`)

### Cómo se eligen

1. **El mapa detecta qué superficies existen.** La lista es: `web`, `web-publica`, `interfaz`, `diseno-de-referencia`, `ios`, `android`, `api`, `base-de-datos`, `pagos`, `ia`, `datos-personales` y `tareas-programadas`. Un ángulo corre sólo si existe al menos una de las superficies que requiere.
2. **Obligatorios.** Entran primero y **no ocupan lugar de la escala**. Salen de tres lugares: `args.obligatorios`, la sección «Ángulos obligatorios» del perfil y las lecciones que nombran un ángulo.
3. **Ángulos propios** (`args.angulos`). También entran primero y fuera de cupo.
4. **Cupos por familia**, cuando hay interfaz:
   - `rapida`: al menos 1 de diseño.
   - `media`: al menos 2 de diseño y 1 de usuarios.
5. **El resto** sigue el orden que propone el mapa, el más importante primero, hasta el tope de la escala: 3, 7 o todos.

| Ángulo | Familia | Requiere | Área | Visual | Qué mira |
|---|---|---|---|---|---|
| `correctitud` | técnica | — | backend | | lógica, estados, casos borde, transacciones, idempotencia |
| `seguridad` | técnica | — | backend | | permisos, aislamiento entre cuentas, inyecciones, sesiones, secretos, webhooks |
| `privacidad` | técnica | datos-personales | backend | | qué datos se piden, guardan y salen; logs y URLs; retención; textos legales |
| `pagos` | técnica | pagos | backend | | montos en el servidor, webhooks idempotentes, estados, dobles cobros |
| `ia` | técnica | ia | backend | | prompt injection, datos al proveedor, topes de costo, fallas del modelo |
| `datos` | técnica | base-de-datos | datos | | migraciones, índices, N+1, integridad, copias |
| `operacion` | técnica | — | infra | | timeouts, colas, errores crudos, logs, costos, escala ×100 |
| `rendimiento-web` | técnica | web | web | ✓ | peso, fuentes, Core Web Vitals en un teléfono lento, caché |
| `pruebas` | técnica | — | backend | | cobertura de lo importante, pruebas falsas o frágiles |
| `tiempo-e-idioma` | técnica | — | backend | | zonas horarias, formatos, plurales, ortografía |
| `nativas` | técnica | ios, android | apps | | paridad, riesgos de compilación, accesibilidad nativa, enlaces profundos |
| `compartir` | técnica | web-publica | web | | SEO, Open Graph, robots, 404, nada privado indexable |
| `diseno-visual` | diseño | interfaz | web | ✓ | jerarquía, grilla, tipografía, color, consistencia |
| `fidelidad` | diseño | diseno-de-referencia | web | ✓ | cada pantalla contra su diseño de referencia |
| `interaccion` | diseño | interfaz | web | ✓ | estados vacío, carga y error; volver atrás; formularios; confirmaciones |
| `accesibilidad` | diseño | interfaz | web | ✓ | WCAG 2.2 AA medido |
| `modo-oscuro` | diseño | interfaz | web | ✓ | todas las pantallas en oscuro |
| `textos` | diseño | interfaz | contenido | | voz, claridad, errores que dicen qué hacer, ortografía |
| `usuario-principal` | usuarios | interfaz | web | ✓ | quien lo usa todos los días, poco técnico |
| `usuario-final` | usuarios | interfaz | web | ✓ | la persona del otro lado, que llega desde un enlace; se omite si no existe |
| `primera-vez` | usuarios | interfaz | web | ✓ | la cuenta vacía |

**Visual.** Estos ángulos usan la instancia compartida y las capturas base. Si no hay producto en ejecución (interfaz sólo nativa, `levantar: false`, o no se pudo levantar), revisan el código de las vistas contra el diseño de referencia y contra la otra plataforma, y lo declaran «no visto en ejecución». El crítico lo lleva a «no cubierto».

**Área.** Decide qué desarrollador arregla. Sale del archivo que hay que tocar, no del ángulo: un `.swift` o un `.kt` siempre es `apps`. Los arreglos van en secuencia: `datos → backend → web → apps → contenido → infra`.

**Topes.** Cada ángulo devuelve como máximo 5, 8 o 12 hallazgos según la escala, los más graves primero. Lo recortado se cuenta en `resultado.recortados`.

## Plan (`flujos/plan.js`)

| Ángulo | `rapida` | Pregunta central |
|---|---|---|
| `producto` | ✓ | ¿hace falta? ¿qué pasa si no se hace? ¿cómo sabremos si funcionó? |
| `usuario-principal` | ✓ | ya construido, en el teléfono y apurado: ¿te sirve? |
| `usuario-final` | | ¿cambia algo para la persona del otro lado? |
| `abogado-del-diablo` | ✓ | ¿cuál es la alternativa más simple? ¿qué se da por sentado? |
| `diseno` | ✓ | ¿qué quedó sin diseñar y se va a improvisar? |
| `seguridad-privacidad` | | ¿qué datos nuevos y qué abusos habilita? |
| `negocio-costos` | | ¿cuánto cuesta construirlo y mantenerlo, y qué promete? |
| `arquitectura` | | ¿reusa lo que existe? ¿riesgo de migración? ¿orden de entrega? |

## Ángulos propios

`angulos: [{ key, prompt, area, requiere?, visual? }]`.
- Por defecto se suman y corren siempre.
- `angulosModo: 'reemplazar'` los usa solos.
- `area` es una de `datos | backend | web | apps | contenido | infra`.

Un buen ángulo propio tiene:
- un rol con criterio («Sos…»)
- una lista concreta de qué mirar
- cómo comprobarlo

Si sólo querés sumar reglas a un ángulo que ya existe (las trampas de tu stack, por ejemplo), ponelas en el perfil, en «Reglas por ángulo»; así no reescribís el ángulo.
