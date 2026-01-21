import {useCallback, useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    Typography,
} from '@mui/material'
import {
    EmojiEvents as TrophyIcon,
    ExitToApp as ExitIcon,
    Lightbulb as HintIcon,
    Replay as ReplayIcon,
    Stop as StopIcon,
} from '@mui/icons-material'
import GameCanvas from '../components/GameCanvas'
import GameChat from '../components/GameChat'
import BubbleOverlay from '../components/BubbleOverlay'
import {gameService} from '../services/gameService'
import {GAME_COLORS, GAME_LAYOUT, GAME_TYPOGRAPHY} from '../theme/gameTheme'
import {useAuth} from '../../../contexts/AuthContext'
import {useChatWebSocket} from '../../freetalk/hooks/useChatWebSocket'

const CatchmindPlayPage = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const currentUserId = user?.userId || user?.username || user?.sub
    const canvasRef = useRef(null)

    // WebSocket 연결
    const {
        isConnected,
        messages: wsMessages,
        gameState: wsGameState,
        error: wsError,
        receivedDrawing,
        shouldClearCanvas,
        correctAnswerBubble,
        connect,
        disconnect,
        sendMessage: wsSendMessage,
        sendDrawing,
        clearDrawing,
        setReceivedDrawing,
        setShouldClearCanvas,
        setCorrectAnswerBubble,
    } = useChatWebSocket(roomId, currentUserId)

    // 로컬 게임 상태 (WebSocket에서 받은 값으로 업데이트)
    const [localGameState, setLocalGameState] = useState({
        status: 'PLAYING',
        currentRound: 1,
        totalRounds: 5,
        currentDrawerId: null,
        currentWord: null,
        roundStartTime: Date.now(),
        roundTimeLimit: 60,
        scores: {},
        hintUsed: false,
        hint: null,
    })

    // WebSocket gameState가 업데이트되면 로컬 상태에 병합
    useEffect(() => {
        if (wsGameState) {
            console.log('[CatchmindPlayPage] Received wsGameState:', wsGameState)

            // 라운드가 변경되면 전환 상태 해제 및 타이머 리셋
            setLocalGameState(prev => {
                // undefined 값은 무시하고 기존 값 유지
                const newRound = wsGameState.currentRound ?? prev.currentRound
                const newDrawer = wsGameState.currentDrawerId ?? prev.currentDrawerId
                const newRoundTimeLimit = wsGameState.roundTimeLimit ?? prev.roundTimeLimit ?? 60

                // 실제로 값이 변경되었는지 확인 (undefined가 아닌 새로운 값이 왔을 때만)
                const roundChanged = wsGameState.currentRound !== undefined && prev.currentRound !== wsGameState.currentRound
                const drawerChanged = wsGameState.currentDrawerId !== undefined && prev.currentDrawerId !== wsGameState.currentDrawerId

                if (roundChanged || drawerChanged) {
                    console.log('[CatchmindPlayPage] Round or drawer changed:', {
                        prevRound: prev.currentRound,
                        newRound: newRound,
                        prevDrawer: prev.currentDrawerId,
                        newDrawer: newDrawer,
                    })
                    // 라운드 전환 완료 - 타이머 리셋
                    setIsRoundTransitioning(false)
                    setTimeLeft(newRoundTimeLimit)
                }

                // undefined 값은 기존 값으로 유지
                return {
                    ...prev,
                    status: wsGameState.status ?? prev.status,
                    currentRound: newRound,
                    totalRounds: wsGameState.totalRounds ?? prev.totalRounds,
                    currentDrawerId: newDrawer,
                    currentWord: wsGameState.currentWord ?? prev.currentWord,
                    roundStartTime: wsGameState.roundStartTime ?? prev.roundStartTime,
                    roundTimeLimit: newRoundTimeLimit,
                    scores: wsGameState.scores ?? prev.scores,
                    hintUsed: wsGameState.hintUsed ?? prev.hintUsed,
                    hint: wsGameState.hint ?? prev.hint,
                    correctGuessers: wsGameState.correctGuessers ?? prev.correctGuessers,
                    drawerOrder: wsGameState.drawerOrder ?? prev.drawerOrder,
                    lastAnswer: wsGameState.lastAnswer ?? prev.lastAnswer,
                    finalScores: wsGameState.finalScores ?? prev.finalScores,
                }
            })
        }
    }, [wsGameState])

    const gameState = localGameState

    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState(60)
    const [messages, setMessages] = useState([])
    const [bubbles, setBubbles] = useState([])
    const [showEndModal, setShowEndModal] = useState(false)
    const [finalRanking, setFinalRanking] = useState([])
    const [isRoundTransitioning, setIsRoundTransitioning] = useState(false)

    const isDrawer = gameState.currentDrawerId === currentUserId
    const timerDanger = timeLeft <= 10
    // 라운드 전환 중이거나 타이머가 0이면 그리기 비활성화
    const canDraw = isDrawer && !isRoundTransitioning && timeLeft > 0

    // WebSocket 메시지를 로컬 messages에 동기화 (중복 제거)
    useEffect(() => {
        if (wsMessages && wsMessages.length > 0) {
            setMessages(prev => {
                // 로컬 시스템 메시지 유지 (ID가 system-으로 시작하는 것)
                const localSystemMessages = prev.filter(m =>
                    m.isSystem && m.id && m.id.startsWith('system-')
                )

                // wsMessages와 로컬 시스템 메시지 병합 후 ID 기준 중복 제거
                const merged = [...localSystemMessages, ...wsMessages]
                const seen = new Set()
                return merged.filter(m => {
                    if (!m.id || seen.has(m.id)) return false
                    seen.add(m.id)
                    return true
                }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            })
        }
    }, [wsMessages])

    // 수신된 그리기 데이터 캔버스에 적용
    useEffect(() => {
        if (receivedDrawing && canvasRef.current) {
            console.log('[CatchmindPlayPage] Applying received drawing:', receivedDrawing)
            canvasRef.current.drawStroke(receivedDrawing)
            setReceivedDrawing(null)
        }
    }, [receivedDrawing, setReceivedDrawing])

    // 캔버스 클리어 명령 처리
    useEffect(() => {
        if (shouldClearCanvas && canvasRef.current) {
            console.log('[CatchmindPlayPage] Clearing canvas from WebSocket')
            canvasRef.current.clear()
            setShouldClearCanvas(false)
        }
    }, [shouldClearCanvas, setShouldClearCanvas])

    // 정답 비눗방울 처리
    useEffect(() => {
        if (correctAnswerBubble) {
            const participant = room?.participants?.find(p => p.userId === correctAnswerBubble.userId)
            setBubbles([{
                id: `bubble-${correctAnswerBubble.timestamp}`,
                userId: correctAnswerBubble.userId,
                nickname: participant?.nickname || correctAnswerBubble.userId,
                content: correctAnswerBubble.content,
                isCorrect: true,
            }])
            setCorrectAnswerBubble(null)
        }
    }, [correctAnswerBubble, room?.participants, setCorrectAnswerBubble])

    // 게임 종료 처리 (WebSocket에서 GAME_END 이벤트 수신 시)
    useEffect(() => {
        if (gameState.status === 'FINISHED' && !showEndModal) {
            console.log('[CatchmindPlayPage] Game finished, showing end modal')
            const ranking = Object.entries(gameState.scores || {})
                .sort(([, a], [, b]) => b - a)
                .map(([odUserId, score], index) => ({
                    rank: index + 1,
                    userId: odUserId,
                    nickname: room?.participants?.find(p => p.userId === odUserId)?.nickname || odUserId,
                    score,
                }))

            setFinalRanking(ranking)
            setShowEndModal(true)
        }
    }, [gameState.status, gameState.scores, room?.participants, showEndModal])

    // 라운드 변경 시 타이머 리셋 및 캔버스 초기화
    useEffect(() => {
        if (gameState.currentRound > 1) {
            setTimeLeft(gameState.roundTimeLimit || 60)
            canvasRef.current?.clear()
        }
    }, [gameState.currentRound, gameState.roundTimeLimit])

    // 초기 로드 및 WebSocket 연결
    useEffect(() => {
        const initGame = async () => {
            try {
                setLoading(true)

                // 방 정보 조회
                const roomResponse = await gameService.getRoom(roomId)
                setRoom(roomResponse.data)

                // 게임 상태 조회 (이미 시작된 게임인 경우)
                let gameData
                try {
                    const statusResponse = await gameService.getGameStatus(roomId)
                    gameData = statusResponse.data
                    console.log('[CatchmindPlayPage] Game status from API:', JSON.stringify(gameData, null, 2))
                } catch {
                    // 게임 상태가 없으면 시작
                    const gameResponse = await gameService.startGame(roomId)
                    gameData = gameResponse.data
                    console.log('[CatchmindPlayPage] Game start response:', JSON.stringify(gameData, null, 2))
                }

                // 제시어 추출 (다양한 필드명 시도)
                const extractedWord = gameData.currentWord?.word
                    || gameData.currentWord?.korean
                    || gameData.currentWord
                    || gameData.word
                    || gameData.answer
                    || null
                console.log('[CatchmindPlayPage] Extracted word:', extractedWord, 'from gameData.currentWord:', gameData.currentWord)

                setLocalGameState({
                    status: 'PLAYING',
                    currentRound: gameData.currentRound || 1,
                    totalRounds: gameData.totalRounds || 5,
                    currentDrawerId: gameData.currentDrawerId,
                    currentWord: extractedWord,
                    roundStartTime: gameData.roundStartTime,
                    roundTimeLimit: gameData.roundDuration || 60,
                    scores: {},
                    hintUsed: false,
                    hint: null,
                })

                setTimeLeft(gameData.roundDuration || 60)

                // 시스템 메시지
                setMessages([
                    {
                        id: 'system-start',
                        content: `🎮 게임 시작! 총 ${gameData.totalRounds || 5}라운드`,
                        isSystem: true,
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: 'system-round',
                        content: `라운드 ${gameData.currentRound || 1} 시작! 출제자: ${gameData.currentDrawerId}`,
                        isSystem: true,
                        createdAt: new Date().toISOString(),
                    },
                ])

                // WebSocket 연결
                console.log('[CatchmindPlayPage] Connecting WebSocket...')
                await connect()
                console.log('[CatchmindPlayPage] WebSocket connected')
            } catch (err) {
                console.error('Failed to init game:', err)
            } finally {
                setLoading(false)
            }
        }

        initGame()

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            console.log('[CatchmindPlayPage] Disconnecting WebSocket...')
            disconnect()
        }
    }, [roomId, currentUserId, user, connect, disconnect])

    // 라운드 종료 처리 (WebSocket에서 ROUND_END/GAME_END 이벤트를 받으면 자동 처리됨)
    // 이 함수는 클라이언트 측 타이머 만료 시 fallback으로만 사용
    const handleRoundEnd = useCallback((answer, reason) => {
        // WebSocket 연결 시에는 서버에서 ROUND_END 이벤트를 받으므로
        // 클라이언트 측 라운드 종료 처리는 최소화
        if (isConnected) {
            console.log('[CatchmindPlayPage] Round end triggered locally, waiting for server event')
            return
        }

        const isLastRound = gameState.currentRound >= gameState.totalRounds

        if (isLastRound) {
            // 게임 종료
            const ranking = Object.entries(gameState.scores)
                .sort(([, a], [, b]) => b - a)
                .map(([userId, score], index) => ({
                    rank: index + 1,
                    userId,
                    nickname: room?.participants?.find(p => p.userId === userId)?.nickname || userId,
                    score,
                }))

            setFinalRanking(ranking)
            setShowEndModal(true)
            setLocalGameState(prev => ({ ...prev, status: 'FINISHED' }))

            setMessages(prev => [...prev, {
                id: `system-end-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: '🎮 게임 종료!',
                isSystem: true,
                createdAt: new Date().toISOString(),
            }])
        } else {
            // 다음 라운드 (WebSocket 연결 없을 때 fallback)
            const nextRound = gameState.currentRound + 1
            const participants = room?.participants || []
            const nextDrawerIndex = (nextRound - 1) % participants.length
            const nextDrawer = participants[nextDrawerIndex]?.userId || currentUserId
            const uniqueSuffix = Math.random().toString(36).substr(2, 9)

            setMessages(prev => [...prev, {
                id: `system-round-end-${Date.now()}-${uniqueSuffix}`,
                content: `${reason || '라운드 종료!'} 정답: ${gameState.currentWord || '???'}`,
                isSystem: true,
                createdAt: new Date().toISOString(),
            }])

            // 캔버스 초기화
            canvasRef.current?.clear()

            setTimeout(() => {
                const uniqueSuffix2 = Math.random().toString(36).substr(2, 9)
                setLocalGameState(prev => ({
                    ...prev,
                    currentRound: nextRound,
                    currentDrawerId: nextDrawer,
                    currentWord: null,
                    roundStartTime: Date.now(),
                    hintUsed: false,
                    hint: null,
                }))

                setTimeLeft(gameState.roundTimeLimit)
                setIsRoundTransitioning(false)

                setMessages(prev => [...prev, {
                    id: `system-next-${Date.now()}-${uniqueSuffix2}`,
                    content: `라운드 ${nextRound} 시작! 출제자: ${nextDrawer}`,
                    isSystem: true,
                    createdAt: new Date().toISOString(),
                }])
            }, 2000)
        }
    }, [gameState, room, currentUserId, isConnected])

    // 타이머
    useEffect(() => {
        if (gameState.status !== 'PLAYING') return
        if (isRoundTransitioning) return // 라운드 전환 중에는 타이머 중지

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // 시간 초과 - 서버에 ROUND_TIMEOUT 전송
                    if (isConnected) {
                        console.log('[CatchmindPlayPage] Timer expired, sending ROUND_TIMEOUT to server')
                        setIsRoundTransitioning(true) // 라운드 전환 상태로 변경
                        // 서버에 타임아웃 알림 전송
                        wsSendMessage('', 'ROUND_TIMEOUT')
                        return 0 // 타이머를 0으로 유지, 서버 ROUND_END 이벤트 대기
                    }
                    // 연결 안 됐으면 로컬 fallback
                    handleRoundEnd(null, '시간 초과!')
                    return gameState.roundTimeLimit
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [gameState.status, gameState.roundTimeLimit, isConnected, isRoundTransitioning, handleRoundEnd, wsSendMessage])

    // 메시지 전송 (WebSocket으로 전송, 서버에서 정답 체크)
    const handleSendMessage = useCallback((content) => {
        if (isConnected) {
            // WebSocket 연결 시: 서버로 메시지 전송 (GUESS 타입)
            // 서버에서 정답 체크 후 CORRECT_ANSWER 또는 일반 메시지로 브로드캐스트
            console.log('[CatchmindPlayPage] Sending message via WebSocket:', content)
            wsSendMessage(content, 'GUESS')

            // 오답 비눗방울은 로컬에서 표시 (서버 응답 기다리지 않음)
            setBubbles([{
                id: `bubble-${Date.now()}`,
                userId: currentUserId,
                nickname: user?.nickname || '플레이어',
                content,
                isCorrect: false,
            }])
        } else {
            // WebSocket 연결 안 됐을 때: 로컬에서 처리 (fallback)
            const newMessage = {
                id: `msg-${Date.now()}`,
                userId: currentUserId,
                nickname: user?.nickname || user?.username || '플레이어',
                content,
                createdAt: new Date().toISOString(),
            }

            // 정답 체크 (로컬 fallback)
            const isCorrect = gameState.currentWord &&
                content.toLowerCase().includes(gameState.currentWord.toLowerCase())

            if (isCorrect) {
                const score = Math.max(10, Math.floor(timeLeft * 0.5) + 10)

                newMessage.isCorrect = true
                newMessage.score = score

                // 점수 업데이트
                setLocalGameState(prev => ({
                    ...prev,
                    scores: {
                        ...prev.scores,
                        [currentUserId]: (prev.scores[currentUserId] || 0) + score,
                    },
                }))

                // 비눗방울 (정답)
                setBubbles([{
                    id: `bubble-${Date.now()}`,
                    userId: currentUserId,
                    nickname: user?.nickname || '플레이어',
                    content,
                    isCorrect: true,
                    score,
                }])

                // 시스템 메시지
                setMessages(prev => [...prev, {
                    id: `system-correct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    content: `🎉 ${user?.nickname || currentUserId}님이 정답을 맞혔습니다! (+${score}점)`,
                    isSystem: true,
                    isCorrect: true,
                    createdAt: new Date().toISOString(),
                }])

                // 다음 라운드로
                setTimeout(() => {
                    handleRoundEnd(content, '정답!')
                }, 1500)
            } else {
                newMessage.isWrong = true

                // 비눗방울 (오답)
                setBubbles([{
                    id: `bubble-${Date.now()}`,
                    userId: currentUserId,
                    nickname: user?.nickname || '플레이어',
                    content,
                    isCorrect: false,
                }])
            }

            setMessages(prev => [...prev, newMessage])
        }
    }, [currentUserId, user, gameState.currentWord, timeLeft, handleRoundEnd, isConnected, wsSendMessage])

    // 그리기 데이터 전송 (WebSocket으로 전송)
    const handleDraw = useCallback((strokeData) => {
        if (isConnected && canDraw) {
            console.log('[CatchmindPlayPage] Sending drawing via WebSocket')
            sendDrawing(strokeData)
        }
    }, [isConnected, canDraw, sendDrawing])

    // 캔버스 클리어 (WebSocket으로 전송)
    const handleClearCanvas = useCallback(() => {
        if (isConnected && canDraw) {
            console.log('[CatchmindPlayPage] Sending clear canvas via WebSocket')
            clearDrawing()
        }
    }, [isConnected, canDraw, clearDrawing])

    // 게임 종료
    const handleStopGame = async () => {
        try {
            disconnect()
            await gameService.stopGame(roomId)
            sessionStorage.removeItem(`roomToken_${roomId}`)
            navigate('/games/catchmind')
        } catch (err) {
            console.error('Failed to stop game:', err)
        }
    }

    // 재시작
    const handleRestart = async () => {
        try {
            disconnect()
            await gameService.restartGame(roomId)
            setShowEndModal(false)
            navigate(`/games/catchmind/${roomId}/waiting`)
        } catch (err) {
            console.error('Failed to restart:', err)
            // 실패해도 대기실로 이동
            setShowEndModal(false)
            navigate(`/games/catchmind/${roomId}/waiting`)
        }
    }

    // 나가기
    const handleLeave = async () => {
        try {
            disconnect()
            await gameService.leaveRoom(roomId)
        } catch (err) {
            console.error('Failed to leave room:', err)
        }
        sessionStorage.removeItem(`roomToken_${roomId}`)
        navigate('/games/catchmind')
    }

    // 타이머 포맷
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60)
        const sec = seconds % 60
        return `${min}:${sec.toString().padStart(2, '0')}`
    }

    // 점수 순위 - 모든 참가자를 0점부터 시작하여 표시
    const sortedScores = (room?.participants || [])
        .map(participant => ({
            userId: participant.userId,
            nickname: participant.nickname || participant.userId,
            score: (gameState.scores || {})[participant.userId] || 0,
        }))
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
            ...item,
            rank: index + 1,
        }))

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: GAME_COLORS.primary }} />
            </Box>
        )
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
            {/* 헤더 - 컴팩트 */}
            <Box
                sx={{
                    bgcolor: GAME_COLORS.primary,
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 40,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                        {room?.name || '캐치마인드'}
                    </Typography>
                    <Chip
                        label={`${gameState.currentRound}/${gameState.totalRounds}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, height: 22, fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption">
                        출제자: {room?.participants?.find(p => p.userId === gameState.currentDrawerId)?.nickname || gameState.currentDrawerId}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* 타이머 */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: timerDanger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                            px: 1.5,
                            py: 0.25,
                            borderRadius: '16px',
                            animation: timerDanger ? 'pulse 1s ease-in-out infinite' : 'none',
                            '@keyframes pulse': {
                                '0%, 100%': { bgcolor: 'rgba(239,68,68,0.2)' },
                                '50%': { bgcolor: 'rgba(239,68,68,0.4)' },
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: GAME_TYPOGRAPHY.timer.fontFamily,
                                fontWeight: 600,
                                fontSize: '1rem',
                                color: timerDanger ? '#FCA5A5' : 'white',
                            }}
                        >
                            {formatTime(timeLeft)}
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={handleStopGame}
                        size="small"
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, p: 0.5 }}
                    >
                        <StopIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            {/* 타이머 프로그레스 */}
            <LinearProgress
                variant="determinate"
                value={(timeLeft / gameState.roundTimeLimit) * 100}
                sx={{
                    height: 4,
                    bgcolor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                        bgcolor: timerDanger ? GAME_COLORS.timer.danger : GAME_COLORS.timer.normal,
                        transition: 'background-color 0.3s ease',
                    },
                }}
            />

            {/* WebSocket 에러 */}
            {wsError && (
                <Alert severity="error" sx={{ borderRadius: 0 }}>
                    {wsError}
                </Alert>
            )}

            {/* 제시어 배너 (출제자만) - 컴팩트 */}
            {isDrawer && gameState.currentWord && (
                <Box
                    sx={{
                        bgcolor: GAME_COLORS.status.playingBg,
                        py: 0.5,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        borderBottom: `2px solid ${GAME_COLORS.status.playing}`,
                    }}
                >
                    <Typography variant="caption" color={GAME_COLORS.status.playing} fontWeight={600}>
                        제시어:
                    </Typography>
                    <Typography
                        sx={{
                            fontWeight: 700,
                            fontSize: '1.25rem',
                            color: GAME_COLORS.status.playing,
                        }}
                    >
                        {gameState.currentWord}
                    </Typography>
                </Box>
            )}

            {/* 메인 영역: Split View */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden',
                }}
            >
                {/* 좌측: 캔버스 영역 (65%) */}
                <Box
                    sx={{
                        width: GAME_LAYOUT.splitView.canvas,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    <GameCanvas
                        ref={canvasRef}
                        isDrawer={canDraw}
                        onDraw={handleDraw}
                        onClear={handleClearCanvas}
                        timerDanger={timerDanger}
                    />

                    {/* 비눗방울 오버레이 */}
                    <BubbleOverlay
                        bubbles={bubbles}
                        containerWidth={GAME_LAYOUT.canvas.width}
                        containerHeight={GAME_LAYOUT.canvas.height}
                    />

                    {/* 힌트 영역 - 컴팩트 */}
                    {!isDrawer && (
                        <Box
                            sx={{
                                p: 0.75,
                                bgcolor: 'white',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Button
                                startIcon={<HintIcon sx={{ fontSize: 16 }} />}
                                disabled={gameState.hintUsed}
                                size="small"
                                sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                            >
                                {gameState.hint ? `힌트: ${gameState.hint}` : '힌트 요청'}
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* 우측: 채팅 영역 (35%) */}
                <Box
                    sx={{
                        width: GAME_LAYOUT.splitView.chat,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* 스코어 대시보드 - 컴팩트 */}
                    <Box
                        sx={{
                            p: 1,
                            bgcolor: '#F8FAFC',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <TrophyIcon sx={{ fontSize: 14, color: GAME_COLORS.rank.gold }} />
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                                점수판
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                            {sortedScores.map((item) => (
                                <Box
                                    key={item.userId}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        px: 1,
                                        py: 0.4,
                                        borderRadius: '6px',
                                        bgcolor: item.userId === currentUserId ? GAME_COLORS.primaryBg : 'white',
                                        border: '1px solid',
                                        borderColor: item.userId === currentUserId ? GAME_COLORS.primary : 'transparent',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography sx={{ fontSize: '0.75rem', minWidth: 18 }}>
                                            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `${item.rank}.`}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            fontWeight={item.userId === currentUserId ? 700 : 500}
                                            sx={{
                                                maxWidth: 80,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {item.nickname}
                                            {item.userId === currentUserId && ' (나)'}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        sx={{ color: GAME_COLORS.primary, fontSize: '0.75rem' }}
                                    >
                                        {item.score}점
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* 채팅 영역 */}
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <GameChat
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            currentUserId={currentUserId}
                            isDrawer={isDrawer}
                            currentDrawerId={gameState.currentDrawerId}
                        />
                    </Box>
                </Box>
            </Box>

            {/* 게임 종료 모달 */}
            <Dialog
                open={showEndModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '20px' },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: GAME_COLORS.primary,
                        color: 'white',
                        textAlign: 'center',
                        py: 3,
                    }}
                >
                    <TrophyIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h5" fontWeight={700}>
                        게임 종료!
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ py: 3 }}>
                    <Typography variant="h6" fontWeight={700} textAlign="center" gutterBottom>
                        최종 순위
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                        {finalRanking.map((item) => (
                            <Box
                                key={item.userId}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    bgcolor: item.rank <= 3
                                        ? item.rank === 1
                                            ? '#FEF3C7'
                                            : item.rank === 2
                                                ? '#F3F4F6'
                                                : '#FED7AA'
                                        : 'transparent',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography
                                        sx={{
                                            fontSize: '1.5rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `${item.rank}위`}
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {item.nickname}
                                        {item.userId === currentUserId && ' (나)'}
                                    </Typography>
                                </Box>
                                <Typography
                                    sx={{
                                        ...GAME_TYPOGRAPHY.score,
                                        fontSize: '1.2rem',
                                        color: GAME_COLORS.primary,
                                    }}
                                >
                                    {item.score}점
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        startIcon={<ExitIcon />}
                        onClick={handleLeave}
                        sx={{ borderRadius: '10px', textTransform: 'none' }}
                    >
                        나가기
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ReplayIcon />}
                        onClick={handleRestart}
                        sx={{
                            bgcolor: GAME_COLORS.primary,
                            '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        다시하기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CatchmindPlayPage
