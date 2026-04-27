import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  Package,
  Star,
  Check,
} from 'lucide-react'
import { fetchProductBySlug, fetchSimilarProducts, fetchProductReviews } from '../lib/supabase'
import { getOptimizedUrl } from '../lib/cloudinary'
import ProductCard, { formatPrice, getMainImage } from '../components/ProductCard'
import Reviews from '../components/Reviews'
import { useCartStore } from '../store/cartStore'

export default function ProductDetail() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(product, 1)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  useEffect(() => {
    setLoading(true)
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data)
        const main = getMainImage(data)
        setSelectedImage(main)
        // Load similar products
        if (data.categorie_id) {
          fetchSimilarProducts(data.categorie_id, data.id)
            .then(setSimilarProducts)
            .catch(console.error)
        }
        // Load reviews
        fetchProductReviews(data.id)
          .then(setReviews)
          .catch(console.error)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container-main py-10">
        <div className="animate-pulse">
          <div className="h-4 bg-surface-tertiary rounded w-1/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="aspect-square bg-surface-tertiary rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-surface-tertiary rounded w-3/4" />
              <div className="h-4 bg-surface-tertiary rounded w-1/4" />
              <div className="h-10 bg-surface-tertiary rounded w-1/2 mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">Produit introuvable</h2>
        <p className="text-text-muted mb-6">Ce produit n'existe pas ou a été supprimé.</p>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    )
  }

  const images = (product.product_images || []).sort((a, b) => a.ordre - b.ordre)
  const specs = (product.product_specs || []).sort((a, b) => a.ordre - b.ordre)
  const selectedUrl = selectedImage
    ? getOptimizedUrl(selectedImage.cloudinary_url, { width: 800, height: 800 })
    : null

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '22998471366'
  const whatsappMessage = encodeURIComponent(
    `Bonjour ! Je suis intéressé par : ${product.nom} (${formatPrice(product.prix)})`
  )

  const mainImage = getMainImage(product)
  const imageUrl = mainImage ? getOptimizedUrl(mainImage.cloudinary_url, { width: 1200, height: 1200 }) : null
  const averageRating = reviews.length > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
    : 0

  return (
    <>
      <Helmet>
        <title>{product.nom} | GCO-Store</title>
        <meta name="description" content={product.description?.substring(0, 160) || `Achetez ${product.nom} au meilleur prix chez GCO-Store. Prix: ${formatPrice(product.prix)}`} />
        <meta name="keywords" content={`${product.nom}, ${product.categories?.nom || ''}, matériel informatique, high-tech, ${product.marque || ''}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.nom} | GCO-Store`} />
        <meta property="og:description" content={product.description?.substring(0, 160) || `Achetez ${product.nom} au meilleur prix chez GCO-Store`} />
        <meta property="og:image" content={imageUrl || 'https://via.placeholder.com/1200x1200'} />
        <meta property="og:price:amount" content={product.prix} />
        <meta property="og:price:currency" content="XOF" />
        <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
        <meta property="product:condition" content={product.etat === 'neuf' ? 'new' : 'used'} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.nom} | GCO-Store`} />
        <meta name="twitter:description" content={product.description?.substring(0, 160) || `Achetez ${product.nom} au meilleur prix chez GCO-Store`} />
        <meta name="twitter:image" content={imageUrl || 'https://via.placeholder.com/1200x1200'} />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.nom,
            "description": product.description,
            "image": imageUrl,
            "brand": product.marque || "GCO-Store",
            "offers": {
              "@type": "Offer",
              "price": product.prix,
              "priceCurrency": "XOF",
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "condition": product.etat === 'neuf' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition"
            },
            "aggregateRating": reviews.length > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": averageRating,
              "reviewCount": reviews.length
            } : undefined
          })}
        </script>
      </Helmet>

      <div className="bg-surface-secondary min-h-screen">
        <div className="container-main py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-text-muted mb-6 md:mb-8 flex-wrap">
          <Link to="/" className="hover:text-primary-700 transition-colors">Accueil</Link>
          <ChevronRight size={14} />
          {product.categories && (
            <>
              <Link
                to={`/?categorie=${product.categories.id}`}
                className="hover:text-primary-700 transition-colors"
              >
                {product.categories.nom}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <span className="text-text-primary font-medium truncate max-w-[200px]">
            {product.nom}
          </span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Image Gallery — 55% */}
          <div className="lg:col-span-7">
            <motion.div
              className="bg-white rounded-xl border border-border overflow-hidden mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {selectedUrl ? (
                <img
                  src={selectedUrl}
                  alt={product.nom}
                  className="w-full aspect-square object-contain p-4"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-text-light bg-surface-tertiary">
                  <ShoppingCart size={80} strokeWidth={1} />
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                      selectedImage?.id === img.id
                        ? 'border-primary-700 ring-2 ring-primary-200'
                        : 'border-border hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={getOptimizedUrl(img.cloudinary_url, { width: 100, height: 100 })}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info — 45% */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Badge */}
              <span className={product.etat === 'neuf' ? 'badge-neuf' : 'badge-occasion'}>
                {product.etat === 'neuf' ? 'Neuf' : 'Occasion'}
              </span>

              {/* Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-3 mb-3">
                {product.nom}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-4">
                {[...Array(5)].map((_, i) => {
                  const avgRating = reviews.length > 0
                    ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                    : 4
                  return (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < avgRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-yellow-400/50 text-yellow-400'
                      }
                    />
                  )
                })}
                <span className="text-sm text-text-muted ml-1">
                  ({reviews.length} avis{reviews.length > 1 ? 's' : ''})
                </span>
              </div>

              {/* Price */}
              <div className="bg-surface-tertiary rounded-xl p-5 mb-5">
                <p className="text-3xl font-bold text-text-primary price-format">
                  {formatPrice(product.prix)}
                </p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <Package size={16} className={product.stock > 0 ? 'text-green-600' : 'text-red-500'} />
                <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0 ? `En stock (${product.stock} disponible${product.stock > 1 ? 's' : ''})` : 'Rupture de stock'}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`btn-primary flex-1 py-3.5 transition-all ${
                    addedToCart ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} />
                      Ajouté !
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Ajouter au panier
                    </>
                  )}
                </button>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp flex-1 py-3.5"
                >
                  <MessageCircle size={18} />
                  Commander via WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Specs Grid */}
        {specs.length > 0 && (
          <motion.section
            className="mt-10 md:mt-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-text-primary mb-5">
              Caractéristiques techniques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specs.map((spec) => (
                <div key={spec.id} className="spec-cell">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-border">
                    <span className="text-primary-700 text-sm font-bold">
                      {spec.icone || spec.libelle?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{spec.libelle}</p>
                    <p className="text-sm font-semibold text-text-primary">{spec.valeur}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        <Reviews productId={product.id} initialReviews={reviews} />

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-10 md:mt-14 pb-6">
            <h2 className="text-lg font-bold text-text-primary mb-5">
              Produits similaires
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </>
  )
}
