import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  IconButton,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material'
import TestQuestion from '../components/TestQuestion'
import { testService } from '../services/vocabService'
import { LEVELS, LEVEL_LABELS, TEST_TYPES, TEST_TYPE_LABELS } from '../constants/vocabConstants'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

// 시험 설정 화면
function TestSetup({ onStart, recentResults, loading }) {
  const [wordCount, setWordCount] = useState(20)
  const [level, setLevel] = useState(null)
  const [type, setType] = useState(TEST_TYPES.ENGLISH_TO_KOREAN)

  const handleStart = () => {
    onStart({ wordCount, level, type })
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          시험 설정
        </Typography>

        {/* 문제 수 */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            문제 수
          </Typography>
          <ToggleButtonGroup
            value={wordCount}
            exclusive
            onChange={(e, val) => val && setWordCount(val)}
            fullWidth
          >
            <ToggleButton value={10}>10개</ToggleButton>
            <ToggleButton value={20}>20개</ToggleButton>
            <ToggleButton value={30}>30개</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 레벨 */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            레벨
          </Typography>
          <ToggleButtonGroup
            value={level}
            exclusive
            onChange={(e, val) => setLevel(val)}
            fullWidth
          >
            <ToggleButton value={null}>전체</ToggleButton>
            {Object.entries(LEVEL_LABELS).map(([key, label]) => (
              <ToggleButton key={key} value={key}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* 출제 유형 */}
        <Box mb={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: 14, color: 'text.secondary' }}>
              출제 유형
            </FormLabel>
            <RadioGroup
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {Object.entries(TEST_TYPE_LABELS).map(([key, label]) => (
                <FormControlLabel
                  key={key}
                  value={key}
                  control={<Radio />}
                  label={label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
          onClick={handleStart}
          disabled={loading}
        >
          시험 시작하기
        </Button>
      </Paper>

      {/* 최근 시험 기록 */}
      {recentResults.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            최근 시험 기록
          </Typography>
          {recentResults.map((result, index) => (
            <Card key={result.testId || index} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      {result.totalQuestions}문제
                    </Typography>
                  </Box>
                  <Chip
                    label={`${result.successRate?.toFixed(0) || 0}%`}
                    color={result.successRate >= 80 ? 'success' : result.successRate >= 60 ? 'warning' : 'error'}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}

// 시험 진행 화면
function TestInProgress({
  questions,
  currentIndex,
  answers,
  timeRemaining,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
}) {
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <Box>
      {/* 헤더 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          문제 {currentIndex + 1} / {questions.length}
        </Typography>
        <Chip
          icon={<TimerIcon />}
          label={`${minutes}:${seconds.toString().padStart(2, '0')}`}
          color={timeRemaining < 60 ? 'error' : 'default'}
        />
      </Box>

      {/* 진행률 */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 8, borderRadius: 4, mb: 3 }}
      />

      {/* 문제 */}
      <TestQuestion
        question={currentQuestion}
        selectedAnswer={answers[currentQuestion.questionId]}
        onSelect={(answer) => onAnswer(currentQuestion.questionId, answer)}
      />

      {/* 네비게이션 */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          startIcon={<PrevIcon />}
          onClick={onPrev}
          disabled={currentIndex === 0}
        >
          이전
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={Object.keys(answers).length !== questions.length}
          >
            제출하기
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<NextIcon />}
            onClick={onNext}
          >
            다음
          </Button>
        )}
      </Box>

      {/* 문제 번호 표시 */}
      <Box display="flex" justifyContent="center" gap={0.5} mt={3} flexWrap="wrap">
        {questions.map((q, idx) => (
          <Box
            key={q.questionId}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: answers[q.questionId]
                ? 'primary.main'
                : idx === currentIndex
                ? 'primary.light'
                : 'grey.200',
              color: answers[q.questionId] || idx === currentIndex ? 'white' : 'text.secondary',
            }}
            onClick={() => onNext(idx - currentIndex)}
          >
            {idx + 1}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// 결과 화면
function TestResult({ result, onRetry, onHome }) {
  const navigate = useNavigate()

  return (
    <Box textAlign="center" py={4}>
      <Typography variant="h2" fontWeight={700} color="primary.main" gutterBottom>
        {result.successRate?.toFixed(0)}점
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        {result.correctCount} / {result.totalQuestions} 정답
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="center" gap={4}>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {result.correctCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">정답</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="error.main" fontWeight={700}>
              {result.incorrectCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">오답</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 틀린 문제 */}
      {result.results?.filter(r => !r.isCorrect).length > 0 && (
        <Box mb={4} textAlign="left">
          <Typography variant="h6" fontWeight={600} gutterBottom>
            틀린 문제
          </Typography>
          {result.results.filter(r => !r.isCorrect).map((r, idx) => (
            <Paper key={idx} sx={{ p: 2, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                내 답: <span style={{ color: '#d32f2f' }}>{r.userAnswer}</span>
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                정답: <span style={{ color: '#2e7d32' }}>{r.correctAnswer}</span>
              </Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Box display="flex" gap={2} justifyContent="center">
        <Button variant="outlined" onClick={onRetry}>
          다시 보기
        </Button>
        <Button variant="contained" onClick={onHome}>
          대시보드로
        </Button>
      </Box>
    </Box>
  )
}

export default function TestPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('setup') // setup, testing, result
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recentResults, setRecentResults] = useState([])

  // 시험 상태
  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchRecentResults()
  }, [])

  // 타이머
  useEffect(() => {
    if (phase !== 'testing' || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, timeRemaining])

  const fetchRecentResults = async () => {
    try {
      const response = await testService.getResults(TEMP_USER_ID, { limit: 5 })
      setRecentResults(response?.testResults || [])
    } catch (err) {
      console.error('Fetch results error:', err)
    }
  }

  const handleStart = async (options) => {
    try {
      setLoading(true)
      setError(null)
      const response = await testService.start(TEMP_USER_ID, options)

      if (response) {
        setTestId(response.testId)
        setQuestions(response.questions || [])
        setTimeRemaining(options.wordCount * 30) // 문제당 30초
        setAnswers({})
        setCurrentIndex(0)
        setPhase('testing')
      }
    } catch (err) {
      console.error('Start test error:', err)
      setError('시험을 시작할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = (offset = 1) => {
    const newIndex = currentIndex + offset
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const answersArray = questions.map(q => ({
        questionId: q.questionId,
        wordId: q.wordId,
        answer: answers[q.questionId] || '',
      }))

      const response = await testService.submit(TEMP_USER_ID, testId, answersArray)

      if (response) {
        setResult(response)
        setPhase('result')
      }
    } catch (err) {
      console.error('Submit error:', err)
      setError('제출에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setPhase('setup')
    setTestId(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
    fetchRecentResults()
  }

  return (
    <Container maxWidth="sm">
      {/* 헤더 */}
      <Box display="flex" alignItems="center" gap={1} py={2}>
        <IconButton onClick={() => navigate('/vocab')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          단어 시험
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {phase === 'setup' && (
        <TestSetup
          onStart={handleStart}
          recentResults={recentResults}
          loading={loading}
        />
      )}

      {phase === 'testing' && (
        <TestInProgress
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          timeRemaining={timeRemaining}
          onAnswer={handleAnswer}
          onNext={() => handleNext(1)}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
        />
      )}

      {phase === 'result' && result && (
        <TestResult
          result={result}
          onRetry={handleRetry}
          onHome={() => navigate('/vocab')}
        />
      )}
    </Container>
  )
}
