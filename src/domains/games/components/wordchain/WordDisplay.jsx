import { Box, Typography } from '@mui/material'
import { GAME_COLORS, GAME_TYPOGRAPHY } from '../../theme/gameTheme'
import { useThemeMode } from '../../../../contexts/ThemeContext'

/**
 * WordDisplay - 현재 단어 & 다음 글자 표시
 */
const WordDisplay = ({ currentWord, nextLetter, isMyTurn }) => {
    const { mode } = useThemeMode()
    const isDark = mode === 'dark'

    return (
        <Box
            sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: isDark ? '#27272a' : 'white',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: isMyTurn ? GAME_COLORS.primary : 'divider',
                transition: 'all 0.3s ease',
            }}
        >
            {currentWord ? (
                <>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        현재 단어
                    </Typography>
                    <Typography
                        sx={{
                            ...GAME_TYPOGRAPHY.word,
                            fontSize: '2.5rem',
                            color: GAME_COLORS.primary,
                            mb: 2,
                        }}
                    >
                        {currentWord}
                    </Typography>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 3,
                            py: 1.5,
                            borderRadius: '12px',
                            bgcolor: GAME_COLORS.primaryBg,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            다음 시작 글자:
                        </Typography>
                        <Typography
                            sx={{
                                ...GAME_TYPOGRAPHY.word,
                                fontSize: '2rem',
                                color: GAME_COLORS.primary,
                            }}
                        >
                            {nextLetter}
                        </Typography>
                    </Box>
                </>
            ) : (
                <Typography variant="h6" color="text.secondary">
                    첫 단어를 기다리는 중...
                </Typography>
            )}
        </Box>
    )
}

export default WordDisplay
