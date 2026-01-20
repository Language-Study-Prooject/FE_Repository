import {useCallback, useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Circle as CircleIcon,
    ExitToApp as ExitToAppIcon,
    Refresh as RefreshIcon,
    Send as SendIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import {chatRoomService, messageService, voiceService} from '../../chat/services/chatService'
import {useAuth} from '../../../contexts/AuthContext'
import {useChatWebSocket} from '../hooks/useChatWebSocket'
import GameModePanel from '../components/GameModePanel'

const levelColors = {
    beginner: {bg: '#e8f5e9', color: '#2e7d32', label: '초급'},
    intermediate: {bg: '#fff3e0', color: '#ef6c00', label: '중급'},
    advanced: {bg: '#fce4ec', color: '#c2185b', label: '고급'},
}

const ChatRoomPage = () => {
    const {roomId} = useParams()
    const navigate = useNavigate()
    const {user} = useAuth()
    const currentUserId = user?.userId || user?.username || user?.sub

    // 디버깅: 사용자 정보 확인
    console.log('[ChatRoomPage] User info:', {user, currentUserId, roomId})

    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)

    const [room, setRoom] = useState(null)
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [playingTTS, setPlayingTTS] = useState(null)

    // WebSocket 훅 사용
    const {
        isConnected,
        messages,
        gameState,
        error: wsError,
        receivedDrawing,
        shouldClearCanvas,
        correctAnswerBubble,
        connect: wsConnect,
        disconnect: wsDisconnect,
        sendMessage: wsSendMessage,
        startGame: wsStartGame,
        stopGame: wsStopGame,
        sendDrawing: wsSendDrawing,
        clearDrawing: wsClearDrawing,
        clearError: wsClearError,
        setMessages,
        setReceivedDrawing,
        setShouldClearCanvas,
        setCorrectAnswerBubble,
    } = useChatWebSocket(roomId, currentUserId)

    // 채팅방 정보 조회
    const fetchRoomDetail = useCallback(async () => {
        try {
            const response = await chatRoomService.getDetail(roomId)
            setRoom({
                id: response.roomId,
                name: response.name,
                description: response.description,
                level: response.level?.toLowerCase() || 'beginner',
                currentMembers: response.currentParticipants || 0,
                maxMembers: response.maxParticipants || 6,
            })
        } catch (err) {
            console.error('Failed to fetch room detail:', err)
            setError('채팅방 정보를 불러오는데 실패했습니다')
        }
    }, [roomId])

    // 기존 메시지 목록 조회 (초기 로드용)
    const fetchMessages = useCallback(async () => {
        try {
            const response = await messageService.getList(roomId, {limit: 50})
            const transformedMessages = (response.messages || []).map((msg, index) => ({
                id: msg.messageId || `msg-${index}-${Date.now()}`,
                content: msg.content,
                userId: msg.userId,
                messageType: msg.messageType,
                createdAt: new Date(msg.createdAt),
                isOwn: msg.userId === currentUserId,
            }))
            // 중복 제거 후 정렬
            const uniqueMessages = transformedMessages.filter(
                (msg, index, self) => index === self.findIndex(m => m.id === msg.id)
            )
            setMessages(uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
        } catch (err) {
            console.error('Failed to fetch messages:', err)
            setError('메시지를 불러오는데 실패했습니다')
        }
    }, [roomId, currentUserId, setMessages])

    // 초기 로드
    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await Promise.all([fetchRoomDetail(), fetchMessages()])
            setLoading(false)
        }
        loadData()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // WebSocket 연결 (별도 effect)
    useEffect(() => {
        console.log('[ChatRoomPage] WebSocket effect triggered:', {roomId, currentUserId, isConnected})
        if (currentUserId && roomId) {
            console.log('[ChatRoomPage] Connecting WebSocket...', {roomId, currentUserId})
            wsConnect()
        } else {
            console.log('[ChatRoomPage] Missing required values:', {roomId, currentUserId})
        }

        return () => {
            console.log('[ChatRoomPage] Disconnecting WebSocket...')
            wsDisconnect()
        }
    }, [roomId, currentUserId]) // eslint-disable-line react-hooks/exhaustive-deps

    // 스크롤 맨 아래로
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // 에러 통합
    useEffect(() => {
        if (wsError) {
            setError(wsError)
        }
    }, [wsError])

    // 메시지 전송 (WebSocket 사용)
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return

        const messageContent = newMessage.trim()
        setNewMessage('')

        // WebSocket으로 전송
        if (isConnected) {
            wsSendMessage(messageContent, 'TEXT')
        } else {
            // WebSocket 연결이 안 된 경우 REST API fallback
            const tempMessage = {
                id: `temp-${Date.now()}`,
                content: messageContent,
                userId: currentUserId,
                messageType: 'TEXT',
                createdAt: new Date(),
                isOwn: true,
            }
            setMessages((prev) => [...prev, tempMessage])

            try {
                await messageService.send(roomId, messageContent)
            } catch (err) {
                console.error('Failed to send message:', err)
                setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
                setError('메시지 전송에 실패했습니다')
            }
        }
    }

    // 엔터 키 전송
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // TTS 재생
    const handlePlayTTS = async (messageId) => {
        if (playingTTS === messageId) return

        setPlayingTTS(messageId)
        try {
            const response = await voiceService.synthesize(messageId, roomId)
            const responseData = response.data || response
            if (responseData.audioUrl) {
                const audio = new Audio(responseData.audioUrl)
                audio.onended = () => setPlayingTTS(null)
                audio.onerror = () => setPlayingTTS(null)
                await audio.play()
            }
        } catch (err) {
            console.error('Failed to play TTS:', err)
            setPlayingTTS(null)
        }
    }

    // 채팅방 퇴장
    const handleLeaveRoom = async () => {
        try {
            wsDisconnect()
            await chatRoomService.leave(roomId)
            navigate('/freetalk/people')
        } catch (err) {
            console.error('Failed to leave room:', err)
            setError('채팅방 퇴장에 실패했습니다')
        }
    }

    // 새로고침
    const handleRefresh = () => {
        fetchMessages()
    }

    // 에러 닫기
    const handleCloseError = () => {
        setError(null)
        wsClearError()
    }

    // 시간 포맷
    const formatTime = (date) => {
        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(date))
    }

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <CircularProgress/>
            </Box>
        )
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#b2c7d9'}}>
            {/* 헤더 */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <IconButton edge="start" onClick={() => navigate('/freetalk/people')} sx={{mr: 1}}>
                        <ArrowBackIcon/>
                    </IconButton>
                    <Box sx={{flex: 1}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Typography variant="h6" component="div" sx={{fontWeight: 600}}>
                                {room?.name || '채팅방'}
                            </Typography>
                            {/* 연결 상태 표시 */}
                            <CircleIcon
                                sx={{
                                    fontSize: 10,
                                    color: isConnected ? '#4caf50' : '#f44336',
                                }}
                            />
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            {room?.level && (
                                <Chip
                                    label={levelColors[room.level]?.label}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.7rem',
                                        backgroundColor: levelColors[room.level]?.bg,
                                        color: levelColors[room.level]?.color,
                                    }}
                                />
                            )}
                            <Typography variant="caption" color="text.secondary">
                                {room?.currentMembers}/{room?.maxMembers}명
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isConnected ? '실시간' : '오프라인'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleRefresh} title="새로고침">
                        <RefreshIcon/>
                    </IconButton>
                    <IconButton onClick={handleLeaveRoom} color="error" title="나가기">
                        <ExitToAppIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" onClose={handleCloseError} sx={{m: 1}}>
                    {error}
                </Alert>
            )}

            {/* 게임 모드 패널 - 항상 표시 (게임 상태에 따라 다른 UI) */}
            <Box sx={{
                borderBottom: 1,
                borderColor: 'divider',
                ...(gameState?.status === 'PLAYING' ? {
                    maxHeight: '50vh',
                    overflow: 'auto',
                } : {}),
            }}>
                <GameModePanel
                    roomId={roomId}
                    initialGameStatus={gameState?.status}
                    wsGameState={gameState}
                    isConnected={isConnected}
                    messages={messages}
                    onStartGame={wsStartGame}
                    onStopGame={wsStopGame}
                    onSendMessage={wsSendMessage}
                    onSendDrawing={wsSendDrawing}
                    onClearDrawing={wsClearDrawing}
                    receivedDrawing={receivedDrawing}
                    onDrawingProcessed={() => setReceivedDrawing(null)}
                    shouldClearCanvas={shouldClearCanvas}
                    onCanvasCleared={() => setShouldClearCanvas(false)}
                    correctAnswerBubble={correctAnswerBubble}
                    onBubbleProcessed={() => setCorrectAnswerBubble(null)}
                    onGameMessage={(msg) => {
                        const systemMessage = {
                            id: `game-${Date.now()}`,
                            content: msg.content,
                            messageType: 'SYSTEM',
                            createdAt: new Date().toISOString(),
                            isSystem: true,
                        }
                        setMessages((prev) => [...prev, systemMessage])
                    }}
                />
            </Box>

            {/* 메시지 영역 */}
            <Box
                ref={messagesContainerRef}
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                {messages.length === 0 ? (
                    <Box sx={{textAlign: 'center', py: 4}}>
                        <Typography variant="body2" color="text.secondary">
                            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
                            /start - 게임 시작 | /stop - 게임 종료
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                flexDirection: message.isOwn ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 1,
                            }}
                        >
                            {/* 시스템 메시지 */}
                            {message.isSystem ? (
                                <Box sx={{width: '100%', textAlign: 'center', py: 0.5}}>
                                    <Typography variant="caption" color="text.secondary">
                                        {message.content}
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {/* 아바타 (상대방만) */}
                                    {!message.isOwn && (
                                        <Avatar sx={{width: 36, height: 36, bgcolor: 'primary.main'}}>
                                            {message.userId?.charAt(0)?.toUpperCase() || 'U'}
                                        </Avatar>
                                    )}

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                        }}
                                    >
                                        {/* 사용자 이름 (상대방만) */}
                                        {!message.isOwn && (
                                            <Typography variant="caption" sx={{mb: 0.5, ml: 1}}>
                                                {message.userId}
                                            </Typography>
                                        )}

                                        {/* 메시지 버블 */}
                                        <Box sx={{display: 'flex', alignItems: 'flex-end', gap: 0.5}}>
                                            {message.isOwn && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTime(message.createdAt)}
                                                </Typography>
                                            )}

                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    px: 1.5,
                                                    py: 1,
                                                    bgcolor: message.isOwn ? '#fee500' : '#ffffff',
                                                    borderRadius: message.isOwn ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                    opacity: message.isPending ? 0.7 : 1,
                                                }}
                                            >
                                                <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                                                    {message.content}
                                                </Typography>
                                            </Paper>

                                            {!message.isOwn && (
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handlePlayTTS(message.id)}
                                                        disabled={playingTTS === message.id}
                                                        sx={{p: 0.5}}
                                                    >
                                                        {playingTTS === message.id ? (
                                                            <CircularProgress size={16}/>
                                                        ) : (
                                                            <VolumeUpIcon fontSize="small"/>
                                                        )}
                                                    </IconButton>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTime(message.createdAt)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    ))
                )}
                <div ref={messagesEndRef}/>
            </Box>

            {/* 입력 영역 */}
            <Paper
                elevation={3}
                sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderRadius: 0,
                }}
            >
                <TextField
                    fullWidth
                    placeholder={isConnected ? '메시지를 입력하세요... (/start, /stop)' : '연결 중...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    multiline
                    maxRows={3}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                        },
                    }}
                />
                <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {bgcolor: 'primary.dark'},
                        '&:disabled': {bgcolor: 'grey.300'},
                    }}
                >
                    <SendIcon/>
                </IconButton>
            </Paper>
        </Box>
    )
}

export default ChatRoomPage
