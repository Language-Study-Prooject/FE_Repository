import { Box, LinearProgress } from '@mui/material'
import { useThemeMode } from '../../../contexts/ThemeContext'

/**
 * 투표 결과 진행바 컴포넌트
 * 투표 옵션의 득표율을 시각적으로 표시합니다.
 *
 * @param {Object} props
 * @param {number} props.percentage - 득표율 (0-100)
 * @param {boolean} props.isUserVoted - 사용자가 해당 옵션에 투표했는지 여부
 * @returns {JSX.Element}
 */
const PollResultBar = ({ percentage, isUserVoted = false }) => {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 1,
            bgcolor: isUserVoted
              ? isDark
                ? '#facc15'
                : '#fee500'
              : isDark
                ? 'rgba(250, 204, 21, 0.5)'
                : 'rgba(254, 229, 0, 0.5)',
            transition: 'transform 0.4s ease-in-out',
          },
        }}
      />
      {isUserVoted && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 1,
            border: `2px solid ${isDark ? '#fbbf24' : '#fde047'}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  )
}

export default PollResultBar
