/**
 * Mock Game Service
 * 백엔드 API 구현 전 테스트용 목 서비스
 */

// 목 데이터
const mockRooms = [
    {
        roomId: 'game-room-1',
        name: '초보 환영방',
        description: '편하게 오세요~',
        type: 'GAME',
        gameType: 'CATCHMIND',
        level: 'BEGINNER',
        status: 'WAITING',
        hostId: 'user-1',
        hostNickname: '홍길동',
        maxParticipants: 6,
        currentParticipants: 2,
        participants: [
            { userId: 'user-1', nickname: '홍길동', isHost: true },
            { userId: 'user-2', nickname: '김철수', isHost: false },
        ],
        gameSettings: {
            maxRounds: 5,
            roundTimeLimit: 60,
        },
        createdAt: new Date().toISOString(),
    },
    {
        roomId: 'game-room-2',
        name: '고수만 오세요',
        description: '빠른 게임 진행',
        type: 'GAME',
        gameType: 'CATCHMIND',
        level: 'ADVANCED',
        status: 'PLAYING',
        hostId: 'user-3',
        hostNickname: '이영희',
        maxParticipants: 4,
        currentParticipants: 4,
        participants: [
            { userId: 'user-3', nickname: '이영희', isHost: true },
            { userId: 'user-4', nickname: '박민수', isHost: false },
            { userId: 'user-5', nickname: '정수진', isHost: false },
            { userId: 'user-6', nickname: '최동욱', isHost: false },
        ],
        gameSettings: {
            maxRounds: 3,
            roundTimeLimit: 45,
        },
        createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
        roomId: 'game-room-3',
        name: '아무나 ㄱㄱ',
        description: '',
        type: 'GAME',
        gameType: 'CATCHMIND',
        level: 'INTERMEDIATE',
        status: 'WAITING',
        hostId: 'user-7',
        hostNickname: '강지훈',
        maxParticipants: 6,
        currentParticipants: 1,
        participants: [
            { userId: 'user-7', nickname: '강지훈', isHost: true },
        ],
        gameSettings: {
            maxRounds: 5,
            roundTimeLimit: 60,
        },
        createdAt: new Date(Date.now() - 300000).toISOString(),
    },
]

const mockWords = [
    '사과', '바나나', '호랑이', '자동차', '비행기',
    '컴퓨터', '햄버거', '피자', '축구', '농구',
    '기타', '피아노', '나비', '꽃', '태양',
]

// 지연 시뮬레이션
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 현재 사용자 (테스트용)
let currentUserId = 'test-user'
let currentUserNickname = '테스트유저'

export const mockGameService = {
    // 현재 사용자 설정 (테스트용)
    setCurrentUser: (userId, nickname) => {
        currentUserId = userId
        currentUserNickname = nickname
    },

    // 방 목록 조회
    getRooms: async (filters = {}) => {
        await delay(300)

        let rooms = [...mockRooms]

        if (filters.status) {
            rooms = rooms.filter(r => r.status === filters.status)
        }
        if (filters.level) {
            rooms = rooms.filter(r => r.level === filters.level)
        }

        return {
            success: true,
            data: {
                rooms,
                totalCount: rooms.length,
            },
        }
    },

    // 방 상세 조회
    getRoom: async (roomId) => {
        await delay(200)

        const room = mockRooms.find(r => r.roomId === roomId)
        if (!room) {
            throw new Error('방을 찾을 수 없습니다')
        }

        return {
            success: true,
            data: room,
        }
    },

    // 방 생성
    createRoom: async (data) => {
        await delay(500)

        const newRoom = {
            roomId: `game-room-${Date.now()}`,
            name: data.name,
            description: data.description || '',
            type: 'GAME',
            gameType: 'CATCHMIND',
            level: data.level || 'BEGINNER',
            status: 'WAITING',
            hostId: currentUserId,
            hostNickname: currentUserNickname,
            maxParticipants: data.maxParticipants || 6,
            currentParticipants: 1,
            participants: [
                { userId: currentUserId, nickname: currentUserNickname, isHost: true },
            ],
            gameSettings: {
                maxRounds: data.maxRounds || 5,
                roundTimeLimit: data.roundTimeLimit || 60,
            },
            createdAt: new Date().toISOString(),
        }

        mockRooms.unshift(newRoom)

        return {
            success: true,
            data: newRoom,
        }
    },

    // 방 참가
    joinRoom: async (roomId) => {
        await delay(300)

        const room = mockRooms.find(r => r.roomId === roomId)
        if (!room) {
            throw new Error('방을 찾을 수 없습니다')
        }

        if (room.currentParticipants >= room.maxParticipants) {
            throw new Error('방이 가득 찼습니다')
        }

        if (room.status === 'PLAYING') {
            throw new Error('게임이 진행 중입니다')
        }

        // 이미 참가 중인지 확인
        const alreadyJoined = room.participants.some(p => p.userId === currentUserId)
        if (!alreadyJoined) {
            room.participants.push({
                userId: currentUserId,
                nickname: currentUserNickname,
                isHost: false,
            })
            room.currentParticipants++
        }

        return {
            success: true,
            data: {
                room,
                roomToken: `mock-token-${roomId}-${Date.now()}`,
            },
        }
    },

    // 방 나가기
    leaveRoom: async (roomId) => {
        await delay(200)

        const room = mockRooms.find(r => r.roomId === roomId)
        if (!room) {
            throw new Error('방을 찾을 수 없습니다')
        }

        const participantIndex = room.participants.findIndex(p => p.userId === currentUserId)
        if (participantIndex !== -1) {
            const wasHost = room.participants[participantIndex].isHost
            room.participants.splice(participantIndex, 1)
            room.currentParticipants--

            // 방장이 나가면 다음 사람이 방장
            if (wasHost && room.participants.length > 0) {
                room.participants[0].isHost = true
                room.hostId = room.participants[0].userId
                room.hostNickname = room.participants[0].nickname
            }

            // 모두 나가면 방 삭제
            if (room.participants.length === 0) {
                const roomIndex = mockRooms.findIndex(r => r.roomId === roomId)
                if (roomIndex !== -1) {
                    mockRooms.splice(roomIndex, 1)
                }
            }
        }

        return { success: true }
    },

    // 게임 시작
    startGame: async (roomId) => {
        await delay(300)

        const room = mockRooms.find(r => r.roomId === roomId)
        if (!room) {
            throw new Error('방을 찾을 수 없습니다')
        }

        if (room.hostId !== currentUserId) {
            throw new Error('방장만 게임을 시작할 수 있습니다')
        }

        if (room.currentParticipants < 2) {
            throw new Error('최소 2명이 필요합니다')
        }

        room.status = 'PLAYING'

        const drawerOrder = room.participants.map(p => p.userId)
        const randomWord = mockWords[Math.floor(Math.random() * mockWords.length)]

        return {
            success: true,
            data: {
                gameSessionId: `session-${Date.now()}`,
                roomId,
                status: 'PLAYING',
                currentRound: 1,
                totalRounds: room.gameSettings.maxRounds,
                currentDrawerId: drawerOrder[0],
                drawerOrder,
                roundStartTime: Date.now(),
                serverTime: Date.now(),
                roundDuration: room.gameSettings.roundTimeLimit,
                currentWord: drawerOrder[0] === currentUserId ? { word: randomWord } : null,
            },
        }
    },

    // 게임 종료
    stopGame: async (roomId) => {
        await delay(200)

        const room = mockRooms.find(r => r.roomId === roomId)
        if (room) {
            room.status = 'FINISHED'
        }

        return {
            success: true,
            data: {
                roomId,
                status: 'FINISHED',
                reason: 'STOPPED',
            },
        }
    },

    // 게임 재시작
    restartGame: async (roomId) => {
        await delay(300)

        const room = mockRooms.find(r => r.roomId === roomId)
        if (!room) {
            throw new Error('방을 찾을 수 없습니다')
        }

        room.status = 'WAITING'

        return {
            success: true,
            data: room,
        }
    },

    // 랜덤 단어 가져오기 (테스트용)
    getRandomWord: () => {
        return mockWords[Math.floor(Math.random() * mockWords.length)]
    },
}

export default mockGameService
