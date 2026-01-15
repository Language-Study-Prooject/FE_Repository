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
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme,
} from '@mui/material'
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    ExitToApp as ExitToAppIcon,
    Minimize as MinimizeIcon,
    Opacity as OpacityIcon,
    OpenInFull as MaximizeIcon,
    Refresh as RefreshIcon,
    Send as SendIcon,
    SportsEsports as GameIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material'
import {
    chatRoomService,
    GAME_STATUS,
    gameService,
    MESSAGE_TYPES,
    messageService,
    TEMP_USER_ID,
    voiceService
} from '../../chat/services/chatService'
import {useSettings} from '../../../contexts/SettingsContext'
import {DESIGN_TOKENS, getChatStyles} from '../../../theme/theme'
import GameModePanel from './GameModePanel'

const ChatRoomModal = ({open, onClose, room, onLeave}) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const {settings} = useSettings()
    const messagesEndRef = useRef(null)
    const dragRef = useRef(null)

    const [messages, setMessages] = useState([])
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
    const [activeTab, setActiveTab] = useState(0) // 0: 채팅, 1: 게임
    const [gameStatus, setGameStatus] = useState(GAME_STATUS.NONE)
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
                isOwn: msg.userId === TEMP_USER_ID,
            }))
            setMessages(transformedMessages.reverse())
        } catch (err) {
            console.error('Failed to fetch messages:', err)
            setError('메시지를 불러오는데 실패했습니다')
        }
    }, [room?.id])

    // 게임 상태 조회
    const fetchGameStatus = useCallback(async () => {
        if (!room?.id) return
        try {
            const response = await gameService.getStatus(room.id)
            const data = response.data || response
            setGameStatus(data.gameStatus || GAME_STATUS.NONE)
            // 게임 중이면 게임 탭으로 전환
            if (data.gameStatus === GAME_STATUS.PLAYING) {
                setActiveTab(1)
            }
        } catch (err) {
            console.error('Failed to fetch game status:', err)
        }
    }, [room?.id])

    // 초기 로드
    useEffect(() => {
        if (open && room?.id) {
            setLoading(true)
            setMessages([])
            setMinimized(false)
            setActiveTab(0)
            Promise.all([
                fetchMessages(),
                fetchGameStatus(),
            ]).finally(() => setLoading(false))
        }
    }, [open, room?.id, fetchMessages, fetchGameStatus])

    // 게임 메시지 처리
    const handleGameMessage = (gameMessage) => {
        const systemMessage = {
            id: `game-${Date.now()}`,
            content: gameMessage.content,
            userId: 'SYSTEM',
            messageType: gameMessage.type,
            createdAt: new Date(),
            isOwn: false,
            isSystem: true,
        }
        setMessages((prev) => [...prev, systemMessage])

        // 게임 시작 시 게임 탭으로 전환
        if (gameMessage.type === MESSAGE_TYPES.GAME_START) {
            setGameStatus(GAME_STATUS.PLAYING)
            setActiveTab(1)
        } else if (gameMessage.type === MESSAGE_TYPES.GAME_END) {
            setGameStatus(GAME_STATUS.NONE)
            setActiveTab(0)
        }
    }

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

    // 메시지 전송
    const handleSendMessage = async () => {
        if (!newMessage.trim() || sendingMessage) return

        setSendingMessage(true)
        const messageContent = newMessage.trim()
        setNewMessage('')

        const tempMessage = {
            id: `temp-${Date.now()}`,
            content: messageContent,
            userId: TEMP_USER_ID,
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
        return new Intl.DateTimeFormat('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    if (!open) return null

    return (
        <Fade in={open}>
            <Paper
                ref={dragRef}
                elevation={8}
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
                    opacity: opacity / 100,
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
                        {/* 탭 (채팅/게임) */}
                        <Tabs
                            value={activeTab}
                            onChange={(e, v) => setActiveTab(v)}
                            variant="fullWidth"
                            sx={{
                                minHeight: 36,
                                '& .MuiTab-root': {minHeight: 36, py: 0.5},
                            }}
                        >
                            <Tab
                                icon={<ChatIcon sx={{fontSize: 16}}/>}
                                iconPosition="start"
                                label="채팅"
                                sx={{fontSize: '0.75rem'}}
                            />
                            <Tab
                                icon={<GameIcon sx={{fontSize: 16}}/>}
                                iconPosition="start"
                                label="캐치마인드"
                                sx={{fontSize: '0.75rem'}}
                            />
                        </Tabs>

                        {/* 에러 메시지 */}
                        {error && (
                            <Alert severity="error" onClose={() => setError(null)} sx={{borderRadius: 0}}>
                                {error}
                            </Alert>
                        )}

                        {/* 게임 모드 */}
                        {activeTab === 1 && (
                            <Box sx={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                                <GameModePanel roomId={room?.id} onGameMessage={handleGameMessage}/>
                            </Box>
                        )}

                        {/* 채팅 모드 - 메시지 영역 */}
                        {activeTab === 0 && (
                            loading ? (
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
                                        messages.map((message) => (
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
                                                            {!message.isOwn && (
                                                                <Typography variant="caption" sx={{
                                                                    mb: 0.25,
                                                                    ml: 0.5,
                                                                    fontSize: '0.6rem'
                                                                }}>
                                                                    {message.userId}
                                                                </Typography>
                                                            )}

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
                                        ))
                                    )}
                                    <div ref={messagesEndRef}/>
                                </Box>
                            )
                        )}

                        {/* 입력 영역 - 항상 조작 가능 */}
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
