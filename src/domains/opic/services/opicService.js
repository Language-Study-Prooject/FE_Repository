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
     * 답변 제출 
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
     * 답변 상태 조회 (폴링용 함수 추가)
     */
    async getAnswerStatus(sessionId, questionIndex) {
        const response = await opicApi.get(`/opic/sessions/${sessionId}/answers/${questionIndex}/status`)
        if (!response.isSuccess) {
            throw new Error(response.message || 'Failed to get answer status')
        }
        return response.data; // { status, transcript, feedback 등 }
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

/**
 * 답변 처리 결과 폴링 헬퍼 함수
 */
export const pollForAnswerResult = async (sessionId, questionIndex, options = {}) => {
    const {
        maxAttempts = 90,
        intervalMs = 2000,     // 2초 간격
        onProgress = null      // 진행 상태 보고용 콜백
    } = options

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const result = await sessionService.getAnswerStatus(sessionId, questionIndex)

        // 1. 완료 시 결과 반환
        if (result.status === 'COMPLETED') {
            return result
        }

        // 2. 실패 시 에러 발생
        if (result.status === 'FAILED') {
            throw new Error(result.message || 'AI 분석 중 오류가 발생했습니다.')
        }

        // 3. 처리 중일 때 (PROCESSING)
        if (onProgress) {
            onProgress({ attempt: attempt + 1, status: result.status })
        }

        // 대기 후 재시도
        await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    throw new Error('분석 시간이 초과되었습니다. 잠시 후 다시 확인해주세요.')
}

export default {
    sessionService,
    uploadAudioToS3,
    pollForAnswerResult
}