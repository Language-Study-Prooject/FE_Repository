import axios from 'axios'

const vocabApi = axios.create({
    baseURL: import.meta.env.VITE_VOCAB_API_URL || import.meta.env.VITE_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - JWT 토큰 자동 추가
vocabApi.interceptors.request.use(
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

// Response interceptor - 401 에러 시 로그인 페이지로 이동
vocabApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('Vocab API Error:', error.response?.data || error.message)

        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default vocabApi
