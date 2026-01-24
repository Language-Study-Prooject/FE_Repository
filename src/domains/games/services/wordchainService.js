/**
 * Word Chain Service - 백엔드 API 연동
 * 영어 끝말잇기 게임 관련 REST API 호출
 */
import chatApi from '../../../api/chatApi'

/**
 * 끝말잇기 게임 진행 관련 API
 */
export const wordchainService = {
    /**
     * 게임 시작
     * @param {string} roomId
     */
    start: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/wordchain/start`, {})
        return response.data
    },

    /**
     * 단어 제출
     * @param {string} roomId
     * @param {string} word
     */
    submit: async (roomId, word) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/wordchain/submit`, { word })
        return response.data
    },

    /**
     * 타임아웃 처리
     * @param {string} roomId
     */
    timeout: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/wordchain/timeout`, {})
        return response.data
    },

    /**
     * 게임 중단
     * @param {string} roomId
     */
    stop: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/wordchain/stop`, {})
        return response.data
    },

    /**
     * 게임 상태 조회
     * @param {string} roomId
     */
    getStatus: async (roomId) => {
        const response = await chatApi.get(`/chat/rooms/${roomId}/wordchain/status`)
        return response.data
    },
}

export default wordchainService
