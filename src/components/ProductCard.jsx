import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { getOptimizedUrl } from '../lib/cloudinary'
import { formatEtat, getEtatBadgeClass } from '../lib/utils'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'

// Helper: format price in FCFA
export function formatPrice(price) {
  if (!price && price !== 0) return '0 FCFA'
  return Number(price).toLocaleString('fr-FR') + ' FCFA'
}

// Helper: get main image from product
export function getMainImage(product) {
  if (!product?.product_images?.length) return null
  const main = product.product_images.find(img => img.est_principale)
  return main || product.product_images[0]
}

// Render star rating
function StarRating({ rating = 4.5 }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < full
              ? 'fill-yellow-400 text-yellow-400'
              : i === full && half
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'text-gray-300'
          }
        />
      ))}
      <span className="text-xs text-text-muted ml-1">({rating})</span>
    </div>
  )
}

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const { toggleWishlist, isInWishlist } = useWishlistStore()

  const mainImage = getMainImage(product)
  const imageUrl = mainImage
    ? getOptimizedUrl(mainImage.cloudinary_url, { width: 400, height: 400 })
    : null

  const specs = (product.product_specs || [])
    .sort((a, b) => a.ordre - b.ordre)
    .slice(0, 3)

  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product, 1)
  }

  const handleToggleWishlist = (e) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <motion.div
      className="card cursor-pointer group flex flex-col h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/produit/${product.slug}`)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-surface-tertiary overflow-hidden shrink-0">
        {/* Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={getEtatBadgeClass(product.etat)}>
            {formatEtat(product.etat)}
          </span>
        </div>

        {/* Product Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-light">
            <ShoppingCart size={48} strokeWidth={1} />
          </div>
        )}

        {/* Wishlist Button (always visible) */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full shadow-md transition-all ${
            inWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
          aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Hover Add Button */}
        {hovered && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg transition-colors z-10"
          >
            <ShoppingCart size={14} />
            Ajouter
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Product Name (exact 2-line height so all titles align) */}
        <h3 className="text-sm font-semibold text-text-primary uppercase line-clamp-2 leading-tight h-10 min-h-[2.5rem] mb-2">
          {product.nom}
        </h3>

        {/* Specs Pills (uniform slot of 52px so cards never shift) */}
        <div className="h-[52px] min-h-[52px] max-h-[52px] overflow-hidden flex flex-wrap content-start gap-1.5 mb-2.5">
          {specs.length > 0 ? (
            specs.map((spec) => (
              <span
                key={spec.id || spec.libelle}
                className="inline-flex items-center gap-1 bg-surface-tertiary text-text-muted text-[10px] font-medium px-2 py-1 rounded max-w-full truncate"
                title={`${spec.libelle ? spec.libelle + ': ' : ''}${spec.valeur}`}
              >
                {spec.valeur}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-text-light italic self-center">Matériel garanti & testé</span>
          )}
        </div>

        {/* Bottom Section (pinned to bottom with mt-auto) */}
        <div className="mt-auto pt-1">
          {/* Rating */}
          <div className="mb-1.5">
            <StarRating />
          </div>

          {/* Price */}
          <p className="text-base font-bold text-text-primary price-format">
            {formatPrice(product.prix)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
