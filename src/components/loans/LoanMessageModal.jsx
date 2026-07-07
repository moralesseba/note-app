// components/loans/LoanMessageModal.jsx — Mensaje de WhatsApp de un préstamo.
//
// Flujo: sugiere el tipo según el estado (puedes cambiarlo con el select),
// muestra el texto final y ofrece dos salidas:
//   • Copiar → portapapeles (navigator.clipboard, API nativa del navegador)
//   • Abrir WhatsApp → enlace wa.me con el texto precargado (tú eliges el chat)
import { useState } from 'react'
import { TIPOS_MENSAJE, sugerirTipoMensaje, generarMensaje } from '../../utils/messages.js'
import { Button, Modal } from '../common'

export default function LoanMessageModal({ prestamo, onClose }) {
  const [tipo, setTipo] = useState(() => sugerirTipoMensaje(prestamo) ?? 'recordatorio1')
  const [copiado, setCopiado] = useState(false)

  // El mensaje es DERIVADO de (tipo, prestamo): no se guarda en estado,
  // se recalcula en cada render. Menos estado = menos bugs.
  const mensaje = generarMensaje(tipo, prestamo)
  const sugerido = sugerirTipoMensaje(prestamo)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // Navegadores antiguos o sin permiso: selección manual como plan B
      window.getSelection()?.selectAllChildren(document.getElementById('mensaje-texto'))
    }
  }

  return (
    <Modal title={`Mensaje para ${prestamo.prestatario}`} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="tipo-mensaje" className="mb-1 block text-sm font-medium text-gray-700">
            Tipo de mensaje
          </label>
          <select
            id="tipo-mensaje"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(TIPOS_MENSAJE).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
                {valor === sugerido ? ' · sugerido hoy' : ''}
              </option>
            ))}
          </select>
        </div>

        <div
          id="mensaje-texto"
          className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm whitespace-pre-wrap"
        >
          {mensaje}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={copiar}>{copiado ? '¡Copiado! ✓' : 'Copiar mensaje'}</Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Abrir en WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  )
}
