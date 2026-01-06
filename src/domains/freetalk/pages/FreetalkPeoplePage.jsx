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
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import ChatRoomCard from '../components/ChatRoomCard'

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
  },
]

const FreetalkPeoplePage = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const handleLevelChange = (event, newLevel) => {
    if (newLevel !== null) {
      setLevelFilter(newLevel)
    }
  }

  const handleRoomClick = (room) => {
    // TODO: 채팅방 입장 로직
    console.log('Entering room:', room.id)
    navigate(`/freetalk/people/room/${room.id}`)
  }

  const filteredRooms = mockRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === 'all' || room.level === levelFilter
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
    </Container>
  )
}

export default FreetalkPeoplePage
