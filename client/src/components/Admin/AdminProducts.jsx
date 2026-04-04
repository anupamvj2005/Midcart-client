import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import styles from './Admin.module.css'

const EMPTY_PRODUCT = {
  name: '', genericName: '', brand: '', category: 'fever-cold', description: '',
  'price.mrp': '', 'price.selling': '', 'stock.quantity': '', requiresPrescription: false,
  manufacturer: '', composition: '', dosage: '', expiryDate: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    api.get(`/products?limit=50${search ? `&search=${search}` : ''}`)
      .then(({ data }) => setProducts(data?.products || []))
      .catch((err) => {
        console.error("Failed to fetch products", err)
        setProducts([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [search])

  const openCreate = () => { setEditing(null); setForm(EMPTY_PRODUCT); setShowModal(true) }
  const openEdit = (p) => {
    setEditing(p._id)
    setForm({
      name: p.name, genericName: p.genericName || '', brand: p.brand || '',
      category: p.category, description: p.description || '',
      'price.mrp': p.price?.mrp, 'price.selling': p.price?.selling,
      'stock.quantity': p.stock?.quantity, requiresPrescription: p.requiresPrescription,
      manufacturer: p.manufacturer || '', composition: p.composition || '',
      dosage: p.dosage || '', expiryDate: p.expiryDate?.slice(0, 10) || '',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name, genericName: form.genericName, brand: form.brand,
        category: form.category, description: form.description,
        price: { mrp: Number(form['price.mrp']), selling: Number(form['price.selling']) },
        stock: { quantity: Number(form['stock.quantity']) },
        requiresPrescription: form.requiresPrescription,
        manufacturer: form.manufacturer, composition: form.composition,
        dosage: form.dosage, expiryDate: form.expiryDate || undefined,
      }
      if (editing) { await api.put(`/products/${editing}`, payload) } 
      else { await api.post('/products', payload) }
      toast.success(editing ? 'Product updated!' : 'Product created!')
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return
    await api.delete(`/products/${id}`)
    toast.success('Product deactivated')
    fetchProducts()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Product</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input type="text" className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
      </div>

      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>MRP</th><th>Price</th><th>Stock</th><th>Rx</th><th>Expiry</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: 'auto' }} /></td></tr>
            ) : products?.map(p => {
              const isLow = p.stock?.quantity <= p.stock?.lowStockThreshold
              const expiry = p.expiryDate ? new Date(p.expiryDate) : null
              const isNearExpiry = expiry && (expiry - new Date()) < 30 * 24 * 60 * 60 * 1000
              return (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                  <td><span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{p.category}</span></td>
                  <td>₹{p.price?.mrp}</td>
                  <td>₹{p.price?.selling}</td>
                  <td>
                    <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>
                      {isLow && <FiAlertTriangle size={11} />} {p.stock?.quantity}
                    </span>
                  </td>
                  <td>{p.requiresPrescription ? <span className="badge badge-orange">Yes</span> : <span className="badge badge-gray">No</span>}</td>
                  <td style={{ fontSize: '0.8rem', color: isNearExpiry ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {expiry ? expiry.toLocaleDateString('en-IN') : '—'}
                    {isNearExpiry && ' ⚠️'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}><FiEdit2 size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.name)}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { key: 'name', label: 'Name*', type: 'text', full: true },
                { key: 'genericName', label: 'Generic Name', type: 'text' },
                { key: 'brand', label: 'Brand', type: 'text' },
                { key: 'category', label: 'Category', type: 'select' },
                { key: 'price.mrp', label: 'MRP (₹)*', type: 'number' },
                { key: 'price.selling', label: 'Selling Price (₹)*', type: 'number' },
                { key: 'stock.quantity', label: 'Stock Qty*', type: 'number' },
                { key: 'expiryDate', label: 'Expiry Date', type: 'date' },
                { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
                { key: 'dosage', label: 'Dosage Instructions', type: 'text' },
                { key: 'composition', label: 'Composition', type: 'text', full: true },
                { key: 'description', label: 'Description', type: 'text', full: true },
              ].map(f => (
                <div key={f.key} className="form-group" style={f.full ? { gridColumn: '1/-1' } : {}}>
                  <label className="form-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="input" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      {['fever-cold','diabetes','heart','vitamins','antibiotics','pain-relief','skin','digestive','eye-ear','other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={f.type} className="input" value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
              <label style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem' }}>
                <input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm({ ...form, requiresPrescription: e.target.checked })} />
                Requires Prescription
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
