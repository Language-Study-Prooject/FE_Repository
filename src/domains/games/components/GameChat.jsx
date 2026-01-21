import {useEffect, useRef, useState} from 'react'
import {Avatar, Box, Chip, IconButton, Paper, TextField, Typography} from '@mui/material'
import {Send as SendIcon} from '@mui/icons-material'
import {GAME_COLORS} from '../theme/gameTheme'

const GameChat = ({
    messages,
    onSendMessage,
    currentUserId,
    isDrawer,
    currentDrawerId,
}) => {
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = () => {
        if (!newMessage.trim() || isDrawer) return
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

    // 메시지 타입에 따른 스타일
    const getMessageStyle = (message) => {
        if (message.isCorrect) {
            return {
                bgcolor: GAME_COLORS.answer.correctBg,
                borderLeft: `4px solid ${GAME_COLORS.answer.correct}`,
            }
        }
        if (message.isWrong) {
            return {
                opacity: 0.6,
            }
        }
        if (message.isSystem) {
            return {
                bgcolor: 'transparent',
            }
        }
        return {}
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 헤더 - 컴팩트 */}
            <Box
                sx={{
                    px: 1,
                    py: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <Typography variant="caption" fontWeight={700}>
                    채팅
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                    정답을 입력하세요
                </Typography>
            </Box>

            {/* 메시지 영역 - 컴팩트 */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 0.75,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    bgcolor: '#F8FAFC',
                }}
            >
                {messages.map((message) => {
                    const isOwn = message.userId === currentUserId
                    const isSystem = message.isSystem
                    const isFromDrawer = message.userId === currentDrawerId

                    // 시스템 메시지
                    if (isSystem) {
                        return (
                            <Box key={message.id} sx={{ textAlign: 'center', py: 0.5 }}>
                                <Chip
                                    label={message.content}
                                    size="small"
                                    sx={{
                                        bgcolor: message.isCorrect
                                            ? GAME_COLORS.answer.correctBg
                                            : 'rgba(0,0,0,0.06)',
                                        color: message.isCorrect
                                            ? GAME_COLORS.answer.correctText
                                            : 'text.secondary',
                                        fontWeight: message.isCorrect ? 700 : 400,
                                        fontSize: '0.7rem',
                                        height: 'auto',
                                        py: 0.5,
                                        '& .MuiChip-label': {
                                            whiteSpace: 'normal',
                                        },
                                    }}
                                />
                            </Box>
                        )
                    }

                    // 정답 메시지
                    if (message.isCorrect) {
                        return (
                            <Box
                                key={message.id}
                                sx={{
                                    p: 1.5,
                                    bgcolor: GAME_COLORS.answer.correctBg,
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${GAME_COLORS.answer.correct}`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Typography variant="caption" fontWeight={700} color={GAME_COLORS.answer.correctText}>
                                        {message.nickname || message.userId}
                                    </Typography>
                                    <Chip
                                        label={`+${message.score || 0}점`}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.6rem',
                                            bgcolor: GAME_COLORS.answer.correct,
                                            color: 'white',
                                            fontWeight: 700,
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" fontWeight={700} color={GAME_COLORS.answer.correctText}>
                                    {message.content}
                                </Typography>
                            </Box>
                        )
                    }

                    // 일반 메시지
                    return (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                flexDirection: isOwn ? 'row-reverse' : 'row',
                                alignItems: 'flex-end',
                                gap: 0.5,
                                opacity: message.isWrong ? 0.5 : 1,
                            }}
                        >
                            {!isOwn && (
                                <Avatar
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        bgcolor: isFromDrawer ? GAME_COLORS.status.playing : GAME_COLORS.primary,
                                        fontSize: '0.7rem',
                                    }}
                                >
                                    {(message.nickname || message.userId)?.charAt(0) || 'U'}
                                </Avatar>
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwn ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                }}
                            >
                                {!isOwn && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: '0.65rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: 80,
                                            }}
                                            title={message.nickname || message.userId}
                                        >
                                            {message.nickname || message.userId}
                                        </Typography>
                                        {isFromDrawer && (
                                            <Chip
                                                label="출제자"
                                                size="small"
                                                sx={{
                                                    height: 14,
                                                    fontSize: '0.5rem',
                                                    bgcolor: GAME_COLORS.status.playingBg,
                                                    color: GAME_COLORS.status.playing,
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )}
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
                                    {isOwn && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                                            {formatTime(message.createdAt)}
                                        </Typography>
                                    )}

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            px: 1.25,
                                            py: 0.5,
                                            bgcolor: isOwn
                                                ? GAME_COLORS.primary
                                                : message.isWrong
                                                    ? '#F3F4F6'
                                                    : 'white',
                                            color: isOwn ? 'white' : 'text.primary',
                                            borderRadius: isOwn
                                                ? '10px 10px 0 10px'
                                                : '10px 10px 10px 0',
                                            ...getMessageStyle(message),
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                            {message.isWrong && '❌ '}
                                            {message.content}
                                        </Typography>
                                    </Paper>

                                    {!isOwn && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                                            {formatTime(message.createdAt)}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    )
                })}
                <div ref={messagesEndRef} />
            </Box>

            {/* 입력 영역 - 컴팩트 */}
            <Box
                sx={{
                    p: 0.5,
                    bgcolor: 'white',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 0.5,
                }}
            >
                <TextField
                    fullWidth
                    placeholder={isDrawer ? '출제자는 채팅 불가' : '정답 입력...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isDrawer}
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                        },
                        '& .MuiOutlinedInput-input': {
                            py: 0.5,
                            px: 1,
                        },
                    }}
                />
                <IconButton
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isDrawer}
                    size="small"
                    sx={{
                        bgcolor: GAME_COLORS.primary,
                        color: 'white',
                        '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                        '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                        p: 0.75,
                    }}
                >
                    <SendIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>
        </Box>
    )
}

export default GameChat
