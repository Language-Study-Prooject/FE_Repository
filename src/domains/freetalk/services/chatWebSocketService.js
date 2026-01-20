/**
 * Chat WebSocket Service
 * 실시간 채팅 및 게임 명령을 위한 WebSocket 서비스
 *
 * 연결 흐름:
 * 1. REST API로 채팅방 입장: POST /chat/rooms/{roomId}/join → roomToken 발급
 * 2. roomToken으로 WebSocket 연결: wss://...?roomToken={roomToken}
 */

const WS_URL = import.meta.env.VITE_WS_URL ||
    'wss://t378dif43l.execute-api.ap-northeast-2.amazonaws.com/dev'

/**
 * Chat WebSocket 연결 클래스
 */
class ChatWebSocketConnection {
    constructor() {
        this.ws = null
        this.callbacks = {}
        this.isConnected = false
        this.reconnectAttempts = 0
        this.maxReconnectAttempts = 5
        this.reconnectDelay = 1000
        this.roomId = null
        this.userId = null
        this.roomToken = null
    }

    /**
     * WebSocket 연결
     * @param {string} roomToken - POST /chat/rooms/{roomId}/join에서 발급받은 roomToken
     * @param {string} roomId - 채팅방 ID
     * @param {string} userId - 사용자 ID
     */
    connect(roomToken, roomId, userId) {
        return new Promise((resolve, reject) => {
            try {
                this.roomId = roomId
                this.userId = userId
                this.roomToken = roomToken

                // roomToken 파라미터로 연결 (token이 아님!)
                const url = roomToken ? `${WS_URL}?roomToken=${roomToken}` : WS_URL
                console.log('[ChatWebSocket] Connecting to:', url)
                this.ws = new WebSocket(url)

                this.ws.onopen = () => {
                    this.isConnected = true
                    this.reconnectAttempts = 0
                    console.log('[ChatWebSocket] Connected')

                    // 연결 후 방 입장은 roomToken으로 이미 처리됨
                    // joinRoom action은 서버에서 지원하지 않음 (Forbidden)

                    resolve()
                }

                this.ws.onclose = (event) => {
                    this.isConnected = false
                    console.log('[ChatWebSocket] Disconnected:', event.code)
                    this.callbacks.onClose?.(event)

                    // 비정상 종료 시 재연결 시도 (roomToken 만료 시 재발급 필요할 수 있음)
                    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.attemptReconnect(roomToken, roomId, userId)
                    }
                }

                this.ws.onerror = (error) => {
                    console.error('[ChatWebSocket] Error:', error)
                    this.callbacks.onError?.({type: 'error', message: 'WebSocket connection error'})
                    reject(error)
                }

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        this.handleMessage(data)
                    } catch (e) {
                        console.error('[ChatWebSocket] Parse error:', e)
                    }
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * 재연결 시도
     */
    attemptReconnect(roomToken, roomId, userId) {
        this.reconnectAttempts++
        console.log(`[ChatWebSocket] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

        setTimeout(() => {
            this.connect(roomToken, roomId, userId).catch(() => {
                console.error('[ChatWebSocket] Reconnect failed')
            })
        }, this.reconnectDelay * this.reconnectAttempts)
    }

    /**
     * 메시지 핸들링
     */
    handleMessage(data) {
        const {type, messageType} = data
        console.log('[ChatWebSocket] Received message:', {type, messageType, data})

        // 메시지 타입에 따라 콜백 호출 (대소문자 모두 처리)
        switch (type || messageType) {
            case 'message':
            case 'TEXT':
                this.callbacks.onMessage?.(data)
                break
            case 'game_start':
            case 'GAME_START':
                this.callbacks.onGameStart?.(data)
                break
            case 'game_end':
            case 'GAME_END':
                this.callbacks.onGameEnd?.(data)
                break
            case 'round_start':
            case 'ROUND_START':
                console.log('[ChatWebSocket] Round start received:', data)
                this.callbacks.onRoundStart?.(data)
                break
            case 'round_end':
            case 'ROUND_END':
                console.log('[ChatWebSocket] Round end received:', data)
                this.callbacks.onRoundEnd?.(data)
                break
            case 'drawing':
            case 'DRAWING':
                console.log('[ChatWebSocket] Drawing data received:', data)
                this.callbacks.onDrawing?.(data)
                break
            case 'drawing_clear':
            case 'DRAWING_CLEAR':
                console.log('[ChatWebSocket] Drawing clear received')
                this.callbacks.onDrawingClear?.()
                break
            case 'correct_answer':
            case 'CORRECT_ANSWER':
                console.log('[ChatWebSocket] Correct answer received:', data)
                this.callbacks.onCorrectAnswer?.(data)
                break
            case 'score_update':
            case 'SCORE_UPDATE':
                this.callbacks.onScoreUpdate?.(data)
                break
            case 'hint':
            case 'HINT':
                this.callbacks.onHint?.(data)
                break
            case 'user_join':
            case 'USER_JOIN':
                this.callbacks.onUserJoin?.(data)
                break
            case 'user_leave':
            case 'USER_LEAVE':
                this.callbacks.onUserLeave?.(data)
                break
            case 'system_command':
            case 'SYSTEM_COMMAND':
                // 시스템 명령어 응답 (예: /member, /help 등)
                this.callbacks.onMessage?.(data)
                break
            case 'error':
            case 'ERROR':
                this.callbacks.onError?.(data)
                break
            case 'GUESS':
                // 추측 메시지 - 일반 메시지로 처리
                this.callbacks.onMessage?.(data)
                break
            default:
                console.log('[ChatWebSocket] Unknown message type:', type || messageType, data)
                this.callbacks.onMessage?.(data)
        }
    }

    /**
     * 방 입장
     */
    joinRoom(roomId) {
        this.send({
            action: 'joinRoom',
            roomId,
            userId: this.userId,
        })
    }

    /**
     * 방 퇴장
     */
    leaveRoom(roomId) {
        this.send({
            action: 'leaveRoom',
            roomId,
            userId: this.userId,
        })
    }

    /**
     * 메시지 전송
     */
    sendMessage(content, messageType = 'TEXT') {
        if (!this.isConnected || !this.ws) {
            console.error('[ChatWebSocket] Not connected')
            return false
        }

        console.log('[ChatWebSocket] Sending message with userId:', this.userId, 'content:', content)
        this.send({
            action: 'sendMessage',
            roomId: this.roomId,
            userId: this.userId,
            content,
            messageType,
        })
        return true
    }

    /**
     * 게임 시작 명령
     */
    startGame() {
        return this.sendMessage('/start', 'TEXT')
    }

    /**
     * 게임 종료 명령
     */
    stopGame() {
        return this.sendMessage('/stop', 'TEXT')
    }

    /**
     * 그리기 데이터 전송 - sendMessage action 사용
     */
    sendDrawing(drawingData) {
        console.log('[ChatWebSocket] sendDrawing called:', drawingData)
        // 서버가 sendMessage action만 지원하므로 messageType으로 구분
        // content는 반드시 문자열이어야 함
        const content = typeof drawingData === 'string' ? drawingData : JSON.stringify(drawingData)
        console.log('[ChatWebSocket] sendDrawing content:', content)
        this.send({
            action: 'sendMessage',
            roomId: this.roomId,
            userId: this.userId,
            content: content,
            messageType: 'DRAWING',
        })
    }

    /**
     * 캔버스 초기화 전송
     */
    clearDrawing() {
        console.log('[ChatWebSocket] clearDrawing called')
        this.send({
            action: 'sendMessage',
            roomId: this.roomId,
            userId: this.userId,
            content: '',
            messageType: 'DRAWING_CLEAR',
        })
    }

    /**
     * WebSocket 메시지 전송
     */
    send(data) {
        if (!this.isConnected || !this.ws) {
            console.error('[ChatWebSocket] Not connected')
            return
        }

        this.ws.send(JSON.stringify(data))
    }

    /**
     * 콜백 설정
     */
    setCallbacks(callbacks) {
        this.callbacks = callbacks
    }

    /**
     * 연결 종료
     */
    disconnect() {
        if (this.roomId) {
            this.leaveRoom(this.roomId)
        }

        if (this.ws) {
            this.ws.close(1000, 'Client disconnect')
            this.ws = null
        }
        this.isConnected = false
        this.roomId = null
        this.userId = null
    }

    /**
     * 연결 상태 확인
     */
    getConnectionState() {
        if (!this.ws) return 'disconnected'

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'connecting'
            case WebSocket.OPEN:
                return 'connected'
            case WebSocket.CLOSING:
                return 'closing'
            case WebSocket.CLOSED:
                return 'disconnected'
            default:
                return 'unknown'
        }
    }
}

// 싱글톤 인스턴스
let wsInstance = null

/**
 * Chat WebSocket 서비스
 */
export const chatWebSocketService = {
    /**
     * 인스턴스 가져오기 (싱글톤)
     */
    getInstance() {
        if (!wsInstance) {
            wsInstance = new ChatWebSocketConnection()
        }
        return wsInstance
    },

    /**
     * 연결
     */
    async connect(token, roomId, userId) {
        const instance = this.getInstance()
        return instance.connect(token, roomId, userId)
    },

    /**
     * 메시지 전송
     */
    sendMessage(content, messageType = 'TEXT') {
        const instance = this.getInstance()
        return instance.sendMessage(content, messageType)
    },

    /**
     * 게임 시작
     */
    startGame() {
        const instance = this.getInstance()
        return instance.startGame()
    },

    /**
     * 게임 종료
     */
    stopGame() {
        const instance = this.getInstance()
        return instance.stopGame()
    },

    /**
     * 그리기 데이터 전송
     */
    sendDrawing(drawingData) {
        const instance = this.getInstance()
        return instance.sendDrawing(drawingData)
    },

    /**
     * 캔버스 초기화 전송
     */
    clearDrawing() {
        const instance = this.getInstance()
        return instance.clearDrawing()
    },

    /**
     * 콜백 설정
     */
    setCallbacks(callbacks) {
        const instance = this.getInstance()
        instance.setCallbacks(callbacks)
    },

    /**
     * 연결 종료
     */
    disconnect() {
        const instance = this.getInstance()
        instance.disconnect()
    },

    /**
     * 연결 상태
     */
    getConnectionState() {
        const instance = this.getInstance()
        return instance.getConnectionState()
    },
}

export default chatWebSocketService
