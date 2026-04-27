import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Gem, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchProducts, fetchCategories } from '../lib/supabase'
import HeroCarousel from '../components/HeroCarousel'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedEtat, setSelectedEtat] = useState('tous')
  const [sortBy, setSortBy] = useState('recent')

  // Pagination
  const ITEMS_PER_PAGE = 12
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedEtat, searchParams, sortBy])

  // Read URL params
  useEffect(() => {
    const cat = searchParams.get('categorie')
    const search = searchParams.get('search')
    if (cat) setSelectedCategory(cat)
    // search handled below
  }, [searchParams])

  // Load categories
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  // Load products
  useEffect(() => {
    setLoading(true)
    const filters = {}
    if (selectedCategory) filters.categorie_id = selectedCategory
    if (selectedEtat !== 'tous') filters.etat = selectedEtat
    const search = searchParams.get('search')
    if (search) filters.search = search

    fetchProducts(filters)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedCategory, selectedEtat, searchParams])

  // Load featured products for hero
  useEffect(() => {
    fetchProducts({ en_vedette: true })
      .then(setFeaturedProducts)
      .catch(console.error)
  }, [])

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

  const siteDescription = "GQ Store - Votre destination pour le matériel informatique et high-tech de qualité. Découvrez nos ordinateurs, smartphones, accessoires et plus encore aux meilleurs prix."

  return (
    <>
      <Helmet>
        <title>GQ Store | Matériel informatique et high-tech</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content="matériel informatique, high-tech, ordinateurs, smartphones, accessoires, électronique, GQ Store" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GQ Store | Matériel informatique et high-tech" />
        <meta property="og:description" content={siteDescription} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div>
        {/* Hero Carousel */}
        <HeroCarousel products={featuredProducts} />

      {/* Products Section */}
      <section className="py-10 md:py-14">
        <div className="container-main">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Gem size={20} className="text-primary-700" />
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">
                Nos Produits
              </h2>
              <span className="bg-surface-tertiary text-text-muted text-xs font-medium px-2.5 py-1 rounded-full">
                {products.length} produit{products.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-field pr-8 text-sm min-w-[160px]"
              >
                <option value="">Toutes catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* État Filter */}
            <div className="flex items-center bg-surface-tertiary rounded-lg p-0.5">
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
                      ? 'bg-white text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-field pr-8 text-sm min-w-[150px]"
            >
              <option value="recent">Plus récents</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
            </select>

            <div className="flex items-center gap-1.5 text-text-muted ml-auto">
              <SlidersHorizontal size={14} />
              <span className="text-xs">{sortedProducts.length} résultat{sortedProducts.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="mb-6 text-center">
              <p className="text-sm text-text-muted">
                Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length)} sur {sortedProducts.length} produits
              </p>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
              {[...Array(10)].map((_, i) => (
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
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">Aucun produit trouvé</p>
              <p className="text-text-light text-sm mt-1">
                Essayez de modifier vos filtres
              </p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              key={currentPage}
            >
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                const isCurrent = page === currentPage
                const isEdge = page === 1 || page === totalPages
                const isNear = Math.abs(page - currentPage) <= 1

                if (!isEdge && !isNear) {
                  if (page === 2 || page === totalPages - 1) {
                    return (
                      <span key={page} className="px-2 text-text-muted">
                        ...
                      </span>
                    )
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
                        : 'border border-border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Page suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-16 md:py-20">
          <div className="container-main relative z-10">
            <span className="text-primary-400 text-xs font-semibold uppercase tracking-widest">
              Promo sur achat en gros
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-white mt-3 mb-4 max-w-lg">
              Réduction de 5 à 10%
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-md mb-6">
              Profitez de remises exceptionnelles sur vos achats en quantité. Contactez-nous pour plus d'informations.
            </p>
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '22998471366'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all text-sm"
            >
              Découvrir
            </a>
          </div>
          {/* Decorative gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-800/20 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
    </>
  )
}
