# NOTE — Network Of Trust & Economic Management

Dashboard web para gestionar préstamos personales: montos, intereses (20% fijo), vencimientos y recordatorios.

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · React Router 8 · **Supabase** (Postgres + Auth + RLS) · Vitest

## Cómo correrlo

Requisito: [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install     # instalar dependencias (tras el cambio a Supabase, correr de nuevo)
npm run dev     # servidor de desarrollo → http://localhost:5173
npm test        # correr los tests
npm run build   # build de producción → carpeta dist/
```

## Base de datos (ya configurada ✅)

El proyecto Supabase `note-app` ya existe (región São Paulo, plan gratis) y `.env.local`
ya tiene las claves. Solo falta **crear tu cuenta**: abre la app → "¿Primera vez? Crea tu
cuenta" → usa tu correo y una contraseña → confirma el correo que te llega → entra →
botón "Importar mis préstamos iniciales".

- Tabla `loans` protegida con **RLS**: cada fila pertenece a un usuario (`user_id`)
  y las políticas solo permiten leer/escribir tus propias filas.
- La regla de montos ($50.000–$500.000) también vive en la BD como `check constraint`.
- Nota del plan gratis: si no usas el proyecto ~1 semana, Supabase lo pausa;
  se reactiva con un clic en [supabase.com/dashboard](https://supabase.com/dashboard).

## Estructura

```
src/
├── config/      supabase.js — cliente único (lee .env.local)
├── context/     AuthContext — sesión email+contraseña, compartida en toda la app
├── hooks/       useAuth, useLoans — las páginas consumen interfaces, no proveedores
├── components/
│   ├── common/  Button, Card, Badge, Input
│   ├── layout/  Sidebar, Header, MainLayout
│   └── loans/   NewLoanForm — alta con validación y vista previa
├── pages/       Login, Dashboard, Préstamos, Historial, Referencia
├── utils/       calculations (negocio) + formatting (presentación) + tests
└── data/        seedLoans — los 4 préstamos iniciales (importables con un clic)
```

## Reglas de negocio

- Interés fijo: 20% por préstamo, plazo 1 mes (vencimiento se calcula solo, con clamp a fin de mes).
- Monto: mínimo $50.000, máximo $500.000 (CLP) — validado en UI, app y BD.
- Recordatorios: 5 días antes del vencimiento y el mismo día (antes de 12:00 p.m.).
- La tabla de referencia de montos es privada del administrador.

## Historia del proyecto

Fase 1 (scaffold con Firebase) → Fase 2 (migración a Supabase + CRUD real).
El cambio de proveedor tocó solo `config/`, `AuthContext` y `useLoans` gracias al
patrón "interfaz primero". Decisiones y gates en `TEAM-LOG.md`.

## Próximas fases

- Generador de mensajes de WhatsApp desde plantillas (con datos del préstamo).
- Google OAuth como segundo método de login (opcional).
- Deploy en Vercel.
