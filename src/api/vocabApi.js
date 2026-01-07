import axios from 'axios'

const vocabApi = axios.create({
  baseURL: import.meta.env.VITE_VOCAB_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
vocabApi.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
vocabApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Vocab API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default vocabApi
