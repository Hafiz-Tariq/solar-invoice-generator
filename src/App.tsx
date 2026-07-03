import { useState, useRef } from 'react'
import type { InvoiceData, InvoiceItem } from './types'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import InvoiceActions from './components/InvoiceActions'

const defaultItems: InvoiceItem[] = [
  {
    description: 'Solar Panel 550W Mono',
    quantity: 6,
    unitPrice: 15000,
    total: 90000,
  },
  {
    description: 'Inverter 5kW Hybrid',
    quantity: 1,
    unitPrice: 85000,
    total: 85000,
  },
  {
    description: 'Battery 5.12kWh Lithium',
    quantity: 2,
    unitPrice: 120000,
    total: 240000,
  },
  {
    description: 'Mounting Structure + Wiring',
    quantity: 1,
    unitPrice: 25000,
    total: 25000,
  },
  {
    description: 'Installation & Commissioning',
    quantity: 1,
    unitPrice: 15000,
    total: 15000,
  },
]

function calcTotals(items: InvoiceItem[]) {
  const subtotal = items.reduce((s, i) => s + i.total, 0)
  return { subtotal }
}

function generateInvoiceNumber(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 10000)
  return `SOL-${y}${m}${d}-${String(rand).padStart(4, '0')}`
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function App() {
  const previewRef = useRef<HTMLDivElement>(null)

  const [items, setItems] = useState<InvoiceItem[]>(defaultItems)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [discount, setDiscount] = useState(0)
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber())
  const [invoiceDate, setInvoiceDate] = useState(todayString())

  const { subtotal } = calcTotals(items)
  const grandTotal = subtotal - discount

  const invoice: InvoiceData = {
    invoiceNumber,
    date: invoiceDate,
    customer: {
      name: customerName,
      address: customerAddress,
      phone: customerPhone,
      email: customerEmail,
    },
    items,
    subtotal,
    discount,
    grandTotal,
  }

  const handlePrint = () => window.print()

  const handlePdf = async () => {
    const el = previewRef.current
    if (!el) return

    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default

    const canvas = await html2canvas(el, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
    pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`)
  }

  const handleWhatsApp = () => {
    const lines = [
      `*Solar Invoice #${invoice.invoiceNumber}*`,
      `Date: ${invoice.date}`,
      `Customer: ${invoice.customer.name || 'N/A'}`,
      '',
      '--- Items ---',
      ...invoice.items.map(
        (i) =>
          `${i.description} x${i.quantity} @ PKR ${i.unitPrice.toLocaleString()} = PKR ${i.total.toLocaleString()}`,
      ),
      '',
      `Subtotal: PKR ${invoice.subtotal.toLocaleString()}`,
      invoice.discount > 0
        ? `Discount: PKR ${invoice.discount.toLocaleString()}`
        : '',
      `*Total: PKR ${invoice.grandTotal.toLocaleString()}*`,
    ]
    const text = lines.filter(Boolean).join('\n')
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, color: '#1a1a2e' }}>
          Solar Invoice Generator
        </h1>
        <p style={{ color: '#666', marginTop: 4 }}>
          Fill in the details below to generate a professional invoice
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        <InvoiceForm
          customerName={customerName}
          setCustomerName={setCustomerName}
          customerAddress={customerAddress}
          setCustomerAddress={setCustomerAddress}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          items={items}
          setItems={setItems}
          discount={discount}
          setDiscount={setDiscount}
          invoiceNumber={invoiceNumber}
          setInvoiceNumber={setInvoiceNumber}
          invoiceDate={invoiceDate}
          setInvoiceDate={setInvoiceDate}
          generateInvoiceNumber={() => setInvoiceNumber(generateInvoiceNumber())}
        />

        <div>
          <InvoiceActions
            onPrint={handlePrint}
            onPdf={handlePdf}
            onWhatsApp={handleWhatsApp}
          />
          <div ref={previewRef}>
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>
    </div>
  )
}
