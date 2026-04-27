import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth helpers ───────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── Categories ─────────────────────────────────────────────
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('ordre', { ascending: true })
  if (error) throw error
  return data
}

export async function upsertCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .upsert(category)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ─── Products ───────────────────────────────────────────────
export async function fetchProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      categories ( id, nom, slug ),
      product_images ( id, cloudinary_url, cloudinary_public_id, est_principale, ordre ),
      product_specs ( id, icone, libelle, valeur, ordre )
    `)
    .eq('actif', true)
    .order('created_at', { ascending: false })

  if (filters.categorie_id) {
    query = query.eq('categorie_id', filters.categorie_id)
  }
  if (filters.etat && filters.etat !== 'tous') {
    query = query.eq('etat', filters.etat)
  }
  if (filters.en_vedette) {
    query = query.eq('en_vedette', true)
  }
  if (filters.search) {
    query = query.ilike('nom', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, nom, slug ),
      product_images ( id, cloudinary_url, cloudinary_public_id, est_principale, ordre ),
      product_specs ( id, icone, libelle, valeur, ordre )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, nom, slug ),
      product_images ( id, cloudinary_url, cloudinary_public_id, est_principale, ordre ),
      product_specs ( id, icone, libelle, valeur, ordre )
    `)
    .eq('slug', slug)
    .single()
  if (error) throw error
  return data
}

export async function fetchSimilarProducts(categorieId, excludeId, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( id, nom, slug ),
      product_images ( id, cloudinary_url, cloudinary_public_id, est_principale, ordre ),
      product_specs ( id, icone, libelle, valeur, ordre )
    `)
    .eq('categorie_id', categorieId)
    .neq('id', excludeId)
    .eq('actif', true)
    .limit(limit)
  if (error) throw error
  return data
}

export async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleProductActive(id, actif) {
  const { error } = await supabase
    .from('products')
    .update({ actif })
    .eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ─── Product Images ─────────────────────────────────────────
export async function saveProductImages(productId, images) {
  // Delete existing images
  await supabase.from('product_images').delete().eq('product_id', productId)

  if (images.length === 0) return

  const rows = images.map((img, i) => ({
    product_id: productId,
    cloudinary_url: img.cloudinary_url,
    cloudinary_public_id: img.cloudinary_public_id,
    est_principale: img.est_principale || false,
    ordre: i,
  }))

  const { error } = await supabase.from('product_images').insert(rows)
  if (error) throw error
}

// ─── Product Specs ──────────────────────────────────────────
export async function saveProductSpecs(productId, specs) {
  await supabase.from('product_specs').delete().eq('product_id', productId)

  if (specs.length === 0) return

  const rows = specs.map((s, i) => ({
    product_id: productId,
    icone: s.icone || '',
    libelle: s.libelle,
    valeur: s.valeur,
    ordre: i,
  }))

  const { error } = await supabase.from('product_specs').insert(rows)
  if (error) throw error
}

// ─── Product Reviews ────────────────────────────────────────
export async function fetchProductReviews(productId) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addProductReview(review) {
  const { data, error } = await supabase
    .from('product_reviews')
    .insert(review)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getProductRating(productId) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)
  if (error) throw error
  if (data.length === 0) return { average: 0, count: 0 }
  const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return { average: Math.round(average * 10) / 10, count: data.length }
}
