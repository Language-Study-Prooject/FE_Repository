import {useCallback, useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
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
import {gameService} from '../services/gameService'
import {GAME_COLORS} from '../theme/gameTheme'
import {useAuth} from '../../../contexts/AuthContext'
import {useChatWebSocket} from '../../freetalk/hooks/useChatWebSocket'

const CatchmindWaitingPage = () => {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
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
    const [isInitialLoad, setIsInitialLoad] = useState(true)
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
                // 시스템 메시지는 유지
                const systemMessages = prev.filter(m => m.isSystem && m.id === 'system-1')
                // wsMessages에서 중복 제거 (ID 기준)
                const existingIds = new Set(systemMessages.map(m => m.id))
                const uniqueWsMessages = wsMessages.filter(m => !existingIds.has(m.id))
                // ID 기준으로 중복 제거된 최종 배열
                const allMessages = [...systemMessages, ...uniqueWsMessages]
                // 혹시 wsMessages 내에서도 중복이 있을 수 있으므로 다시 한번 ID 기준 중복 제거
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
            console.log('[CatchmindWaitingPage] Game started via WebSocket, navigating to play page')
            navigate(`/games/catchmind/${roomId}/play`)
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
                navigate(`/games/catchmind/${roomId}/play`)
            }
        } catch (err) {
            console.error('Failed to fetch room:', err)
            setError('방 정보를 불러오는데 실패했습니다')
        } finally {
            if (showLoading) {
                setLoading(false)
            }
            setIsInitialLoad(false)
        }
    }, [roomId, navigate])

    // 초기 로딩 및 WebSocket 연결
    useEffect(() => {
        const init = async () => {
            await fetchRoom(true)
            // WebSocket 연결
            console.log('[CatchmindWaitingPage] Connecting WebSocket...')
            try {
                await connect()
                console.log('[CatchmindWaitingPage] WebSocket connected')
            } catch (err) {
                console.error('[CatchmindWaitingPage] WebSocket connection failed:', err)
            }
        }
        init()

        // 컴포넌트 언마운트 시 WebSocket 연결 해제
        return () => {
            console.log('[CatchmindWaitingPage] Disconnecting WebSocket...')
            disconnect()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // 주기적 새로고침 (로딩 표시 없이 백그라운드 갱신)
    useEffect(() => {
        const interval = setInterval(() => fetchRoom(false), 3000)
        return () => clearInterval(interval)
    }, [fetchRoom])

    // 게임 시작
    const handleStartGame = async () => {
        try {
            setStarting(true)
            await gameService.startGame(roomId)
            // WebSocket GAME_START 이벤트로 자동 이동하지만, fallback으로 직접 이동
            navigate(`/games/catchmind/${roomId}/play`)
        } catch (err) {
            console.error('Failed to start game:', err)
            // 백엔드 에러 메시지 추출
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
            // 저장된 roomToken 삭제
            sessionStorage.removeItem(`roomToken_${roomId}`)
            navigate('/games/catchmind')
        } catch (err) {
            console.error('Failed to leave room:', err)
        }
    }

    // 채팅 메시지 전송 (WebSocket 연동)
    const handleSendMessage = (content) => {
        if (isConnected) {
            // WebSocket으로 메시지 전송
            console.log('[CatchmindWaitingPage] Sending message via WebSocket:', content)
            wsSendMessage(content, 'TEXT')
        } else {
            // WebSocket 연결 안 됐을 때 fallback (로컬만)
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
                <Button onClick={() => navigate('/games/catchmind')} sx={{ mt: 2 }}>
                    로비로 돌아가기
                </Button>
            </Container>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
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
                                라운드
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                                {room.gameSettings?.maxRounds || 5}라운드
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                시간 제한
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                                {room.gameSettings?.roundTimeLimit || 60}초
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

export default CatchmindWaitingPage
