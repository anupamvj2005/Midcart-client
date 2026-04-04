import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiFilter, FiX } from 'react-icons/fi'
import api from '../../utils/api'
import ProductCard from './ProductCard'
import styles from './Products.module.css'

const CATEGORIES = [
  { slug: '', label: 'All Categories' },
  { slug: 'Fever & Cold', label: 'Fever & Cold' },
  { slug: 'Diabetes', label: 'Diabetes' },
  { slug: 'Heart Care', label: 'Heart Care' },
  { slug: 'Vitamins', label: 'Vitamins' },
  { slug: 'Antibiotics', label: 'Antibiotics' },
  { slug: 'Pain Relief', label: 'Pain Relief' },
  { slug: 'Skin Care', label: 'Skin Care' },
  { slug: 'Digestive', label: 'Digestive' },
  { slug: 'Eye & Ear', label: 'Eye & Ear' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const sort = searchParams.get('sort') || '-createdAt'
  const requiresRx = searchParams.get('rx') || ''

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (requiresRx) params.set('requiresPrescription', requiresRx)
    params.set('page', page)
    params.set('sort', sort)
    params.set('limit', '12')

    api.get(`/medicines?${params}`)
      .then(({ data }) => {
        setProducts(data?.products || [])
        setPagination(data?.pagination || {})
      })
      .catch((err) => {
        console.error("Error fetching products", err)
        setProducts([])
        setPagination({})
      })
      .finally(() => setLoading(false))
  }, [search, category, page, sort, requiresRx])

  const updateParam = (key, value) => {
    const np = new URLSearchParams(searchParams)
    if (value) np.set(key, value)
    else np.delete(key)
    np.delete('page')
    setSearchParams(np)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  const hasFilters = category || requiresRx || search

  return (
    <div className="page">
      <div className="container">
        <div className={styles.layout}>

          {/* ─── Sidebar Filters ─── */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3>Filters</h3>
              {hasFilters && (
                <button className={styles.clearBtn} onClick={clearFilters}><FiX /> Clear All</button>
              )}
              <button className={styles.closeFilters} onClick={() => setShowFilters(false)}><FiX /></button>
            </div>

            {/* Categories */}
            <div className={styles.filterGroup}>
              <h4>Category</h4>
              {CATEGORIES?.map(cat => (
                <label key={cat.slug} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.slug}
                    onChange={() => updateParam('category', cat.slug)}
                  />
                  {cat.label}
                </label>
              ))}
            </div>

            {/* Prescription */}
            <div className={styles.filterGroup}>
              <h4>Prescription</h4>
              <label className={styles.filterOption}>
                <input type="radio" name="rx" checked={requiresRx === ''} onChange={() => updateParam('rx', '')} />
                All Medicines
              </label>
              <label className={styles.filterOption}>
                <input type="radio" name="rx" checked={requiresRx === 'false'} onChange={() => updateParam('rx', 'false')} />
                OTC (No Rx needed)
              </label>
              <label className={styles.filterOption}>
                <input type="radio" name="rx" checked={requiresRx === 'true'} onChange={() => updateParam('rx', 'true')} />
                Prescription only
              </label>
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <main className={styles.main}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <button className={styles.filterToggle} onClick={() => setShowFilters(true)}>
                  <FiFilter /> Filters
                </button>
                {search && <span className={styles.searchTag}>"{search}" <button onClick={() => updateParam('search', '')}>×</button></span>}
                {category && <span className={styles.searchTag}>{category} <button onClick={() => updateParam('category', '')}>×</button></span>}
              </div>
              <div className={styles.toolbarRight}>
                <span className={styles.resultCount}>{pagination.total || 0} results</span>
                <select
                  className="input"
                  style={{ width: 'auto', fontSize: '0.85rem', padding: '6px 10px' }}
                  value={sort}
                  onChange={e => updateParam('sort', e.target.value)}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="price.selling">Price: Low to High</option>
                  <option value="-price.selling">Price: High to Low</option>
                  <option value="-salesCount">Best Selling</option>
                  <option value="-ratings.average">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                <div style={{ fontSize: '3rem' }}>💊</div>
                <h3>No medicines found</h3>
                <p>Try different keywords or clear filters</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="grid-products">
                {products?.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === page ? styles.pageActive : ''}`}
                    onClick={() => {
                      const np = new URLSearchParams(searchParams)
                      np.set('page', p)
                      setSearchParams(np)
                    }}
                  >{p}</button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
