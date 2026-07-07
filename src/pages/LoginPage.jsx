// pages/LoginPage.jsx — Única página pública (rediseñada + candado de dueño).
// Fondo oscuro de marca, tarjeta blanca centrada. El registro avisa que
// esta app es privada; el candado real está en la BD (is_app_owner en RLS).
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth.js'
import { Button, Card, Input } from '../components/common'

// Traducir errores técnicos a mensajes humanos
function mensajeError(err) {
  const msg = err?.message ?? ''
  if (msg === 'OWNER_ONLY') return 'Esta app es privada: solo el correo del dueño puede crear una cuenta.'
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('already registered')) return 'Ese correo ya tiene cuenta. Inicia sesión.'
  if (msg.includes('at least 6 characters')) return 'La contraseña debe tener al menos 6 caracteres.'
  return 'Algo salió mal. Intenta de nuevo.'
}

export default function LoginPage() {
  const { user, loading, isSupabaseConfigured, login, signup, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [aviso, setAviso] = useState(null)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setAviso(null)
    setEnviando(true)
    try {
      if (modo === 'login') {
        await login(email, password)
        navigate('/')
      } else {
        const { necesitaConfirmar } = await signup(email, password)
        if (necesitaConfirmar) {
          setAviso('Cuenta creada. Revisa tu correo y confirma antes de entrar.')
          setModo('login')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      console.error(err)
      setError(mensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-4">
      <div className="w-full max-w-md">
        {/* Marca sobre el fondo oscuro */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-xl font-extrabold text-white shadow-lg">
            N
          </span>
          <div className="text-left">
            <p className="text-xl leading-tight font-bold text-white">NOTE</p>
            <p className="text-xs leading-tight text-slate-400">
              Network Of Trust & Economic Management
            </p>
          </div>
        </div>

        <Card className="shadow-xl">
          {isSupabaseConfigured ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {modo === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
              </h1>

              <Input
                id="email"
                label="Correo"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                label="Contraseña"
                type="password"
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {aviso && (
                <p className="rounded-lg bg-green-50 p-2.5 text-sm text-green-700">{aviso}</p>
              )}
              {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={enviando} className="w-full">
                {enviando ? 'Un momento…' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setModo(modo === 'login' ? 'registro' : 'login')
                  setError(null)
                }}
                className="w-full text-center text-sm text-brand-600 hover:underline"
              >
                {modo === 'login' ? '¿Primera vez? Crea tu cuenta' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-semibold">Supabase aún no está configurado</p>
                <p className="mt-1">
                  Copia <code>.env.example</code> como <code>.env.local</code> con tus claves.
                  Mientras tanto puedes explorar en modo demo.
                </p>
              </div>
              <Button
                onClick={() => {
                  loginDemo()
                  navigate('/')
                }}
                variant="secondary"
                className="w-full"
              >
                Entrar en modo demo
              </Button>
            </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-slate-500">
          🔒 App privada — acceso exclusivo del dueño
        </p>
      </div>
    </div>
  )
}
