import type { AppData } from './types'

const STORAGE_KEY = 'solar-invoice-data'

export function numberToWords(n: number): string {
  if (n === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const convert = (num: number): string => {
    if (num < 20) return ones[num]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + convert(num % 100) : '')
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '')
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '')
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '')
  }
  return convert(Math.floor(n))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }

  const customers = [
    { id: 'c1', name: 'Muhammad Ali', address: '22-Gulberg III, Lahore', phone: '0300-1234567', email: 'm.ali@email.com', createdAt: '2026-03-10T08:00:00Z' },
    { id: 'c2', name: 'Ahmed Hassan', address: '15-Johar Town, Lahore', phone: '0301-7654321', email: 'ahmed.h@email.com', createdAt: '2026-02-15T10:00:00Z' },
    { id: 'c3', name: 'Bilal Ahmed', address: '8-DHA Phase V, Lahore', phone: '0302-9876543', email: 'bilal.a@email.com', createdAt: '2026-04-05T09:00:00Z' },
    { id: 'c4', name: 'Usman Khan', address: '33-Iqbal Town, Lahore', phone: '0303-5555555', email: 'usman.k@email.com', createdAt: '2026-05-01T11:00:00Z' },
    { id: 'c5', name: 'Saad Tariq', address: '7-Bahria Town, Lahore', phone: '0304-1112223', email: 'saad.t@email.com', createdAt: '2026-05-28T12:00:00Z' },
  ]

  const invoices = [
    {
      id: 'inv1', invoiceNumber: 'SOL-20260315-0001', customerId: 'c1', date: '2026-03-15',
      items: [
        { description: 'Solar Panel MONO-facial - 550W', quantity: 6, unitPrice: 90000, total: 540000 },
        { description: 'Inverter - 5kW', quantity: 1, unitPrice: 125000, total: 125000, make: 'Inverex' },
        { description: 'Battery Lithium - 5.12kWh', quantity: 2, unitPrice: 120000, total: 240000, make: 'Phoenix' },
        { description: 'Mounting Structure Pre-made - 6-Panel', quantity: 1, unitPrice: 35000, total: 35000 },
        { description: 'Wiring - 4mm²', quantity: 1, unitPrice: 15000, total: 15000, make: 'Double Core Copper' },
        { description: 'Installation & Commissioning', quantity: 1, unitPrice: 20000, total: 20000 },
      ],
      subtotal: 975000, discount: 25000, grandTotal: 950000, paidAmount: 500000, createdAt: '2026-03-15T14:00:00Z',
    },
    {
      id: 'inv2', invoiceNumber: 'SOL-20260220-0002', customerId: 'c2', date: '2026-02-20',
      items: [
        { description: 'Solar Panel BI-facial - 585W', quantity: 8, unitPrice: 80000, total: 640000, make: 'JA Solar' },
        { description: 'VFD - 5kW', quantity: 1, unitPrice: 95000, total: 95000, make: 'invt' },
        { description: 'Battery Tubular - 200Ah', quantity: 4, unitPrice: 60000, total: 240000, make: 'Osaka' },
        { description: 'DC Breaker - 63A', quantity: 1, unitPrice: 4500, total: 4500 },
        { description: 'Wiring - 10mm²', quantity: 1, unitPrice: 12000, total: 12000, make: 'Single Core Copper' },
      ],
      subtotal: 991500, discount: 0, grandTotal: 991500, paidAmount: 991500, createdAt: '2026-02-20T11:00:00Z',
    },
    {
      id: 'inv3', invoiceNumber: 'SOL-20260410-0003', customerId: 'c3', date: '2026-04-10',
      items: [
        { description: 'Solar Panel MONO-facial - 585W', quantity: 10, unitPrice: 90000, total: 900000, make: 'Longi' },
        { description: 'Inverter - 10kW', quantity: 1, unitPrice: 180000, total: 180000, make: 'Deye' },
        { description: 'Battery Lithium - 10.24kWh', quantity: 2, unitPrice: 280000, total: 560000, make: 'Tesla' },
        { description: 'Mounting Structure Self-made - 10-Panel', quantity: 1, unitPrice: 25000, total: 25000 },
        { description: 'AC/DC Distribution Box', quantity: 1, unitPrice: 8500, total: 8500 },
        { description: 'Voltage Protector', quantity: 1, unitPrice: 3500, total: 3500 },
      ],
      subtotal: 1677000, discount: 50000, grandTotal: 1627000, paidAmount: 0, createdAt: '2026-04-10T16:00:00Z',
    },
    {
      id: 'inv4', invoiceNumber: 'SOL-20260505-0004', customerId: 'c4', date: '2026-05-05',
      items: [
        { description: 'Solar Panel MONO-facial - 585W', quantity: 4, unitPrice: 85000, total: 340000, make: 'Trina Solar' },
        { description: 'Inverter - 3kW', quantity: 1, unitPrice: 72000, total: 72000, make: 'Solis' },
        { description: 'Battery Gel - 150Ah', quantity: 2, unitPrice: 35000, total: 70000, make: 'Exide' },
        { description: 'Change Over - 63A', quantity: 1, unitPrice: 3200, total: 3200 },
      ],
      subtotal: 485200, discount: 0, grandTotal: 485200, paidAmount: 200000, createdAt: '2026-05-05T10:00:00Z',
    },
    {
      id: 'inv5', invoiceNumber: 'SOL-20260601-0005', customerId: 'c5', date: '2026-06-01',
      items: [
        { description: 'Solar Panel MONO-facial - 585W', quantity: 8, unitPrice: 90000, total: 720000, make: 'JA Solar' },
        { description: 'Inverter - 5kW', quantity: 1, unitPrice: 125000, total: 125000, make: 'Axpert' },
        { description: 'Battery Lithium - 5.12kWh', quantity: 3, unitPrice: 140000, total: 420000, make: 'HOPPECKE' },
      ],
      subtotal: 1265000, discount: 0, grandTotal: 1265000, paidAmount: 1000000, createdAt: '2026-06-01T15:00:00Z',
    },
  ]

  const payments = [
    { id: 'p1', customerId: 'c1', invoiceId: 'inv1', date: '2026-03-25', amount: 300000, note: 'Bank transfer', createdAt: '2026-03-25T09:00:00Z' },
    { id: 'p2', customerId: 'c1', invoiceId: 'inv1', date: '2026-04-10', amount: 200000, note: 'Cash payment', createdAt: '2026-04-10T11:00:00Z' },
    { id: 'p3', customerId: 'c2', invoiceId: 'inv2', date: '2026-02-28', amount: 500000, note: 'Advance payment', createdAt: '2026-02-28T14:00:00Z' },
    { id: 'p4', customerId: 'c2', invoiceId: 'inv2', date: '2026-03-05', amount: 491500, note: 'Final settlement — cash', createdAt: '2026-03-05T10:00:00Z' },
    { id: 'p5', customerId: 'c4', invoiceId: 'inv4', date: '2026-05-20', amount: 200000, note: 'Partial payment — online transfer', createdAt: '2026-05-20T16:00:00Z' },
    { id: 'p6', customerId: 'c5', invoiceId: 'inv5', date: '2026-06-15', amount: 1000000, note: 'Bank transfer — HBL', createdAt: '2026-06-15T12:00:00Z' },
  ]

  return { customers, invoices, payments }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
