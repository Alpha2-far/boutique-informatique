import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { fetchAllProducts, fetchCategories, toggleProductActive, deleteProduct } from '../lib/supabase'
import { getOptimizedUrl } from '../lib/cloudinary'
import { formatPrice, getMainImage } from '../components/ProductCard'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [filterEtat, setFilterEtat] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([fetchAllProducts(), fetchCategories()])
      setProducts(p); setCategories(c)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    if (filterCat && p.categorie_id !== filterCat) return false
    if (filterEtat && p.etat !== filterEtat) return false
    if (search && !p.nom.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleToggle = async (id, current) => {
    try { await toggleProductActive(id, !current); await load() }
    catch (e) { alert('Erreur: ' + e.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    try { await deleteProduct(id); await load() }
    catch (e) { alert('Erreur: ' + e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Produits</h1>
          <p className="text-sm text-text-muted mt-0.5">{products.length} produit(s) au total</p>
        </div>
        <Link to="/admin/produits/nouveau" className="btn-primary text-sm"><Plus size={16} /> Nouveau produit</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="input-field pl-9" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="select-field w-auto min-w-[160px]">
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={filterEtat} onChange={e => setFilterEtat(e.target.value)} className="select-field w-auto min-w-[120px]">
          <option value="">Tous états</option>
          <option value="neuf">Neuf</option>
          <option value="occasion">Occasion</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        {loading ? <div className="p-10 text-center text-text-muted">Chargement...</div>
        : filtered.length === 0 ? <div className="p-10 text-center text-text-muted">Aucun produit trouvé</div>
        : (
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b border-border bg-surface-secondary">
              <th className="text-left text-xs font-semibold text-text-muted px-4 py-3">Image</th>
              <th className="text-left text-xs font-semibold text-text-muted px-4 py-3">Nom</th>
              <th className="text-left text-xs font-semibold text-text-muted px-4 py-3">Catégorie</th>
              <th className="text-left text-xs font-semibold text-text-muted px-4 py-3">État</th>
              <th className="text-right text-xs font-semibold text-text-muted px-4 py-3">Prix</th>
              <th className="text-center text-xs font-semibold text-text-muted px-4 py-3">Stock</th>
              <th className="text-center text-xs font-semibold text-text-muted px-4 py-3">Actif</th>
              <th className="text-right text-xs font-semibold text-text-muted px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const img = getMainImage(p)
                const url = img ? getOptimizedUrl(img.cloudinary_url, { width: 60, height: 60 }) : null
                return (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-secondary/50">
                    <td className="px-4 py-3">
                      {url ? <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                      : <div className="w-10 h-10 rounded-lg bg-surface-tertiary" />}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary max-w-[200px] truncate">{p.nom}</td>
                    <td className="px-4 py-3 text-sm text-text-muted">{p.categories?.nom || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={p.etat === 'neuf' ? 'badge-neuf' : 'badge-occasion'}>
                        {p.etat === 'neuf' ? 'Neuf' : 'Occasion'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary text-right price-format">{formatPrice(p.prix)}</td>
                    <td className="px-4 py-3 text-sm text-center text-text-muted">{p.stock}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(p.id, p.actif)}
                        className={`p-1.5 rounded-lg ${p.actif ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                        {p.actif ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/produits/${p.id}/modifier`} className="p-2 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg"><Pencil size={14} /></Link>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
