// pages/DashboardPage.jsx — Resumen general del negocio.
// Patrón: esta página NO calcula reglas de negocio; llama a las funciones
// de utils/ y solo se dedica a mostrar. "Componentes tontos, lógica aparte".
import { useState } from 'react'
import { useLoans } from '../hooks/useLoans.js'
import { estadoPrestamo, diasRestantes } from '../utils/calculations.js'
import { formatCLP, formatVencimiento } from '../utils/formatting.js'
import { sugerirTipoMensaje, TIPOS_MENSAJE } from '../utils/messages.js'
import { Card, Badge, Button } from '../components/common'
import LoanMessageModal from '../components/loans/LoanMessageModal.jsx'

export default function DashboardPage() {
  const { loans, loading, error, importSeed } = useLoans()
  const [importando, setImportando] = useState(false)
  const [errorImport, setErrorImport] = useState(null)
  const [prestamoMensaje, setPrestamoMensaje] = useState(null)

  if (loading) return <p className="text-gray-500">Cargando…</p>

  async function handleImport() {
    try {
      setImportando(true)
      setErrorImport(null)
      await importSeed()
    } catch (err) {
      setErrorImport(err.message)
    } finally {
      setImportando(false)
    }
  }

  // Primera vez: base vacía → ofrecer importar los 4 préstamos iniciales
  if (loans.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Card>
          <div className="py-10 text-center">
            <p className="text-4xl" aria-hidden="true">🚀</p>
            <p className="mt-2 font-medium">Tu base de datos está lista y vacía</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
              Puedes importar tus 4 préstamos actuales (Frida, Luis, Patricia y María)
              o crear uno nuevo desde la página Préstamos.
            </p>
            <Button onClick={handleImport} disabled={importando} className="mt-4">
              {importando ? 'Importando…' : 'Importar mis préstamos iniciales'}
            </Button>
            {errorImport && <p className="mt-2 text-sm text-red-600">{errorImport}</p>}
          </div>
        </Card>
      </div>
    )
  }

  // Derivar estadísticas de los datos (se recalculan solas si cambian los préstamos)
  const activos = loans.filter((p) => !p.pagado)
  const totalPrestado = activos.reduce((sum, p) => sum + p.principal, 0)
  const totalInteres = activos.reduce((sum, p) => sum + p.interes, 0)
  const totalACobrar = activos.reduce((sum, p) => sum + p.total, 0)

  // Próximos vencimientos, del más urgente al más lejano
  const proximos = [...activos].sort(
    (a, b) => diasRestantes(a.vencimiento) - diasRestantes(b.vencimiento)
  )

  const stats = [
    { label: 'Total prestado', valor: formatCLP(totalPrestado) },
    { label: 'Interés esperado', valor: formatCLP(totalInteres) },
    { label: 'Total a cobrar', valor: formatCLP(totalACobrar) },
    { label: 'Préstamos activos', valor: activos.length },
  ]

  // ¿A quién le toca mensaje hoy? (derivado, se recalcula solo)
  const paraEnviar = activos
    .map((p) => ({ prestamo: p, tipo: sugerirTipoMensaje(p) }))
    .filter((x) => x.tipo !== null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, valor }) => (
          <Card key={label}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{valor}</p>
          </Card>
        ))}
      </div>

      {/* Próximos vencimientos */}
      {/* Recordatorios que tocan HOY según la regla (5 días antes / mismo día / vencido) */}
      {paraEnviar.length > 0 && (
        <Card title="✉️ Para enviar hoy" className="border-amber-300 bg-amber-50">
          <ul className="divide-y divide-amber-200">
            {paraEnviar.map(({ prestamo, tipo }) => (
              <li key={prestamo.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{prestamo.prestatario}</p>
                  <p className="text-sm text-amber-800">{TIPOS_MENSAJE[tipo]}</p>
                </div>
                <Button onClick={() => setPrestamoMensaje(prestamo)}>Ver mensaje</Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Próximos vencimientos">
        <ul className="divide-y divide-gray-100">
          {proximos.map((p) => {
            const dias = diasRestantes(p.vencimiento)
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{p.prestatario}</p>
                  <p className="text-sm text-gray-500">
                    Vence {formatVencimiento(p.vencimiento, p.horaLimite)}
                    {' · '}
                    {dias >= 0 ? `faltan ${dias} días` : `venció hace ${-dias} días`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatCLP(p.total)}</span>
                  <Badge estado={estadoPrestamo(p)} />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      {prestamoMensaje && (
        <LoanMessageModal
          prestamo={prestamoMensaje}
          onClose={() => setPrestamoMensaje(null)}
        />
      )}
    </div>
  )
}
