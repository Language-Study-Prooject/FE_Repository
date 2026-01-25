import { Box, Typography, Avatar } from '@mui/material'
import { CheckCircle as CheckIcon } from '@mui/icons-material'
import { GAME_COLORS } from '../../theme/gameTheme'
import { useThemeMode } from '../../../../contexts/ThemeContext'

/**
 * PlayerList - 플레이어 목록 (턴 & 생존 상태)
 */
const PlayerList = ({ players, currentTurnUserId, currentUserId }) => {
    const { mode } = useThemeMode()
    const isDark = mode === 'dark'

    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                플레이어
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {players.map((player) => {
                    const isCurrentTurn = player.userId === currentTurnUserId
                    const isMe = player.userId === currentUserId
                    const isAlive = player.isAlive !== false

                    return (
                        <Box
                            key={player.userId}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: isCurrentTurn
                                    ? GAME_COLORS.primaryBg
                                    : isMe
                                    ? isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                                    : 'transparent',
                                border: '2px solid',
                                borderColor: isCurrentTurn ? GAME_COLORS.primary : 'transparent',
                                opacity: isAlive ? 1 : 0.5,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: isCurrentTurn ? GAME_COLORS.primary : '#9CA3AF',
                                    fontSize: '0.875rem',
                                }}
                            >
                                {player.nickname?.[0] || player.userId?.[0] || '?'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    fontWeight={isCurrentTurn ? 700 : 500}
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {player.nickname || player.userId}
                                    {isMe && ' (나)'}
                                </Typography>
                                {isCurrentTurn && (
                                    <Typography variant="caption" color={GAME_COLORS.primary} fontWeight={600}>
                                        턴 진행 중
                                    </Typography>
                                )}
                            </Box>
                            {!isAlive && (
                                <Typography variant="caption" color="error" fontWeight={600}>
                                    탈락
                                </Typography>
                            )}
                            {isAlive && !isCurrentTurn && player.hasAnswered && (
                                <CheckIcon sx={{ fontSize: 20, color: GAME_COLORS.status.waiting }} />
                            )}
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

export default PlayerList
