/**
 * Game Service - 백엔드 API 연동
 * 캐치마인드 게임 관련 REST API 호출
 */
import chatApi from '../../../api/chatApi'

/**
 * 게임방 관련 API
 */
export const gameRoomService = {
    /**
     * 게임방 목록 조회
     * @param {Object} filters - 필터 옵션
     * @param {string} filters.status - WAITING, PLAYING, FINISHED
     * @param {string} filters.level - BEGINNER, INTERMEDIATE, ADVANCED
     * @param {number} filters.limit - 조회 개수 (기본 20)
     * @param {string} filters.cursor - 페이지네이션 커서
     */
    getList: async (filters = {}) => {
        const params = new URLSearchParams()
        // 게임방 필터
        params.append('type', 'GAME')
        params.append('gameType', 'CATCHMIND')

        // 백엔드는 소문자 level 값 사용
        if (filters.status) params.append('status', filters.status)
        if (filters.level) params.append('level', filters.level.toLowerCase())
        if (filters.limit) params.append('limit', filters.limit || 20)
        if (filters.cursor) params.append('cursor', filters.cursor)

        console.log('[gameService] getList params:', params.toString())
        const response = await chatApi.get(`/chat/rooms?${params.toString()}`)
        console.log('[gameService] getList full response:', response)
        console.log('[gameService] getList data:', response.data)

        // 디버그: 필터 없이 전체 조회 테스트
        const allRoomsResponse = await chatApi.get('/chat/rooms?limit=20')
        console.log('[gameService] ALL rooms (no filter):', allRoomsResponse)

        return response.data
    },

    /**
     * 게임방 상세 조회
     * @param {string} roomId
     */
    getDetail: async (roomId) => {
        const response = await chatApi.get(`/chat/rooms/${roomId}`)
        return response.data
    },

    /**
     * 게임방 생성
     * @param {Object} data
     * @param {string} data.name - 방 이름
     * @param {string} data.description - 방 설명
     * @param {string} data.level - BEGINNER, INTERMEDIATE, ADVANCED
     * @param {number} data.maxMembers - 최대 인원 (2-10)
     * @param {boolean} data.isPrivate - 비공개 여부
     * @param {string} data.password - 비공개 방 비밀번호
     * @param {Object} data.gameSettings - 게임 설정
     */
    create: async (data) => {
        const payload = {
            name: data.name,
            description: data.description || '',
            level: (data.level || 'beginner').toLowerCase(), // 백엔드는 소문자 사용
            maxMembers: data.maxParticipants || data.maxMembers || 6,
            isPrivate: data.isPrivate || false,
            password: data.password,
            type: 'GAME',
            gameType: 'CATCHMIND',
            gameSettings: {
                maxRounds: data.maxRounds || 5,
                roundTimeLimit: data.roundTimeLimit || 60,
            },
        }

        console.log('[gameService] create payload:', payload)
        const response = await chatApi.post('/chat/rooms', payload)
        console.log('[gameService] create response:', response)
        return response.data
    },

    /**
     * 게임방 참가
     * @param {string} roomId
     * @param {string} password - 비공개 방인 경우
     * @returns {Promise<{room: Object, roomToken: string, tokenExpiresAt: number}>}
     */
    join: async (roomId, password) => {
        const payload = password ? { password } : {}
        const response = await chatApi.post(`/chat/rooms/${roomId}/join`, payload)
        return response.data
    },

    /**
     * 게임방 나가기
     * @param {string} roomId
     */
    leave: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/leave`, {})
        return response.data
    },
}

/**
 * 게임 진행 관련 API
 */
export const gamePlayService = {
    /**
     * 게임 시작
     * @param {string} roomId
     */
    start: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/game/start`, {})
        return response.data
    },

    /**
     * 게임 중단
     * @param {string} roomId
     */
    stop: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/game/stop`, {})
        return response.data
    },

    /**
     * 게임 상태 조회
     * @param {string} roomId
     */
    getStatus: async (roomId) => {
        const response = await chatApi.get(`/chat/rooms/${roomId}/game/status`)
        return response.data
    },

    /**
     * 점수 조회
     * @param {string} roomId
     */
    getScores: async (roomId) => {
        const response = await chatApi.get(`/chat/rooms/${roomId}/game/scores`)
        return response.data
    },

    /**
     * 게임 재시작
     * @param {string} roomId
     */
    restart: async (roomId) => {
        const response = await chatApi.post(`/chat/rooms/${roomId}/game/restart`, {})
        return response.data
    },
}

/**
 * 통합 게임 서비스 (mockGameService 호환 인터페이스)
 */
export const gameService = {
    // 방 목록 조회
    getRooms: async (filters = {}) => {
        try {
            const data = await gameRoomService.getList(filters)
            console.log('[gameService] getRooms data:', data)
            // 백엔드 응답: { rooms: [...], nextCursor, hasMore } 또는 직접 배열
            const rooms = Array.isArray(data) ? data : (data?.rooms || [])
            return {
                success: true,
                data: {
                    rooms,
                    totalCount: rooms.length,
                    nextCursor: data?.nextCursor,
                    hasMore: data?.hasMore,
                },
            }
        } catch (error) {
            console.error('[gameService] getRooms error:', error)
            throw error
        }
    },

    // 방 상세 조회
    getRoom: async (roomId) => {
        try {
            const data = await gameRoomService.getDetail(roomId)
            // 백엔드 응답을 프론트엔드 형식으로 변환
            const room = data.room || data
            return {
                success: true,
                data: {
                    roomId: room.roomId,
                    name: room.name,
                    description: room.description,
                    type: room.type,
                    gameType: room.gameType,
                    level: room.level,
                    status: room.status,
                    hostId: room.hostId,
                    hostNickname: data.hostNickname,
                    maxParticipants: room.maxMembers,
                    currentParticipants: room.currentMembers,
                    participants: data.participants || room.memberIds?.map(id => ({ userId: id })) || [],
                    gameSettings: room.gameSettings || { maxRounds: 5, roundTimeLimit: 60 },
                    createdAt: room.createdAt,
                },
            }
        } catch (error) {
            console.error('[gameService] getRoom error:', error)
            throw error
        }
    },

    // 방 생성
    createRoom: async (data) => {
        try {
            const response = await gameRoomService.create(data)
            console.log('[gameService] createRoom response:', response)
            // 백엔드 응답 구조에 따라 room 추출
            const room = response?.roomId ? response : response
            return {
                success: true,
                data: {
                    ...room,
                    // 프론트엔드 필드명 맞추기
                    maxParticipants: room.maxMembers || room.maxParticipants,
                    currentParticipants: room.currentMembers || room.currentParticipants || 1,
                },
            }
        } catch (error) {
            console.error('[gameService] createRoom error:', error)
            throw error
        }
    },

    // 방 참가
    joinRoom: async (roomId, password) => {
        try {
            const data = await gameRoomService.join(roomId, password)
            return {
                success: true,
                data: {
                    room: data.room,
                    roomToken: data.roomToken,
                    tokenExpiresAt: data.tokenExpiresAt,
                },
            }
        } catch (error) {
            console.error('[gameService] joinRoom error:', error)
            throw error
        }
    },

    // 방 나가기
    leaveRoom: async (roomId) => {
        try {
            await gameRoomService.leave(roomId)
            return { success: true }
        } catch (error) {
            console.error('[gameService] leaveRoom error:', error)
            throw error
        }
    },

    // 게임 시작
    startGame: async (roomId) => {
        try {
            const data = await gamePlayService.start(roomId)
            return {
                success: true,
                data,
            }
        } catch (error) {
            console.error('[gameService] startGame error:', error)
            throw error
        }
    },

    // 게임 중단
    stopGame: async (roomId) => {
        try {
            const data = await gamePlayService.stop(roomId)
            return {
                success: true,
                data,
            }
        } catch (error) {
            console.error('[gameService] stopGame error:', error)
            throw error
        }
    },

    // 게임 상태 조회
    getGameStatus: async (roomId) => {
        try {
            const data = await gamePlayService.getStatus(roomId)
            return {
                success: true,
                data,
            }
        } catch (error) {
            console.error('[gameService] getGameStatus error:', error)
            throw error
        }
    },

    // 점수 조회
    getScores: async (roomId) => {
        try {
            const data = await gamePlayService.getScores(roomId)
            return {
                success: true,
                data,
            }
        } catch (error) {
            console.error('[gameService] getScores error:', error)
            throw error
        }
    },

    // 게임 재시작
    restartGame: async (roomId) => {
        try {
            const data = await gamePlayService.restart(roomId)
            return {
                success: true,
                data,
            }
        } catch (error) {
            console.error('[gameService] restartGame error:', error)
            throw error
        }
    },
}

export default gameService
