import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Settings } from 'lucide-react'

const links = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/invoices',  label: 'Invoices',  icon: FileText },
  { to: '/settings',  label: 'Settings',  icon: Settings },
]

export default function Navbar() {
  return (
    <nav className="bg-forest shadow-lg sticky top-0 z-40 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border border-lime/60 flex items-center justify-center">
              <span className="text-lime text-sm">⛳</span>
            </div>
            <span className="font-display text-white text-2xl tracking-[0.2em] font-semibold">LAWNCARE PRO</span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-lime text-forest'
                      : 'text-cream/70 hover:text-cream hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
