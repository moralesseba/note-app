# NOTE — Network Of Trust & Economic Management

Dashboard web para gestionar préstamos personales: montos, interés fijo (20%), vencimientos, estados y generación de recordatorios de WhatsApp listos para copiar y pegar.

> Proyecto personal de aprendizaje construido con un flujo de trabajo profesional: documentación por fases, gates de calidad (code review, seguridad, QA), tests de lógica de negocio y deploy continuo.

## Características

- **Dashboard** con totales (prestado, interés esperado, a cobrar) y próximos vencimientos.
- **CRUD de préstamos**: alta con validación en 3 capas y cálculo automático de interés y vencimiento (+1 mes con clamp a fin de mes), marcar como pagado.
- **"Para enviar hoy"**: lista automática de recordatorios que tocan según la regla (5 días antes / mismo día / vencido).
- **Generador de mensajes de WhatsApp** por préstamo, con plantillas parametrizadas y botón copiar / abrir en WhatsApp. El envío es manual a propósito: la app prepara, el dueño controla.
- **Modo demo** sin configurar nada (datos de ejemplo en memoria).
- **App privada**: candado de dueño a nivel de base de datos (ver Seguridad).

## Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 · Tailwind CSS v4 (CSS-first, design tokens) |
| Rutas | React Router 8 |
| Build | Vite 8 |
| Backend | Supabase — Postgres + Auth + Row Level Security |
| Tests | Vitest (33 tests de lógica de negocio) |
| Deploy | Vercel (CI desde GitHub) |

## Arquitectura (decisiones clave)

- **"Interfaz primero"**: las páginas consumen hooks propios (`useLoans`, `useAuth`) y no conocen al proveedor. La migración real Firebase→Supabase de este proyecto tocó solo 3 archivos del núcleo — las 5 páginas quedaron intactas.
- **Lógica de negocio pura** en `src/utils/` (cálculos, estados, plantillas de mensajes): sin React, sin BD, 100% testeada.
- **Validación en 3 capas**: formulario (UX) → funciones de negocio (app) → `check constraints` (Postgres).
- **Interés guardado, no derivado**: es un hecho contractual del momento del préstamo; si la tasa cambia, los préstamos antiguos conservan su acuerdo.

## Seguridad

- **RLS activa** con políticas por usuario: cada fila pertenece a un `user_id` (asignado por la BD con `default auth.uid()`, nunca por el cliente).
- **Candado de dueño**: la función `is_app_owner()` exige además que el email del JWT sea el del dueño — otras cuentas ven la app vacía y toda escritura les falla. La garantía vive en el servidor; la UI solo da un error amable.
- Las claves `VITE_*` que viajan al navegador son públicas por diseño; la seguridad no depende de ocultarlas sino de RLS. Ningún secreto real vive en el frontend.
- Auditado con el linter de seguridad de Supabase (0 hallazgos) — incluida una corrección de mínimo privilegio (`SECURITY INVOKER` + `REVOKE`).

## Correr localmente

Requisitos: Node.js 20+.

```bash
npm install
npm run dev     # http://localhost:5173 — funciona en modo demo sin configurar nada
npm test        # 33 tests
npm run build   # build de producción
```

## Montar tu propia instancia

1. Crea un proyecto en [supabase.com](https://supabase.com) y ejecuta en orden los SQL de `supabase/migrations/` (SQL Editor). **Importante:** en `002` y `003`, reemplaza el correo del dueño por el tuyo.
2. Copia `.env.example` como `.env.local` y completa con tu URL, publishable key y tu correo.
3. En Supabase → Authentication: habilita Email, y tras crear tu cuenta desactiva "Allow new users to sign up" y activa "Leaked password protection".
4. `npm run dev`, crea tu cuenta, confirma el correo y listo.
5. Deploy: importa el repo en [Vercel](https://vercel.com/new) y define las mismas 3 variables en *Environment Variables*. En Supabase → Authentication → URL Configuration, registra tu dominio como Site URL.

## Estructura

```
src/
├── config/      supabase.js — cliente único
├── context/     AuthContext — sesión (email+contraseña) y modo demo
├── hooks/       useAuth, useLoans — interfaces de datos para las páginas
├── components/
│   ├── common/  Button, Card, Badge, Input, Modal (design system)
│   ├── layout/  Sidebar, Header, MainLayout
│   └── loans/   NewLoanForm, LoanMessageModal
├── pages/       Login, Dashboard, Préstamos, Historial, Referencia
├── utils/       calculations, formatting, messages (+ tests)
└── data/        seedLoans — datos iniciales importables
supabase/
└── migrations/  esquema completo con RLS, reproducible
```

## Licencia

[MIT](LICENSE) — úsalo, apréndelo, adáptalo.
