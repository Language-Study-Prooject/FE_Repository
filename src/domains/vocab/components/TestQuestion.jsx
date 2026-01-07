import { Box, Typography, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material'

export default function TestQuestion({
  question,
  selectedAnswer,
  onSelect,
  showResult = false,
  disabled = false,
}) {
  if (!question) return null

  const getOptionStyle = (option) => {
    if (!showResult) {
      return {
        border: selectedAnswer === option ? '2px solid' : '1px solid',
        borderColor: selectedAnswer === option ? 'primary.main' : 'divider',
        backgroundColor: selectedAnswer === option ? 'primary.50' : 'background.paper',
      }
    }

    // 결과 표시 모드
    const isCorrect = option === question.correctAnswer
    const isSelected = option === selectedAnswer

    if (isCorrect) {
      return {
        border: '2px solid',
        borderColor: 'success.main',
        backgroundColor: 'success.50',
      }
    }
    if (isSelected && !isCorrect) {
      return {
        border: '2px solid',
        borderColor: 'error.main',
        backgroundColor: 'error.50',
      }
    }
    return {
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      opacity: 0.6,
    }
  }

  return (
    <Box>
      {/* 문제 */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          textAlign: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          {question.question}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
          {question.type === 'KOREAN_TO_ENGLISH'
            ? '다음 중 올바른 영어 단어는?'
            : '다음 중 올바른 한국어 뜻은?'}
        </Typography>
      </Paper>

      {/* 선택지 */}
      <RadioGroup
        value={selectedAnswer || ''}
        onChange={(e) => !disabled && onSelect(e.target.value)}
      >
        <Box display="flex" flexDirection="column" gap={1.5}>
          {question.options.map((option, index) => (
            <Paper
              key={index}
              onClick={() => !disabled && onSelect(option)}
              sx={{
                p: 2,
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.2s',
                ...getOptionStyle(option),
                '&:hover': disabled
                  ? {}
                  : {
                      borderColor: 'primary.main',
                      transform: 'translateX(4px)',
                    },
              }}
            >
              <FormControlLabel
                value={option}
                control={
                  <Radio
                    disabled={disabled}
                    sx={{
                      color: showResult
                        ? option === question.correctAnswer
                          ? 'success.main'
                          : option === selectedAnswer
                          ? 'error.main'
                          : 'action.disabled'
                        : 'primary.main',
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body1"
                    fontWeight={selectedAnswer === option ? 600 : 400}
                  >
                    {`${['①', '②', '③', '④'][index]} ${option}`}
                  </Typography>
                }
                sx={{ m: 0, width: '100%' }}
              />
            </Paper>
          ))}
        </Box>
      </RadioGroup>
    </Box>
  )
}
