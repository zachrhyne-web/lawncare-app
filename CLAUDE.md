# LawnCare Pro — Claude Code Build Spec

## Overview
A full-featured lawn care business management app built with **React + Vite + Tailwind CSS**.
Data is persisted in **localStorage** (no backend required). PDF invoices generated via **jsPDF + html2canvas**.

---

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS** (utility-first styling)
- **React Router v6** (client-side routing)
- **jsPDF** + **html2canvas** (invoice PDF export)
- **lucide-react** (icons)
- **uuid** (generate unique IDs)
- **localStorage** (all data storage)

Install everything:
```bash
npm create vite@latest . -- --template react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom jspdf html2canvas lucide-react uuid
```

---

## Design Direction
**Aesthetic**: Industrial-utilitarian with a fresh outdoor twist.
- **Colors**: Deep forest green (`#1a3a2a`) primary, warm cream (`#f5f0e8`) background, bright lime accent (`#7ec648`), charcoal text (`#1c1c1c`).
- **Fonts**: `Bebas Neue` (headings, Google Fonts) + `DM Sans` (body).
- **Feel**: Like a professional field tool — clean, functional, no fluff.
- Import Google Fonts in `index.html`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  ```

---

## File Structure
```
src/
  main.jsx
  App.jsx
  index.css
  context/
    AppContext.jsx         ← global state (customers, invoices) via localStorage
  pages/
    Dashboard.jsx          ← summary stats + quick actions
    Customers.jsx          ← customer list with search/filter
    CustomerDetail.jsx     ← view/edit a single customer profile
    NewCustomer.jsx        ← create customer form
    Invoices.jsx           ← invoice list
    InvoiceDetail.jsx      ← view/print single invoice
    NewInvoice.jsx         ← create invoice for a customer
  components/
    Navbar.jsx             ← top nav with logo + links
    CustomerCard.jsx       ← card used on Customers list
    ServiceCheckbox.jsx    ← reusable checkbox for service items
    PhotoUpload.jsx        ← before/after photo upload widget
    InvoiceTemplate.jsx    ← printable invoice layout (used by jsPDF)
    StatCard.jsx           ← dashboard stat widget
  utils/
    storage.js             ← localStorage helpers (get/set/update/delete)
    invoiceHelpers.js      ← invoice number generation, totals calculation
    pdfExport.js           ← jsPDF export logic
```

---

## Data Models

### Customer
```js
{
  id: uuid(),
  name: string,
  phone: string,
  email: string,
  address: string,
  notes: string,
  createdAt: ISO string,

  // Service flags
  services: {
    mow: boolean,
    weedeat: boolean,
    edge: boolean,
    blowing: boolean,       // Leaf/Grass blowing
  },

  // Equipment
  equipment: {
    mowerModel: string,     // e.g. "Honda HRX217"
    type: "push" | "riding" | "",
    deckWidth: string,      // e.g. "21 inches"
    cutHeight: string,      // e.g. '3"' — height to mow grass
  },

  // Job details
  jobDetails: {
    estimatedTime: string,  // e.g. "45 minutes"
    servicePrices: {
      mow: number,
      weedeat: number,
      edge: number,
      blowing: number,
    },
  },

  // Photos — stored as base64 data URLs
  photos: [
    {
      id: uuid(),
      label: "before" | "after",
      dataUrl: string,
      uploadedAt: ISO string,
    }
  ]
}
```

### Invoice
```js
{
  id: uuid(),
  invoiceNumber: string,     // e.g. "INV-0042"
  customerId: string,
  customerSnapshot: { name, address, phone, email },
  date: ISO string,
  dueDate: ISO string,
  status: "draft" | "sent" | "paid",

  lineItems: [
    {
      id: uuid(),
      description: string,   // e.g. "Lawn Mowing"
      quantity: number,
      unitPrice: number,
      total: number,
    }
  ],

  subtotal: number,
  taxRate: number,           // default 0, user can set
  taxAmount: number,
  total: number,
  notes: string,             // e.g. "Thank you for your business!"
  businessInfo: {            // pulled from settings
    name: string,
    phone: string,
    email: string,
    address: string,
  }
}
```

### Settings (localStorage key: `lawncare_settings`)
```js
{
  businessName: string,
  ownerName: string,
  phone: string,
  email: string,
  address: string,
  taxRate: number,           // percentage, e.g. 8.5
  invoicePrefix: string,     // e.g. "INV"
  nextInvoiceNumber: number, // auto-increments
}
```

---

## Pages Spec

### Dashboard (`/`)
- Header: "Good morning / afternoon, [ownerName]"
- Stat cards: Total Customers, Invoices This Month, Revenue This Month, Outstanding Balance
- Quick action buttons: "+ New Customer", "+ New Invoice"
- Recent customers list (last 5)
- Recent invoices list (last 5) with status badges

### Customers (`/customers`)
- Search bar (filter by name/address)
- Filter chips: "All", "Mow", "Weedeat", "Edge", "Blowing"
- Grid of `CustomerCard` components
- Each card shows: name, address, service badges, estimated time
- "+ New Customer" button → `/customers/new`

### New Customer (`/customers/new`)
- Multi-section form:
  **Contact Info**: Name*, Phone*, Email, Address*
  **Services** (checkboxes with individual price inputs):
  - [ ] Mow — $___
  - [ ] Weedeat — $___
  - [ ] Edge — $___
  - [ ] Leaf/Grass Blowing — $___
  **Equipment**:
  - Mower Make/Model (text)
  - Type: Push | Riding (radio/toggle)
  - Deck Width (text, e.g. "21 inches")
  - Cut Height (text, e.g. '3"')
  **Job Details**:
  - Estimated Time (text, e.g. "45 min")
  **Notes**: (textarea)
  - Save button → redirects to CustomerDetail

### Customer Detail (`/customers/:id`)
- View all customer info in card sections
- "Edit" button toggles edit mode (inline editing)
- Service badges (colored pills)
- Equipment info section
- **Before/After Photos** section:
  - Upload button for "Before" and "After" separately
  - Thumbnail grid with delete option
  - Label each photo clearly
- "Create Invoice" button → `/invoices/new?customerId=xxx`
- "Delete Customer" button (with confirmation modal)
- Invoice history for this customer

### Invoices (`/invoices`)
- List of all invoices sorted by date (newest first)
- Filter by status: All | Draft | Sent | Paid
- Each row: Invoice #, Customer Name, Date, Total, Status badge
- Click → InvoiceDetail

### New Invoice (`/invoices/new?customerId=xxx`)
- Auto-populate customer info if customerId in query
- Customer selector dropdown (if no customerId)
- Invoice date + due date pickers
- Line items table:
  - Auto-populate from customer's service prices
  - Add/remove line items
  - Description, Qty, Unit Price, Total columns
- Subtotal, Tax Rate input, Tax Amount, Grand Total
- Notes textarea
- "Save as Draft" and "Save & Mark Sent" buttons

### Invoice Detail (`/invoices/:id`)
- Full invoice view (printable layout)
- Status badge with "Mark as Paid" / "Mark as Sent" buttons
- "Download PDF" button — uses jsPDF to generate PDF
- "Edit" button (for draft invoices)
- Business logo/name at top of invoice

---

## Key Implementation Notes

### localStorage Helpers (`utils/storage.js`)
```js
const KEYS = {
  customers: 'lawncare_customers',
  invoices: 'lawncare_invoices',
  settings: 'lawncare_settings',
};

export const getAll = (key) => JSON.parse(localStorage.getItem(KEYS[key]) || '[]');
export const saveAll = (key, data) => localStorage.setItem(KEYS[key], JSON.stringify(data));
export const getById = (key, id) => getAll(key).find(item => item.id === id);
export const upsert = (key, item) => {
  const all = getAll(key);
  const idx = all.findIndex(i => i.id === item.id);
  if (idx >= 0) all[idx] = item; else all.push(item);
  saveAll(key, all);
};
export const remove = (key, id) => saveAll(key, getAll(key).filter(i => i.id !== id));
export const getSettings = () => JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(defaultSettings));
export const saveSettings = (s) => localStorage.setItem(KEYS.settings, JSON.stringify(s));
```

### Photo Upload (`components/PhotoUpload.jsx`)
- Use `<input type="file" accept="image/*">` hidden behind a styled button
- On change, use `FileReader.readAsDataURL()` to get base64
- Store in `customer.photos[]`
- Display in a 2-column grid (before | after)
- Allow multiple uploads per label

### PDF Export (`utils/pdfExport.js`)
- Use `html2canvas` to capture the `InvoiceTemplate` component DOM node
- Feed the canvas to `jsPDF` as an image
- Filename: `INV-0042-CustomerName.pdf`

### AppContext (`context/AppContext.jsx`)
- Provide: `customers`, `invoices`, `settings`
- Actions: `addCustomer`, `updateCustomer`, `deleteCustomer`, `addInvoice`, `updateInvoice`, `deleteInvoice`, `saveSettings`
- All mutations write through to localStorage

### Routing (`App.jsx`)
```jsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/customers" element={<Customers />} />
  <Route path="/customers/new" element={<NewCustomer />} />
  <Route path="/customers/:id" element={<CustomerDetail />} />
  <Route path="/invoices" element={<Invoices />} />
  <Route path="/invoices/new" element={<NewInvoice />} />
  <Route path="/invoices/:id" element={<InvoiceDetail />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

---

## Settings Page (`/settings`)
Form to configure:
- Business Name, Owner Name, Phone, Email, Address
- Default Tax Rate (%)
- Invoice Prefix (e.g. "INV")
- Next Invoice Number
Save button writes to localStorage.

---

## Tailwind Config
```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#1a3a2a',
        lime: '#7ec648',
        cream: '#f5f0e8',
        bark: '#8b6f47',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
}
```

---

## Build Order Suggestion for Claude Code
1. `npm create vite`, install deps, set up Tailwind + fonts
2. `utils/storage.js` + `context/AppContext.jsx`
3. `App.jsx` routing skeleton + `Navbar.jsx`
4. `pages/Dashboard.jsx` (wired to context)
5. `pages/Customers.jsx` + `components/CustomerCard.jsx`
6. `pages/NewCustomer.jsx` (full form)
7. `pages/CustomerDetail.jsx` + `components/PhotoUpload.jsx`
8. `pages/Invoices.jsx`
9. `pages/NewInvoice.jsx`
10. `pages/InvoiceDetail.jsx` + `components/InvoiceTemplate.jsx` + `utils/pdfExport.js`
11. `pages/Settings.jsx`
12. Polish: transitions, empty states, confirmation modals, responsive layout

---

## Sample Seed Data
On first load (if localStorage is empty), seed with 2 sample customers and 1 sample invoice so the UI isn't blank. Put this logic in `AppContext.jsx`.
