// Shared service metadata — the single source of truth for services across the app.
export const SERVICES = [
  { key: 'mow',     label: 'Mow',                invoiceLabel: 'Lawn Mowing' },
  { key: 'weedeat', label: 'Weed Eat',           invoiceLabel: 'Weed Eating' },
  { key: 'edge',    label: 'Edge',               invoiceLabel: 'Edging' },
  { key: 'blowing', label: 'Leaf/Grass Blowing', invoiceLabel: 'Leaf/Grass Blowing' },
  { key: 'hedge',   label: 'Hedge Trimming',     invoiceLabel: 'Hedge Trimming' },
]

export const FREQUENCIES = [
  { key: 'weekly',    label: 'Weekly',        short: '1×/wk' },
  { key: 'biweekly',  label: 'Bi-weekly',     short: 'every 2 wk' },
  { key: 'triweekly', label: 'Every 3 weeks', short: 'every 3 wk' },
  { key: 'monthly',   label: 'Monthly',       short: '1×/mo' },
  { key: 'asneeded',  label: 'As needed',     short: 'as needed' },
  { key: 'onetime',   label: 'One-time',      short: 'one-time' },
]

export const frequencyLabel = (key) =>
  FREQUENCIES.find(f => f.key === key)?.short || ''
