/**
 * Client de données GQ Store
 * Connecté à Google Apps Script / Google Sheets
 * Remplace Supabase de façon transparente en conservant les mêmes signatures de fonctions.
 */

const DIRECT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzquOsnzDkC8hP-EL2ARuuIPgjADUvByaji4mNcAYCFrvt9bUVkQ6n6vyUHUGRLZfni3A/exec'

// Sur Vercel (ou tout domaine distant hors localhost), utiliser le proxy /api/apps-script
// afin d'éliminer définitivement les erreurs CORS et les redirections 302 ("Failed to fetch")
function getApiUrl() {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api/apps-script'
  }
  return DIRECT_URL
}

// ─── Helpers Requêtes HTTP avec Retry ──────────────────────────
async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiGet(action, params = {}, retries = 2) {
  const baseUrl = getApiUrl()
  const urlParams = new URLSearchParams({ action, ...params })
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${baseUrl}?${urlParams.toString()}`, {
        method: 'GET',
        redirect: 'follow',
      })
      if (!response.ok) {
        throw new Error(`Erreur réseau (${response.status})`)
      }
      const text = await response.text()
      if (!text.trim().startsWith('{')) {
        throw new Error('Réponse non JSON de Google Apps Script')
      }
      const result = JSON.parse(text)
      if (result.success === false) {
        throw new Error(result.error || 'Erreur lors de la récupération des données')
      }
      return result.data !== undefined ? result.data : result
    } catch (err) {
      if (attempt < retries) {
        await wait(500 * (attempt + 1))
        continue
      }
      throw err
    }
  }
}

async function apiPost(action, payload = {}, retries = 2) {
  const baseUrl = getApiUrl()
  const body = JSON.stringify({ action, ...payload })

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const isProxy = baseUrl.startsWith('/api')
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': isProxy ? 'application/json' : 'text/plain;charset=utf-8',
        },
        body,
        redirect: 'follow',
      })
      if (!response.ok) {
        throw new Error(`Erreur réseau (${response.status})`)
      }
      const text = await response.text()
      if (!text.trim().startsWith('{')) {
        throw new Error('Réponse non JSON de Google Apps Script')
      }
      const result = JSON.parse(text)
      if (result.success === false) {
        throw new Error(result.error || 'Erreur lors de l’enregistrement')
      }
      return result.data !== undefined ? result.data : result
    } catch (err) {
      if (attempt < retries) {
        await wait(500 * (attempt + 1))
        continue
      }
      throw err
    }
  }
}

// ─── Gestion de Session et Auth Admin ──────────────────────────
const SESSION_KEY = 'gq_store_admin_session'
const authSubscribers = new Set()

function notifyAuthSubscribers(session) {
  authSubscribers.forEach((callback) => {
    try {
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
    } catch (e) {
      console.error(e)
    }
  })
}

export async function signIn(email, password) {
  const result = await apiPost('login', { email, password })
  const session = {
    user: result.user,
    token: result.token,
    expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  notifyAuthSubscribers(session)
  return { user: session.user, session }
}

export async function signOut() {
  localStorage.removeItem(SESSION_KEY)
  notifyAuthSubscribers(null)
  return { error: null }
}

export async function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    if (session.expires_at && session.expires_at < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      notifyAuthSubscribers(null)
      return null
    }
    return session
  } catch {
    return null
  }
}

// ─── Émulateur Supabase (pour compatibilité avec AdminLayout et ProductForm) ─
export const supabase = {
  auth: {
    async getSession() {
      const session = await getSession()
      return { data: { session }, error: null }
    },
    onAuthStateChange(callback) {
      authSubscribers.add(callback)
      return {
        data: {
          subscription: {
            unsubscribe: () => authSubscribers.delete(callback),
          },
        },
      }
    },
    signInWithPassword({ email, password }) {
      return signIn(email, password)
    },
    signOut() {
      return signOut()
    },
  },
  from(tableName) {
    return {
      select(fields = '*') {
        return {
          eq(field, val) {
            return {
              async single() {
                if (tableName === 'products' && field === 'id') {
                  const data = await apiGet('get_product_by_id', { id: val })
                  return { data, error: null }
                }
                if (tableName === 'products' && field === 'slug') {
                  const data = await apiGet('get_product_by_slug', { slug: val })
                  return { data, error: null }
                }
                return { data: null, error: new Error('Non trouvé') }
              },
              neq(notField, notVal) {
                return {
                  async maybeSingle() {
                    if (tableName === 'products' && field === 'slug') {
                      const res = await apiGet('check_slug', { slug: val, current_id: notVal })
                      return { data: res.available ? null : { id: 'exists' }, error: null }
                    }
                    return { data: null, error: null }
                  },
                }
              },
              async maybeSingle() {
                if (tableName === 'products' && field === 'slug') {
                  const res = await apiGet('check_slug', { slug: val })
                  return { data: res.available ? null : { id: 'exists' }, error: null }
                }
                return { data: null, error: null }
              },
            }
          },
        }
      },
    }
  },
}

// ─── Catégories ─────────────────────────────────────────────
export async function fetchCategories() {
  return await apiGet('get_categories')
}

export async function upsertCategory(category) {
  return await apiPost('upsert_category', { category })
}

export async function deleteCategory(id) {
  return await apiPost('delete_category', { id })
}

// ─── Produits ───────────────────────────────────────────────
export async function fetchProducts(filters = {}) {
  const params = {}
  if (filters.categorie_id) params.categorie_id = filters.categorie_id
  if (filters.etat && filters.etat !== 'tous') params.etat = filters.etat
  if (filters.en_vedette) params.en_vedette = 'true'
  if (filters.search) params.search = filters.search

  return await apiGet('get_products', params)
}

export async function fetchAllProducts() {
  return await apiGet('get_all_products')
}

export async function fetchProductBySlug(slug) {
  return await apiGet('get_product_by_slug', { slug })
}

export async function fetchSimilarProducts(categorieId, excludeId, limit = 4) {
  return await apiGet('get_similar_products', {
    categorie_id: categorieId,
    exclude_id: excludeId,
    limit: String(limit),
  })
}

export async function upsertProduct(product) {
  return await apiPost('upsert_product', { product })
}

export async function toggleProductActive(id, actif) {
  return await apiPost('toggle_product_active', { id, actif })
}

export async function deleteProduct(id) {
  return await apiPost('delete_product', { id })
}

// ─── Images de Produits ─────────────────────────────────────
export async function saveProductImages(productId, images) {
  return await apiPost('save_product_images', {
    product_id: productId,
    images: images || [],
  })
}

// ─── Spécifications de Produits ─────────────────────────────
export async function saveProductSpecs(productId, specs) {
  return await apiPost('save_product_specs', {
    product_id: productId,
    specs: specs || [],
  })
}

// ─── Sauvegarde Complète Atomique (Ultra Rapide) ─────────────
export async function saveProductFull({ product, images, specs, isEdit }) {
  return await apiPost('save_product_full', {
    product,
    images: images || [],
    specs: specs || [],
    isEdit: Boolean(isEdit),
  })
}

// ─── Avis Clients (Reviews) ─────────────────────────────────
export async function fetchProductReviews(productId) {
  return await apiGet('get_reviews', { product_id: productId })
}

export async function addProductReview(review) {
  return await apiPost('add_review', { review })
}

export async function getProductRating(productId) {
  const reviews = await fetchProductReviews(productId)
  if (!reviews || reviews.length === 0) return { average: 0, count: 0 }
  const average = reviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 0), 0) / reviews.length
  return { average: Math.round(average * 10) / 10, count: reviews.length }
}
