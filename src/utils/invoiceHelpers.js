import { v4 as uuid } from 'uuid'

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)

export const formatDate = (isoString) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export const formatShortDate = (isoString) => {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export const addDays = (date, days) =>
  new Date(new Date(date).getTime() + days * 86400000)

export const calcLineItemTotal = (item) =>
  Number(item.quantity || 0) * Number(item.unitPrice || 0)

export const calcInvoiceTotals = (lineItems, taxRate) => {
  const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)
  const taxAmount = subtotal * (Number(taxRate) / 100)
  const total = subtotal + taxAmount
  return { subtotal, taxAmount, total }
}

/** Build pre-populated line items from a customer's active services */
export const buildLineItemsFromCustomer = (customer) => {
  const serviceMap = {
    mow:      'Lawn Mowing',
    weedeat:  'Weed Eating',
    edge:     'Edging',
    blowing:  'Leaf/Grass Blowing',
    hedge:    'Hedge Trimming',
  }
  const items = []
  for (const [key, label] of Object.entries(serviceMap)) {
    if (customer.services?.[key]) {
      const unitPrice = Number(customer.jobDetails?.servicePrices?.[key] || 0)
      items.push({
        id: uuid(),
        description: label,
        quantity: 1,
        unitPrice,
        total: unitPrice,
      })
    }
  }
  return items
}
