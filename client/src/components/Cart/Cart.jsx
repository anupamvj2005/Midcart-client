import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, FileText, ChevronRight, CheckCircle2, Ticket, ShieldCheck } from 'lucide-react'
import useCartStore from '../../context/cartStore'
import { computeCouponDiscount, cartSubtotal } from '../../utils/pricing'
import SafeProductImage from '../Products/SafeProductImage'
import { productPrimaryImageUrl } from '../../utils/productImage'

export default function Cart() {
  const { cart, fetchCart, updateQuantity, removeItem, applyCoupon } = useCartStore()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  useEffect(() => { fetchCart() }, [])

  const items = cart?.items || []
  const subtotal = cartSubtotal(items)
  const discount = computeCouponDiscount(subtotal, cart?.coupon)
  const deliveryCharge = subtotal > 199 ? 0 : (subtotal > 0 ? 49 : 0)
  const total = subtotal - discount + deliveryCharge

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try { await applyCoupon(couponInput) }
    catch (e) {}
    finally { setCouponLoading(false) }
  }

  const rxRequired = items.some(i => i.prescriptionRequired)

  if (items.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add medicines and healthcare products to get started.</p>
          <Link to="/products" className="bg-primary text-white hover:bg-primary-dark px-8 py-3.5 rounded-xl font-bold transition-colors w-full block shadow-lg shadow-primary/20">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[72px] pb-24 lg:pb-12 min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Cart <span className="text-lg font-medium text-gray-500 font-normal">({items.length} items)</span></h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {rxRequired && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm mb-6">
                <AlertCircle size={24} className="text-brandBlue shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Prescription required for some items</h4>
                  <p className="text-sm text-gray-600">
                    You've added presciption medicines to your cart. Please <Link to="/prescriptions/upload" className="text-brandBlue font-bold underline hover:text-blue-800">upload your prescription</Link> to proceed.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Items in Cart</h3>
                <span className="text-sm font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const product = item.product
                  if (!product) return null
                  return (
                    <li key={item._id || product._id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                      {/* Img */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white border border-gray-100 rounded-xl p-2 flex items-center justify-center">
                        <SafeProductImage
                          src={productPrimaryImageUrl(product)}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <Link to={`/products/${product._id}`} className="font-bold text-gray-900 hover:text-primary transition-colors text-lg line-clamp-2">
                            {product.name}
                          </Link>
                          <div className="text-right shrink-0">
                            <p className="font-extrabold text-lg text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-gray-400 font-medium">₹{item.price} / item</p>
                          </div>
                        </div>

                        {item.prescriptionRequired && (
                          <div className="flex items-center gap-1 bg-blue-50 text-brandBlue w-fit px-2 py-0.5 rounded textxs font-bold mt-1">
                            <FileText size={12} /> <span className="text-[10px] uppercase tracking-wider">Rx Required</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <button 
                              onClick={() => updateQuantity(product._id, item.quantity - 1)} 
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(product._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeItem(product._id)}
                            className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-danger transition-colors px-2 py-1 rounded-md hover:bg-red-50"
                          >
                            <Trash2 size={16} /> <span className="hidden sm:block">Remove</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            
            {/* Coupon Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Ticket size={20} className="text-primary" /> Apply Coupon
              </h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter code (e.g. FIRST20)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="bg-gray-900 text-white px-5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              
              {cart?.coupon?.code && (
                <div className="bg-green-50 text-primary-dark p-3 rounded-xl flex items-center gap-3 text-sm border border-green-100 mt-4">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <div className="flex-1 font-medium">
                    Code <strong>{cart.coupon.code}</strong> applied!<br/>
                    <span className="text-xs text-green-600">You saved ₹{discount}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">Available coupons: <strong>FIRST20</strong>, <strong>SAVE50</strong>, <strong>HEALTH10</strong></p>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Bill Summary</h3>
              
              <div className="space-y-4 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Coupon Discount</span>
                    <span>−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-primary font-bold">FREE</span>
                  ) : (
                    <span className="text-gray-900">₹{deliveryCharge.toFixed(2)}</span>
                  )}
                </div>
              </div>
              
              {subtotal > 0 && subtotal <= 199 && (
                <div className="bg-blue-50 text-brandBlue text-xs font-bold p-3 rounded-lg mt-4 border border-blue-100 flex items-center gap-2">
                  <span className="animate-pulse">✨</span> Add ₹{(199 - subtotal + 1).toFixed(0)} more for FREE delivery!
                </div>
              )}

              <div className="border-t border-gray-100 my-4"></div>
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="font-bold text-gray-900 text-lg">To Pay</span>
                  {discount > 0 && <p className="text-xs text-primary font-bold">Total Savings: ₹{discount}</p>}
                </div>
                <span className="font-extrabold text-2xl text-gray-900">₹{total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                Proceed to Checkout <ChevronRight size={20} />
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                <ShieldCheck size={14} /> 100% Safe Payments
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
