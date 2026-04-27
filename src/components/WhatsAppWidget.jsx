import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(false)
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '22998471366'
  const message = encodeURIComponent('Bonjour ! Je suis intéressé par vos produits.')

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="bg-white shadow-xl rounded-xl px-4 py-3 border border-border max-w-[200px]"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              <X size={10} />
            </button>
            <p className="text-sm font-medium text-text-primary">Besoin d'aide ?</p>
            <p className="text-xs text-text-muted mt-0.5">Contactez-nous sur WhatsApp</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${phoneNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 bg-accent-green rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
        aria-label="Contacter via WhatsApp"
      >
        <MessageCircle size={26} className="text-white" fill="white" />
      </motion.a>
    </div>
  )
}
