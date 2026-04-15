// pages/Settings.jsx
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Save, Building2, Receipt, CheckCircle } from 'lucide-react'

export default function Settings() {
  const { settings, saveSettings } = useApp()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = (e) => {
    e.preventDefault()
    saveSettings({ ...form, taxRate: Number(form.taxRate), nextInvoiceNumber: Number(form.nextInvoiceNumber) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cream-dark">
      <Icon className="w-4 h-4 text-lime" />
      <h2 className="text-lg font-display tracking-wide text-forest">{title}</h2>
    </div>
  )

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-header mb-2">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Configure your business info and invoice preferences.</p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Business Info ──────────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={Building2} title="Business Information" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Business Name</label>
              <input className="input" value={form.businessName || ''}
                onChange={e => set('businessName', e.target.value)}
                placeholder="My Lawn Care Business" />
            </div>
            <div>
              <label className="label">Owner Name</label>
              <input className="input" value={form.ownerName || ''}
                onChange={e => set('ownerName', e.target.value)}
                placeholder="Your name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone || ''}
                onChange={e => set('phone', e.target.value)}
                placeholder="(555) 000-0000" type="tel" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email || ''}
                onChange={e => set('email', e.target.value)}
                placeholder="you@example.com" type="email" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Business Address</label>
              <input className="input" value={form.address || ''}
                onChange={e => set('address', e.target.value)}
                placeholder="123 Main St, City, State ZIP" />
            </div>
          </div>
        </div>

        {/* ── Invoice Settings ───────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={Receipt} title="Invoice Settings" />
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Invoice Prefix</label>
              <input className="input" value={form.invoicePrefix || 'INV'}
                onChange={e => set('invoicePrefix', e.target.value)}
                placeholder="INV" maxLength={6} />
              <p className="text-xs text-gray-400 mt-1">e.g. INV, #, LAWN</p>
            </div>
            <div>
              <label className="label">Next Invoice #</label>
              <input className="input" type="number" min="1"
                value={form.nextInvoiceNumber || 1}
                onChange={e => set('nextInvoiceNumber', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Auto-increments after each invoice</p>
            </div>
            <div>
              <label className="label">Default Tax Rate (%)</label>
              <input className="input" type="number" min="0" max="100" step="0.1"
                value={form.taxRate || 0}
                onChange={e => set('taxRate', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Set 0 for no tax</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-cream rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Invoice number preview</p>
            <p className="font-display text-lg text-forest">
              {form.invoicePrefix || 'INV'}-{String(form.nextInvoiceNumber || 1).padStart(4, '0')}
            </p>
          </div>
        </div>

        {/* Save */}
        <div className="flex gap-3 justify-end pb-6">
          <button type="submit" className="btn-primary">
            {saved ? (
              <><CheckCircle className="w-4 h-4 text-lime" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Settings</>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
