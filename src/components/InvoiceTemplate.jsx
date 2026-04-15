import { formatCurrency, formatDate } from '../utils/invoiceHelpers'

export default function InvoiceTemplate({ invoice, forwardedRef }) {
  const { businessInfo = {}, customerSnapshot = {}, lineItems = [] } = invoice

  return (
    <div
      ref={forwardedRef}
      className="bg-white p-10 font-body text-gray-900"
      style={{ minWidth: '816px', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: '#B8922A', fontSize: '28px' }}>✂</span>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: '#0B2618', letterSpacing: '3px' }}>
              {businessInfo.name || 'LAWNCARE PRO'}
            </h1>
          </div>
          {businessInfo.address && <p className="text-sm text-gray-500">{businessInfo.address}</p>}
          {businessInfo.phone   && <p className="text-sm text-gray-500">{businessInfo.phone}</p>}
          {businessInfo.email   && <p className="text-sm text-gray-500">{businessInfo.email}</p>}
        </div>

        <div className="text-right">
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '42px', color: '#0B2618', letterSpacing: '2px' }}>
            INVOICE
          </div>
          <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: '#B8922A' }}>
            {invoice.invoiceNumber}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex gap-12 mb-10 p-6 rounded-2xl" style={{ backgroundColor: '#F5F3EE' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Bill To</p>
          <p className="font-semibold text-gray-900">{customerSnapshot.name}</p>
          {customerSnapshot.address && <p className="text-sm text-gray-600">{customerSnapshot.address}</p>}
          {customerSnapshot.phone   && <p className="text-sm text-gray-600">{customerSnapshot.phone}</p>}
          {customerSnapshot.email   && <p className="text-sm text-gray-600">{customerSnapshot.email}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Invoice Date</p>
          <p className="text-sm font-medium">{formatDate(invoice.date)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Due Date</p>
          <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Status</p>
          <p className="text-sm font-semibold capitalize" style={{ color: invoice.status === 'paid' ? '#B8922A' : invoice.status === 'sent' ? '#3b82f6' : '#6b7280' }}>
            {invoice.status}
          </p>
        </div>
      </div>

      {/* Line items table */}
      <table className="w-full mb-8 text-sm">
        <thead>
          <tr style={{ backgroundColor: '#0B2618', color: '#F5F3EE' }}>
            <th className="text-left py-3 px-4 rounded-tl-xl" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>Description</th>
            <th className="text-center py-3 px-4" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>Qty</th>
            <th className="text-right py-3 px-4" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>Unit Price</th>
            <th className="text-right py-3 px-4 rounded-tr-xl" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => (
            <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
              <td className="py-3 px-4">{item.description}</td>
              <td className="py-3 px-4 text-center">{item.quantity}</td>
              <td className="py-3 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 px-4 text-right font-semibold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div style={{ width: '260px' }}>
          <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxRate > 0 && (
            <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
              <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 text-base font-bold">
            <span style={{ color: '#0B2618' }}>Total Due</span>
            <span style={{ color: '#0B2618', fontSize: '18px' }}>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Notes</p>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
        Thank you for choosing {businessInfo.name || 'LawnCare Pro'}!
      </div>
    </div>
  )
}
