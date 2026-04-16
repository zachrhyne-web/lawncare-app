import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Trash2, Receipt, Edit2, Save, X, Paperclip, ExternalLink } from 'lucide-react'
import { formatCurrency, formatShortDate } from '../utils/invoiceHelpers'

const CATEGORIES = ['Fuel', 'Equipment', 'Maintenance', 'Supplies', 'Insurance', 'Software', 'Vehicle', 'Other']

const emptyExpense = () => ({
  date: new Date().toISOString().split('T')[0],
  category: 'Fuel',
  vendor: '',
  amount: '',
  description: '',
  notes: '',
})

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, addExpenseReceipt, removeExpenseReceipt } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyExpense())
  const [editingId, setEditingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const startEdit = (exp) => {
    setForm({
      date: exp.date,
      category: exp.category || 'Other',
      vendor: exp.vendor || '',
      amount: String(exp.amount),
      description: exp.description || '',
      notes: exp.notes || '',
    })
    setEditingId(exp.id)
    setShowForm(true)
  }

  const cancel = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyExpense())
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { alert('Amount must be greater than 0'); return }
    setSaving(true)
    try {
      if (editingId) {
        await updateExpense({ ...form, id: editingId, amount: Number(form.amount) })
      } else {
        await addExpense({ ...form, amount: Number(form.amount) })
      }
      cancel()
    } catch (err) {
      alert(`Could not save: ${err.message || err}`)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return
    try { await deleteExpense(id) }
    catch (err) { alert(`Could not delete: ${err.message || err}`) }
  }

  const handleReceiptUpload = async (expense, file) => {
    if (!file) return
    try { await addExpenseReceipt(expense.id, file) }
    catch (err) { alert(`Could not upload receipt: ${err.message || err}`) }
  }

  const handleReceiptRemove = async (expense) => {
    if (!confirm('Remove this receipt?')) return
    try { await removeExpenseReceipt(expense) }
    catch (err) { alert(`Could not remove receipt: ${err.message || err}`) }
  }

  // Filtering + stats
  const now = new Date()
  const isThisMonth = (d) => {
    const x = new Date(d)
    return x.getMonth() === now.getMonth() && x.getFullYear() === now.getFullYear()
  }
  const isThisYear = (d) => new Date(d).getFullYear() === now.getFullYear()

  const filtered = expenses.filter(e => {
    if (filter === 'all') return true
    if (filter === 'month') return isThisMonth(e.date)
    if (filter === 'year')  return isThisYear(e.date)
    return true
  })

  const monthTotal = expenses.filter(e => isThisMonth(e.date)).reduce((s, e) => s + e.amount, 0)
  const yearTotal  = expenses.filter(e => isThisYear(e.date)).reduce((s, e) => s + e.amount, 0)
  const allTotal   = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Receipt className="w-6 h-6 text-lime" />
          <h1 className="section-header">Expenses</h1>
        </div>
        {!showForm && (
          <button onClick={() => { setForm(emptyExpense()); setEditingId(null); setShowForm(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> New Expense
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="label">This Month</p>
          <p className="text-2xl font-display text-forest mt-1">{formatCurrency(monthTotal)}</p>
        </div>
        <div className="card">
          <p className="label">This Year</p>
          <p className="text-2xl font-display text-forest mt-1">{formatCurrency(yearTotal)}</p>
        </div>
        <div className="card">
          <p className="label">All Time</p>
          <p className="text-2xl font-display text-forest mt-1">{formatCurrency(allTotal)}</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={save} className="card mb-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-dark">
            <h2 className="text-lg font-display tracking-wide text-forest">
              {editingId ? 'Edit Expense' : 'New Expense'}
            </h2>
            <button type="button" onClick={cancel} className="btn-ghost text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" value={form.date}
                onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label className="label">Amount *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Vendor</label>
              <input className="input" value={form.vendor} onChange={e => set('vendor', e.target.value)}
                placeholder="e.g. Home Depot, Shell" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <input className="input" value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="e.g. Gas for truck, string trimmer line" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes <span className="normal-case font-normal text-gray-400">(optional)</span></label>
              <textarea className="input resize-none min-h-[60px]" value={form.notes}
                onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={cancel} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving…' : editingId ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all',   label: 'All' },
          { key: 'year',  label: 'This Year' },
          { key: 'month', label: 'This Month' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
              filter === f.key ? 'border-forest bg-forest text-cream' : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl font-display text-gray-200 mb-2">NO EXPENSES</p>
          <p className="text-gray-400 text-sm">Track fuel, supplies, equipment, and more.</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 p-0">
          {filtered.map(exp => {
            const isImage = exp.receiptUrl && /\.(jpe?g|png|gif|webp)$/i.test(exp.receiptPath || exp.receiptUrl)
            return (
            <div key={exp.id} className="flex items-center gap-4 px-4 py-3 hover:bg-linen transition-colors">
              <div className="flex-shrink-0 w-20 text-xs text-gray-400">{formatShortDate(exp.date)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {exp.description || exp.vendor || exp.category}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {[exp.category, exp.vendor].filter(Boolean).join(' · ')}
                </p>
              </div>
              {exp.receiptUrl ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a href={exp.receiptUrl} target="_blank" rel="noreferrer" title="View receipt"
                    className="flex items-center gap-1 text-xs text-forest hover:underline">
                    {isImage ? (
                      <img src={exp.receiptUrl} alt="Receipt" className="w-10 h-10 object-cover rounded border border-gray-200" />
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-forest/10 text-forest">
                        <Paperclip className="w-3.5 h-3.5" /> Receipt <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </a>
                  <button onClick={() => handleReceiptRemove(exp)} title="Remove receipt"
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label title="Attach receipt"
                  className="flex-shrink-0 cursor-pointer p-2 text-gray-300 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; handleReceiptUpload(exp, f) }} />
                </label>
              )}
              <div className="text-sm font-semibold text-forest flex-shrink-0">
                {formatCurrency(exp.amount)}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(exp)} className="p-2 text-gray-400 hover:text-forest hover:bg-forest/10 rounded-lg transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
