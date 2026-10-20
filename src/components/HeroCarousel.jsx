import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Star, ShoppingBag, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react'
import { getOptimizedUrl } from '../lib/cloudinary'
import { formatEtat, getEtatBadgeClass } from '../lib/utils'
import { formatPrice } from './ProductCard'

// Variantes d'animation pour une transition fluide et percutante
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.96,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 },
    },
  }),
}

// Thèmes de fond immersifs et contrastés pour sublimer les photos de PC
const heroThemes = [
  {
    bg: 'from-gray-950 via-slate-900 to-gray-900',
    glow: 'from-primary-600/30 via-blue-500/20 to-transparent',
    accent: 'text-primary-400',
    badgeBg: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  },
  {
    bg: 'from-slate-950 via-indigo-950 to-gray-950',
    glow: 'from-indigo-600/30 via-purple-500/20 to-transparent',
    accent: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    bg: 'from-zinc-950 via-emerald-950/70 to-gray-950',
    glow: 'from-emerald-600/30 via-teal-500/20 to-transparent',
    accent: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    bg: 'from-neutral-950 via-amber-950/60 to-gray-950',
    glow: 'from-amber-600/30 via-yellow-500/20 to-transparent',
    accent: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
]

// Extraction infaillible de l'image principale d'un produit
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
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // On prend TOUS les produits en vedette passés en props (sans restriction arbitraire)
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

  const goToSlide = (index) => {
    if (index === page) return
    const dir = index > page ? 1 : -1
    setPage([index, dir])
  }

  // Défilement automatique toutes les 5 secondes (avec pause si survolé ou touché)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return
    const timer = setInterval(() => {
      paginate(1)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length, isPaused, paginate])

  // Gestion du Swipe tactile sur mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsPaused(true)
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        paginate(1) // Glisser vers la gauche -> slide suivant
      } else {
        paginate(-1) // Glisser vers la droite -> slide précédent
      }
    }
    setIsPaused(false)
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-[380px] md:h-[480px] bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">GQ Store — Matériel Informatique</h2>
          <p className="text-white/60 text-sm">Découvrez nos ordinateurs portables Neufs et Venues propres garantis.</p>
        </div>
      </div>
    )
  }

  const currentProduct = slides[page]
  const theme = heroThemes[page % heroThemes.length]

  const rawImage = getProductHeroImage(currentProduct)
  const imageUrl = rawImage
    ? getOptimizedUrl(rawImage, { width: 900, height: 900 })
    : null

  // Spécifications techniques à mettre en valeur (CPU, RAM, Disque)
  const specs = (currentProduct.product_specs || [])
    .sort((a, b) => a.ordre - b.ordre)
    .slice(0, 3)

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '22998471366'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Bonjour GQ Store, je suis intéressé(e) par le produit en vedette : ${currentProduct.nom} (${formatPrice(currentProduct.prix)}). Est-il toujours disponible ?`
  )}`

  return (
    <div
      className="relative overflow-hidden bg-gray-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Carrousel des produits en vedette"
    >
      {/* Conteneur animé pour la transition complète (Photo + Texte + Badges) */}
      <div className="relative min-h-[520px] sm:min-h-[500px] md:h-[540px] lg:h-[560px] flex items-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`absolute inset-0 bg-gradient-to-br ${theme.bg} flex items-center py-8 sm:py-10 md:py-0`}
          >
            {/* Effet de Halo lumineux décoratif centré derrière le produit */}
            <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-tr ${theme.glow} blur-3xl rounded-full pointer-events-none opacity-80`} />

            <div className="container-main relative z-10 w-full h-full flex items-center">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 w-full items-center">
                
                {/* ─── CÔTÉ PHOTO DU PRODUIT SUR MOBILE (Mis en vedette tout en haut sur mobile) ─── */}
                <div className="md:hidden flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[4/3] flex items-center justify-center">
                    {/* Badge d'état flottant sur l'image */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-amber-400 text-gray-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                        <Star size={11} className="fill-current" /> Vedette
                      </span>
                      {currentProduct.etat && (
                        <span className="bg-white/90 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          {formatEtat(currentProduct.etat)}
                        </span>
                      )}
                    </div>

                    {/* Image du produit avec ombre portée réaliste */}
                    {imageUrl ? (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        src={imageUrl}
                        alt={currentProduct.nom}
                        className="w-full h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)]"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 rounded-2xl flex flex-col items-center justify-center text-white/50 border border-white/10">
                        <ShoppingBag size={48} strokeWidth={1.5} />
                        <span className="text-xs mt-2">Photo en arrivage</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── CÔTÉ TEXTE & DÉTAILS DU PRODUIT (Colonnes 1 à 7 sur Desktop) ─── */}
                <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center text-left">
                  {/* Badges catégorie & vedette sur Desktop */}
                  <div className="hidden md:flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-amber-400/90 text-gray-950 font-black text-xs px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                      <Star size={13} className="fill-current" /> En Vedette
                    </span>
                    <span className={`inline-flex items-center gap-1 border text-xs font-semibold px-3 py-1 rounded-full ${theme.badgeBg}`}>
                      <Sparkles size={12} />
                      {currentProduct.categories?.nom || 'PC Portable & High-Tech'}
                    </span>
                    {currentProduct.etat && (
                      <span className="bg-white/10 border border-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                        {formatEtat(currentProduct.etat)}
                      </span>
                    )}
                  </div>

                  {/* Nom du produit */}
                  <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-2 md:mb-3 line-clamp-2">
                    {currentProduct.nom}
                  </h2>

                  {/* Caractéristiques techniques phares (specs) */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {specs.length > 0 ? (
                      specs.map((spec) => (
                        <span
                          key={spec.id || spec.libelle}
                          className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm border border-white/15 text-white/90 text-xs font-medium px-2.5 py-1 rounded-md"
                        >
                          {spec.valeur}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        Matériel vérifié et garanti par GQ Store
                      </span>
                    )}
                  </div>

                  {/* Description courte sur Desktop */}
                  <p className="hidden sm:block text-gray-300 text-xs sm:text-sm md:text-base mb-5 line-clamp-2 max-w-xl">
                    {currentProduct.description ||
                      'Profitez de performances exceptionnelles avec ce modèle sélectionné et garanti par nos techniciens.'}
                  </p>

                  {/* Prix attractif en FCFA */}
                  <div className="flex items-baseline gap-3 mb-5 sm:mb-6">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                      {formatPrice(currentProduct.prix)}
                    </span>
                    <span className="text-xs text-white/60 font-medium">
                      Paiement à la livraison
                    </span>
                  </div>

                  {/* Boutons d'action (CTA) */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/produit/${currentProduct.slug}`}
                      className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-primary-900/40 transition-all"
                    >
                      Voir la fiche
                      <ArrowRight size={16} />
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-emerald-600/90 hover:bg-emerald-600 active:scale-95 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm border border-emerald-500/30 transition-all shadow-md"
                    >
                      <MessageCircle size={16} />
                      <span className="hidden xs:inline">Commander sur</span> WhatsApp
                    </a>
                  </div>
                </div>

                {/* ─── CÔTÉ PHOTO DU PRODUIT SUR DESKTOP (Colonnes 8 à 12) ─── */}
                <div className="hidden md:flex md:col-span-5 lg:col-span-5 items-center justify-center relative">
                  <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
                    {/* Badge flottant garantie */}
                    <div className="absolute top-4 right-4 z-20 bg-gray-900/80 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <div className="text-left">
                        <p className="text-[10px] text-gray-400 uppercase leading-none font-bold">Garantie</p>
                        <p className="text-xs font-bold leading-none mt-0.5">Testé & Garanti</p>
                      </div>
                    </div>

                    {/* Grande photo produit avec ombre portée et effet lévitation */}
                    {imageUrl ? (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="w-full h-full flex items-center justify-center p-4"
                      >
                        <img
                          src={imageUrl}
                          alt={currentProduct.nom}
                          className="max-h-[360px] lg:max-h-[400px] w-auto max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)]"
                        />
                      </motion.div>
                    ) : (
                      <div className="w-72 h-72 bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-white/40">
                        <ShoppingBag size={64} strokeWidth={1} />
                        <span className="text-sm mt-3 font-medium">Photo en cours d'ajout</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── BOUTONS FLÈCHES PRÉCÉDENT / SUIVANT ─── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Produit précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 active:scale-95 shadow-xl"
            aria-label="Produit suivant"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* ─── VIGNETTES PHOTOS (THUMBNAILS) & INDICATEURS INTERACTIFS EN BAS ─── */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-30 max-w-[90%] overflow-x-auto py-1 px-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-2xl">
          {slides.map((prod, i) => {
            const thumbUrl = getProductHeroImage(prod)
            const isCurrent = i === page

            return (
              <button
                key={prod.id || i}
                onClick={() => goToSlide(i)}
                className={`group relative flex items-center gap-2 transition-all duration-300 rounded-full focus:outline-none ${
                  isCurrent
                    ? 'ring-2 ring-amber-400 bg-white/20 px-2.5 py-1'
                    : 'opacity-60 hover:opacity-100 p-1'
                }`}
                title={prod.nom}
                aria-label={`Aller au produit ${prod.nom}`}
              >
                {/* Miniature Photo de l'ordinateur */}
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
                  {thumbUrl ? (
                    <img
                      src={getOptimizedUrl(thumbUrl, { width: 80, height: 80 })}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag size={12} className="text-white/60" />
                  )}
                </div>

                {/* Nom compact visible pour la slide active sur écran moyen/large */}
                {isCurrent && (
                  <span className="hidden sm:inline text-[11px] font-bold text-white max-w-[120px] truncate pr-1">
                    {prod.nom}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
