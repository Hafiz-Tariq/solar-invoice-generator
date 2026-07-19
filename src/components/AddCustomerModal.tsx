import { useState } from 'react'

interface Props {
  onSave: (data: { name: string; address: string; phone: string; email: string }) => void
  onCancel: () => void
}

export default function AddCustomerModal({ onSave, onCancel }: Props) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), address: address.trim(), phone: phone.trim(), email: email.trim() })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 12, padding: 28, width: 420,
        maxWidth: '90vw', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      }}>
        <h3 style={{ fontSize: 17, color: '#1a1a2e', marginBottom: 16 }}>New Customer</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Full Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
              borderRadius: 6, fontSize: 14,
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
              borderRadius: 6, fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              width: '100%', padding: '8px 10px', border: '1px solid #d9d9d9',
              borderRadius: 6, fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 6,
              padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            Add Customer
          </button>
        </div>
      </form>
    </div>
  )
}
