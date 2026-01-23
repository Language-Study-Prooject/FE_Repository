import speakingApi from '../../../api/speakingApi'

export const speakingService = {
    /**
     * 대화 요청 (음성 또는 텍스트)
     * POST /speaking/chat
     */
    async chat({ sessionId, audio, text, level = 'INTERMEDIATE' }) {
        // null/undefined인 필드는 요청 바디에서 제외
        const requestBody = {
            ...(sessionId && { sessionId }),
            ...(audio && { audio }),
            ...(text && { text }),
            level,
        }

        console.log('[speakingService] Request body:', requestBody)

        return await speakingApi.post('/speaking/chat', requestBody)
    },

    /**
     * 대화 초기화
     * POST /speaking/reset
     */
    async reset(sessionId) {
        return await speakingApi.post('/speaking/reset', { sessionId })
    },
}