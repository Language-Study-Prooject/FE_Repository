import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Chip,
  Avatar,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  VolumeUp as VolumeUpIcon,
  Refresh as RefreshIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material'
import { chatRoomService, messageService, voiceService, TEMP_USER_ID } from '../../chat/services/chatService'

const levelColors = {
  beginner: { bg: '#e8f5e9', color: '#2e7d32', label: '초급' },
  intermediate: { bg: '#fff3e0', color: '#ef6c00', label: '중급' },
  advanced: { bg: '#fce4ec', color: '#c2185b', label: '고급' },
}

const ChatRoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [error, setError] = useState(null)
  const [playingTTS, setPlayingTTS] = useState(null)

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

  // 메시지 목록 조회
  const fetchMessages = useCallback(async () => {
    try {
      const response = await messageService.getList(roomId, { limit: 50 })
      const transformedMessages = (response.messages || []).map((msg) => ({
        id: msg.messageId,
        content: msg.content,
        userId: msg.userId,
        messageType: msg.messageType,
        createdAt: new Date(msg.createdAt),
        isOwn: msg.userId === TEMP_USER_ID,
      }))
      // 오래된 메시지가 위에 오도록 정렬
      setMessages(transformedMessages.reverse())
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      setError('메시지를 불러오는데 실패했습니다')
    }
  }, [roomId])

  // 초기 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchRoomDetail(), fetchMessages()])
      setLoading(false)
    }
    loadData()
  }, [fetchRoomDetail, fetchMessages])

  // 스크롤 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Optimistic update
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
      await messageService.send(roomId, messageContent)
      // 전송 성공 시 메시지 새로고침
      await fetchMessages()
    } catch (err) {
      console.error('Failed to send message:', err)
      // 실패 시 임시 메시지 제거
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
      setError('메시지 전송에 실패했습니다')
    } finally {
      setSendingMessage(false)
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

  // 시간 포맷
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#b2c7d9' }}>
      {/* 헤더 */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate('/freetalk/people')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {room?.name || '채팅방'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
            </Box>
          </Box>
          <IconButton onClick={handleRefresh} title="새로고침">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleLeaveRoom} color="error" title="나가기">
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 1 }}>
          {error}
        </Alert>
      )}

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
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
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
              {/* 아바타 (상대방만) */}
              {!message.isOwn && (
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
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
                  <Typography variant="caption" sx={{ mb: 0.5, ml: 1 }}>
                    {message.userId}
                  </Typography>
                )}

                {/* 메시지 버블 */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5 }}>
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
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Paper>

                  {!message.isOwn && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handlePlayTTS(message.id)}
                        disabled={playingTTS === message.id}
                        sx={{ p: 0.5 }}
                      >
                        {playingTTS === message.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <VolumeUpIcon fontSize="small" />
                        )}
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
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
          placeholder="메시지를 입력하세요..."
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
          disabled={!newMessage.trim() || sendingMessage}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'grey.300' },
          }}
        >
          {sendingMessage ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Paper>
    </Box>
  )
}

export default ChatRoomPage
