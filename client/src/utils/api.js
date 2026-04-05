import axios from 'axios'

// Global API Config ensuring deployed backend URL is robust and correctly targeted
const API = import.meta.env.VITE_API_URL || 'https://midcart-1-4efg.onrender.com'

console.log("API URL:", API);

const api = axios.create({
  baseURL: `${API}/api`,
  timeout: 15000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
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
