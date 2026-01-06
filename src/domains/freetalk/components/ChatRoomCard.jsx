import { Card, CardContent, Box, Typography, Chip, Avatar, AvatarGroup } from '@mui/material'
import { AccessTime as TimeIcon, People as PeopleIcon } from '@mui/icons-material'

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
  const hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
}

const ChatRoomCard = ({ room, onClick }) => {
  const level = levelColors[room.level] || levelColors.beginner

  return (
    <Card
      onClick={() => onClick?.(room)}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* 레벨 뱃지 */}
          <Chip
            label={level.label}
            size="small"
            sx={{
              backgroundColor: level.bg,
              color: level.color,
              fontWeight: 600,
              minWidth: 48,
            }}
          />

          {/* 채팅방 정보 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {room.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              {/* 인원 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {room.currentMembers}
                  </Box>
                  /{room.maxMembers}
                </Typography>
              </Box>

              {/* 마지막 대화 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatTimeAgo(room.lastMessageAt)}
                </Typography>
              </Box>
            </Box>

            {/* 참여자 아바타 & 생성일 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12 } }}>
                {room.participants?.map((participant, index) => (
                  <Avatar key={index} alt={participant.name} src={participant.avatar}>
                    {participant.name?.[0]}
                  </Avatar>
                ))}
              </AvatarGroup>

              <Typography variant="caption" color="text.secondary">
                생성: {formatDate(room.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ChatRoomCard
