import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, FolderOpen, LogOut, Menu, X } from 'lucide-react'
import { supabase, signOut } from '../lib/supabase'

export default function AdminLayout() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (!session && !location.pathname.includes('/admin/login')) {
        navigate('/admin/login')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session && !location.pathname.includes('/admin/login')) {
        navigate('/admin/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, location.pathname])

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="w-8 h-8 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If on login page, just render the outlet
  if (location.pathname === '/admin/login') {
    return <Outlet />
  }

  // If not authenticated, don't render the admin
  if (!session) return null

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/produits', icon: Package, label: 'Produits' },
    { to: '/admin/categories', icon: FolderOpen, label: 'Catégories' },
  ]

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col admin-sidebar">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/assets/logo.png" alt="GQ Store" className="h-12 w-auto brightness-0 invert" />
          </Link>
          <p className="text-xs text-gray-500 mt-2">Administration</p>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="admin-nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-auto"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-footer text-white z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <img src="/assets/logo.png" alt="GQ Store" className="h-10 w-auto brightness-0 invert" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-footer p-6 flex flex-col pt-16">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="admin-nav-item text-red-400 hover:text-red-300 mt-auto"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:p-8 p-4 pt-16 lg:pt-8">
        <Outlet />
      </main>
    </div>
  )
}
