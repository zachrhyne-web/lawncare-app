// pages/InvoiceDetail.jsx
import { useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import InvoiceTemplate from '../components/InvoiceTemplate'
import { exportInvoiceToPDF } from '../utils/pdfExport'
import { formatCurrency } from '../utils/invoiceHelpers'
import {
  ArrowLeft, Download, CheckCircle, Send, Trash2, Edit2, FileText
} from 'lucide-react'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { invoices, updateInvoice, deleteInvoice } = useApp()
  const invoice = invoices.find(inv => inv.id === id)
  const templateRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  if (!invoice) {
    return (
      <div className="page-container text-center py-16">
        <p className="text-2xl font-display text-gray-300 mb-4">INVOICE NOT FOUND</p>
        <Link to="/invoices" className="btn-primary">Back to Invoices</Link>
      </div>
    )
  }

  const handleStatusChange = (newStatus) => {
    updateInvoice({ ...invoice, status: newStatus })
  }

  const handleDelete = () => {
    deleteInvoice(id)
    navigate('/invoices')
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const filename = `${invoice.invoiceNumber}-${(invoice.customerSnapshot?.name || 'invoice').replace(/\s+/g, '-')}.pdf`
      await exportInvoiceToPDF(templateRef.current, filename)
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const statusConfig = {
    draft: { label: 'Draft', badge: 'badge-draft', next: ['sent'] },
    sent:  { label: 'Sent',  badge: 'badge-sent',  next: ['paid', 'draft'] },
    paid:  { label: 'Paid',  badge: 'badge-paid',  next: ['sent'] },
  }
  const config = statusConfig[invoice.status] || statusConfig.draft

  return (
    <div className="page-container max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/invoices" className="btn-ghost text-gray-500">
          <ArrowLeft className="w-4 h-4" /> Invoices
        </Link>
        <div className="flex gap-2 flex-wrap justify-end">
          {/* Status actions */}
          {invoice.status !== 'paid' && (
            <button onClick={() => handleStatusChange('paid')}
              className="btn-accent">
              <CheckCircle className="w-4 h-4" /> Mark as Paid
            </button>
          )}
          {invoice.status === 'draft' && (
            <button onClick={() => handleStatusChange('sent')}
              className="btn-outline">
              <Send className="w-4 h-4" /> Mark as Sent
            </button>
          )}
          {invoice.status === 'paid' && (
            <button onClick={() => handleStatusChange('sent')}
              className="btn-ghost text-gray-500 border border-gray-200">
              Revert to Sent
            </button>
          )}

          <button onClick={handleExportPDF} disabled={exporting}
            className="btn-primary">
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Download PDF'}
          </button>

          <button onClick={() => setShowDeleteModal(true)}
            className="btn-ghost text-red-500 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status + summary bar */}
      <div className="card mb-6 no-print">
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <p className="label">Invoice</p>
            <p className="text-xl font-display text-forest">{invoice.invoiceNumber}</p>
          </div>
          <div>
            <p className="label">Customer</p>
            <p className="text-sm font-semibold text-gray-900">
              {invoice.customerSnapshot?.name}
            </p>
          </div>
          <div>
            <p className="label">Status</p>
            <span className={`badge ${config.badge} text-sm px-3 py-1`}>
              {invoice.status}
            </span>
          </div>
          <div className="ml-auto text-right">
            <p className="label">Total Amount</p>
            <p className="text-2xl font-display text-forest">{formatCurrency(invoice.total)}</p>
          </div>
        </div>
      </div>

      {/* Invoice template — this gets captured for PDF */}
      <div className="overflow-x-auto">
        <div className="min-w-[816px]">
          <InvoiceTemplate invoice={invoice} forwardedRef={templateRef} />
        </div>
      </div>

      {/* Customer link */}
      {invoice.customerId && (
        <div className="mt-4 no-print">
          <Link to={`/customers/${invoice.customerId}`}
            className="text-sm text-lime font-semibold hover:underline flex items-center gap-1">
            <FileText className="w-4 h-4" />
            View Customer Profile →
          </Link>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-display text-forest mb-2">Delete Invoice?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete invoice <strong>{invoice.invoiceNumber}</strong>.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-outline flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
