import { useState } from 'react'
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
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Lock as LockIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import ChatRoomCard from '../components/ChatRoomCard'

const levelColors = {
  beginner: { bg: '#e8f5e9', color: '#2e7d32', label: '초급' },
  intermediate: { bg: '#fff3e0', color: '#ef6c00', label: '중급' },
  advanced: { bg: '#fce4ec', color: '#c2185b', label: '고급' },
}

// 더미 데이터
const mockRooms = [
  {
    id: 1,
    name: '영어 일상 대화방',
    description: '편하게 일상 영어로 대화해요',
    level: 'beginner',
    currentMembers: 3,
    maxMembers: 6,
    lastMessageAt: new Date(Date.now() - 5 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPrivate: false,
    isJoined: true,
  },
  {
    id: 2,
    name: '비즈니스 영어 연습',
    description: '회의, 이메일, 프레젠테이션 영어',
    level: 'intermediate',
    currentMembers: 4,
    maxMembers: 5,
    lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isPrivate: true,
    isJoined: false,
  },
  {
    id: 3,
    name: '고급 토론방',
    description: '시사 이슈로 깊이 있는 토론',
    level: 'advanced',
    currentMembers: 2,
    maxMembers: 4,
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isPrivate: true,
    isJoined: true,
  },
  {
    id: 4,
    name: '영어 초보 환영',
    description: '틀려도 괜찮아요! 함께 성장해요',
    level: 'beginner',
    currentMembers: 5,
    maxMembers: 8,
    lastMessageAt: new Date(Date.now() - 10 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isPrivate: false,
    isJoined: false,
  },
  {
    id: 5,
    name: '프리토킹 중급반',
    description: '자유 주제로 스피킹 연습',
    level: 'intermediate',
    currentMembers: 3,
    maxMembers: 6,
    lastMessageAt: new Date(Date.now() - 45 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isPrivate: false,
    isJoined: true,
  },
]

const FreetalkPeoplePage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

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

  const handleEnterRoom = () => {
    if (selectedRoom?.isPrivate) {
      // 비밀번호 검증 (더미: 1234)
      if (password === '1234') {
        navigate(`/freetalk/people/room/${selectedRoom.id}`)
        handleCloseModal()
      } else {
        setPasswordError('비밀번호가 일치하지 않습니다')
      }
    } else {
      navigate(`/freetalk/people/room/${selectedRoom.id}`)
      handleCloseModal()
    }
  }

  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase())
    let matchesLevel = false
    if (levelFilter === 'all') {
      matchesLevel = true
    } else if (levelFilter === 'joined') {
      matchesLevel = room.isJoined
    } else {
      matchesLevel = room.level === levelFilter
    }
    return matchesSearch && matchesLevel
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
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
      </Box>

      {/* 채팅방 목록 */}
      <Grid container spacing={2} alignItems="stretch">
        {filteredRooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room.id} sx={{ display: 'flex' }}>
            <ChatRoomCard room={room} onClick={handleRoomClick} />
          </Grid>
        ))}
      </Grid>

      {/* 빈 상태 */}
      {filteredRooms.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            검색 결과가 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            다른 키워드로 검색하거나 새 채팅방을 만들어보세요
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
        onClick={() => {
          // TODO: 채팅방 생성 모달
          console.log('Create new room')
        }}
      >
        <AddIcon />
      </Fab>

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
              <Button onClick={handleCloseModal} color="inherit">
                취소
              </Button>
              <Button
                onClick={handleEnterRoom}
                variant="contained"
                disabled={selectedRoom.isPrivate && !password}
              >
                입장하기
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default FreetalkPeoplePage
