import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react'
import { fetchCategories } from '../lib/supabase'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'

export default function Navbar() {
  const [categories, setCategories] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const cartItemsCount = useCartStore((state) => state.getTotalItems())
  const wishlistItems = useWishlistStore((state) => state.items)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      {/* Top Bar */}
      <div className="container-main">
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/assets/logo.png" alt="GQ Store" className="h-10 w-auto" />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-primary-700 text-white rounded-r-lg hover:bg-primary-800 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <Link
              to="/admin"
              className="hidden md:flex items-center gap-1.5 text-text-muted hover:text-primary-700 transition-colors px-3 py-2 rounded-lg hover:bg-surface-tertiary text-sm"
            >
              <User size={18} />
            </Link>
            <Link
              to="/favoris"
              className="flex items-center justify-center w-10 h-10 text-text-muted hover:text-primary-700 transition-colors rounded-lg hover:bg-surface-tertiary relative"
            >
              <Heart size={18} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              to="/panier"
              className="flex items-center justify-center w-10 h-10 text-text-muted hover:text-primary-700 transition-colors rounded-lg hover:bg-surface-tertiary relative"
            >
              <ShoppingCart size={18} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-700 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-text-primary"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-4 bg-primary-700 text-white rounded-r-lg"
            >
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Categories Bar - Desktop */}
      <div className="hidden md:block border-t border-border bg-surface-secondary">
        <div className="container-main">
          <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
            <Link
              to="/"
              className="text-sm font-medium text-text-secondary hover:text-primary-700 px-3 py-1.5 rounded-md hover:bg-white transition-all whitespace-nowrap"
            >
              Tous les produits
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categorie/${cat.slug}`}
                className="text-sm font-medium text-text-secondary hover:text-primary-700 px-3 py-1.5 rounded-md hover:bg-white transition-all whitespace-nowrap"
              >
                {cat.nom}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="container-main py-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-text-primary py-2 px-3 rounded-lg hover:bg-surface-tertiary"
            >
              Tous les produits
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categorie/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-text-secondary py-2 px-3 rounded-lg hover:bg-surface-tertiary"
              >
                {cat.nom}
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-text-muted py-2 px-3 rounded-lg hover:bg-surface-tertiary"
              >
                <User size={16} /> Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
