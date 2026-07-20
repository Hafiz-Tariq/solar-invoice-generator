import { useState, useRef, useEffect, useMemo } from 'react'
import type { InvoiceData, InvoiceItem, AppView, StoredCustomer, StoredInvoice, StoredPayment } from './types'
import { loadAppData, saveAppData, generateId } from './utils'
import InvoiceForm from './components/InvoiceForm'
import InvoicePreview from './components/InvoicePreview'
import InvoiceActions from './components/InvoiceActions'
import CustomerDashboard from './components/CustomerDashboard'
import CustomerHistory from './components/CustomerHistory'
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

  const [items, setItems] = useState<InvoiceItem[]>(defaultItems)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [discount, setDiscount] = useState(0)
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber())
  const [invoiceDate, setInvoiceDate] = useState(todayString())

  // Payment recording during invoice creation
  const [newPayments, setNewPayments] = useState<Omit<StoredPayment, 'id' | 'customerId' | 'createdAt'>[]>([])
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(todayString())
  const [paymentNote, setPaymentNote] = useState('')

  // Payment recording on saved invoice
  const [savedPaymentAmount, setSavedPaymentAmount] = useState('')
  const [savedPaymentDate, setSavedPaymentDate] = useState(todayString())
  const [savedPaymentNote, setSavedPaymentNote] = useState('')

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
    setNewPayments([])
    setPaymentAmount('')
    setPaymentDate(todayString())
    setPaymentNote('')
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

  const handleAddPaymentOnCreate = () => {
    const amt = Number(paymentAmount.replace(/[^0-9.]/g, ''))
    if (!amt || amt <= 0) return
    setNewPayments((prev) => [...prev, { amount: amt, date: paymentDate, note: paymentNote.trim(), invoiceId: undefined }])
    setPaymentAmount('')
    setPaymentNote('')
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

    const invoiceId = generateId()
    const totalPaid = newPayments.reduce((s, p) => s + p.amount, 0)

    const storedInvoice: StoredInvoice = {
      id: invoiceId, invoiceNumber, customerId: customer.id, date: invoiceDate,
      items, subtotal, discount, grandTotal, paidAmount: totalPaid, createdAt: new Date().toISOString(),
    }

    const savedPayments: StoredPayment[] = newPayments.map((p) => ({
      id: generateId(), customerId: customer!.id, invoiceId,
      date: p.date, amount: p.amount, note: p.note, createdAt: new Date().toISOString(),
    }))

    setData((prev) => ({
      ...prev, invoices: [...prev.invoices, storedInvoice],
      payments: [...prev.payments, ...savedPayments],
    }))

    navigate({ name: 'saved-invoice', invoiceId, customerId: customer.id })
  }

  const handleRecordPaymentOnSaved = () => {
    if (view.name !== 'saved-invoice') return
    const amt = Number(savedPaymentAmount.replace(/[^0-9.]/g, ''))
    if (!amt || amt <= 0) return

    const payment: StoredPayment = {
      id: generateId(), customerId: view.customerId, invoiceId: view.invoiceId,
      date: savedPaymentDate, amount: amt, note: savedPaymentNote.trim(), createdAt: new Date().toISOString(),
    }

    setData((prev) => ({
      invoices: prev.invoices.map((i) =>
        i.id === view.invoiceId ? { ...i, paidAmount: i.paidAmount + amt } : i
      ),
      payments: [...prev.payments, payment],
      customers: prev.customers,
    }))

    setSavedPaymentAmount('')
    setSavedPaymentNote('')
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

  const handlePdfFromSaved = async () => {
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
    const invNum = view.name === 'saved-invoice' ? data.invoices.find(i => i.id === view.invoiceId)?.invoiceNumber || 'invoice' : 'invoice'
    pdf.save(`Invoice-${invNum}.pdf`)
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

  // Resolve saved invoice data for the saved-invoice view
  const savedInvoiceData = useMemo(() => {
    if (view.name !== 'saved-invoice') return null
    const inv = data.invoices.find((i) => i.id === view.invoiceId)
    if (!inv) return null
    const cust = data.customers.find((c) => c.id === inv.customerId)
    const invPayments = data.payments.filter((p) => p.invoiceId === inv.id)
    return {
      invoiceData: {
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        customer: { name: cust?.name || '', address: cust?.address || '', phone: cust?.phone || '', email: cust?.email || '' },
        items: inv.items,
        subtotal: inv.subtotal,
        discount: inv.discount,
        grandTotal: inv.grandTotal,
      } as InvoiceData,
      payments: invPayments,
    }
  }, [view, data])

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', border: '1px solid #d9d9d9', borderRadius: 6, fontSize: 13,
  }

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
             view.name === 'history' ? 'Customer history' :
             'Invoice details'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            style={{
              background: '#eee', color: '#333',
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

      {/* Dashboard */}
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

      {/* Invoice creation */}
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

            {/* Record Payment section during invoice creation */}
            <div className="no-print" style={{
              background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16,
              border: '1px solid #e0e0e0',
            }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 10 }}>Record Payment</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 2 }}>Date</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    style={{ ...inputStyle, width: 140 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 2 }}>Amount (PKR)</label>
                  <input type="text" value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="e.g. 50000" style={{ ...inputStyle, width: 120 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 2 }}>Note</label>
                  <input type="text" value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="e.g. Advance" style={{ ...inputStyle, width: 150 }} />
                </div>
                <button onClick={handleAddPaymentOnCreate}
                  style={{
                    background: '#3498db', color: '#fff', border: 'none', borderRadius: 6,
                    padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  }}>
                  Add
                </button>
              </div>
              {newPayments.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {newPayments.map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#555', padding: '2px 0' }}>
                      {p.date} — PKR {p.amount.toLocaleString()}{p.note ? ` (${p.note})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div ref={previewRef}>
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      )}

      {/* Customer history */}
      {view.name === 'history' && (
        <CustomerHistory
          customer={data.customers.find((c) => c.id === view.customerId)!}
          invoices={data.invoices}
          payments={data.payments}
          onViewInvoice={(invoiceId) => navigate({ name: 'saved-invoice', invoiceId, customerId: view.customerId })}
          onBack={() => navigate({ name: 'dashboard' })}
          onNewInvoice={() => { resetForm(view.customerId); navigate({ name: 'invoice' }) }}
        />
      )}

      {/* Saved invoice view */}
      {view.name === 'saved-invoice' && savedInvoiceData && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => navigate({ name: 'history', customerId: view.customerId })}
              style={{
                background: 'none', border: 'none', color: '#1a1a2e', cursor: 'pointer',
                fontSize: 14, padding: '4px 0', fontWeight: 600,
              }}
            >
              &larr; Back to {data.customers.find((c) => c.id === view.customerId)?.name || 'history'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={handlePdfFromSaved}
              style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Download PDF
            </button>
            <button onClick={handlePrint}
              style={{ background: '#2c3e50', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Print
            </button>
            <button
              onClick={() => {
                const inv = savedInvoiceData;
                const lines = [
                  `*Solar Invoice #${inv.invoiceData.invoiceNumber}*`,
                  `Date: ${inv.invoiceData.date}`,
                  `Customer: ${inv.invoiceData.customer.name || 'N/A'}`,
                  '',
                  '--- Items ---',
                  ...inv.invoiceData.items.map((i) => `${i.description} x${i.quantity} @ PKR ${i.unitPrice.toLocaleString()} = PKR ${i.total.toLocaleString()}`),
                  '',
                  `Subtotal: PKR ${inv.invoiceData.subtotal.toLocaleString()}`,
                  inv.invoiceData.discount > 0 ? `Discount: PKR ${inv.invoiceData.discount.toLocaleString()}` : '',
                  `*Total: PKR ${inv.invoiceData.grandTotal.toLocaleString()}*`,
                ]
                window.open(`https://wa.me/?text=${encodeURIComponent(lines.filter(Boolean).join('\n'))}`, '_blank')
              }}
              style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              Share on WhatsApp
            </button>
          </div>

          {/* Record Payment on saved invoice */}
          <div className="no-print" style={{
            background: '#f8f9fa', borderRadius: 10, padding: 16, marginBottom: 16,
            border: '1px solid #e0e0e0',
          }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 10 }}>Record Payment</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 2 }}>Date</label>
                <input type="date" value={savedPaymentDate} onChange={(e) => setSavedPaymentDate(e.target.value)}
                  style={{ ...inputStyle, width: 140 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 2 }}>Amount (PKR)</label>
                <input type="text" value={savedPaymentAmount}
                  onChange={(e) => setSavedPaymentAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 50000" style={{ ...inputStyle, width: 120 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 2 }}>Note</label>
                <input type="text" value={savedPaymentNote}
                  onChange={(e) => setSavedPaymentNote(e.target.value)}
                  placeholder="e.g. Cash" style={{ ...inputStyle, width: 150 }} />
              </div>
              <button onClick={handleRecordPaymentOnSaved}
                style={{
                  background: '#3498db', color: '#fff', border: 'none', borderRadius: 6,
                  padding: '7px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                }}>
                Add Payment
              </button>
            </div>
          </div>

          <div ref={previewRef}>
            <InvoicePreview invoice={savedInvoiceData.invoiceData} payments={savedInvoiceData.payments} />
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddCustomer && (
        <AddCustomerModal onSave={handleAddCustomer} onCancel={() => setShowAddCustomer(false)} />
      )}
    </div>
  )
}
