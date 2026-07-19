# Solar Invoice Generator

React + Vite + TypeScript app for generating solar installation invoices with PDF download, print, and WhatsApp sharing.

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (use `Start-Process` to launch in background — never block the shell waiting for it) |
| Build | `npm run build` (tsc `-b` must run _before_ vite build — both in one script) |
| Preview build | `npm run preview` |

## Entrypoints & wiring

- **`src/App.tsx`** — all state is lifted here (no form library; plain `useState`). Handlers for PDF, print, and WhatsApp live here too.
- **`src/components/InvoiceForm.tsx`** — receives state + setters as props from App. Contains all item spec dropdown logic.
- **`src/components/InvoicePreview.tsx`** — read-only render of `InvoiceData`. This is the print/PDF target.
- **`src/components/InvoiceActions.tsx`** — four buttons (Save Invoice + PDF + Print + WhatsApp) wired to handlers in App.
- **`src/components/CustomerDashboard.tsx`** — lists all customers with outstanding balance. Entry point for navigation.
- **`src/components/CustomerHistory.tsx`** — per-customer chronological view of invoices + payments with running balance and "Record Payment" buttons on each invoice card.
- **`src/components/PaymentForm.tsx`** — modal to record payments (optionally tied to a specific invoice).
- **`src/components/AddCustomerModal.tsx`** — modal for adding a new customer.
- **`src/types.ts`** — `InvoiceData`, `InvoiceItem`, plus `StoredCustomer`, `StoredInvoice`, `StoredPayment`, `AppView`, `AppData`.
- **`src/utils.ts`** — `numberToWords`, `generateId`, `loadAppData`, `saveAppData`.

## Non-obvious details

- **Default items**: 5 pre-filled line items are hardcoded in `App.tsx`. Agents should check this when adding/removing fields.
- **Customer history & payments**: All data persisted to `localStorage` under key `solar-invoice-data`. Loaded on boot, saved on every mutation via `useEffect`.
- **View routing**: Simple state-based routing via `AppView` union type — no router library. Three views: `dashboard`, `invoice`, `history`.
- **Payment flow**: Each invoice card in CustomerHistory shows a "Record Payment" button (when not fully paid). General "Record Payment" button also available at the top. Payments optionally tied to invoices — invoice's `paidAmount` is updated accordingly.
- **Balance calculation**: `customer balance = sum(invoice.grandTotal) - sum(payment.amount)` across all invoices/payments for that customer.
- **Customer auto-complete**: InvoiceForm customer name input uses `<datalist>` populated from existing customer names.
- **PDF**: `html2canvas` + `jsPDF` (dynamic `import()` on button click, not eager). Captures the preview div only, not the full page.
- **Print**: `window.print()` — elements with `className="no-print"` are hidden via `index.css` print media query.
- **WhatsApp**: generates a plain-text summary and opens `wa.me` link — does NOT share the PDF or image.
- **Invoice number format**: `SOL-YYYYMMDD-XXXX` (auto-generated, random suffix).
- **Currency**: PKR; no tax calculation. `grandTotal = subtotal - discount`.
- **Config**: `tsconfig.json` uses project references (`tsconfig.app.json` + `tsconfig.node.json`) — standard Vite pattern.
- **Instruction entrypoint**: `CLAUDE.md` imports `@AGENTS.md`; all agent guidance lives in this single file.

## Spec dropdown system

Certain items get a conditional spec dropdown (`InvoiceForm.tsx` `hasWattageOptions` / `getUnit`):

| Item type | Unit | Default options |
|-----------|------|----------------|
| Solar Panel MONO/BI-facial | W | 585W – 750W (5W steps) |
| VFD, Inverter | kW | 1, 1.5, 2.5, 3, 4, 5, 6, 7, 7.5, 10, 11, 15, 18.5, 22, 30, 37.5, 45 |
| Battery Lithium | kWh | 2.4, 5.12, 7.68, 10.24, 15, 20 |
| Battery Tubular, Gel, AGM | Ah | 100, 120, 150, 180, 200, 220, 250 |
| Wiring | mm² / cable | 2.5mm², 4mm², 6mm², 10mm², 7/.056, 7/.064, 7/.074 |
| Mounting Structure Pre/Self-made | -Panel | 1 to 12 panels |
| DC Breaker, Change Over | A | 16A – 250A |

Each spec list has **+ Add more...** (custom value) and **(× remove)** (delete from list) per item index.
