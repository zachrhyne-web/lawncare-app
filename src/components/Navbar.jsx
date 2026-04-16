import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, Settings, Leaf, LogOut } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/invoices',  label: 'Invoices',  icon: FileText },
  { to: '/settings',  label: 'Settings',  icon: Settings },
]

export default function Navbar() {
  const { settings } = useApp()
  const { signOut, isConfigured } = useAuth()
  const { logoDataUrl, businessName } = settings

  return (
    <nav className="bg-forest shadow-lg sticky top-0 z-40 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Business name */}
          <div className="flex items-center gap-3 min-w-0">
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt={businessName || 'Business logo'}
                className="h-10 w-auto object-contain max-w-[160px]"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-lime" />
                </div>
                <span className="font-display text-white text-xl tracking-widest leading-none truncate">
                  {businessName || 'LAWNCARE PRO'}
                </span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-lime text-forest font-semibold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
            {isConfigured && (
              <button
                onClick={signOut}
                title="Sign out"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
