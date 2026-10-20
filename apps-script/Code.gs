/**
 * ============================================================================
 * GQ STORE - BACKEND GOOGLE APPS SCRIPT
 * Base de données : Google Sheets (ID: 1eNJkAd_cpSeIwWeaBwy-K7aXn13tjZaq0h5JqMpw6Cc)
 * Hébergement photos : Google Drive (ID: 1Mwl1G3GDPBq7miwZRnxTrRoYS7CLwEzq)
 * ============================================================================
 */

const CONFIG = {
  SPREADSHEET_ID: '1eNJkAd_cpSeIwWeaBwy-K7aXn13tjZaq0h5JqMpw6Cc',
  DRIVE_FOLDER_ID: '1Mwl1G3GDPBq7miwZRnxTrRoYS7CLwEzq',
  ADMIN_EMAIL: 'admin@gq-store.com',
  ADMIN_PASSWORD: 'gq-store'
};

/**
 * Fonction d'initialisation des feuilles et des en-têtes
 * Exécutez cette fonction une fois dans Apps Script si vous souhaitez
 * vérifier ou créer automatiquement les colonnes nécessaires.
 */
function setupDatabase() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const schemas = {
    'categories': ['id', 'nom', 'slug', 'icone', 'ordre', 'created_at'],
    'products': ['id', 'nom', 'slug', 'description', 'prix', 'categorie_id', 'etat', 'stock', 'en_vedette', 'actif', 'created_at'],
    'product_images': ['id', 'product_id', 'cloudinary_url', 'cloudinary_public_id', 'est_principale', 'ordre'],
    'product_specs': ['id', 'product_id', 'icone', 'libelle', 'valeur', 'ordre'],
    'product_reviews': ['id', 'product_id', 'author_name', 'rating', 'comment', 'verified', 'created_at']
  };

  for (const [sheetName, headers] of Object.entries(schemas)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    const currentValues = sheet.getDataRange().getValues();
    if (currentValues.length === 0 || currentValues[0].length === 0 || !currentValues[0][0]) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }

  Logger.log('Base de données initialisée avec succès !');
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTAGE DES REQUÊTES (doGet & doPost)
// ─────────────────────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const action = e.parameter.action;
    let result = null;

    switch (action) {
      case 'ping':
        result = { success: true, message: 'GQ Store API opérationnelle' };
        break;

      case 'get_categories':
        result = getCategories();
        break;

      case 'get_products':
        result = getProducts(e.parameter);
        break;

      case 'get_all_products':
        result = getAllProducts();
        break;

      case 'get_product_by_id':
        result = getProductById(e.parameter.id);
        break;

      case 'get_product_by_slug':
        result = getProductBySlug(e.parameter.slug);
        break;

      case 'get_similar_products':
        result = getSimilarProducts(e.parameter.categorie_id, e.parameter.exclude_id, parseInt(e.parameter.limit || 4));
        break;

      case 'get_reviews':
        result = getProductReviews(e.parameter.product_id);
        break;

      case 'check_slug':
        result = checkSlugAvailable(e.parameter.slug, e.parameter.current_id);
        break;

      default:
        result = { success: false, error: 'Action GET inconnue: ' + action };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    let data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    const action = data.action;
    let result = null;

    switch (action) {
      case 'login':
        result = handleLogin(data.email, data.password);
        break;

      case 'upload_image':
        result = handleImageUpload(data.fileName, data.mimeType, data.base64);
        break;

      case 'upsert_category':
        result = upsertCategory(data.category);
        break;

      case 'delete_category':
        result = deleteCategory(data.id);
        break;

      case 'upsert_product':
        result = upsertProduct(data.product);
        break;

      case 'toggle_product_active':
        result = toggleProductActive(data.id, data.actif);
        break;

      case 'delete_product':
        result = deleteProduct(data.id);
        break;

      case 'toggle_product_en_vedette':
        result = toggleProductEnVedette(data.id, data.en_vedette);
        break;

      case 'save_product_images':
        result = saveProductImages(data.product_id, data.images);
        break;

      case 'save_product_specs':
        result = saveProductSpecs(data.product_id, data.specs);
        break;

      case 'save_product_full':
        result = saveProductFull(data);
        break;

      case 'add_review':
        result = addProductReview(data.review);
        break;

      default:
        result = { success: false, error: 'Action POST inconnue: ' + action };
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────────────────
// GESTION GOOGLE SHEETS (HELPERS CRUD)
// ─────────────────────────────────────────────────────────────────────────────

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Feuille introuvable: ' + sheetName);
  }
  return sheet;
}

function getRowsAsObjects(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0].map(h => String(h).trim());
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = { _rowIndex: i + 1 };
    headers.forEach((header, colIdx) => {
      let val = row[colIdx];
      // Traitement des types
      if (val === 'TRUE' || val === true) val = true;
      else if (val === 'FALSE' || val === false) val = false;
      obj[header] = val;
    });
    // On ignore les lignes sans ID
    if (obj.id) {
      rows.push(obj);
    }
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

function handleLogin(email, password) {
  if (email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PASSWORD) {
    const token = Utilities.getUuid() + '-' + Date.now();
    return {
      success: true,
      user: {
        id: 'admin-gq-store',
        email: CONFIG.ADMIN_EMAIL,
        role: 'admin'
      },
      token: token
    };
  }
  return { success: false, error: 'Email ou mot de passe incorrect' };
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD GOOGLE DRIVE (REMPLACE CLOUDINARY)
// ─────────────────────────────────────────────────────────────────────────────

function handleImageUpload(fileName, mimeType, base64) {
  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const decoded = Utilities.base64Decode(base64);
    const blob = Utilities.newBlob(decoded, mimeType || 'image/jpeg', fileName || ('img_' + Date.now() + '.jpg'));
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // Lien direct haute performance Google CDN
    const directUrl = 'https://lh3.googleusercontent.com/d/' + fileId;

    return {
      success: true,
      url: directUrl,
      public_id: fileId,
      cloudinary_url: directUrl,
      cloudinary_public_id: fileId
    };
  } catch (err) {
    return { success: false, error: 'Erreur upload Drive: ' + err.toString() };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÉGORIES
// ─────────────────────────────────────────────────────────────────────────────

function getCategories() {
  const rows = getRowsAsObjects('categories');
  rows.sort((a, b) => (parseInt(a.ordre) || 0) - (parseInt(b.ordre) || 0));
  return { success: true, data: rows };
}

function upsertCategory(category) {
  const sheet = getSheet('categories');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const rows = getRowsAsObjects('categories');

  let id = category.id || Utilities.getUuid();
  let existingIndex = rows.findIndex(r => r.id === id);

  const rowValues = headers.map(header => {
    if (header === 'id') return id;
    if (header === 'created_at') return category.created_at || (existingIndex >= 0 ? rows[existingIndex].created_at : new Date().toISOString());
    return category[header] !== undefined ? category[header] : '';
  });

  if (existingIndex >= 0) {
    const sheetRow = rows[existingIndex]._rowIndex;
    sheet.getRange(sheetRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  category.id = id;
  return { success: true, data: category };
}

function deleteCategory(id) {
  const sheet = getSheet('categories');
  const rows = getRowsAsObjects('categories');
  const existing = rows.find(r => r.id === id);
  if (existing) {
    sheet.deleteRow(existing._rowIndex);
  }
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUITS
// ─────────────────────────────────────────────────────────────────────────────

function enrichProducts(products) {
  const categories = getRowsAsObjects('categories');
  const allImages = getRowsAsObjects('product_images');
  const allSpecs = getRowsAsObjects('product_specs');

  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c; });

  return products.map(prod => {
    const cat = catMap[prod.categorie_id] || null;
    const images = allImages
      .filter(img => img.product_id === prod.id)
      .sort((a, b) => (parseInt(a.ordre) || 0) - (parseInt(b.ordre) || 0))
      .map(img => ({
        id: img.id,
        cloudinary_url: img.cloudinary_url || img.image_url,
        cloudinary_public_id: img.cloudinary_public_id || img.drive_file_id,
        est_principale: Boolean(img.est_principale),
        ordre: parseInt(img.ordre) || 0
      }));

    const specs = allSpecs
      .filter(s => s.product_id === prod.id)
      .sort((a, b) => (parseInt(a.ordre) || 0) - (parseInt(b.ordre) || 0))
      .map(s => ({
        id: s.id,
        icone: s.icone || '',
        libelle: s.libelle,
        valeur: s.valeur,
        ordre: parseInt(s.ordre) || 0
      }));

    return {
      ...prod,
      prix: parseFloat(prod.prix) || 0,
      stock: parseInt(prod.stock) || 0,
      en_vedette: Boolean(prod.en_vedette),
      actif: Boolean(prod.actif),
      categories: cat ? { id: cat.id, nom: cat.nom, slug: cat.slug } : null,
      product_images: images,
      product_specs: specs
    };
  });
}

function getProducts(params) {
  let products = getRowsAsObjects('products');

  // Filtrer par actif = true pour la boutique publique
  products = products.filter(p => p.actif === true || p.actif === 'true');

  if (params.categorie_id) {
    products = products.filter(p => p.categorie_id === params.categorie_id);
  }
  if (params.etat && params.etat !== 'tous') {
    products = products.filter(p => p.etat === params.etat);
  }
  if (params.en_vedette === 'true' || params.en_vedette === true) {
    products = products.filter(p => p.en_vedette === true || p.en_vedette === 'true' || p.en_vedette === 'TRUE' || p.en_vedette === 'oui' || p.en_vedette === 1 || p.en_vedette === '1');
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    products = products.filter(p => (p.nom && p.nom.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q)));
  }

  // Tri par created_at décroissant
  products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const enriched = enrichProducts(products);
  return { success: true, data: enriched };
}

function getAllProducts() {
  let products = getRowsAsObjects('products');
  products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const enriched = enrichProducts(products);
  return { success: true, data: enriched };
}

function getProductById(id) {
  const products = getRowsAsObjects('products');
  const found = products.find(p => p.id === id);
  if (!found) {
    return { success: false, error: 'Produit introuvable' };
  }
  const enriched = enrichProducts([found]);
  return { success: true, data: enriched[0] };
}

function getProductBySlug(slug) {
  const products = getRowsAsObjects('products');
  const found = products.find(p => p.slug === slug);
  if (!found) {
    return { success: false, error: 'Produit introuvable' };
  }
  const enriched = enrichProducts([found]);
  return { success: true, data: enriched[0] };
}

function getSimilarProducts(categorieId, excludeId, limit) {
  let products = getRowsAsObjects('products');
  products = products.filter(p => (p.actif === true || p.actif === 'true') && p.categorie_id === categorieId && p.id !== excludeId);
  products = products.slice(0, limit || 4);
  const enriched = enrichProducts(products);
  return { success: true, data: enriched };
}

function checkSlugAvailable(slug, currentId) {
  const products = getRowsAsObjects('products');
  const found = products.find(p => p.slug === slug && p.id !== currentId);
  return { success: true, available: !found };
}

function upsertProduct(product) {
  const sheet = getSheet('products');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const rows = getRowsAsObjects('products');

  let id = product.id || Utilities.getUuid();
  let existingIndex = rows.findIndex(r => r.id === id);

  const rowValues = headers.map(header => {
    if (header === 'id') return id;
    if (header === 'created_at') return product.created_at || (existingIndex >= 0 ? rows[existingIndex].created_at : new Date().toISOString());
    return product[header] !== undefined ? product[header] : '';
  });

  if (existingIndex >= 0) {
    const sheetRow = rows[existingIndex]._rowIndex;
    sheet.getRange(sheetRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  product.id = id;
  return { success: true, data: product };
}

function toggleProductActive(id, actif) {
  const sheet = getSheet('products');
  const rows = getRowsAsObjects('products');
  const existing = rows.find(r => r.id === id);
  if (!existing) return { success: false, error: 'Produit non trouvé' };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const colIndex = headers.indexOf('actif') + 1;
  if (colIndex > 0) {
    sheet.getRange(existing._rowIndex, colIndex).setValue(actif);
  }
  return { success: true };
}

function toggleProductEnVedette(id, en_vedette) {
  const sheet = getSheet('products');
  const rows = getRowsAsObjects('products');
  const existing = rows.find(r => r.id === id);
  if (!existing) return { success: false, error: 'Produit non trouvé' };

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
  const colIndex = headers.indexOf('en_vedette') + 1;
  if (colIndex > 0) {
    sheet.getRange(existing._rowIndex, colIndex).setValue(Boolean(en_vedette));
  }
  return { success: true };
}

function deleteProduct(id) {
  // 1. Supprimer le produit
  const sheet = getSheet('products');
  const rows = getRowsAsObjects('products');
  const existing = rows.find(r => r.id === id);
  if (existing) {
    sheet.deleteRow(existing._rowIndex);
  }

  // 2. Supprimer les images liées
  deleteRowsByProductId('product_images', id);

  // 3. Supprimer les specs liées
  deleteRowsByProductId('product_specs', id);

  return { success: true };
}

function deleteRowsByProductId(sheetName, productId) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  const headers = data[0].map(h => String(h).trim());
  const prodIdIdx = headers.indexOf('product_id');
  if (prodIdIdx === -1) return;

  const preservedRows = [data[0]]; // En-têtes
  let found = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][prodIdIdx] === productId) {
      found = true;
    } else {
      preservedRows.push(data[i]);
    }
  }

  // Si des lignes ont été supprimées, réécrire en 1 seule opération atomique
  if (found) {
    sheet.clearContents();
    sheet.getRange(1, 1, preservedRows.length, headers.length).setValues(preservedRows);
  }
}

function saveProductImages(productId, images, skipDelete) {
  // Supprimer les images actuelles pour ce produit sauf si nouveau produit
  if (!skipDelete) {
    deleteRowsByProductId('product_images', productId);
  }

  if (!images || images.length === 0) return { success: true };

  const sheet = getSheet('product_images');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());

  // Préparation de toutes les lignes en mémoire
  const rows = images.map((img, i) => {
    return headers.map(h => {
      if (h === 'id') return Utilities.getUuid();
      if (h === 'product_id') return productId;
      if (h === 'cloudinary_url' || h === 'image_url') return img.cloudinary_url || img.image_url || '';
      if (h === 'cloudinary_public_id' || h === 'drive_file_id') return img.cloudinary_public_id || img.drive_file_id || '';
      if (h === 'est_principale') return Boolean(img.est_principale);
      if (h === 'ordre') return i;
      return '';
    });
  });

  // Écriture groupée ultra-rapide en 1 seul appel Sheets
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, rows.length, headers.length).setValues(rows);

  return { success: true };
}

function saveProductSpecs(productId, specs, skipDelete) {
  if (!skipDelete) {
    deleteRowsByProductId('product_specs', productId);
  }

  if (!specs || specs.length === 0) return { success: true };

  const sheet = getSheet('product_specs');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());

  // Préparation de toutes les lignes de specs en mémoire
  const rows = specs.map((s, i) => {
    return headers.map(h => {
      if (h === 'id') return Utilities.getUuid();
      if (h === 'product_id') return productId;
      if (h === 'icone') return s.icone || '';
      if (h === 'libelle') return s.libelle || '';
      if (h === 'valeur') return s.valeur || '';
      if (h === 'ordre') return i;
      return '';
    });
  });

  // Écriture groupée ultra-rapide en 1 seul appel Sheets
  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, rows.length, headers.length).setValues(rows);

  return { success: true };
}

function saveProductFull(payload) {
  const product = payload.product;
  const images = payload.images || [];
  const specs = payload.specs || [];
  const isEdit = Boolean(payload.isEdit || product.id);

  // 1. Sauvegarder le produit
  const upsertRes = upsertProduct(product);
  if (!upsertRes.success) return upsertRes;
  const savedProduct = upsertRes.data;
  const productId = savedProduct.id;

  // 2. Sauvegarder les images en batch (sans suppression inutile si nouveau produit)
  saveProductImages(productId, images, !isEdit);

  // 3. Sauvegarder les caractéristiques en batch (sans suppression inutile si nouveau produit)
  saveProductSpecs(productId, specs, !isEdit);

  return { success: true, data: savedProduct };
}

// ─────────────────────────────────────────────────────────────────────────────
// AVIS CLIENTS (REVIEWS)
// ─────────────────────────────────────────────────────────────────────────────

function getProductReviews(productId) {
  const rows = getRowsAsObjects('product_reviews');
  const reviews = rows
    .filter(r => r.product_id === productId)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  return { success: true, data: reviews };
}

function addProductReview(review) {
  const sheet = getSheet('product_reviews');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());

  const id = Utilities.getUuid();
  const rowValues = headers.map(h => {
    if (h === 'id') return id;
    if (h === 'created_at') return new Date().toISOString();
    return review[h] !== undefined ? review[h] : '';
  });

  sheet.appendRow(rowValues);
  review.id = id;
  return { success: true, data: review };
}
