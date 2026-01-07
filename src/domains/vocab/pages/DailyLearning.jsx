import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  VolumeUp as VolumeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  SkipNext as SkipIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material'
import FlashCard from '../components/FlashCard'
import { dailyService, userWordService, voiceService } from '../services/vocabService'
import { DIFFICULTY, DIFFICULTY_LABELS } from '../constants/vocabConstants'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

export default function DailyLearning() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState(new Set())
  const [autoPlayTTS, setAutoPlayTTS] = useState(false)
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [results, setResults] = useState({ correct: 0, incorrect: 0 })

  useEffect(() => {
    fetchDailyWords()
  }, [])

  const fetchDailyWords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dailyService.getWords(TEMP_USER_ID)
      const allWords = [
        ...(response?.data?.newWords || []),
        ...(response?.data?.reviewWords || []),
      ]
      setWords(allWords)

      // 이미 학습한 단어 체크
      const learnedCount = response?.data?.learnedCount || 0
      if (learnedCount > 0 && learnedCount < allWords.length) {
        const learned = new Set(allWords.slice(0, learnedCount).map(w => w.wordId))
        setLearnedIds(learned)
        setCurrentIndex(learnedCount)
      }

      if (response?.data?.isCompleted) {
        setIsCompleted(true)
      }
    } catch (err) {
      console.error('Fetch daily words error:', err)
      setError('단어를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? (learnedIds.size / words.length) * 100 : 0

  const playTTS = useCallback(async (word) => {
    if (!word || isPlayingTTS) return
    try {
      setIsPlayingTTS(true)
      const response = await voiceService.synthesize(word.wordId, word.english)
      if (response?.data?.audioUrl) {
        const audio = new Audio(response.data.audioUrl)
        audio.onended = () => setIsPlayingTTS(false)
        audio.onerror = () => setIsPlayingTTS(false)
        await audio.play()
      } else {
        setIsPlayingTTS(false)
      }
    } catch (err) {
      console.error('TTS error:', err)
      setIsPlayingTTS(false)
    }
  }, [isPlayingTTS])

  useEffect(() => {
    if (autoPlayTTS && currentWord && !isFlipped) {
      playTTS(currentWord)
    }
  }, [currentIndex, autoPlayTTS])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = async (isCorrect) => {
    if (!currentWord) return

    try {
      // API 호출
      await userWordService.update(TEMP_USER_ID, currentWord.wordId, isCorrect)

      // 결과 업데이트
      setResults(prev => ({
        ...prev,
        [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
      }))

      // 학습 완료 표시
      setLearnedIds(prev => new Set([...prev, currentWord.wordId]))

      // 다음 카드로 이동
      moveToNext()
    } catch (err) {
      console.error('Answer update error:', err)
    }
  }

  const handleSkip = () => {
    moveToNext()
  }

  const moveToNext = () => {
    setIsFlipped(false)
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleToggleBookmark = async () => {
    if (!currentWord) return
    try {
      const newBookmarked = !currentWord.bookmarked
      await userWordService.updateTag(TEMP_USER_ID, currentWord.wordId, {
        bookmarked: newBookmarked,
      })
      // 로컬 상태 업데이트
      setWords(prev =>
        prev.map(w =>
          w.wordId === currentWord.wordId ? { ...w, bookmarked: newBookmarked } : w
        )
      )
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  const handleSetDifficulty = async (difficulty) => {
    if (!currentWord || !difficulty) return
    try {
      await userWordService.updateTag(TEMP_USER_ID, currentWord.wordId, {
        difficulty,
      })
      setWords(prev =>
        prev.map(w =>
          w.wordId === currentWord.wordId ? { ...w, difficulty } : w
        )
      )
    } catch (err) {
      console.error('Difficulty error:', err)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setLearnedIds(new Set())
    setIsFlipped(false)
    setIsCompleted(false)
    setResults({ correct: 0, incorrect: 0 })
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box py={4}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button onClick={() => navigate('/vocab')}>돌아가기</Button>
        </Box>
      </Container>
    )
  }

  // 학습 완료 화면
  if (isCompleted) {
    const totalAnswered = results.correct + results.incorrect
    const accuracy = totalAnswered > 0 ? (results.correct / totalAnswered) * 100 : 0

    return (
      <Container maxWidth="sm">
        <Box py={6} textAlign="center">
          <CelebrationIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            학습 완료!
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            오늘의 학습을 완료했습니다
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>학습 결과</Typography>
            <Box display="flex" justifyContent="center" gap={4} mb={2}>
              <Box textAlign="center">
                <Typography variant="h3" color="success.main" fontWeight={700}>
                  {results.correct}
                </Typography>
                <Typography variant="body2" color="text.secondary">정답</Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h3" color="error.main" fontWeight={700}>
                  {results.incorrect}
                </Typography>
                <Typography variant="body2" color="text.secondary">오답</Typography>
              </Box>
            </Box>
            <Typography variant="h5" fontWeight={600}>
              정확도: {accuracy.toFixed(1)}%
            </Typography>
          </Paper>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleRestart}
            >
              다시 학습하기
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/vocab')}
            >
              대시보드로
            </Button>
          </Box>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm">
      {/* 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        <IconButton onClick={() => navigate('/vocab')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={600}>
          오늘의 학습 ({currentIndex + 1}/{words.length})
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={autoPlayTTS}
              onChange={(e) => setAutoPlayTTS(e.target.checked)}
              size="small"
            />
          }
          label={<VolumeIcon fontSize="small" />}
        />
      </Box>

      {/* 진행률 바 */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary">
            진행률
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* 플래시카드 */}
      <Box sx={{ mb: 4 }}>
        <FlashCard
          word={currentWord}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onPlayTTS={() => playTTS(currentWord)}
          isPlayingTTS={isPlayingTTS}
        />
      </Box>

      {/* 정답/오답 버튼 */}
      <Box display="flex" gap={2} justifyContent="center" mb={3}>
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<CloseIcon />}
          onClick={() => handleAnswer(false)}
          sx={{ flex: 1, maxWidth: 160, py: 1.5 }}
        >
          모르겠어요
        </Button>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<CheckIcon />}
          onClick={() => handleAnswer(true)}
          sx={{ flex: 1, maxWidth: 160, py: 1.5 }}
        >
          알고있어요
        </Button>
      </Box>

      {/* 액션 바 */}
      <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
        <Tooltip title={currentWord?.bookmarked ? '북마크 해제' : '북마크'}>
          <IconButton onClick={handleToggleBookmark}>
            {currentWord?.bookmarked ? (
              <StarIcon color="warning" />
            ) : (
              <StarBorderIcon />
            )}
          </IconButton>
        </Tooltip>

        <ToggleButtonGroup
          value={currentWord?.difficulty || DIFFICULTY.NORMAL}
          exclusive
          onChange={(e, val) => handleSetDifficulty(val)}
          size="small"
        >
          {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
            <ToggleButton key={key} value={key}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Tooltip title="건너뛰기">
          <IconButton onClick={handleSkip}>
            <SkipIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Container>
  )
}
