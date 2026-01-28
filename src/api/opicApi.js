import api from './axios'

const OPIC_TIMEOUT = 60000

const opicApi = {
    get: (url, config) => api.get(url, { timeout: OPIC_TIMEOUT, ...config }).then(res => res.data),
    post: (url, data, config) => api.post(url, data, { timeout: OPIC_TIMEOUT, ...config }).then(res => res.data),
    put: (url, data, config) => api.put(url, data, { timeout: OPIC_TIMEOUT, ...config }).then(res => res.data),
    patch: (url, data, config) => api.patch(url, data, { timeout: OPIC_TIMEOUT, ...config }).then(res => res.data),
    delete: (url, config) => api.delete(url, { timeout: OPIC_TIMEOUT, ...config }).then(res => res.data),
}

export default opicApi