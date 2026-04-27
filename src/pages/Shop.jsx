import { Helmet } from 'react-helmet-async'
import { MapPin, Clock, Phone, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Shop() {
  return (
    <>
      <Helmet>
        <title>Notre Boutique | GQ Store</title>
        <meta name="description" content="Découvrez notre boutique physique à Calavi Bidossessi. Matériel informatique et high-tech de qualité." />
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
              Notre Boutique
            </h1>
            <p className="text-lg text-text-secondary">
              Venez découvrir nos produits en vrai et bénéficier de conseils personnalisés de notre équipe d'experts.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl border border-border p-8">
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Informations
                </h2>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={24} className="text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">Adresse</h3>
                      <p className="text-text-secondary">Calavi Bidossessi</p>
                      <p className="text-text-muted text-sm">Bénin</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <Clock size={24} className="text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">Horaires d'ouverture</h3>
                      <div className="space-y-1 text-text-secondary">
                        <div className="flex justify-between gap-4">
                          <span>Lundi – Samedi</span>
                          <span className="font-medium text-text-primary">09H30 – 20H30</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>Dimanche</span>
                          <span className="font-medium text-red-600">Fermé</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <Phone size={24} className="text-primary-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">Contact</h3>
                      <p className="text-text-secondary">+229 98 47 13 66</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-border p-6">
                  <Star size={28} className="text-primary-700 mb-3" />
                  <h3 className="font-semibold text-text-primary mb-1">Produits de qualité</h3>
                  <p className="text-sm text-text-muted">Sélection rigoureuse</p>
                </div>
                <div className="bg-white rounded-xl border border-border p-6">
                  <MapPin size={28} className="text-primary-700 mb-3" />
                  <h3 className="font-semibold text-text-primary mb-1">Conseil personnalisé</h3>
                  <p className="text-sm text-text-muted">Équipe experte</p>
                </div>
              </div>
            </motion.div>

            {/* Map/Image Section */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl border border-border overflow-hidden"
            >
              <div className="aspect-square bg-surface-tertiary flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin size={64} className="text-primary-700 mx-auto mb-4" />
                  <p className="text-text-secondary font-medium">Retrouvez-nous à</p>
                  <p className="text-text-primary font-bold text-lg mt-1">Calavi Bidossessi</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
