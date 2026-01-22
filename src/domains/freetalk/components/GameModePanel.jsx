import {useCallback, useEffect, useRef, useState} from 'react'
import {Box, Button, Chip, IconButton, LinearProgress, Tooltip, Typography, useTheme,} from '@mui/material'
import {
    Delete as ClearIcon,
    EmojiEvents as TrophyIcon,
    Lightbulb as HintIcon,
    PlayArrow as PlayIcon,
    SkipNext as SkipIcon,
    Stop as StopIcon,
} from '@mui/icons-material'
import {GAME_STATUS, gameService} from '../../chat/services/chatService'
import {useAuth} from '../../../contexts/AuthContext'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {DESIGN_TOKENS} from '../../../theme/theme'

const CANVAS_WIDTH = 340
const CANVAS_HEIGHT = 200

const GameModePanel = ({roomId, onGameMessage, initialGameStatus, wsGameState, isConnected, onStartGame, onStopGame, onSendMessage, onSendDrawing, onClearDrawing, receivedDrawing, onDrawingProcessed, shouldClearCanvas, onCanvasCleared, messages, correctAnswerBubble, onBubbleProcessed}) => {
    const theme = useTheme()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
    const {user} = useAuth()
    const currentUserId = user?.userId || user?.username
    const canvasRef = useRef(null)
    const [gameState, setGameState] = useState({
        gameStatus: initialGameStatus || GAME_STATUS.NONE,
        currentRound: 0,
        totalRounds: 5,
        currentDrawerId: null,
        currentWord: null,
        roundStartTime: null,
        roundTimeLimit: 60,
        scores: {},
        hintUsed: false,
    })
    const [timeLeft, setTimeLeft] = useState(60)
    const [isDrawing, setIsDrawing] = useState(false)
    const [brushColor, setBrushColor] = useState('#000000')
    const [brushSize, setBrushSize] = useState(3)
    const [loading, setLoading] = useState(false)
    const [currentStroke, setCurrentStroke] = useState([]) // 현재 그리는 스트로크
    const [bubbles, setBubbles] = useState([]) // 비눗방울 애니메이션

    const isDrawer = gameState.currentDrawerId === currentUserId
    const isGameActive = gameState.gameStatus === GAME_STATUS.PLAYING

    // 최신 값을 interval에서 사용하기 위한 ref
    const isDrawerRef = useRef(isDrawer)
    const isConnectedRef = useRef(isConnected)
    const onSendMessageRef = useRef(onSendMessage)
    useEffect(() => {
        isDrawerRef.current = isDrawer
        isConnectedRef.current = isConnected
        onSendMessageRef.current = onSendMessage
    }, [isDrawer, isConnected, onSendMessage])

    // 디버깅 로그
    console.log('[GameModePanel] State:', {
        isDrawer,
        isGameActive,
        currentDrawerId: gameState.currentDrawerId,
        currentUserId,
        gameStatus: gameState.gameStatus
    })

    // 게임 상태 조회
    const fetchGameStatus = useCallback(async () => {
        try {
            const response = await gameService.getStatus(roomId)
            const data = response.data || response
            setGameState(prev => ({
                ...prev,
                ...data,
                gameStatus: data.gameStatus || GAME_STATUS.NONE,
            }))
        } catch (err) {
            console.error('Failed to fetch game status:', err)
        }
    }, [roomId])

    // 마운트 시 게임 상태 조회
    useEffect(() => {
        if (roomId) {
            fetchGameStatus()
        }
    }, [roomId, fetchGameStatus])

    // 부모 컴포넌트의 게임 상태 변경 반영
    useEffect(() => {
        if (initialGameStatus) {
            setGameState(prev => ({
                ...prev,
                gameStatus: initialGameStatus,
            }))
        }
    }, [initialGameStatus])

    // WebSocket 게임 상태 동기화 (제시어, 출제자, 라운드 등)
    useEffect(() => {
        if (wsGameState) {
            console.log('[GameModePanel] Syncing wsGameState:', wsGameState)
            setGameState(prev => ({
                ...prev,
                gameStatus: wsGameState.status === 'PLAYING' ? GAME_STATUS.PLAYING :
                           wsGameState.status === 'FINISHED' ? GAME_STATUS.NONE : prev.gameStatus,
                currentRound: wsGameState.currentRound ?? prev.currentRound,
                totalRounds: wsGameState.totalRounds ?? prev.totalRounds,
                currentDrawerId: wsGameState.currentDrawerId ?? prev.currentDrawerId,
                currentWord: wsGameState.currentWord ?? prev.currentWord,
                roundStartTime: wsGameState.roundStartTime ?? prev.roundStartTime,
                scores: wsGameState.scores ?? prev.scores,
                hintUsed: wsGameState.hintUsed ?? prev.hintUsed,
                hint: wsGameState.hint ?? prev.hint,
            }))
        }
    }, [wsGameState])

    // 타이머 + 자동 스킵 (출제자만)
    const autoSkipSentRef = useRef(false)
    useEffect(() => {
        if (!isGameActive || !gameState.roundStartTime) return

        // 새 라운드 시작 시 autoSkip 플래그 초기화
        autoSkipSentRef.current = false

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameState.roundStartTime) / 1000)
            const remaining = Math.max(0, gameState.roundTimeLimit - elapsed)
            setTimeLeft(remaining)

            // 시간 초과 시 자동 스킵 (출제자만, 연결된 경우만, 한 번만 전송)
            // ref를 사용해서 최신 값 확인
            if (remaining === 0 && isDrawerRef.current && isConnectedRef.current && !autoSkipSentRef.current && onSendMessageRef.current) {
                console.log('[GameModePanel] Time expired, auto-skipping... isDrawer:', isDrawerRef.current, 'isConnected:', isConnectedRef.current)
                autoSkipSentRef.current = true
                onSendMessageRef.current('/skip', 'TEXT')
                clearInterval(interval)
            } else if (remaining === 0) {
                console.log('[GameModePanel] Time expired, but cannot skip. isDrawer:', isDrawerRef.current, 'isConnected:', isConnectedRef.current)
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isGameActive, gameState.roundStartTime, gameState.roundTimeLimit])

    // 게임 시작 - WebSocket을 통해 /start 명령어 전송 (서버에서 인원 검증)
    const handleStartGame = () => {
        console.log('[GameModePanel] handleStartGame called, onStartGame:', !!onStartGame)
        if (onStartGame) {
            // WebSocket으로 /start 명령어 전송 (채팅창에서 /start 입력과 동일)
            const result = onStartGame()
            console.log('[GameModePanel] onStartGame result:', result)
        } else {
            // fallback: REST API 사용 (WebSocket 미연결 시)
            setLoading(true)
            gameService.start(roomId)
                .then(response => {
                    const data = response.data || response
                    setGameState(data)
                    onGameMessage?.({
                        type: 'game_start',
                        content: `🎮 게임 시작! 총 ${data.totalRounds}라운드\n출제자: ${data.currentDrawerId}`,
                    })
                })
                .catch(err => console.error('Failed to start game:', err))
                .finally(() => setLoading(false))
        }
    }

    // 게임 종료 - WebSocket을 통해 /stop 명령어 전송
    const handleStopGame = () => {
        if (onStopGame) {
            // WebSocket으로 /stop 명령어 전송 (채팅창에서 /stop 입력과 동일)
            onStopGame()
        } else {
            // fallback: REST API 사용 (WebSocket 미연결 시)
            setLoading(true)
            gameService.stop(roomId)
                .then(response => {
                    const data = response.data || response
                    setGameState(prev => ({...prev, gameStatus: GAME_STATUS.NONE}))
                    onGameMessage?.({
                        type: 'game_end',
                        content: `🎮 게임 종료!\n${data.message}`,
                    })
                })
                .catch(err => console.error('Failed to stop game:', err))
                .finally(() => setLoading(false))
        }
    }

    // 라운드 스킵
    const handleSkipRound = async () => {
        try {
            const response = await gameService.skipRound(roomId)
            const data = response.data || response
            if (data.gameStatus === GAME_STATUS.FINISHED) {
                setGameState(prev => ({...prev, gameStatus: GAME_STATUS.FINISHED}))
            } else {
                setGameState(prev => ({
                    ...prev,
                    currentRound: data.currentRound,
                    currentDrawerId: data.currentDrawerId,
                    currentWord: data.currentWord,
                    roundStartTime: Date.now(),
                    hintUsed: false,
                }))
            }
            onGameMessage?.({
                type: 'round_end',
                content: data.message,
            })
        } catch (err) {
            console.error('Failed to skip round:', err)
        }
    }

    // 힌트 제공
    const handleHint = async () => {
        try {
            const response = await gameService.requestHint(roomId)
            const data = response.data || response
            if (data.hint) {
                setGameState(prev => ({...prev, hintUsed: true}))
                onGameMessage?.({
                    type: 'hint',
                    content: `💡 힌트: ${data.hint}`,
                })
            }
        } catch (err) {
            console.error('Failed to get hint:', err)
        }
    }

    // 캔버스 초기화
    const clearCanvas = (sendToOthers = false) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 다른 사용자에게도 초기화 메시지 전송
        if (sendToOthers && onClearDrawing) {
            onClearDrawing()
        }
    }

    // 캔버스 드로잉 - 스트로크 배열 방식
    const startDrawing = (e) => {
        if (!isDrawer) return
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        setIsDrawing(true)
        // 스트로크 시작
        setCurrentStroke([{x, y, type: 'start', color: brushColor, width: brushSize}])

        const ctx = canvas.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const stopDrawing = () => {
        if (!isDrawing) return
        setIsDrawing(false)

        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.beginPath()
        }

        // 스트로크 완료 시 WebSocket으로 전송
        if (currentStroke.length > 0 && onSendDrawing) {
            const strokeData = [...currentStroke, {type: 'end'}]
            console.log('[GameModePanel] Sending stroke:', strokeData)
            onSendDrawing(JSON.stringify(strokeData))
        } else {
            console.log('[GameModePanel] Not sending:', {strokeLength: currentStroke.length, hasOnSendDrawing: !!onSendDrawing})
        }
        setCurrentStroke([])
    }

    const draw = (e) => {
        if (!isDrawing || !isDrawer) return
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        ctx.lineWidth = brushSize
        ctx.lineCap = 'round'
        ctx.strokeStyle = brushColor
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y)

        // 스트로크에 좌표 추가
        setCurrentStroke(prev => [...prev, {x, y, type: 'move'}])
    }

    // 캔버스 초기화 (라운드 변경 시)
    useEffect(() => {
        if (canvasRef.current) {
            clearCanvas()
        }
    }, [gameState.currentRound])

    // 원격 캔버스 초기화 (다른 사용자가 초기화 시)
    useEffect(() => {
        if (shouldClearCanvas && canvasRef.current) {
            console.log('[GameModePanel] Clearing canvas from remote')
            clearCanvas(false) // 다시 전송하지 않음
            onCanvasCleared?.()
        }
    }, [shouldClearCanvas, onCanvasCleared])

    // 수신된 그리기 데이터를 캔버스에 그리기
    useEffect(() => {
        if (!receivedDrawing || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        try {
            // content에서 스트로크 데이터 파싱
            const content = receivedDrawing.content
            const strokeData = typeof content === 'string' ? JSON.parse(content) : content

            console.log('[GameModePanel] Drawing received stroke:', strokeData)

            if (!Array.isArray(strokeData)) return

            // 스트로크 그리기
            strokeData.forEach((point, index) => {
                if (point.type === 'start') {
                    ctx.beginPath()
                    ctx.moveTo(point.x, point.y)
                    ctx.lineWidth = point.width || 3
                    ctx.lineCap = 'round'
                    ctx.strokeStyle = point.color || '#000000'
                } else if (point.type === 'move') {
                    ctx.lineTo(point.x, point.y)
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(point.x, point.y)
                } else if (point.type === 'end') {
                    ctx.beginPath()
                }
            })

            // 처리 완료 알림
            onDrawingProcessed?.()
        } catch (err) {
            console.error('[GameModePanel] Error drawing received data:', err)
        }
    }, [receivedDrawing, onDrawingProcessed])

    // 비눗방울 애니메이션 생성
    const createBubble = useCallback((userId, content, isCorrect = false) => {
        const id = `bubble-${Date.now()}-${Math.random()}`
        const bubble = {
            id,
            userId,
            content,
            isCorrect,
            x: Math.random() * (CANVAS_WIDTH - 100) + 50, // 랜덤 x 위치
            startTime: Date.now(),
        }
        setBubbles(prev => [...prev, bubble])

        // 3초 후 자동 삭제
        setTimeout(() => {
            setBubbles(prev => prev.filter(b => b.id !== id))
        }, 3000)
    }, [])

    // correctAnswerBubble prop으로 정답 버블 생성 (정답일 때 특별 효과)
    // 백엔드가 정답 시 자동으로 ROUND_END를 보내므로 프론트엔드에서 /skip 불필요
    useEffect(() => {
        if (correctAnswerBubble) {
            createBubble(correctAnswerBubble.userId, correctAnswerBubble.content, true) // isCorrect = true
            onBubbleProcessed?.()
            // 백엔드가 정답 처리 후 자동으로 라운드 전환하므로 /skip 제거
        }
    }, [correctAnswerBubble, createBubble, onBubbleProcessed])

    // 게임 중 모든 채팅 메시지를 비눗방울로 표시
    const lastMessageIdRef = useRef(null)
    useEffect(() => {
        if (!isGameActive || !messages || messages.length === 0) return

        // 마지막 메시지만 처리 (중복 방지)
        const lastMessage = messages[messages.length - 1]
        if (!lastMessage || lastMessage.id === lastMessageIdRef.current) return
        if (lastMessage.isSystem || lastMessage.messageType === 'SYSTEM') return
        if (lastMessage.messageType === 'DRAWING' || lastMessage.messageType === 'DRAWING_CLEAR') return

        // 출제자의 메시지는 제외 (출제자가 답을 알려줘선 안 됨)
        if (lastMessage.userId === gameState.currentDrawerId) return

        lastMessageIdRef.current = lastMessage.id
        createBubble(lastMessage.userId, lastMessage.content, false) // isCorrect = false
    }, [messages, isGameActive, gameState.currentDrawerId, createBubble])

    // 점수 정렬
    const sortedScores = Object.entries(gameState.scores || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)

    if (gameState.gameStatus === GAME_STATUS.NONE) {
        return (
            <Box sx={{p: 2, textAlign: 'center'}}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    캐치마인드 게임을 시작해보세요!
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PlayIcon/>}
                    onClick={() => {
                        console.log('[GameModePanel] Button clicked!')
                        handleStartGame()
                    }}
                    disabled={loading}
                    size="small"
                >
                    게임 시작
                </Button>
                <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}>
                    또는 채팅창에 /start 입력
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
            {/* 게임 헤더 */}
            <Box
                sx={{
                    p: 1,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Chip
                        label={`${gameState.currentRound}/${gameState.totalRounds}`}
                        size="small"
                        sx={{bgcolor: 'rgba(255,255,255,0.2)', color: 'white'}}
                    />
                    <Typography variant="caption">
                        출제자: {gameState.currentDrawerId}
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                    <Typography variant="body2" fontWeight={600}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </Typography>
                </Box>
            </Box>

            {/* 타이머 진행바 */}
            <LinearProgress
                variant="determinate"
                value={(timeLeft / gameState.roundTimeLimit) * 100}
                sx={{
                    height: 4,
                    '& .MuiLinearProgress-bar': {
                        bgcolor: timeLeft <= 10 ? 'error.main' : 'primary.main',
                    },
                }}
            />

            {/* 출제어 (출제자만 보임) */}
            {isDrawer && (
                <Box
                    sx={{
                        p: 1,
                        bgcolor: 'warning.light',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="caption" color="warning.dark">
                        제시어
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="warning.dark">
                        {gameState.currentWord}
                    </Typography>
                </Box>
            )}

            {/* 캔버스 영역 */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f5f5f5',
                    position: 'relative',
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onMouseLeave={stopDrawing}
                    style={{
                        border: `2px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#e0e0e0'}`,
                        borderRadius: DESIGN_TOKENS.borderRadius.sm,
                        backgroundColor: 'white',
                        cursor: isDrawer ? 'crosshair' : 'default',
                        width: '100%',
                        height: CANVAS_HEIGHT,
                    }}
                />

                {/* 비눗방울 애니메이션 (모든 추측 + 정답) */}
                {bubbles.map(bubble => {
                    const elapsed = (Date.now() - bubble.startTime) / 1000
                    const progress = Math.min(elapsed / 3, 1) // 3초 동안 애니메이션
                    const y = CANVAS_HEIGHT * (1 - progress) // 아래에서 위로
                    const opacity = 1 - progress * 0.8 // 점점 투명해짐
                    const scale = 1 + progress * 0.3 // 약간 커짐

                    return (
                        <Box
                            key={bubble.id}
                            sx={{
                                position: 'absolute',
                                left: bubble.x,
                                top: y,
                                transform: `translate(-50%, -50%) scale(${scale})`,
                                opacity,
                                pointerEvents: 'none',
                                transition: 'all 0.1s linear',
                                animation: 'float 3s ease-out forwards',
                                '@keyframes float': {
                                    '0%': {
                                        transform: 'translate(-50%, 0) scale(1)',
                                        opacity: 1,
                                    },
                                    '100%': {
                                        transform: 'translate(-50%, -200px) scale(1.3)',
                                        opacity: 0,
                                    },
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    // 정답은 금색, 일반 추측은 파란색 비눗방울
                                    background: bubble.isCorrect
                                        ? 'linear-gradient(135deg, rgba(255,215,0,0.95) 0%, rgba(255,193,7,0.9) 50%, rgba(255,152,0,0.85) 100%)'
                                        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(173,216,230,0.8) 50%, rgba(135,206,250,0.7) 100%)',
                                    borderRadius: '50%',
                                    padding: '8px 12px',
                                    boxShadow: bubble.isCorrect
                                        ? '0 4px 20px rgba(255,193,7,0.5), inset 0 -2px 10px rgba(255,255,255,0.6)'
                                        : '0 4px 15px rgba(100,149,237,0.3), inset 0 -2px 10px rgba(255,255,255,0.5)',
                                    border: bubble.isCorrect
                                        ? '2px solid rgba(255,215,0,0.8)'
                                        : '1px solid rgba(255,255,255,0.6)',
                                    backdropFilter: 'blur(2px)',
                                    minWidth: 60,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        fontWeight: 700,
                                        color: bubble.isCorrect ? '#b8860b' : '#047857',
                                        fontSize: '0.65rem',
                                    }}
                                >
                                    {bubble.isCorrect ? '🎉 ' : ''}{bubble.userId}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: bubble.isCorrect ? '#8b4513' : '#059669',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {bubble.content}
                                </Typography>
                            </Box>
                        </Box>
                    )
                })}

                {/* 그리기 도구 (출제자만) */}
                {isDrawer && (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
                        {['#000000', '#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff'].map((color) => (
                            <Box
                                key={color}
                                onClick={() => setBrushColor(color)}
                                sx={{
                                    width: 20,
                                    height: 20,
                                    bgcolor: color,
                                    borderRadius: '50%',
                                    border: brushColor === color
                                        ? `2px solid ${isDark ? 'white' : '#333'}`
                                        : `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : '#ccc'}`,
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                        <Tooltip title="지우기">
                            <IconButton size="small" onClick={() => clearCanvas(true)}>
                                <ClearIcon fontSize="small"/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>

            {/* 점수판 */}
            {sortedScores.length > 0 && (
                <Box sx={{p: 1, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5}}>
                        <TrophyIcon sx={{fontSize: 16, color: 'warning.main'}}/>
                        <Typography variant="caption" fontWeight={600}>
                            점수
                        </Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                        {sortedScores.map(([userId, score], idx) => (
                            <Chip
                                key={userId}
                                label={`${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : ''} ${userId}: ${score}`}
                                size="small"
                                sx={{fontSize: '0.65rem'}}
                            />
                        ))}
                    </Box>
                </Box>
            )}

            {/* 게임 컨트롤 */}
            <Box
                sx={{
                    p: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                {isDrawer ? (
                    <>
                        <Button
                            size="small"
                            startIcon={<HintIcon/>}
                            onClick={handleHint}
                            disabled={gameState.hintUsed}
                        >
                            힌트
                        </Button>
                        <Button
                            size="small"
                            startIcon={<SkipIcon/>}
                            onClick={handleSkipRound}
                        >
                            스킵
                        </Button>
                    </>
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        정답을 채팅으로 입력하세요!
                    </Typography>
                )}
                <Button
                    size="small"
                    color="error"
                    startIcon={<StopIcon/>}
                    onClick={handleStopGame}
                    disabled={loading}
                >
                    종료
                </Button>
            </Box>
        </Box>
    )
}

export default GameModePanel
