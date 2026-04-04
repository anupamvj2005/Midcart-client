import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUpload, FiEye, FiClock, FiCheck, FiX } from 'react-icons/fi'
import api from '../../utils/api'
import styles from './Prescription.module.css'

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', icon: <FiClock size={14} />, badge: 'badge-orange' },
  verified: { label: 'Verified', icon: <FiCheck size={14} />, badge: 'badge-green' },
  rejected: { label: 'Rejected', icon: <FiX size={14} />, badge: 'badge-red' },
  expired: { label: 'Expired', icon: <FiClock size={14} />, badge: 'badge-gray' },
}

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/prescriptions/my')
      .then(({ data }) => setPrescriptions(data?.prescriptions || []))
      .catch((err) => {
        console.error("Failed to fetch my prescriptions", err)
        setPrescriptions([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>My Prescriptions</h1>
          <Link to="/prescriptions/upload" className="btn btn-primary">
            <FiUpload size={15} /> Upload New
          </Link>
        </div>

        {prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📄</div>
            <h3>No prescriptions yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Upload your first prescription to get started</p>
            <Link to="/prescriptions/upload" className="btn btn-primary">Upload Prescription</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prescriptions?.map(rx => {
              const cfg = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending
              return (
                <div key={rx._id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      {/* Thumbnail */}
                      {rx.images?.[0] && (
                        <img src={rx.images[0].url} alt="Prescription"
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span className={`badge ${cfg.badge}`} style={{ marginBottom: 8 }}>{cfg.icon} {cfg.label}</span>
                            <h4 style={{ fontWeight: 700 }}>Prescription #{rx._id?.slice(-6).toUpperCase()}</h4>
                            {rx.doctorName && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dr. {rx.doctorName}</p>}
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              Uploaded: {new Date(rx.createdAt).toLocaleDateString('en-IN')} •
                              Valid until: {new Date(rx.validUntil).toLocaleDateString('en-IN')}
                            </p>
                            {rx.analysisStatus && rx.analysisStatus !== 'unavailable' && (
                              <p style={{ fontSize: '0.78rem', marginTop: 6, color: 'var(--primary)' }}>
                                AI scan: {rx.analysisStatus === 'completed' ? 'Matched to catalog' : 'Partial match'}
                              </p>
                            )}
                            {rx.analysisNote && (
                              <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-muted)' }}>{rx.analysisNote}</p>
                            )}
                          </div>
                        </div>

                        {/* Extracted medicines */}
                        {rx.extractedMedicines?.length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected (with confidence)</p>
                             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {rx.extractedMedicines?.map((m, i) => (
                                <span key={i} className="badge badge-blue" title={m.matchedProduct?.name ? `→ ${m.matchedProduct.name}` : 'No store match'}>
                                  {m.name} {typeof m.confidence === 'number' ? `(${Math.round(m.confidence * 100)}%)` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rx.status === 'rejected' && rx.rejectionReason && (
                          <div style={{ marginTop: 8, background: '#fff5f5', borderRadius: 6, padding: '6px 12px', fontSize: '0.82rem', color: 'var(--danger)' }}>
                            Reason: {rx.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
