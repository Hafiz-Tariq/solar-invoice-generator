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
