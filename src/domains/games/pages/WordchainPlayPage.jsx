import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    Typography,
} from '@mui/material'
import {
    ExitToApp as ExitIcon,
    Stop as StopIcon,
} from '@mui/icons-material'
import WordDisplay from '../components/wordchain/WordDisplay'
import WordchainTimer from '../components/wordchain/WordchainTimer'
import PlayerList from '../components/wordchain/PlayerList'
import UsedWordsList from '../components/wordchain/UsedWordsList'
import WordInput from '../components/wordchain/WordInput'
import GameEndModal from '../components/wordchain/GameEndModal'
import { gameService } from '../services/gameService'
import wordchainService from '../services/wordchainService'
import { GAME_COLORS } from '../theme/gameTheme'
import { useAuth } from '../../../contexts/AuthContext'
import { useThemeMode } from '../../../contexts/ThemeContext'
import { useChatWebSocket } from '../../freetalk/hooks/useChatWebSocket'

const WordchainPlayPage = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { mode } = useThemeMode()
    const isDark = mode === 'dark'
    const currentUserId = user?.userId || user?.username || user?.sub

    // WebSocket 연결
    const {
        isConnected,
        gameState: wsGameState,
        error: wsError,
        connect,
        disconnect,
    } = useChatWebSocket(roomId, currentUserId)

    // 로컬 게임 상태
    const [gameState, setGameState] = useState({
        status: 'PLAYING',
        currentWord: null,
        nextLetter: null,
        currentTurnUserId: null,
        turnStartTime: Date.now(),
        turnTimeLimit: 15,
        players: [],
        usedWords: [],
        winner: null,
        ranking: null,
        finalScores: null,
    })

    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState(15)
    const [showEndModal, setShowEndModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [timeoutSent, setTimeoutSent] = useState(false) // 타임아웃 중복 방지

    const isMyTurn = gameState.currentTurnUserId === currentUserId
    console.log('[WordchainPlayPage] Turn check:', { currentUserId, currentTurnUserId: gameState.currentTurnUserId, isMyTurn })

    // WebSocket에서 온 players 배열을 객체 배열로 변환 (nickname 매핑)
    const mapPlayersWithNickname = (playerIds, existingPlayers, participants) => {
        if (!playerIds || !Array.isArray(playerIds)) return existingPlayers

        // playerIds가 이미 객체 배열이면 그대로 반환
        if (playerIds.length > 0 && typeof playerIds[0] === 'object') {
            return playerIds
        }

        // 문자열 배열이면 nickname 매핑
        return playerIds.map(userId => {
            // 기존 players에서 찾기
            const existing = existingPlayers?.find(p => p.userId === userId)
            if (existing) return existing

            // room.participants에서 찾기
            const participant = participants?.find(p => p.id === userId || p.participantId === userId || p.userId === userId)
            if (participant) {
                return {
                    userId,
                    nickname: participant.nickname || participant.name || userId.substring(0, 8),
                    isAlive: true,
                }
            }

            // 못 찾으면 userId로 표시
            return {
                userId,
                nickname: userId.substring(0, 8),
                isAlive: true,
            }
        })
    }

    // WebSocket gameState 업데이트 반영
    useEffect(() => {
        if (wsGameState) {
            console.log('[WordchainPlayPage] Received wsGameState:', wsGameState)

            setGameState(prev => {
                // 턴이 변경되면 타이머 리셋
                if (wsGameState.currentTurnUserId && wsGameState.currentTurnUserId !== prev.currentTurnUserId) {
                    setTimeLeft(wsGameState.turnTimeLimit ?? prev.turnTimeLimit ?? 15)
                }

                // players 매핑
                const mappedPlayers = wsGameState.players
                    ? mapPlayersWithNickname(wsGameState.players, prev.players, room?.participants)
                    : prev.players

                return {
                    ...prev,
                    status: wsGameState.status ?? prev.status,
                    currentWord: wsGameState.currentWord ?? prev.currentWord,
                    nextLetter: wsGameState.nextLetter ?? prev.nextLetter,
                    currentTurnUserId: wsGameState.currentTurnUserId ?? prev.currentTurnUserId,
                    turnStartTime: wsGameState.turnStartTime ?? prev.turnStartTime,
                    turnTimeLimit: wsGameState.turnTimeLimit ?? prev.turnTimeLimit ?? 15,
                    players: mappedPlayers,
                    usedWords: wsGameState.usedWords ?? prev.usedWords,
                    winner: wsGameState.winner ?? prev.winner,
                    ranking: wsGameState.ranking ?? prev.ranking,
                    finalScores: wsGameState.finalScores ?? prev.finalScores,
                }
            })

            // 게임 종료 처리
            if (wsGameState.status === 'FINISHED' && !showEndModal) {
                setShowEndModal(true)
            }
        }
    }, [wsGameState, showEndModal, room])

    // 초기 로드 및 WebSocket 연결
    useEffect(() => {
        const initGame = async () => {
            try {
                setLoading(true)

                // 방 정보 조회
                const roomResponse = await gameService.getRoom(roomId)
                setRoom(roomResponse.data)

                // sessionStorage에서 WORDCHAIN_START 데이터 확인
                const savedState = sessionStorage.getItem(`wordchainState_${roomId}`)
                let gameData = null

                if (savedState) {
                    gameData = JSON.parse(savedState)
                    console.log('[WordchainPlayPage] Got saved wordchain state:', gameData)
                    // 페이지 이탈 시 삭제하도록 변경 (StrictMode 두 번 마운트 대응)
                } else {
                    // sessionStorage에 없으면 API 조회 시도
                    try {
                        const statusResponse = await wordchainService.getStatus(roomId)
                        gameData = statusResponse.data || statusResponse
                        console.log('[WordchainPlayPage] Got game status:', gameData)
                    } catch (err) {
                        // 게임 상태 조회 실패 시 WebSocket 이벤트 대기
                        console.log('[WordchainPlayPage] Failed to get status, waiting for WebSocket:', err.message)
                        // 기본 상태로 시작하고 WebSocket에서 업데이트 받음
                        gameData = {
                            currentWord: null,
                            nextLetter: null,
                            currentTurnUserId: null,
                            turnTimeLimit: 15,
                            players: roomResponse.data.participants || [],
                            usedWords: [],
                        }
                    }
                }

                setGameState({
                    status: 'PLAYING',
                    currentWord: gameData.currentWord || null,
                    nextLetter: gameData.nextLetter || null,
                    currentTurnUserId: gameData.currentTurnUserId,
                    turnStartTime: gameData.turnStartTime || Date.now(),
                    turnTimeLimit: gameData.turnTimeLimit || 15,
                    players: gameData.players || roomResponse.data.participants || [],
                    usedWords: gameData.usedWords || [],
                    winner: null,
                })

                setTimeLeft(gameData.turnTimeLimit || 15)

                // WebSocket 연결
                console.log('[WordchainPlayPage] Connecting WebSocket...')
                await connect()
                console.log('[WordchainPlayPage] WebSocket connected')
            } catch (err) {
                console.error('Failed to init game:', err)
            } finally {
                setLoading(false)
            }
        }

        initGame()

        return () => {
            console.log('[WordchainPlayPage] Disconnecting WebSocket...')
            disconnect()
        }
    }, [roomId, currentUserId, connect, disconnect])

    // 타이머
    useEffect(() => {
        if (gameState.status !== 'PLAYING') return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [gameState.status])

    // 타임아웃 처리 (한 번만 전송)
    useEffect(() => {
        if (timeLeft === 0 && isMyTurn && isConnected && !timeoutSent) {
            console.log('[WordchainPlayPage] Timer expired, sending timeout')
            setTimeoutSent(true)
            wordchainService.timeout(roomId).catch(err => {
                console.error('Failed to send timeout:', err)
            })
        }
    }, [timeLeft, isMyTurn, isConnected, timeoutSent, roomId])

    // 턴 변경 시 타임아웃 플래그 리셋
    useEffect(() => {
        setTimeoutSent(false)
    }, [gameState.currentTurnUserId])

    // 단어 제출
    const handleSubmitWord = async (word) => {
        if (!isMyTurn || submitting) return

        try {
            setSubmitting(true)
            await wordchainService.submit(roomId, word)
            // 서버에서 WebSocket으로 결과 브로드캐스트
        } catch (err) {
            console.error('Failed to submit word:', err)
            alert(err.response?.data?.message || err.message || '단어 제출에 실패했습니다')
        } finally {
            setSubmitting(false)
        }
    }

    // 게임 종료
    const handleStopGame = async () => {
        disconnect()
        try {
            await wordchainService.stop(roomId)
        } catch (err) {
            console.error('Failed to stop game:', err)
            // 에러가 나도 무시하고 진행
        }
        sessionStorage.removeItem(`roomToken_${roomId}`)
        sessionStorage.removeItem(`wordchainState_${roomId}`)
        navigate('/games/wordchain')
    }

    // 재시작
    const handleRestart = async () => {
        try {
            disconnect()
            await gameService.restartGame(roomId)
            setShowEndModal(false)
            navigate(`/games/wordchain/${roomId}/waiting`)
        } catch (err) {
            console.error('Failed to restart:', err)
            setShowEndModal(false)
            navigate(`/games/wordchain/${roomId}/waiting`)
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
        navigate('/games/wordchain')
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: GAME_COLORS.primary }} />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#27272a' : '#F1F5F9', pb: 4 }}>
            {/* 헤더 */}
            <Box
                sx={{
                    bgcolor: GAME_COLORS.primary,
                    color: 'white',
                    px: 3,
                    py: 2,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                {room?.name || '끝말잇기'}
                            </Typography>
                            <Chip
                                label={isConnected ? '연결됨' : '연결 중...'}
                                size="small"
                                sx={{
                                    bgcolor: isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)',
                                    color: 'white',
                                    fontWeight: 600,
                                    height: 22,
                                }}
                            />
                        </Box>

                        <IconButton
                            onClick={handleStopGame}
                            size="small"
                            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <StopIcon />
                        </IconButton>
                    </Box>
                </Container>
            </Box>

            {/* WebSocket 에러 */}
            {wsError && (
                <Container maxWidth="lg" sx={{ mt: 2 }}>
                    <Alert severity="error" sx={{ borderRadius: '12px' }}>
                        {wsError}
                    </Alert>
                </Container>
            )}

            {/* 메인 컨텐츠 */}
            <Container maxWidth="lg" sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    {/* 좌측: 게임 영역 */}
                    <Grid item xs={12} md={8}>
                        {/* 타이머 & 현재 턴 */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 3,
                                p: 3,
                                bgcolor: isDark ? '#27272a' : 'white',
                                borderRadius: '16px',
                            }}
                        >
                            <Box>
                                <Typography variant="caption" color="text.secondary" gutterBottom>
                                    현재 턴
                                </Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {gameState.players.find(p => p.userId === gameState.currentTurnUserId)?.nickname ||
                                        gameState.currentTurnUserId ||
                                        '대기 중'}
                                </Typography>
                                {isMyTurn && (
                                    <Chip
                                        label="내 차례!"
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            bgcolor: GAME_COLORS.primaryBg,
                                            color: GAME_COLORS.primary,
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </Box>
                            <WordchainTimer timeLeft={timeLeft} timeLimit={gameState.turnTimeLimit} />
                        </Box>

                        {/* 현재 단어 & 다음 글자 */}
                        <Box sx={{ mb: 3 }}>
                            <WordDisplay
                                currentWord={gameState.currentWord}
                                nextLetter={gameState.nextLetter}
                                isMyTurn={isMyTurn}
                            />
                        </Box>

                        {/* 단어 입력 */}
                        <Box
                            sx={{
                                p: 3,
                                bgcolor: isDark ? '#27272a' : 'white',
                                borderRadius: '16px',
                            }}
                        >
                            <WordInput
                                onSubmit={handleSubmitWord}
                                disabled={submitting || timeLeft === 0}
                                nextLetter={gameState.nextLetter}
                                isMyTurn={isMyTurn}
                            />
                        </Box>
                    </Grid>

                    {/* 우측: 플레이어 & 사용된 단어 */}
                    <Grid item xs={12} md={4}>
                        {/* 플레이어 목록 */}
                        <Box
                            sx={{
                                p: 2.5,
                                bgcolor: isDark ? '#27272a' : 'white',
                                borderRadius: '16px',
                                mb: 3,
                            }}
                        >
                            <PlayerList
                                players={gameState.players}
                                currentTurnUserId={gameState.currentTurnUserId}
                                currentUserId={currentUserId}
                            />
                        </Box>

                        {/* 사용된 단어 */}
                        <Box
                            sx={{
                                p: 2.5,
                                bgcolor: isDark ? '#27272a' : 'white',
                                borderRadius: '16px',
                            }}
                        >
                            <UsedWordsList words={gameState.usedWords} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* 게임 종료 모달 */}
            <GameEndModal
                open={showEndModal}
                winner={gameState.winner}
                finalPlayers={gameState.players}
                ranking={gameState.ranking}
                onRestart={handleRestart}
                onExit={handleLeave}
                currentUserId={currentUserId}
            />
        </Box>
    )
}

export default WordchainPlayPage
