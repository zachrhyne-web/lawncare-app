import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
  fetchProfile, saveProfile,
  fetchCustomers, createCustomer, updateCustomerRow, deleteCustomerRow,
  fetchInvoices, createInvoice, updateInvoiceRow, deleteInvoiceRow,
  fetchExpenses, createExpense, updateExpenseRow, deleteExpenseRow,
  uploadCustomerPhoto, deleteCustomerPhoto,
  nextInvoiceNumber as dbNextInvoiceNumber,
  uploadLogo,
} from '../lib/db'

// ── Theme helpers ────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return null
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

export const applyTheme = (settings) => {
  const root = document.documentElement
  root.style.setProperty('--color-forest-rgb', hexToRgb(settings?.primaryColor) || '27, 61, 27')
  root.style.setProperty('--color-lime-rgb',   hexToRgb(settings?.accentColor)  || '232, 192, 0')
}

const DEFAULT_SETTINGS = {
  businessName: '', ownerName: '', phone: '', email: '', address: '', tagline: '',
  logoDataUrl: null, primaryColor: '#1B3D1B', accentColor: '#E8C000',
  taxRate: 0, invoicePrefix: 'INV', nextInvoiceNumber: 1,
  isSetupComplete: false,
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id

  const [customers, setCustomers] = useState([])
  const [invoices,  setInvoices]  = useState([])
  const [expenses,  setExpenses]  = useState([])
  const [settings,  setSettings]  = useState(DEFAULT_SETTINGS)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Load all data when user signs in; clear on sign out
  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setCustomers([]); setInvoices([]); setExpenses([]); setSettings(DEFAULT_SETTINGS); setLoading(false)
      return
    }
    setLoading(true); setError(null)
    Promise.all([fetchProfile(userId), fetchCustomers(userId), fetchInvoices(userId), fetchExpenses(userId)])
      .then(([profile, cust, inv, exp]) => {
        if (cancelled) return
        setSettings({ ...DEFAULT_SETTINGS, ...profile })
        setCustomers(cust)
        setInvoices(inv)
        setExpenses(exp)
      })
      .catch((e) => { if (!cancelled) setError(e.message || String(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => { applyTheme(settings) }, [settings])

  // ── Customers ──────────────────────────────────────────────────────────────
  const addCustomer = useCallback(async (data) => {
    const created = await createCustomer(userId, data)
    setCustomers(prev => [created, ...prev])
    return created
  }, [userId])

  const updateCustomer = useCallback(async (customer) => {
    const updated = await updateCustomerRow(userId, customer)
    setCustomers(prev => prev.map(c => c.id === updated.id ? { ...updated, photos: customer.photos || c.photos } : c))
    return updated
  }, [userId])

  const deleteCustomer = useCallback(async (id) => {
    await deleteCustomerRow(id)
    setCustomers(prev => prev.filter(c => c.id !== id))
  }, [])

  const addCustomerPhoto = useCallback(async (customerId, label, file) => {
    const photo = await uploadCustomerPhoto(userId, customerId, label, file)
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, photos: [...(c.photos || []), photo] } : c
    ))
    return photo
  }, [userId])

  const removeCustomerPhoto = useCallback(async (customerId, photo) => {
    await deleteCustomerPhoto(photo)
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, photos: (c.photos || []).filter(p => p.id !== photo.id) } : c
    ))
  }, [])

  // ── Invoices ───────────────────────────────────────────────────────────────
  const addInvoice = useCallback(async (data) => {
    const created = await createInvoice(userId, data)
    setInvoices(prev => [created, ...prev])
    return created
  }, [userId])

  const updateInvoice = useCallback(async (invoice) => {
    const updated = await updateInvoiceRow(userId, invoice)
    setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i))
    return updated
  }, [userId])

  const deleteInvoice = useCallback(async (id) => {
    await deleteInvoiceRow(id)
    setInvoices(prev => prev.filter(i => i.id !== id))
  }, [])

  // ── Expenses ───────────────────────────────────────────────────────────────
  const addExpense = useCallback(async (data) => {
    const created = await createExpense(userId, data)
    setExpenses(prev => [created, ...prev])
    return created
  }, [userId])

  const updateExpense = useCallback(async (expense) => {
    const updated = await updateExpenseRow(userId, expense)
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))
    return updated
  }, [userId])

  const deleteExpense = useCallback(async (id) => {
    await deleteExpenseRow(id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }, [])

  const getNextInvoiceNumber = useCallback(async () => {
    const num = await dbNextInvoiceNumber(userId)
    setSettings(prev => ({ ...prev, nextInvoiceNumber: (prev.nextInvoiceNumber || 1) + 1 }))
    return num
  }, [userId])

  // ── Settings ───────────────────────────────────────────────────────────────
  const saveSettings = useCallback(async (s) => {
    const saved = await saveProfile(userId, s)
    const merged = { ...DEFAULT_SETTINGS, ...saved }
    setSettings(merged)
    applyTheme(merged)
    return merged
  }, [userId])

  const uploadBrandLogo = useCallback(async (file) => {
    const url = await uploadLogo(userId, file)
    return url
  }, [userId])

  return (
    <AppContext.Provider value={{
      loading, error,
      customers, addCustomer, updateCustomer, deleteCustomer,
      addCustomerPhoto, removeCustomerPhoto,
      invoices,  addInvoice,  updateInvoice,  deleteInvoice, getNextInvoiceNumber,
      expenses,  addExpense,  updateExpense,  deleteExpense,
      settings,  saveSettings, uploadBrandLogo,
    }}>
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
