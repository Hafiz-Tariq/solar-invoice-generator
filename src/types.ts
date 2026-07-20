export interface InvoiceData {
  invoiceNumber: string
  date: string
  customer: {
    name: string
    address: string
    phone: string
    email: string
  }
  items: InvoiceItem[]
  subtotal: number
  discount: number
  grandTotal: number
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  make?: string
}

export interface StoredCustomer {
  id: string
  name: string
  address: string
  phone: string
  email: string
  createdAt: string
}

export interface StoredInvoice {
  id: string
  invoiceNumber: string
  customerId: string
  date: string
  items: InvoiceItem[]
  subtotal: number
  discount: number
  grandTotal: number
  paidAmount: number
  createdAt: string
}

export interface StoredPayment {
  id: string
  customerId: string
  invoiceId?: string
  date: string
  amount: number
  note: string
  createdAt: string
}

export interface AppData {
  customers: StoredCustomer[]
  invoices: StoredInvoice[]
  payments: StoredPayment[]
}

export type AppView =
  | { name: 'dashboard' }
  | { name: 'invoice'; customerId?: string }
  | { name: 'history'; customerId: string }
  | { name: 'saved-invoice'; invoiceId: string; customerId: string }
