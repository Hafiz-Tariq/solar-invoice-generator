import type { InvoiceData } from '../types'
import { numberToWords } from '../utils'

interface Props {
  invoice: InvoiceData
}

function fmt(n: number): string {
  return `PKR ${n.toLocaleString()}`
}

export default function InvoicePreview({ invoice }: Props) {
  const { customer, items, subtotal, discount, grandTotal } = invoice
  const discountPct = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0

  return (
    <div className="invoice-preview" style={{
      background: '#fff',
      borderRadius: 12,
      padding: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #1a1a2e' }}>
        <div>
          <h1 style={{ fontSize: 22, color: '#1a1a2e', margin: 0, letterSpacing: 1 }}>SOLAR INVOICE</h1>
          <p style={{ color: '#666', marginTop: 4, fontSize: 12 }}>Solar Installation Services</p>
          <div style={{ marginTop: 10, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
            <p><strong>Hafiz Traders</strong></p>
            <p>123 Main Street, Lahore</p>
            <p>+92 300 1234567</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 700, fontSize: 14 }}>#{invoice.invoiceNumber}</p>
          <p style={{ color: '#666', fontSize: 12 }}>{invoice.date}</p>
        </div>
      </div>

      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#1a1a2e' }}>Bill To:</p>
        <p style={{ fontSize: 14 }}>{customer.name || '—'}</p>
        {customer.address && <p style={{ color: '#555' }}>{customer.address}</p>}
        {customer.phone && <p style={{ color: '#555' }}>{customer.phone}</p>}
        {customer.email && <p style={{ color: '#555' }}>{customer.email}</p>}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #1a1a2e' }}>
            <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: '#555' }}>#</th>
            <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: '#555' }}>DESCRIPTION</th>
            <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: 12, color: '#555' }}>QTY</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: '#555' }}>UNIT PRICE</th>
            <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: '#555' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} style={{
              borderBottom: '1px solid #eee',
              background: idx % 2 === 0 ? '#fff' : '#f8f9fa',
            }}>
              <td style={{ padding: '10px 4px', color: '#888', width: 30, textAlign: 'center' }}>{idx + 1}</td>
              <td style={{ padding: '10px 4px' }}>
                {item.description}
                {item.make && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    MAKE: {item.make}
                  </div>
                )}
              </td>
              <td style={{ textAlign: 'center', padding: '10px 4px' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '10px 4px' }}>{fmt(item.unitPrice)}</td>
              <td style={{ textAlign: 'right', padding: '10px 4px', fontWeight: 600 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ maxWidth: '50%' }}>
          <p style={{ fontSize: 12, color: '#555', fontStyle: 'italic' }}>
            Amount in words:
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginTop: 4 }}>
            Rupees {numberToWords(grandTotal)} only
          </p>
        </div>
        <div style={{ minWidth: 240 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ color: '#555' }}>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#555' }}>Discount ({discountPct}%)</span>
              <span style={{ color: '#e74c3c' }}>-{fmt(discount)}</span>
            </div>
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0 4px',
            borderTop: '2px solid #1a1a2e',
            marginTop: 4,
            fontWeight: 700,
            fontSize: 16,
          }}>
            <span>Grand Total</span>
            <span>{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>Received By</p>
          <div style={{ width: 160, borderBottom: '1px solid #333', height: 24 }} />
          <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Signature</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>For Hafiz Traders</p>
          <div style={{ width: 160, borderBottom: '1px solid #333', height: 24, marginLeft: 'auto' }} />
          <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Authorized Signature</p>
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #eee', textAlign: 'center', color: '#888', fontSize: 11 }}>
        <p>Thank you for your business!</p>
        <p style={{ marginTop: 2 }}>Payment due within 14 days. | Hafiz Traders — Solar Solutions</p>
      </div>
    </div>
  )
}
