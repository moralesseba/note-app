# TEAM-LOG — Proyecto NOTE

Bitácora compartida del equipo dev-team. Todo rol lee antes de actuar y escribe al terminar.

## Proyecto

- **Nombre:** NOTE — Network Of Trust & Economic Management
- **Tipo:** Dashboard web de gestión de préstamos personales
- **Usuario:** Sebastián Morales (moralessebastyan@gmail.com) — objetivo: aprender desarrollo web profesional
- **Modo:** Híbrido (código + explicaciones educativas)
- **Complejidad:** MEDIA (frontend + Firestore + auth simple; datos personales → gate de seguridad obligatorio)

## Stack acordado

- React + Vite + Tailwind CSS + Firebase (Auth con Google + Firestore) + deploy futuro en Vercel
- Versiones exactas: pendiente verificación (chief-architect, 2026-07-06)

## Reglas de negocio

- Interés fijo 20% por préstamo, plazo 1 mes
- Monto mínimo $50.000, máximo $500.000 (CLP)
- Recordatorios: 1º a 5 días del vencimiento, 2º el mismo día antes de las 12:00 p.m.
- La tabla de montos de referencia es PRIVADA: nunca aparece en mensajes a prestatarios

## Datos iniciales (seed)

| Prestatario | Principal | Interés | Total | Vence |
|---|---|---|---|---|
| Tía Frida | $100.000 | $20.000 | $120.000 | 3 ago 2026 |
| Luis Tata | $50.000 | $10.000 | $60.000 | 6 ago 2026 12:00 |
| Patricia Calderón | $100.000 | $20.000 | $120.000 | 6 ago 2026 12:00 |
| María Lorena | $50.000 | $10.000 | $60.000 | 6 ago 2026 12:00 |

## Referencias

- Documentación 4 fases: Google Drive, carpeta "Proyecto NOTE - Documentación Profesional"
- Datos operativos: Drive, carpeta "Gestión de Préstamos" (Excel + docs)

## Bitácora

### [2026-07-06] CAMBIO DE STACK: Firebase → Supabase (decisión del usuario)
- **Motivo:** (1) SQL/Postgres es habilidad más transferible para el perfil del usuario que Firestore NoSQL; (2) ya usa Supabase en NEXO y la lección de RLS aplica directo; (3) MCP de Supabase conectado permite crear BD/migraciones sin setup manual; (4) el patrón "interfaz primero" hace el cambio barato AHORA (solo config/, AuthContext, useLoans — páginas intactas).
- **Auth:** email + contraseña (cero config) en vez de Google OAuth (en Supabase requiere client ID de Google Cloud; se puede agregar después).
- **Proyecto:** note-app, ref `chzxuqnncfghqlnnoscd`, región sa-east-1, plan gratis $0/mes. SDK @supabase/supabase-js 2.110.0.
- Aviso a roles: firebase.js eliminado; variables .env pasan a VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY.

### [2026-07-06] FASE 4 COMPLETADA: Candado de dueño + rediseño — Gates
- **Gate 2 seguridad: PASS.** Migración owner_lock_policies: is_app_owner() + políticas exigen uid dueño Y email del dueño (garantía en servidor). Advisor detectó SECURITY DEFINER innecesario → corregido a INVOKER + revoke anon (mínimo privilegio). Advisors: solo queda 1 WARN (leaked password protection — toggle manual del usuario en dashboard).
- **Gate 1 código: APPROVE** · **Gate 3 QA: PASS** (build 945ms, 33/33 tests).
- **Diseño (uxui-designer):** dirección fintech — Inter, sidebar oscura ink-900 con iconos SVG, login con degradado de marca, badges con punto, header con título por ruta y avatar. 8 archivos base restilizados, 0 páginas tocadas en lógica (design system pagando).
- **Pendiente usuario:** reiniciar `npm run dev` (cambió .env.local: VITE_OWNER_EMAIL); tras crear su cuenta, apagar "Allow new users to sign up" y prender "Leaked password protection" en el dashboard.
- **CRÍTICO:** la cuenta del dueño debe ser moralessebastyan@gmail.com — otro correo ve la app vacía por diseño.

### [2026-07-06] FASE 3 COMPLETADA: Generador de mensajes WhatsApp — Gates
- **Gate 1 código: APPROVE.** Lógica pura en utils/messages.js (plantillas del usuario parametrizadas), mensaje como estado derivado, Modal accesible reutilizable, envío manual por diseño (decisión original del usuario respetada).
- **Gate 3 QA: PASS.** Build 1.06s, 33/33 tests (10 nuevos de mensajes: sugerencia por estado + contenido de plantillas).
- **Entregado:** botón 💬 Mensaje por préstamo (modal con tipo sugerido, copiar, abrir wa.me) + tarjeta "Para enviar hoy" en Dashboard.
- **Convención nueva (pedido del usuario):** toda la documentación va en C:\PORTAFOLIO\DOCUMENTACION\NOTE (creados: 01-decisiones-y-arquitectura.md, 02-fase-3-mensajes-whatsapp.md).

### [2026-07-06] FASE 2 COMPLETADA: Supabase + CRUD — Gates
- **Gate 1 código: APPROVE.** Capa de mapeo fromDb/toDb aísla snake_case de la BD; useLoans mantiene la interfaz (páginas sin cambios estructurales); errores manejados en todas las mutaciones.
- **Gate 2 seguridad: PASS.** RLS activa verificada por SQL + 4 políticas por uid + advisors de Supabase: 0 hallazgos. user_id lo asigna la BD (default auth.uid()), el cliente nunca lo envía. Claves solo en .env.local (gitignored).
- **Gate 3 QA: PASS.** Build 621ms, 23/23 tests (3 nuevos de calcularVencimiento con clamp fin de mes), smoke test OK. Bundle 737KB→353KB al salir de Firebase (warning de tamaño eliminado).
- **Entregado:** CRUD completo (alta con formulario validado, marcar pagado, importar seed), login email+contraseña, BD note-app en sa-east-1.
- Incidente resuelto: el mount del sandbox servía versiones truncadas de archivos recién escritos; se verificó el disco real con Read (íntegro) y se reconstruyó en sandbox vía heredoc (lección registrada en LESSONS.md).

### [2026-07-06] Fase 1 — Gates (scaffold Firebase)
- **Gate 1 código (code-supervisor): APPROVE.** Capas separadas (negocio en utils/, presentación en pages/), funciones puras, sin código muerto, sin secretos. Notas no bloqueantes: agregar ESLint, code-splitting de Firebase (chunk 737KB), ErrorBoundary futuro.
- **Gate 2 seguridad (security-supervisor): PASS** (alcance actual). 0 secretos hardcodeados, .env fuera de git, sin vectores XSS. **OBLIGATORIO en fase Firestore:** Security Rules que restrinjan lectura/escritura al uid del dueño — nunca reglas abiertas (lección NEXO).
- **Gate 3 QA (qa-lead): PASS.** Build Vite 8 OK (452ms), 20/20 tests verdes, preview server responde 200 en / y /login. Lógica de negocio 100% cubierta.

### [2026-07-06] chief-architect — Stack verificado
- react 19.2.7 · react-router 8.1.0 (paquete "react-router", NO react-router-dom) · vite 8.1.3 (usa Rolldown) · tailwindcss 4.3.2 CSS-first vía @tailwindcss/vite (sin tailwind.config.js ni postcss) · firebase 12.15.0 modular · vitest 4.1.10
- Verificado contra registro npm + build real, no solo blogs.

### [2026-07-06] frontend-dev + backend-dev — Scaffold v0.1 entregado
- 25 archivos en C:\PORTAFOLIO\NOTE: auth Google + modo demo, 5 páginas, layout responsive, lógica de negocio testeada, seed con los 4 préstamos reales.
- Patrón "interfaz primero" en useLoans: próxima fase cambia seed→Firestore sin tocar páginas.

### Próxima fase (pendiente)
1. Usuario: instalar Node 20+, `npm install`, `npm run dev`, crear proyecto Firebase y llenar .env.local
2. Firestore: colección loans + CRUD (alta préstamo con validarMonto, marcar pagado) + Security Rules por uid
3. Generador de mensajes WhatsApp desde plantillas (Drive) con datos del préstamo
4. Deploy Vercel

### [2026-07-06] orchestrator — Activación
- Complejidad MEDIA → ejecución inline secuencial
- Plan: architect (versiones) → frontend-dev (scaffold) → backend-dev (Firebase) → gates 1-3 → entrega a C:\PORTAFOLIO\NOTE
- Lecciones aplicadas de LESSONS.md: verificar versiones reales antes de implementar; seguridad de datos en el servidor (Firestore Security Rules), no solo en el cliente
- Estrategia de build: desarrollar y compilar en sandbox Linux, copiar fuentes (sin node_modules) a la carpeta del usuario
- Aviso a roles: el código anterior de la sesión "note idea" se perdió (sandbox temporal); se reconstruye desde la documentación
