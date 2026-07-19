import { useState } from 'react'

interface Props {
  customerName: string
  preselectedInvoiceId?: string
  invoiceOptions: { id: string; label: string }[]
  onSave: (data: { invoiceId?: string; date: string; amount: number; note: string }) => void
  onCancel: () => void
}

export default function PaymentForm({ customerName, preselectedInvoiceId, invoiceOptions, onSave, onCancel }: Props) {
  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId || '')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(amount.replace(/[^0-9.]/g, ''))
    if (!amt || amt <= 0) return
    onSave({ invoiceId: invoiceId || undefined, date, amount: amt, note: note.trim() })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 12, padding: 28, width: 400,
        maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ fontSize: 17, color: '#1a1a2e', marginBottom: 16 }}>Record Payment — {customerName}</h3>

        {!preselectedInvoiceId && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Invoice (optional)</label>
            <select
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
                borderRadius: 6, fontSize: 14, appearance: 'auto',
              }}
            >
              <option value="">General payment (no specific invoice)</option>
              {invoiceOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
              borderRadius: 6, fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Amount (PKR)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 50000"
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
              borderRadius: 6, fontSize: 14,
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Cash payment"
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
              borderRadius: 6, fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#eee', color: '#333', border: 'none', borderRadius: 6,
              padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: '#3498db', color: '#fff', border: 'none', borderRadius: 6,
              padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            Save Payment
          </button>
        </div>
      </form>
    </div>
  )
}
