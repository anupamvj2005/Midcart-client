import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../../utils/api'
import styles from './Admin.module.css'

export default function AdminAnalytics() {
  const [revenue7, setRevenue7] = useState([])
  const [revenue30, setRevenue30] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/revenue?period=7'),
      api.get('/analytics/revenue?period=30'),
      api.get('/analytics/categories'),
    ]).then(([r7, r30, c]) => {
      setRevenue7(r7.data.data); setRevenue30(r30.data.data); setCategories(c.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <h1 className={styles.pageTitle}>Analytics</h1>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}><h3>Revenue — Last 7 Days</h3></div>
          <div style={{ padding:20 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue7}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="_id" tick={{ fontSize:11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize:11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}><h3>Revenue — Last 30 Days</h3></div>
          <div style={{ padding:20 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenue30}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="_id" tick={{ fontSize:11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize:11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}><h3>Sales by Category</h3></div>
        <div style={{ padding:20 }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize:11 }} tickFormatter={v => `₹${v}`} />
              <YAxis dataKey="_id" type="category" tick={{ fontSize:11 }} width={100} />
              <Tooltip formatter={v => [`₹${v?.toFixed(0)}`, 'Revenue']} />
              <Bar dataKey="totalRevenue" fill="var(--primary)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
