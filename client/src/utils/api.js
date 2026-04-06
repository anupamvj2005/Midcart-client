import axios from 'axios'

// 1. Grab the URL from Vercel (or use the fallback)
// 2. The .replace(/\/$/, "") safely removes any accidental trailing slash
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://midcart-backend.onrender.com').replace(/\/$/, "");

console.log("Clean API URL:", API_BASE_URL);

// 3. Create the Axios instance. 
// This will safely resolve to: https://midcart-backend.onrender.com/api
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sp_token')
      localStorage.removeItem('sp_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api