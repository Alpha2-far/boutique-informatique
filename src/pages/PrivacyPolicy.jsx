import { Helmet } from 'react-helmet-async'
import { Lock, EyeOff, FileText, CheckCircle, Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité — GQ Store</title>
        <link rel="canonical" href="https://gqstore.com/politique-confidentialite" />
        <meta
          name="description"
          content="Politique de confidentialité et protection des données personnelles chez GQ Store. Vos informations sont protégées et strictement confidentielles."
        />
      </Helmet>

      <div className="bg-surface-secondary py-10 md:py-16">
        <div className="container-main max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Sécurité & Vie Privée
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mt-3 mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-text-muted text-sm md:text-base max-w-2xl mx-auto">
              Chez **GQ Store**, nous considérons la protection de votre vie privée et de vos données personnelles comme une priorité absolue.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-5 rounded-xl border border-border text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h3 className="font-bold text-sm text-text-primary mb-1">Protection Maximale</h3>
              <p className="text-xs text-text-muted">Données chiffrées et accès strictement restreint.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-border text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
                <EyeOff size={20} />
              </div>
              <h3 className="font-bold text-sm text-text-primary mb-1">Zéro Revente</h3>
              <p className="text-xs text-text-muted">Vos coordonnées ne sont jamais cédées ni vendues.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-border text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <h3 className="font-bold text-sm text-text-primary mb-1">Usage Transparent</h3>
              <p className="text-xs text-text-muted">Uniquement pour traiter et livrer votre commande.</p>
            </div>
          </div>

          {/* Detailed Content */}
          <div className="bg-white rounded-2xl border border-border p-6 md:p-10 space-y-8 text-text-secondary leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                1. Responsable du Traitement
              </h2>
              <p className="text-sm">
                Le responsable du traitement des données personnelles collectées sur le site <strong>gqstore.com</strong> est la société <strong>GQ Store</strong>, ayant son siège d'exploitation à Calavi Bidossessi, République du Bénin.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                2. Données Personnelles Collectées
              </h2>
              <p className="text-sm mb-2">
                Nous collectons exclusivement les informations strictement indispensables au bon déroulement de votre achat :
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5">
                <li><strong>Identité :</strong> Nom et prénom du destinataire.</li>
                <li><strong>Contact :</strong> Numéro de téléphone / WhatsApp (pour confirmation et coordination du livreur).</li>
                <li><strong>Logistique :</strong> Adresse ou repère géographique de livraison (quartier, ville).</li>
                <li><strong>Historique d'achat :</strong> Produits commandés, date et montant de la transaction.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                3. Finalités de la Collecte
              </h2>
              <p className="text-sm mb-2">
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1.5">
                <li>L'enregistrement et l'expédition de votre commande informatique.</li>
                <li>La communication par WhatsApp pour valider la disponibilité et l'horaire de passage du coursier.</li>
                <li>L'émission des garanties et le suivi après-vente (SAV).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                4. Partage et Confidentialité
              </h2>
              <p className="text-sm">
                GQ Store applique une politique de confidentialité stricte. Vos coordonnées ne sont en aucun cas vendues, louées, commercialisées ou partagées avec des tiers à des fins publicitaires. Seuls nos coursiers habilités reçoivent les informations requises pour vous remettre votre colis en main propre.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                5. Sécurité et Durée de Conservation
              </h2>
              <p className="text-sm">
                Nous mettons en œuvre les mesures techniques appropriées pour prévenir la perte, le vol ou l'accès non autorisé à vos données. Les informations relatives aux commandes sont conservées pendant la durée nécessaire à la garantie du matériel et aux obligations légales comptables.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                6. Vos Droits
              </h2>
              <p className="text-sm">
                Conformément aux dispositions régissant la protection des données personnelles (Livre V du Code du Numérique du Bénin), vous disposez à tout moment d'un droit d'accès, de rectification et d'effacement de vos données personnelles. Pour exercer ce droit, contactez-nous directement par WhatsApp au <strong>+229 98 47 13 66</strong> ou par appel au <strong>+229 01 08 47 13 66</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                7. Contact
              </h2>
              <div className="bg-surface-tertiary rounded-xl p-4 text-xs md:text-sm space-y-1 text-text-muted">
                <p className="font-semibold text-text-primary">GQ Store — Délégué à la Protection des Données</p>
                <p>📍 Calavi Bidossessi, Bénin</p>
                <p>📞 Téléphone (Appels) : +229 01 08 47 13 66</p>
                <p>💬 WhatsApp : +229 98 47 13 66</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
