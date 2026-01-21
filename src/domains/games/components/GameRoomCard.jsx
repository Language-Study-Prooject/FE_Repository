import {Avatar, AvatarGroup, Box, Button, Card, CardContent, Chip, Typography} from '@mui/material'
import {
    Person as PersonIcon,
    PlayArrow as PlayIcon,
    Visibility as SpectateIcon,
} from '@mui/icons-material'
import {GAME_COLORS} from '../theme/gameTheme'

const levelConfig = {
    // 대문자
    BEGINNER: { label: '초급', color: '#10B981', bg: '#D1FAE5' },
    INTERMEDIATE: { label: '중급', color: '#F59E0B', bg: '#FEF3C7' },
    ADVANCED: { label: '고급', color: '#EF4444', bg: '#FEE2E2' },
    // 소문자 (백엔드 응답)
    beginner: { label: '초급', color: '#10B981', bg: '#D1FAE5' },
    intermediate: { label: '중급', color: '#F59E0B', bg: '#FEF3C7' },
    advanced: { label: '고급', color: '#EF4444', bg: '#FEE2E2' },
}

const statusConfig = {
    WAITING: { label: '대기중', color: GAME_COLORS.status.waiting, bg: GAME_COLORS.status.waitingBg },
    PLAYING: { label: '게임중', color: GAME_COLORS.status.playing, bg: GAME_COLORS.status.playingBg },
    FINISHED: { label: '종료', color: GAME_COLORS.status.finished, bg: GAME_COLORS.status.finishedBg },
}

const GameRoomCard = ({ room, onJoin, onSpectate }) => {
    const level = levelConfig[room.level] || levelConfig.beginner
    const status = statusConfig[room.status] || statusConfig.WAITING

    // 백엔드/프론트엔드 필드명 호환
    const maxParticipants = room.maxParticipants || room.maxMembers || 6
    const currentParticipants = room.currentParticipants || room.currentMembers || 1

    const isFull = currentParticipants >= maxParticipants
    const isPlaying = room.status === 'PLAYING'
    const canJoin = !isFull && !isPlaying

    return (
        <Card
            sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    borderColor: GAME_COLORS.primary,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px -8px ${GAME_COLORS.primary}30`,
                },
            }}
        >
            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 상단: 방 이름 + 상태 */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0, minHeight: 44 }}>
                        <Typography variant="h6" fontWeight={700} noWrap>
                            {room.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block', minHeight: 18 }}
                        >
                            {room.description || '\u00A0'}
                        </Typography>
                    </Box>
                    <Chip
                        label={status.label}
                        size="small"
                        sx={{
                            bgcolor: status.bg,
                            color: status.color,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            ml: 1,
                        }}
                    />
                </Box>

                {/* 중간: 방장 + 인원 + 레벨 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                    {/* 방장 - 고정 너비 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 90 }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: GAME_COLORS.primary, fontSize: '0.7rem', flexShrink: 0 }}>
                            {room.hostNickname?.charAt(0) || 'H'}
                        </Avatar>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                            }}
                            title={room.hostNickname}
                        >
                            {room.hostNickname}
                        </Typography>
                    </Box>

                    {/* 인원 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography
                            variant="caption"
                            fontWeight={600}
                            color={isFull ? 'error.main' : 'text.secondary'}
                        >
                            {currentParticipants}/{maxParticipants}
                        </Typography>
                    </Box>

                    {/* 레벨 */}
                    <Chip
                        label={level.label}
                        size="small"
                        sx={{
                            bgcolor: level.bg,
                            color: level.color,
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            height: 20,
                            flexShrink: 0,
                        }}
                    />
                </Box>

                {/* 참가자 아바타 - 항상 고정 높이 */}
                <Box sx={{ mb: 2, minHeight: 28 }}>
                    {room.participants && room.participants.length > 0 ? (
                        <AvatarGroup
                            max={4}
                            sx={{
                                justifyContent: 'flex-start',
                                '& .MuiAvatar-root': {
                                    width: 28,
                                    height: 28,
                                    fontSize: '0.7rem',
                                    border: '2px solid white',
                                },
                            }}
                        >
                            {room.participants.map((p) => (
                                <Avatar
                                    key={p.userId}
                                    sx={{
                                        bgcolor: p.isHost ? GAME_COLORS.primary : '#9CA3AF',
                                    }}
                                >
                                    {p.nickname?.charAt(0) || 'U'}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            참가자 대기중...
                        </Typography>
                    )}
                </Box>

                {/* 하단: 버튼 */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    {canJoin ? (
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={() => onJoin?.(room)}
                            sx={{
                                bgcolor: GAME_COLORS.primary,
                                '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            참가하기
                        </Button>
                    ) : isPlaying ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SpectateIcon />}
                            onClick={() => onSpectate?.(room)}
                            sx={{
                                borderColor: GAME_COLORS.status.playing,
                                color: GAME_COLORS.status.playing,
                                '&:hover': {
                                    borderColor: GAME_COLORS.status.playing,
                                    bgcolor: GAME_COLORS.status.playingBg,
                                },
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            관전하기
                        </Button>
                    ) : (
                        <Button
                            fullWidth
                            variant="outlined"
                            disabled
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                            }}
                        >
                            인원 마감
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

export default GameRoomCard
