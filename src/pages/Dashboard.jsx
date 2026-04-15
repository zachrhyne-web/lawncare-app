import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import StatCard from '../components/StatCard'
import { formatCurrency, formatShortDate } from '../utils/invoiceHelpers'
import { Plus, Users, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { customers, invoices, settings } = useApp()

  const now = new Date()
  const thisMonth = (iso) => {
    const d = new Date(iso)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  const invoicesThisMonth = invoices.filter(inv => thisMonth(inv.date))
  const revenueThisMonth  = invoicesThisMonth.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0)
  const outstanding       = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0)

  const recentCustomers = [...customers].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentInvoices  = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = settings.ownerName || 'there'

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="section-header">{greeting}, {name}!</h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening with your lawn care business.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Customers"      value={customers.length} />
        <StatCard label="Invoices This Month"  value={invoicesThisMonth.length} />
        <StatCard label="Revenue This Month"   value={formatCurrency(revenueThisMonth)} accent />
        <StatCard label="Outstanding Balance"  value={formatCurrency(outstanding)} sub={`${invoices.filter(i => i.status !== 'paid').length} unpaid`} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link to="/customers/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New Customer
        </Link>
        <Link to="/invoices/new" className="btn-accent">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Customers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-dark">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-lime" />
              <h2 className="font-display text-lg text-forest tracking-wide">Recent Customers</h2>
            </div>
            <Link to="/customers" className="text-xs text-lime font-semibold hover:underline">View all</Link>
          </div>
          {recentCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No customers yet.</p>
          ) : (
            <div className="space-y-1">
              {recentCustomers.map(c => (
                <Link key={c.id} to={`/customers/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-cream transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.address}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-dark">
            <div className="flex items-center gap-2">
              <span className="text-lime text-base">$</span>
              <h2 className="font-display text-lg text-forest tracking-wide">Recent Invoices</h2>
            </div>
            <Link to="/invoices" className="text-xs text-lime font-semibold hover:underline">View all</Link>
          </div>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No invoices yet.</p>
          ) : (
            <div className="space-y-1">
              {recentInvoices.map(inv => (
                <Link key={inv.id} to={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-cream transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400">{inv.customerSnapshot?.name} · {formatShortDate(inv.date)}</p>
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
    </div>
  )
}
