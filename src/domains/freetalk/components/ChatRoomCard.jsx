import { Card, CardContent, Box, Typography, Chip, Button } from '@mui/material'
import { AccessTime as TimeIcon, People as PeopleIcon, Lock as LockIcon } from '@mui/icons-material'

const levelColors = {
  beginner: { bg: '#e8f5e9', color: '#2e7d32', label: '초급' },
  intermediate: { bg: '#fff3e0', color: '#ef6c00', label: '중급' },
  advanced: { bg: '#fce4ec', color: '#c2185b', label: '고급' },
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = Math.floor((now - new Date(date)) / 1000)

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

const formatDate = (date) => {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day}`
}

const ChatRoomCard = ({ room, onClick }) => {
  const level = levelColors[room.level] || levelColors.beginner

  const handleEnterClick = (e) => {
    e.stopPropagation()
    onClick?.(room)
  }

  return (
    <Card
      sx={{
        width: 300,
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단: 레벨 뱃지 + 방 이름 + 입장 버튼 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={level.label}
            size="small"
            sx={{
              backgroundColor: level.bg,
              color: level.color,
              fontWeight: 600,
              fontSize: 11,
              height: 24,
            }}
          />

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            {room.isPrivate && (
              <LockIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            )}
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {room.name}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={handleEnterClick}
            sx={{
              minWidth: 52,
              height: 28,
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            입장
          </Button>
        </Box>

        {/* 중단: 소개 */}
        {room.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              mt: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {room.description}
          </Typography>
        )}

        {/* 하단: 인원, 마지막 대화, 생성일 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {room.currentMembers}
              </Box>
              /{room.maxMembers}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatTimeAgo(room.lastMessageAt)}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary">
            · 생성: {formatDate(room.createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ChatRoomCard
