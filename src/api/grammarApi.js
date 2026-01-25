import api from './axios'

// 공통 axios 인스턴스 사용 (토큰 갱신 로직 포함)
// Grammar API는 AI 처리로 인해 timeout 30초 필요
const GRAMMAR_TIMEOUT = 30000

const grammarApi = {
    get: (url, config) => api.get(url, { timeout: GRAMMAR_TIMEOUT, ...config }).then(res => res.data),
    post: (url, data, config) => api.post(url, data, { timeout: GRAMMAR_TIMEOUT, ...config }).then(res => res.data),
    put: (url, data, config) => api.put(url, data, { timeout: GRAMMAR_TIMEOUT, ...config }).then(res => res.data),
    patch: (url, data, config) => api.patch(url, data, { timeout: GRAMMAR_TIMEOUT, ...config }).then(res => res.data),
    delete: (url, config) => api.delete(url, { timeout: GRAMMAR_TIMEOUT, ...config }).then(res => res.data),
}

export default grammarApi
