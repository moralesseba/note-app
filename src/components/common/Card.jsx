// components/common/Card.jsx — Contenedor estándar del design system.
export default function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-xs font-bold tracking-widest text-gray-400 uppercase">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
