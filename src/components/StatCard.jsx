export default function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`card ${accent ? 'bg-forest' : ''}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${accent ? 'text-white/50' : 'text-gray-400'}`}>
        {label}
      </p>
      <p className={`text-3xl font-display tracking-wide ${accent ? 'text-lime' : 'text-forest'}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-1 ${accent ? 'text-white/40' : 'text-gray-400'}`}>{sub}</p>
      )}
    </div>
  )
}
