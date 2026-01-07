import axios from 'axios'

const chatApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
chatApi.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
chatApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Chat API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default chatApi
