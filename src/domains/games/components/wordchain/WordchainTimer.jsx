import { Box, CircularProgress, Typography } from '@mui/material'
import { GAME_COLORS, GAME_TYPOGRAPHY } from '../../theme/gameTheme'

/**
 * WordchainTimer - 원형 타이머
 */
const WordchainTimer = ({ timeLeft, timeLimit }) => {
    const percentage = (timeLeft / timeLimit) * 100
    const isDanger = timeLeft <= 5

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                animation: isDanger ? 'pulse 1s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
            }}
        >
            <CircularProgress
                variant="determinate"
                value={percentage}
                size={80}
                thickness={4}
                sx={{
                    color: isDanger ? GAME_COLORS.timer.danger : GAME_COLORS.timer.normal,
                    transition: 'color 0.3s ease',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    sx={{
                        ...GAME_TYPOGRAPHY.timer,
                        fontSize: '1.5rem',
                        color: isDanger ? GAME_COLORS.timer.danger : GAME_COLORS.timer.normal,
                    }}
                >
                    {timeLeft}
                </Typography>
            </Box>
        </Box>
    )
}

export default WordchainTimer
