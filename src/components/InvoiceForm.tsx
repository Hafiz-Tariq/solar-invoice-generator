import { useState } from 'react'
import type { InvoiceItem } from '../types'

const SOLAR_ITEMS = [
  'Solar Panel MONO-facial',
  'Solar Panel BI-facial',
  'VFD',
  'Inverter',
  'Mounting Structure Pre-made',
  'Mounting Structure Self-made',
  'Wiring',
  'DC Breaker',
  'Change Over',
  'Installation & Commissioning',
  'AC/DC Distribution Box',
  'Voltage Protector',
  'Battery Lithium',
  'Battery Tubular',
  'Battery Gel',
  'Battery AGM',
  'Net Metering Setup',
]

const DEFAULT_WATTAGES = Array.from({ length: 34 }, (_, i) => `${585 + i * 5}W`)
const DEFAULT_KW = ['1kW', '1.5kW', '2.5kW', '3kW', '4kW', '5kW', '6kW', '7kW', '7.5kW', '10kW', '11kW', '15kW', '18.5kW', '22kW', '30kW', '37.5kW', '45kW']
const DEFAULT_KWH = ['2.4kWh', '5.12kWh', '7.68kWh', '10.24kWh', '15kWh', '20kWh']
const DEFAULT_AH = ['100Ah', '120Ah', '150Ah', '180Ah', '200Ah', '220Ah', '250Ah']
const DEFAULT_MM2 = ['2.5mm²', '4mm²', '6mm²', '10mm²', '7/.056', '7/.064', '7/.074']
const DEFAULT_PANEL = ['1-Panel', '2-Panel', '3-Panel', '4-Panel', '6-Panel', '8-Panel', '10-Panel', '12-Panel']
const DEFAULT_A = ['16A', '20A', '25A', '32A', '40A', '50A', '63A', '100A', '125A', '160A', '200A', '250A']
const DEFAULT_MAKES_SOLAR = ['JA Solar', 'Longi', 'Trina Solar', 'Canadian Solar', 'Jinko Solar', 'Yingli', 'Risen Energy', 'Talesun', 'Huasun', 'TW Solar']
const DEFAULT_MAKES_BATTERY = ['Phoenix', 'Exide', 'Osaka', 'Daewoo', 'HOPPECKE', 'AGS', 'Reon Energy', 'Tesla']
const DEFAULT_MAKES_INVERTER = ['Inverex', 'Axpert', 'Deye', 'Sofar Solar', 'Sungrow', 'Growatt', 'Huawei', 'Goodwe', 'Solis', 'ABB', 'Delta', 'Schneider']
const DEFAULT_MAKES_WIRING = ['Single Core Copper', 'Single Core Silver', 'Double Core Copper', 'Double Core Silver', 'Three Core Copper', 'Three Core Silver']

function hasWattageOptions(desc: string) {
  return desc === 'Solar Panel MONO-facial' || desc === 'Solar Panel BI-facial'
    || desc === 'VFD' || desc === 'Inverter'
    || desc === 'Battery Lithium' || desc === 'Battery Tubular'
    || desc === 'Battery Gel' || desc === 'Battery AGM'
    || desc === 'Wiring'
    || desc === 'Mounting Structure Pre-made' || desc === 'Mounting Structure Self-made'
    || desc === 'DC Breaker' || desc === 'Change Over'
}

function isSolarPanelDesc(desc: string) {
  return desc === 'Solar Panel MONO-facial' || desc === 'Solar Panel BI-facial'
}

function isBatteryDesc(desc: string) {
  return desc === 'Battery Lithium' || desc === 'Battery Tubular' || desc === 'Battery Gel' || desc === 'Battery AGM'
}

function isInverterDesc(desc: string) {
  return desc === 'VFD' || desc === 'Inverter'
}

function hasMakeOptions(desc: string) {
  return isSolarPanelDesc(desc) || isInverterDesc(desc) || isBatteryDesc(desc) || desc === 'Wiring'
}

function getUnit(desc: string): string {
  if (desc === 'VFD' || desc === 'Inverter') return 'kW'
  if (desc === 'Battery Lithium') return 'kWh'
  if (desc === 'Battery Tubular' || desc === 'Battery Gel' || desc === 'Battery AGM') return 'Ah'
  if (desc === 'Wiring') return 'mm²'
  if (desc === 'Mounting Structure Pre-made' || desc === 'Mounting Structure Self-made') return '-Panel'
  if (desc === 'DC Breaker' || desc === 'Change Over') return 'A'
  return 'W'
}

const suffixRe = / - [\d.]+(?:\/[\d.]+)?(?:A|W|kW|kWh|Ah|mm²|-Panel)?$/

interface Props {
  customerName: string
  setCustomerName: (v: string) => void
  customerAddress: string
  setCustomerAddress: (v: string) => void
  customerPhone: string
  setCustomerPhone: (v: string) => void
  customerEmail: string
  setCustomerEmail: (v: string) => void
  items: InvoiceItem[]
  setItems: (v: InvoiceItem[]) => void
  discount: number
  setDiscount: (v: number) => void
  subtotal: number
  grandTotal: number
  invoiceNumber: string
  setInvoiceNumber: (v: string) => void
  invoiceDate: string
  setInvoiceDate: (v: string) => void
  generateInvoiceNumber: () => void
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function parseNumber(s: string): number {
  const n = Number(s.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

export default function InvoiceForm({
  customerName,
  setCustomerName,
  customerAddress,
  setCustomerAddress,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  items,
  setItems,
  discount,
  setDiscount,
  subtotal,
  grandTotal,
  invoiceNumber,
  setInvoiceNumber,
  invoiceDate,
  setInvoiceDate,
  generateInvoiceNumber,
}: Props) {
  const [wattageOptions, setWattageOptions] = useState<string[]>([...DEFAULT_WATTAGES])
  const [kwOptions, setKwOptions] = useState<string[]>([...DEFAULT_KW])
  const [kwhOptions, setKwhOptions] = useState<string[]>([...DEFAULT_KWH])
  const [ahOptions, setAhOptions] = useState<string[]>([...DEFAULT_AH])
  const [mm2Options, setMm2Options] = useState<string[]>([...DEFAULT_MM2])
  const [panelOptions, setPanelOptions] = useState<string[]>([...DEFAULT_PANEL])
  const [aOptions, setAOptions] = useState<string[]>([...DEFAULT_A])
  const [makeSolarOptions, setMakeSolarOptions] = useState<string[]>([...DEFAULT_MAKES_SOLAR])
  const [makeBatteryOptions, setMakeBatteryOptions] = useState<string[]>([...DEFAULT_MAKES_BATTERY])
  const [makeInverterOptions, setMakeInverterOptions] = useState<string[]>([...DEFAULT_MAKES_INVERTER])
  const [makeWiringOptions, setMakeWiringOptions] = useState<string[]>([...DEFAULT_MAKES_WIRING])
  const [wattageMap, setWattageMap] = useState<Record<number, string>>({})
  const [addingWattage, setAddingWattage] = useState<Record<number, boolean>>({})
  const [newWattageInput, setNewWattageInput] = useState<Record<number, string>>({})
  const [addingMake, setAddingMake] = useState<Record<number, boolean>>({})
  const [newMakeInput, setNewMakeInput] = useState<Record<number, string>>({})

  function getOptions(desc: string) {
    const u = getUnit(desc)
    if (u === 'kW') return [kwOptions, setKwOptions] as const
    if (u === 'kWh') return [kwhOptions, setKwhOptions] as const
    if (u === 'Ah') return [ahOptions, setAhOptions] as const
    if (u === 'mm²') return [mm2Options, setMm2Options] as const
    if (u === '-Panel') return [panelOptions, setPanelOptions] as const
    if (u === 'A') return [aOptions, setAOptions] as const
    return [wattageOptions, setWattageOptions] as const
  }

  function getMakeList(desc: string) {
    if (isSolarPanelDesc(desc)) return [makeSolarOptions, setMakeSolarOptions] as const
    if (isInverterDesc(desc)) return [makeInverterOptions, setMakeInverterOptions] as const
    if (isBatteryDesc(desc)) return [makeBatteryOptions, setMakeBatteryOptions] as const
    if (desc === 'Wiring') return [makeWiringOptions, setMakeWiringOptions] as const
    return null
  }

  const updateItem = (idx: number, field: keyof InvoiceItem, val: string) => {
    const next = [...items]
    const parsed = parseNumber(val)
    if (field === 'description') {
      if (hasWattageOptions(val)) {
        const stored = wattageMap[idx] || ''
        next[idx] = { ...next[idx], description: stored ? `${val} - ${stored}` : val }
      } else {
        setWattageMap((prev) => { const c = { ...prev }; delete c[idx]; return c })
        setAddingWattage((prev) => { const c = { ...prev }; delete c[idx]; return c })
        setNewWattageInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
        next[idx] = { ...next[idx], description: val }
      }
      if (!hasMakeOptions(val)) {
        next[idx] = { ...next[idx], make: undefined }
        setAddingMake((prev) => { const c = { ...prev }; delete c[idx]; return c })
        setNewMakeInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
      }
    } else if (field === 'quantity') {
      next[idx] = { ...next[idx], quantity: Math.max(1, parsed), total: Math.max(1, parsed) * next[idx].unitPrice }
    } else if (field === 'unitPrice') {
      next[idx] = { ...next[idx], unitPrice: parsed, total: next[idx].quantity * parsed }
    }
    setItems(next)
  }

  const handleWattageChange = (idx: number, wattage: string) => {
    const desc = items[idx].description.replace(suffixRe, '')
    if (!hasWattageOptions(desc)) return
    if (wattage === 'Add more...') {
      setAddingWattage((prev) => ({ ...prev, [idx]: true }))
      return
    }
    setAddingWattage((prev) => ({ ...prev, [idx]: false }))
    setWattageMap((prev) => ({ ...prev, [idx]: wattage }))
    const next = [...items]
    next[idx] = { ...next[idx], description: `${desc} - ${wattage}` }
    setItems(next)
  }

  const confirmAddWattage = (idx: number, val: string) => {
    const desc = items[idx].description.replace(suffixRe, '')
    const unit = getUnit(desc)
    const cleaned = val.replace(/[^0-9./]/g, '')
    if (!cleaned) {
      setAddingWattage((prev) => ({ ...prev, [idx]: false }))
      setNewWattageInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
      return
    }
    const wattage = cleaned.includes('/') ? cleaned : `${cleaned}${unit}`
    const [list, setList] = getOptions(desc)
    if (!list.includes(wattage)) {
      setList((prev) => [...prev, wattage].sort((a, b) => {
        const na = parseFloat(a)
        const nb = parseFloat(b)
        if (isNaN(na) && isNaN(nb)) return a.localeCompare(b)
        if (isNaN(na)) return 1
        if (isNaN(nb)) return -1
        return na - nb
      }))
    }
    setAddingWattage((prev) => ({ ...prev, [idx]: false }))
    setNewWattageInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
    setWattageMap((prev) => ({ ...prev, [idx]: wattage }))
    const next = [...items]
    next[idx] = { ...next[idx], description: `${desc} - ${wattage}` }
    setItems(next)
  }

  const handleMakeChange = (idx: number, make: string) => {
    if (make === 'Add more...') {
      setAddingMake((prev) => ({ ...prev, [idx]: true }))
      return
    }
    setAddingMake((prev) => ({ ...prev, [idx]: false }))
    const next = [...items]
    next[idx] = { ...next[idx], make }
    setItems(next)
  }

  const confirmAddMake = (idx: number, val: string) => {
    const desc = items[idx].description.replace(suffixRe, '')
    const cleaned = val.trim()
    if (!cleaned) {
      setAddingMake((prev) => ({ ...prev, [idx]: false }))
      setNewMakeInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
      return
    }
    const makeList = getMakeList(desc)
    if (makeList) {
      const [list, setList] = makeList
      if (!list.includes(cleaned)) {
        setList((prev) => [...prev, cleaned].sort((a, b) => a.localeCompare(b)))
      }
    }
    setAddingMake((prev) => ({ ...prev, [idx]: false }))
    setNewMakeInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
    const next = [...items]
    next[idx] = { ...next[idx], make: cleaned }
    setItems(next)
  }

  const removeMake = (idx: number, make: string) => {
    const desc = items[idx].description.replace(suffixRe, '')
    const makeList = getMakeList(desc)
    if (makeList) {
      const [, setList] = makeList
      setList((prev) => prev.filter((m) => m !== make))
    }
    if (items[idx].make === make) {
      const next = [...items]
      next[idx] = { ...next[idx], make: undefined }
      setItems(next)
    }
  }

  const removeWattage = (idx: number, wattage: string) => {
    const desc = items[idx].description.replace(suffixRe, '')
    const [, setList] = getOptions(desc)
    setList((prev) => prev.filter((w) => w !== wattage))
    if (wattageMap[idx] === wattage) {
      setWattageMap((prev) => { const c = { ...prev }; delete c[idx]; return c })
      const next = [...items]
      next[idx] = { ...next[idx], description: desc }
      setItems(next)
    }
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0, make: undefined }])
  }

  const removeItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx))
      setWattageMap((prev) => { const c = { ...prev }; delete c[idx]; return c })
      setAddingWattage((prev) => { const c = { ...prev }; delete c[idx]; return c })
      setNewWattageInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
      setAddingMake((prev) => { const c = { ...prev }; delete c[idx]; return c })
      setNewMakeInput((prev) => { const c = { ...prev }; delete c[idx]; return c })
    }
  }

  const wattageActive = (idx: number) => hasWattageOptions(items[idx].description.replace(suffixRe, ''))

  const placeholderText = (desc: string) => {
    const u = getUnit(desc)
    if (u === 'kW') return 'e.g. 50'
    if (u === 'kWh') return 'e.g. 15'
    if (u === 'Ah') return 'e.g. 200'
    if (u === 'mm²') return 'e.g. 10 or 7/.064'
    if (u === '-Panel') return 'e.g. 4'
    if (u === 'A') return 'e.g. 32'
    return 'e.g. 800'
  }

  return (
    <div className="no-print" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: 18, marginBottom: 16, color: '#1a1a2e' }}>Invoice Details</h2>

      {/* Invoice meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div>
          <label style={labelStyle}>Invoice #</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <input style={inputStyle} value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            <button onClick={generateInvoiceNumber} style={{ ...btnStyle, padding: '6px 10px', fontSize: 12 }}>New</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
      </div>

      {/* Customer */}
      <h3 style={{ fontSize: 15, marginBottom: 10, color: '#16213e' }}>Customer</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Address</label>
          <input style={inputStyle} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input style={inputStyle} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        </div>
      </div>

      {/* Items */}
      <h3 style={{ fontSize: 15, marginBottom: 10, color: '#16213e' }}>Line Items</h3>
      {items.map((item, idx) => (
        <div key={idx} style={{ marginBottom: 10 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 60px 1fr 1fr 36px',
              gap: 6,
              alignItems: 'center',
            }}
          >
            <div style={{ position: 'relative' }}>
              <input
                list={`items-datalist-${idx}`}
                style={inputStyle}
                placeholder="Description"
                value={items[idx].description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
              />
              <datalist id={`items-datalist-${idx}`}>
                {SOLAR_ITEMS.map((opt) => (
                  <option key={opt} value={opt} />
                ))}
              </datalist>
            </div>
            <input
              style={inputStyle}
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Unit price"
              value={item.unitPrice ? formatNumber(item.unitPrice) : ''}
              onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
            />
            <span style={{ textAlign: 'right', fontSize: 14, color: '#555' }}>
              PKR {formatNumber(item.total)}
            </span>
            <button
              onClick={() => removeItem(idx)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                fontSize: 18,
                padding: 4,
              }}
              title="Remove item"
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 6,
              marginLeft: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {wattageActive(idx) && (
              <>
                <select
                  value={
                    addingWattage[idx]
                      ? 'Add more...'
                      : wattageMap[idx] && items[idx].description.includes(wattageMap[idx])
                        ? wattageMap[idx]
                        : ''
                  }
                  onChange={(e) => handleWattageChange(idx, e.target.value)}
                  style={{ ...inputStyle, width: 130, appearance: 'auto' }}
                >
                  <option value="" disabled>Select</option>
                  {getOptions(items[idx].description.replace(suffixRe, ''))[0].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                  <option value="Add more...">+ Add more...</option>
                </select>
                {wattageMap[idx] && !addingWattage[idx] && (
                  <span
                    onClick={() => removeWattage(idx, wattageMap[idx])}
                    style={{ fontSize: 11, color: '#e74c3c', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    title="Remove this rating"
                  >
                    (× remove)
                  </span>
                )}
                {addingWattage[idx] && (
                  <input
                    style={{ ...inputStyle, width: 100 }}
                    placeholder={placeholderText(items[idx].description.replace(suffixRe, ''))}
                    value={(newWattageInput[idx] || '').replace(/[^0-9./]/g, '')}
                    onChange={(e) => setNewWattageInput((prev) => ({ ...prev, [idx]: e.target.value.replace(/[^0-9./]/g, '') }))}
                    onBlur={(e) => confirmAddWattage(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmAddWattage(idx, (e.target as HTMLInputElement).value)
                    }}
                    autoFocus
                  />
                )}
              </>
            )}
            {(() => {
              const desc = items[idx].description.replace(suffixRe, '')
              const makeList = getMakeList(desc)
              if (!makeList) return null
              const [list] = makeList
              return (
                <>
                  <select
                    value={addingMake[idx] ? 'Add more...' : items[idx].make || ''}
                    onChange={(e) => handleMakeChange(idx, e.target.value)}
                    style={{ ...inputStyle, width: 140, appearance: 'auto' }}
                  >
                    <option value="" disabled>Select make</option>
                    {list.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Add more...">+ Add more...</option>
                  </select>
                  {items[idx].make && !addingMake[idx] && (
                    <span
                      onClick={() => removeMake(idx, items[idx].make!)}
                      style={{ fontSize: 11, color: '#e74c3c', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      title="Remove this make"
                    >
                      (× remove)
                    </span>
                  )}
                  {addingMake[idx] && (
                    <input
                      style={{ ...inputStyle, width: 120 }}
                      placeholder="e.g. Brand name"
                      value={newMakeInput[idx] || ''}
                      onChange={(e) => setNewMakeInput((prev) => ({ ...prev, [idx]: e.target.value }))}
                      onBlur={(e) => confirmAddMake(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmAddMake(idx, (e.target as HTMLInputElement).value)
                      }}
                      autoFocus
                    />
                  )}
                </>
              )
            })()}
          </div>
        </div>
      ))}
      <button onClick={addItem} style={{ ...btnStyle, marginTop: 4, fontSize: 13 }}>
        + Add Item
      </button>

      {/* Pricing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
        <div>
          <label style={labelStyle}>Discount (PKR)</label>
          <input
            style={inputStyle}
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
          />
        </div>
        <div>
          <div style={{
            background: '#f8f9fa',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#555' }}>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#555' }}>Discount</span>
                <span style={{ color: '#e74c3c' }}>-PKR {discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #1a1a2e',
              paddingTop: 6,
              fontWeight: 700,
              fontSize: 15,
            }}>
              <span>Grand Total</span>
              <span>PKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#555',
  marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #d9d9d9',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  background: '#1a1a2e',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  cursor: 'pointer',
  fontWeight: 600,
}
