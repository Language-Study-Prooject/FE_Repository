/**
 * Speaking REST API Service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL

export const speakingApi = {
    /**
     * 대화 요청 (음성 또는 텍스트)
     */
    async chat({ sessionId, audio, text, level = 'INTERMEDIATE' }) {
        const token = localStorage.getItem('accessToken')

        // sessionId가 null/undefined면 body에서 제외
        const requestBody = {
            ...(sessionId && { sessionId }),  // null이 아닐 때만 포함
            ...(audio && { audio }),
            ...(text && { text }),
            level,
        }

        console.log('[speakingApi] Request body:', {
            hasSessionId: !!sessionId,
            hasAudio: !!audio,
            hasText: !!text,
            level
        })

        const response = await fetch(`${API_BASE_URL}/api/speaking/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || '요청 처리에 실패했습니다')
        }

        return response.json()
    },

    /**
     * 대화 초기화
     */
    async reset(sessionId) {
        const token = localStorage.getItem('accessToken')

        const response = await fetch(`${API_BASE_URL}/api/speaking/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionId }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || '초기화에 실패했습니다')
        }

        return response.json()
    },
}