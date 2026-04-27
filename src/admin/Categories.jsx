import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { fetchCategories, upsertCategory, deleteCategory } from '../lib/supabase'

function generateSlug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nom: '', icone: '', ordre: 0 })

  const load = async () => {
    setLoading(true)
    try { setCategories(await fetchCategories()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const reset = () => { setForm({ nom: '', icone: '', ordre: 0 }); setEditingId(null); setShowForm(false) }

  const handleEdit = (c) => {
    setForm({ nom: c.nom, icone: c.icone || '', ordre: c.ordre || 0 })
    setEditingId(c.id); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim()) return
    setSaving(true)
    try {
      const p = { nom: form.nom.trim(), slug: generateSlug(form.nom), icone: form.icone.trim() || null, ordre: parseInt(form.ordre) || 0 }
      if (editingId) p.id = editingId
      await upsertCategory(p); await load(); reset()
    } catch (err) { alert('Erreur: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    try { await deleteCategory(id); await load() }
    catch (err) { alert('Erreur: ' + err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catégories</h1>
          <p className="text-sm text-text-muted mt-0.5">Gérez les catégories de votre boutique</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true) }} className="btn-primary text-sm"><Plus size={16} /> Ajouter</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? 'Modifier' : 'Nouvelle catégorie'}</h3>
            <button onClick={reset} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Nom</label>
              <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="input-field" required placeholder="Ex: Ordinateurs" />
              {form.nom && <p className="text-xs text-text-light mt-1">Slug: {generateSlug(form.nom)}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Icône Lucide</label>
              <input type="text" value={form.icone} onChange={e => setForm({...form, icone: e.target.value})} className="input-field" placeholder="Monitor" />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-text-muted mb-1">Ordre</label>
                <input type="number" value={form.ordre} onChange={e => setForm({...form, ordre: e.target.value})} className="input-field" min="0" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary text-sm py-2.5 px-5">
                <Save size={14} /> {saving ? '...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? <div className="p-10 text-center text-text-muted">Chargement...</div>
        : categories.length === 0 ? <div className="p-10 text-center text-text-muted">Aucune catégorie</div>
        : (
          <table className="w-full">
            <thead><tr className="border-b border-border bg-surface-secondary">
              <th className="text-left text-xs font-semibold text-text-muted px-5 py-3">Ordre</th>
              <th className="text-left text-xs font-semibold text-text-muted px-5 py-3">Nom</th>
              <th className="text-left text-xs font-semibold text-text-muted px-5 py-3">Slug</th>
              <th className="text-left text-xs font-semibold text-text-muted px-5 py-3">Icône</th>
              <th className="text-right text-xs font-semibold text-text-muted px-5 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface-secondary/50">
                  <td className="px-5 py-3.5 text-sm text-text-muted">{c.ordre}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-text-primary">{c.nom}</td>
                  <td className="px-5 py-3.5"><code className="text-xs bg-surface-tertiary px-2 py-1 rounded">{c.slug}</code></td>
                  <td className="px-5 py-3.5 text-sm text-text-muted">{c.icone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(c)} className="p-2 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
