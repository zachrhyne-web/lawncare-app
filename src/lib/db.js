// Data API — all Supabase reads/writes. Transforms snake_case DB rows into
// camelCase objects that match the shapes our UI components already expect.
import { supabase } from './supabase'

// ── Mappers ──────────────────────────────────────────────────────────────────
const customerFromRow = (r) => r && ({
  id: r.id,
  name: r.name,
  phone: r.phone || '',
  email: r.email || '',
  address: r.address || '',
  notes: r.notes || '',
  createdAt: r.created_at,
  services: r.services || { mow: false, weedeat: false, edge: false, blowing: false },
  equipment: r.equipment || { mowerModel: '', type: '', deckWidth: '', cutHeight: '' },
  jobDetails: r.job_details || { estimatedTime: '', servicePrices: { mow: 0, weedeat: 0, edge: 0, blowing: 0 } },
  photos: [],
})

const customerToRow = (c, userId) => ({
  user_id: userId,
  name: c.name,
  phone: c.phone || null,
  email: c.email || null,
  address: c.address || null,
  notes: c.notes || null,
  services: c.services || {},
  equipment: c.equipment || {},
  job_details: c.jobDetails || {},
})

const photoFromRow = (r) => ({
  id: r.id,
  customerId: r.customer_id,
  label: r.label,
  storagePath: r.storage_path,
  publicUrl: r.public_url,
  dataUrl: r.public_url, // alias so existing UI (<img src={photo.dataUrl} />) keeps working
  uploadedAt: r.uploaded_at,
})

const invoiceFromRow = (r) => r && ({
  id: r.id,
  invoiceNumber: r.invoice_number,
  customerId: r.customer_id,
  customerSnapshot: r.customer_snapshot || {},
  businessInfo: r.business_info || {},
  date: r.date,
  dueDate: r.due_date,
  status: r.status,
  lineItems: r.line_items || [],
  subtotal: Number(r.subtotal || 0),
  taxRate: Number(r.tax_rate || 0),
  taxAmount: Number(r.tax_amount || 0),
  total: Number(r.total || 0),
  notes: r.notes || '',
})

const invoiceToRow = (inv, userId) => ({
  user_id: userId,
  customer_id: inv.customerId || null,
  invoice_number: inv.invoiceNumber,
  customer_snapshot: inv.customerSnapshot || {},
  business_info: inv.businessInfo || {},
  date: inv.date,
  due_date: inv.dueDate,
  status: inv.status,
  line_items: inv.lineItems || [],
  subtotal: inv.subtotal,
  tax_rate: inv.taxRate,
  tax_amount: inv.taxAmount,
  total: inv.total,
  notes: inv.notes || null,
})

export const profileFromRow = (r) => r && ({
  businessName: r.business_name || '',
  ownerName: r.owner_name || '',
  phone: r.phone || '',
  email: r.email || '',
  address: r.address || '',
  tagline: r.tagline || '',
  logoDataUrl: r.logo_url || null,  // alias; UI uses logoDataUrl everywhere
  logoUrl: r.logo_url || null,
  primaryColor: r.primary_color || '#1B3D1B',
  accentColor: r.accent_color || '#E8C000',
  taxRate: Number(r.tax_rate || 0),
  invoicePrefix: r.invoice_prefix || 'INV',
  nextInvoiceNumber: Number(r.next_invoice_number || 1),
  isSetupComplete: !!r.is_setup_complete,
})

const profileToRow = (s) => ({
  business_name: s.businessName || null,
  owner_name: s.ownerName || null,
  phone: s.phone || null,
  email: s.email || null,
  address: s.address || null,
  tagline: s.tagline || null,
  logo_url: s.logoDataUrl || s.logoUrl || null,
  primary_color: s.primaryColor || '#1B3D1B',
  accent_color: s.accentColor || '#E8C000',
  tax_rate: Number(s.taxRate || 0),
  invoice_prefix: s.invoicePrefix || 'INV',
  next_invoice_number: Number(s.nextInvoiceNumber || 1),
  is_setup_complete: !!s.isSetupComplete,
  updated_at: new Date().toISOString(),
})

// ── Profile ──────────────────────────────────────────────────────────────────
export async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return profileFromRow(data)
}

export async function saveProfile(userId, settings) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileToRow(settings))
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return profileFromRow(data)
}

// ── Customers ────────────────────────────────────────────────────────────────
export async function fetchCustomers(userId) {
  const { data: rows, error } = await supabase
    .from('customers').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  const customers = rows.map(customerFromRow)

  const { data: photoRows, error: pErr } = await supabase
    .from('customer_photos').select('*').eq('user_id', userId)
  if (pErr) throw pErr
  const byCustomer = new Map()
  for (const row of photoRows) {
    const p = photoFromRow(row)
    if (!byCustomer.has(p.customerId)) byCustomer.set(p.customerId, [])
    byCustomer.get(p.customerId).push(p)
  }
  for (const c of customers) c.photos = byCustomer.get(c.id) || []
  return customers
}

export async function createCustomer(userId, data) {
  const { data: row, error } = await supabase
    .from('customers').insert(customerToRow(data, userId)).select().single()
  if (error) throw error
  return customerFromRow(row)
}

export async function updateCustomerRow(userId, customer) {
  const { data: row, error } = await supabase
    .from('customers').update(customerToRow(customer, userId)).eq('id', customer.id).select().single()
  if (error) throw error
  const updated = customerFromRow(row)
  updated.photos = customer.photos || []
  return updated
}

export async function deleteCustomerRow(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) throw error
}

// ── Invoices ─────────────────────────────────────────────────────────────────
export async function fetchInvoices(userId) {
  const { data, error } = await supabase
    .from('invoices').select('*').eq('user_id', userId).order('date', { ascending: false })
  if (error) throw error
  return data.map(invoiceFromRow)
}

export async function createInvoice(userId, data) {
  const { data: row, error } = await supabase
    .from('invoices').insert(invoiceToRow(data, userId)).select().single()
  if (error) throw error
  return invoiceFromRow(row)
}

export async function updateInvoiceRow(userId, invoice) {
  const { data: row, error } = await supabase
    .from('invoices').update(invoiceToRow(invoice, userId)).eq('id', invoice.id).select().single()
  if (error) throw error
  return invoiceFromRow(row)
}

export async function deleteInvoiceRow(id) {
  const { error } = await supabase.from('invoices').delete().eq('id', id)
  if (error) throw error
}

// ── Storage (logos + customer photos) ────────────────────────────────────────
export async function uploadLogo(userId, file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `${userId}/logo-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('brand-assets').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('brand-assets').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadCustomerPhoto(userId, customerId, label, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}/${customerId}/${label}-${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('customer-photos').upload(path, file)
  if (upErr) throw upErr
  const { data: pub } = supabase.storage.from('customer-photos').getPublicUrl(path)
  const { data: row, error } = await supabase.from('customer_photos').insert({
    user_id: userId,
    customer_id: customerId,
    label,
    storage_path: path,
    public_url: pub.publicUrl,
  }).select().single()
  if (error) throw error
  return photoFromRow(row)
}

export async function deleteCustomerPhoto(photo) {
  if (photo.storagePath) {
    await supabase.storage.from('customer-photos').remove([photo.storagePath])
  }
  const { error } = await supabase.from('customer_photos').delete().eq('id', photo.id)
  if (error) throw error
}

// Atomically consume & increment the invoice counter on the profile
export async function nextInvoiceNumber(userId) {
  const { data: prof, error } = await supabase
    .from('profiles').select('invoice_prefix, next_invoice_number').eq('id', userId).single()
  if (error) throw error
  const prefix = prof.invoice_prefix || 'INV'
  const num = prof.next_invoice_number || 1
  const invoiceNumber = `${prefix}-${String(num).padStart(4, '0')}`
  await supabase.from('profiles').update({ next_invoice_number: num + 1 }).eq('id', userId)
  return invoiceNumber
}
