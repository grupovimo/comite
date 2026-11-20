# Perfil del equipo: Agenda (ejemplo)

## Estándar
Terminado = probado de punta a punta como lo usaría una persona real:
- en un teléfono de 375 px y en escritorio de 1280 px
- en modo claro y oscuro
- con datos realistas: 40 turnos, nombres largos, acentos
- con una cuenta recién creada

Nada de palabras solas en el último renglón de títulos y botones.

## Producto y usuarios
- Agenda de turnos para profesionales independientes (peluquería, kinesiología, clases).
- Usuario principal: la profesional, de 30 a 60 años, que lo usa desde el teléfono entre turno y turno. No lee textos largos.
- Usuario del otro lado: su cliente, que llega desde un enlace por WhatsApp o Instagram, reserva sin crear cuenta y recibe un recordatorio.
- Idioma y país: español rioplatense, Argentina (UTC-3, pesos, fechas dd/mm).

## Diseño
- Sistema y diseños de referencia en `docs/diseno/`: copia exacta.
- Lo no diseñado se arma con los componentes de `web/src/ui/`.
- Se prueba siempre a 375 px y a 1280 px, en claro y en oscuro.
- Tipografía: Inter y nada más.

## Stack y superficies
- `api/`: Go + Postgres. `web/`: SvelteKit (panel y página pública de reservas).
- Pagos con Mercado Pago: en local se usa el modo sandbox; nunca credenciales reales.
- Mails con un proveedor transaccional: en local van a Mailpit.

## Cómo levantar y probar
- Levantar: `docker compose -p agenda-comite up -d && make semilla`. Web en http://localhost:5173.
- Bajar: `docker compose -p agenda-comite down -v`.
- Pruebas: `make test` (api) y `npm --prefix web run check && npm --prefix web test`.
- Recorridos: Playwright ya instalado (`npx playwright`); las capturas van a la carpeta que indique el comité.

## Entorno de prueba
- `.env.local` apunta a la base local, a Mailpit y al sandbox de Mercado Pago. Si aparece una clave que empieza con `APP_USR-` (producción), no se corre nada.
- `backups/` tiene dumps reales: no se lee.

## Ángulos obligatorios
- modo-oscuro, primera-vez, pagos

## Decisiones protegidas
- La página pública de reservas no pide crear cuenta.
- «Agenda», «Clientes» y «Cobros» están siempre en la barra principal; no se mueven a un menú.
- Un solo color de acento por profesional, elegido por ella.

## Reglas por ángulo
- privacidad: Ley 25.326. Los teléfonos de clientes no salen en logs ni en URLs.
- pagos: el precio del turno sale siempre de la base, nunca del formulario.
- tiempo-e-idioma: todas las fechas en America/Argentina/Buenos_Aires, también en los mails.

## Integración
- Aprobar: merge a `main` sin squash; el deploy lo hace CI.
- Aprobar con reservas: preguntar antes de integrar.

## Prohibido
- Correr `make e2e` entero: tarda 40 minutos y lo corre CI.
