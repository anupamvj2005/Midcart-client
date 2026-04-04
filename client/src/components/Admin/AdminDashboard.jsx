import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FiShoppingBag, FiDollarSign, FiUsers, FiAlertTriangle } from 'react-icons/fi'
import api from '../../utils/api'
import styles from './Admin.module.css'

const PIE_COLORS = ['#00a651', '#4299e1', '#f6ad55', '#f56565', '#9f7aea', '#48bb78', '#ed8936', '#38b2ac']

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary').catch(() => ({ data: { summary: null } })),
      api.get('/analytics/revenue?period=30').catch(() => ({ data: { data: [] } })),
      api.get('/analytics/top-products').catch(() => ({ data: { products: [] } })),
      api.get('/analytics/categories').catch(() => ({ data: { data: [] } })),
    ]).then(([s, r, tp, c]) => {
      setSummary(s?.data?.summary || null)
      setRevenue(r?.data?.data || [])
      setTopProducts(tp?.data?.products || [])
      setCategories(c?.data?.data || [])
    }).catch(err => console.error("Error loading dashboard", err)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const stats = summary ? [
    {
      label: 'Total Orders', value: summary.orders.total,
      sub: `+${summary.orders.thisMonth} this month`,
      icon: <FiShoppingBag size={36} />, color: '#4299e1',
    },
    {
      label: 'Total Revenue', value: `₹${(summary.revenue.total / 1000).toFixed(1)}K`,
      sub: `₹${summary.revenue.thisMonth?.toFixed(0)} this month`,
      icon: <FiDollarSign size={36} />, color: '#00a651',
    },
    {
      label: 'Total Users', value: summary.users.total,
      sub: `+${summary.users.newThisMonth} new`,
      icon: <FiUsers size={36} />, color: '#9f7aea',
    },
    {
      label: 'Alerts', value: summary.inventory.lowStock + summary.inventory.nearExpiry,
      sub: `${summary.inventory.lowStock} low stock, ${summary.inventory.nearExpiry} expiring`,
      icon: <FiAlertTriangle size={36} />, color: '#f56565',
    },
  ] : []

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statGrowth}><span style={{ color: 'var(--text-muted)' }}>{s.sub}</span></div>
            <div className={styles.statIcon} style={{ color: s.color }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}><h3>Revenue (Last 30 Days)</h3></div>
          <div style={{ padding: 20 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} labelFormatter={l => `Date: ${l}`} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}><h3>Sales by Category</h3></div>
          <div style={{ padding: 20 }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories} dataKey="totalRevenue" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id }) => _id}>
                  {categories?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`₹${v?.toFixed(0)}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h3>Top Selling Medicines</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Medicine</th><th>Category</th><th>Price</th><th>Units Sold</th>
            </tr>
          </thead>
          <tbody>
            {topProducts?.map((p, i) => (
              <tr key={p._id}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                <td><span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{p.category}</span></td>
                <td>₹{p.price?.selling}</td>
                <td><strong>{p.salesCount}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
