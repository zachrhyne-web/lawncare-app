const KEYS = {
  customers: 'lawncare_customers',
  invoices: 'lawncare_invoices',
  settings: 'lawncare_settings',
  seeded: 'lawncare_seeded',
}

const defaultSettings = {
  businessName: 'LawnCare Pro',
  ownerName: '',
  phone: '',
  email: '',
  address: '',
  taxRate: 0,
  invoicePrefix: 'INV',
  nextInvoiceNumber: 2,
}

export const getAll = (key) =>
  JSON.parse(localStorage.getItem(KEYS[key]) || '[]')

export const saveAll = (key, data) =>
  localStorage.setItem(KEYS[key], JSON.stringify(data))

export const getById = (key, id) =>
  getAll(key).find(item => item.id === id)

export const upsert = (key, item) => {
  const all = getAll(key)
  const idx = all.findIndex(i => i.id === item.id)
  if (idx >= 0) all[idx] = item; else all.push(item)
  saveAll(key, all)
}

export const remove = (key, id) =>
  saveAll(key, getAll(key).filter(i => i.id !== id))

export const getSettings = () =>
  JSON.parse(localStorage.getItem(KEYS.settings) || JSON.stringify(defaultSettings))

export const saveSettings = (s) =>
  localStorage.setItem(KEYS.settings, JSON.stringify(s))

export const hasSeedData = () =>
  localStorage.getItem(KEYS.seeded) === 'true'

export const markSeeded = () =>
  localStorage.setItem(KEYS.seeded, 'true')

/** Generates the next invoice number and increments the counter in settings */
export const getNextInvoiceNumber = () => {
  const settings = getSettings()
  const prefix = settings.invoicePrefix || 'INV'
  const num = settings.nextInvoiceNumber || 1
  const invoiceNumber = `${prefix}-${String(num).padStart(4, '0')}`
  saveSettings({ ...settings, nextInvoiceNumber: num + 1 })
  return invoiceNumber
}
