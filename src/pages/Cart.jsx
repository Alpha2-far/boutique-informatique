import { Link } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { motion } from 'framer-motion'

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useCartStore()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <ShoppingBag className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Votre panier est vide</h1>
          <p className="text-text-muted mb-6">Découvrez nos produits et faites-vous plaisir !</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 btn-primary px-8 py-3 rounded-xl font-semibold"
          >
            Retourner aux achats
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
        <span className="text-text-primary">Panier</span>
      </nav>

      <h1 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-primary" />
        Votre Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des articles */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-border p-4 flex gap-4"
            >
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {item.product_images && item.product_images[0] ? (
                  <img
                    src={item.product_images[0].cloudinary_url}
                    alt={item.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Infos produit */}
              <div className="flex-1">
                <Link
                  to={`/produit/${item.slug}`}
                  className="font-semibold text-text-primary hover:text-primary transition-colors"
                >
                  {item.nom}
                </Link>
                <p className="text-sm text-text-muted mt-1">
                  {item.categories?.nom || 'Catégorie non disponible'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge-${item.etat === 'neuf' ? 'neuf' : 'occasion'}`}>
                    {item.etat === 'neuf' ? 'Neuf' : 'Occasion'}
                  </span>
                  {item.marque && (
                    <span className="text-xs text-text-muted">Marque: {item.marque}</span>
                  )}
                </div>
              </div>

              {/* Prix et quantité */}
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {item.prix.toLocaleString('fr-FR')} FCFA
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Diminuer la quantité"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Augmenter la quantité"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bouton supprimer */}
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                aria-label="Supprimer l'article"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}

          {/* Bouton vider le panier */}
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Vider le panier
          </button>
        </div>

        {/* Résumé de la commande */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
            <h2 className="text-xl font-bold text-text-primary mb-4">Résumé de la commande</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-text-muted">
                <span>Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                <span>{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Livraison</span>
                <span className="text-green-600">Calculée à l'étape suivante</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-text-primary">
                <span>Total</span>
                <span className="text-primary">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <button className="w-full btn-primary py-3 rounded-xl font-semibold mb-3">
              Passer la commande
            </button>

            <Link
              to="/"
              className="block text-center text-primary hover:underline font-medium"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
