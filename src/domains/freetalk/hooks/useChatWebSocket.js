import {useCallback, useEffect, useRef, useState} from 'react'
import {chatWebSocketService} from '../services/chatWebSocketService'
import {chatRoomService} from '../../chat/services/chatService'

/**
 * Chat WebSocket 훅
 * 실시간 채팅 및 게임을 위한 상태 관리
 *
 * 연결 흐름:
 * 1. POST /chat/rooms/{roomId}/join 호출 → roomToken 발급
 * 2. roomToken으로 WebSocket 연결
 */
export function useChatWebSocket(roomId, userId) {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const [gameState, setGameState] = useState(null)
    const [error, setError] = useState(null)

    const isConnectedRef = useRef(false)
    const roomTokenRef = useRef(null)

    /**
     * WebSocket 연결
     */
    const connect = useCallback(async () => {
        console.log('[useChatWebSocket] Attempting to connect...', {roomId, userId})

        if (!roomId || !userId) {
            console.error('[useChatWebSocket] roomId and userId are required', {roomId, userId})
            return
        }

        try {
            setError(null)

            // 1. 먼저 REST API로 roomToken 발급받기
            console.log('[useChatWebSocket] Getting roomToken via join API...')
            const joinResponse = await chatRoomService.join(roomId)
            const roomToken = joinResponse.roomToken || joinResponse.data?.roomToken
            console.log('[useChatWebSocket] Got roomToken:', roomToken ? 'exists' : 'missing')

            if (!roomToken) {
                throw new Error('roomToken not received from join API')
            }

            roomTokenRef.current = roomToken

            // 콜백 설정
            chatWebSocketService.setCallbacks({
                onMessage: (data) => {
                    const newMessage = {
                        id: data.messageId || `msg-${Date.now()}`,
                        content: data.content,
                        userId: data.userId,
                        messageType: data.messageType || 'TEXT',
                        createdAt: data.createdAt || new Date().toISOString(),
                        isOwn: data.userId === userId,
                    }
                    setMessages((prev) => [...prev, newMessage])
                },

                onGameStart: (data) => {
                    setGameState({
                        status: 'PLAYING',
                        currentRound: data.currentRound || 1,
                        totalRounds: data.totalRounds || 5,
                        currentDrawerId: data.currentDrawerId,
                        currentWord: data.currentWord,
                        roundStartTime: Date.now(),
                        scores: data.scores || {},
                    })
                },

                onGameEnd: (data) => {
                    setGameState((prev) => ({
                        ...prev,
                        status: 'FINISHED',
                        finalScores: data.scores,
                    }))
                },

                onRoundStart: (data) => {
                    setGameState((prev) => ({
                        ...prev,
                        currentRound: data.currentRound,
                        currentDrawerId: data.currentDrawerId,
                        currentWord: data.currentWord,
                        roundStartTime: Date.now(),
                        hintUsed: false,
                        correctGuessers: [],
                    }))
                },

                onRoundEnd: (data) => {
                    setGameState((prev) => ({
                        ...prev,
                        scores: data.scores || prev?.scores,
                    }))
                },

                onCorrectAnswer: (data) => {
                    setGameState((prev) => ({
                        ...prev,
                        correctGuessers: [...(prev?.correctGuessers || []), data.userId],
                        scores: data.scores || prev?.scores,
                    }))
                },

                onScoreUpdate: (data) => {
                    setGameState((prev) => ({
                        ...prev,
                        scores: data.scores,
                    }))
                },

                onHint: (data) => {
                    setGameState((prev) => ({
                        ...prev,
                        hint: data.hint,
                        hintUsed: true,
                    }))
                },

                onDrawing: (data) => {
                    // 캔버스에 그리기 데이터 적용 (별도 핸들러로 처리)
                },

                onUserJoin: (data) => {
                    const systemMessage = {
                        id: `system-${Date.now()}`,
                        content: `${data.userId}님이 입장했습니다.`,
                        messageType: 'SYSTEM',
                        createdAt: new Date().toISOString(),
                        isSystem: true,
                    }
                    setMessages((prev) => [...prev, systemMessage])
                },

                onUserLeave: (data) => {
                    const systemMessage = {
                        id: `system-${Date.now()}`,
                        content: `${data.userId}님이 퇴장했습니다.`,
                        messageType: 'SYSTEM',
                        createdAt: new Date().toISOString(),
                        isSystem: true,
                    }
                    setMessages((prev) => [...prev, systemMessage])
                },

                onError: (data) => {
                    setError(data.message || '연결 오류가 발생했습니다')
                },

                onClose: () => {
                    setIsConnected(false)
                    isConnectedRef.current = false
                },
            })

            // 2. roomToken으로 WebSocket 연결
            await chatWebSocketService.connect(roomToken, roomId, userId)
            setIsConnected(true)
            isConnectedRef.current = true
        } catch (err) {
            console.error('[useChatWebSocket] Connection error:', err)
            setError('연결에 실패했습니다')
            setIsConnected(false)
            isConnectedRef.current = false
        }
    }, [roomId, userId])

    /**
     * 연결 종료
     */
    const disconnect = useCallback(() => {
        chatWebSocketService.disconnect()
        setIsConnected(false)
        isConnectedRef.current = false
    }, [])

    /**
     * 메시지 전송
     * - optimistic update 제거: 서버 브로드캐스트만 표시하여 중복 방지
     */
    const sendMessage = useCallback((content, messageType = 'TEXT') => {
        if (!isConnectedRef.current) {
            setError('연결되지 않았습니다')
            return false
        }

        return chatWebSocketService.sendMessage(content, messageType)
    }, [])

    /**
     * 게임 시작
     */
    const startGame = useCallback(() => {
        return chatWebSocketService.startGame()
    }, [])

    /**
     * 게임 종료
     */
    const stopGame = useCallback(() => {
        return chatWebSocketService.stopGame()
    }, [])

    /**
     * 그리기 데이터 전송
     */
    const sendDrawing = useCallback((drawingData) => {
        chatWebSocketService.sendDrawing(drawingData)
    }, [])

    /**
     * 에러 초기화
     */
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    /**
     * 메시지 초기화
     */
    const clearMessages = useCallback(() => {
        setMessages([])
    }, [])

    /**
     * 컴포넌트 언마운트 시 정리
     */
    useEffect(() => {
        return () => {
            if (isConnectedRef.current) {
                chatWebSocketService.disconnect()
            }
        }
    }, [])

    return {
        // 상태
        isConnected,
        messages,
        gameState,
        error,

        // 액션
        connect,
        disconnect,
        sendMessage,
        startGame,
        stopGame,
        sendDrawing,
        clearError,
        clearMessages,

        // 유틸
        setMessages,
    }
}

export default useChatWebSocket
