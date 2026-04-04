import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import useCartStore from '../../context/cartStore'
import { computeCouponDiscount, cartSubtotal } from '../../utils/pricing'
import useAuthStore from '../../context/authStore'
import styles from './Checkout.module.css'

export default function Checkout() {
  const { cart, fetchCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({ name: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod')

  useEffect(() => { fetchCart() }, [])

  const items = cart?.items || []
  const subtotal = cartSubtotal(items)
  const discount = computeCouponDiscount(subtotal, cart?.coupon)
  const deliveryCharge = subtotal > 199 ? 0 : (subtotal > 0 ? 49 : 0)
  const total = subtotal - discount + deliveryCharge

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderItems = items.map(i => ({
        product: i.product._id || i.product,
        quantity: i.quantity,
      }))
      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: address,
        payment: { method: paymentMethod },
        coupon: cart?.coupon,
      })
      toast.success('Order placed successfully! 🎉')
      navigate(`/orders/${data.order._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>

        {/* Steps */}
        <div className={styles.steps}>
          {['Address', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className={`${styles.step} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepCircle}>{step > i + 1 ? <FiCheck size={14} /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="card">
                <div className="card-body">
                  <h3 className={styles.stepTitle}><FiMapPin /> Delivery Address</h3>
                  <div className={styles.addressForm}>
                    {[
                      { name: 'name', placeholder: 'Full Name', type: 'text' },
                      { name: 'phone', placeholder: 'Phone Number', type: 'tel' },
                      { name: 'street', placeholder: 'Street Address', type: 'text' },
                      { name: 'city', placeholder: 'City', type: 'text' },
                      { name: 'state', placeholder: 'State', type: 'text' },
                      { name: 'pincode', placeholder: 'PIN Code', type: 'text' },
                    ].map(f => (
                      <input key={f.name} type={f.type} placeholder={f.placeholder} className="input"
                        value={address[f.name]} onChange={e => setAddress({ ...address, [f.name]: e.target.value })}
                        required />
                    ))}
                  </div>
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                      if (!address.street || !address.city || !address.pincode) { toast.error('Please fill all address fields'); return }
                      setStep(2)
                    }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="card">
                <div className="card-body">
                  <h3 className={styles.stepTitle}><FiCreditCard /> Payment Method</h3>
                  <div className={styles.paymentOptions}>
                    {[
                      { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', emoji: '💵' },
                      { value: 'online', label: 'Online Payment', desc: 'UPI, Cards, Net Banking (demo)', emoji: '💳' },
                    ].map(opt => (
                      <label key={opt.value} className={`${styles.payOption} ${paymentMethod === opt.value ? styles.paySelected : ''}`}>
                        <input type="radio" name="payment" value={opt.value}
                          checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)} />
                        <span className={styles.payEmoji}>{opt.emoji}</span>
                        <div>
                          <strong>{opt.label}</strong>
                          <p>{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Review Order →</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="card">
                <div className="card-body">
                  <h3 className={styles.stepTitle}>Review Order</h3>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewLabel}>Delivery To</div>
                    <p>{address.name} • {address.phone}</p>
                    <p>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                  </div>
                  <div className={styles.reviewSection}>
                    <div className={styles.reviewLabel}>Payment</div>
                    <p>{paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}</p>
                  </div>
                  <div className={styles.reviewItems}>
                    {items.map(i => (
                      <div key={i.product?._id} className={styles.reviewItem}>
                        <span>{i.product?.name}</span>
                        <span>×{i.quantity}</span>
                        <strong>₹{(i.price * i.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                    <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                      {loading ? 'Placing Order...' : `Place Order — ₹${total.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className={styles.sidebar}>
            <div className="card">
              <div className="card-body">
                <h4 style={{ fontWeight: 700, marginBottom: 16 }}>Order Summary</h4>
                {items.map(i => (
                  <div key={i.product?._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{i.product?.name} ×{i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="divider" />
                {[
                  { label: 'Subtotal', value: `₹${subtotal.toFixed(2)}` },
                  ...(discount > 0 ? [{ label: 'Discount', value: `-₹${discount}`, color: 'var(--primary)' }] : []),
                  { label: 'Delivery', value: deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem', color: r.color || 'var(--text-secondary)' }}>
                    <span>{r.label}</span><span>{r.value}</span>
                  </div>
                ))}
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem' }}>
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
