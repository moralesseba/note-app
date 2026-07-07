// vite.config.js — Configuración del bundler.
// Vite es la herramienta que arranca el servidor de desarrollo (npm run dev)
// y genera el build optimizado para producción (npm run build).
//
// Nota 2026: con Tailwind v4 ya NO existen tailwind.config.js ni postcss.config.js.
// Tailwind se activa como plugin de Vite y se configura desde el propio CSS.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),      // Habilita JSX y Fast Refresh (los cambios se ven al instante)
    tailwindcss() // Habilita Tailwind CSS v4
  ],
  test: {
    // Configuración de Vitest: los tests de lógica de negocio corren en Node
    environment: 'node',
    include: ['src/**/*.test.js']
  }
})
