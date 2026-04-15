import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatShortDate } from '../utils/invoiceHelpers'
import { FileText, Plus, ChevronRight } from 'lucide-react'

const FILTERS = ['all', 'draft', 'sent', 'paid']

export default function Invoices() {
  const { invoices } = useApp()
  const [filter, setFilter] = useState('all')

  const filtered = [...invoices]
    .filter(inv => filter === 'all' || inv.status === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-lime" />
          <h1 className="section-header">Invoices</h1>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
              filter === f
                ? 'border-forest bg-forest text-cream'
                : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl font-display text-gray-200 mb-2">NO INVOICES</p>
          <p className="text-gray-400 text-sm mb-6">
            {filter !== 'all' ? `No ${filter} invoices.` : 'Create your first invoice to get started.'}
          </p>
          {filter === 'all' && (
            <Link to="/invoices/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Create Invoice
            </Link>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-cream border-b border-cream-dark">
            <div className="col-span-2 label">Invoice #</div>
            <div className="col-span-4 label">Customer</div>
            <div className="col-span-2 label">Date</div>
            <div className="col-span-2 label">Status</div>
            <div className="col-span-2 label text-right">Total</div>
          </div>
          {filtered.map((inv, i) => (
            <Link
              key={inv.id}
              to={`/invoices/${inv.id}`}
              className={`grid grid-cols-12 gap-2 px-4 py-4 items-center hover:bg-cream/60 transition-colors ${
                i !== filtered.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="col-span-2">
                <span className="font-display text-forest">{inv.invoiceNumber}</span>
              </div>
              <div className="col-span-4">
                <p className="text-sm font-semibold text-gray-900 truncate">{inv.customerSnapshot?.name}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">{formatShortDate(inv.date)}</p>
              </div>
              <div className="col-span-2">
                <span className={`badge badge-${inv.status}`}>{inv.status}</span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="text-sm font-semibold text-forest">{formatCurrency(inv.total)}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
