import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchCategories, fetchProducts } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

const ITEMS_PER_PAGE = 12

export default function Categorie() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [categorie, setCategorie] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [selectedEtat, setSelectedEtat] = useState('tous')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedMarque, setSelectedMarque] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [slug, selectedEtat, priceRange, selectedMarque, sortBy, searchParams])

  // Load categories and find current
  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        const current = cats.find((c) => c.slug === slug)
        setCategorie(current || null)
      })
      .catch(console.error)
  }, [slug])

  // Load products
  useEffect(() => {
    setLoading(true)
    const filters = {}
    if (categorie?.id) filters.categorie_id = categorie.id
    if (selectedEtat !== 'tous') filters.etat = selectedEtat
    const search = searchParams.get('search')
    if (search) filters.search = search

    fetchProducts(filters)
      .then((data) => {
        // Apply client-side filters
        let filtered = data.filter((p) => {
          const priceMatch = p.prix >= priceRange[0] && p.prix <= priceRange[1]
          const marqueMatch = !selectedMarque || p.marque === selectedMarque
          return priceMatch && marqueMatch
        })
        setProducts(filtered)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [categorie, selectedEtat, priceRange, selectedMarque, searchParams])

  // Extract unique marques
  const marques = useMemo(() => {
    const unique = new Set(products.map((p) => p.marque).filter(Boolean))
    return Array.from(unique)
  }, [products])

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products]
    if (sortBy === 'prix_asc') sorted.sort((a, b) => a.prix - b.prix)
    else if (sortBy === 'prix_desc') sorted.sort((a, b) => b.prix - a.prix)
    else sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return sorted
  }, [products, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedProducts, currentPage])

  // Clear all filters
  const clearFilters = () => {
    setSelectedEtat('tous')
    setPriceRange([0, 1000000])
    setSelectedMarque('')
    setSortBy('recent')
  }

  if (!categorie) {
    return (
      <div className="container-main py-20 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">Catégorie introuvable</h2>
        <p className="text-text-muted mb-6">Cette catégorie n'existe pas ou a été supprimée.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    )
  }

  const hasActiveFilters = selectedEtat !== 'tous' || priceRange[0] > 0 || priceRange[1] < 1000000 || selectedMarque

  return (
    <div className="bg-surface-secondary min-h-screen">
      <div className="container-main py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight size={14} />
          <span className="text-text-primary font-medium">{categorie.nom}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            {categorie.nom}
          </h1>
          <p className="text-text-muted">
            {sortedProducts.length} produit{sortedProducts.length !== 1 ? 's' : ''} trouvé{sortedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-white transition-colors lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filtres
          </button>

          {/* État Filter - Desktop */}
          <div className="hidden lg:flex items-center bg-white border border-border rounded-lg p-0.5">
            {[
              { value: 'tous', label: 'Tous' },
              { value: 'neuf', label: 'Neuf' },
              { value: 'occasion', label: 'Occasion' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedEtat(opt.value)}
                className={`text-xs font-medium px-3.5 py-2 rounded-md transition-all ${
                  selectedEtat === opt.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Marque Filter */}
          {marques.length > 0 && (
            <select
              value={selectedMarque}
              onChange={(e) => setSelectedMarque(e.target.value)}
              className="select-field pr-8 text-sm"
            >
              <option value="">Toutes marques</option>
              {marques.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select-field pr-8 text-sm"
          >
            <option value="recent">Plus récents</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={14} />
              Réinitialiser
            </button>
          )}

          <div className="ml-auto text-sm text-text-muted">
            {paginatedProducts.length} sur {sortedProducts.length} produits
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white border border-border rounded-xl p-4 sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-3">État</h3>
                <div className="space-y-2">
                  {[
                    { value: 'tous', label: 'Tous' },
                    { value: 'neuf', label: 'Neuf' },
                    { value: 'occasion', label: 'Occasion' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="etat"
                        checked={selectedEtat === opt.value}
                        onChange={() => setSelectedEtat(opt.value)}
                        className="w-4 h-4 text-primary-700"
                      />
                      <span className="text-sm text-text-secondary">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary mb-3">Prix</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">0 FCFA</span>
                    <span className="font-medium text-primary">
                      {priceRange[1].toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {marques.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-primary mb-3">Marques</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {marques.map((m) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMarque === m}
                          onChange={() => setSelectedMarque(selectedMarque === m ? '' : m)}
                          className="w-4 h-4 text-primary-700 rounded"
                        />
                        <span className="text-sm text-text-secondary">{m}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowFilters(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Filtres</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3">État</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'tous', label: 'Tous' },
                        { value: 'neuf', label: 'Neuf' },
                        { value: 'occasion', label: 'Occasion' },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="etat-mobile"
                            checked={selectedEtat === opt.value}
                            onChange={() => setSelectedEtat(opt.value)}
                            className="w-4 h-4 text-primary-700"
                          />
                          <span className="text-sm text-text-secondary">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-text-primary mb-3">Prix maximum</h4>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <p className="text-sm text-primary font-medium mt-2">
                      {priceRange[1].toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>

                  {marques.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">Marques</h4>
                      <div className="space-y-2">
                        {marques.map((m) => (
                          <label key={m} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedMarque === m}
                              onChange={() => setSelectedMarque(selectedMarque === m ? '' : m)}
                              className="w-4 h-4 text-primary-700 rounded"
                            />
                            <span className="text-sm text-text-secondary">{m}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      clearFilters()
                      setShowFilters(false)
                    }}
                    className="w-full py-2 border border-border rounded-lg font-medium hover:bg-gray-50"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-surface-tertiary" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-4 bg-surface-tertiary rounded w-3/4" />
                      <div className="h-3 bg-surface-tertiary rounded w-1/2" />
                      <div className="h-5 bg-surface-tertiary rounded w-2/3 mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-border">
                <h3 className="text-lg font-bold text-text-primary mb-2">Aucun produit trouvé</h3>
                <p className="text-text-muted mb-4">Essayez de modifier vos filtres</p>
                <button onClick={clearFilters} className="btn-primary">
                  Voir tous les produits
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={currentPage}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      const isCurrent = page === currentPage
                      const isEdge = page === 1 || page === totalPages
                      const isNear = Math.abs(page - currentPage) <= 1

                      if (!isEdge && !isNear) {
                        if (page === 2 || page === totalPages - 1) {
                          return <span key={page} className="px-2 text-text-muted">...</span>
                        }
                        return null
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            isCurrent
                              ? 'bg-primary-700 text-white'
                              : 'border border-border hover:bg-white'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-border hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
