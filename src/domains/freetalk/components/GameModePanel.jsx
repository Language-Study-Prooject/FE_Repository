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
import {DESIGN_TOKENS} from '../../../theme/theme'

const CANVAS_WIDTH = 340
const CANVAS_HEIGHT = 200

const GameModePanel = ({roomId, onGameMessage, initialGameStatus}) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
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

    const isDrawer = gameState.currentDrawerId === currentUserId
    const isGameActive = gameState.gameStatus === GAME_STATUS.PLAYING

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

    // 타이머
    useEffect(() => {
        if (!isGameActive || !gameState.roundStartTime) return

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - gameState.roundStartTime) / 1000)
            const remaining = Math.max(0, gameState.roundTimeLimit - elapsed)
            setTimeLeft(remaining)

            if (remaining === 0) {
                // 시간 초과 처리
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [isGameActive, gameState.roundStartTime, gameState.roundTimeLimit])

    // 게임 시작
    const handleStartGame = async () => {
        setLoading(true)
        try {
            const response = await gameService.start(roomId)
            const data = response.data || response
            setGameState(data)
            onGameMessage?.({
                type: 'game_start',
                content: `🎮 게임 시작! 총 ${data.totalRounds}라운드\n출제자: ${data.currentDrawerId}`,
            })
        } catch (err) {
            console.error('Failed to start game:', err)
        } finally {
            setLoading(false)
        }
    }

    // 게임 종료
    const handleStopGame = async () => {
        setLoading(true)
        try {
            const response = await gameService.stop(roomId)
            const data = response.data || response
            setGameState(prev => ({...prev, gameStatus: GAME_STATUS.NONE}))
            onGameMessage?.({
                type: 'game_end',
                content: `🎮 게임 종료!\n${data.message}`,
            })
        } catch (err) {
            console.error('Failed to stop game:', err)
        } finally {
            setLoading(false)
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
    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // 캔버스 드로잉
    const startDrawing = (e) => {
        if (!isDrawer) return
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            ctx.beginPath()
        }
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
    }

    // 캔버스 초기화
    useEffect(() => {
        if (canvasRef.current) {
            clearCanvas()
        }
    }, [gameState.currentRound])

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
                    onClick={handleStartGame}
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
                            <IconButton size="small" onClick={clearCanvas}>
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
