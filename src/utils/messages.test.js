// messages.test.js — Tests del generador de mensajes.
import { describe, it, expect } from 'vitest'
import { sugerirTipoMensaje, generarMensaje, NOMBRE_REMITENTE } from './messages.js'
import { formatCLP } from './formatting.js'

const frida = {
  prestatario: 'Tía Frida',
  principal: 100_000,
  interes: 20_000,
  total: 120_000,
  vencimiento: '2026-08-03',
  horaLimite: null,
  pagado: false,
}

const luis = {
  prestatario: 'Luis Tata',
  principal: 50_000,
  interes: 10_000,
  total: 60_000,
  vencimiento: '2026-08-06',
  horaLimite: '12:00 p.m.',
  pagado: false,
}

describe('sugerirTipoMensaje (regla: 5 días antes + mismo día)', () => {
  it('null si está pagado, aunque esté vencido', () => {
    expect(sugerirTipoMensaje({ ...frida, pagado: true }, new Date(2026, 7, 10))).toBe(null)
  })

  it('null si falta más de 5 días', () => {
    expect(sugerirTipoMensaje(frida, new Date(2026, 6, 6))).toBe(null) // 6 jul, faltan 28
  })

  it('recordatorio1 entre 5 y 1 días antes', () => {
    expect(sugerirTipoMensaje(frida, new Date(2026, 6, 29))).toBe('recordatorio1') // 5 días
    expect(sugerirTipoMensaje(frida, new Date(2026, 7, 2))).toBe('recordatorio1')  // 1 día
  })

  it('recordatorio2 el mismo día del vencimiento', () => {
    expect(sugerirTipoMensaje(frida, new Date(2026, 7, 3))).toBe('recordatorio2')
  })

  it('vencido después de la fecha', () => {
    expect(sugerirTipoMensaje(frida, new Date(2026, 7, 4))).toBe('vencido')
  })
})

describe('generarMensaje', () => {
  it('recordatorio1 incluye nombre, montos desglosados y firma', () => {
    const msg = generarMensaje('recordatorio1', frida)
    expect(msg).toContain('Tía Frida')
    expect(msg).toContain(formatCLP(120_000))
    expect(msg).toContain(formatCLP(100_000))
    expect(msg).toContain(formatCLP(20_000))
    expect(msg).toContain(NOMBRE_REMITENTE)
  })

  it('recordatorio2 respeta la hora límite cuando existe', () => {
    expect(generarMensaje('recordatorio2', luis)).toContain('antes de las 12:00 p.m.')
    expect(generarMensaje('recordatorio2', frida)).toContain('durante el día de hoy')
  })

  it('la oferta de crédito no menciona al prestatario por nombre (aún no se registra)', () => {
    const msg = generarMensaje('credito', luis)
    expect(msg).toContain(formatCLP(50_000))
    expect(msg).toContain(formatCLP(60_000))
    expect(msg).toContain('12:00 p.m.')
  })

  it('vencido menciona la fecha vencida y el total pendiente', () => {
    const msg = generarMensaje('vencido', frida)
    expect(msg).toContain(formatCLP(120_000))
    expect(msg.toLowerCase()).toContain('venció')
  })

  it('lanza error ante un tipo desconocido', () => {
    expect(() => generarMensaje('inexistente', frida)).toThrow()
  })
})
