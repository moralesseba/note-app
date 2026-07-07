// config/supabase.js — Cliente de Supabase (Postgres + Auth).
//
// Un solo cliente para toda la app (patrón singleton): createClient abre
// la conexión y maneja la sesión del usuario automáticamente.
//
// Mismo patrón "modo demo" que antes: si .env.local no existe, la app
// no se cae — exporta isSupabaseConfigured=false y la UI ofrece demo.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && publishableKey)

export const supabase = isSupabaseConfigured ? createClient(url, publishableKey) : null

// Dueño de la app: el registro solo acepta este correo (mejora de UX).
// La garantía fuerte no está aquí: está en la BD (is_app_owner() en RLS),
// porque todo lo que vive en el navegador puede manipularse.
export const ownerEmail = import.meta.env.VITE_OWNER_EMAIL ?? null
