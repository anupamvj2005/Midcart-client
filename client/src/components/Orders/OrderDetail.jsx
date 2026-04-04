import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, X, Check, Package, MapPin, CreditCard, Receipt, FileText, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import SafeProductImage from '../Products/SafeProductImage'

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data?.order || null))
      .catch((err) => {
        console.error("Failed to fetch order", err)
        setOrder(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' })
      setOrder(data.order)
      toast.success('Order cancelled successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order')
    } finally { setCancelling(false) }
  }

  if (loading) return (
    <div className="pt-24 min-h-screen flex justify-center py-20 bg-gray-50">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
  if (!order) return <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50"><p className="text-xl text-gray-500 font-medium">Order not found</p></div>

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="pt-[72px] pb-24 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/orders')} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to My Orders
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Order #{order.orderNumber}</h1>
            <p className="text-gray-500 font-medium">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {['placed', 'confirmed'].includes(order.status) && (
            <button 
              onClick={handleCancel} 
              disabled={cancelling}
              className="flex items-center justify-center gap-2 bg-white border border-red-200 text-danger px-6 py-2.5 rounded-lg font-bold hover:bg-red-50 transition-colors disabled:opacity-50 shadow-sm"
            >
              <X size={18} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 font-bold mb-8 shadow-sm">
            <X size={24} className="bg-white rounded-full p-1 text-danger" /> 
            This order has been cancelled.
          </div>
        )}

        {/* Vertical Stepper Tracker (Swiggy / Zomato style) */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
            <h3 className="font-bold text-gray-900 text-lg mb-8 flex items-center gap-2"><Package size={20} className="text-primary"/> Order Tracking</h3>
            <div className="relative border-l-2 border-gray-100 ml-5 space-y-8">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStep;
                const isPast = i < currentStep;
                
                return (
                  <div key={step} className={`relative flex items-center gap-6 ${!isActive ? 'opacity-40' : ''}`}>
                    <div className={`absolute -left-[17px] w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm ${
                      isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isPast ? <Check size={16} /> : i + 1}
                    </div>
                    <div>
                      <h4 className={`font-bold capitalize text-lg ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step}</h4>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {step === 'placed' && 'We have received your order.'}
                        {step === 'confirmed' && 'Your order has been confirmed by the pharmacy.'}
                        {step === 'processing' && 'Items are being packed securely.'}
                        {step === 'shipped' && 'Order is out for delivery.'}
                        {step === 'delivered' && 'Order has been delivered successfully!'}
                      </p>
                    </div>
                  </div>
                )
              })}
              
              {/* Dynamic Progress Line Overlay */}
              <div 
                className="absolute top-0 left-[-2px] w-0.5 bg-primary transition-all duration-700 ease-in-out" 
                style={{ height: `${Math.max(0, currentStep) * 25}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* Order Items */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <h3 className="font-bold text-gray-900 text-lg p-6 border-b border-gray-100 flex items-center gap-2">
                <FileText size={20} className="text-primary" /> Order Items
              </h3>
              
              <ul className="divide-y divide-gray-100">
                {order.items?.map((item, i) => (
                  <li key={i} className="p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-20 h-20 rounded-xl border border-gray-100 p-2 bg-gray-50 flex shrink-0 items-center justify-center">
                      <SafeProductImage src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <Link to={`/products/${item.product}`} className="font-bold text-gray-900 text-lg hover:text-primary transition-colors line-clamp-2">{item.name}</Link>
                        <span className="font-extrabold text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium mt-1">Qty: {item.quantity}</p>
                      <p className="text-xs text-gray-400 mt-1">₹{item.price} each</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar Data */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Bill Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <h3 className="font-bold text-gray-900 text-lg p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <Receipt size={20} className="text-primary" /> Payment Summary
              </h3>
              <div className="p-6 space-y-4 text-sm font-medium text-gray-600">
                 <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-900">₹{order.pricing?.subtotal?.toFixed(2)}</span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>−₹{order.pricing?.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {order.pricing?.deliveryCharge === 0 ? (
                    <span className="text-primary font-bold">FREE</span>
                  ) : (
                    <span className="text-gray-900">₹{order.pricing?.deliveryCharge}</span>
                  )}
                </div>
                
                <div className="border-t border-gray-100 rounded my-2"></div>
                
                <div className="flex justify-between items-center text-lg font-extrabold text-gray-900">
                  <span>Grand Total</span>
                  <span>₹{order.pricing?.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary" /> Delivery Details
              </h3>
              <div className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900 mb-1 text-base">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p className="mb-2">PIN: {order.shippingAddress?.pincode}</p>
                <p className="text-gray-900">Phone: {order.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Payment Method
              </h3>
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="uppercase text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                  {order.payment?.method}
                </span>
                {order.payment?.status === 'completed' || order.payment?.status === 'success' ? (
                  <span className="flex items-center gap-1 text-primary bg-green-50 px-3 py-1.5 rounded-lg font-bold border border-green-100">
                    <CheckCircle2 size={16} /> Paid
                  </span>
                ) : (
                  <span className="uppercase text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg font-bold border border-yellow-100">
                    {order.payment?.status}
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
