# Perfil del equipo: Club (ejemplo con apps nativas)

## Estándar
Terminado = probado como lo usaría una persona en su teléfono, en claro y oscuro, con datos realistas. iOS y Android son **idénticas**: mismas pantallas, mismos textos, mismos estados, mismo orden. Que compile no alcanza, pero si no compila, es bloqueante.

## Producto y usuarios
- App para organizar partidos entre amigos: crear un partido, sumar gente, avisar cuando falta uno.
- Usuario principal: quien organiza, de 20 a 45 años; abre la app desde una notificación.
- Usuario del otro lado: quien se suma desde un enlace compartido; puede no tener la app.
- Idioma y país: español neutro, toda Latinoamérica; fechas en la zona horaria del partido.

## Stack y superficies
- `api/`: Node + Postgres. `ios/`: SwiftUI (iOS 17+). `android/`: Kotlin + Compose (minSdk 26).
- Regla de estructura: un archivo `.kt` por cada `.swift`, con el mismo nombre.
- Push: APNs en iOS y FCM en Android; en local se simulan.

## Cómo levantar y probar
- API: `docker compose -p club-comite up -d && npm --prefix api run seed`. Bajar con `down -v`.
- Pruebas: `npm --prefix api test`.
- iOS: en esta máquina sólo `swiftc -parse` de los archivos tocados. La compilación real corre en CI.
- Android: no se compila en local; CI corre `./gradlew assembleDebug testDebugUnitTest`.

## Diseño
- Diseños de referencia en `design/` (exportados de Figma), uno por pantalla: copia exacta en las dos plataformas.
- Los colores salen sólo del tema (`Theme.swift` / `Theme.kt`), con variante oscura para cada uno.

## Entorno de prueba
- La API local usa `.env.test`; APNs y FCM se simulan con `PUSH_FAKE=1`.

## Ángulos obligatorios
- nativas, modo-oscuro, usuario-principal

## Decisiones protegidas
- La pantalla de inicio muestra siempre «Partidos», «Gente» y «Avisos».
- Sumarse a un partido desde un enlace no pide crear cuenta hasta después de sumarse.

## Reglas por ángulo
- nativas, Android:
  - cada función o modificador de Compose usado tiene su import (`height`, `width`, `size`, `padding`…)
  - cada import existe en las dependencias del módulo (por ejemplo, `material3` sólo si el módulo lo declara)
  - nada de variables usadas fuera del composable donde se declararon
  - las extensiones se llaman con el paquete importado
- nativas, iOS:
  - cada `systemName` de SF Symbols existe (verificalo)
  - nada de `let` dentro de un `ViewBuilder` que no compile
  - nada de `async let` en vistas que se cargan al aparecer (cierra la app en Release)
- modo-oscuro: los logos con fondo transparente tienen versión clara.
- privacidad: GDPR y leyes locales; la ubicación exacta nunca se comparte con otros usuarios.

## Integración
- Aprobar: PR contra `main` con el informe en la descripción.
- Android y iOS se compilan una sola vez, al final de la tanda, en CI.

## Prohibido
- Borrar, crear o relanzar simuladores o emuladores.
- Subir builds a TestFlight o Play desde el comité.
