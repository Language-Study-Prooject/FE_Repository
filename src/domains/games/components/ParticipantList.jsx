import {Avatar, Box, Chip, List, ListItem, ListItemAvatar, ListItemText, Typography} from '@mui/material'
import {GAME_COLORS} from '../theme/gameTheme'

const ParticipantList = ({ participants, maxParticipants, currentUserId }) => {
    const emptySlots = maxParticipants - participants.length

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                    참가자
                </Typography>
                <Chip
                    label={`${participants.length}/${maxParticipants}`}
                    size="small"
                    sx={{
                        bgcolor: GAME_COLORS.primaryBg,
                        color: GAME_COLORS.primary,
                        fontWeight: 600,
                    }}
                />
            </Box>

            <List sx={{ p: 0 }}>
                {participants.map((participant) => (
                    <ListItem
                        key={participant.userId}
                        sx={{
                            bgcolor: participant.userId === currentUserId ? `${GAME_COLORS.primary}10` : 'transparent',
                            borderRadius: '12px',
                            mb: 0.5,
                            px: 1.5,
                        }}
                    >
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: participant.isHost ? GAME_COLORS.primary : '#9CA3AF',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {participant.nickname?.charAt(0) || 'U'}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 100,
                                        }}
                                        title={participant.nickname}
                                    >
                                        {participant.nickname}
                                    </Typography>
                                    {participant.isHost && (
                                        <Chip
                                            label="방장"
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.6rem',
                                                bgcolor: '#FEF3C7',
                                                color: '#92400E',
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    {participant.userId === currentUserId && (
                                        <Chip
                                            label="나"
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.6rem',
                                                bgcolor: GAME_COLORS.primaryBg,
                                                color: GAME_COLORS.primary,
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                ))}

                {/* 빈 슬롯 */}
                {Array.from({ length: emptySlots }).map((_, index) => (
                    <ListItem
                        key={`empty-${index}`}
                        sx={{
                            borderRadius: '12px',
                            mb: 0.5,
                            px: 1.5,
                            opacity: 0.5,
                        }}
                    >
                        <ListItemAvatar sx={{ minWidth: 44 }}>
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: '#E5E7EB',
                                    fontSize: '0.9rem',
                                }}
                            >
                                ?
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body2" color="text.secondary">
                                    대기중...
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}

export default ParticipantList
