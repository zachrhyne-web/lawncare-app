import { useState, useRef } from 'react'
import { useApp, applyTheme } from '../context/AppContext'
import { Building2, Phone, Mail, MapPin, Image, Palette, CheckCircle, ArrowRight, Upload, Leaf } from 'lucide-react'

const STEPS = [
  { id: 0, label: 'Business',  icon: Building2 },
  { id: 1, label: 'Logo',      icon: Image },
  { id: 2, label: 'Colors',    icon: Palette },
  { id: 3, label: 'Ready!',    icon: CheckCircle },
]

const PRESET_PRIMARIES = [
  { hex: '#1B3D1B', name: 'Forest Green' },
  { hex: '#1A3A5C', name: 'Navy Blue'    },
  { hex: '#3D1B1B', name: 'Deep Red'     },
  { hex: '#1B1B3D', name: 'Indigo'       },
  { hex: '#2D2D2D', name: 'Charcoal'     },
  { hex: '#3D3D1B', name: 'Olive'        },
]

const PRESET_ACCENTS = [
  { hex: '#E8C000', name: 'Gold'        },
  { hex: '#FF6B35', name: 'Orange'      },
  { hex: '#4CAF50', name: 'Lime Green'  },
  { hex: '#00BCD4', name: 'Cyan'        },
  { hex: '#E91E63', name: 'Pink'        },
  { hex: '#9C27B0', name: 'Purple'      },
]

export default function SetupWizard() {
  const { saveSettings, uploadBrandLogo, settings } = useApp()
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    businessName:  '',
    ownerName:     '',
    phone:         '',
    email:         '',
    address:       '',
    tagline:       '',
    logoDataUrl:   null,
    primaryColor:  '#1B3D1B',
    accentColor:   '#E8C000',
  })
  const [errors, setErrors] = useState({})
  const logoRef = useRef(null)

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleLogoUpload = async (file) => {
    if (!file) return
    try {
      const url = await uploadBrandLogo(file)
      set('logoDataUrl', url)
    } catch (err) {
      alert(`Could not upload logo: ${err.message || err}`)
    }
  }

  const handleColorChange = (field, hex) => {
    set(field, hex)
    // Live preview as you pick
    applyTheme({ ...form, [field]: hex })
  }

  const validateStep = () => {
    if (step === 0) {
      const e = {}
      if (!form.businessName.trim()) e.businessName = 'Business name is required'
      if (!form.ownerName.trim())    e.ownerName    = 'Owner name is required'
      if (!form.phone.trim())        e.phone        = 'Phone number is required'
      setErrors(e)
      return Object.keys(e).length === 0
    }
    return true
  }

  const next = () => {
    if (!validateStep()) return
    setErrors({})
    setStep(s => s + 1)
  }

  const handleFinish = async () => {
    setBusy(true)
    try {
      await saveSettings({
        ...settings,
        ...form,
        taxRate:           settings.taxRate           || 0,
        invoicePrefix:     settings.invoicePrefix      || 'INV',
        nextInvoiceNumber: settings.nextInvoiceNumber  || 1,
        isSetupComplete:   true,
      })
    } catch (err) {
      alert(`Could not save: ${err.message || err}`)
      setBusy(false)
    }
  }

  // ── Step renderers ──────────────────────────────────────────────────────────

  const StepBusiness = () => (
    <div className="space-y-4">
      <div>
        <label className="label">Business Name *</label>
        <input className={`input text-base ${errors.businessName ? 'border-red-400' : ''}`}
          placeholder="e.g. Hanson Turf Lawn Service"
          value={form.businessName} onChange={e => set('businessName', e.target.value)} />
        {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
      </div>
      <div>
        <label className="label">Tagline <span className="normal-case font-normal text-gray-400">(optional)</span></label>
        <input className="input" placeholder="e.g. Professional Lawn Care You Can Trust"
          value={form.tagline} onChange={e => set('tagline', e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Owner / Manager Name *</label>
          <input className={`input ${errors.ownerName ? 'border-red-400' : ''}`}
            placeholder="Your full name"
            value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
          {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
        </div>
        <div>
          <label className="label">Phone Number *</label>
          <input className={`input ${errors.phone ? 'border-red-400' : ''}`}
            placeholder="(555) 000-0000" type="tel"
            value={form.phone} onChange={e => set('phone', e.target.value)} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" placeholder="you@yourbusiness.com" type="email"
            value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Business Address</label>
          <input className="input" placeholder="123 Main St, City, State ZIP"
            value={form.address} onChange={e => set('address', e.target.value)} />
        </div>
      </div>
    </div>
  )

  const StepLogo = () => (
    <div className="space-y-6">
      <div>
        <label className="label">Upload Your Logo</label>
        <p className="text-sm text-gray-500 mb-4">
          Your logo appears in the navigation bar and on every invoice PDF. PNG with a transparent background works best.
        </p>

        {form.logoDataUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-xs h-32 bg-gray-50 rounded-2xl border-2 border-cream-dark flex items-center justify-center p-4">
              <img src={form.logoDataUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => logoRef.current?.click()}
                className="btn-outline text-sm">
                <Upload className="w-4 h-4" /> Change Logo
              </button>
              <button type="button" onClick={() => set('logoDataUrl', null)}
                className="btn-ghost text-red-500 text-sm">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => logoRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl
                       flex flex-col items-center justify-center gap-3
                       hover:border-forest hover:bg-forest/5 transition-colors group">
            <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-forest/10
                            flex items-center justify-center transition-colors">
              <Image className="w-7 h-7 text-gray-400 group-hover:text-forest transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 group-hover:text-forest">Click to upload logo</p>
              <p className="text-xs text-gray-400">PNG, JPG, SVG — any size</p>
            </div>
          </button>
        )}

        <input ref={logoRef} type="file" accept="image/*" className="hidden"
          onChange={e => { handleLogoUpload(e.target.files[0]); e.target.value = '' }} />
      </div>

      <div className="p-4 bg-linen rounded-xl border border-cream-dark">
        <p className="text-xs text-gray-400 mb-1">Don't have a digital logo?</p>
        <p className="text-sm text-gray-600">No problem — you can skip this step and add it later in Settings. Your business name will display as text in the meantime.</p>
      </div>
    </div>
  )

  const StepColors = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Pick colors that match your brand. Changes are previewed live on this page.
      </p>

      {/* Primary color */}
      <div>
        <label className="label">Primary Color</label>
        <p className="text-xs text-gray-400 mb-3">Used for the navigation bar, buttons, and headings.</p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {PRESET_PRIMARIES.map(({ hex, name }) => (
            <button key={hex} type="button" title={name}
              onClick={() => handleColorChange('primaryColor', hex)}
              className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-110 ${
                form.primaryColor === hex ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="color" value={form.primaryColor}
              onChange={e => handleColorChange('primaryColor', e.target.value)}
              className="w-12 h-10 rounded-xl cursor-pointer border border-gray-200 p-1" />
          </div>
          <input className="input font-mono text-sm" style={{ maxWidth: '120px' }}
            value={form.primaryColor}
            onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && handleColorChange('primaryColor', e.target.value)} />
          <div className="flex-1 h-10 rounded-xl border border-gray-100 transition-colors"
            style={{ backgroundColor: form.primaryColor }} />
        </div>
      </div>

      {/* Accent color */}
      <div>
        <label className="label">Accent Color</label>
        <p className="text-xs text-gray-400 mb-3">Used for highlights, active nav items, and call-to-action elements.</p>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {PRESET_ACCENTS.map(({ hex, name }) => (
            <button key={hex} type="button" title={name}
              onClick={() => handleColorChange('accentColor', hex)}
              className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-110 ${
                form.accentColor === hex ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input type="color" value={form.accentColor}
            onChange={e => handleColorChange('accentColor', e.target.value)}
            className="w-12 h-10 rounded-xl cursor-pointer border border-gray-200 p-1" />
          <input className="input font-mono text-sm" style={{ maxWidth: '120px' }}
            value={form.accentColor}
            onChange={e => /^#[0-9A-Fa-f]{0,6}$/.test(e.target.value) && handleColorChange('accentColor', e.target.value)} />
          <div className="flex-1 h-10 rounded-xl border border-gray-100 transition-colors"
            style={{ backgroundColor: form.accentColor }} />
        </div>
      </div>

      {/* Live preview bar */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="px-4 py-3 flex items-center gap-3"
          style={{ backgroundColor: form.primaryColor }}>
          <Leaf className="w-5 h-5" style={{ color: form.accentColor }} />
          <span className="font-display tracking-widest text-white text-lg">
            {form.businessName || 'YOUR BUSINESS'}
          </span>
          <div className="ml-auto px-3 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: form.accentColor, color: form.primaryColor }}>
            Dashboard
          </div>
        </div>
        <div className="p-3 bg-linen flex gap-2">
          <div className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ backgroundColor: form.primaryColor }}>Button</div>
          <div className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{ backgroundColor: form.accentColor, color: form.primaryColor }}>Accent</div>
        </div>
      </div>
    </div>
  )

  const StepDone = () => (
    <div className="text-center py-4 space-y-6">
      {form.logoDataUrl ? (
        <div className="w-32 h-32 mx-auto bg-gray-50 rounded-2xl border border-cream-dark flex items-center justify-center p-3">
          <img src={form.logoDataUrl} alt="Your logo" className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: form.primaryColor }}>
          <Leaf className="w-10 h-10" style={{ color: form.accentColor }} />
        </div>
      )}

      <div>
        <h2 className="text-3xl font-display tracking-wide" style={{ color: form.primaryColor }}>
          {form.businessName}
        </h2>
        {form.tagline && <p className="text-gray-500 mt-1">{form.tagline}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
        {[
          { label: 'Owner',   value: form.ownerName },
          { label: 'Phone',   value: form.phone },
          form.email   && { label: 'Email',   value: form.email },
          form.address && { label: 'Address', value: form.address },
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label} className="bg-linen rounded-xl p-3">
            <p className="label">{label}</p>
            <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Everything can be edited later in <strong>Settings</strong>.
      </p>
    </div>
  )

  const stepContent = [<StepBusiness />, <StepLogo />, <StepColors />, <StepDone />]
  const stepTitles  = [
    'Set up your business',
    'Add your logo',
    'Choose your brand colors',
    "You're all set!",
  ]
  const stepSubtitles = [
    'This info appears on your invoices and throughout the app.',
    'Your logo will appear in the nav bar and on every invoice.',
    'Make the app look exactly like your brand.',
    'Your portal is ready. Welcome aboard.',
  ]

  return (
    <div className="min-h-screen bg-linen flex flex-col items-center justify-center px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Leaf className="w-6 h-6 text-forest" />
          <span className="font-display tracking-widest text-forest text-xl">LAWNCARE PRO</span>
        </div>
        <h1 className="text-4xl font-display tracking-wide text-forest">
          {stepTitles[step]}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{stepSubtitles[step]}</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const done    = i < step
          const current = i === step
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                done    ? 'bg-forest text-white' :
                current ? 'bg-lime text-forest' :
                          'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 rounded ${i < step ? 'bg-forest' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-cream-dark p-8">
        {stepContent[step]}

        {/* Footer actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          {step > 0 && step < 3 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="btn-ghost text-gray-500">
              ← Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" onClick={next}
              className="btn-primary ml-auto">
              {step === 2 ? 'Looks great!' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleFinish} disabled={busy}
              className="btn-accent ml-auto text-base px-6">
              <CheckCircle className="w-5 h-5" /> {busy ? 'Launching…' : 'Launch My Portal'}
            </button>
          )}
        </div>

        {/* Skip link on logo step */}
        {step === 1 && (
          <p className="text-center mt-4">
            <button type="button" onClick={() => setStep(2)}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2">
              Skip for now — I'll add it in Settings later
            </button>
          </p>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Powered by LawnCare Pro · Each business owns their own portal
      </p>
    </div>
  )
}
