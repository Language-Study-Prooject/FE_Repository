import opicApi from '../../../api/opicApi'

/**
 * OPIc 세션 서비스
 */
export const sessionService = {
    /**
     * 세션 생성
     * @param {Object} data - { topic, subTopic }
     */
    async create(data) {
        const response = await opicApi.post('/opic/sessions', data)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to create session')
        }
        return response.data
    },

    /**
     * 세션 목록 조회
     */
    async getList() {
        const response = await opicApi.get('/opic/sessions')
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to get sessions')
        }
        return response.data
    },

    /**
     * 세션 상세 조회
     * @param {string} sessionId
     */
    async getDetail(sessionId) {
        const response = await opicApi.get(`/opic/sessions/${sessionId}`)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to get session detail')
        }
        return response.data
    },

    /**
     * 다음 질문 조회
     * @param {string} sessionId
     */
    async getNextQuestion(sessionId) {
        const response = await opicApi.get(`/opic/sessions/${sessionId}/questions/next`)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to get question')
        }
        return response.data
    },

    /**
     * 음성 업로드 URL 발급
     * @param {string} sessionId
     */
    async getUploadUrl(sessionId) {
        const response = await opicApi.get(`/opic/sessions/${sessionId}/upload-url`)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to get upload URL')
        }
        return response.data
    },

    /**
     * 답변 제출 (STT + AI 피드백)
     * @param {string} sessionId
     * @param {Object} data - { audioS3Key }
     */
    async submitAnswer(sessionId, data) {
        const response = await opicApi.post(`/opic/sessions/${sessionId}/answers`, data)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to submit answer')
        }
        return response.data
    },

    /**
     * 세션 완료
     * @param {string} sessionId
     */
    async complete(sessionId) {
        const response = await opicApi.post(`/opic/sessions/${sessionId}/complete`)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to complete session')
        }
        return response.data
    },
}

/**
 * S3 업로드 헬퍼 (presigned URL 사용)
 * @param {string} uploadUrl - Presigned URL
 * @param {Blob} audioBlob - 녹음된 오디오
 */
export const uploadAudioToS3 = async (uploadUrl, audioBlob) => {
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/webm' },
        body: audioBlob,
    })
    if (!response.ok) {
        throw new Error('Failed to upload audio to S3')
    }
    return true
}

export default {
    sessionService,
    uploadAudioToS3,
}