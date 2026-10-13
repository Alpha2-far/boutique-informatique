/**
 * Analyseur intelligent de fiches produits WhatsApp et textes bruts (GQ Store)
 */

// Nettoie les emojis courants et caractères spéciaux sans casser les tirets dans les noms
export function cleanLine(line) {
  return line
    .replace(/^[•\-–—]\s*/, '') // Supprime les puces au début de ligne
    .replace(/[💻✅⚡🔋💾🖥️🔹🔸📌👉⭐️⭐📦🏷️✨✔︎✔️]/gu, '')
    .replace(/\*/g, ' ') // Remplace les étoiles WhatsApp par un espace pour éviter "15.6”Tactile"
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Détecte l'état du produit à partir du texte
 */
export function detectEtat(text) {
  const lower = text.toLowerCase();
  if (lower.includes('neuf') && !lower.includes('comme neuf')) {
    return 'neuf';
  }
  if (
    lower.includes('venu propre') ||
    lower.includes('venue propre') ||
    lower.includes('10/10') ||
    lower.includes('9.5/10') ||
    lower.includes('sans égratignure') ||
    lower.includes('sans egratignure') ||
    lower.includes('comme neuf')
  ) {
    return 'venue_propre';
  }
  if (lower.includes('occasion')) {
    return 'occasion';
  }
  if (lower.includes('reconditionn')) {
    return 'reconditionné';
  }
  if (lower.includes('pour pièce') || lower.includes('pour piece')) {
    return 'pour_pieces';
  }
  return 'venue_propre';
}

/**
 * Détecte une catégorie existante parmi le référentiel officiel
 * Ne crée JAMAIS de nouvelle catégorie sauvage
 */
export function detectCategory(text, categories = []) {
  if (!categories || categories.length === 0) return '';
  const lower = text.toLowerCase();

  const findCat = (keyword) => {
    return categories.find(c => (c.nom || '').toLowerCase().includes(keyword))?.id;
  };

  // 1. PC Portables
  if (
    lower.includes('laptop') ||
    lower.includes('portable') ||
    lower.includes('notebook') ||
    lower.includes('thinkpad') ||
    lower.includes('elitebook') ||
    lower.includes('latitude') ||
    lower.includes('macbook') ||
    lower.includes('probook') ||
    lower.includes('inspiron') ||
    lower.includes('zenbook') ||
    lower.includes('yoga')
  ) {
    const id = findCat('portable');
    if (id) return id;
  }

  // 2. PC Bureaux & Fixes
  if (
    lower.includes('desktop') ||
    lower.includes('tour') ||
    lower.includes('unité centrale') ||
    lower.includes('unite centrale') ||
    lower.includes('all-in-one') ||
    lower.includes('all in one') ||
    lower.includes('imac') ||
    lower.includes('optiplex') ||
    lower.includes('elitedesk')
  ) {
    const id = findCat('bureau');
    if (id) return id;
  }

  // 3. Écrans & Moniteurs
  if (
    (lower.includes('écran') || lower.includes('ecran') || lower.includes('moniteur')) &&
    !lower.includes('laptop') && !lower.includes('portable')
  ) {
    const id = findCat('écran') || findCat('ecran') || findCat('moniteur');
    if (id) return id;
  }

  // 4. Accessoires & Périphériques
  if (
    lower.includes('souris') ||
    lower.includes('clavier') ||
    lower.includes('chargeur') ||
    lower.includes('casque') ||
    lower.includes('pochette') ||
    lower.includes('sacoche') ||
    lower.includes('adaptateur')
  ) {
    const id = findCat('accessoire');
    if (id) return id;
  }

  // 5. Stockage & Composants
  if (
    lower.includes('disque dur') ||
    (lower.includes('ssd') && !lower.includes('laptop') && !lower.includes('portable')) ||
    lower.includes('barrette') ||
    lower.includes('carte graphique')
  ) {
    const id = findCat('stockage') || findCat('composant');
    if (id) return id;
  }

  // 6. Smartphones & Tablettes
  if (
    lower.includes('smartphone') ||
    lower.includes('iphone') ||
    lower.includes('ipad') ||
    lower.includes('tablette') ||
    lower.includes('samsung galaxy')
  ) {
    const id = findCat('smartphone') || findCat('tablette');
    if (id) return id;
  }

  // Par défaut, sélectionner la première catégorie (ex: PC Portables)
  return categories[0]?.id || '';
}

/**
 * Détecte un prix en FCFA
 */
export function detectPrix(text) {
  // Recherche des motifs comme "250.000 FCFA", "250 000 F", "250000 CFA", "Prix : 250000"
  const regexes = [
    /(?:prix|tarif|coût)\s*[:=]?\s*([0-9\s.,]+)\s*(?:fcfa|cfa|f\b)?/i,
    /([0-9]{2,3}[\s.][0-9]{3})\s*(?:fcfa|cfa|f\b)/i,
    /([0-9]{5,7})\s*(?:fcfa|cfa|f\b)/i,
  ];

  for (const rx of regexes) {
    const m = text.match(rx);
    if (m && m[1]) {
      const cleanNum = m[1].replace(/[\s.,]/g, '');
      const parsed = parseInt(cleanNum, 10);
      if (parsed > 1000) return parsed;
    }
  }

  return '';
}

/**
 * Détermine l'icône correspondante à une spécification
 */
export function getSpecIcon(libelle) {
  const l = (libelle || '').toLowerCase();
  if (l.includes('processeur') || l.includes('cpu')) return 'Cpu';
  if (l.includes('ram') || l.includes('mémoire') || l.includes('memoire')) return 'Zap';
  if (l.includes('stockage') || l.includes('ssd') || l.includes('disque') || l.includes('hdd') || l.includes('rom')) return 'HardDrive';
  if (l.includes('écran') || l.includes('ecran') || l.includes('dalle') || l.includes('display')) return 'Monitor';
  if (l.includes('autonomie') || l.includes('batterie')) return 'Battery';
  if (l.includes('port') || l.includes('hdmi') || l.includes('usb') || l.includes('type-c') || l.includes('connectique')) return 'Cable';
  if (l.includes('clavier') || l.includes('format') || l.includes('pavé')) return 'Keyboard';
  if (l.includes('graphique') || l.includes('gpu') || l.includes('carte')) return 'Layers';
  return 'Check';
}

/**
 * Fonction principale : Parse le texte brut WhatsApp et renvoie un objet prêt pour le formulaire
 */
export function parseRawProductText(rawText, availableCategories = []) {
  if (!rawText || !rawText.trim()) return null;

  const rawLines = rawText.split('\n');
  const lines = rawLines.map(l => cleanLine(l)).filter(Boolean);

  if (lines.length === 0) return null;

  let nom = '';
  let prix = detectPrix(rawText);
  let etat = detectEtat(rawText);
  let categorie_id = detectCategory(rawText, availableCategories);
  const specs = [];
  const descriptionParts = [];

  // 1. Détection du Nom (Première ligne pertinente)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore si la ligne contient juste un mot clé générique
    if (line.toLowerCase().startsWith('prix') || line.toLowerCase().startsWith('état')) continue;
    nom = line;
    break;
  }

  // 2. Traitement des lignes de spécifications
  for (const line of lines) {
    // Si c'est la ligne du nom, on la saute
    if (line === nom) continue;

    // Détection d'état explicite
    if (line.toLowerCase().startsWith('état') || line.toLowerCase().startsWith('etat')) {
      descriptionParts.push(line);
      continue;
    }

    // Détection du prix explicite
    if (line.toLowerCase().startsWith('prix')) {
      continue;
    }

    // Séparation Clé : Valeur
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      let libelle = line.substring(0, colonIdx).trim();
      let valeur = line.substring(colonIdx + 1).trim();

      // Normalisation des libellés courants
      if (/processeur|cpu/i.test(libelle)) libelle = 'Processeur';
      else if (/mémoire|ram/i.test(libelle)) libelle = 'RAM';
      else if (/stockage|disque|ssd/i.test(libelle)) libelle = 'Stockage';
      else if (/écran|ecran/i.test(libelle)) libelle = 'Écran';
      else if (/autonomie|batterie/i.test(libelle)) libelle = 'Autonomie';

      if (libelle && valeur) {
        specs.push({
          icone: getSpecIcon(libelle),
          libelle,
          valeur,
        });
        continue;
      }
    }

    // Lignes sans ":" mais qui sont des spécifications évidentes
    if (/^[0-9]+\s*port\b/i.test(line) || /port\s+hdmi|port\s+usb|type-c/i.test(line)) {
      specs.push({
        icone: 'Cable',
        libelle: 'Connectique',
        valeur: line,
      });
      continue;
    }

    if (/pavé numérique|clavier rétroéclairé|clavier azerty|clavier qwerty/i.test(line)) {
      specs.push({
        icone: 'Keyboard',
        libelle: 'Clavier',
        valeur: line,
      });
      continue;
    }
  }

  // Création d'une vraie description commerciale et fluide pour la boutique
  function buildSmartDescription(pNom, pRawText, pSpecs, pEtat) {
    const parts = [];
    const cpu = pSpecs.find(s => s.libelle === 'Processeur')?.valeur;
    const rawRam = pSpecs.find(s => s.libelle === 'RAM')?.valeur;
    const rawStorage = pSpecs.find(s => s.libelle === 'Stockage')?.valeur;
    const screen = pSpecs.find(s => s.libelle === 'Écran')?.valeur;
    const battery = pSpecs.find(s => s.libelle === 'Autonomie')?.valeur;
    const format = pSpecs.find(s => s.libelle === 'Format' || s.libelle === 'Clavier')?.valeur;

    const ramText = rawRam ? rawRam.replace(/^RAM\s*/i, '').trim() + ' de RAM' : '';
    const storageText = rawStorage ? (rawStorage.toLowerCase().startsWith('ssd') ? 'un stockage ' + rawStorage : rawStorage) : '';

    let intro = `Le ${pNom} est un ordinateur portable moderne, fluide et performant.`;
    if (screen) {
      intro += ` Équipé d'un écran ${screen},`;
    }
    if (cpu) {
      intro += ` il est propulsé par un processeur ${cpu}`;
    }
    if (ramText && storageText) {
      intro += ` combiné à ${ramText} et ${storageText} ultra-rapide.`;
    } else if (storageText) {
      intro += ` avec ${storageText}.`;
    } else {
      intro += '.';
    }
    parts.push(intro);

    const lower = pRawText.toLowerCase();
    if (lower.includes('venu propre') || lower.includes('10/10') || lower.includes('sans égratignure') || lower.includes('sans egratignure')) {
      parts.push("Appareil venu propre (état 10/10 sans aucune égratignure), soigneusement testé et garanti fonctionnel.");
    } else if (pEtat === 'neuf') {
      parts.push("Produit neuf sous emballage d'origine garanti.");
    }

    const extras = [];
    if (format) extras.push(`clavier avec ${format.toLowerCase()}`);
    if (battery) extras.push(`excellente autonomie de batterie`);
    if (extras.length > 0) {
      parts.push(`Profitez d'un confort d'utilisation optimal avec ${extras.join(' et ')}.`);
    }

    parts.push("Idéal pour le travail bureautique intensif, les études, la gestion et le divertissement multimédia. Disponible chez GQ Store.");

    return parts.join(' ');
  }

  const description = buildSmartDescription(nom, rawText, specs, etat);

  return {
    nom,
    prix,
    etat,
    categorie_id,
    description,
    specs,
  };
}
