import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { motion } from 'framer-motion'

export default function Wishlist() {
  const { items, removeWishlist, isInWishlist } = useWishlistStore()
  const { addItem } = useCartStore()

  const handleAddToCart = (product) => {
    addItem(product, 1)
    // Optionnel : retirer des favoris après ajout au panier
    // removeWishlist(product.id)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-red-100 p-6 rounded-full mb-6">
            <Heart className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Vos favoris sont vides</h1>
          <p className="text-text-muted mb-6">Découvrez nos produits et ajoutez-les à vos favoris !</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            Découvrir nos produits
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">Favoris</span>
      </nav>

      <h1 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
        <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
        Mes Favoris ({items.length})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image */}
            <Link to={`/produit/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-100">
              {product.product_images && product.product_images[0] ? (
                <img
                  src={product.product_images[0].cloudinary_url}
                  alt={product.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <span className="text-sm">Aucune image</span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  removeWishlist(product.id)
                }}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                aria-label="Retirer des favoris"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </Link>

            {/* Contenu */}
            <div className="p-4">
              <Link to={`/produit/${product.slug}`}>
                <h3 className="font-semibold text-text-primary line-clamp-2 hover:text-primary transition-colors">
                  {product.nom}
                </h3>
              </Link>

              <p className="text-sm text-text-muted mt-1">
                {product.categories?.nom || 'Catégorie non disponible'}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className={`badge-${product.etat === 'neuf' ? 'neuf' : 'occasion'}`}>
                  {product.etat === 'neuf' ? 'Neuf' : 'Occasion'}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-primary">
                  {product.prix?.toLocaleString('fr-FR')} FCFA
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
                  aria-label="Ajouter au panier"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}
