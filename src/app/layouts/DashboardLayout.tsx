import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, PlusSquare, MessageSquare, LogOut, Menu, X, ChevronLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/features/auth/authStore'
import { useUIStore } from '@/app/uiStore'
import { getInitials } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'

const navItems = [
  { to: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/seller/listings', icon: ListChecks, label: 'My Listings' },
  { to: '/seller/listings/new', icon: PlusSquare, label: 'New Listing' },
  { to: '/seller/inquiries', icon: MessageSquare, label: 'Inquiries' },
]

export function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const { darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? 'w-16' : 'w-60'} flex-shrink-0 hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200`}
        aria-label="Sidebar navigation"
      >
        {/* Logo area */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
          {sidebarCollapsed ? (
            <Logo variant="symbol" size={32} />
          ) : (
            <Link to="/" aria-label="Go to homepage">
              <Logo variant="full" size={32} />
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto" aria-label="Seller navigation">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/seller/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={18} aria-hidden />
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={16} className={sidebarCollapsed ? 'rotate-180' : ''} aria-hidden />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
          {/* Mobile menu */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Toggle menu"
          >
            <Menu size={20} aria-hidden />
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {user ? getInitials(user.name) : 'S'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut size={15} />} className="hidden sm:flex">
            Sign out
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
