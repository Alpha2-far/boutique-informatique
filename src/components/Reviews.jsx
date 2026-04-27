import { useState } from 'react'
import { Star, User, ThumbsUp, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { addProductReview } from '../lib/supabase'

function StarRating({ rating, onRate, interactive = false, size = 16 }) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            size={size}
            className={
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  )
}

export default function Reviews({ productId, initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [newName, setNewName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !newName.trim()) return

    setSubmitting(true)
    try {
      const review = await addProductReview({
        product_id: productId,
        author_name: newName.trim(),
        rating: newRating,
        comment: newComment.trim(),
        verified: false,
      })
      setReviews([review, ...reviews])
      setNewComment('')
      setNewName('')
      setNewRating(5)
      setShowForm(false)
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error)
      alert('Erreur lors de l\'ajout de l\'avis. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-text-primary mb-4">
        Avis des clients ({reviews.length})
      </h2>

      {/* Résumé */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">{averageRating || '-'}</p>
            <StarRating rating={Math.round(averageRating)} />
            <p className="text-sm text-text-muted mt-1">
              {reviews.length} avis{reviews.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length
              const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 font-medium">{star}</span>
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-text-muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="mb-6">
        {showForm ? (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white border border-border rounded-xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Votre note
              </label>
              <StarRating rating={newRating} onRate={setNewRating} interactive size={24} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Votre nom
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Jean D."
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Votre avis
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Partagez votre expérience avec ce produit..."
                rows={4}
                className="w-full border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                {submitting ? 'Envoi...' : 'Publier l\'avis'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </motion.form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            <ThumbsUp size={18} />
            Donner votre avis
          </button>
        )}
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-text-muted py-8">
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </p>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-primary-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{review.author_name}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size={14} />
                      {review.verified && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle size={12} />
                          Achat vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(review.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
