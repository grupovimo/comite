# Severidad y veredicto

La severidad decide tres cosas: cuántos escépticos verifican un hallazgo, en qué orden se arregla y si el veredicto bloquea.

| Severidad | Criterio | Ejemplos |
|---|---|---|
| **bloqueante** | No se puede entregar | No compila en una plataforma. Pierde o corrompe datos. Una cuenta ve datos de otra. Cobra mal o dos veces. Un recorrido principal no termina. Expone datos personales. |
| **alta** | Una persona real lo va a sufrir seguido | Error sin mensaje en una tarea diaria. Pantalla ilegible en el teléfono o en modo oscuro. Consulta que tarda segundos con datos normales. Falta un permiso en una ruta poco usada. |
| **media** | Se nota y hay que arreglarlo | Estado vacío sin guía. Contraste justo por debajo de AA. Texto confuso. Falta la prueba de algo importante. |
| **baja** | Pulido | Espaciado irregular. Ícono inconsistente. Corte de línea feo. Microcopia mejorable. |

## Para el revisor
- Sin evidencia (qué leíste, corriste o viste), no es un hallazgo. Si es visual, van las rutas de las capturas.
- Si la preferencia de gusto no se apoya en el perfil, en el sistema de diseño o en una buena práctica reconocida, no es un hallazgo.
- Si algo está bien, no se lista.
- Ante la duda entre dos severidades, elegí la más baja y explicá por qué podría ser más.
- En la evidencia nunca copies secretos ni datos personales: archivo, línea y el valor enmascarado.

## Para el escéptico
- `existe` es lo único que decide si el hallazgo sobrevive. Si no lo podés comprobar, `existe: false`.
- Si el arreglo propuesto no sirve, el hallazgo sigue vivo: `arregloOk: false` y escribís el arreglo correcto en `arregloCorregido`.
- Ajustá la severidad con justicia, para arriba o para abajo. Cuando hay varios votos, queda la mediana de los que confirman.

## Cuántos escépticos

| Escala | bloqueante | alta | media y baja |
|---|---|---|---|
| `rapida` | 1 propio | un lote por área | un lote por área |
| `media` | 3 propios | 1 propio | un lote por área |
| `completa` | 3 propios | 3 propios | un lote por área |

Cada uno de los tres escépticos mira con una lente distinta: si existe, si el arreglo ataca la causa y si rompe otra cosa. El hallazgo sobrevive si la mayoría confirma que existe.

## Veredicto de la revisión

El flujo lo calcula sin agentes:
- **bloquear:**
  - queda un bloqueante abierto, sin arreglar o como pregunta, o
  - las pruebas corrieron y quedaron en rojo.
- **aprobar con reservas:**
  - queda algo grave abierto (bloqueante o alta), o
  - hay preguntas para el equipo, o
  - hay un hueco grave sin cubrir que el perfil no prevé hacer fuera del comité, o
  - las pruebas no se pudieron correr.
- **aprobar:** nada de lo anterior. Lo no cubierto que no es grave, o que el perfil ya prevé hacer afuera (por ejemplo, «Android se compila en CI»), se muestra en el informe sin bajar el veredicto.
