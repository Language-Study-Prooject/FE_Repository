import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  LinearProgress,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  MenuBook as VocabIcon,
  PlayArrow as PlayIcon,
  Assessment as StatsIcon,
  Quiz as TestIcon,
  LibraryBooks as WordListIcon,
  VolumeUp as VolumeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material'
import { dailyService, statsService, userWordService, voiceService } from '../services/vocabService'
import {
  LEVEL_LABELS,
  LEVEL_COLORS,
  CATEGORY_LABELS,
  DAILY_GOAL,
} from '../constants/vocabConstants'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

export default function VocabDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dailyData, setDailyData] = useState(null)
  const [statsData, setStatsData] = useState(null)
  const [weeklyStats, setWeeklyStats] = useState([])
  const [weakWords, setWeakWords] = useState([])
  const [playingTTS, setPlayingTTS] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [daily, stats, weekly, weakness] = await Promise.all([
        dailyService.getWords(TEMP_USER_ID).catch(() => null),
        statsService.getOverall(TEMP_USER_ID).catch(() => null),
        statsService.getDaily(TEMP_USER_ID, { limit: 7 }).catch(() => null),
        statsService.getWeakness(TEMP_USER_ID).catch(() => null),
      ])

      setDailyData(daily?.data)
      setStatsData(stats?.data)
      setWeeklyStats(weekly?.data?.dailyStats || [])
      setWeakWords(weakness?.data?.weakestWords?.slice(0, 5) || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTTS = async (word) => {
    try {
      setPlayingTTS(word.wordId)
      const response = await voiceService.synthesize(word.wordId, word.english)
      if (response?.audioUrl) {
        const audio = new Audio(response.audioUrl)
        audio.onended = () => setPlayingTTS(null)
        audio.onerror = () => setPlayingTTS(null)
        await audio.play()
      }
    } catch (err) {
      console.error('TTS error:', err)
      setPlayingTTS(null)
    }
  }

  const handleToggleBookmark = async (word) => {
    try {
      await userWordService.updateTag(TEMP_USER_ID, word.wordId, {
        bookmarked: !word.bookmarked,
      })
      // 리스트 업데이트
      setWeakWords((prev) =>
        prev.map((w) =>
          w.wordId === word.wordId ? { ...w, bookmarked: !w.bookmarked } : w
        )
      )
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  const learnedCount = dailyData?.learnedCount || 0
  const totalWords = dailyData?.totalWords || DAILY_GOAL.TOTAL
  const progress = totalWords > 0 ? (learnedCount / totalWords) * 100 : 0
  const newWordsCount = dailyData?.newWords?.length || 0
  const reviewWordsCount = dailyData?.reviewWords?.length || 0

  return (
    <Container maxWidth="lg">
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <VocabIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            단어 학습
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          매일 55개 단어로 영어 실력을 키워보세요
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 오늘의 학습 진행률 카드 */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent sx={{ p: 4, color: 'white' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            오늘의 학습 진행률
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {learnedCount} / {totalWords} 단어
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {Math.round(progress)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                  borderRadius: 6,
                },
              }}
            />
          </Box>

          <Box display="flex" gap={3} mb={3}>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                새 단어
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {newWordsCount} / {DAILY_GOAL.NEW_WORDS}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                복습 단어
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {reviewWordsCount} / {DAILY_GOAL.REVIEW_WORDS}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={() => navigate('/vocab/daily')}
            sx={{
              backgroundColor: 'white',
              color: '#667eea',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
            }}
          >
            {dailyData?.isCompleted ? '복습하기' : '학습 계속하기'}
          </Button>
        </CardContent>
      </Card>

      {/* 퀵 액션 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardActionArea onClick={() => navigate('/vocab/stats')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <StatsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  전체 통계
                </Typography>
                <Box mt={1}>
                  <Typography variant="h4" color="primary.main" fontWeight={700}>
                    {statsData?.totalWords || 0}개
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    학습한 단어
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  정확도 {statsData?.accuracy?.toFixed(1) || 0}%
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardActionArea onClick={() => navigate('/vocab/test')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <TestIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  시험 보기
                </Typography>
                <Box mt={1}>
                  <Typography variant="h4" color="secondary.main" fontWeight={700}>
                    {statsData?.avgSuccessRate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    평균 성적
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {statsData?.testCount || 0}회 응시
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardActionArea onClick={() => navigate('/vocab/words')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <WordListIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  단어장
                </Typography>
                <Box mt={1}>
                  <Typography variant="h4" color="success.main" fontWeight={700}>
                    {statsData?.wordStatusCounts?.MASTERED || 0}개
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    암기 완료
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  북마크 {statsData?.bookmarkedCount || 0}개
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* 주간 학습 현황 */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            주간 학습 현황
          </Typography>
          <Box display="flex" justifyContent="space-between" mt={2}>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
              const stat = weeklyStats[index]
              const isCompleted = stat?.isCompleted
              const hasProgress = stat?.learnedCount > 0

              return (
                <Box key={day} textAlign="center" flex={1}>
                  <Typography variant="caption" color="text.secondary">
                    {day}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {isCompleted ? (
                      <CheckIcon sx={{ color: 'success.main', fontSize: 28 }} />
                    ) : hasProgress ? (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'warning.light',
                        }}
                      />
                    ) : (
                      <UncheckedIcon sx={{ color: 'grey.300', fontSize: 28 }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {stat?.learnedCount || '-'}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        </CardContent>
      </Card>

      {/* 약점 단어 TOP 5 */}
      {weakWords.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              약점 단어 TOP 5
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              자주 틀리는 단어들을 집중 학습해보세요
            </Typography>

            {weakWords.map((word) => (
              <Box
                key={word.wordId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography fontWeight={600}>{word.english}</Typography>
                    <Chip
                      label={LEVEL_LABELS[word.level]}
                      size="small"
                      color={LEVEL_COLORS[word.level]}
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {word.korean}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={`정확도 ${word.accuracy?.toFixed(1) || 0}%`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                  <Tooltip title="발음 듣기">
                    <IconButton
                      size="small"
                      onClick={() => handlePlayTTS(word)}
                      disabled={playingTTS === word.wordId}
                    >
                      <VolumeIcon
                        fontSize="small"
                        color={playingTTS === word.wordId ? 'primary' : 'action'}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={word.bookmarked ? '북마크 해제' : '북마크'}>
                    <IconButton size="small" onClick={() => handleToggleBookmark(word)}>
                      {word.bookmarked ? (
                        <StarIcon fontSize="small" color="warning" />
                      ) : (
                        <StarBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
