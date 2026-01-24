import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material'
import {
    EmojiEvents as TrophyIcon,
    ExitToApp as ExitIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material'
import { GAME_COLORS, GAME_TYPOGRAPHY } from '../../theme/gameTheme'

/**
 * GameEndModal - 게임 종료 모달
 */
const GameEndModal = ({ open, winner, finalPlayers, onRestart, onExit, currentUserId }) => {
    const sortedPlayers = [...(finalPlayers || [])]
        .sort((a, b) => {
            // 생존자가 우선
            if (a.isAlive && !b.isAlive) return -1
            if (!a.isAlive && b.isAlive) return 1
            // 제출한 단어 수로 정렬
            return (b.wordsSubmitted || 0) - (a.wordsSubmitted || 0)
        })

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: '20px' },
            }}
        >
            <DialogTitle
                sx={{
                    bgcolor: GAME_COLORS.primary,
                    color: 'white',
                    textAlign: 'center',
                    py: 3,
                }}
            >
                <TrophyIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography variant="h5" fontWeight={700}>
                    게임 종료!
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ py: 3 }}>
                {winner && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            p: 3,
                            borderRadius: '16px',
                            bgcolor: '#FEF3C7',
                        }}
                    >
                        <Typography variant="h6" fontWeight={700} color="#92400E" gutterBottom>
                            우승자
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="#F59E0B">
                            {winner.nickname || winner.userId}
                            {winner.userId === currentUserId && ' (나)'}
                        </Typography>
                    </Box>
                )}

                <Typography variant="h6" fontWeight={700} textAlign="center" gutterBottom>
                    최종 순위
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                    {sortedPlayers.map((player, index) => (
                        <Box
                            key={player.userId}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: player.isAlive
                                    ? index === 0
                                        ? '#FEF3C7'
                                        : index === 1
                                        ? '#F3F4F6'
                                        : index === 2
                                        ? '#FED7AA'
                                        : 'transparent'
                                    : '#FEE2E2',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography
                                    sx={{
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {player.isAlive ? (
                                        index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}위`
                                    ) : '❌'}
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {player.nickname || player.userId}
                                    {player.userId === currentUserId && ' (나)'}
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    ...GAME_TYPOGRAPHY.score,
                                    fontSize: '1rem',
                                    color: player.isAlive ? GAME_COLORS.primary : 'text.secondary',
                                }}
                            >
                                {player.wordsSubmitted || 0}단어
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    startIcon={<ExitIcon />}
                    onClick={onExit}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    나가기
                </Button>
                <Button
                    variant="contained"
                    startIcon={<ReplayIcon />}
                    onClick={onRestart}
                    sx={{
                        bgcolor: GAME_COLORS.primary,
                        '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    다시하기
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default GameEndModal
