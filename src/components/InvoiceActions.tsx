interface Props {
  onPrint: () => void
  onPdf: () => void
  onWhatsApp: () => void
  onSaveInvoice: () => void
  customerName: string
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 20px',
  border: 'none',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

export default function InvoiceActions({ onPrint, onPdf, onWhatsApp, onSaveInvoice, customerName }: Props) {
  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        gap: 10,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={onSaveInvoice}
        style={{ ...btnBase, background: '#1a1a2e', color: '#fff' }}
        disabled={!customerName.trim()}
        title={!customerName.trim() ? 'Enter customer name first' : ''}
      >
        Save Invoice
      </button>
      <button
        onClick={onPdf}
        style={{ ...btnBase, background: '#e74c3c', color: '#fff' }}
      >
        Download PDF
      </button>
      <button
        onClick={onPrint}
        style={{ ...btnBase, background: '#2c3e50', color: '#fff' }}
      >
        Print
      </button>
      <button
        onClick={onWhatsApp}
        style={{ ...btnBase, background: '#25D366', color: '#fff' }}
      >
        Share on WhatsApp
      </button>
    </div>
  )
}
