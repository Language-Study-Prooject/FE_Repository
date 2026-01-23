import axios from 'axios'

// Bedrock/Polly 사용으로 응답 시간(timeout) 제한 늘림
const speakingApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000, // 30초 
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - JWT 토큰 자동 추가
speakingApi.interceptors.request.use(
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

// Response interceptor - 401 에러 처리 및 데이터 추출
speakingApi.interceptors.response.use(
    (response) => response.data, // response.data를 바로 반환하도록 설정
    (error) => {
        console.error('Speaking API Error:', error.response?.data || error.message)

        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken')
            window.location.href = '/login'
        }

        return Promise.reject(error)
    }
)

export default speakingApi