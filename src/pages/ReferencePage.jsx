// pages/ReferencePage.jsx — Tabla de montos $50.000 → $500.000.
// REGLA DE NEGOCIO: esta tabla es PRIVADA del administrador.
// Nunca se copia en mensajes a prestatarios.
// Nota técnica: la tabla no se escribe a mano — se GENERA con
// generarTablaReferencia(). Si cambia la tasa, la tabla se actualiza sola.
import { generarTablaReferencia, TASA_INTERES } from '../utils/calculations.js'
import { formatCLP } from '../utils/formatting.js'
import { Card } from '../components/common'

export default function ReferencePage() {
  const filas = generarTablaReferencia()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tabla de referencia</h1>
        <p className="mt-1 inline-block rounded bg-red-50 px-2 py-0.5 text-sm font-medium text-red-700">
          🔒 Privada — no compartir en mensajes
        </p>
      </div>

      <Card title={`Interés fijo: ${TASA_INTERES * 100}%`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2">Monto prestado</th>
                <th className="px-3 py-2">Interés (20%)</th>
                <th className="px-3 py-2">Total a devolver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map(({ monto, interes, total }) => (
                <tr key={monto} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5">{formatCLP(monto)}</td>
                  <td className="px-3 py-2.5 text-gray-500">{formatCLP(interes)}</td>
                  <td className="px-3 py-2.5 font-semibold">{formatCLP(total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
