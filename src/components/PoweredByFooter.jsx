export default function PoweredByFooter({ className = '' }) {
  return (
    <footer className={`text-center py-6 text-xs text-gray-400 no-print ${className}`}>
      Powered by <span className="font-display tracking-wider text-forest">BladeTrak</span>
    </footer>
  )
}
