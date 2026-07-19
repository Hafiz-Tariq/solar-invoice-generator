import { useState, useRef, useEffect, useMemo } from 'react'
import type { InvoiceData, InvoiceItem, AppView, StoredCustomer, StoredInvoice, StoredPayment } from './types'
import { loadAppData, saveAppData, generateId } from './utils'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import InvoiceActions from './components/InvoiceActions'
import CustomerDashboard from './components/CustomerDashboard'
import CustomerHistory from './components/CustomerHistory'
import PaymentForm from './components/PaymentForm'
import AddCustomerModal from './components/AddCustomerModal'

const defaultItems: InvoiceItem[] = [
  { description: 'Solar Panel 550W Mono', quantity: 6, unitPrice: 15000, total: 90000 },
  { description: 'Inverter 5kW Hybrid', quantity: 1, unitPrice: 85000, total: 85000 },
  { description: 'Battery 5.12kWh Lithium', quantity: 2, unitPrice: 120000, total: 240000 },
  { description: 'Mounting Structure + Wiring', quantity: 1, unitPrice: 25000, total: 25000 },
  { description: 'Installation & Commissioning', quantity: 1, unitPrice: 15000, total: 15000 },
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

  const [view, setView] = useState<AppView>({ name: 'dashboard' })
  const [data, setData] = useState(() => loadAppData())
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | undefined>(undefined)

  const [items, setItems] = useState<InvoiceItem[]>(defaultItems)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [discount, setDiscount] = useState(0)
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber())
  const [invoiceDate, setInvoiceDate] = useState(todayString())

  useEffect(() => {
    saveAppData(data)
  }, [data])

  const { subtotal } = calcTotals(items)
  const grandTotal = subtotal - discount

  const existingCustomerNames = useMemo(() => data.customers.map((c) => c.name), [data.customers])

  const invoice: InvoiceData = {
    invoiceNumber, date: invoiceDate,
    customer: { name: customerName, address: customerAddress, phone: customerPhone, email: customerEmail },
    items, subtotal, discount, grandTotal,
  }

  const navigate = (v: AppView) => setView(v)

  const resetForm = (customerId?: string) => {
    setItems(defaultItems)
    setDiscount(0)
    setInvoiceNumber(generateInvoiceNumber())
    setInvoiceDate(todayString())
    if (customerId) {
      const c = data.customers.find((x) => x.id === customerId)
      if (c) {
        setCustomerName(c.name)
        setCustomerAddress(c.address)
        setCustomerPhone(c.phone)
        setCustomerEmail(c.email)
      }
    } else {
      setCustomerName('')
      setCustomerAddress('')
      setCustomerPhone('')
      setCustomerEmail('')
    }
  }

  const handleAddCustomer = (c: { name: string; address: string; phone: string; email: string }) => {
    const newCustomer: StoredCustomer = { id: generateId(), ...c, createdAt: new Date().toISOString() }
    setData((prev) => ({ ...prev, customers: [...prev.customers, newCustomer] }))
    setShowAddCustomer(false)
  }

  const handleSaveInvoice = () => {
    if (!customerName.trim()) return

    let customer = data.customers.find((c) => c.name === customerName.trim())
    if (!customer) {
      customer = {
        id: generateId(), name: customerName.trim(), address: customerAddress.trim(),
        phone: customerPhone.trim(), email: customerEmail.trim(), createdAt: new Date().toISOString(),
      }
      setData((prev) => ({ ...prev, customers: [...prev.customers, customer!] }))
    }

    const storedInvoice: StoredInvoice = {
      id: generateId(), invoiceNumber, customerId: customer.id, date: invoiceDate,
      items, subtotal, discount, grandTotal, paidAmount: 0, createdAt: new Date().toISOString(),
    }
    setData((prev) => ({ ...prev, invoices: [...prev.invoices, storedInvoice] }))
    navigate({ name: 'history', customerId: customer.id })
  }

  const handleRecordPayment = (invoiceId?: string) => {
    setPaymentInvoiceId(invoiceId)
    setShowPaymentForm(true)
  }

  const handleSavePayment = (p: { invoiceId?: string; date: string; amount: number; note: string }) => {
    const payment: StoredPayment = {
      id: generateId(), customerId: view.name === 'history' ? view.customerId : '',
      invoiceId: p.invoiceId, date: p.date, amount: p.amount, note: p.note, createdAt: new Date().toISOString(),
    }
    setData((prev) => {
      let invoices = prev.invoices
      if (p.invoiceId) {
        invoices = invoices.map((i) =>
          i.id === p.invoiceId ? { ...i, paidAmount: i.paidAmount + p.amount } : i
        )
      }
      return { ...prev, invoices, payments: [...prev.payments, payment] }
    })
    setShowPaymentForm(false)
  }

  const handleSelectCustomer = (customerId: string) => {
    const c = data.customers.find((x) => x.id === customerId)
    if (c) {
      setCustomerName(c.name)
      setCustomerAddress(c.address)
      setCustomerPhone(c.phone)
      setCustomerEmail(c.email)
    }
    navigate({ name: 'history', customerId })
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
      ...invoice.items.map((i) => `${i.description} x${i.quantity} @ PKR ${i.unitPrice.toLocaleString()} = PKR ${i.total.toLocaleString()}`),
      '',
      `Subtotal: PKR ${invoice.subtotal.toLocaleString()}`,
      invoice.discount > 0 ? `Discount: PKR ${invoice.discount.toLocaleString()}` : '',
      `*Total: PKR ${invoice.grandTotal.toLocaleString()}*`,
    ]
    const text = lines.filter(Boolean).join('\n')
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const invoiceOptions = view.name === 'history'
    ? data.invoices.filter((i) => i.customerId === view.customerId).map((i) => ({
        id: i.id, label: `${i.invoiceNumber} — PKR ${(i.grandTotal - i.paidAmount).toLocaleString()} remaining`,
      }))
    : []

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      {/* Nav */}
      <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1
            onClick={() => navigate({ name: 'dashboard' })}
            style={{ fontSize: 24, color: '#1a1a2e', cursor: 'pointer' }}
          >
            Solar Invoice Generator
          </h1>
          <p style={{ color: '#666', marginTop: 2, fontSize: 13 }}>
            {view.name === 'dashboard' ? 'Customer dashboard' :
             view.name === 'invoice' ? 'Create invoice' :
             'Customer history'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            style={{
              background: view.name === 'dashboard' ? '#1a1a2e' : '#eee',
              color: view.name === 'dashboard' ? '#fff' : '#333',
              border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
          >
            Customers
          </button>
          <button
            onClick={() => { resetForm(); navigate({ name: 'invoice' }) }}
            style={{
              background: view.name === 'invoice' ? '#27ae60' : '#eee',
              color: view.name === 'invoice' ? '#fff' : '#333',
              border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}
          >
            + Invoice
          </button>
        </div>
      </header>

      {/* Content */}
      {view.name === 'dashboard' && (
        <CustomerDashboard
          customers={data.customers}
          invoices={data.invoices}
          payments={data.payments}
          onSelectCustomer={handleSelectCustomer}
          onNewInvoice={() => { resetForm(); navigate({ name: 'invoice' }) }}
          onAddCustomer={() => setShowAddCustomer(true)}
        />
      )}

      {view.name === 'invoice' && (
        <div className="app-grid">
          <InvoiceForm
            customerName={customerName} setCustomerName={setCustomerName}
            customerAddress={customerAddress} setCustomerAddress={setCustomerAddress}
            customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
            customerEmail={customerEmail} setCustomerEmail={setCustomerEmail}
            items={items} setItems={setItems}
            discount={discount} setDiscount={setDiscount}
            subtotal={subtotal} grandTotal={grandTotal}
            invoiceNumber={invoiceNumber} setInvoiceNumber={setInvoiceNumber}
            invoiceDate={invoiceDate} setInvoiceDate={setInvoiceDate}
            generateInvoiceNumber={() => setInvoiceNumber(generateInvoiceNumber())}
            existingCustomerNames={existingCustomerNames}
          />
          <div>
            <InvoiceActions
              onPrint={handlePrint}
              onPdf={handlePdf}
              onWhatsApp={handleWhatsApp}
              onSaveInvoice={handleSaveInvoice}
              customerName={customerName}
            />
            <div ref={previewRef}>
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      )}

      {view.name === 'history' && (
        <CustomerHistory
          customer={data.customers.find((c) => c.id === view.customerId)!}
          invoices={data.invoices}
          payments={data.payments}
          onRecordPayment={handleRecordPayment}
          onBack={() => navigate({ name: 'dashboard' })}
          onNewInvoice={() => { resetForm(view.customerId); navigate({ name: 'invoice' }) }}
        />
      )}

      {/* Modals */}
      {showAddCustomer && (
        <AddCustomerModal onSave={handleAddCustomer} onCancel={() => setShowAddCustomer(false)} />
      )}

      {showPaymentForm && view.name === 'history' && (
        <PaymentForm
          customerName={data.customers.find((c) => c.id === view.customerId)?.name || ''}
          preselectedInvoiceId={paymentInvoiceId}
          invoiceOptions={invoiceOptions}
          onSave={handleSavePayment}
          onCancel={() => setShowPaymentForm(false)}
        />
      )}
    </div>
  )
}
