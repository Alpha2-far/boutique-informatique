import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Upload, X, Star, ChevronUp, ChevronDown, Plus, Trash2, Image as ImageIcon, Sparkles, Wand2, Loader2 } from 'lucide-react'
import { fetchCategories, saveProductFull, supabase } from '../lib/supabase'
import { uploadToCloudinary, getOptimizedUrl } from '../lib/cloudinary'
import { parseRawProductText, getSpecIcon } from '../lib/productParser'
import SpecIcon from '../components/SpecIcon'

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
  const [savingStatus, setSavingStatus] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null)
  const [rawText, setRawText] = useState('')
  const [parserFeedback, setParserFeedback] = useState(null)
  const [form, setForm] = useState({
    nom: '', description: '', prix: '', categorie_id: '',
    etat: 'neuf', en_vedette: false, actif: true,
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
      etat: data.etat,
      en_vedette: data.en_vedette === true || data.en_vedette === 'true' || data.en_vedette === 'TRUE' || data.en_vedette === 'oui' || data.en_vedette === 1,
      actif: data.actif !== false && data.actif !== 'false',
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
    setUploadProgress(`Compression & envoi (${files.length} photo${files.length > 1 ? 's' : ''})...`)
    try {
      // Compression Canvas et upload simultané ultra-rapide
      const results = await Promise.all(
        files.map(async (file) => uploadToCloudinary(file))
      )
      setImages(prev => [
        ...prev,
        ...results.map((res, idx) => ({
          cloudinary_url: res.url,
          cloudinary_public_id: res.public_id,
          est_principale: prev.length === 0 && idx === 0,
        }))
      ])
    } catch (err) {
      alert('Erreur upload: ' + err.message)
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
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

  const addSpec = () => setSpecs(prev => [...prev, { icone: 'Check', libelle: '', valeur: '' }])
  const removeSpec = (idx) => setSpecs(prev => prev.filter((_, i) => i !== idx))
  const updateSpec = (idx, field, value) => {
    setSpecs(prev => prev.map((s, i) => {
      if (i !== idx) return s
      const updated = { ...s, [field]: value }
      if (field === 'libelle' && value) {
        updated.icone = getSpecIcon(value)
      }
      return updated
    }))
  }

  const handleMagicParse = () => {
    if (!rawText.trim()) return
    const parsed = parseRawProductText(rawText, categories)
    if (!parsed) return

    setForm(prev => ({
      ...prev,
      nom: parsed.nom || prev.nom,
      prix: parsed.prix ? String(parsed.prix) : prev.prix,
      etat: parsed.etat || prev.etat,
      categorie_id: parsed.categorie_id || prev.categorie_id,
      description: parsed.description || prev.description,
    }))

    if (parsed.specs && parsed.specs.length > 0) {
      setSpecs(parsed.specs)
    }

    setParserFeedback(`✨ ${parsed.specs?.length || 0} caractéristiques et informations pré-remplies !`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim() || !form.prix) return
    setSaving(true)
    setSavingStatus('Enregistrement rapide...')
    try {
      const slug = generateSlug(form.nom)
      const validSpecs = specs.filter(s => s.libelle.trim() && s.valeur.trim())
      const productData = {
        nom: form.nom.trim(),
        slug,
        description: form.description.trim() || null,
        prix: parseFloat(form.prix),
        categorie_id: form.categorie_id || null,
        etat: form.etat,
        en_vedette: form.en_vedette,
        actif: form.actif,
      }
      if (isEdit) productData.id = id

      setSavingStatus('Sauvegarde du produit et des caractéristiques...')
      await saveProductFull({
        product: productData,
        images,
        specs: validSpecs,
        isEdit,
      })
      navigate('/admin/produits')
    } catch (err) {
      alert('Erreur: ' + err.message)
    } finally {
      setSaving(false)
      setSavingStatus(null)
    }
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
        {/* Remplissage Rapide WhatsApp (Nouveau) */}
        {!isEdit && (
          <div className="bg-gradient-to-br from-[#2D0660]/10 via-[#4A0D8F]/10 to-indigo-50 border border-purple-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2D0660] to-[#4A0D8F] flex items-center justify-center text-white shadow-md">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm sm:text-base">
                    Remplissage Rapide WhatsApp
                  </h3>
                  <p className="text-xs text-text-muted">
                    Collez votre annonce brute (nom, specs, état...) et cliquez pour remplir automatiquement tout le formulaire.
                  </p>
                </div>
              </div>
              {rawText && (
                <button
                  type="button"
                  onClick={() => { setRawText(''); setParserFeedback(null) }}
                  className="text-xs text-text-muted hover:text-red-600 transition-colors"
                >
                  Effacer
                </button>
              )}
            </div>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Collez ici votre texte WhatsApp...&#10;Exemple :&#10;💻 *HP Laptop 15-eg0xxx*&#10;✅*Processeur : Intel Pentium Gold 7505*&#10;Mémoire : RAM 4 Go&#10;✅*Stockage : SSD 128 Go*&#10;État : Venu propre, 10/10..."
              className="w-full h-28 p-3 text-xs sm:text-sm bg-white rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#4A0D8F] transition-all placeholder:text-gray-400 font-mono resize-y mt-2"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <button
                type="button"
                onClick={handleMagicParse}
                disabled={!rawText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2D0660] to-[#4A0D8F] hover:from-[#1A0533] hover:to-[#38096C] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 size={16} />
                Analyser & Remplir automatiquement
              </button>

              {parserFeedback && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  {parserFeedback}
                </span>
              )}
            </div>
          </div>
        )}

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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-text-muted">Description commerciale</label>
                {rawText && (
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseRawProductText(rawText, categories)
                      if (parsed?.description) setForm(prev => ({ ...prev, description: parsed.description }))
                    }}
                    className="text-xs text-[#4A0D8F] hover:underline flex items-center gap-1 font-medium transition-colors"
                  >
                    <Sparkles size={12} /> Regénérer la description
                  </button>
                )}
              </div>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="input-field min-h-[110px] resize-y text-xs sm:text-sm leading-relaxed" placeholder="Description du produit..." />
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
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'neuf', label: 'Neuf' },
                  { value: 'occasion', label: 'Occasion' },
                  { value: 'venue_propre', label: 'Venue propre' },
                  { value: 'reconditionné', label: 'Reconditionné' },
                  { value: 'pour_pieces', label: 'Pour pièces' },
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm({ ...form, etat: option.value })}
                    className={`text-sm font-medium py-2 px-3 rounded-lg transition-all border ${
                      form.etat === option.value
                        ? 'bg-[#4A0D8F] text-white border-[#4A0D8F]'
                        : 'bg-surface-tertiary text-text-muted border-border hover:border-primary-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Options Vedette & Statut */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option En Vedette */}
              <div className={`p-4 rounded-xl border transition-all ${
                form.en_vedette
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-surface-secondary border-border hover:border-gray-300'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      form.en_vedette ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <Star size={18} fill={form.en_vedette ? 'currentColor' : 'none'} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                        En vedette (Hero Accueil)
                        {form.en_vedette && (
                          <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                            Actif
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Affiche ce produit dans le grand carrousel en haut de la page d'accueil.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={form.en_vedette}
                      onChange={(e) => setForm({ ...form, en_vedette: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Option Actif (Visibilité boutique) */}
              <div className={`p-4 rounded-xl border transition-all ${
                form.actif
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'bg-gray-50 border-gray-200 opacity-75'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      form.actif ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <span className="text-xs font-bold">{form.actif ? 'ON' : 'OFF'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        Visible en boutique
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {form.actif ? 'Le produit est visible et commandable.' : 'Masqué de la boutique publique.'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={form.actif}
                      onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-semibold text-text-primary mb-4">Images</h3>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all mb-4 ${
            uploading
              ? 'border-purple-300 bg-purple-50/50 cursor-wait'
              : 'border-border cursor-pointer hover:border-primary-700 hover:bg-primary-50/30'
          }`}>
            {uploading ? (
              <Loader2 size={24} className="text-[#4A0D8F] animate-spin mb-2" />
            ) : (
              <Upload size={24} className="text-text-light mb-2" />
            )}
            <span className="text-sm font-medium text-text-primary">
              {uploading ? (uploadProgress || 'Compression et envoi des images...') : 'Cliquer ou déposer des images'}
            </span>
            <span className="text-xs text-text-muted mt-1">
              Photos compressées automatiquement en ultra-haute qualité
            </span>
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
            <div>
              <h3 className="font-semibold text-text-primary">Spécifications techniques</h3>
              <p className="text-xs text-text-muted">Caractéristiques affichées sur la fiche produit</p>
            </div>
            <button type="button" onClick={addSpec} className="btn-secondary text-xs py-2 px-3">
              <Plus size={14} /> Ajouter
            </button>
          </div>
          {specs.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">Aucune spécification technique pour l'instant</p>
          ) : (
            <div className="space-y-3">
              {specs.map((s, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 sm:p-2 bg-surface-tertiary sm:bg-transparent rounded-xl sm:rounded-none">
                  {/* Pastille icône automatique */}
                  <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center shrink-0 text-primary-700 shadow-xs">
                    <SpecIcon iconName={s.icone} libelle={s.libelle} size={18} />
                  </div>
                  <input
                    type="text"
                    value={s.libelle}
                    onChange={e => updateSpec(idx, 'libelle', e.target.value)}
                    className="input-field sm:w-1/3 text-xs sm:text-sm font-medium"
                    placeholder="Libellé (ex: Processeur, RAM...)"
                  />
                  <input
                    type="text"
                    value={s.valeur}
                    onChange={e => updateSpec(idx, 'valeur', e.target.value)}
                    className="input-field flex-1 text-xs sm:text-sm"
                    placeholder="Valeur (ex: Intel Core i7, 16 Go...)"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-end sm:self-center transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {savingStatus ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#4A0D8F] bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl">
              <Loader2 size={16} className="animate-spin text-[#4A0D8F] shrink-0" />
              <span>{savingStatus}</span>
            </div>
          ) : <div />}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/admin/produits')} className="btn-secondary" disabled={saving}>
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="btn-primary flex items-center justify-center gap-2 min-w-[170px]"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{isEdit ? 'Mettre à jour' : 'Enregistrer le produit'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
