import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Search, User, Heart, LogOut, ChevronDown, Menu, X, MapPin } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/Button'
import { useAuthStore } from '@/features/auth/authStore'
import { getInitials } from '@/lib/utils'

export function PublicLayout() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchQuery.trim()
    navigate(query ? `/search?query=${encodeURIComponent(query)}` : '/search')
  }

  const navLinks = [
    { to: '/search', label: 'Search' },
    { to: '/recommend', label: 'Recommend' },
    { to: '/about', label: 'About' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-gray-50 shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" aria-label="Nestly home">
            <Logo variant="full" size={36} />
          </Link>

          <form onSubmit={handleSearch} className="hidden max-w-md flex-1 md:flex" role="search">
            <label htmlFor="navigation-search" className="sr-only">Search properties</label>
            <div className="relative w-full">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-900" aria-hidden />
              <input
                id="navigation-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by town or property type"
                className="h-11 w-full rounded-xl border border-white/20 bg-white px-11 pr-4 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </form>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isActive
                      ? 'bg-primary-50 text-primary-900'
                      : 'text-primary-900 hover:bg-white hover:text-primary-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-primary-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-24 truncate">{user.name}</span>
                  <ChevronDown size={14} className="text-primary-700" aria-hidden />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-1">
                      {user.role === 'buyer' && (
                        <>
                          <Link to="/favourites" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setUserMenuOpen(false)}>
                            <Heart size={15} aria-hidden /> Favourites
                          </Link>
                          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setUserMenuOpen(false)}>
                            <User size={15} aria-hidden /> Profile
                          </Link>
                        </>
                      )}
                      {user.role === 'seller' && (
                        <Link to="/seller/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setUserMenuOpen(false)}>
                          <MapPin size={15} aria-hidden /> Seller Dashboard
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setUserMenuOpen(false)}>
                          <User size={15} aria-hidden /> Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-gray-100 dark:border-gray-800" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                        <LogOut size={15} aria-hidden /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Get started</Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-primary-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="space-y-3 border-t border-gray-200 bg-gray-50 px-4 py-4 md:hidden">
            <form onSubmit={handleSearch} className="flex" role="search">
              <label htmlFor="mobile-navigation-search" className="sr-only">Search properties</label>
              <div className="relative w-full">
                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-900" aria-hidden />
                <input
                  id="mobile-navigation-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search properties"
                  className="h-11 w-full rounded-xl bg-white px-11 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </form>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-900' : 'text-primary-900 hover:bg-white hover:text-primary-700'}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                {user?.role === 'buyer' && <Link to="/favourites" className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Favourites</Link>}
                {user?.role === 'seller' && <Link to="/seller/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Seller Dashboard</Link>}
                {user?.role === 'admin' && <Link to="/admin/dashboard" className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Sign out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}>Sign in</Button>
                <Button size="sm" className="flex-1" onClick={() => { navigate('/register'); setMobileMenuOpen(false) }}>Register</Button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Logo variant="full" size={36} className="[&_span:last-child_span:first-child]:text-white" />
              <p className="mt-3 text-sm leading-relaxed max-w-xs">
                Sri Lanka's trusted property marketplace. Find houses, land and apartments across the island.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/search" className="hover:text-white transition-colors">Search listings</Link></li>
                <li><Link to="/recommend" className="hover:text-white transition-colors">Get recommendations</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm">Account</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/seller/dashboard" className="hover:text-white transition-colors">Sell property</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>© 2026 Nestly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
