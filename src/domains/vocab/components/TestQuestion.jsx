import { Box, Typography, Paper, Radio, RadioGroup, FormControlLabel } from '@mui/material'

export default function TestQuestion({
  question,
  selectedAnswer,
  onSelect,
  showResult = false,
  disabled = false,
}) {
  if (!question) return null

  const getOptionStyle = (option, index) => {
    const isSelected = selectedAnswer === option
    const isCorrect = option === question.correctAnswer

    if (!showResult) {
      return {
        border: isSelected ? '2px solid #059669' : '2px solid #e7e5e4',
        backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
      }
    }

    // Result mode
    if (isCorrect) {
      return {
        border: '2px solid #10b981',
        backgroundColor: '#ecfdf5',
      }
    }
    if (isSelected && !isCorrect) {
      return {
        border: '2px solid #ef4444',
        backgroundColor: '#fef2f2',
      }
    }
    return {
      border: '2px solid #e7e5e4',
      backgroundColor: '#fafaf9',
      opacity: 0.5,
    }
  }

  const optionLabels = ['A', 'B', 'C', 'D']

  return (
    <Box>
      {/* Question Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          borderRadius: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -20,
            left: 20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        <Typography
          variant="overline"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 2,
            fontWeight: 600,
            display: 'block',
            mb: 2,
          }}
        >
          WHAT DOES THIS MEAN?
        </Typography>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: 'white',
            mb: 2,
            letterSpacing: '-0.02em',
          }}
        >
          {question.english || question.question}
        </Typography>

        {question.example && (
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic',
              maxWidth: 320,
              mx: 'auto',
            }}
          >
            "{question.example}"
          </Typography>
        )}
      </Paper>

      {/* Options */}
      <RadioGroup
        value={selectedAnswer || ''}
        onChange={(e) => !disabled && onSelect(e.target.value)}
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrect = showResult && option === question.correctAnswer
            const isWrong = showResult && isSelected && !isCorrect

            return (
              <Paper
                key={index}
                elevation={0}
                onClick={() => !disabled && onSelect(option)}
                sx={{
                  p: 0,
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '16px',
                  ...getOptionStyle(option, index),
                  '&:hover': disabled
                    ? {}
                    : {
                        borderColor: '#059669',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px -4px rgba(5, 150, 105, 0.2)',
                      },
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ p: 2 }}
                >
                  {/* Option Label */}
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      backgroundColor: isCorrect
                        ? '#10b981'
                        : isWrong
                        ? '#ef4444'
                        : isSelected
                        ? '#059669'
                        : '#f5f5f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: isCorrect || isWrong || isSelected ? 'white' : '#57534e',
                      }}
                    >
                      {optionLabels[index]}
                    </Typography>
                  </Box>

                  {/* Option Text */}
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: isCorrect
                        ? '#059669'
                        : isWrong
                        ? '#ef4444'
                        : '#1c1917',
                      flex: 1,
                    }}
                  >
                    {option}
                  </Typography>

                  {/* Result Icon */}
                  {showResult && isCorrect && (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: 2,
                      }}
                    >
                      <Typography sx={{ color: 'white', fontSize: 16 }}>✓</Typography>
                    </Box>
                  )}
                  {showResult && isWrong && (
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '8px',
                        backgroundColor: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: 2,
                      }}
                    >
                      <Typography sx={{ color: 'white', fontSize: 16 }}>✕</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            )
          })}
        </Box>
      </RadioGroup>
    </Box>
  )
}
