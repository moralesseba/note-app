// components/common/Input.jsx — Campo de formulario con label y error.
// Accesibilidad: el label se asocia con htmlFor/id, y el error se anuncia
// a lectores de pantalla vía aria-describedby.
export default function Input({ id, label, error, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-2 focus:outline-offset-1 focus:outline-brand-600
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
