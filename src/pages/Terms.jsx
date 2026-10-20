import { Helmet } from 'react-helmet-async'
import { ShieldCheck, Truck, CreditCard, RotateCcw, Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Conditions Générales de Vente & Garanties — GQ Store</title>
        <link rel="canonical" href="https://gqstore.com/conditions-generales" />
        <meta
          name="description"
          content="Consultez les Conditions Générales de Vente (CGV) de GQ Store : garanties PC Neufs et Venues propres, livraison au Bénin, paiement à la livraison et retours."
        />
      </Helmet>

      <div className="bg-surface-secondary py-10 md:py-16">
        <div className="container-main max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Transparence & Confiance
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-3 mb-4">
              Conditions Générales de Vente (CGV)
            </h1>
            <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto">
              Bienvenue sur **GQ Store** (gqstore.com). Les présentes conditions régissent vos achats de matériel informatique et ordinateurs portables auprès de notre boutique physique et en ligne.
            </p>
          </div>

          {/* Quick Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-4 rounded-xl border border-border flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-primary-50 text-primary-700 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-text-primary">Garantie Certifiée</p>
                <p className="text-[11px] text-text-muted mt-0.5">Matériel testé & garanti de 1 à 12 mois</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-text-primary">Livraison 24H</p>
                <p className="text-[11px] text-text-muted mt-0.5">Cotonou, Calavi & tout le Bénin</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-text-primary">Paiement Réception</p>
                <p className="text-[11px] text-text-muted mt-0.5">Cash ou Mobile Money après vérification</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="font-bold text-xs text-text-primary">SAV Réactif</p>
                <p className="text-[11px] text-text-muted mt-0.5">Échange sous 48h à 7 jours</p>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="bg-white rounded-2xl border border-border p-6 md:p-10 space-y-8 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">1</span>
                Présentation de l'Établissement
              </h2>
              <p className="text-sm">
                <strong>GQ Store</strong> est une enseigne commerciale spécialisée dans la vente de matériel informatique, ordinateurs portables, accessoires et périphériques high-tech, située à <strong>Calavi Bidossessi</strong>, République du Bénin. Téléphone (Appels) : <strong>+229 01 08 47 13 66</strong> — WhatsApp : <strong>+229 98 47 13 66</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">2</span>
                Produits, État & Garanties
              </h2>
              <p className="text-sm mb-3">
                GQ Store s'engage à fournir des descriptions techniques fidèles à la réalité des produits :
              </p>
              <ul className="list-disc pl-5 text-sm space-y-2">
                <li>
                  <strong>Matériel Neuf :</strong> Produits sous emballage d'origine scellé avec accessoires d'origine, bénéficiant d'une garantie constructeur de 6 à 12 mois.
                </li>
                <li>
                  <strong>Matériel "Venue Propre" & Reconditionné :</strong> Ordinateurs d'importation rigoureusement diagnostiqués (état batterie, mémoire RAM, disque SSD, carte graphique, écran, clavier). Ces machines bénéficient d'une <strong>garantie de fonctionnement de 1 à 3 mois</strong> assurée par notre atelier technique.
                </li>
                <li>
                  La garantie ne couvre pas les dommages causés par une chute accidentelle, l'oxydation liquide, une surtension électrique domestique ou une mauvaise manipulation du système par l'utilisateur.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">3</span>
                Prix & Devises
              </h2>
              <p className="text-sm">
                Tous les prix affichés sur le site sont exprimés en <strong>Francs CFA (XOF / FCFA)</strong>, nets et sans frais cachés. Les prix affichés sont fermes lors de la validation de la commande.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">4</span>
                Processus de Commande & Confirmation
              </h2>
              <p className="text-sm">
                Le client peut ajouter ses articles au panier ou cliquer directement sur <em>"Commander sur WhatsApp"</em>. Un conseiller commercial GQ Store prend immédiatement contact avec le client pour confirmer l'adresse de livraison, les détails de facturation et l'horaire de passage du coursier.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">5</span>
                Modalités de Livraison au Bénin
              </h2>
              <p className="text-sm mb-2">
                GQ Store assure la distribution sur l'ensemble du territoire national :
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5">
                <li><strong>Abomey-Calavi et Cotonou :</strong> Livraison à domicile ou au bureau sous 24h ouvrées.</li>
                <li><strong>Villes régionales (Porto-Novo, Parakou, Bohicon, Natitingou, etc.) :</strong> Expédition express sécurisée via les compagnies de bus et colis agréées.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">6</span>
                Modes de Paiement Sécurisés
              </h2>
              <p className="text-sm mb-2">
                Pour assurer la sécurité et la sérénité totale de l'acheteur :
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5">
                <li><strong>Paiement à la livraison :</strong> Règlement en espèces après avoir examiné et allumé le matériel.</li>
                <li><strong>Mobile Money :</strong> Transfert direct sécurisé via MTN Mobile Money ou Moov Money.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">7</span>
                Politique de Retour & Échange (SAV)
              </h2>
              <p className="text-sm">
                En cas de dysfonctionnement technique avéré dans les <strong>7 jours suivant la réception</strong>, le client dispose d'un droit d'échange pour un modèle identique ou équivalent, sous réserve que l'appareil soit restitué dans son état initial avec tous ses accessoires fournis.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs flex items-center justify-center font-bold">8</span>
                Contact & Showroom
              </h2>
              <div className="bg-surface-tertiary rounded-xl p-4 text-xs md:text-sm space-y-1 text-text-muted">
                <p className="font-semibold text-text-primary">GQ Store — Showroom Calavi</p>
                <p>📍 Adresse : Calavi Bidossessi, Bénin</p>
                <p>📞 Appels directs : +229 01 08 47 13 66</p>
                <p>💬 WhatsApp : +229 98 47 13 66</p>
                <p>🕒 Horaires : Du lundi au samedi de 09H30 à 20H30</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
