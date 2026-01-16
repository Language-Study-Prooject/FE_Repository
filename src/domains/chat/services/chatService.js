import chatApi from '../../../api/chatApi'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

// Mock 데이터 사용 여부 (환경변수로 제어: VITE_USE_MOCK=true)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ============================================
// Mock 데이터 (백엔드 API 응답 형식과 동일)
// ============================================

const mockChatRooms = [
    {
        roomId: '550e8400-e29b-41d4-a716-446655440001',
        name: 'English Practice Room',
        description: 'Daily conversation practice for beginners',
        level: 'beginner',
        currentMembers: 5,
        maxMembers: 10,
        isPrivate: false,
        createdBy: 'user1',
        memberIds: ['user1', 'user2', 'user3', 'user4', 'user5'],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        roomId: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Business English',
        description: 'Professional English for business situations',
        level: 'intermediate',
        currentMembers: 3,
        maxMembers: 8,
        isPrivate: false,
        createdBy: 'user2',
        memberIds: ['user2', 'user5', 'user6'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        roomId: '550e8400-e29b-41d4-a716-446655440003',
        name: 'OPIC 준비방',
        description: 'OPIC 시험 준비를 위한 스터디 그룹',
        level: 'intermediate',
        currentMembers: 4,
        maxMembers: 6,
        isPrivate: true,
        createdBy: 'user3',
        memberIds: ['user1', 'user3', 'user7', 'user8'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
        roomId: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Advanced Discussion',
        description: 'Deep discussions on various topics in English',
        level: 'advanced',
        currentMembers: 2,
        maxMembers: 5,
        isPrivate: false,
        createdBy: 'user4',
        memberIds: ['user4', 'user9'],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        roomId: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Free Talk Zone',
        description: 'Casual conversations about anything',
        level: 'beginner',
        currentMembers: 8,
        maxMembers: 15,
        isPrivate: false,
        createdBy: 'user5',
        memberIds: ['user1', 'user2', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        lastMessageAt: new Date(Date.now() - 400000).toISOString(),
    },
]

const mockMessages = {
    '550e8400-e29b-41d4-a716-446655440001': [
        {
            messageId: 'msg-001',
            roomId: '550e8400-e29b-41d4-a716-446655440001',
            userId: 'user2',
            content: 'Hello everyone!',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
            messageId: 'msg-002',
            roomId: '550e8400-e29b-41d4-a716-446655440001',
            userId: 'user1',
            content: 'Hi! How are you today?',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 3500000).toISOString()
        },
        {
            messageId: 'msg-003',
            roomId: '550e8400-e29b-41d4-a716-446655440001',
            userId: 'user3',
            content: "I'm doing great, thanks for asking!",
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 3400000).toISOString()
        },
        {
            messageId: 'msg-004',
            roomId: '550e8400-e29b-41d4-a716-446655440001',
            userId: 'user2',
            content: 'What topic should we practice today?',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 3300000).toISOString()
        },
        {
            messageId: 'msg-005',
            roomId: '550e8400-e29b-41d4-a716-446655440001',
            userId: 'user4',
            content: 'How about discussing weekend plans?',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 3200000).toISOString()
        },
    ],
    '550e8400-e29b-41d4-a716-446655440002': [
        {
            messageId: 'msg-006',
            roomId: '550e8400-e29b-41d4-a716-446655440002',
            userId: 'user2',
            content: "Let's practice business email writing.",
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
            messageId: 'msg-007',
            roomId: '550e8400-e29b-41d4-a716-446655440002',
            userId: 'user5',
            content: 'That sounds like a great idea!',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 7100000).toISOString()
        },
    ],
    '550e8400-e29b-41d4-a716-446655440003': [
        {
            messageId: 'msg-008',
            roomId: '550e8400-e29b-41d4-a716-446655440003',
            userId: 'user3',
            content: 'OPIC 시험 일주일 남았어요!',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
            messageId: 'msg-009',
            roomId: '550e8400-e29b-41d4-a716-446655440003',
            userId: 'user1',
            content: "화이팅! Let's practice together.",
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 1700000).toISOString()
        },
    ],
    '550e8400-e29b-41d4-a716-446655440004': [
        {
            messageId: 'msg-010',
            roomId: '550e8400-e29b-41d4-a716-446655440004',
            userId: 'user4',
            content: 'What are your thoughts on AI technology?',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        },
    ],
    '550e8400-e29b-41d4-a716-446655440005': [
        {
            messageId: 'msg-011',
            roomId: '550e8400-e29b-41d4-a716-446655440005',
            userId: 'user5',
            content: 'Anyone watched any good movies lately?',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 600000).toISOString()
        },
        {
            messageId: 'msg-012',
            roomId: '550e8400-e29b-41d4-a716-446655440005',
            userId: 'user6',
            content: 'I just watched Inception again!',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 500000).toISOString()
        },
        {
            messageId: 'msg-013',
            roomId: '550e8400-e29b-41d4-a716-446655440005',
            userId: 'user7',
            content: 'That movie is a classic!',
            messageType: 'TEXT',
            createdAt: new Date(Date.now() - 400000).toISOString()
        },
    ],
}

// ============================================
// API with Mock fallback
// ============================================

const withMock = (apiCall, mockData) => {
    if (USE_MOCK) {
        // Mock 모드에서는 직접 데이터 반환
        return Promise.resolve(mockData)
    }
    // 실제 API 호출 시 응답의 data 필드 추출 (백엔드 응답: { isSuccess, message, data })
    return apiCall()
        .then(response => response.data || response)
        .catch(() => mockData)
}

/**
 * 채팅방 API - Backend: POST /rooms, GET /rooms, GET /rooms/{roomId}, POST /rooms/{roomId}/join, POST /rooms/{roomId}/leave
 */
export const chatRoomService = {
    // POST /rooms - 채팅방 생성
    create: async (data) => {
        const newRoom = {
            roomId: `room-${Date.now()}`,
            name: data.name,
            description: data.description || '',
            level: data.level || 'beginner',
            currentMembers: 1,
            maxMembers: data.maxMembers || 6,
            isPrivate: data.isPrivate || false,
            createdBy: TEMP_USER_ID,
            memberIds: [TEMP_USER_ID],
            createdAt: new Date().toISOString(),
            lastMessageAt: new Date().toISOString(),
        }
        return withMock(
            () => chatApi.post('/chat/rooms', {...data, createdBy: TEMP_USER_ID}),
            newRoom
        )
    },

    // GET /rooms - 채팅방 목록 조회
    getList: async (params = {}) => {
        const {limit = 10, level, joined, cursor} = params

        return withMock(
            () => {
                const queryParams = new URLSearchParams()
                queryParams.append('limit', limit)
                if (level) queryParams.append('level', level)
                if (joined) {
                    queryParams.append('joined', 'true')
                    queryParams.append('userId', TEMP_USER_ID)
                }
                if (cursor) queryParams.append('cursor', cursor)
                return chatApi.get(`/chat/rooms?${queryParams.toString()}`)
            },
            {
                rooms: mockChatRooms
                    .filter(room => {
                        if (level && room.level !== level.toLowerCase()) return false
                        if (joined && !room.memberIds.includes(TEMP_USER_ID)) return false
                        return true
                    })
                    .slice(0, limit),
                nextCursor: null,
                hasMore: false,
            }
        )
    },

    // GET /rooms/{roomId} - 채팅방 상세 조회
    getDetail: async (roomId) => {
        return withMock(
            () => chatApi.get(`/chat/rooms/${roomId}`),
            mockChatRooms.find(r => r.roomId === roomId) || mockChatRooms[0]
        )
    },

    // POST /rooms/{roomId}/join - 채팅방 입장
    join: async (roomId, password) => {
        const room = mockChatRooms.find(r => r.roomId === roomId)
        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/join`, {
                userId: TEMP_USER_ID,
                ...(password && {password}),
            }),
            {
                room: {
                    roomId: room?.roomId || roomId,
                    name: room?.name || 'Chat Room',
                    currentMembers: (room?.currentMembers || 1) + 1,
                },
                roomToken: `token-${Date.now()}`,
                tokenExpiresAt: Math.floor(Date.now() / 1000) + 300, // 5분 후
            }
        )
    },

    // POST /rooms/{roomId}/leave - 채팅방 퇴장
    leave: async (roomId) => {
        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/leave`, {userId: TEMP_USER_ID}),
            {roomId, currentMembers: 2}
        )
    },
}

/**
 * 메시지 API - Backend: WebSocket sendMessage, GET /rooms/{roomId}/messages (메시지 조회)
 */
export const messageService = {
    // 메시지 전송 (REST fallback - 실제로는 WebSocket 사용)
    send: async (roomId, content, messageType = 'TEXT') => {
        const newMessage = {
            messageId: `msg-${Date.now()}`,
            roomId,
            userId: TEMP_USER_ID,
            content,
            messageType,
            createdAt: new Date().toISOString(),
        }
        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/messages`, {
                userId: TEMP_USER_ID,
                content,
                messageType,
            }),
            newMessage
        )
    },

    // GET /rooms/{roomId}/messages - 메시지 목록 조회
    getList: async (roomId, params = {}) => {
        const {limit = 20, cursor} = params

        return withMock(
            () => {
                const queryParams = new URLSearchParams()
                queryParams.append('limit', limit)
                if (cursor) queryParams.append('cursor', cursor)
                return chatApi.get(`/chat/rooms/${roomId}/messages?${queryParams.toString()}`)
            },
            {
                messages: (mockMessages[roomId] || []).slice(0, limit),
                nextCursor: null,
                hasMore: false,
            }
        )
    },
}

/**
 * 음성 API - Backend: POST /voice/synthesize
 */
export const voiceService = {
    // POST /voice/synthesize - TTS 변환
    synthesize: async (messageId, roomId, voice = 'FEMALE') => {
        return withMock(
            () => chatApi.post('/chat/voice/synthesize', {messageId, roomId, voice}),
            {audioUrl: null, cached: false}
        )
    },
}

// 캐치마인드 게임 Mock 상태
let mockGameState = {
    gameStatus: 'NONE', // NONE, PLAYING, FINISHED
    currentRound: 0,
    totalRounds: 5,
    currentDrawerId: null,
    currentWord: null,
    roundStartTime: null,
    roundTimeLimit: 60,
    drawerOrder: [],
    scores: {},
    hintUsed: false,
    correctGuessers: [],
}

const mockGameWords = [
    {wordId: 'gw1', korean: '사과', english: 'apple'},
    {wordId: 'gw2', korean: '바나나', english: 'banana'},
    {wordId: 'gw3', korean: '컴퓨터', english: 'computer'},
    {wordId: 'gw4', korean: '의자', english: 'chair'},
    {wordId: 'gw5', korean: '책상', english: 'desk'},
]

/**
 * 캐치마인드 게임 API - Backend: POST /rooms/{roomId}/game/start, stop, GET status, scores
 */
export const gameService = {
    // POST /rooms/{roomId}/game/start - 게임 시작
    start: async (roomId) => {
        const mockDrawerOrder = ['user1', 'user2', 'user3']
        const firstWord = mockGameWords[0]

        mockGameState = {
            gameStatus: 'PLAYING',
            currentRound: 1,
            totalRounds: 5,
            currentDrawerId: TEMP_USER_ID,
            currentWord: firstWord.korean,
            currentWordEnglish: firstWord.english,
            roundStartTime: Date.now(),
            roundTimeLimit: 60,
            drawerOrder: mockDrawerOrder,
            scores: {},
            hintUsed: false,
            correctGuessers: [],
        }

        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/game/start`, {userId: TEMP_USER_ID}),
            {
                gameStatus: mockGameState.gameStatus,
                currentRound: mockGameState.currentRound,
                totalRounds: mockGameState.totalRounds,
                currentDrawerId: mockGameState.currentDrawerId,
                roundStartTime: mockGameState.roundStartTime,
                roundTimeLimit: mockGameState.roundTimeLimit,
                drawerOrder: mockGameState.drawerOrder,
                scores: mockGameState.scores,
                // 출제자에게만 단어 제공
                currentWord: mockGameState.currentWord,
                currentWordEnglish: mockGameState.currentWordEnglish,
            }
        )
    },

    // POST /rooms/{roomId}/game/stop - 게임 중단
    stop: async (roomId) => {
        const finalScores = {...mockGameState.scores}
        mockGameState = {
            gameStatus: 'NONE',
            currentRound: 0,
            totalRounds: 5,
            currentDrawerId: null,
            currentWord: null,
            roundStartTime: null,
            roundTimeLimit: 60,
            drawerOrder: [],
            scores: {},
            hintUsed: false,
            correctGuessers: [],
        }

        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/game/stop`, {userId: TEMP_USER_ID}),
            {message: '게임이 종료되었습니다.', scores: finalScores}
        )
    },

    // GET /rooms/{roomId}/game/status - 게임 상태 조회
    getStatus: async (roomId) => {
        return withMock(
            () => chatApi.get(`/chat/rooms/${roomId}/game/status`),
            {
                gameStatus: mockGameState.gameStatus,
                currentRound: mockGameState.currentRound,
                totalRounds: mockGameState.totalRounds,
                currentDrawerId: mockGameState.currentDrawerId,
                roundStartTime: mockGameState.roundStartTime,
                roundTimeLimit: mockGameState.roundTimeLimit,
                drawerOrder: mockGameState.drawerOrder,
                scores: mockGameState.scores,
                hintUsed: mockGameState.hintUsed,
                correctGuessers: mockGameState.correctGuessers,
                // 출제자에게만 단어 제공 (실제로는 서버에서 userId 체크)
                currentWord: mockGameState.currentWord,
            }
        )
    },

    // GET /rooms/{roomId}/game/scores - 점수 조회
    getScores: async (roomId) => {
        const sortedScores = Object.entries(mockGameState.scores)
            .sort(([, a], [, b]) => b - a)
            .map(([userId, score], index) => ({rank: index + 1, userId, score}))

        return withMock(
            () => chatApi.get(`/chat/rooms/${roomId}/game/scores`),
            {scores: sortedScores, currentRound: mockGameState.currentRound, totalRounds: mockGameState.totalRounds}
        )
    },

    // 정답 체크 (Mock에서 사용 - 실제로는 WebSocket으로 처리)
    checkAnswer: async (roomId, answer) => {
        const isCorrect = answer.trim().toLowerCase() === mockGameState.currentWord?.toLowerCase()

        if (isCorrect && !mockGameState.correctGuessers.includes(TEMP_USER_ID)) {
            const elapsedTime = Date.now() - mockGameState.roundStartTime
            const timeBonus = Math.max(0, Math.floor((mockGameState.roundTimeLimit * 1000 - elapsedTime) / 1000 * 0.5))
            const score = 10 + timeBonus

            mockGameState.correctGuessers.push(TEMP_USER_ID)
            mockGameState.scores[TEMP_USER_ID] = (mockGameState.scores[TEMP_USER_ID] || 0) + score

            return withMock(
                () => Promise.resolve({data: {correct: true, score, elapsedTime}}),
                {correct: true, score, elapsedTime, scores: mockGameState.scores}
            )
        }

        return withMock(
            () => Promise.resolve({data: {correct: false}}),
            {correct: false}
        )
    },

    // 힌트 요청 (출제자만)
    requestHint: async (roomId) => {
        if (mockGameState.hintUsed) {
            return withMock(
                () => Promise.reject(new Error('이미 힌트를 사용했습니다.')),
                {error: '이미 힌트를 사용했습니다.'}
            )
        }

        const hint = mockGameState.currentWord?.charAt(0) + '○'.repeat((mockGameState.currentWord?.length || 1) - 1)
        mockGameState.hintUsed = true

        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/game/hint`, {userId: TEMP_USER_ID}),
            {hint, hintUsed: true}
        )
    },

    // 라운드 스킵 (출제자만)
    skipRound: async (roomId) => {
        if (mockGameState.currentRound >= mockGameState.totalRounds) {
            mockGameState.gameStatus = 'FINISHED'
            return withMock(
                () => chatApi.post(`/chat/rooms/${roomId}/game/skip`, {userId: TEMP_USER_ID}),
                {gameStatus: 'FINISHED', message: '게임이 종료되었습니다.'}
            )
        }

        const nextRound = mockGameState.currentRound + 1
        const nextWord = mockGameWords[nextRound - 1] || mockGameWords[0]
        const nextDrawerIndex = (nextRound - 1) % mockGameState.drawerOrder.length

        mockGameState = {
            ...mockGameState,
            currentRound: nextRound,
            currentDrawerId: mockGameState.drawerOrder[nextDrawerIndex],
            currentWord: nextWord.korean,
            currentWordEnglish: nextWord.english,
            roundStartTime: Date.now(),
            hintUsed: false,
            correctGuessers: [],
        }

        return withMock(
            () => chatApi.post(`/chat/rooms/${roomId}/game/skip`, {userId: TEMP_USER_ID}),
            {
                currentRound: mockGameState.currentRound,
                currentDrawerId: mockGameState.currentDrawerId,
                currentWord: mockGameState.currentWord,
                message: `라운드 ${nextRound} 시작!`,
            }
        )
    },
}

// 메시지 타입 상수
export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    VOICE: 'voice',
    AI_RESPONSE: 'ai_response',
    GAME_START: 'game_start',
    GAME_END: 'game_end',
    ROUND_START: 'round_start',
    ROUND_END: 'round_end',
    DRAWING: 'drawing',
    DRAWING_CLEAR: 'drawing_clear',
    CORRECT_ANSWER: 'correct_answer',
    SCORE_UPDATE: 'score_update',
    SYSTEM_COMMAND: 'system_command',
    HINT: 'hint',
}

// 게임 상태 상수
export const GAME_STATUS = {
    NONE: 'NONE',
    PLAYING: 'PLAYING',
    FINISHED: 'FINISHED',
}

export {TEMP_USER_ID}
