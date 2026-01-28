import { useCallback, useEffect, useRef, useState } from 'react'
import { chatWebSocketService } from '../services/chatWebSocketService'
import { chatRoomService } from '../../chat/services/chatService'

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
    const connect = useCallback(async (forceNewToken = false) => {
        console.log('[useChatWebSocket] Attempting to connect...', { roomId, userId, forceNewToken })

        if (!roomId || !userId) {
            console.error('[useChatWebSocket] roomId and userId are required', { roomId, userId })
            return
        }

        try {
            setError(null)

            // forceNewToken이 true면 기존 토큰 삭제
            if (forceNewToken) {
                console.log('[useChatWebSocket] Forcing new token, clearing old one')
                sessionStorage.removeItem(`roomToken_${roomId}`)
            }

            // 1. 먼저 sessionStorage에서 roomToken 확인 (이미 발급받은 경우)
            let roomToken = sessionStorage.getItem(`roomToken_${roomId}`)
            console.log('[useChatWebSocket] Checking sessionStorage for roomToken:', roomToken ? 'found' : 'not found')

            // 2. 없으면 REST API로 roomToken 발급받기
            if (!roomToken) {
                console.log('[useChatWebSocket] Getting roomToken via join API...')
                const joinResponse = await chatRoomService.join(roomId)
                roomToken = joinResponse.roomToken || joinResponse.data?.roomToken
                console.log('[useChatWebSocket] Got roomToken from API:', roomToken ? 'exists' : 'missing')

                // sessionStorage에 저장
                if (roomToken) {
                    sessionStorage.setItem(`roomToken_${roomId}`, roomToken)
                }
            }

            if (!roomToken) {
                throw new Error('roomToken not received')
            }

            console.log('[useChatWebSocket] Using roomToken:', roomToken.substring(0, 20) + '...')
            roomTokenRef.current = roomToken

            // 콜백 설정
            chatWebSocketService.setCallbacks({
                onMessage: (data) => {
                    const messageId = data.messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    const newMessage = {
                        id: messageId,
                        content: data.content,
                        userId: data.userId,
                        nickname: data.nickname,
                        messageType: data.messageType || 'TEXT',
                        createdAt: data.createdAt || new Date().toISOString(),
                        isOwn: data.userId === userId,
                        // 추가 데이터 (투표, 시스템 명령어 등)
                        data: data.data || data.payload,
                    }
                    setMessages((prev) => {
                        // 중복 메시지 방지 (같은 messageId가 이미 있으면 추가하지 않음)
                        if (data.messageId && prev.some(m => m.id === data.messageId)) {
                            return prev
                        }
                        return [...prev, newMessage]
                    })
                },

                onPollCreate: (data) => {
                    console.log('[useChatWebSocket] Poll created:', data)
                    const pollData = data.data || data
                    const pollMessage = {
                        id: `poll-${pollData.pollId}`,
                        messageType: 'POLL_CREATE',
                        userId: pollData.creatorId || pollData.createdBy,
                        content: data.content,
                        createdAt: data.createdAt || pollData.createdAt || new Date().toISOString(),
                        isOwn: (pollData.creatorId || pollData.createdBy) === userId,
                        data: pollData,
                    }
                    setMessages((prev) => [...prev, pollMessage])
                },

                onPollVote: (data) => {
                    console.log('[useChatWebSocket] Poll vote:', data)
                    const voteData = data.data || data
                    setMessages((prev) => {
                        const updated = prev.map((msg) => {
                            if (msg.id === `poll-${voteData.pollId}` && msg.data) {
                                return {
                                    ...msg,
                                    data: {
                                        ...msg.data,
                                        options: voteData.updatedOptions || msg.data.options,
                                    },
                                }
                            }
                            return msg
                        })
                        if (data.content) {
                            updated.push({
                                id: `poll-vote-${Date.now()}`,
                                messageType: 'POLL_VOTE',
                                userId: voteData.voterId || voteData.userId,
                                content: data.content,
                                createdAt: data.createdAt || new Date().toISOString(),
                                data: voteData,
                            })
                        }
                        return updated
                    })
                },

                onPollEnd: (data) => {
                    console.log('[useChatWebSocket] Poll ended:', data)
                    console.log('[useChatWebSocket] Poll end content:', data.content)
                    const endData = data.data || data
                    setMessages((prev) => {
                        const updated = prev.map((msg) => {
                            if (msg.id === `poll-${endData.pollId}` && msg.data) {
                                return {
                                    ...msg,
                                    data: {
                                        ...msg.data,
                                        isActive: false,
                                        options: endData.finalResults || msg.data.options,
                                    },
                                }
                            }
                            return msg
                        })
                        console.log('[useChatWebSocket] Adding poll end message, content exists:', !!data.content)
                        if (data.content) {
                            const pollEndMsg = {
                                id: `poll-end-${endData.pollId}`,
                                messageType: 'POLL_END',
                                userId: endData.endedBy,
                                content: data.content,
                                createdAt: data.createdAt || new Date().toISOString(),
                                data: endData,
                            }
                            console.log('[useChatWebSocket] Poll end message:', pollEndMsg)
                            updated.push(pollEndMsg)
                        }
                        return updated
                    })
                },

                onClearChat: (data) => {
                    console.log('[useChatWebSocket] Clear chat:', data)
                    const clearData = data.data || data
                    // 특정 사용자의 메시지만 삭제
                    setMessages((prev) =>
                        prev.filter((msg) => !clearData.messageIds?.includes(msg.id))
                    )
                },

                onLeaveRoom: (data) => {
                    console.log('[useChatWebSocket] User left room:', data)
                    const leaveData = data.data || data
                    const systemMessage = {
                        id: `leave-${Date.now()}`,
                        content: `${leaveData.userId}님이 채팅방을 나갔습니다.`,
                        messageType: 'SYSTEM',
                        createdAt: leaveData.leftAt || new Date().toISOString(),
                        isSystem: true,
                    }
                    setMessages((prev) => [...prev, systemMessage])
                },

                onSystemCommand: (data) => {
                    console.log('[useChatWebSocket] System command received:', data)
                    const commandData = data.data || {}
                    const displayText = data.content || data.message || commandData.content || commandData.message || commandData.displayText || ''
                    console.log('[useChatWebSocket] System command displayText:', displayText)
                    const commandMessage = {
                        id: `syscmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        messageType: 'SYSTEM_COMMAND',
                        userId: commandData.userId || commandData.nickname || data.userId,
                        content: displayText,
                        createdAt: data.createdAt || new Date().toISOString(),
                        data: {
                            commandType: commandData.type || 'help',
                            userId: commandData.userId || commandData.nickname,
                            displayText: displayText,
                            result: typeof commandData.result === 'object'
                                ? commandData.result
                                : { value: commandData.result },
                            raw: commandData,
                        },
                    }
                    setMessages((prev) => [...prev, commandMessage])
                },

                onGameStart: (data) => {
                    console.log('[useChatWebSocket] Game started - FULL DATA:', JSON.stringify(data, null, 2))
                    // 실제 게임 데이터 추출 (data.data에 중첩되어 있을 수 있음)
                    const gameData = data.data || data
                    // currentWord는 객체: { wordId, word } - 영어 단어만 포함
                    // 출제자만 currentWord를 받음
                    const word = gameData.currentWord
                    setGameState({
                        status: 'PLAYING',
                        currentRound: gameData.currentRound || 1,
                        totalRounds: gameData.totalRounds || 5,
                        currentDrawerId: gameData.currentDrawerId,
                        currentWord: word?.word || word?.korean || word, // word 필드 우선 사용
                        drawerOrder: gameData.drawerOrder,
                        roundStartTime: gameData.roundStartTime || Date.now(),
                        roundTimeLimit: gameData.roundTimeLimit || 60,
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

                // 끝말잇기 게임 시작
                onWordchainStart: (data) => {
                    console.log('[useChatWebSocket] Wordchain started - FULL DATA:', JSON.stringify(data, null, 2))
                    const gameData = data.data || data
                    // 서버 필드명 매핑: starterWord->currentWord, currentPlayerId->currentTurnUserId, timeLimit->turnTimeLimit
                    const wordchainState = {
                        status: 'PLAYING',
                        gameType: 'WORDCHAIN',
                        currentTurnUserId: gameData.currentPlayerId || gameData.currentTurnUserId,
                        currentWord: gameData.starterWord || gameData.currentWord,
                        nextLetter: gameData.nextLetter,
                        turnTimeLimit: gameData.timeLimit || gameData.turnTimeLimit || 15,
                        turnStartTime: gameData.turnStartTime || Date.now(),
                        scores: gameData.scores || {},
                        players: gameData.players || gameData.activePlayers || [],
                    }
                    setGameState(wordchainState)
                    // PlayPage에서 사용할 수 있도록 sessionStorage에 저장
                    sessionStorage.setItem(`wordchainState_${roomId}`, JSON.stringify(wordchainState))
                },

                // 끝말잇기 정답
                onWordchainCorrect: (data) => {
                    console.log('[useChatWebSocket] Wordchain correct:', data)
                    const correctData = data.data || data
                    // 서버 필드명 매핑: word->currentWord, nextPlayerId->currentTurnUserId, nextTimeLimit->turnTimeLimit
                    setGameState((prev) => {
                        const newState = {
                            ...prev,
                            currentWord: correctData.word || correctData.currentWord,
                            nextLetter: correctData.nextLetter || prev?.nextLetter,
                            currentTurnUserId: correctData.nextPlayerId || correctData.nextTurnUserId,
                            turnTimeLimit: correctData.nextTimeLimit || prev?.turnTimeLimit,
                            turnStartTime: correctData.turnStartTime || Date.now(),
                            scores: correctData.scores || prev?.scores,
                            usedWords: prev?.usedWords ? [...prev.usedWords, correctData.word] : [correctData.word],
                        }
                        // sessionStorage 업데이트
                        sessionStorage.setItem(`wordchainState_${roomId}`, JSON.stringify(newState))
                        return newState
                    })
                },

                // 끝말잇기 오답
                onWordchainWrong: (data) => {
                    console.log('[useChatWebSocket] Wordchain wrong:', data)
                },

                // 끝말잇기 타임아웃
                onWordchainTimeout: (data) => {
                    console.log('[useChatWebSocket] Wordchain timeout:', data)
                    const timeoutData = data.data || data
                    // 서버 필드명 매핑: nextPlayerId->currentTurnUserId, nextTimeLimit->turnTimeLimit
                    setGameState((prev) => {
                        const newState = {
                            ...prev,
                            currentTurnUserId: timeoutData.nextPlayerId || timeoutData.nextTurnUserId,
                            nextLetter: timeoutData.nextLetter || prev?.nextLetter,
                            turnTimeLimit: timeoutData.nextTimeLimit || prev?.turnTimeLimit,
                            turnStartTime: timeoutData.turnStartTime || Date.now(),
                            players: timeoutData.activePlayers || prev?.players,
                        }
                        // sessionStorage 업데이트
                        sessionStorage.setItem(`wordchainState_${roomId}`, JSON.stringify(newState))
                        return newState
                    })
                },

                // 끝말잇기 게임 종료
                onWordchainEnd: (data) => {
                    console.log('[useChatWebSocket] Wordchain ended:', data)
                    const endData = data.data || data
                    setGameState((prev) => {
                        const newState = {
                            ...prev,
                            status: 'FINISHED',
                            winner: endData.winnerId ? {
                                id: endData.winnerId,
                                nickname: endData.winnerNickname,
                            } : null,
                            ranking: endData.ranking,
                            finalScores: endData.scores || prev?.scores,
                            usedWords: endData.usedWords || prev?.usedWords,
                            wordDefinitions: endData.wordDefinitions || {},
                        }
                        // sessionStorage 업데이트
                        sessionStorage.setItem(`wordchainState_${roomId}`, JSON.stringify(newState))
                        return newState
                    })
                },

                onRoundStart: (data) => {
                    console.log('[useChatWebSocket] Round started - FULL DATA:', JSON.stringify(data, null, 2))
                    // 실제 라운드 데이터 추출 (data.data에 중첩되어 있을 수 있음)
                    const roundData = data.data || data
                    // currentWord는 객체: { wordId, word } - 영어 단어만 포함
                    const word = roundData.currentWord
                    setGameState((prev) => ({
                        ...prev,
                        currentRound: roundData.currentRound,
                        currentDrawerId: roundData.currentDrawerId,
                        currentWord: word?.word || word?.korean || word, // word 필드 우선 사용
                        roundStartTime: roundData.roundStartTime || Date.now(),
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
                    const nextRoundNum = roundData.nextRound ?? ((roundData.currentRound || 0) + 1)
                    const nextWord = roundData.nextWord
                    const answer = roundData.answer // 이번 라운드 정답

                    // ranking 배열을 scores 객체로 변환
                    let scores = roundData.scores
                    if (!scores && roundData.ranking) {
                        scores = {}
                        roundData.ranking.forEach(item => {
                            scores[item.userId] = item.score
                        })
                    }

                    setGameState((prev) => {
                        console.log('[useChatWebSocket] setGameState callback, prev:', prev)

                        // 다음 출제자 계산 - 서버에서 제공하지 않으면 drawerOrder 기반으로 계산
                        let nextDrawer = roundData.nextDrawer ?? roundData.nextDrawerId

                        // 서버에서 다음 출제자를 제공하지 않은 경우, drawerOrder 기반으로 계산
                        if (!nextDrawer && prev?.drawerOrder && prev.drawerOrder.length > 0) {
                            const drawerOrder = prev.drawerOrder
                            const currentDrawerIndex = drawerOrder.indexOf(prev.currentDrawerId)
                            const nextDrawerIndex = (currentDrawerIndex + 1) % drawerOrder.length
                            nextDrawer = drawerOrder[nextDrawerIndex]
                            console.log('[useChatWebSocket] Calculated nextDrawer from drawerOrder:', {
                                drawerOrder,
                                currentDrawerIndex,
                                nextDrawerIndex,
                                nextDrawer,
                            })
                        }

                        // 그래도 없으면 currentDrawerId 사용 (fallback, 이 경우 문제가 있음)
                        if (!nextDrawer) {
                            nextDrawer = roundData.currentDrawerId || prev?.currentDrawerId
                            console.warn('[useChatWebSocket] Could not determine nextDrawer, using fallback:', nextDrawer)
                        }

                        console.log('[useChatWebSocket] Calling setGameState with:', {
                            nextRoundNum,
                            nextDrawer,
                            nextWord,
                            answer,
                            scores,
                            prevDrawerId: prev?.currentDrawerId,
                        })

                        if (!prev) {
                            console.warn('[useChatWebSocket] prev is null, creating new state')
                            // prev가 null이면 새 상태 생성
                            return {
                                status: 'PLAYING',
                                currentRound: nextRoundNum,
                                totalRounds: 5,
                                currentDrawerId: nextDrawer,
                                currentWord: nextWord?.word || nextWord?.korean || nextWord,
                                lastAnswer: answer,
                                roundStartTime: Date.now(),
                                scores: scores || {},
                                hintUsed: false,
                                correctGuessers: [],
                            }
                        }

                        // 항상 다음 라운드로 전환 (ROUND_END는 라운드가 끝났다는 의미)
                        return {
                            ...prev,
                            scores: scores || prev.scores,
                            currentRound: nextRoundNum,
                            currentDrawerId: nextDrawer,
                            currentWord: nextWord?.word || nextWord?.korean || nextWord, // word 필드 우선 사용
                            lastAnswer: answer, // 이전 라운드 정답 저장
                            roundStartTime: Date.now(),
                            hintUsed: false,
                            correctGuessers: [],
                        }
                    })
                },

                onCorrectAnswer: (data) => {
                    console.log('[useChatWebSocket] Correct answer - FULL DATA:', JSON.stringify(data, null, 2))
                    const answerData = data.data || data
                    setGameState((prev) => {
                        // prev가 null이면 기본 상태 유지
                        if (!prev) return prev

                        return {
                            ...prev,
                            correctGuessers: [...(prev.correctGuessers || []), answerData.userId],
                            // scores는 기존 값 유지 (answerData.scores가 있을 때만 업데이트)
                            scores: answerData.scores ? answerData.scores : prev.scores,
                        }
                    })
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
                    // 실제 stroke 데이터는 content 필드에 있음 (전송 시 content에 넣었으므로)
                    // 서버 응답 구조: { messageType: 'DRAWING', data: { content: '...' }, ... }
                    // 또는: { messageType: 'DRAWING', content: '...', ... }
                    const strokeData = data.content || data.data?.content || data.data || data
                    console.log('[useChatWebSocket] Extracted stroke data:', strokeData)
                    setReceivedDrawing(strokeData)
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

                onReconnectNeeded: () => {
                    console.log('[useChatWebSocket] Reconnect needed, getting new token...')
                    // 기존 토큰 삭제 후 새 토큰으로 재연결
                    sessionStorage.removeItem(`roomToken_${roomId}`)
                    connect(true)
                },
            })

            // 2. roomToken으로 WebSocket 연결
            await chatWebSocketService.connect(roomToken, roomId, userId)
            setIsConnected(true)
            isConnectedRef.current = true
            setError(null) // 연결 성공 시 에러 초기화
        } catch (err) {
            console.error('[useChatWebSocket] Connection error:', err)
            console.error('[useChatWebSocket] Error details:', {
                message: err.message,
                stack: err.stack,
                roomId,
                userId,
                forceNewToken
            })

            // 기존 토큰으로 연결 실패 시, 새 토큰으로 재시도 (1회만)
            if (!forceNewToken && sessionStorage.getItem(`roomToken_${roomId}`)) {
                console.log('[useChatWebSocket] Connection failed with cached token, retrying with new token...')
                sessionStorage.removeItem(`roomToken_${roomId}`)
                // 재귀 호출로 새 토큰 발급 후 재시도
                return connect(true)
            }

            setError('연결에 실패했습니다: ' + (err.message || '알 수 없는 오류'))
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
