import { useState } from 'react'
import { Box, Button, Card, CardContent, Chip, Typography, IconButton } from '@mui/material'
import {
  HowToVote as VoteIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import { useThemeMode } from '../../../contexts/ThemeContext'
import { calculatePollResults } from '../types/chatCommandTypes'
import PollResultBar from './PollResultBar'

/**
 * 투표 카드 컴포넌트
 * 투표 생성, 투표하기, 결과 보기 기능을 제공합니다.
 *
 * @param {Object} props
 * @param {Object} props.poll - 투표 데이터
 * @param {string} props.currentUserId - 현재 사용자 ID
 * @param {function} props.onVote - 투표 시 호출되는 콜백
 * @param {function} props.onEndPoll - 투표 종료 시 호출되는 콜백
 * @returns {JSX.Element}
 */
const PollCard = ({ poll, currentUserId, onVote, onEndPoll }) => {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'
  const [selectedOption, setSelectedOption] = useState(null)

  const { totalVotes, percentages } = calculatePollResults(poll.options)
  const hasVoted = poll.options.some((opt) => opt.voters.includes(currentUserId))
  const isCreator = poll.creatorId === currentUserId
  const showResults = !poll.isActive || hasVoted

  const handleVote = (optionId) => {
    if (!poll.isActive || hasVoted) return
    setSelectedOption(optionId)
    onVote?.(poll.pollId, optionId)
  }

  const handleEndPoll = () => {
    onEndPoll?.(poll.pollId)
  }

  return (
    <Card
      elevation={2}
      sx={{
        maxWidth: 500,
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {/* 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <VoteIcon sx={{ color: isDark ? '#facc15' : '#f59e0b' }} />
          <Typography variant="subtitle2" fontWeight={600}>
            투표
          </Typography>
          {poll.isActive ? (
            <Chip
              label="진행 중"
              size="small"
              color="success"
              sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
            />
          ) : (
            <Chip
              label="종료됨"
              size="small"
              color="default"
              sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>

        {/* 질문 */}
        <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
          {poll.question}
        </Typography>

        {/* 옵션 목록 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          {poll.options.map((option, index) => {
            const percentage = percentages[index]
            const isSelected = selectedOption === option.optionId
            const userVoted = option.voters.includes(currentUserId)

            return (
              <Box key={option.optionId}>
                {showResults ? (
                  // 결과 보기 모드
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={userVoted ? 600 : 400}>
                          {option.text}
                        </Typography>
                        {userVoted && <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {option.voteCount}표 ({percentage}%)
                      </Typography>
                    </Box>
                    <PollResultBar percentage={percentage} isUserVoted={userVoted} />
                  </Box>
                ) : (
                  // 투표하기 모드
                  <Button
                    fullWidth
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => handleVote(option.optionId)}
                    disabled={!poll.isActive}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: isSelected ? (isDark ? '#facc15' : '#fee500') : 'transparent',
                      color: isSelected ? '#1c1917' : 'inherit',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#e0e0e0',
                      '&:hover': {
                        bgcolor: isSelected
                          ? isDark
                            ? '#fbbf24'
                            : '#fde047'
                          : isDark
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    <Typography variant="body2">{option.text}</Typography>
                  </Button>
                )}
              </Box>
            )
          })}
        </Box>

        {/* 하단 정보 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              총 {totalVotes}명 참여
            </Typography>
          </Box>

          {isCreator && poll.isActive && (
            <IconButton size="small" onClick={handleEndPoll} color="error" title="투표 종료">
              <CancelIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* 생성자 정보 */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          생성자: {poll.creatorId}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default PollCard
