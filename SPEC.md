# SPEC.md

## AVANT DE COMMENCER — PROTOCOLE DE VISIONNAGE

Type de site            : Site E-commerce (matériel informatique & high-tech)
Nombre de sections      : 4 (Hero, Section Produits, Bannière Promo, Footer) sur la page d'accueil
Nombre de pages         : 2 pages distinctes (Accueil, Page Produit)
Animations détectées    : oui — carrousel hero automatique, apparition bouton au hover, carrousel promo
Interactions visibles   : hover states sur cards produits (bouton "Ajouter"), clics de navigation
Responsive montré       : non — uniquement version desktop visible
Durée de la vidéo       : 20 secondes
Qualité / résolution    : bonne (texte et UI parfaitement lisibles)
Parties floues ou rapides à noter : Le défilement est un peu rapide lors du retour à l'accueil depuis la page produit (0:13-0:15).

---

## 0. PREMIERE IMPRESSION

Type de site / page     : Plateforme E-commerce multi-pages classique et fonctionnelle.
Mood visuel dominant    : Clean, "Tech", informatif avec un fort contraste entre les espaces blancs et les boutons d'action bleu foncé.
La décision de design qui définit tout le site : La densité de l'information (tags "Neuf/Occasion", étoiles, prix en FCFA, caractéristiques clés) organisée dans une grille très structurée avec un accent bleu institutionnel pour rassurer l'acheteur.

---

## 1. LAYOUT GENERAL

Largeur max container   : 1280px ou 1440px (estimé, standard E-commerce container)
Colonnes visibles       : Grille de 4 à 5 colonnes pour les produits
Système dominant        : [X] Grid  [X] Flexbox
Fond global             : #FFFFFF (Blanc)
Sections identifiées    :

  1. Navbar (Top Bar + Main Navigation + Categories Bar)
  2. Hero Section (Carrousel)
  3. Nos Produits (Filtres + Grille)
  4. Bannière Promotionnelle
  5. Grille Produits Secondaire
  6. Footer
Espacement entre sections : 40px à 60px estimé

---

## 2. NAVBAR

Hauteur                 : ~110px au total (divisée en 2 rangées principales)
Position                : [ ] sticky  [ ] fixed  [X] static (disparaît au scroll down vers le footer)
Fond initial            : #FFFFFF (Blanc) avec légères bordures de séparation grises (#E5E7EB)
Fond au scroll          : Identique (static)
Logo                    : Position haut-gauche / Type textuel avec icône chariot intégrée ("iTech-Store") / Taille ~120x30px
Navigation items        :

- Top header : Barre de recherche centrale proéminente (avec icône loupe), "Notre Boutique", "Contact", Icône User, Icône Coeur (Favoris), Icône Panier.
- Bottom header : Liste de catégories en ligne (Casque audio, Écrans, Enceintes, etc.).
CTA bouton navbar       : Pas de bouton "plein", uniquement des icônes fonctionnelles avec texte discret.
Comportement scroll     : Disparaît simplement au scroll.
Hamburger mobile        : [non visible dans la vidéo]
Animation d'ouverture menu mobile : [non visible dans la vidéo]

---

## 3. HERO SECTION

Hauteur                 : ~450px - 500px
Layout                  : Carrousel pleine largeur du container. Split 50/50 interne : texte à gauche, visuel du produit à droite.
Background              : Change selon la slide. Slide 1 : Fond sombre texturé. Slide 2 : Fond gris clair/bleuté.
Dégradé si présent      : Dégradés radiaux subtils en fond d'image selon le visuel.

ANIMATION D'ENTREE [AVANTAGE VIDEO]
  Ordre d'apparition    : Affichage statique au load visible. Le carrousel slide automatiquement.
  Type par élément      : Translation horizontale globale pour la transition de slide.
  Durées                : ~500ms pour la transition
  Stagger               : 0ms (slide entier)

TEXTE PRINCIPAL H1
  Contenu ou description: ex: "Un son qui change tout." / "Le futur dans votre poche."
  Taille estimée        : 48px
  Poids                 : Extra-Bold (800) ou Bold (700)
  Couleur               : #FFFFFF sur slide sombre, #111827 (Dark) sur slide claire.
  Letter-spacing        : Normal à légèrement tight (-0.02em)

SOUS-TITRE
  Taille                : 16px - 18px
  Poids                 : Regular (400)
  Couleur / opacité     : Gris clair sur slide sombre, Gris moyen (#4B5563) sur slide claire.

BOUTONS CTA
  Primaire              : Texte "Explorer l'Audio" ou "Voir les Smartphones" / Fond transparent avec bordure (Slide 1) ou Fond noir (Slide 2) / text blanc / radius 4px ou 8px / padding ~12px 24px / ombre légère.
  Hover state [VIDEO]   : [non interagi dans la vidéo sur cette section]
  Secondaire            : [aucun]

MEDIA
  Type                  : Photographie produit détourée de haute qualité (casque audio, smartphone).
  Position              : Droite, prenant presque 50% de l'espace.
  Animation [VIDEO]     : Statique au sein de la slide.
  Effet                 : Légère ombre portée du produit intégrée à l'image.

ELEMENTS DECORATIFS HERO
  Formes géométriques   : Badge bleu "Audio Premium" ou "Smartphones" au-dessus du H1.
  Particules / blobs    : [non visible]
  Animations continues  : Les "dots" (points de navigation) en bas du carrousel s'animent ou changent de couleur (bleu actif, gris inactif) à chaque changement de slide.

---

## 4. SECTIONS SECONDAIRES

SECTION : Nos Produits (Accueil)
  Background            : #FFFFFF
  Animation d'entrée [VIDEO] : Aucune (statique au scroll).
  Layout interne        : En-tête avec titre gauche et filtres en ligne (Toutes..., Tous états, Plus récents) avec un count "108 produits" à droite. Suivi d'une grille 4 ou 5 colonnes.
  Titre                 : 24px / Bold / Noir (#111827) / Alignement gauche, précédé d'une icône losange.
  Badge au-dessus       : Badges SUR les cartes produits ("Neuf" en fond bleu foncé, "Occasion" en fond violet).
  Nombre de cards/items : Grille dense, plusieurs dizaines visibles au scroll.
  Card style            : Fond #FFFFFF / border très légère 1px solide / radius ~8px / pas d'ombre forte au repos. Structure : Badge statut en top-left -> Image produit -> Titre (uppercase) -> Spécifications techniques grises -> Étoiles/Reviews -> Prix (ex: 560 000 FCFA).
  Hover card [VIDEO]    : Un bouton primaire "Ajouter" apparaît en bas à droite de l'image du produit. Le curseur passe en pointer. Pas de scale majeur de la carte détecté.
  Icônes                : Étoiles jaunes pour les avis.
  Gap entre items       : ~20px - 24px
  CTA de section        : [aucun global, bouton "Voir plus" potentiel en bas de grille non atteint]
  Particularité         : Intégration d'icônes miniatures pour les caractéristiques rapides (CPU, RAM, GPU) sous le titre du produit dans la carte.

SECTION : Bannière Promotionnelle
  Background            : Image d'arrière-plan avec overlay gris/noir.
  Animation d'entrée [VIDEO] : Slide horizontale (c'est un carrousel).
  Layout interne        : Texte promotionnel en overlay à gauche ("Réduction de 5 à 10%").
  Titre                 : 40px / Bold / #FFFFFF / Alignement gauche.
  Badge au-dessus       : Texte intro "PROMO SUR ACHAT..."
  Nombre de cards/items : 1 visuel plein écran (carrousel).
  Card style            : [non applicable]
  Hover card [VIDEO]    : [non applicable]
  Icônes                : [non applicable]
  Gap entre items       : [non applicable]
  CTA de section        : Bouton "Découvrir" (fond transparent, bordure blanche).
  Particularité         : Pagination avec des dots (points) en bas pour indiquer un slider.

---

## 5. FOOTER

Background              : #0F172A (Bleu marin très foncé / presque noir)
Colonnes                : 4 colonnes.
Contenu                 :
  Col 1 : Logo "iTech-Store" blanc + texte descriptif court gris.
  Col 2 : "NAVIGATION" (Accueil, Notre Boutique, Contact).
  Col 3 : "CONTACT" (Téléphone, Email, 2 adresses physiques Boutique 1 & 2).
  Col 4 : "HORAIRES" (Lundi à Samedi : 09H30 - 20H30, Dimanche : Fermé).
Séparateur              : Ligne subtile (border-top rgba(255,255,255,0.1)) juste au-dessus du copyright.
Taille texte liens      : 14px, couleur gris clair text-gray-400. Titres colonnes en 16px Bold Blanc.
Copyright               : "© 2024 iTech-Store. Tous droits réservés." centré en bas.

---

## 6. TYPOGRAPHIE GLOBALE

Font principale         : Sans-serif propre et lisible, style Inter, Roboto ou similaire.
Font secondaire         : Même famille (système typographique unifié).
Monospace si présente   : [non visible]

Echelle typographique :
  H1  : ~48px, weight 700/800 (Hero)
  H2  : ~24px-28px, weight 700 (Titres sections "Nos Produits")
  H3  : ~16px-18px, weight 600 (Titres produits dans les cartes, souvent en uppercase)
  Body: 14px, weight 400, line-height 1.5
  Small: 12px (Spécifications sous les titres produits)

Caractéristiques :
  [ ] Letter-spacing large sur headings
  [ ] Italique comme accent
  [X] Uppercase sur certains éléments (Titres des produits dans la grille : ex "LENOVO IDEAPAD...", labels des filtres)
  [ ] Texte en dégradé
  [X] Mélange de weights dans la même ligne (Prix en bold avec "FCFA" régulier/bold)
  [ ] Texte animé (typewriter / word rotation) [VIDEO]

---

## 7. PALETTE DE COULEURS

Fond principal          : #FFFFFF (Blanc)
Fond secondaire         : #F9FAFB ou #F3F4F6 (Gris très clair pour le fond de la page produit et filtres)
Accent primaire         : #1E3A8A ou #1D4ED8 (Bleu institutionnel foncé) → utilisé sur : Boutons "Ajouter", "Ajouter au panier", icônes actives.
Accent secondaire       : #8B5CF6 (Violet) → utilisé sur : Badge "Occasion" ; #2563EB (Bleu vif) → utilisé sur : Badge "Neuf".
Texte principal         : #111827 (Gris très foncé / Noir)
Texte atténué           : #6B7280 (Gris moyen pour descriptions et specs)
Bordures                : #E5E7EB (Gris clair)
Surface cards           : #FFFFFF (Blanc) avec cartes de specs en #F3F4F6 sur la page produit.

Dégradés identifiés :
  [Aucun dégradé UI majeur, uniquement dans les visuels/photos]

Tons : [ ] Dark  [X] Light  [ ] Mid-tone
Température : [ ] Chaud  [X] Froid (Dominance de bleu et blanc)  [ ] Neutre

---

## 8. ESPACEMENTS ET RYTHME

Padding horizontal container : ~32px (ou md:px-8)
Padding vertical sections    : ~48px top / ~48px bottom
Gap grids                    : ~20px horizontal et vertical
Marge heading → body         : ~16px
Marge body → boutons         : ~24px
Rythme : [X] Dense  [ ] Aéré  [ ] Très généreux

---

## 9. ANIMATIONS COMPLETES [SECTION ETENDUE — AVANTAGE VIDEO]

LOAD ANIMATIONS
  Séquence complète     : Transition directe (chargement SSR/SSG quasi instantané au clic sur un produit à 0:05). Pas d'animations complexes d'entrée.
  Durée totale séquence : <100ms
  Type global           : Instané.

SCROLL ANIMATIONS
  Sections concernées   : [Aucune animation d'entrée au scroll détectée, les éléments sont déjà dans le DOM statiquement]
  Type                  : Statique.
  Threshold déclencheur : N/A
  Once ou répété        : N/A

HOVER STATES (observés dans la vidéo)
  Boutons primaires     : Le fond bleu semble très légèrement foncer (opacity ou darken color), curseur pointer.
  Boutons secondaires   : [non interagi]
  Cards                 : Sur la grille d'accueil, le hover fait apparaître (fade-in) le bouton bleu "Ajouter" superposé en bas à droite de l'image.
  Liens nav             : [non interagi]
  Images                : Pas de scale détecté.

ANIMATIONS CONTINUES (loops)
  Background            : [non visible]
  Elements flottants    : [non visible]
  Particules            : [non visible]
  Gradient animé        : [non visible]
  Carrousels            : Défilement automatique du Hero banner et du Promo banner toutes les ~5 secondes.

TRANSITIONS DE NAVIGATION
  Entre pages           : Aucune (hard reload ou transition instantanée type SPA).
  Durée                 : 0ms

MICRO-INTERACTIONS
  Curseur custom        : non
  Scroll indicator      : non
  Loading state         : non (chargement très rapide)
  Autre                 : Bouton WhatsApp fixe vert clair en bas à droite de l'écran avec une infobulle "Besoin d'aide ?".

---

## 10. COMPORTEMENT MOBILE

Montré dans la vidéo    : [ ] Oui  [X] Non — si non, estimer

Navbar mobile           : Menu hamburger à gauche ou à droite, barre de recherche passant en pleine largeur en dessous.
Animation menu mobile   : Slide-in depuis le côté (estimé).
Hero mobile             : Stack vertical (Texte au-dessus, image en dessous) ou image de fond assombrie avec texte par-dessus.
Grids                   : 4-5 colonnes → 1 ou 2 colonnes (2 colonnes probable vu la structure compacte des cards).
Font sizes mobile       : H1 48px → 32px / H2 24px → 20px
Padding horizontal      : 16px
Eléments masqués        : Les caractéristiques complexes dans les cards produits d'accueil pourraient être masquées sur mobile pour gagner de la place.
Touch interactions      : Swipe pour le carrousel hero et swipe horizontal pour la rangée des catégories.

---

## 11. ELEMENTS DECORATIFS ET DETAILS

Formes géométriques     : Boutons avec border-radius de ~8px (medium).
Lignes / grilles        : Séparateurs gris très fins (1px solid #E5E7EB) très utilisés pour délimiter navbar, tabs, footer.
Textures                : Clean, aucune texture sur l'UI (hors images).
Badges / pills style    : Petits, rectangulaires avec coins légèrement arrondis, texte bold blanc sur fond couleur (Bleu/Violet).
Bibliothèque icônes     : Style line-art (Heroicons ou Lucide), stroke-width 1.5px.
Effets de lumière       : Aucun, design "flat" à dominante blanche.
Séparateurs de section  : Droits, marges pures.
Scrollbar custom        : Non visible (standard OS).

---

## 12. SYNTHESE POUR RECONSTRUCTION

DECISIONS CRITIQUES (5-10 bullets) :
• Maintenir une densité de grille élevée (jusqu'à 5 items par ligne sur les grands écrans).
• Utiliser une typographie Uppercase pour les titres de produits dans les cards pour un aspect catalogue "hardware".
• Implémenter les badges de statut conditionnels (Neuf = Bleu, Occasion = Violet) superposés en absolute sur les images des cards.
• Garder le design extrêmement clair : fond blanc majoritaire, bordures grises ultra-fines (#E5E7EB) plutôt que de l'ombre portée massive (shadow).
• Utiliser un accent bleu profond pour toutes les actions d'achat (Bouton "Ajouter", "Ajouter au panier").
• Structurer la page produit avec une grille de "Caractéristiques techniques" (icône + libellé + valeur) bien encadrée dans des cases à fond gris très clair.

ANIMATIONS A IMPLÉMENTER EN PRIORITÉ :
• Le hover sur la carte produit révélant le bouton "Ajouter" en absolu sur l'image.
• L'auto-slide fluide des carrousels Hero et Promo avec pagination synchronisée.

PIÈGES A ÉVITER :
• Faire des cartes produits trop hautes : utiliser des text-ellipsis pour les titres trop longs et garder une image contrainte (aspect ratio fixe).
• Surcharger la navbar au détriment de la barre de recherche, qui doit rester l'élément central du header.

ORDRE DE CONSTRUCTION RECOMMANDÉ :

1. Design tokens (Couleurs #1D4ED8 primaire, gris pour les bordures, typo sans-serif).
2. Layout Shell partagé (Top Navbar complexe à 2 étages + Mega-Footer sombre).
3. Carte Produit UI partagée (avec son état hover spécifique).
4. Page d'Accueil (Carrousels, Filtres, Grilles de cartes).
5. Page Produit Détail (Grilles de spécifications, mise en page asymétrique Image / Infos).

PROMPT DE RECONSTRUCTION :
"Recrée une interface E-commerce de matériel informatique multi-pages (Accueil + Détail Produit). Design très clean et dense avec fond blanc, bordures grises ultra-fines et un bleu institutionnel (#1D4ED8) pour les boutons CTA d'achat. Inclure une navbar complète avec barre de recherche proéminente et une ligne de sous-catégories.
Page 1 : Carrousel Hero, une section grille produits 4 ou 5 colonnes filtrable, des badges 'Neuf/Occasion' et un bouton 'Ajouter' qui apparaît au survol de l'image.
Page 2 : Détail produit avec image à gauche, bloc de prix/stock à droite et une grille 2x3 pour les caractéristiques techniques (avec icônes).
Stack : React + Vite + Tailwind + Framer Motion (pour les carrousels)."

---

## 13. MULTI-PAGES (si applicable)

Pages détectées dans la vidéo :
  Page 1 : Accueil (index) — rôle : Présenter les promotions (Carrousels) et pousser la découverte via des grilles larges de produits récents.
  Page 2 : Détail Produit — rôle : Afficher l'image HD, le prix, le stock, et les caractéristiques techniques détaillées (RAM, CPU, GPU, Ecran) dans un tableau stylisé pour inciter à l'ajout au panier.

Transitions entre pages [VIDEO] : Instantanée / Cut. Pas d'animation de routing.
Eléments partagés : Navbar complexe (top header + categories line) / Widget flottant WhatsApp / Footer.
Ce qui change par page : Disparition de la hiérarchie de l'accueil au profit d'un fil d'Ariane sur la page produit. Le layout passe d'une grille de découverte (columns) à un layout concentré 2 colonnes asymétriques pour lire les spécificités de la machine. Utilisation de fonds gris clairs (#F3F4F6) pour les specs techniques sur la page produit, contrastant avec le fond blanc des cards de l'accueil.
