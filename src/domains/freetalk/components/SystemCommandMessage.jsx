import { Box, Paper, Typography } from '@mui/material'
import { useThemeMode } from '../../../contexts/ThemeContext'
import { SystemCommandConfig } from '../types/chatCommandTypes'

/**
 * 시스템 명령어 메시지 컴포넌트
 * /dice, /coin, /random, /members, /help 등의 명령어 결과를 표시합니다.
 *
 * @param {Object} props
 * @param {Object} props.data - 시스템 명령어 데이터
 * @param {string} props.data.commandType - 명령어 타입
 * @param {string} props.data.userId - 실행한 사용자 ID
 * @param {Object} props.data.result - 명령어 결과
 * @param {string} props.data.displayText - 표시할 텍스트
 * @returns {JSX.Element}
 */
const SystemCommandMessage = ({ data }) => {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'

  // 디버깅
  console.log('[SystemCommandMessage] received data:', data)

  // 명령어 타입 추출 (여러 가능한 필드 확인)
  const commandType = data?.commandType || data?.type || data?.raw?.type || 'help'
  const config = SystemCommandConfig[commandType] || SystemCommandConfig.help
  const { icon, color, bgColor } = config

  // 표시 텍스트 추출
  const displayText = data?.displayText || data?.message || data?.content || ''
  const userId = data?.userId || data?.nickname || ''

  // 결과 값 추출
  const result = data?.result || data?.raw || {}

  console.log('[SystemCommandMessage] displayText:', displayText)

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 1 }}>
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 1.5,
          bgcolor: isDark ? 'rgba(255,255,255,0.05)' : bgColor,
          border: isDark ? `1px solid ${color}40` : `1px solid ${color}20`,
          borderRadius: 3,
          maxWidth: '80%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* 아이콘 */}
          <Box
            sx={{
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>

          {/* 내용 */}
          <Box sx={{ flex: 1 }}>
            {/* displayText가 있으면 그대로 표시 (백엔드에서 이미 포맷팅됨) */}
            {displayText ? (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: isDark ? '#fafaf9' : 'text.primary',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {displayText}
              </Typography>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: isDark ? '#9ca3af' : 'text.secondary',
                    }}
                  >
                    {userId}
                  </Typography>
                </Box>
                {/* 추가 결과 정보 */}
                {renderCommandResult(commandType, result, isDark)}
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

/**
 * 명령어 타입별 결과 렌더링
 */
function renderCommandResult(commandType, result, isDark) {
  if (!result) return null

  switch (commandType) {
    case 'dice':
      return (
        <Typography
          variant="h5"
          sx={{
            mt: 0.5,
            fontWeight: 700,
            color: isDark ? '#facc15' : '#f59e0b',
            fontFamily: 'monospace',
          }}
        >
          {result.value}
        </Typography>
      )

    case 'coin':
      return (
        <Typography
          variant="body1"
          sx={{
            mt: 0.5,
            fontWeight: 600,
            color: isDark ? '#facc15' : '#f59e0b',
          }}
        >
          {result.side === 'heads' ? '앞면' : '뒷면'}
        </Typography>
      )

    case 'random':
      return (
        <Typography
          variant="h6"
          sx={{
            mt: 0.5,
            fontWeight: 700,
            color: isDark ? '#06b6d4' : '#0891b2',
            fontFamily: 'monospace',
          }}
        >
          {result.value}
          {result.min !== undefined && result.max !== undefined && (
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 1, color: 'text.secondary' }}
            >
              ({result.min}-{result.max})
            </Typography>
          )}
        </Typography>
      )

    case 'members':
      return result.memberIds ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            참여 중인 멤버 ({result.totalCount}명):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {result.memberIds.map((memberId) => (
              <Typography
                key={memberId}
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.25,
                  bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  fontWeight: 500,
                }}
              >
                {memberId}
              </Typography>
            ))}
          </Box>
        </Box>
      ) : null

    case 'help':
      return result.commands ? (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            사용 가능한 명령어:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {result.commands.map((cmd) => (
              <Typography
                key={cmd.command}
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: isDark ? '#facc15' : '#f59e0b',
                }}
              >
                {cmd.command} - {cmd.description}
              </Typography>
            ))}
          </Box>
        </Box>
      ) : null

    default:
      return null
  }
}

export default SystemCommandMessage
