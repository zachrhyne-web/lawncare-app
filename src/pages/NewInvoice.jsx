// pages/NewInvoice.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { v4 as uuid } from 'uuid'
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react'
import {
  calcLineItemTotal, calcInvoiceTotals, buildLineItemsFromCustomer,
  formatCurrency, addDays
} from '../utils/invoiceHelpers'
import { getNextInvoiceNumber } from '../utils/storage'

const emptyLineItem = () => ({
  id: uuid(), description: '', quantity: 1, unitPrice: 0, total: 0,
})

export default function NewInvoice() {
  const { customers, addInvoice, settings } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedCustomerId = searchParams.get('customerId')

  const [customerId, setCustomerId] = useState(preselectedCustomerId || '')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
  const [lineItems, setLineItems] = useState([emptyLineItem()])
  const [taxRate, setTaxRate] = useState(settings.taxRate || 0)
  const [notes, setNotes] = useState('Thank you for your business!')
  const [saving, setSaving] = useState(false)

  // When customer selected, pre-populate line items
  useEffect(() => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId)
      if (customer) {
        const items = buildLineItemsFromCustomer(customer)
        setLineItems(items.length > 0 ? items : [emptyLineItem()])
      }
    }
  }, [customerId, customers])

  const selectedCustomer = customers.find(c => c.id === customerId)

  // Line item handlers
  const updateLineItem = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      updated.total = calcLineItemTotal(updated)
      return updated
    }))
  }

  const addLineItem = () => setLineItems(prev => [...prev, emptyLineItem()])
  const removeLineItem = (id) => setLineItems(prev => prev.filter(i => i.id !== id))

  const { subtotal, taxAmount, total } = calcInvoiceTotals(lineItems, taxRate)

  const saveInvoice = (status) => {
    if (!customerId) { alert('Please select a customer.'); return }
    setSaving(true)

    const invoiceNumber = getNextInvoiceNumber()
    const invoice = {
      invoiceNumber,
      customerId,
      customerSnapshot: selectedCustomer ? {
        name: selectedCustomer.name,
        address: selectedCustomer.address,
        phone: selectedCustomer.phone,
        email: selectedCustomer.email,
      } : {},
      date: new Date(date).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      status,
      lineItems,
      subtotal,
      taxRate: Number(taxRate),
      taxAmount,
      total,
      notes,
      businessInfo: {
        name: settings.businessName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
      },
    }

    const saved = addInvoice(invoice)
    navigate(`/invoices/${saved.id}`)
  }

  return (
    <div className="page-container max-w-4xl">
      <Link to="/invoices" className="btn-ghost mb-6 inline-flex text-gray-500">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </Link>

      <h1 className="section-header mb-6">New Invoice</h1>

      <div className="space-y-6">
        {/* ── Header info ───────────────────────────────────────────── */}
        <div className="card">
          <h2 className="text-lg font-display text-forest mb-4">Invoice Details</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="label">Customer *</label>
              <select className="input" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                <option value="">Select customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Invoice Date</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>

          {selectedCustomer && (
            <div className="mt-4 p-3 bg-cream rounded-xl text-sm">
              <p className="font-semibold text-forest">{selectedCustomer.name}</p>
              <p className="text-gray-500">{selectedCustomer.address}</p>
              {selectedCustomer.phone && <p className="text-gray-500">{selectedCustomer.phone}</p>}
            </div>
          )}
        </div>

        {/* ── Line items ─────────────────────────────────────────────── */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-forest">Line Items</h2>
            <button type="button" onClick={addLineItem} className="btn-ghost text-forest border border-forest/20">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-2">
            <div className="col-span-5 label">Description</div>
            <div className="col-span-2 label text-center">Qty</div>
            <div className="col-span-2 label text-right">Unit Price</div>
            <div className="col-span-2 label text-right">Total</div>
            <div className="col-span-1" />
          </div>

          <div className="space-y-2">
            {lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input className="input text-sm" placeholder="Description"
                    value={item.description}
                    onChange={e => updateLineItem(item.id, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" className="input text-sm text-center" placeholder="1"
                    value={item.quantity}
                    onChange={e => updateLineItem(item.id, 'quantity', Number(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01" className="input text-sm text-right pl-6"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={e => updateLineItem(item.id, 'unitPrice', Number(e.target.value))} />
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold text-forest">
                    {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="col-span-1 flex justify-center">
                  {lineItems.length > 1 && (
                    <button type="button" onClick={() => removeLineItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Tax Rate</span>
                <div className="flex items-center gap-1">
                  <input type="number" min="0" max="100" step="0.1"
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-lime"
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))} />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-cream-dark">
                <span className="text-forest">Total</span>
                <span className="text-forest text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Notes ──────────────────────────────────────────────────── */}
        <div className="card">
          <label className="label">Notes / Payment Instructions</label>
          <textarea className="input resize-none min-h-[80px]" value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Thank you for your business!" />
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="flex gap-3 justify-end pb-6">
          <Link to="/invoices" className="btn-outline">Cancel</Link>
          <button type="button" className="btn-outline"
            onClick={() => saveInvoice('draft')} disabled={saving}>
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button type="button" className="btn-primary"
            onClick={() => saveInvoice('sent')} disabled={saving}>
            <Send className="w-4 h-4" /> Save & Mark Sent
          </button>
        </div>
      </div>
    </div>
  )
}
