import api from './axios'

// 공통 axios 인스턴스 사용 (토큰 갱신 로직 포함)
// response.data 자동 추출을 위한 래퍼
const badgeApi = {
    get: (url, config) => api.get(url, config).then(res => res.data),
    post: (url, data, config) => api.post(url, data, config).then(res => res.data),
    put: (url, data, config) => api.put(url, data, config).then(res => res.data),
    patch: (url, data, config) => api.patch(url, data, config).then(res => res.data),
    delete: (url, config) => api.delete(url, config).then(res => res.data),
}

export default badgeApi
