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
  Card,
  CardActionArea,
  CardContent,
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
  School as SchoolIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material'
import FlashCard from '../components/FlashCard'
import { dailyService, userWordService, voiceService } from '../services/vocabService'
import { LEVELS, LEVEL_LABELS } from '../constants/vocabConstants'
import { useTranslation } from '../../../contexts/SettingsContext'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

// Level Selection Screen
function LevelSelect({ onSelect, loading, t, isKorean }) {
  const levelConfig = {
    [LEVELS.BEGINNER]: {
      description: isKorean ? '기초 어휘 학습' : 'Basic vocabulary',
      color: '#059669',
      bgColor: '#ecfdf5',
      icon: '🌱',
    },
    [LEVELS.INTERMEDIATE]: {
      description: isKorean ? '실용 어휘 확장' : 'Intermediate vocabulary',
      color: '#f97316',
      bgColor: '#fff7ed',
      icon: '🌿',
    },
    [LEVELS.ADVANCED]: {
      description: isKorean ? '전문 어휘 마스터' : 'Advanced vocabulary',
      color: '#ef4444',
      bgColor: '#fef2f2',
      icon: '🌳',
    },
  }

  return (
    <Box py={4}>
      <Box textAlign="center" mb={5}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 12px 24px -6px rgba(5, 150, 105, 0.4)',
          }}
        >
          <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          {t('dailyLearning.selectLevel')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isKorean ? '난이도를 선택하여 학습을 시작하세요' : 'Select a difficulty to start learning'}
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={2}>
        {Object.entries(LEVEL_LABELS).map(([level, label]) => {
          const config = levelConfig[level]
          return (
            <Card
              key={level}
              sx={{
                border: '2px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: config.color,
                  transform: 'translateX(8px)',
                  boxShadow: `0 8px 24px -8px ${config.color}40`,
                },
              }}
            >
              <CardActionArea onClick={() => !loading && onSelect(level)} disabled={loading}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        backgroundColor: config.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                      }}
                    >
                      {config.icon}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: config.color }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config.description}
                      </Typography>
                    </Box>
                    {loading && <CircularProgress size={24} sx={{ color: config.color }} />}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}

export default function DailyLearning() {
  const navigate = useNavigate()
  const { t, isKorean } = useTranslation()
  const [phase, setPhase] = useState('loading')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState(new Set())
  const [autoPlayTTS, setAutoPlayTTS] = useState(false)
  const [isPlayingTTS, setIsPlayingTTS] = useState(false)
  const [results, setResults] = useState({ correct: 0, incorrect: 0 })
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [isEntering, setIsEntering] = useState(false)

  useEffect(() => {
    fetchDailyWords()
  }, [])

  const fetchDailyWords = async (level = null) => {
    try {
      setLoading(true)
      setError(null)

      const response = await dailyService.getWords(TEMP_USER_ID, level)
      const dailyData = response?.data || response

      const allWords = [
        ...(dailyData?.newWords || []),
        ...(dailyData?.reviewWords || []),
      ]

      if (allWords.length === 0) {
        setError('No words to learn.')
        setPhase('select')
        return
      }

      setWords(allWords)

      const learnedCount = dailyData?.learnedCount || 0
      if (learnedCount > 0 && learnedCount < allWords.length) {
        const learned = new Set(allWords.slice(0, learnedCount).map(w => w.wordId))
        setLearnedIds(learned)
        setCurrentIndex(learnedCount)
      }

      if (dailyData?.isCompleted) {
        setPhase('complete')
      } else {
        setPhase('learning')
      }
    } catch (err) {
      console.error('Fetch daily words error:', err)
      const errorMsg = err.response?.data?.message || err.message || ''

      if (errorMsg.includes('level') || err.response?.status === 400) {
        setPhase('select')
      } else {
        setError('Failed to load words.')
        setPhase('select')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLevelSelect = (level) => {
    fetchDailyWords(level)
  }

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? (learnedIds.size / words.length) * 100 : 0

  const playTTS = useCallback(async (word) => {
    if (!word || isPlayingTTS) return
    try {
      setIsPlayingTTS(true)
      const response = await voiceService.synthesize(word.wordId, word.english)
      if (response?.audioUrl) {
        const audio = new Audio(response.audioUrl)
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
    if (autoPlayTTS && currentWord && !isFlipped && phase === 'learning') {
      playTTS(currentWord)
    }
  }, [currentIndex, autoPlayTTS, phase])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = async (isCorrect) => {
    if (!currentWord || swipeDirection) return

    setSwipeDirection(isCorrect ? 'right' : 'left')

    try {
      await userWordService.update(TEMP_USER_ID, currentWord.wordId, isCorrect)

      setResults(prev => ({
        ...prev,
        [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
      }))

      setLearnedIds(prev => new Set([...prev, currentWord.wordId]))
    } catch (err) {
      console.error('Answer update error:', err)
    }

    setTimeout(() => {
      setSwipeDirection(null)
      setIsEntering(true)
      moveToNext()
      setTimeout(() => setIsEntering(false), 200)
    }, 250)
  }

  const moveToNext = () => {
    setIsFlipped(false)
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setPhase('complete')
    }
  }

  const handleToggleBookmark = async () => {
    if (!currentWord) return
    try {
      const newBookmarked = !currentWord.bookmarked
      await userWordService.updateTag(TEMP_USER_ID, currentWord.wordId, {
        bookmarked: newBookmarked,
      })
      setWords(prev =>
        prev.map(w =>
          w.wordId === currentWord.wordId ? { ...w, bookmarked: newBookmarked } : w
        )
      )
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setLearnedIds(new Set())
    setIsFlipped(false)
    setPhase('learning')
    setResults({ correct: 0, incorrect: 0 })
  }

  // Loading Screen
  if (phase === 'loading') {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      </Container>
    )
  }

  // Level Selection Screen
  if (phase === 'select') {
    return (
      <Container maxWidth="sm">
        <Box display="flex" alignItems="center" gap={1} py={2}>
          <IconButton onClick={() => navigate('/vocab')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            {t('dailyLearning.title')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="info" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <LevelSelect onSelect={handleLevelSelect} loading={loading} t={t} isKorean={isKorean} />
      </Container>
    )
  }

  // Completion Screen
  if (phase === 'complete') {
    const totalAnswered = results.correct + results.incorrect
    const accuracy = totalAnswered > 0 ? (results.correct / totalAnswered) * 100 : 0

    return (
      <Container maxWidth="sm">
        <Box py={6} textAlign="center">
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 16px 32px -8px rgba(251, 191, 36, 0.5)',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-8px)' },
              },
            }}
          >
            <CelebrationIcon sx={{ fontSize: 52, color: 'white' }} />
          </Box>

          <Typography variant="h3" fontWeight={800} gutterBottom>
            {t('dailyLearning.greatJob')}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {t('dailyLearning.completedSession')}
          </Typography>

          <Paper sx={{ p: 4, mb: 4, backgroundColor: '#fafaf9' }}>
            <Box display="flex" justifyContent="center" gap={6} mb={3}>
              <Box textAlign="center">
                <Typography variant="h2" sx={{ color: '#10b981', fontWeight: 800 }}>
                  {results.correct}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {t('dailyLearning.correct')}
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" sx={{ color: '#ef4444', fontWeight: 800 }}>
                  {results.incorrect}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {t('dailyLearning.incorrect')}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 3,
                py: 1.5,
                borderRadius: '12px',
                backgroundColor: accuracy >= 80 ? '#ecfdf5' : accuracy >= 50 ? '#fff7ed' : '#fef2f2',
              }}
            >
              <SparkleIcon sx={{ color: accuracy >= 80 ? '#059669' : accuracy >= 50 ? '#f97316' : '#ef4444' }} />
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: accuracy >= 80 ? '#059669' : accuracy >= 50 ? '#f97316' : '#ef4444' }}
              >
                {accuracy.toFixed(0)}% {t('dailyLearning.accuracy')}
              </Typography>
            </Box>
          </Paper>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              size="large"
              onClick={handleRestart}
              sx={{ px: 3 }}
            >
              {t('dailyLearning.practiceAgain')}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/vocab')}
              sx={{ px: 4 }}
            >
              {t('dailyLearning.backToDashboard')}
            </Button>
          </Box>
        </Box>
      </Container>
    )
  }

  // Learning Screen
  return (
    <Container maxWidth="sm" sx={{ pb: 6 }}>
      {/* Header */}
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
        <Box textAlign="center">
          <Typography variant="h6" fontWeight={700}>
            {currentIndex + 1} / {words.length}
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={autoPlayTTS}
              onChange={(e) => setAutoPlayTTS(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#059669',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#059669',
                },
              }}
            />
          }
          label={<VolumeIcon fontSize="small" sx={{ color: autoPlayTTS ? '#059669' : 'text.secondary' }} />}
        />
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {t('dailyLearning.progress')}
          </Typography>
          <Typography variant="caption" fontWeight={700} color="primary.main">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e7e5e4',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
            },
          }}
        />
      </Box>

      {/* FlashCard */}
      <Box
        sx={{
          mb: 4,
          transition: swipeDirection
            ? 'all 0.25s ease-out'
            : isEntering
            ? 'all 0.2s ease-out'
            : 'none',
          transform: swipeDirection === 'left'
            ? 'translateX(-120%) rotate(-15deg)'
            : swipeDirection === 'right'
            ? 'translateX(120%) rotate(15deg)'
            : 'scale(1)',
          opacity: swipeDirection ? 0 : 1,
          animation: isEntering ? 'popIn 0.2s ease-out' : 'none',
          '@keyframes popIn': {
            '0%': { transform: 'scale(0.9)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      >
        <FlashCard
          word={currentWord}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onPlayTTS={() => playTTS(currentWord)}
          isPlayingTTS={isPlayingTTS}
        />
      </Box>

      {/* Answer Buttons */}
      <Box display="flex" gap={2} justifyContent="center" mb={3}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CloseIcon />}
          onClick={() => handleAnswer(false)}
          disabled={!!swipeDirection}
          sx={{
            flex: 1,
            maxWidth: 160,
            py: 1.5,
            backgroundColor: '#ef4444',
            '&:hover': {
              backgroundColor: '#dc2626',
            },
          }}
        >
          {t('dailyLearning.dontKnow')}
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<CheckIcon />}
          onClick={() => handleAnswer(true)}
          disabled={!!swipeDirection}
          sx={{
            flex: 1,
            maxWidth: 160,
            py: 1.5,
            backgroundColor: '#10b981',
            '&:hover': {
              backgroundColor: '#059669',
            },
          }}
        >
          {t('dailyLearning.knowIt')}
        </Button>
      </Box>

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          variant="text"
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          startIcon={<BackIcon />}
          sx={{ color: 'text.secondary' }}
        >
          {t('dailyLearning.previous')}
        </Button>

        <Tooltip title={currentWord?.bookmarked ? t('dailyLearning.removeBookmark') : t('dailyLearning.bookmark')}>
          <IconButton
            onClick={handleToggleBookmark}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: currentWord?.bookmarked ? '#fef3c7' : '#f5f5f4',
              '&:hover': {
                backgroundColor: currentWord?.bookmarked ? '#fde68a' : '#e7e5e4',
              },
            }}
          >
            {currentWord?.bookmarked ? (
              <StarIcon sx={{ color: '#f59e0b' }} />
            ) : (
              <StarBorderIcon sx={{ color: '#78716c' }} />
            )}
          </IconButton>
        </Tooltip>

        <Button
          variant="text"
          onClick={() => {
            if (currentIndex < words.length - 1) {
              setCurrentIndex(prev => prev + 1)
              setIsFlipped(false)
            } else {
              setPhase('complete')
            }
          }}
          endIcon={<SkipIcon />}
          sx={{ color: 'text.secondary' }}
        >
          {currentIndex === words.length - 1 ? t('dailyLearning.finish') : t('dailyLearning.skip')}
        </Button>
      </Box>
    </Container>
  )
}
