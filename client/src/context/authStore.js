import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('sp_user') || 'null'),
  token: localStorage.getItem('sp_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('sp_token', data.token)
      localStorage.setItem('sp_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Cannot reach API. Start the backend (port 5000) and use npm run dev for the frontend.'
          : err.message) ||
        'Login failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  register: async (name, email, password, phone) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone })
      localStorage.setItem('sp_token', data.token)
      localStorage.setItem('sp_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK' || err.message === 'Network Error'
          ? 'Cannot reach API. Start the backend on port 5000.'
          : err.message) ||
        'Registration failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem('sp_token')
    localStorage.removeItem('sp_user')
    set({ user: null, token: null })
  },

  updateUser: (user) => {
    localStorage.setItem('sp_user', JSON.stringify(user))
    set({ user })
  },

  isAdmin: () => get().user?.role === 'admin',
  isPharmacist: () => ['admin', 'pharmacist'].includes(get().user?.role),
  isLoggedIn: () => !!get().token,
}))

export default useAuthStore
