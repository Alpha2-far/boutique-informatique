import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Upload, X, Star, ChevronUp, ChevronDown, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { fetchCategories, upsertProduct, saveProductImages, saveProductSpecs, supabase } from '../lib/supabase'
import { uploadToCloudinary, getOptimizedUrl } from '../lib/cloudinary'

function generateSlug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    nom: '', description: '', prix: '', categorie_id: '',
    etat: 'neuf', stock: 0, en_vedette: false, actif: true,
  })
  const [images, setImages] = useState([])
  const [specs, setSpecs] = useState([])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
    if (isEdit) loadProduct()
  }, [id])

  const loadProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(*), product_specs(*)')
      .eq('id', id).single()
    if (error) { alert('Produit introuvable'); navigate('/admin/produits'); return }
    setForm({
      nom: data.nom, description: data.description || '',
      prix: data.prix, categorie_id: data.categorie_id || '',
      etat: data.etat, stock: data.stock,
      en_vedette: data.en_vedette, actif: data.actif,
    })
    setImages((data.product_images || []).sort((a, b) => a.ordre - b.ordre).map(i => ({
      id: i.id, cloudinary_url: i.cloudinary_url,
      cloudinary_public_id: i.cloudinary_public_id,
      est_principale: i.est_principale,
    })))
    setSpecs((data.product_specs || []).sort((a, b) => a.ordre - b.ordre).map(s => ({
      icone: s.icone || '', libelle: s.libelle, valeur: s.valeur,
    })))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const { url, public_id } = await uploadToCloudinary(file)
        setImages(prev => [...prev, {
          cloudinary_url: url, cloudinary_public_id: public_id,
          est_principale: prev.length === 0,
        }])
      }
    } catch (err) { alert('Erreur upload: ' + err.message) }
    finally { setUploading(false) }
  }

  const setMainImage = (idx) => {
    setImages(prev => prev.map((img, i) => ({ ...img, est_principale: i === idx })))
  }

  const removeImage = (idx) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== idx)
      if (updated.length > 0 && !updated.some(i => i.est_principale)) {
        updated[0].est_principale = true
      }
      return updated
    })
  }

  const moveImage = (idx, dir) => {
    setImages(prev => {
      const arr = [...prev]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= arr.length) return arr
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      return arr
    })
  }

  const addSpec = () => setSpecs(prev => [...prev, { icone: '', libelle: '', valeur: '' }])
  const removeSpec = (idx) => setSpecs(prev => prev.filter((_, i) => i !== idx))
  const updateSpec = (idx, field, value) => {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim() || !form.prix) return
    setSaving(true)
    try {
      const productData = {
        nom: form.nom.trim(), slug: generateSlug(form.nom),
        description: form.description.trim() || null,
        prix: parseFloat(form.prix), categorie_id: form.categorie_id || null,
        etat: form.etat, stock: parseInt(form.stock) || 0,
        en_vedette: form.en_vedette, actif: form.actif,
      }
      if (isEdit) productData.id = id
      const product = await upsertProduct(productData)
      await saveProductImages(product.id, images)
      const validSpecs = specs.filter(s => s.libelle.trim() && s.valeur.trim())
      await saveProductSpecs(product.id, validSpecs)
      navigate('/admin/produits')
    } catch (err) { alert('Erreur: ' + err.message) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/produits')} className="p-2 hover:bg-surface-tertiary rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-text-primary mb-4">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-muted mb-1">Nom du produit</label>
              <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
                className="input-field" required placeholder="Ex: MacBook Pro M3" />
              {form.nom && <p className="text-xs text-text-light mt-1">Slug: {generateSlug(form.nom)}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-text-muted mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="input-field min-h-[100px] resize-y" placeholder="Description du produit..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Prix (FCFA)</label>
              <input type="number" value={form.prix} onChange={e => setForm({...form, prix: e.target.value})}
                className="input-field" required min="0" step="1" placeholder="560000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Catégorie</label>
              <select value={form.categorie_id} onChange={e => setForm({...form, categorie_id: e.target.value})} className="select-field">
                <option value="">— Aucune —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">État</label>
              <div className="flex bg-surface-tertiary rounded-lg p-0.5">
                {['neuf', 'occasion'].map(v => (
                  <button key={v} type="button" onClick={() => setForm({...form, etat: v})}
                    className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${form.etat === v ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}>
                    {v === 'neuf' ? 'Neuf' : 'Occasion'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                className="input-field" min="0" />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.en_vedette} onChange={e => setForm({...form, en_vedette: e.target.checked})}
                  className="w-4 h-4 rounded border-border text-primary-700 focus:ring-primary-700" />
                <span className="text-sm text-text-primary flex items-center gap-1"><Star size={14} /> En vedette</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.actif} onChange={e => setForm({...form, actif: e.target.checked})}
                  className="w-4 h-4 rounded border-border text-primary-700 focus:ring-primary-700" />
                <span className="text-sm text-text-primary">Actif</span>
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-text-primary mb-4">Images</h3>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary-700 hover:bg-primary-50/30 transition-all mb-4">
            <Upload size={24} className="text-text-light mb-2" />
            <span className="text-sm text-text-muted">{uploading ? 'Upload en cours...' : 'Cliquer ou déposer des images'}</span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className={`relative rounded-lg overflow-hidden border-2 ${img.est_principale ? 'border-primary-700 ring-2 ring-primary-200' : 'border-border'}`}>
                  <img src={getOptimizedUrl(img.cloudinary_url, {width: 200, height: 200})} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute top-1 right-1 flex flex-col gap-1">
                    <button type="button" onClick={() => removeImage(idx)} className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center"><X size={12} /></button>
                    <button type="button" onClick={() => moveImage(idx, -1)} className="w-6 h-6 bg-white border shadow-sm rounded flex items-center justify-center"><ChevronUp size={12} /></button>
                    <button type="button" onClick={() => moveImage(idx, 1)} className="w-6 h-6 bg-white border shadow-sm rounded flex items-center justify-center"><ChevronDown size={12} /></button>
                  </div>
                  {img.est_principale ? (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary-700 text-white text-[10px] text-center py-0.5 font-medium">Principale</div>
                  ) : (
                    <button type="button" onClick={() => setMainImage(idx)} className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5 hover:bg-black/70">
                      Définir principale
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Spécifications techniques</h3>
            <button type="button" onClick={addSpec} className="btn-secondary text-xs py-2 px-3"><Plus size={14} /> Ajouter</button>
          </div>
          {specs.length === 0 ? <p className="text-sm text-text-muted text-center py-4">Aucune spec</p>
          : (
            <div className="space-y-3">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input type="text" value={s.icone} onChange={e => updateSpec(idx, 'icone', e.target.value)}
                    className="input-field w-28" placeholder="Icône" />
                  <input type="text" value={s.libelle} onChange={e => updateSpec(idx, 'libelle', e.target.value)}
                    className="input-field flex-1" placeholder="Libellé (ex: RAM)" />
                  <input type="text" value={s.valeur} onChange={e => updateSpec(idx, 'valeur', e.target.value)}
                    className="input-field flex-1" placeholder="Valeur (ex: 16 Go)" />
                  <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/produits')} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
