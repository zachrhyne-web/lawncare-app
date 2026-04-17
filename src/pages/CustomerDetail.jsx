// pages/CustomerDetail.jsx
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import PhotoUpload from '../components/PhotoUpload'
import {
  ArrowLeft, Edit2, Save, X, Trash2, Plus,
  Phone, Mail, MapPin, Clock, Wrench, CheckSquare, FileText
} from 'lucide-react'
import { formatCurrency, formatShortDate } from '../utils/invoiceHelpers'
import { SERVICES, FREQUENCIES, frequencyLabel } from '../utils/services'

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customers, updateCustomer, deleteCustomer, addCustomerPhoto, removeCustomerPhoto, invoices } = useApp()

  const customer = customers.find(c => c.id === id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (!customer) {
    return (
      <div className="page-container text-center py-16">
        <p className="text-2xl font-display text-gray-300 mb-4">CUSTOMER NOT FOUND</p>
        <Link to="/customers" className="btn-primary">Back to Customers</Link>
      </div>
    )
  }

  const customerInvoices = invoices.filter(inv => inv.customerId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const startEdit = () => {
    setForm(JSON.parse(JSON.stringify(customer)))
    setEditing(true)
  }

  const cancelEdit = () => {
    setForm(null)
    setEditing(false)
  }

  const saveEdit = () => {
    updateCustomer(form)
    setEditing(false)
    setForm(null)
  }

  const set = (path, value) => {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] == null || typeof obj[keys[i]] !== 'object') obj[keys[i]] = {}
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleDeleteCustomer = () => {
    deleteCustomer(id)
    navigate('/customers')
  }

  // Photo handlers (upload to Supabase Storage)
  const handleAddPhoto = async (label, file) => {
    try { await addCustomerPhoto(id, label, file) }
    catch (err) { alert(`Could not upload photo: ${err.message || err}`) }
  }

  const handleDeletePhoto = async (photo) => {
    try { await removeCustomerPhoto(id, photo) }
    catch (err) { alert(`Could not delete photo: ${err.message || err}`) }
  }

  const data = editing ? form : customer

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cream-dark">
      <Icon className="w-4 h-4 text-lime" />
      <h2 className="text-lg font-display tracking-wide text-forest">{title}</h2>
    </div>
  )

  return (
    <div className="page-container max-w-4xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/customers" className="btn-ghost text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Customers
        </Link>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="btn-outline">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={saveEdit} className="btn-primary">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowDeleteModal(true)} className="btn-ghost text-red-500 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={startEdit} className="btn-outline">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <Link to={`/invoices/new?customerId=${id}`} className="btn-primary">
                <Plus className="w-4 h-4" /> Create Invoice
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Customer name header */}
      <div className="mb-6">
        {editing ? (
          <input className="input text-2xl font-display" value={form.name}
            onChange={e => set('name', e.target.value)} />
        ) : (
          <h1 className="section-header">{customer.name}</h1>
        )}
        <p className="text-gray-400 text-sm mt-1">
          Customer since {formatShortDate(customer.createdAt)}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Contact ─────────────────────────────────────────────── */}
          <div className="card">
            <SectionHeader icon={Phone} title="Contact Information" />
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Notes</label>
                  <textarea className="input resize-none min-h-[80px]" value={form.notes}
                    onChange={e => set('notes', e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${customer.phone}`} className="text-forest hover:underline">{customer.phone}</a>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${customer.email}`} className="text-forest hover:underline">{customer.email}</a>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{customer.address}</span>
                  </div>
                )}
                {customer.notes && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm text-amber-900">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Services ─────────────────────────────────────────────── */}
          <div className="card">
            <SectionHeader icon={CheckSquare} title="Services & Pricing" />
            {editing ? (
              <div className="space-y-3">
                {SERVICES.map(({ key, label }) => (
                  <div key={key} className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                    form.services?.[key] ? 'border-lime bg-lime/5' : 'border-gray-100'
                  }`}>
                    <label className="flex items-center gap-3 flex-1 min-w-[150px] cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 accent-lime"
                        checked={form.services?.[key] || false}
                        onChange={e => set(`services.${key}`, e.target.checked)} />
                      <span className="font-semibold text-sm">{label}</span>
                    </label>
                    <select
                      disabled={!form.services?.[key]}
                      className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white disabled:bg-gray-50 disabled:text-gray-300 focus:outline-none focus:ring-2 focus:ring-lime"
                      value={form.jobDetails?.serviceFrequencies?.[key] || 'weekly'}
                      onChange={e => set(`jobDetails.serviceFrequencies.${key}`, e.target.value)}
                    >
                      {FREQUENCIES.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-sm">$</span>
                      <input type="number" min="0" step="0.01"
                        className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-lime disabled:bg-gray-50"
                        disabled={!form.services?.[key]}
                        value={form.jobDetails?.servicePrices?.[key] || ''}
                        onChange={e => set(`jobDetails.servicePrices.${key}`, e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {SERVICES.map(({ key, label }) => {
                  const active = customer.services?.[key]
                  const price = customer.jobDetails?.servicePrices?.[key]
                  const freq = customer.jobDetails?.serviceFrequencies?.[key]
                  return (
                    <div key={key} className={`flex items-center justify-between p-3 rounded-xl ${
                      active ? 'bg-lime/10' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${active ? 'bg-lime' : 'bg-gray-300'}`} />
                        <span className={`text-sm font-medium ${active ? 'text-forest' : 'text-gray-400'}`}>{label}</span>
                        {active && freq && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white text-forest border border-lime/40">
                            {frequencyLabel(freq)}
                          </span>
                        )}
                      </div>
                      {active && price ? (
                        <span className="text-sm font-semibold text-forest">{formatCurrency(Number(price))}</span>
                      ) : active ? (
                        <span className="text-xs text-gray-400">No price set</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Photos ───────────────────────────────────────────────── */}
          <div className="card">
            <SectionHeader icon={Clock} title="Before & After Photos" />
            <PhotoUpload
              photos={customer.photos || []}
              onAdd={handleAddPhoto}
              onDelete={handleDeletePhoto}
            />
          </div>

          {/* ── Invoice History ──────────────────────────────────────── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-dark">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-lime" />
                <h2 className="text-lg font-display tracking-wide text-forest">Invoice History</h2>
              </div>
              <Link to={`/invoices/new?customerId=${id}`} className="btn-accent py-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> New Invoice
              </Link>
            </div>
            {customerInvoices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No invoices yet for this customer.</p>
            ) : (
              <div className="space-y-2">
                {customerInvoices.map(inv => (
                  <Link key={inv.id} to={`/invoices/${inv.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-cream transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">{formatShortDate(inv.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge badge-${inv.status}`}>{inv.status}</span>
                      <span className="text-sm font-semibold text-forest">{formatCurrency(inv.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Equipment sidebar */}
        <div className="space-y-6">
          <div className="card">
            <SectionHeader icon={Wrench} title="Equipment" />
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Mower Model</label>
                  <input className="input" value={form.equipment?.mowerModel || ''}
                    onChange={e => set('equipment.mowerModel', e.target.value)}
                    placeholder="e.g. Honda HRX217" />
                </div>
                <div>
                  <label className="label">Type</label>
                  <div className="flex gap-2">
                    {['push', 'riding'].map(type => (
                      <button key={type} type="button"
                        onClick={() => set('equipment.type', type)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize border-2 transition-colors ${
                          form.equipment?.type === type
                            ? 'border-forest bg-forest text-cream'
                            : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        {type === 'push' ? '🚶 Push' : '🚜 Riding'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Deck Width</label>
                  <input className="input" value={form.equipment?.deckWidth || ''}
                    onChange={e => set('equipment.deckWidth', e.target.value)}
                    placeholder='e.g. 21"' />
                </div>
                <div>
                  <label className="label">Cut Height</label>
                  <input className="input" value={form.equipment?.cutHeight || ''}
                    onChange={e => set('equipment.cutHeight', e.target.value)}
                    placeholder='e.g. 3"' />
                </div>
                <div>
                  <label className="label">Estimated Time</label>
                  <input className="input" value={form.jobDetails?.estimatedTime || ''}
                    onChange={e => set('jobDetails.estimatedTime', e.target.value)}
                    placeholder="e.g. 45 minutes" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Model', value: customer.equipment?.mowerModel },
                  { label: 'Type', value: customer.equipment?.type ? (customer.equipment.type === 'push' ? '🚶 Push' : '🚜 Riding') : null },
                  { label: 'Deck Width', value: customer.equipment?.deckWidth },
                  { label: 'Cut Height', value: customer.equipment?.cutHeight },
                  { label: 'Est. Time', value: customer.jobDetails?.estimatedTime },
                ].map(({ label, value }) => value ? (
                  <div key={label}>
                    <p className="label">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{value}</p>
                  </div>
                ) : null)}
                {!customer.equipment?.mowerModel && !customer.equipment?.type && (
                  <p className="text-sm text-gray-400">No equipment info added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="card bg-forest">
            <h3 className="font-display text-lg tracking-wide text-lime mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Total Invoices</span>
                <span className="font-semibold text-white">{customerInvoices.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Total Billed</span>
                <span className="font-semibold text-lime">
                  {formatCurrency(customerInvoices.reduce((s, i) => s + (i.total || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Paid</span>
                <span className="font-semibold text-lime">
                  {formatCurrency(customerInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Outstanding</span>
                <span className="font-semibold text-yellow-300">
                  {formatCurrency(customerInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-display text-forest mb-2">Delete Customer?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete <strong>{customer.name}</strong> and all their photos.
              Invoice records will be kept. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-outline flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleDeleteCustomer} className="btn-danger flex-1 justify-center">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
