import { Link } from 'react-router-dom'
import { MapPin, Clock, ChevronRight } from 'lucide-react'

const SERVICE_LABELS = {
  mow:     { label: 'Mow',     cls: 'badge-mow' },
  weedeat: { label: 'Weed Eat', cls: 'badge-weedeat' },
  edge:    { label: 'Edge',    cls: 'badge-edge' },
  blowing: { label: 'Blowing', cls: 'badge-blowing' },
}

export default function CustomerCard({ customer }) {
  const activeServices = Object.entries(customer.services || {})
    .filter(([, v]) => v)
    .map(([k]) => k)

  return (
    <Link
      to={`/customers/${customer.id}`}
      className="card group flex flex-col gap-3 hover:shadow-md hover:border-lime/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg text-forest group-hover:text-lime transition-colors leading-tight">
            {customer.name}
          </h3>
          {customer.address && (
            <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{customer.address}</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-lime transition-colors mt-1 flex-shrink-0" />
      </div>

      {activeServices.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeServices.map(key => (
            <span key={key} className={`badge ${SERVICE_LABELS[key].cls}`}>
              {SERVICE_LABELS[key].label}
            </span>
          ))}
        </div>
      )}

      {customer.jobDetails?.estimatedTime && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
          <Clock className="w-3 h-3" />
          <span>{customer.jobDetails.estimatedTime}</span>
        </div>
      )}
    </Link>
  )
}
