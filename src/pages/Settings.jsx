// pages/Settings.jsx — full rewrite with branding studio
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp, applyTheme } from '../context/AppContext'
import { Save, Building2, Receipt, CheckCircle, Palette, Image, Upload, X, Leaf, UserCog, ChevronRight } from 'lucide-react'

const PRESET_PRIMARIES = [
  { hex: '#1B3D1B', name: 'Forest Green' },
  { hex: '#1A3A5C', name: 'Navy Blue'    },
  { hex: '#3D1B1B', name: 'Deep Red'     },
  { hex: '#1B1B3D', name: 'Indigo'       },
  { hex: '#2D2D2D', name: 'Charcoal'     },
  { hex: '#3D3D1B', name: 'Olive'        },
]
const PRESET_ACCENTS = [
  { hex: '#E8C000', name: 'Gold'       },
  { hex: '#FF6B35', name: 'Orange'     },
  { hex: '#4CAF50', name: 'Lime Green' },
  { hex: '#00BCD4', name: 'Cyan'       },
  { hex: '#E91E63', name: 'Pink'       },
  { hex: '#9C27B0', name: 'Purple'     },
]

export default function Settings() {
  const { settings, saveSettings, uploadBrandLogo } = useApp()
  const [form, setForm]   = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const logoRef = useRef(null)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleColorChange = (field, hex) => {
    set(field, hex)
    applyTheme({ ...form, [field]: hex })
  }

  const handleLogoUpload = async (file) => {
    if (!file) return
    try {
      const url = await uploadBrandLogo(file)
      set('logoDataUrl', url)
    } catch (err) {
      alert(`Could not upload logo: ${err.message || err}`)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await saveSettings({ ...form, taxRate: Number(form.taxRate), nextInvoiceNumber: Number(form.nextInvoiceNumber), isSetupComplete: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert(`Could not save: ${err.message || err}`)
    }
  }

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-3 mb-5 pb-4 border-b border-cream-dark">
      <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-forest" />
      </div>
      <div>
        <h2 className="text-lg font-display tracking-wide text-forest">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-header mb-1">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Configure your business portal — color changes preview live.</p>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Brand & Appearance ─────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={Palette} title="Brand & Appearance"
            subtitle="Logo and colors appear throughout the app and on every invoice." />

          {/* Logo */}
          <div className="mb-6">
            <label className="label">Business Logo</label>
            {form.logoDataUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-36 h-20 bg-gray-50 rounded-xl border border-cream-dark flex items-center justify-center p-2">
                  <img src={form.logoDataUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => logoRef.current?.click()} className="btn-outline text-sm py-2">
                    <Upload className="w-3.5 h-3.5" /> Replace
                  </button>
                  <button type="button" onClick={() => set('logoDataUrl', null)} className="btn-ghost text-red-500 text-sm py-2">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => logoRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:border-forest hover:bg-forest/5 transition-colors group">
                <Image className="w-6 h-6 text-gray-300 group-hover:text-forest transition-colors" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-400 group-hover:text-forest">Upload your logo</p>
                  <p className="text-xs text-gray-300">PNG, JPG, SVG — any size</p>
                </div>
              </button>
            )}
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { handleLogoUpload(e.target.files[0]); e.target.value = '' }} />
          </div>

          {/* Tagline */}
          <div className="mb-6">
            <label className="label">Tagline <span className="normal-case font-normal text-gray-400">(optional)</span></label>
            <input className="input" placeholder="e.g. Professional Lawn Care You Can Trust"
              value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} />
          </div>

          {/* Primary Color */}
          <div className="mb-5">
            <label className="label">Primary Color</label>
            <p className="text-xs text-gray-400 mb-3">Navigation bar, buttons, headings.</p>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_PRIMARIES.map(({ hex, name }) => (
                <button key={hex} type="button" title={name}
                  onClick={() => handleColorChange('primaryColor', hex)}
                  className={`aspect-square rounded-xl border-2 transition-all hover:scale-110 ${form.primaryColor === hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor || '#1B3D1B'}
                onChange={e => handleColorChange('primaryColor', e.target.value)}
                className="w-12 h-10 rounded-xl cursor-pointer border border-gray-200 p-1" />
              <input className="input font-mono text-sm" style={{ maxWidth: '120px' }}
                value={form.primaryColor || ''}
                onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && handleColorChange('primaryColor', e.target.value)} />
              <div className="flex-1 h-10 rounded-xl border border-gray-100 transition-colors" style={{ backgroundColor: form.primaryColor }} />
            </div>
          </div>

          {/* Accent Color */}
          <div className="mb-5">
            <label className="label">Accent Color</label>
            <p className="text-xs text-gray-400 mb-3">Active nav, highlights, call-to-action buttons.</p>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_ACCENTS.map(({ hex, name }) => (
                <button key={hex} type="button" title={name}
                  onClick={() => handleColorChange('accentColor', hex)}
                  className={`aspect-square rounded-xl border-2 transition-all hover:scale-110 ${form.accentColor === hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={form.accentColor || '#E8C000'}
                onChange={e => handleColorChange('accentColor', e.target.value)}
                className="w-12 h-10 rounded-xl cursor-pointer border border-gray-200 p-1" />
              <input className="input font-mono text-sm" style={{ maxWidth: '120px' }}
                value={form.accentColor || ''}
                onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && handleColorChange('accentColor', e.target.value)} />
              <div className="flex-1 h-10 rounded-xl border border-gray-100 transition-colors" style={{ backgroundColor: form.accentColor }} />
            </div>
          </div>

          {/* Live preview */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <p className="text-xs text-gray-400 px-3 pt-2">Live preview</p>
            <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: form.primaryColor || '#1B3D1B' }}>
              {form.logoDataUrl
                ? <img src={form.logoDataUrl} alt="" className="h-7 w-auto object-contain max-w-[120px]" />
                : <Leaf className="w-5 h-5 flex-shrink-0" style={{ color: form.accentColor }} />}
              <span className="font-display tracking-widest text-white text-base truncate">
                {form.businessName || 'YOUR BUSINESS'}
              </span>
              <div className="ml-auto px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: form.accentColor, color: form.primaryColor }}>Active</div>
            </div>
            <div className="px-3 py-2.5 bg-linen flex gap-2">
              <div className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: form.primaryColor }}>Primary</div>
              <div className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: form.accentColor, color: form.primaryColor }}>Accent</div>
            </div>
          </div>
        </div>

        {/* ── Business Info ──────────────────────────────────────────── */}
        <div className="card">
          <SectionHeader icon={Building2} title="Business Information"
            subtitle="Shown on invoices and in the dashboard greeting." />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Business Name</label>
              <input className="input" value={form.businessName || ''}
                onChange={e => set('businessName', e.target.value)} placeholder="My Lawn Care Business" />
            </div>
            <div>
              <label className="label">Owner / Manager Name</label>
              <input className="input" value={form.ownerName || ''}
                onChange={e => set('ownerName', e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone || ''}
                onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" type="tel" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email || ''}
                onChange={e => set('email', e.target.value)} placeholder="you@example.com" type="email" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Business Address</label>
              <input className="input" value={form.address || ''}
                onChange={e => set('address', e.target.value)} placeholder="123 Main St, City, State ZIP" />
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
                onChange={e => set('invoicePrefix', e.target.value)} placeholder="INV" maxLength={6} />
              <p className="text-xs text-gray-400 mt-1">e.g. INV, #, LAWN</p>
            </div>
            <div>
              <label className="label">Next Invoice #</label>
              <input className="input" type="number" min="1" value={form.nextInvoiceNumber || 1}
                onChange={e => set('nextInvoiceNumber', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Auto-increments after each</p>
            </div>
            <div>
              <label className="label">Default Tax Rate (%)</label>
              <input className="input" type="number" min="0" max="100" step="0.1" value={form.taxRate || 0}
                onChange={e => set('taxRate', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Set 0 for no tax</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-linen rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Next invoice will be numbered</p>
            <p className="font-display text-xl text-forest">
              {form.invoicePrefix || 'INV'}-{String(form.nextInvoiceNumber || 1).padStart(4, '0')}
            </p>
          </div>
        </div>

        {/* ── Account ─────────────────────────────────────────────────── */}
        <Link to="/account" className="card flex items-center justify-between hover:border-forest transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
              <UserCog className="w-4 h-4 text-forest" />
            </div>
            <div>
              <p className="font-display tracking-wide text-forest">Account & Login</p>
              <p className="text-xs text-gray-400">Change your email, password, or sign out.</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>

        <div className="flex gap-3 justify-end pb-6">
          <button type="submit" className="btn-primary px-6">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
          </button>
        </div>
      </form>
    </div>
  )
}
