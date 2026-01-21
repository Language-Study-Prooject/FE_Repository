import {useEffect, useRef, useState} from 'react'
import {Avatar, Box, IconButton, Paper, TextField, Typography} from '@mui/material'
import {Send as SendIcon} from '@mui/icons-material'
import {GAME_COLORS} from '../theme/gameTheme'

const WaitingChat = ({ messages, onSendMessage, currentUserId, disabled }) => {
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = () => {
        if (!newMessage.trim() || disabled) return
        onSendMessage?.(newMessage.trim())
        setNewMessage('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const formatTime = (date) => {
        const d = new Date(date)
        return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 채팅 메시지 영역 */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px 12px 0 0',
                }}
            >
                {messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            대기 중 채팅을 시작해보세요!
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.userId === currentUserId
                        const isSystem = message.isSystem

                        if (isSystem) {
                            return (
                                <Box key={message.id} sx={{ textAlign: 'center', py: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: '12px',
                                            color: 'text.secondary',
                                        }}
                                    >
                                        {message.content}
                                    </Typography>
                                </Box>
                            )
                        }

                        return (
                            <Box
                                key={message.id}
                                sx={{
                                    display: 'flex',
                                    flexDirection: isOwn ? 'row-reverse' : 'row',
                                    alignItems: 'flex-end',
                                    gap: 1,
                                }}
                            >
                                {!isOwn && (
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            bgcolor: GAME_COLORS.primary,
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        {message.nickname?.charAt(0) || message.userId?.charAt(0) || 'U'}
                                    </Avatar>
                                )}

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                    }}
                                >
                                    {!isOwn && (
                                        <Typography variant="caption" sx={{ ml: 0.5, mb: 0.25 }}>
                                            {message.nickname || message.userId}
                                        </Typography>
                                    )}

                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                        {isOwn && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                                {formatTime(message.createdAt)}
                                            </Typography>
                                        )}

                                        <Paper
                                            elevation={0}
                                            sx={{
                                                px: 1.5,
                                                py: 0.75,
                                                bgcolor: isOwn ? GAME_COLORS.primary : 'white',
                                                color: isOwn ? 'white' : 'text.primary',
                                                borderRadius: isOwn
                                                    ? '12px 12px 0 12px'
                                                    : '12px 12px 12px 0',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {message.content}
                                            </Typography>
                                        </Paper>

                                        {!isOwn && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                                {formatTime(message.createdAt)}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* 입력 영역 */}
            <Box
                sx={{
                    p: 1.5,
                    bgcolor: 'white',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '0 0 12px 12px',
                    display: 'flex',
                    gap: 1,
                }}
            >
                <TextField
                    fullWidth
                    placeholder={disabled ? '게임이 곧 시작됩니다...' : '메시지 입력...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled}
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                        },
                    }}
                />
                <IconButton
                    onClick={handleSend}
                    disabled={!newMessage.trim() || disabled}
                    sx={{
                        bgcolor: GAME_COLORS.primary,
                        color: 'white',
                        '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                        '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                    }}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Box>
    )
}

export default WaitingChat
