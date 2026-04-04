import { create } from 'zustand'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { computeCouponDiscount, cartSubtotal } from '../utils/pricing'

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      const { data } = await api.get('/cart')
      set({ cart: data.cart })
    } catch (err) {
      console.error('Cart fetch error:', err)
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/cart', { productId, quantity })
      set({ cart: data.cart, loading: false })
      toast.success('Added to cart!')
    } catch (err) {
      set({ loading: false })
      toast.error(err.response?.data?.message || 'Failed to add to cart')
      throw err
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity })
      set({ cart: data.cart })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart')
    }
  },

  removeItem: async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`)
      set({ cart: data.cart })
      toast.success('Item removed')
    } catch (err) {
      toast.error('Failed to remove item')
    }
  },

  clearCart: async () => {
    try {
      await api.delete('/cart')
      set({ cart: null })
    } catch (err) {
      console.error(err)
    }
  },

  applyCoupon: async (code) => {
    try {
      const { data } = await api.post('/cart/coupon', { code })
      set({ cart: data.cart })
      const sub = cartSubtotal(data.cart?.items)
      const saved = computeCouponDiscount(sub, data.coupon)
      toast.success(saved > 0 ? `Coupon applied! You save ₹${saved.toFixed(0)}` : 'Coupon applied!')
      return data.coupon
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon')
      throw err
    }
  },

  get itemCount() {
    return get().cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0
  },

  get totals() {
    const items = get().cart?.items || []
    const subtotal = cartSubtotal(items)
    const discount = computeCouponDiscount(subtotal, get().cart?.coupon)
    const deliveryCharge = subtotal > 199 ? 0 : 49
    const total = subtotal - discount + deliveryCharge
    return { subtotal, discount, deliveryCharge, total }
  },
}))

export default useCartStore
