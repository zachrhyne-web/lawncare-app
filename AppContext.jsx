// context/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import {
  getAll, saveAll, upsert, remove,
  getSettings, saveSettings as persistSettings,
  hasSeedData, markSeeded,
} from '../utils/storage'

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_CUSTOMERS = [
  {
    id: 'seed-cust-1',
    name: 'John & Mary Smith',
    phone: '(405) 555-0101',
    email: 'jsmith@example.com',
    address: '1234 Maple Ave, Oklahoma City, OK 73101',
    notes: 'Gate code is #4820. Dog in backyard — please call ahead.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    services: { mow: true, weedeat: true, edge: true, blowing: false },
    equipment: {
      mowerModel: 'Honda HRX217',
      type: 'push',
      deckWidth: '21 inches',
      cutHeight: '3 inches',
    },
    jobDetails: {
      estimatedTime: '45 minutes',
      servicePrices: { mow: 45, weedeat: 15, edge: 10, blowing: 0 },
    },
    photos: [],
  },
  {
    id: 'seed-cust-2',
    name: 'Robert Garcia',
    phone: '(405) 555-0182',
    email: 'rgarcia@example.com',
    address: '5678 Oak Street, Edmond, OK 73034',
    notes: 'Large corner lot. Uses riding mower path.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    services: { mow: true, weedeat: true, edge: false, blowing: true },
    equipment: {
      mowerModel: 'John Deere E130',
      type: 'riding',
      deckWidth: '42 inches',
      cutHeight: '3.5 inches',
    },
    jobDetails: {
      estimatedTime: '1.5 hours',
      servicePrices: { mow: 75, weedeat: 20, edge: 0, blowing: 15 },
    },
    photos: [],
  },
]

const SEED_INVOICES = [
  {
    id: 'seed-inv-1',
    invoiceNumber: 'INV-0001',
    customerId: 'seed-cust-1',
    customerSnapshot: {
      name: 'John & Mary Smith',
      address: '1234 Maple Ave, Oklahoma City, OK 73101',
      phone: '(405) 555-0101',
      email: 'jsmith@example.com',
    },
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    status: 'paid',
    lineItems: [
      { id: '1', description: 'Lawn Mowing', quantity: 1, unitPrice: 45, total: 45 },
      { id: '2', description: 'Weed Eating', quantity: 1, unitPrice: 15, total: 15 },
      { id: '3', description: 'Edging', quantity: 1, unitPrice: 10, total: 10 },
    ],
    subtotal: 70,
    taxRate: 0,
    taxAmount: 0,
    total: 70,
    notes: 'Thank you for your business!',
    businessInfo: { name: 'LawnCare Pro', phone: '', email: '', address: '' },
  },
]
// ─────────────────────────────────────────────────────────────────────────────

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Seed on first mount
  if (!hasSeedData()) {
    saveAll('customers', SEED_CUSTOMERS)
    saveAll('invoices', SEED_INVOICES)
    markSeeded()
  }

  const [customers, setCustomers] = useState(() => getAll('customers'))
  const [invoices, setInvoices] = useState(() => getAll('invoices'))
  const [settings, setSettings] = useState(() => getSettings())

  // ── Customers ──────────────────────────────────────────────────────────────
  const addCustomer = useCallback((data) => {
    const customer = { id: uuid(), createdAt: new Date().toISOString(), photos: [], ...data }
    upsert('customers', customer)
    setCustomers(getAll('customers'))
    return customer
  }, [])

  const updateCustomer = useCallback((customer) => {
    upsert('customers', customer)
    setCustomers(getAll('customers'))
  }, [])

  const deleteCustomer = useCallback((id) => {
    remove('customers', id)
    setCustomers(getAll('customers'))
  }, [])

  // ── Invoices ───────────────────────────────────────────────────────────────
  const addInvoice = useCallback((data) => {
    const invoice = { id: uuid(), ...data }
    upsert('invoices', invoice)
    setInvoices(getAll('invoices'))
    return invoice
  }, [])

  const updateInvoice = useCallback((invoice) => {
    upsert('invoices', invoice)
    setInvoices(getAll('invoices'))
  }, [])

  const deleteInvoice = useCallback((id) => {
    remove('invoices', id)
    setInvoices(getAll('invoices'))
  }, [])

  // ── Settings ───────────────────────────────────────────────────────────────
  const saveSettings = useCallback((s) => {
    persistSettings(s)
    setSettings(s)
  }, [])

  return (
    <AppContext.Provider
      value={{
        customers, addCustomer, updateCustomer, deleteCustomer,
        invoices, addInvoice, updateInvoice, deleteInvoice,
        settings, saveSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
