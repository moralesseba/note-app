// components/common/Button.jsx — Botón del design system.
// Variantes: primary (acción principal), secondary (neutra), ghost (sutil),
// danger (destructiva). Un solo lugar para el estilo de TODOS los botones.
const VARIANTES = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-700 focus-visible:outline-brand-600',
  secondary:
    'bg-white text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 hover:border-gray-400',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
}

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5
        text-sm font-semibold transition-all duration-150
        focus-visible:outline-2 focus-visible:outline-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${VARIANTES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
