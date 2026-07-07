// data/seedLoans.js — Datos iniciales reales (de la planificación en Drive).
// Hoy alimentan la UI directamente; en la siguiente fase estos mismos datos
// se migran a Firestore y este archivo pasa a ser solo el "seed" inicial.
//
// Estructura de un préstamo (será el schema de la colección "loans"):
//   id            string único
//   prestatario   nombre de la persona
//   principal     monto prestado (CLP)
//   fechaPrestamo ISO yyyy-mm-dd
//   vencimiento   ISO yyyy-mm-dd
//   horaLimite    string opcional ("12:00 p.m.")
//   pagado        boolean
import { calcularInteres, calcularTotal } from '../utils/calculations.js'

const base = [
  {
    id: 'frida-2026-07',
    prestatario: 'Tía Frida',
    principal: 100_000,
    fechaPrestamo: '2026-07-03',
    vencimiento: '2026-08-03',
    horaLimite: null,
    pagado: false,
  },
  {
    id: 'luis-2026-07',
    prestatario: 'Luis Tata',
    principal: 50_000,
    fechaPrestamo: '2026-07-06',
    vencimiento: '2026-08-06',
    horaLimite: '12:00 p.m.',
    pagado: false,
  },
  {
    id: 'patricia-2026-07',
    prestatario: 'Patricia Calderón',
    principal: 100_000,
    fechaPrestamo: '2026-07-06',
    vencimiento: '2026-08-06',
    horaLimite: '12:00 p.m.',
    pagado: false,
  },
  {
    id: 'maria-2026-07',
    prestatario: 'María Lorena',
    principal: 50_000,
    fechaPrestamo: '2026-07-06',
    vencimiento: '2026-08-06',
    horaLimite: '12:00 p.m.',
    pagado: false,
  },
]

// El interés y el total SIEMPRE se derivan con las funciones de negocio.
// Así, si mañana cambia la tasa, no hay números "mágicos" desparramados.
export const seedLoans = base.map((p) => ({
  ...p,
  interes: calcularInteres(p.principal),
  total: calcularTotal(p.principal),
}))
