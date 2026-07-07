// utils/messages.js — Generador de mensajes de WhatsApp.
//
// Las plantillas vienen de tu planificación (Drive, "Gestión de Préstamos"):
// mismas palabras, pero los datos (nombre, montos, fechas) se inyectan solos
// desde el préstamo. Regla de la casa: la tabla de referencia de montos es
// privada — estas plantillas solo usan datos DEL préstamo en cuestión.
import { formatCLP, formatFecha } from './formatting.js'
import { diasRestantes, DIAS_RECORDATORIO_1 } from './calculations.js'

export const NOMBRE_REMITENTE = 'Sebastián'

export const TIPOS_MENSAJE = {
  credito: 'Oferta de crédito',
  recordatorio1: `Recordatorio (${DIAS_RECORDATORIO_1} días antes)`,
  recordatorio2: 'Vencimiento (mismo día)',
  vencido: 'Seguimiento (vencido)',
}

/**
 * ¿Qué mensaje corresponde HOY para este préstamo?
 *   vencido → seguimiento · día 0 → confirmación · ≤5 días → recordatorio
 *   null → aún no toca enviar nada (o ya está pagado)
 */
export function sugerirTipoMensaje(prestamo, hoy = new Date()) {
  if (prestamo.pagado) return null
  const dias = diasRestantes(prestamo.vencimiento, hoy)
  if (dias < 0) return 'vencido'
  if (dias === 0) return 'recordatorio2'
  if (dias <= DIAS_RECORDATORIO_1) return 'recordatorio1'
  return null
}

/** Genera el texto listo para copiar/pegar en WhatsApp. */
export function generarMensaje(tipo, prestamo) {
  const { prestatario, principal, interes, total, vencimiento, horaLimite } = prestamo
  const fecha = formatFecha(vencimiento)
  const conHora = horaLimite ? ` hasta las ${horaLimite}` : ''

  switch (tipo) {
    case 'credito':
      return (
        `Hola, buenos días. Si necesitas los ${formatCLP(principal)}, te realizo la transferencia de inmediato. ` +
        `Te recuerdo que el plazo máximo para el reembolso es de un mes, fijado para el ${fecha}${conHora}. ` +
        `El interés es de ${formatCLP(interes)}, por lo que el total final a devolver será de ${formatCLP(total)}.`
      )

    case 'recordatorio1':
      return (
        `Hola ${prestatario}, te escribo para recordarte que tu préstamo vence el ${fecha}${conHora}.\n\n` +
        `Total a devolver: ${formatCLP(total)} (${formatCLP(principal)} principal + ${formatCLP(interes)} interés).\n\n` +
        `¿Confirmamos que todo está bien?\n\nGracias, ${NOMBRE_REMITENTE}`
      )

    case 'recordatorio2':
      return (
        `Hola ${prestatario}, hoy vence tu préstamo. El pago de ${formatCLP(total)} debe realizarse ` +
        `${horaLimite ? `antes de las ${horaLimite}` : 'durante el día de hoy'}.\n\n` +
        `¿Me confirmas que está en camino?\n\nGracias, ${NOMBRE_REMITENTE}`
      )

    case 'vencido':
      return (
        `Hola ${prestatario}, probablemente no viste mi mensaje anterior. Tu préstamo venció el ${fecha} ` +
        `y aún no registro el pago de ${formatCLP(total)}.\n\n` +
        `¿Hay algún inconveniente? Si necesitas ajustar la fecha, avísame con confianza.\n\nGracias, ${NOMBRE_REMITENTE}`
      )

    default:
      throw new Error(`Tipo de mensaje desconocido: ${tipo}`)
  }
}
