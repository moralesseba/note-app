// calculations.test.js — Tests unitarios de la lógica de negocio.
// Regla del equipo: la lógica de negocio SIEMPRE se testea (coverage ≥ 80%).
// Correr con: npm test
import { describe, it, expect } from 'vitest'
import {
  calcularInteres,
  calcularTotal,
  validarMonto,
  diasRestantes,
  estadoPrestamo,
  fechasRecordatorio,
  calcularVencimiento,
  generarTablaReferencia,
  MONTO_MINIMO,
  MONTO_MAXIMO,
} from './calculations.js'

describe('calcularVencimiento (fecha préstamo + 1 mes)', () => {
  it('suma un mes en el caso normal', () => {
    expect(calcularVencimiento('2026-07-06')).toBe('2026-08-06')
    expect(calcularVencimiento('2026-07-03')).toBe('2026-08-03')
  })

  it('clampea a fin de mes cuando el día no existe', () => {
    expect(calcularVencimiento('2026-01-31')).toBe('2026-02-28') // feb no bisiesto
    expect(calcularVencimiento('2028-01-31')).toBe('2028-02-29') // feb bisiesto
    expect(calcularVencimiento('2026-08-31')).toBe('2026-09-30') // sep tiene 30
  })

  it('cruza fin de año', () => {
    expect(calcularVencimiento('2026-12-15')).toBe('2027-01-15')
  })
})

describe('calcularInteres / calcularTotal (tasa 20%)', () => {
  it('calcula el interés de los préstamos reales', () => {
    expect(calcularInteres(50_000)).toBe(10_000)   // Luis, María
    expect(calcularInteres(100_000)).toBe(20_000)  // Frida, Patricia
  })

  it('calcula el total a devolver', () => {
    expect(calcularTotal(50_000)).toBe(60_000)
    expect(calcularTotal(100_000)).toBe(120_000)
  })
})

describe('validarMonto (rango $50.000 – $500.000)', () => {
  it('acepta los límites exactos', () => {
    expect(validarMonto(MONTO_MINIMO).valido).toBe(true)
    expect(validarMonto(MONTO_MAXIMO).valido).toBe(true)
  })

  it('rechaza montos fuera de rango', () => {
    expect(validarMonto(49_999).valido).toBe(false)
    expect(validarMonto(500_001).valido).toBe(false)
  })

  it('rechaza valores que no son números', () => {
    expect(validarMonto('cien mil').valido).toBe(false)
    expect(validarMonto(NaN).valido).toBe(false)
  })
})

describe('diasRestantes', () => {
  // Fecha fija como "hoy" para que el test no dependa del día en que corre
  const hoy = new Date(2026, 6, 6) // 6 de julio 2026

  it('cuenta los días hasta el vencimiento', () => {
    expect(diasRestantes('2026-08-06', hoy)).toBe(31)
    expect(diasRestantes('2026-08-03', hoy)).toBe(28)
  })

  it('devuelve 0 si vence hoy y negativo si ya venció', () => {
    expect(diasRestantes('2026-07-06', hoy)).toBe(0)
    expect(diasRestantes('2026-07-01', hoy)).toBe(-5)
  })
})

describe('estadoPrestamo', () => {
  const hoy = new Date(2026, 6, 6)

  it('pagado tiene prioridad sobre las fechas', () => {
    expect(estadoPrestamo({ pagado: true, vencimiento: '2026-01-01' }, hoy)).toBe('pagado')
  })

  it('vencido si la fecha ya pasó', () => {
    expect(estadoPrestamo({ pagado: false, vencimiento: '2026-07-01' }, hoy)).toBe('vencido')
  })

  it('por_vencer si faltan 5 días o menos', () => {
    expect(estadoPrestamo({ pagado: false, vencimiento: '2026-07-11' }, hoy)).toBe('por_vencer')
    expect(estadoPrestamo({ pagado: false, vencimiento: '2026-07-06' }, hoy)).toBe('por_vencer')
  })

  it('activo si falta más de 5 días', () => {
    expect(estadoPrestamo({ pagado: false, vencimiento: '2026-08-06' }, hoy)).toBe('activo')
  })
})

describe('fechasRecordatorio (regla: 5 días antes + mismo día)', () => {
  it('calcula ambos recordatorios para Luis/Patricia/María', () => {
    expect(fechasRecordatorio('2026-08-06')).toEqual({
      primero: '2026-08-01',
      segundo: '2026-08-06',
    })
  })

  it('calcula ambos recordatorios para Tía Frida', () => {
    expect(fechasRecordatorio('2026-08-03')).toEqual({
      primero: '2026-07-29',
      segundo: '2026-08-03',
    })
  })

  it('cruza límite de mes correctamente', () => {
    expect(fechasRecordatorio('2026-08-02').primero).toBe('2026-07-28')
  })
})

describe('generarTablaReferencia', () => {
  const tabla = generarTablaReferencia()

  it('va de 50.000 a 500.000 en pasos de 50.000 (10 filas)', () => {
    expect(tabla).toHaveLength(10)
    expect(tabla[0].monto).toBe(50_000)
    expect(tabla.at(-1).monto).toBe(500_000)
  })

  it('cada fila es consistente: total = monto + interés', () => {
    for (const fila of tabla) {
      expect(fila.total).toBe(fila.monto + fila.interes)
      expect(fila.interes).toBe(fila.monto * 0.2)
    }
  })
})
