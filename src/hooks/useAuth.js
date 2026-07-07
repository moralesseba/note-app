// hooks/useAuth.js — Fachada simple sobre el AuthContext.
// Patrón profesional: los componentes importan useAuth() y no saben
// (ni les importa) si detrás hay Firebase, modo demo u otra cosa.
// Si mañana cambias de proveedor de auth, solo tocas el contexto.
export { useAuthContext as useAuth } from '../context/AuthContext.jsx'
