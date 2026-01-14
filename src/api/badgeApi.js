import axios from 'axios'

const badgeApi = axios.create({
  baseURL: import.meta.env.VITE_BADGE_API_URL || import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for JWT token
badgeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
badgeApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Badge API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default badgeApi
