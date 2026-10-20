import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { getOptimizedUrl } from '../lib/cloudinary'
import { formatPrice } from './ProductCard'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
}

const heroBackgrounds = [
  'from-gray-900 to-gray-800',
  'from-slate-900 to-slate-800',
  'from-neutral-900 to-stone-900',
  'from-gray-950 to-gray-900',
]

// Extraction propre et directe de l'image
export function getProductHeroImage(product) {
  if (!product) return null
  if (Array.isArray(product.product_images) && product.product_images.length > 0) {
    const main = product.product_images.find((img) => img.est_principale)
    const imgObj = main || product.product_images[0]
    if (imgObj?.cloudinary_url) return imgObj.cloudinary_url
    if (typeof imgObj === 'string') return imgObj
  }
  if (product.image_url) return product.image_url
  if (product.photo) return product.photo
  if (product.image) return product.image
  return null
}

export default function HeroCarousel({ products = [] }) {
  const [[page, direction], setPage] = useState([0, 0])
  const slides = products && products.length > 0 ? products : []

  const paginate = useCallback(
    (newDirection) => {
      if (slides.length <= 1) return
      setPage(([prev]) => {
        const next = (prev + newDirection + slides.length) % slides.length
        return [next, newDirection]
      })
    },
    [slides.length]
  )

  // Auto-slide toutes les 5 secondes
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => paginate(1), 5000)
    return () => clearInterval(timer)
  }, [slides.length, paginate])

  if (slides.length === 0) {
    return (
      <div className="h-[280px] sm:h-[360px] md:h-[420px] bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-white/60 text-sm md:text-base">Aucun produit en vedette</p>
      </div>
    )
  }

  const currentProduct = slides[page]
  const rawImage = getProductHeroImage(currentProduct)
  const imageUrl = rawImage
    ? getOptimizedUrl(rawImage, { width: 700, height: 700 })
    : null

  return (
    <div className="relative overflow-hidden bg-gray-900 h-[280px] sm:h-[360px] md:h-[420px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={`absolute inset-0 bg-gradient-to-r ${heroBackgrounds[page % heroBackgrounds.length]} flex items-center`}
        >
          <div className="container-main w-full h-full flex items-center">
            {/* Grille 2 colonnes : description d'un côté, photo de l'autre côté */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-10 w-full items-center">
              
              {/* CÔTÉ DESCRIPTION */}
              <div className="z-10 flex flex-col justify-center">
                <span className="inline-block text-primary-400 text-[11px] sm:text-xs md:text-sm font-semibold mb-1 sm:mb-2 uppercase tracking-wide">
                  {currentProduct.categories?.nom || 'Produit Vedette'}
                </span>

                <h2 className="text-sm sm:text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-1 sm:mb-2 md:mb-3 line-clamp-2">
                  {currentProduct.nom}
                </h2>

                <p className="hidden md:block text-gray-300 text-sm md:text-base mb-4 line-clamp-2 max-w-md">
                  {currentProduct.description || 'Découvrez ce produit sélectionné et garanti dans notre boutique.'}
                </p>

                <div className="text-base sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-4">
                  {formatPrice(currentProduct.prix)}
                </div>

                <div>
                  <Link
                    to={`/produit/${currentProduct.slug}`}
                    className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-5 md:px-6 py-1.5 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all text-xs sm:text-sm"
                  >
                    Voir le produit
                    <ArrowRight size={14} className="hidden sm:inline" />
                  </Link>
                </div>
              </div>

              {/* CÔTÉ PHOTO */}
              <div className="flex items-center justify-center h-full">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentProduct.nom}
                    fetchPriority="high"
                    decoding="async"
                    className="max-h-[180px] sm:max-h-[250px] md:max-h-[320px] w-auto max-w-full object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-44 sm:h-44 md:w-60 md:h-60 bg-white/10 rounded-2xl flex items-center justify-center text-white/40 text-xs">
                    Photo du produit
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Flèches Précédent / Suivant discrètes */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-all"
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Points de pagination discrets en bas */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage([i, i > page ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === page ? 'w-6 bg-primary-500' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
