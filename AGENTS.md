# Solar Invoice Generator

React + Vite + TypeScript app for generating solar installation invoices with PDF download, print, and WhatsApp sharing.

## Commands

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` (tsc `-b` must run _before_ vite build — both in one script) |
| Preview build | `npm run preview` |

## Entrypoints & wiring

- **`src/App.tsx`** — all state is lifted here (no form library; plain `useState`). Handlers for PDF, print, and WhatsApp live here too.
- **`src/components/InvoiceForm.tsx`** — receives state + setters as props from App. Contains all item spec dropdown logic.
- **`src/components/InvoicePreview.tsx`** — read-only render of `InvoiceData`. This is the print/PDF target.
- **`src/components/InvoiceActions.tsx`** — three buttons wired to handlers in App.
- **`src/types.ts`** — `InvoiceData` and `InvoiceItem` interfaces.

## Non-obvious details

- **Default items**: 5 pre-filled line items are hardcoded in `App.tsx:7-38`. Agents should check this when adding/removing fields.
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
