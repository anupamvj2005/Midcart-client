import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiPackage } from 'react-icons/fi'
import api from '../../utils/api'
import SafeProductImage from '../Products/SafeProductImage'

const STATUS_COLORS = {
  placed: 'badge-blue', confirmed: 'badge-blue', processing: 'badge-orange',
  shipped: 'badge-orange', delivered: 'badge-green', cancelled: 'badge-red', returned: 'badge-gray',
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data?.orders || []))
      .catch((err) => {
        console.error("Failed to fetch my orders", err)
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 28 }}>My Orders</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FiPackage size={48} color="var(--text-muted)" />
            <h3 style={{ marginTop: 16 }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Start shopping to see your orders here</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders?.map(order => (
              <div key={order._id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Order #{order.orderNumber}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {order.items?.slice(0, 3)?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', borderRadius: 6, padding: '4px 8px', fontSize: '0.8rem' }}>
                        <SafeProductImage src={item.image} alt="" className="w-5 h-5 object-contain shrink-0" />
                        <span>{item.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '4px 8px' }}>+{order.items.length - 3} more</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800 }}>₹{order.pricing?.total?.toFixed(2)}</span>
                    <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
