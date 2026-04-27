import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Send, Phone, MapPin, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement actual form submission
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', message: '' })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      <Helmet>
        <title>Contact | GQ Store</title>
        <meta name="description" content="Contactez GQ Store pour toute question. Téléphone, WhatsApp ou formulaire de contact." />
      </Helmet>

      <div className="bg-surface-secondary py-12 md:py-20">
        <div className="container-main">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Contactez-nous
            </h1>
            <p className="text-lg text-text-secondary">
              Une question ? Un besoin spécifique ? Notre équipe est là pour vous répondre.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Envoyez-nous un message
                </h2>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-6 text-center">
                    <p className="font-semibold mb-1">Message envoyé !</p>
                    <p className="text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom"
                        className="input-field"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                        className="input-field"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1.5">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Comment pouvons-nous vous aider ?"
                        className="input-field resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      className="btn-primary w-full py-3.5 gap-2"
                    >
                      <Send size={18} />
                      Envoyer le message
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              {/* WhatsApp */}
              <a
                href="https://wa.me/22998471366"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl border border-border p-6 hover:border-accent-green transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent-green/10 rounded-xl flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
                    <MessageCircle size={28} className="text-accent-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">WhatsApp</h3>
                    <p className="text-text-secondary">+229 98 47 13 66</p>
                  </div>
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+22998471366"
                className="bg-white rounded-2xl border border-border p-6 hover:border-primary-700 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Phone size={28} className="text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">Téléphone</h3>
                    <p className="text-text-secondary">+229 98 47 13 66</p>
                  </div>
                </div>
              </a>

              {/* Address */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={28} className="text-primary-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary mb-1">Adresse</h3>
                    <p className="text-text-secondary">Calavi Bidossessi</p>
                    <p className="text-text-muted text-sm">Bénin</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-primary-50 rounded-2xl border border-primary-100 p-6">
                <h3 className="font-semibold text-primary-900 mb-2">
                  Temps de réponse
                </h3>
                <p className="text-sm text-primary-700">
                  Nous répondons généralement dans les 24 heures ouvrables. Pour une réponse plus rapide, privilégiez WhatsApp.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
