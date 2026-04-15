// pages/NewCustomer.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Save, User, Wrench, Clock, DollarSign } from 'lucide-react'

const EMPTY_CUSTOMER = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  services: { mow: false, weedeat: false, edge: false, blowing: false },
  equipment: { mowerModel: '', type: '', deckWidth: '', cutHeight: '' },
  jobDetails: {
    estimatedTime: '',
    servicePrices: { mow: '', weedeat: '', edge: '', blowing: '' },
  },
}

export default function NewCustomer() {
  const { addCustomer } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_CUSTOMER)
  const [errors, setErrors] = useState({})

  const set = (path, value) => {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.phone.trim())   e.phone   = 'Phone is required'
    if (!form.address.trim()) e.address = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const customer = addCustomer(form)
    navigate(`/customers/${customer.id}`)
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cream-dark">
      <Icon className="w-4 h-4 text-lime" />
      <h2 className="text-lg font-display tracking-wide text-forest">{title}</h2>
    </div>
  )

  return (
    <div className="page-container max-w-3xl">
      {/* Back */}
      <Link to="/customers" className="btn-ghost mb-6 inline-flex text-gray-500 hover:text-forest">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <h1 className="section-header mb-6">New Customer</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Contact Info ───────────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={User} title="Contact Information" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name *</label>
              <input className={`input ${errors.name ? 'border-red-400' : ''}`}
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Full name or household name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Phone *</label>
              <input className={`input ${errors.phone ? 'border-red-400' : ''}`}
                value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="(555) 000-0000" type="tel" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com" type="email" />
            </div>
            <div>
              <label className="label">Address *</label>
              <input className={`input ${errors.address ? 'border-red-400' : ''}`}
                value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="123 Main St, City, State ZIP" />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* ── Services ───────────────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={DollarSign} title="Services & Pricing" />
          <p className="text-xs text-gray-400 mb-4">Check each service performed and set a price per visit.</p>
          <div className="space-y-3">
            {[
              { key: 'mow',      label: 'Mow',               desc: 'Standard lawn mowing' },
              { key: 'weedeat',  label: 'Weed Eat',          desc: 'Weed eating / string trimming' },
              { key: 'edge',     label: 'Edge',              desc: 'Sidewalk & driveway edging' },
              { key: 'blowing',  label: 'Leaf/Grass Blowing', desc: 'Blow off hard surfaces' },
            ].map(({ key, label, desc }) => (
              <div key={key}
                className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-colors ${
                  form.services[key] ? 'border-lime bg-lime/5' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <label className="flex items-center gap-3 flex-1 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-lime rounded"
                    checked={form.services[key]}
                    onChange={e => set(`services.${key}`, e.target.checked)} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-sm">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    placeholder="0.00"
                    className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right
                               focus:outline-none focus:ring-2 focus:ring-lime bg-white disabled:bg-gray-50"
                    disabled={!form.services[key]}
                    value={form.jobDetails.servicePrices[key]}
                    onChange={e => set(`jobDetails.servicePrices.${key}`, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Equipment ──────────────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={Wrench} title="Equipment Details" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Mower Make / Model</label>
              <input className="input" value={form.equipment.mowerModel}
                onChange={e => set('equipment.mowerModel', e.target.value)}
                placeholder="e.g. Honda HRX217, John Deere E130" />
            </div>

            {/* Mower type toggle */}
            <div>
              <label className="label">Mower Type</label>
              <div className="flex gap-2">
                {['push', 'riding'].map(type => (
                  <button key={type} type="button"
                    onClick={() => set('equipment.type', type)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize border-2 transition-colors ${
                      form.equipment.type === type
                        ? 'border-forest bg-forest text-cream'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {type === 'push' ? '🚶 Push' : '🚜 Riding'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Deck Width</label>
              <input className="input" value={form.equipment.deckWidth}
                onChange={e => set('equipment.deckWidth', e.target.value)}
                placeholder='e.g. 21 inches, 42"' />
            </div>

            <div>
              <label className="label">Cut Height</label>
              <input className="input" value={form.equipment.cutHeight}
                onChange={e => set('equipment.cutHeight', e.target.value)}
                placeholder='e.g. 3 inches, 3.5"' />
              <p className="text-xs text-gray-400 mt-1">Height to mow the grass</p>
            </div>
          </div>
        </div>

        {/* ── Job Details ────────────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={Clock} title="Job Details" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Estimated Time</label>
              <input className="input" value={form.jobDetails.estimatedTime}
                onChange={e => set('jobDetails.estimatedTime', e.target.value)}
                placeholder="e.g. 45 minutes, 1.5 hours" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea className="input min-h-[80px] resize-none" value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Gate codes, dogs, special instructions..." />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pb-6">
          <Link to="/customers" className="btn-outline">Cancel</Link>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" /> Save Customer
          </button>
        </div>
      </form>
    </div>
  )
}
