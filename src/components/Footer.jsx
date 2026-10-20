import { Link } from 'react-router-dom'
import { ShoppingCart, Phone, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-footer text-gray-300">
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img 
                src="/assets/logo.png" 
                alt="GQ-Store Logo" 
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Votre partenaire de confiance pour le matériel informatique et high-tech de qualité au Bénin.
            </p>
          </div>

          {/* Navigation & Légal */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Informations
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/boutique" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Notre Showroom
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/conditions-generales" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Conditions Générales &amp; Garanties
                </Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Contact &amp; WhatsApp
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <div className="text-sm text-gray-400 space-y-1">
                  <a href="tel:+2290108471366" className="hover:text-white transition-colors block font-medium">
                    +229 01 08 47 13 66 <span className="text-xs text-gray-400 font-normal">(Appels)</span>
                  </a>
                  <a href="https://wa.me/22998471366" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-white block">
                    +229 98 47 13 66 (WhatsApp)
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary-400" />
                <span className="text-sm text-gray-400">Calavi Bidossessi, Bénin</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Horaires d'Ouverture
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
                  <p className="text-sm text-amber-400 font-medium">Fermé (WhatsApp ouvert)</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Liens Découverte IA & SEO Standard */}
      <div className="border-t border-white/5 py-4 bg-black/20">
        <div className="container-main flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
          <span className="text-gray-500 font-mono">SEO &amp; Indexation :</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
            Sitemap XML
          </a>
          <a href="/sitemap.md" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
            Sitemap Markdown
          </a>
          <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
            Flux RSS
          </a>
          <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline">
            llms.txt (IA)
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-main py-5">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} GQ Store. Tous droits réservés. Vente d'ordinateurs portables et matériel informatique au Bénin.
          </p>
        </div>
      </div>
    </footer>
  )
}
