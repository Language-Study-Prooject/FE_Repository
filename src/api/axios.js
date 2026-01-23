import axios from 'axios'
import { fetchAuthSession, signOut } from 'aws-amplify/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        try {

            const token = localStorage.getItem('accessToken')

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            return config
        } catch (error) {
            return config
        }
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config

        // 401 에러 && 재시도하지 않을 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // 토큰 갱신 시도
                const session = await fetchAuthSession({ forceRefresh: true })
                const newToken = session.tokens?.accessToken?.toString()

                if (newToken) {
                    localStorage.setItem('accessToken', newToken)
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                try {
                    await signOut()
                } catch (e) {
                    console.error('[Axios] Sign out error:', e)
                }

                localStorage.removeItem('accessToken')

                // 로그인 페이지로 리다이렉트 (무한 루프 방지)
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }
        }
        return Promise.reject(error)
    }
)

export default api
