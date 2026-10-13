import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const APPS_SCRIPT_URL = process.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbzquOsnzDkC8hP-EL2ARuuIPgjADUvByaji4mNcAYCFrvt9bUVkQ6n6vyUHUGRLZfni3A/exec';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

async function apiPost(action, payload) {
  const body = JSON.stringify({ action, ...payload });
  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    redirect: 'follow',
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Réponse non JSON de Google Apps Script: ' + text);
  }
}

async function apiGet(action, params = {}) {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('action', action);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    redirect: 'follow',
  });
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Réponse non JSON de Google Apps Script: ' + text);
  }
}

// Téléversement d'une image locale vers Google Drive
async function uploadImageToDrive(relativeOrAbsolutePath) {
  const fullPath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.join(ROOT_DIR, 'import-produits', relativeOrAbsolutePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠️ Fichier image introuvable : ${fullPath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const base64 = fileBuffer.toString('base64');
  const fileName = path.basename(fullPath);
  const mimeType = getMimeType(fullPath);

  console.log(`  📤 Upload Drive de : ${fileName} (${(fileBuffer.length / 1024).toFixed(1)} Ko)...`);
  const res = await apiPost('upload_image', { fileName, mimeType, base64 });
  if (!res.success) {
    console.error(`  ❌ Échec upload Drive : ${res.error}`);
    return null;
  }

  console.log(`  ✅ Image hébergée avec succès sur Google Drive !`);
  return {
    url: res.url,
    public_id: res.public_id,
  };
}

// Parser simple pour le fichier articles.md
function parseArticlesMd(content) {
  const rawBlocks = content.split(/^---$/m).map(b => b.trim()).filter(Boolean);
  const articles = [];

  for (const block of rawBlocks) {
    if (block.startsWith('#')) continue; // Ignore header comments

    const lines = block.split('\n');
    const article = {
      nom: '',
      categorie: '',
      prix: 0,
      etat: 'reconditionne',
      en_vedette: false,
      photos: [],
      description: '',
      specs: {},
    };

    let currentSection = null;
    let descriptionLines = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('nom:')) {
        article.nom = trimmed.replace('nom:', '').trim();
        currentSection = null;
      } else if (trimmed.startsWith('categorie:') || trimmed.startsWith('catégorie:')) {
        article.categorie = trimmed.replace(/cat[ée]gorie:/, '').trim();
        currentSection = null;
      } else if (trimmed.startsWith('prix:')) {
        const val = trimmed.replace('prix:', '').replace(/[^\d]/g, '').trim();
        article.prix = parseInt(val, 10) || 0;
        currentSection = null;
      } else if (trimmed.startsWith('etat:') || trimmed.startsWith('état:')) {
        let etatVal = trimmed.replace(/[ée]tat:/, '').trim().toLowerCase();
        if (etatVal.includes('neuf')) etatVal = 'neuf';
        else if (etatVal.includes('très bon') || etatVal.includes('tres bon')) etatVal = 'tres_bon_etat';
        else if (etatVal.includes('bon')) etatVal = 'bon_etat';
        else if (etatVal.includes('satisfaisant')) etatVal = 'satisfaisant';
        else etatVal = 'reconditionne';
        article.etat = etatVal;
        currentSection = null;
      } else if (trimmed.startsWith('en_vedette:')) {
        const val = trimmed.replace('en_vedette:', '').trim().toLowerCase();
        article.en_vedette = val === 'oui' || val === 'true' || val === '1';
        currentSection = null;
      } else if (trimmed.startsWith('photos:')) {
        currentSection = 'photos';
      } else if (trimmed.startsWith('description:')) {
        currentSection = 'description';
        const rest = trimmed.replace('description:', '').trim();
        if (rest && rest !== '>') descriptionLines.push(rest);
      } else if (trimmed.startsWith('specs:')) {
        currentSection = 'specs';
      } else {
        if (currentSection === 'photos' && trimmed.startsWith('-')) {
          article.photos.push(trimmed.replace(/^-\s*/, '').trim());
        } else if (currentSection === 'description') {
          descriptionLines.push(trimmed);
        } else if (currentSection === 'specs') {
          const match = trimmed.replace(/^-\s*/, '').split(':');
          if (match.length >= 2) {
            const k = match[0].trim();
            const v = match.slice(1).join(':').trim();
            article.specs[k] = v;
          }
        }
      }
    }

    article.description = descriptionLines.join(' ').trim();
    if (article.nom) {
      articles.push(article);
    }
  }

  return articles;
}

async function run() {
  const filePath = process.argv[2] || path.join(ROOT_DIR, 'import-produits', 'articles.md');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier introuvable : ${filePath}`);
    process.exit(1);
  }

  console.log(`\n🚀 Démarrage de l'importation depuis : ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const articles = parseArticlesMd(content);

  console.log(`📋 ${articles.length} article(s) détecté(s) dans le fichier.\n`);

  // Récupérer les catégories existantes
  const catRes = await apiGet('get_categories');
  const existingCategories = (catRes.data || []);
  const categoryMap = new Map();
  existingCategories.forEach(c => categoryMap.set(c.nom.toLowerCase().trim(), c.id));

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`[${i + 1}/${articles.length}] Traitement de : ${art.nom}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    // 1. Catégorie (Sélection parmi le catalogue officiel, zéro création sauvage)
    let categorieId = '';
    if (art.categorie) {
      const catKey = art.categorie.toLowerCase().trim();
      if (categoryMap.has(catKey)) {
        categorieId = categoryMap.get(catKey);
      } else {
        for (const [nom, id] of categoryMap.entries()) {
          if (catKey.includes(nom) || nom.includes(catKey)) {
            categorieId = id;
            break;
          }
        }
      }
    }
    if (!categorieId) {
      categorieId = categoryMap.get('pc portables') || (existingCategories[0]?.id || '');
    }
    console.log(`  📁 Catégorie assignée : ${existingCategories.find(c => c.id === categorieId)?.nom || categorieId}`);

    // 2. Upload des images vers Google Drive
    const uploadedImages = [];
    for (let pIdx = 0; pIdx < art.photos.length; pIdx++) {
      const photoPath = art.photos[pIdx];
      const uploaded = await uploadImageToDrive(photoPath);
      if (uploaded) {
        uploadedImages.push({
          cloudinary_url: uploaded.url,
          cloudinary_public_id: uploaded.public_id,
          est_principale: pIdx === 0,
          ordre: pIdx + 1,
        });
      }
    }

    // 3. Création du produit dans Google Sheets
    console.log(`  💾 Enregistrement du produit dans Google Sheets...`);
    const prodRes = await apiPost('upsert_product', {
      product: {
        nom: art.nom,
        slug: slugify(art.nom),
        description: art.description,
        prix: art.prix,
        categorie_id: categorieId,
        etat: art.etat,
        en_vedette: art.en_vedette,
        actif: true,
      }
    });

    if (!prodRes.success || !prodRes.data) {
      console.error(`  ❌ Erreur enregistrement produit : ${prodRes.error}`);
      continue;
    }

    const productId = prodRes.data.id;
    console.log(`  ✅ Produit enregistré (ID: ${productId})`);

    // 4. Lier les images au produit
    if (uploadedImages.length > 0) {
      console.log(`  🖼️ Association de ${uploadedImages.length} image(s)...`);
      await apiPost('save_product_images', {
        product_id: productId,
        images: uploadedImages,
      });
    }

    // 5. Enregistrer les spécifications
    const specsList = Object.entries(art.specs).map(([libelle, valeur], idx) => ({
      icone: 'Check',
      libelle,
      valeur,
      ordre: idx + 1,
    }));

    if (specsList.length > 0) {
      console.log(`  ⚙️ Enregistrement de ${specsList.length} caractéristique(s)...`);
      await apiPost('save_product_specs', {
        product_id: productId,
        specs: specsList,
      });
    }

    console.log(`✨ Article "${art.nom}" importé à 100% avec succès !`);
  }

  console.log(`\n🎉 Tous les articles ont été importés avec succès dans Google Sheets et Google Drive !\n`);
}

run().catch((err) => {
  console.error('\n❌ Erreur fatale lors de l\'importation :', err);
  process.exit(1);
});
