import type { StoredCustomer, StoredInvoice, StoredPayment } from '../types'

interface Props {
  customer: StoredCustomer
  invoices: StoredInvoice[]
  payments: StoredPayment[]
  onViewInvoice: (invoiceId: string) => void
  onBack: () => void
  onNewInvoice: () => void
}

function fmt(n: number): string {
  return 'PKR ' + n.toLocaleString()
}

export default function CustomerHistory({ customer, invoices, payments, onViewInvoice, onBack, onNewInvoice }: Props) {
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id).sort((a, b) => b.date.localeCompare(a.date))
  const customerPayments = payments.filter((p) => p.customerId === customer.id).sort((a, b) => b.date.localeCompare(a.date))

  const totalInvoiced = customerInvoices.reduce((s, i) => s + i.grandTotal, 0)
  const totalPaid = customerPayments.reduce((s, p) => s + p.amount, 0)
  const balance = totalInvoiced - totalPaid

  const allEntries: { date: string; type: 'invoice' | 'payment'; invoiceId?: string; amount: number; invoiceNumber?: string; note?: string; item: StoredInvoice | StoredPayment }[] = [
    ...customerInvoices.map((i) => ({ date: i.date, type: 'invoice' as const, invoiceId: i.id, amount: i.grandTotal, invoiceNumber: i.invoiceNumber, item: i })),
    ...customerPayments.map((p) => ({ date: p.date, type: 'payment' as const, invoiceId: p.invoiceId, amount: -p.amount, note: p.note, item: p })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  let running = 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', color: '#1a1a2e', cursor: 'pointer',
              fontSize: 20, padding: '4px 8px', fontWeight: 700,
            }}
          >
            &larr;
          </button>
          <div>
            <h2 style={{ fontSize: 20, color: '#1a1a2e' }}>{customer.name}</h2>
            <p style={{ fontSize: 12, color: '#888' }}>
              {customer.phone || '—'} {customer.address ? '· ' + customer.address : ''}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: balance > 0 ? '#e74c3c' : '#27ae60' }}>
            {fmt(Math.abs(balance))}
          </p>
          <p style={{ fontSize: 11, color: '#888' }}>
            {balance > 0 ? 'Outstanding' : balance === 0 ? 'All Cleared' : 'In Credit'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={onNewInvoice}
          style={{
            background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6,
            padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          }}
        >
          New Invoice
        </button>
      </div>

      {allEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          <p>No activity yet for this customer.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {allEntries.map((entry) => {
            running += entry.amount
            if (entry.type === 'invoice') {
              const inv = entry.item as StoredInvoice
              const invPayments = payments.filter((p) => p.invoiceId === inv.id)
              const paidOnInvoice = invPayments.reduce((s, p) => s + p.amount, 0)
              const remaining = inv.grandTotal - paidOnInvoice
              return (
                <div
                  key={inv.id}
                  onClick={() => onViewInvoice(inv.id)}
                  style={{
                    background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, marginBottom: 10, overflow: 'hidden',
                    cursor: 'pointer', transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8f9fa' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{inv.invoiceNumber}</span>
                      <span style={{ marginLeft: 10, fontSize: 12, color: '#888' }}>{inv.date}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: 15 }}>{fmt(inv.grandTotal)}</p>
                      {remaining > 0 && <p style={{ fontSize: 11, color: '#e74c3c' }}>{fmt(remaining)} remaining</p>}
                      {remaining === 0 && <p style={{ fontSize: 11, color: '#27ae60' }}>Paid in full</p>}
                    </div>
                  </div>
                  {invPayments.length > 0 && (
                    <div style={{ padding: '8px 16px 8px 32px', borderTop: '1px solid #f0f0f0' }}>
                      {invPayments.sort((a, b) => a.date.localeCompare(b.date)).map((p) => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', padding: '3px 0' }}>
                          <span>{p.date} {p.note ? '— ' + p.note : ''}</span>
                          <span style={{ color: '#27ae60' }}>-{fmt(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            const pmt = entry.item as StoredPayment
            return (
              <div key={pmt.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#f0faf0', border: '1px solid #d5f5d5', borderRadius: 8, marginBottom: 10,
                padding: '10px 16px',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                    Payment received
                    {pmt.invoiceId ? ` for ${invoices.find(i => i.id === pmt.invoiceId)?.invoiceNumber || ''}` : ''}
                  </p>
                  <p style={{ fontSize: 12, color: '#555' }}>{pmt.date} {pmt.note ? '— ' + pmt.note : ''}</p>
                </div>
                <p style={{ fontWeight: 700, color: '#27ae60', fontSize: 15 }}>-{fmt(pmt.amount)}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
