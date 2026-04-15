const KEYS = {
  customers: 'lawncare_customers',
  invoices:  'lawncare_invoices',
  settings:  'lawncare_settings',
  seeded:    'lawncare_seeded',
}

export const defaultSettings = {
  // Business info
  businessName:      '',
  ownerName:         '',
  phone:             '',
  email:             '',
  address:           '',
  tagline:           '',
  // Invoice config
  taxRate:           0,
  invoicePrefix:     'INV',
  nextInvoiceNumber: 1,
  // Brand
  logoDataUrl:       null,   // base64 string from logo upload
  primaryColor:      '#1B3D1B',
  accentColor:       '#E8C000',
  // Onboarding
  isSetupComplete:   false,
}

export const getAll      = (key)       => JSON.parse(localStorage.getItem(KEYS[key]) || '[]')
export const saveAll     = (key, data) => localStorage.setItem(KEYS[key], JSON.stringify(data))
export const getById     = (key, id)   => getAll(key).find(item => item.id === id)

export const upsert = (key, item) => {
  const all = getAll(key)
  const idx = all.findIndex(i => i.id === item.id)
  if (idx >= 0) all[idx] = item; else all.push(item)
  saveAll(key, all)
}

export const remove = (key, id) =>
  saveAll(key, getAll(key).filter(i => i.id !== id))

export const getSettings = () => {
  const stored = localStorage.getItem(KEYS.settings)
  if (!stored) return { ...defaultSettings }
  // Merge with defaults so new fields are always present
  return { ...defaultSettings, ...JSON.parse(stored) }
}

export const saveSettings = (s) =>
  localStorage.setItem(KEYS.settings, JSON.stringify(s))

export const hasSeedData = () => localStorage.getItem(KEYS.seeded) === 'true'
export const markSeeded  = () => localStorage.setItem(KEYS.seeded, 'true')

/** Generates next invoice number and increments the counter */
export const getNextInvoiceNumber = () => {
  const settings = getSettings()
  const prefix = settings.invoicePrefix || 'INV'
  const num    = settings.nextInvoiceNumber || 1
  const invoiceNumber = `${prefix}-${String(num).padStart(4, '0')}`
  saveSettings({ ...settings, nextInvoiceNumber: num + 1 })
  return invoiceNumber
}
