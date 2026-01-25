import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Typography,
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    PlayArrow as PlayIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material'
import ParticipantList from '../components/ParticipantList'
import WaitingChat from '../components/WaitingChat'
import { gameService } from '../services/gameService'
import { wordchainService } from '../services/wordchainService'
import { GAME_COLORS } from '../theme/gameTheme'
import { useAuth } from '../../../contexts/AuthContext'
import { useThemeMode } from '../../../contexts/ThemeContext'
import { useChatWebSocket } from '../../freetalk/hooks/useChatWebSocket'

const WordchainWaitingPage = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { mode } = useThemeMode()
    const isDark = mode === 'dark'
    const currentUserId = user?.userId || user?.username || user?.sub

    // WebSocket 연결
    const {
        isConnected,
        messages: wsMessages,
        gameState: wsGameState,
        error: wsError,
        connect,
        disconnect,
        sendMessage: wsSendMessage,
    } = useChatWebSocket(roomId, currentUserId)

    const [room, setRoom] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [starting, setStarting] = useState(false)

    // 채팅 메시지 (WebSocket 연동)
    const [messages, setMessages] = useState([
        {
            id: 'system-1',
            content: '게임 대기실에 입장했습니다.',
            isSystem: true,
            createdAt: new Date().toISOString(),
        },
    ])

    // WebSocket 메시지 동기화
    useEffect(() => {
        if (wsMessages && wsMessages.length > 0) {
            setMessages(prev => {
                const systemMessages = prev.filter(m => m.isSystem && m.id === 'system-1')
                const existingIds = new Set(systemMessages.map(m => m.id))
                const uniqueWsMessages = wsMessages.filter(m => !existingIds.has(m.id))
                const allMessages = [...systemMessages, ...uniqueWsMessages]
                const seen = new Set()
                return allMessages.filter(m => {
                    if (seen.has(m.id)) return false
                    seen.add(m.id)
                    return true
                })
            })
        }
    }, [wsMessages])

    // 게임 시작 감지 (WebSocket GAME_START 이벤트)
    useEffect(() => {
        if (wsGameState?.status === 'PLAYING') {
            console.log('[WordchainWaitingPage] Game started via WebSocket, navigating to play page')
            navigate(`/games/wordchain/${roomId}/play`)
        }
    }, [wsGameState?.status, roomId, navigate])

    // 방 정보 조회
    const fetchRoom = useCallback(async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true)
            }
            const response = await gameService.getRoom(roomId)
            setRoom(response.data)

            // 게임이 시작되면 플레이 페이지로 이동
            if (response.data.status === 'PLAYING') {
                navigate(`/games/wordchain/${roomId}/play`)
            }
        } catch (err) {
            console.error('Failed to fetch room:', err)
            setError('방 정보를 불러오는데 실패했습니다')
        } finally {
            if (showLoading) {
                setLoading(false)
            }
        }
    }, [roomId, navigate])

    // 초기 로딩 및 WebSocket 연결
    useEffect(() => {
        const init = async () => {
            await fetchRoom(true)
            console.log('[WordchainWaitingPage] Connecting WebSocket...')
            try {
                await connect()
                console.log('[WordchainWaitingPage] WebSocket connected')
            } catch (err) {
                console.error('[WordchainWaitingPage] WebSocket connection failed:', err)
            }
        }
        init()

        return () => {
            console.log('[WordchainWaitingPage] Disconnecting WebSocket...')
            disconnect()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // 주기적 새로고침
    useEffect(() => {
        const interval = setInterval(() => fetchRoom(false), 3000)
        return () => clearInterval(interval)
    }, [fetchRoom])

    // 게임 시작
    const handleStartGame = async () => {
        try {
            setStarting(true)
            await wordchainService.start(roomId)
            navigate(`/games/wordchain/${roomId}/play`)
        } catch (err) {
            console.error('Failed to start game:', err)
            const errorMessage = err.response?.data?.message || err.message || '게임 시작에 실패했습니다'
            setError(errorMessage)
        } finally {
            setStarting(false)
        }
    }

    // 방 나가기
    const handleLeaveRoom = async () => {
        try {
            disconnect()
            await gameService.leaveRoom(roomId)
            sessionStorage.removeItem(`roomToken_${roomId}`)
            navigate('/games/wordchain')
        } catch (err) {
            console.error('Failed to leave room:', err)
        }
    }

    // 채팅 메시지 전송
    const handleSendMessage = (content) => {
        if (isConnected) {
            console.log('[WordchainWaitingPage] Sending message via WebSocket:', content)
            wsSendMessage(content, 'TEXT')
        } else {
            const newMessage = {
                id: `msg-${Date.now()}`,
                userId: currentUserId,
                nickname: user?.nickname || user?.username || '플레이어',
                content,
                createdAt: new Date().toISOString(),
            }
            setMessages(prev => [...prev, newMessage])
        }
    }

    const isHost = room?.hostId === currentUserId
    const canStart = isHost && room?.currentParticipants >= 2

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress sx={{ color: GAME_COLORS.primary }} />
            </Box>
        )
    }

    if (!room) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    방을 찾을 수 없습니다
                </Typography>
                <Button onClick={() => navigate('/games/wordchain')} sx={{ mt: 2 }}>
                    로비로 돌아가기
                </Button>
            </Container>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#27272a' : '#F8FAFC' }}>
            {/* 헤더 */}
            <Box
                sx={{
                    bgcolor: GAME_COLORS.primary,
                    color: 'white',
                    py: 2,
                    px: 3,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={handleLeaveRoom} sx={{ color: 'white' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {room.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={`${room.currentParticipants}/${room.maxParticipants}명`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'white',
                                            fontWeight: 600,
                                            height: 22,
                                        }}
                                    />
                                    <Chip
                                        label="대기중"
                                        size="small"
                                        sx={{
                                            bgcolor: GAME_COLORS.status.waitingBg,
                                            color: GAME_COLORS.status.waiting,
                                            fontWeight: 600,
                                            height: 22,
                                        }}
                                    />
                                    <Chip
                                        label={isConnected ? '연결됨' : '연결 중...'}
                                        size="small"
                                        sx={{
                                            bgcolor: isConnected ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)',
                                            color: 'white',
                                            fontWeight: 600,
                                            height: 22,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {isHost && (
                            <IconButton sx={{ color: 'white' }}>
                                <SettingsIcon />
                            </IconButton>
                        )}
                    </Box>
                </Container>
            </Box>

            {/* 에러 */}
            {(error || wsError) && (
                <Container maxWidth="lg" sx={{ mt: 2 }}>
                    <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: '12px' }}>
                        {error || wsError}
                    </Alert>
                </Container>
            )}

            {/* 메인 컨텐츠 */}
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
                        gap: 3,
                        height: 'calc(100vh - 200px)',
                    }}
                >
                    {/* 좌측: 참가자 목록 */}
                    <Card
                        sx={{
                            p: 2,
                            borderRadius: '16px',
                            height: 'fit-content',
                        }}
                    >
                        <ParticipantList
                            participants={room.participants || []}
                            maxParticipants={room.maxParticipants}
                            currentUserId={currentUserId}
                        />
                    </Card>

                    {/* 우측: 대기 채팅 */}
                    <Card
                        sx={{
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                                대기 채팅
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minHeight: 0 }}>
                            <WaitingChat
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                currentUserId={currentUserId}
                            />
                        </Box>
                    </Card>
                </Box>

                {/* 하단: 게임 설정 + 시작 버튼 */}
                <Card
                    sx={{
                        mt: 3,
                        p: 2.5,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                턴 시간
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                                {room.gameSettings?.turnTimeLimit || 15}초
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                난이도
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                                {room.level || 'INTERMEDIATE'}
                            </Typography>
                        </Box>
                    </Box>

                    {isHost ? (
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PlayIcon />}
                            onClick={handleStartGame}
                            disabled={!canStart || starting}
                            sx={{
                                bgcolor: canStart ? GAME_COLORS.status.waiting : '#9CA3AF',
                                '&:hover': { bgcolor: canStart ? '#059669' : '#9CA3AF' },
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1.5,
                            }}
                        >
                            {starting ? '시작 중...' : canStart ? '게임 시작' : '2명 이상 필요'}
                        </Button>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                방장이 게임을 시작할 때까지 기다려주세요
                            </Typography>
                            <CircularProgress size={24} sx={{ mt: 1, color: GAME_COLORS.primary }} />
                        </Box>
                    )}
                </Card>
            </Container>
        </Box>
    )
}

export default WordchainWaitingPage
