import { Box, Typography, Chip } from '@mui/material'
import { GAME_COLORS } from '../../theme/gameTheme'

/**
 * UsedWordsList - 사용된 단어 목록
 */
const UsedWordsList = ({ words }) => {
    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                사용된 단어 ({words.length})
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    maxHeight: 200,
                    overflowY: 'auto',
                    p: 1,
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                }}
            >
                {words.length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                        아직 사용된 단어가 없습니다
                    </Typography>
                ) : (
                    words.map((wordData, index) => (
                        <Chip
                            key={index}
                            label={wordData.word || wordData}
                            size="small"
                            sx={{
                                bgcolor: GAME_COLORS.primaryBg,
                                color: GAME_COLORS.primary,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            }}
                        />
                    ))
                )}
            </Box>
        </Box>
    )
}

export default UsedWordsList
