import { Link } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-footer text-gray-300">
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                GCO<span className="text-primary-400">-Store</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre partenaire de confiance pour le matériel informatique et high-tech de qualité au Bénin.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Notre Boutique
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <span className="text-sm text-gray-400">+229 98 47 13 66</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <span className="text-sm text-gray-400">contact@gco-store.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <span className="text-sm text-gray-400">Cotonou, Bénin</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Horaires
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <Clock size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <div>
                  <p className="text-sm text-gray-400">Lundi – Samedi</p>
                  <p className="text-sm text-white font-medium">09H30 – 20H30</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 ml-6">
                <div>
                  <p className="text-sm text-gray-400">Dimanche</p>
                  <p className="text-sm text-red-400 font-medium">Fermé</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-main py-5">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} GCO-Store. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
