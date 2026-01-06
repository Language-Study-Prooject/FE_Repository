import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Lock as LockIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import ChatRoomCard from '../components/ChatRoomCard'
import CreateRoomModal from '../components/CreateRoomModal'
import { chatRoomService, TEMP_USER_ID } from '../../chat/services/chatService'

const levelColors = {
  beginner: { bg: '#e8f5e9', color: '#2e7d32', label: '초급' },
  intermediate: { bg: '#fff3e0', color: '#ef6c00', label: '중급' },
  advanced: { bg: '#fce4ec', color: '#c2185b', label: '고급' },
}

const FreetalkPeoplePage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // API 관련 state
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [joining, setJoining] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const observerRef = useRef(null)

  // API에서 채팅방 데이터를 프론트엔드 형식으로 변환
  const transformRoomData = (apiRoom) => ({
    id: apiRoom.roomId,
    name: apiRoom.name,
    description: apiRoom.description || '',
    level: apiRoom.level?.toLowerCase() || 'beginner',
    currentMembers: apiRoom.currentParticipants || 0,
    maxMembers: apiRoom.maxParticipants || 6,
    lastMessageAt: apiRoom.lastMessageAt ? new Date(apiRoom.lastMessageAt) : null,
    createdAt: apiRoom.createdAt ? new Date(apiRoom.createdAt) : new Date(),
    isPrivate: apiRoom.isPrivate || false,
    isJoined: apiRoom.isJoined || false,
  })

  // 채팅방 목록 조회
  const fetchRooms = useCallback(async (isLoadMore = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const params = {
        limit: 10,
        ...(levelFilter !== 'all' && levelFilter !== 'joined' && { level: levelFilter.toUpperCase() }),
        ...(levelFilter === 'joined' && { joined: true }),
        ...(isLoadMore && cursor && { cursor }),
      }

      const response = await chatRoomService.getList(params)
      const transformedRooms = (response.rooms || []).map(transformRoomData)

      if (isLoadMore) {
        setRooms((prev) => [...prev, ...transformedRooms])
      } else {
        setRooms(transformedRooms)
      }

      setCursor(response.nextCursor || null)
      setHasMore(!!response.nextCursor)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
      setError('채팅방 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [levelFilter, cursor, loading])

  // 초기 로드 및 필터 변경 시 재조회
  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true)
      setError(null)
      setCursor(null)
      setHasMore(true)
      setRooms([])

      try {
        const params = {
          limit: 10,
          ...(levelFilter !== 'all' && levelFilter !== 'joined' && { level: levelFilter.toUpperCase() }),
          ...(levelFilter === 'joined' && { joined: true }),
        }

        const response = await chatRoomService.getList(params)
        const transformedRooms = (response.rooms || []).map(transformRoomData)
        setRooms(transformedRooms)
        setCursor(response.nextCursor || null)
        setHasMore(!!response.nextCursor)
      } catch (err) {
        console.error('Failed to fetch rooms:', err)
        setError('채팅방 목록을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [levelFilter])

  // 무한 스크롤
  const lastRoomRef = useCallback((node) => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchRooms(true)
      }
    })

    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, fetchRooms])

  // 새로고침
  const handleRefresh = async () => {
    setLoading(true)
    setError(null)
    setCursor(null)
    setHasMore(true)
    setRooms([])

    try {
      const params = {
        limit: 10,
        ...(levelFilter !== 'all' && levelFilter !== 'joined' && { level: levelFilter.toUpperCase() }),
        ...(levelFilter === 'joined' && { joined: true }),
      }

      const response = await chatRoomService.getList(params)
      const transformedRooms = (response.rooms || []).map(transformRoomData)
      setRooms(transformedRooms)
      setCursor(response.nextCursor || null)
      setHasMore(!!response.nextCursor)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
      setError('채팅방 목록을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleLevelChange = (event, newLevel) => {
    if (newLevel !== null) {
      setLevelFilter(newLevel)
    }
  }

  const handleRoomClick = (room) => {
    setSelectedRoom(room)
    setPassword('')
    setPasswordError('')
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedRoom(null)
    setPassword('')
    setPasswordError('')
  }

  const handleEnterRoom = async () => {
    if (!selectedRoom) return

    setJoining(true)
    setPasswordError('')

    try {
      await chatRoomService.join(selectedRoom.id, selectedRoom.isPrivate ? password : undefined)
      navigate(`/freetalk/people/room/${selectedRoom.id}`)
      handleCloseModal()
    } catch (err) {
      console.error('Failed to join room:', err)
      if (err.response?.status === 401 || err.response?.data?.message?.includes('password')) {
        setPasswordError('비밀번호가 일치하지 않습니다')
      } else if (err.response?.status === 409) {
        // 이미 참여중인 경우 바로 입장
        navigate(`/freetalk/people/room/${selectedRoom.id}`)
        handleCloseModal()
      } else {
        setPasswordError('입장에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setJoining(false)
    }
  }

  // 클라이언트 사이드 검색 필터
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <Container maxWidth="lg">
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          사람들과 프리토킹
        </Typography>
        <Typography variant="body1" color="text.secondary">
          다른 학습자들과 함께 영어로 자유롭게 대화해보세요
        </Typography>
      </Box>

      {/* 필터 영역 */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
        {/* 검색 */}
        <TextField
          placeholder="채팅방 검색..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1, maxWidth: { sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* 레벨 필터 */}
        <ToggleButtonGroup
          value={levelFilter}
          exclusive
          onChange={handleLevelChange}
          size="small"
        >
          <ToggleButton value="all">전체</ToggleButton>
          <ToggleButton value="beginner">초급</ToggleButton>
          <ToggleButton value="intermediate">중급</ToggleButton>
          <ToggleButton value="advanced">고급</ToggleButton>
          <ToggleButton value="joined">참여중</ToggleButton>
        </ToggleButtonGroup>

        {/* 새로고침 버튼 */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          새로고침
        </Button>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 채팅방 목록 */}
      <Grid container spacing={2} alignItems="stretch">
        {filteredRooms.map((room, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={room.id}
            sx={{ display: 'flex' }}
            ref={index === filteredRooms.length - 1 ? lastRoomRef : null}
          >
            <ChatRoomCard room={room} onClick={handleRoomClick} />
          </Grid>
        ))}
      </Grid>

      {/* 로딩 인디케이터 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 빈 상태 */}
      {!loading && filteredRooms.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {error ? '데이터를 불러올 수 없습니다' : '채팅방이 없습니다'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error ? '새로고침 버튼을 눌러 다시 시도해주세요' : '새 채팅방을 만들어보세요'}
          </Typography>
        </Box>
      )}

      {/* 채팅방 만들기 FAB */}
      <Fab
        color="primary"
        aria-label="채팅방 만들기"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 채팅방 생성 모달 */}
      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* 입장 모달 */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        {selectedRoom && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedRoom.isPrivate && (
                  <LockIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                )}
                <Typography variant="h6" component="span">
                  {selectedRoom.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              {/* 방 정보 */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Chip
                    label={levelColors[selectedRoom.level]?.label}
                    size="small"
                    sx={{
                      backgroundColor: levelColors[selectedRoom.level]?.bg,
                      color: levelColors[selectedRoom.level]?.color,
                      fontWeight: 600,
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedRoom.currentMembers}/{selectedRoom.maxMembers}명
                    </Typography>
                  </Box>
                </Box>
                {selectedRoom.description && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedRoom.description}
                  </Typography>
                )}
              </Box>

              {/* 비밀번호 입력 (비밀방인 경우) */}
              {selectedRoom.isPrivate && (
                <TextField
                  fullWidth
                  type="password"
                  label="비밀번호"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                  }}
                  error={!!passwordError}
                  helperText={passwordError}
                  size="small"
                  autoFocus
                />
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleCloseModal} color="inherit" disabled={joining}>
                취소
              </Button>
              <Button
                onClick={handleEnterRoom}
                variant="contained"
                disabled={(selectedRoom.isPrivate && !password) || joining}
                startIcon={joining && <CircularProgress size={16} color="inherit" />}
              >
                {joining ? '입장중...' : '입장하기'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default FreetalkPeoplePage
