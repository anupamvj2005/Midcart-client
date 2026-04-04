import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import styles from './Admin.module.css'

export default function AdminPrescriptions() {
  const [rxs, setRxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const fetch = () => {
    setLoading(true)
    api.get(`/prescriptions?status=${filter}`)
      .then(({ data }) => setRxs(data?.prescriptions || []))
      .catch((err) => {
        console.error("Failed to fetch prescriptions", err)
        setRxs([])
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [filter])

  const handle = async (id, status, reason) => {
    try {
      await api.put(`/prescriptions/${id}/verify`, { status, rejectionReason: reason })
      toast.success(`Prescription ${status}`)
      fetch()
    } catch { toast.error('Action failed') }
  }

  return (
    <div>
      <h1 className={styles.pageTitle}>Prescriptions</h1>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {['pending','verified','rejected'].map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : rxs.length === 0 ? (
          <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>No {filter} prescriptions</div>
        ) : rxs?.map(rx => (
          <div key={rx._id} className="card">
            <div className="card-body" style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
              {rx.images?.[0] && <img src={rx.images[0].url} alt="Rx" style={{ width:80, height:80, objectFit:'cover', borderRadius:8 }} />}
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700 }}>#{rx._id?.slice(-6).toUpperCase()} — {rx.user?.name} ({rx.user?.email})</p>
                <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>{new Date(rx.createdAt).toLocaleString('en-IN')}</p>
                {rx.extractedMedicines?.length > 0 && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:6 }}>
                    {rx.extractedMedicines?.map((m,i) => <span key={i} className="badge badge-blue">{m.name}</span>)}
                  </div>
                )}
              </div>
              {filter === 'pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handle(rx._id,'verified')}>✓ Verify</button>
                  <button className="btn btn-danger btn-sm" onClick={() => { const r = prompt('Rejection reason:'); if(r) handle(rx._id,'rejected',r) }}>✗ Reject</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
