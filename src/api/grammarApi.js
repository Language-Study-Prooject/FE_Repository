import axios from 'axios'

const grammarApi = axios.create({
  baseURL: import.meta.env.VITE_GRAMMAR_API_URL || import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
grammarApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
grammarApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Grammar API Error:', error.response?.data || error.message)

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default grammarApi
