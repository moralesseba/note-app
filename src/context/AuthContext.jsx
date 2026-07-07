// context/AuthContext.jsx — Estado global de autenticación (Supabase).
//
// Las páginas usan useAuth() sin saber qué proveedor hay detrás.
// Auth: email + contraseña. Registro restringido al correo del dueño
// (defensa en capas: aquí por UX, y en la BD por seguridad real).
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, ownerEmail } from '../config/supabase.js'

const DEMO_KEY = 'note-demo-user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demo = localStorage.getItem(DEMO_KEY)
      setUser(demo ? JSON.parse(demo) : null)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  }

  async function signup(email, password) {
    // Candado de dueño (capa UX): rechazar temprano con mensaje claro.
    // Aunque alguien salte esta validación, la BD lo deja sin acceso.
    if (ownerEmail && email.trim().toLowerCase() !== ownerEmail.toLowerCase()) {
      throw new Error('OWNER_ONLY')
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return { necesitaConfirmar: !data.session }
  }

  function loginDemo() {
    const demoUser = { id: 'demo', email: 'demo@note.local', isDemo: true }
    localStorage.setItem(DEMO_KEY, JSON.stringify(demoUser))
    setUser(demoUser)
  }

  async function logout() {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    localStorage.removeItem(DEMO_KEY)
    setUser(null)
  }

  const value = { user, loading, isSupabaseConfigured, login, signup, loginDemo, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de <AuthProvider>')
  return ctx
}
