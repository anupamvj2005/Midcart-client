import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

const STATUS_OPTIONS = ['placed','confirmed','processing','shipped','delivered','cancelled']
const STATUS_COLORS = { placed:'badge-blue', confirmed:'badge-blue', processing:'badge-orange', shipped:'badge-orange', delivered:'badge-green', cancelled:'badge-red' }

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetch = () => {
    setLoading(true)
    api.get(`/orders${statusFilter ? `?status=${statusFilter}` : ''}`)
      .then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status })
      toast.success('Status updated')
      fetch()
    } catch { toast.error('Failed to update') }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Orders</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign:'center', padding:32 }}><div className="spinner" style={{ margin:'auto' }} /></td></tr>
            : orders?.map(o => (
              <tr key={o._id}>
                <td style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{o.orderNumber}</td>
                <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{o.user?.name || '—'}</td>
                <td>{o.items?.length} item(s)</td>
                <td>₹{o.pricing?.total?.toFixed(2)}</td>
                <td><span className="badge badge-gray">{o.payment?.method?.toUpperCase()}</span></td>
                <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                <td>
                  <select className="input" style={{ fontSize:'0.78rem', padding:'4px 8px', width:'auto' }}
                    value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
