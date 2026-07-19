import type { StoredCustomer, StoredInvoice, StoredPayment } from '../types'

interface Props {
  customers: StoredCustomer[]
  invoices: StoredInvoice[]
  payments: StoredPayment[]
  onSelectCustomer: (id: string) => void
  onNewInvoice: (customerId?: string) => void
  onAddCustomer: () => void
}

function customerBalance(customerId: string, invoices: StoredInvoice[], payments: StoredPayment[]): number {
  const totalInvoiced = invoices
    .filter((i) => i.customerId === customerId)
    .reduce((s, i) => s + i.grandTotal, 0)
  const totalPaid = payments
    .filter((p) => p.customerId === customerId)
    .reduce((s, p) => s + p.amount, 0)
  return totalInvoiced - totalPaid
}

function lastInvoiceDate(customerId: string, invoices: StoredInvoice[]): string {
  const customerInvoices = invoices.filter((i) => i.customerId === customerId)
  if (customerInvoices.length === 0) return '—'
  return customerInvoices.sort((a, b) => b.date.localeCompare(a.date))[0].date
}

export default function CustomerDashboard({ customers, invoices, payments, onSelectCustomer, onNewInvoice, onAddCustomer }: Props) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, color: '#1a1a2e' }}>Customers</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onAddCustomer}
            style={{
              background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6,
              padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            + New Customer
          </button>
          <button
            onClick={() => onNewInvoice()}
            style={{
              background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6,
              padding: '10px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            + New Invoice
          </button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>No customers yet</p>
          <p style={{ fontSize: 13 }}>Add a customer or create an invoice to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.map((c) => {
            const balance = customerBalance(c.id, invoices, payments)
            return (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', borderRadius: 10, padding: '14px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer',
                  border: '1px solid #eee', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)')}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: 15, color: '#1a1a2e' }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {c.phone || '—'} &middot; Last invoice: {lastInvoiceDate(c.id, invoices)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: balance > 0 ? '#e74c3c' : '#27ae60' }}>
                    {balance > 0 ? 'PKR ' + balance.toLocaleString() : balance === 0 ? 'PKR 0' : 'PKR ' + balance.toLocaleString()}
                  </p>
                  <p style={{ fontSize: 11, color: '#888' }}>{balance > 0 ? 'Outstanding' : balance === 0 ? 'Cleared' : 'Credit'}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
