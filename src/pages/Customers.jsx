import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CustomerCard from '../components/CustomerCard'
import { Search, Plus, Users } from 'lucide-react'

const FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'mow',     label: 'Mow' },
  { key: 'weedeat', label: 'Weed Eat' },
  { key: 'edge',    label: 'Edge' },
  { key: 'blowing', label: 'Blowing' },
]

export default function Customers() {
  const { customers } = useApp()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = customers.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'all' || c.services?.[activeFilter]
    return matchSearch && matchFilter
  })

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-lime" />
          <h1 className="section-header">Customers</h1>
        </div>
        <Link to="/customers/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Customer
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by name or address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                activeFilter === f.key
                  ? 'border-forest bg-forest text-cream'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl font-display text-gray-200 mb-2">NO CUSTOMERS</p>
          <p className="text-gray-400 text-sm mb-6">
            {search || activeFilter !== 'all' ? 'Try a different search or filter.' : 'Get started by adding your first customer.'}
          </p>
          {!search && activeFilter === 'all' && (
            <Link to="/customers/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Add First Customer
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => <CustomerCard key={c.id} customer={c} />)}
        </div>
      )}
    </div>
  )
}
