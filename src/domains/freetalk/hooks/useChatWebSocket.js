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
    const [receivedDrawing, setReceivedDrawing] = useState(null)
    const [shouldClearCanvas, setShouldClearCanvas] = useState(false)
    const [correctAnswerBubble, setCorrectAnswerBubble] = useState(null)

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
                    console.log('[useChatWebSocket] Game started - FULL DATA:', JSON.stringify(data, null, 2))
                    // 실제 게임 데이터 추출 (data.data에 중첩되어 있을 수 있음)
                    const gameData = data.data || data
                    // currentWord는 객체: { korean, english, wordId }
                    // 출제자만 currentWord를 받음
                    const word = gameData.currentWord
                    setGameState({
                        status: 'PLAYING',
                        currentRound: gameData.currentRound || 1,
                        totalRounds: gameData.totalRounds || 5,
                        currentDrawerId: gameData.currentDrawerId,
                        currentWord: word?.korean || word, // 한글 제시어 사용
                        currentWordEnglish: word?.english,
                        drawerOrder: gameData.drawerOrder,
                        roundStartTime: Date.now(),
                        scores: gameData.scores || {},
                    })
                },

                onGameEnd: (data) => {
                    console.log('[useChatWebSocket] Game ended - FULL DATA:', JSON.stringify(data, null, 2))
                    const gameData = data.data || data
                    setGameState((prev) => ({
                        ...prev,
                        status: 'FINISHED',
                        finalScores: gameData.scores,
                    }))
                },

                onRoundStart: (data) => {
                    console.log('[useChatWebSocket] Round started - FULL DATA:', JSON.stringify(data, null, 2))
                    // 실제 라운드 데이터 추출 (data.data에 중첩되어 있을 수 있음)
                    const roundData = data.data || data
                    // currentWord는 객체: { korean, english, wordId }
                    const word = roundData.currentWord
                    setGameState((prev) => ({
                        ...prev,
                        currentRound: roundData.currentRound,
                        currentDrawerId: roundData.currentDrawerId,
                        currentWord: word?.korean || word,
                        currentWordEnglish: word?.english,
                        roundStartTime: Date.now(),
                        hintUsed: false,
                        correctGuessers: [],
                    }))
                },

                onRoundEnd: (data) => {
                    console.log('[useChatWebSocket] Round ended - FULL DATA:', JSON.stringify(data, null, 2))

                    // 실제 라운드 데이터 추출 (data.data에 중첩되어 있을 수 있음)
                    const roundData = data.data || data

                    console.log('[useChatWebSocket] Extracted roundData:', roundData)

                    // ROUND_END 처리 - 다음 라운드 정보 추출
                    const nextRoundNum = roundData.nextRound ?? roundData.currentRound ?? ((data.currentRound || 0) + 1)
                    const nextDrawer = roundData.nextDrawer ?? roundData.nextDrawerId ?? roundData.currentDrawerId
                    const nextWord = roundData.nextWord ?? roundData.currentWord
                    const scores = roundData.scores ?? data.scores

                    setGameState((prev) => {
                        if (!prev) return prev

                        console.log('[useChatWebSocket] Updating gameState:', {
                            prevRound: prev.currentRound,
                            nextRoundNum,
                            nextDrawer,
                            nextWord,
                            scores,
                        })

                        // 항상 다음 라운드로 전환 (ROUND_END는 라운드가 끝났다는 의미)
                        return {
                            ...prev,
                            scores: scores || prev.scores,
                            currentRound: nextRoundNum,
                            currentDrawerId: nextDrawer,
                            currentWord: nextWord?.korean || nextWord,
                            currentWordEnglish: nextWord?.english,
                            roundStartTime: Date.now(),
                            hintUsed: false,
                            correctGuessers: [],
                        }
                    })
                },

                onCorrectAnswer: (data) => {
                    console.log('[useChatWebSocket] Correct answer - FULL DATA:', JSON.stringify(data, null, 2))
                    const answerData = data.data || data
                    setGameState((prev) => ({
                        ...prev,
                        correctGuessers: [...(prev?.correctGuessers || []), answerData.userId],
                        scores: answerData.scores || prev?.scores,
                    }))
                    // 정답 비눗방울 표시 데이터 설정
                    setCorrectAnswerBubble({
                        userId: answerData.userId,
                        content: answerData.content || '정답!',
                        timestamp: Date.now(),
                    })
                },

                onScoreUpdate: (data) => {
                    const scoreData = data.data || data
                    setGameState((prev) => ({
                        ...prev,
                        scores: scoreData.scores,
                    }))
                },

                onHint: (data) => {
                    const hintData = data.data || data
                    setGameState((prev) => ({
                        ...prev,
                        hint: hintData.hint,
                        hintUsed: true,
                    }))
                },

                onDrawing: (data) => {
                    // 캔버스에 그리기 데이터 적용
                    console.log('[useChatWebSocket] Drawing received:', data)
                    // data.data가 있으면 그것을 사용, 없으면 원본 data 사용
                    const drawingData = data.data || data
                    setReceivedDrawing(drawingData)
                },

                onDrawingClear: () => {
                    // 캔버스 초기화
                    console.log('[useChatWebSocket] Drawing clear received')
                    setShouldClearCanvas(true)
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
            console.error('[useChatWebSocket] Error details:', {
                message: err.message,
                stack: err.stack,
                roomId,
                userId
            })
            setError('연결에 실패했습니다: ' + err.message)
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
            console.warn('[useChatWebSocket] Not connected, cannot send message:', content)
            // 연결 안 됐을 때는 에러 설정하지 않고 조용히 실패
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
        console.log('[useChatWebSocket] sendDrawing, isConnected:', isConnectedRef.current)
        if (!isConnectedRef.current) {
            console.error('[useChatWebSocket] Not connected, cannot send drawing')
            return
        }
        chatWebSocketService.sendDrawing(drawingData)
    }, [])

    /**
     * 캔버스 초기화 전송
     */
    const clearDrawing = useCallback(() => {
        console.log('[useChatWebSocket] clearDrawing, isConnected:', isConnectedRef.current)
        if (!isConnectedRef.current) {
            console.error('[useChatWebSocket] Not connected, cannot clear drawing')
            return
        }
        chatWebSocketService.clearDrawing()
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
        receivedDrawing,
        shouldClearCanvas,
        correctAnswerBubble,

        // 액션
        connect,
        disconnect,
        sendMessage,
        startGame,
        stopGame,
        sendDrawing,
        clearDrawing,
        clearError,
        clearMessages,

        // 유틸
        setMessages,
        setReceivedDrawing,
        setShouldClearCanvas,
        setCorrectAnswerBubble,
    }
}

export default useChatWebSocket
