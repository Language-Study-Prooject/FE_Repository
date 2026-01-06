import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Paper,
  Fade,
} from '@mui/material'
import {
  Close as CloseIcon,
  Send as SendIcon,
  VolumeUp as VolumeUpIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
  Minimize as MinimizeIcon,
  OpenInFull as MaximizeIcon,
} from '@mui/icons-material'
import { chatRoomService, messageService, voiceService, TEMP_USER_ID } from '../../chat/services/chatService'

const levelColors = {
  beginner: { bg: '#e8f5e9', color: '#2e7d32', label: '초급' },
  intermediate: { bg: '#fff3e0', color: '#ef6c00', label: '중급' },
  advanced: { bg: '#fce4ec', color: '#c2185b', label: '고급' },
}

const ChatRoomModal = ({ open, onClose, room, onLeave }) => {
  const messagesEndRef = useRef(null)
  const dragRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState(null)
  const [playingTTS, setPlayingTTS] = useState(null)
  const [minimized, setMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  // 메시지 목록 조회
  const fetchMessages = useCallback(async () => {
    if (!room?.id) return

    try {
      const response = await messageService.getList(room.id, { limit: 50 })
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

  // 초기 로드
  useEffect(() => {
    if (open && room?.id) {
      setLoading(true)
      setMessages([])
      setMinimized(false)
      fetchMessages().finally(() => setLoading(false))
    }
  }, [open, room?.id, fetchMessages])

  // 스크롤 맨 아래로
  const scrollToBottom = (instant = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'instant' : 'smooth' })
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
  const handlePlayTTS = async (messageId, text) => {
    if (playingTTS === messageId) return

    setPlayingTTS(messageId)
    try {
      const response = await voiceService.synthesize(text)
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
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1300,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        {/* 헤더 - 드래그 가능 */}
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
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {room?.name || '채팅방'}
            </Typography>
            {room?.level && (
              <Chip
                label={levelColors[room.level]?.label}
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
          <Box sx={{ display: 'flex' }}>
            <IconButton size="small" onClick={fetchMessages} sx={{ color: 'white' }} title="새로고침">
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setMinimized(!minimized)} sx={{ color: 'white' }} title={minimized ? '최대화' : '최소화'}>
              {minimized ? <MaximizeIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
            </IconButton>
            <IconButton size="small" onClick={handleLeaveRoom} sx={{ color: 'white' }} title="나가기">
              <ExitToAppIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }} title="닫기">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {!minimized && (
          <>
            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 0 }}>
                {error}
              </Alert>
            )}

            {/* 메시지 영역 */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, bgcolor: '#b2c7d9' }}>
                <CircularProgress />
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
                  bgcolor: '#b2c7d9',
                  // 스크롤바 숨김 (hover 시만 표시)
                  '&::-webkit-scrollbar': {
                    width: 6,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'transparent',
                    borderRadius: 3,
                  },
                  '&:hover::-webkit-scrollbar-thumb': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                  },
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
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
                        flexDirection: message.isOwn ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: 0.5,
                      }}
                    >
                      {!message.isOwn && (
                        <Avatar sx={{ width: 26, height: 26, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
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
                          <Typography variant="caption" sx={{ mb: 0.25, ml: 0.5, fontSize: '0.6rem' }}>
                            {message.userId}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.25 }}>
                          {message.isOwn && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handlePlayTTS(message.id, message.content)}
                                disabled={playingTTS === message.id}
                                sx={{ p: 0.25 }}
                              >
                                {playingTTS === message.id ? (
                                  <CircularProgress size={12} />
                                ) : (
                                  <VolumeUpIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                )}
                              </IconButton>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                                {formatTime(message.createdAt)}
                              </Typography>
                            </>
                          )}

                          <Paper
                            elevation={0}
                            sx={{
                              px: 1,
                              py: 0.5,
                              bgcolor: message.isOwn ? '#fee500' : '#ffffff',
                              borderRadius: message.isOwn ? '8px 8px 0 8px' : '8px 8px 8px 0',
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                              {message.content}
                            </Typography>
                          </Paper>

                          {!message.isOwn && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                              <IconButton
                                size="small"
                                onClick={() => handlePlayTTS(message.id, message.content)}
                                disabled={playingTTS === message.id}
                                sx={{ p: 0.25 }}
                              >
                                {playingTTS === message.id ? (
                                  <CircularProgress size={12} />
                                ) : (
                                  <VolumeUpIcon sx={{ fontSize: 14 }} />
                                )}
                              </IconButton>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.55rem' }}>
                                {formatTime(message.createdAt)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
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
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': { bgcolor: 'grey.300' },
                }}
              >
                {sendingMessage ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
              </IconButton>
            </Box>
          </>
        )}
      </Paper>
    </Fade>
  )
}

export default ChatRoomModal
