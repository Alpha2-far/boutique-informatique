import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getMainImage } from './ProductCard'
import { getOptimizedUrl } from '../lib/cloudinary'

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
}

const heroBackgrounds = [
  'from-gray-900 to-gray-800',
  'from-blue-900 to-indigo-900',
  'from-slate-800 to-slate-700',
]

export default function HeroCarousel({ products = [] }) {
  const [[page, direction], setPage] = useState([0, 0])
  const slides = products.slice(0, 3)

  const paginate = useCallback(
    (newDirection) => {
      if (slides.length === 0) return
      setPage(([prev]) => {
        const next = (prev + newDirection + slides.length) % slides.length
        return [next, newDirection]
      })
    },
    [slides.length]
  )

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => paginate(1), 5000)
    return () => clearInterval(timer)
  }, [slides.length, paginate])

  if (slides.length === 0) {
    return (
      <div className="h-[450px] bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-white/60 text-lg">Aucun produit en vedette</p>
      </div>
    )
  }

  const currentProduct = slides[page]
  const mainImage = getMainImage(currentProduct)
  const imageUrl = mainImage
    ? getOptimizedUrl(mainImage.cloudinary_url, { width: 600, height: 600 })
    : null

  return (
    <div className="relative overflow-hidden bg-gray-900 h-[300px] sm:h-[400px] md:h-[480px]">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-r ${heroBackgrounds[page % heroBackgrounds.length]}`}
        >
          <div className="container-main h-full flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
              {/* Text Side */}
              <div className="z-10">
                <span className="inline-block bg-primary-700/80 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {currentProduct.categories?.nom || 'Produit Vedette'}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                  {currentProduct.nom}
                </h1>
                <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-2 max-w-md">
                  {currentProduct.description || 'Découvrez ce produit exceptionnel dans notre boutique.'}
                </p>
                <Link
                  to={`/produit/${currentProduct.slug}`}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-all text-sm"
                >
                  Voir le produit
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Image Side */}
              <div className="hidden md:flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentProduct.nom}
                    className="max-h-[360px] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="w-64 h-64 bg-white/10 rounded-2xl" />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setPage([i, i > page ? 1 : -1])}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === page ? 'w-8 bg-primary-500' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
