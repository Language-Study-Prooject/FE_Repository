import {useCallback, useEffect, useRef, useState} from 'react'
import {
    Alert,
    Avatar,
    Box,
    Chip,
    CircularProgress,
    Fade,
    IconButton,
    Paper,
    Popover,
    Slider,
    TextField,
    Typography,
    useTheme,
} from '@mui/material'
import {
    Circle as CircleIcon,
    Close as CloseIcon,
    ExitToApp as ExitToAppIcon,
    Minimize as MinimizeIcon,
    Opacity as OpacityIcon,
    OpenInFull as MaximizeIcon,
    Refresh as RefreshIcon,
    Send as SendIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import {
    chatRoomService,
    messageService,
    voiceService
} from '../../chat/services/chatService'
import {useSettings} from '../../../contexts/SettingsContext'
import {useAuth} from '../../../contexts/AuthContext'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {DESIGN_TOKENS, getChatStyles} from '../../../theme/theme'
import {useChatWebSocket} from '../hooks/useChatWebSocket'
import SystemCommandMessage from './SystemCommandMessage'
import {MessageType} from '../types/chatCommandTypes'

const ChatRoomModal = ({open, onClose, room, onLeave}) => {
    const theme = useTheme()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
    const {settings} = useSettings()
    const {user} = useAuth()
    const currentUserId = user?.userId || user?.username || user?.sub
    const messagesEndRef = useRef(null)
    const dragRef = useRef(null)

    // WebSocket 훅 사용
    const {
        isConnected,
        messages,
        error: wsError,
        connect: wsConnect,
        disconnect: wsDisconnect,
        sendMessage: wsSendMessage,
        setMessages,
    } = useChatWebSocket(room?.id, currentUserId)

    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [error, setError] = useState(null)
    const [playingTTS, setPlayingTTS] = useState(null)
    const [minimized, setMinimized] = useState(false)
    const [position, setPosition] = useState({x: 0, y: 0})
    const [savedPosition, setSavedPosition] = useState({x: 0, y: 0})
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0})
    const [opacity, setOpacity] = useState(100)
    const [opacityAnchorEl, setOpacityAnchorEl] = useState(null)
    // 메시지 목록 조회
    const fetchMessages = useCallback(async () => {
        if (!room?.id) return

        try {
            const response = await messageService.getList(room.id, {limit: 50})
            const responseData = response.data || response
            const transformedMessages = (responseData.messages || []).map((msg) => ({
                id: msg.messageId || msg.pk?.replace('MESSAGE#', ''),
                content: msg.content,
                userId: msg.userId,
                messageType: msg.messageType,
                createdAt: new Date(msg.createdAt),
                isOwn: msg.userId === currentUserId,
            }))
            setMessages(transformedMessages.reverse())
        } catch (err) {
            console.error('Failed to fetch messages:', err)
            setError('메시지를 불러오는데 실패했습니다')
        }
    }, [room?.id])

    // WebSocket 에러 통합
    useEffect(() => {
        if (wsError) {
            setError(wsError)
        }
    }, [wsError])

    // 초기 로드
    useEffect(() => {
        console.log('[ChatRoomModal] useEffect triggered:', {open, roomId: room?.id, currentUserId})
        if (open && room?.id && currentUserId) {
            console.log('[ChatRoomModal] Initializing...', {roomId: room.id, userId: currentUserId})
            setLoading(true)
            setMinimized(false)

            // WebSocket 연결
            wsConnect()

            // 기존 메시지 로드
            fetchMessages().finally(() => setLoading(false))
        }

        return () => {
            if (open && room?.id) {
                console.log('[ChatRoomModal] Disconnecting WebSocket...')
                wsDisconnect()
            }
        }
    }, [open, room?.id, currentUserId]) // eslint-disable-line react-hooks/exhaustive-deps

    // 스크롤 맨 아래로
    const scrollToBottom = (instant = false) => {
        messagesEndRef.current?.scrollIntoView({behavior: instant ? 'instant' : 'smooth'})
    }

    // 메시지 로드 완료 후 스크롤
    useEffect(() => {
        if (!loading && messages.length > 0) {
            // 처음 로드 시 즉시 스크롤
            setTimeout(() => scrollToBottom(true), 100)
        }
    }, [loading])

    // 새 메시지 추가 시 부드럽게 스크롤
    useEffect(() => {
        if (messages.length > 0 && !loading) {
            scrollToBottom(false)
        }
    }, [messages.length])

    // 드래그 핸들러
    const handleMouseDown = (e) => {
        // 버튼, 입력창, 슬라이더, 팝오버 클릭 시 드래그 방지
        if (
            e.target.closest('button') ||
            e.target.closest('input') ||
            e.target.closest('.MuiSlider-root') ||
            e.target.closest('.MuiPopover-root')
        ) return
        setIsDragging(true)
        const rect = dragRef.current?.getBoundingClientRect()
        setDragOffset({
            x: e.clientX - (rect?.left || 0),
            y: e.clientY - (rect?.top || 0),
        })
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragOffset])

    // 메시지 전송 (WebSocket 사용)
    const handleSendMessage = async () => {
        if (!newMessage.trim() || sendingMessage) return

        setSendingMessage(true)
        const messageContent = newMessage.trim()
        setNewMessage('')

        // /start, /stop 명령어는 서버 응답(WebSocket game_start/game_end)을 기다림
        // 탭 전환은 useEffect의 wsGameState 감지에서 처리

        // WebSocket으로 전송
        if (isConnected) {
            const success = wsSendMessage(messageContent, 'TEXT')
            if (!success) {
                setError('메시지 전송에 실패했습니다')
            }
            setSendingMessage(false)
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
                await messageService.send(room.id, messageContent)
                await fetchMessages()
            } catch (err) {
                console.error('Failed to send message:', err)
                setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
                setError('메시지 전송에 실패했습니다')
            } finally {
                setSendingMessage(false)
            }
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // TTS 재생 (모든 메시지에서 가능)
    const handlePlayTTS = async (messageId) => {
        if (playingTTS === messageId) return

        setPlayingTTS(messageId)
        try {
            const response = await voiceService.synthesize(messageId, room.id, settings.ttsVoice)
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

    // 최소화/최대화 토글
    const handleToggleMinimize = () => {
        if (!minimized) {
            // 최소화: 현재 위치 저장 후 우측 하단으로 이동
            setSavedPosition(position)
            setPosition({x: 0, y: 0})
        } else {
            // 최대화: 저장된 위치로 복원 후 스크롤 맨 아래로
            setPosition(savedPosition)
            setTimeout(() => scrollToBottom(true), 100)
        }
        setMinimized(!minimized)
    }

    // 채팅방 퇴장
    const handleLeaveRoom = async () => {
        try {
            await chatRoomService.leave(room.id)
            onLeave?.()
            onClose()
        } catch (err) {
            console.error('Failed to leave room:', err)
            setError('채팅방 퇴장에 실패했습니다')
        }
    }

    const formatTime = (date) => {
        // date가 문자열이거나 Date 객체일 수 있음
        const dateObj = date instanceof Date ? date : new Date(date)
        if (isNaN(dateObj.getTime())) {
            return '' // 유효하지 않은 날짜는 빈 문자열 반환
        }
        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj)
    }

    if (!open) return null

    return (
        <Fade in={open}>
            <Paper
                ref={dragRef}
                elevation={8}
                style={{opacity: opacity / 100}}
                sx={{
                    position: 'fixed',
                    bottom: position.y || 20,
                    right: position.x ? 'auto' : 20,
                    left: position.x || 'auto',
                    top: position.y ? position.y : 'auto',
                    width: 380,
                    height: minimized ? 'auto' : 500,
                    borderRadius: `${DESIGN_TOKENS.borderRadius.lg}px`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1300,
                    cursor: isDragging ? 'grabbing' : 'default',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    pointerEvents: opacity < 50 ? 'none' : 'auto',
                }}
            >
                {/* 헤더 - 드래그 가능, 항상 조작 가능 */}
                <Box
                    onMouseDown={handleMouseDown}
                    sx={{
                        p: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'grab',
                        userSelect: 'none',
                        pointerEvents: 'auto',
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0}}>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {room?.name || '채팅방'}
                        </Typography>
                        {/* 연결 상태 표시 */}
                        <CircleIcon
                            sx={{
                                fontSize: 8,
                                color: isConnected ? '#4caf50' : '#f44336',
                            }}
                            titleAccess={isConnected ? '실시간 연결' : '오프라인'}
                        />
                        {room?.level && (
                            <Chip
                                label={DESIGN_TOKENS.level[room.level]?.label || room.level}
                                size="small"
                                sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{display: 'flex'}}>
                        <IconButton
                            size="small"
                            onClick={(e) => setOpacityAnchorEl(e.currentTarget)}
                            sx={{color: 'white'}}
                            title="투명도"
                        >
                            <OpacityIcon fontSize="small"/>
                        </IconButton>
                        <Popover
                            open={Boolean(opacityAnchorEl)}
                            anchorEl={opacityAnchorEl}
                            onClose={() => setOpacityAnchorEl(null)}
                            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                            transformOrigin={{vertical: 'bottom', horizontal: 'center'}}
                            slotProps={{
                                paper: {
                                    sx: {pointerEvents: 'auto'}
                                }
                            }}
                        >
                            <Box sx={{width: 150, px: 2, py: 1}}>
                                <Typography variant="caption" color="text.secondary">
                                    투명도: {opacity}%
                                </Typography>
                                <Slider
                                    value={opacity}
                                    onChange={(e, v) => setOpacity(v)}
                                    min={10}
                                    max={100}
                                    size="small"
                                />
                            </Box>
                        </Popover>
                        <IconButton size="small" onClick={fetchMessages} sx={{color: 'white'}} title="새로고침">
                            <RefreshIcon fontSize="small"/>
                        </IconButton>
                        <IconButton size="small" onClick={handleToggleMinimize} sx={{color: 'white'}}
                                    title={minimized ? '최대화' : '최소화'}>
                            {minimized ? <MaximizeIcon fontSize="small"/> : <MinimizeIcon fontSize="small"/>}
                        </IconButton>
                        <IconButton size="small" onClick={handleLeaveRoom} sx={{color: 'white'}} title="나가기">
                            <ExitToAppIcon fontSize="small"/>
                        </IconButton>
                        <IconButton size="small" onClick={onClose} sx={{color: 'white'}} title="닫기">
                            <CloseIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                </Box>

                {!minimized && (
                    <>
                        {/* 에러 메시지 */}
                        {error && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{borderRadius: 0}}>
                                {error}
                            </Alert>
                        )}

                        {/* 메시지 영역 */}
                        {loading ? (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flex: 1,
                                    bgcolor: isDark ? DESIGN_TOKENS.chat.background.dark : DESIGN_TOKENS.chat.background.light,
                                }}>
                                    <CircularProgress/>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        flex: 1,
                                        overflow: 'auto',
                                        p: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        bgcolor: isDark ? DESIGN_TOKENS.chat.background.dark : DESIGN_TOKENS.chat.background.light,
                                        // 스크롤바 숨김 (hover 시만 표시)
                                        '&::-webkit-scrollbar': {
                                            width: 6,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            bgcolor: 'transparent',
                                            borderRadius: 3,
                                        },
                                        '&:hover::-webkit-scrollbar-thumb': {
                                            bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                        },
                                    }}
                                >
                                    {messages.length === 0 ? (
                                        <Box sx={{textAlign: 'center', py: 4}}>
                                            <Typography variant="body2" color="text.secondary">
                                                첫 메시지를 보내보세요!
                                            </Typography>
                                        </Box>
                                    ) : (
                                        messages.map((message) => {
                                            // 시스템 명령어 메시지 (SYSTEM_COMMAND)
                                            if (message.messageType === MessageType.SYSTEM_COMMAND || message.messageType === 'SYSTEM_COMMAND') {
                                                return (
                                                    <SystemCommandMessage key={message.id} data={message.data} />
                                                )
                                            }

                                            return (
                                            <Box
                                                key={message.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: message.isSystem ? 'row' : (message.isOwn ? 'row-reverse' : 'row'),
                                                    alignItems: 'flex-end',
                                                    justifyContent: message.isSystem ? 'center' : 'flex-start',
                                                    gap: 0.5,
                                                }}
                                            >
                                                {/* 시스템 메시지 */}
                                                {message.isSystem ? (
                                                    <Chip
                                                        label={message.content}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                            fontSize: '0.7rem',
                                                            whiteSpace: 'pre-wrap',
                                                            height: 'auto',
                                                            py: 0.5,
                                                            '& .MuiChip-label': {whiteSpace: 'pre-wrap'},
                                                        }}
                                                    />
                                                ) : (
                                                    <>
                                                        {!message.isOwn && (
                                                            <Avatar sx={{
                                                                width: 26,
                                                                height: 26,
                                                                bgcolor: 'primary.main',
                                                                fontSize: '0.75rem'
                                                            }}>
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
                                                            <Typography variant="caption" sx={{
                                                                mb: 0.25,
                                                                ml: message.isOwn ? 0 : 0.5,
                                                                mr: message.isOwn ? 0.5 : 0,
                                                                fontSize: '0.6rem'
                                                            }}>
                                                                {message.userId}
                                                            </Typography>

                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'flex-end',
                                                                gap: 0.25
                                                            }}>
                                                                {message.isOwn && (
                                                                    <>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handlePlayTTS(message.id)}
                                                                            disabled={playingTTS === message.id}
                                                                            sx={{p: 0.25}}
                                                                        >
                                                                            {playingTTS === message.id ? (
                                                                                <CircularProgress size={12}/>
                                                                            ) : (
                                                                                <VolumeUpIcon sx={{
                                                                                    fontSize: 14,
                                                                                    color: 'text.secondary'
                                                                                }}/>
                                                                            )}
                                                                        </IconButton>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary"
                                                                                    sx={{fontSize: '0.55rem'}}>
                                                                            {formatTime(message.createdAt)}
                                                                        </Typography>
                                                                    </>
                                                                )}

                                                                <Paper
                                                                    elevation={0}
                                                                    sx={{
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        ...getChatStyles(message.isOwn, isDark),
                                                                        borderRadius: message.isOwn
                                                                            ? `${DESIGN_TOKENS.borderRadius.sm}px ${DESIGN_TOKENS.borderRadius.sm}px 0 ${DESIGN_TOKENS.borderRadius.sm}px`
                                                                            : `${DESIGN_TOKENS.borderRadius.sm}px ${DESIGN_TOKENS.borderRadius.sm}px ${DESIGN_TOKENS.borderRadius.sm}px 0`,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            whiteSpace: 'pre-wrap',
                                                                            fontSize: '0.8rem',
                                                                            color: message.isOwn ? '#1c1917' : 'text.primary',
                                                                        }}
                                                                    >
                                                                        {message.content}
                                                                    </Typography>
                                                                </Paper>

                                                                {!message.isOwn && (
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.25
                                                                    }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => handlePlayTTS(message.id)}
                                                                            disabled={playingTTS === message.id}
                                                                            sx={{p: 0.25}}
                                                                        >
                                                                            {playingTTS === message.id ? (
                                                                                <CircularProgress size={12}/>
                                                                            ) : (
                                                                                <VolumeUpIcon sx={{fontSize: 14}}/>
                                                                            )}
                                                                        </IconButton>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary"
                                                                                    sx={{fontSize: '0.55rem'}}>
                                                                            {formatTime(message.createdAt)}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </>
                                                )}
                                            </Box>
                                        )})
                                    )}
                                    <div ref={messagesEndRef}/>
                                </Box>
                            )}

                        {/* 입력 영역 */}
                        <Box
                            sx={{
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                borderTop: 1,
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                pointerEvents: 'auto',
                            }}
                        >
                            <TextField
                                fullWidth
                                placeholder="메시지 입력..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                size="small"
                                multiline
                                maxRows={2}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontSize: '0.85rem',
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        py: 0.75,
                                    },
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || sendingMessage}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 32,
                                    height: 32,
                                    '&:hover': {bgcolor: 'primary.dark'},
                                    '&:disabled': {bgcolor: 'grey.300'},
                                }}
                            >
                                {sendingMessage ? <CircularProgress size={16} color="inherit"/> :
                                    <SendIcon fontSize="small"/>}
                            </IconButton>
                        </Box>
                    </>
                )}
            </Paper>
        </Fade>
    )
}

export default ChatRoomModal
