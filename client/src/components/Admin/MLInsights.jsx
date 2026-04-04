import { useState, useEffect } from 'react'
import api from '../../utils/api'
import styles from './Admin.module.css'

export default function MLInsights() {
  const [expiryRisk, setExpiryRisk] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/ml/expiry-risk').catch(() => ({ data: null })),
      api.get('/ml/inventory-suggestions').catch(() => ({ data: null })),
    ]).then(([e, inv]) => {
      setExpiryRisk(e.data); setInventory(inv.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  const RISK_COLORS = { HIGH:'badge-red', MEDIUM:'badge-orange', LOW:'badge-green', EXPIRED:'badge-red' }
  const PRIORITY_COLORS = { CRITICAL:'badge-red', HIGH:'badge-orange', MEDIUM:'badge-blue', LOW:'badge-green' }

  return (
    <div>
      <h1 className={styles.pageTitle}>ML Insights</h1>
      <p style={{ color:'var(--text-muted)', marginBottom:24 }}>AI-powered inventory intelligence — expiry risk, reorder suggestions & demand signals.</p>

      {expiryRisk && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'flex', gap:16, marginBottom:16, flexWrap:'wrap' }}>
            {[
              { label:'Products Analyzed', value:expiryRisk.total_products_analyzed, color:'var(--info)' },
              { label:'High Risk', value:expiryRisk.high_risk_count, color:'var(--danger)' },
              { label:'Medium Risk', value:expiryRisk.medium_risk_count, color:'var(--warning)' },
            ].map(s => (
              <div key={s.label} className={styles.statCard} style={{ flex:1, minWidth:160 }}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue} style={{ color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className={styles.tableWrap}>
            <div className={styles.tableHeader}><h3>⚠️ Expiry Risk Analysis</h3></div>
            <table>
              <thead><tr><th>Medicine</th><th>Days Left</th><th>Stock</th><th>Risk Score</th><th>Risk Level</th><th>Recommendation</th></tr></thead>
              <tbody>
                {expiryRisk.products?.slice(0,15)?.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.name}</td>
                    <td>{p.days_to_expiry}</td>
                    <td>{p.stock}</td>
                    <td><div style={{ width:60, background:'var(--border)', borderRadius:99, height:6 }}><div style={{ width:`${p.risk_score}%`, background:p.risk_level==='HIGH'?'var(--danger)':'var(--warning)', height:6, borderRadius:99 }} /></div></td>
                    <td><span className={`badge ${RISK_COLORS[p.risk_level]||'badge-gray'}`}>{p.risk_level}</span></td>
                    <td style={{ fontSize:'0.8rem', maxWidth:200 }}>{p.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inventory && (
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <h3>📦 Inventory Optimization Suggestions</h3>
            <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{inventory.summary}</span>
          </div>
          <table>
            <thead><tr><th>Medicine</th><th>Current Stock</th><th>Status</th><th>Priority</th><th>Reorder Qty (EOQ)</th><th>Action</th></tr></thead>
            <tbody>
              {inventory.suggestions?.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.name}</td>
                  <td>{s.current_stock}</td>
                  <td><span className="badge badge-gray" style={{ fontSize:'0.72rem' }}>{s.status}</span></td>
                  <td><span className={`badge ${PRIORITY_COLORS[s.priority]||'badge-gray'}`}>{s.priority}</span></td>
                  <td><strong>{s.recommended_order_qty}</strong></td>
                  <td style={{ fontSize:'0.8rem', maxWidth:220 }}>{s.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!expiryRisk && !inventory && (
        <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>
          <div style={{ fontSize:'3rem', marginBottom:16 }}>🤖</div>
          <h3>ML API not available</h3>
          <p>Make sure the Python Flask ML API is running on port 8000</p>
        </div>
      )}
    </div>
  )
}
