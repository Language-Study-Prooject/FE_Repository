import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { statsService, voiceService } from '../services/vocabService'
import {
  LEVEL_LABELS,
  LEVEL_COLORS,
  DIFFICULTY_LABELS,
  VOICE_TYPES,
} from '../constants/vocabConstants'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

// 학습 캘린더 히트맵 컴포넌트
function LearningCalendar({ data }) {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 83) // 12주 전

  const weeks = []
  let currentDate = new Date(startDate)

  // 12주 데이터 생성
  for (let w = 0; w < 12; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayData = data?.find(d => d.date === dateStr)
      week.push({
        date: dateStr,
        count: dayData?.learnedCount || 0,
        isToday: dateStr === today.toISOString().split('T')[0],
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }

  const getColor = (count) => {
    if (count === 0) return '#ebedf0'
    if (count < 20) return '#9be9a8'
    if (count < 40) return '#40c463'
    if (count < 55) return '#30a14e'
    return '#216e39'
  }

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <Box>
      <Box display="flex" gap={0.5}>
        {/* 요일 라벨 */}
        <Box display="flex" flexDirection="column" gap={0.5} mr={0.5}>
          {dayLabels.map((label, idx) => (
            <Typography
              key={idx}
              variant="caption"
              sx={{
                width: 20,
                height: 14,
                fontSize: 10,
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {idx % 2 === 1 ? label : ''}
            </Typography>
          ))}
        </Box>

        {/* 히트맵 그리드 */}
        {weeks.map((week, wIdx) => (
          <Box key={wIdx} display="flex" flexDirection="column" gap={0.5}>
            {week.map((day, dIdx) => (
              <Tooltip
                key={dIdx}
                title={`${day.date}: ${day.count}개 학습`}
                arrow
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    backgroundColor: getColor(day.count),
                    borderRadius: 0.5,
                    border: day.isToday ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        ))}
      </Box>

      {/* 범례 */}
      <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5} mt={1}>
        <Typography variant="caption" color="text.secondary">적음</Typography>
        {[0, 10, 30, 45, 55].map((count, idx) => (
          <Box
            key={idx}
            sx={{
              width: 12,
              height: 12,
              backgroundColor: getColor(count),
              borderRadius: 0.5,
            }}
          />
        ))}
        <Typography variant="caption" color="text.secondary">많음</Typography>
      </Box>
    </Box>
  )
}

// 취약 단어 목록 컴포넌트
function WeakWordsList({ words, onPlayTTS, playingWordId }) {
  if (!words || words.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
        취약 단어가 없습니다
      </Typography>
    )
  }

  return (
    <List disablePadding>
      {words.map((item, index) => (
        <ListItem
          key={item.wordId || index}
          sx={{
            py: 1,
            borderBottom: index < words.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {item.english}
                </Typography>
                <Chip
                  label={`${item.accuracy?.toFixed(0) || 0}%`}
                  size="small"
                  color={item.accuracy < 50 ? 'error' : 'warning'}
                  sx={{ height: 20, fontSize: 11 }}
                />
              </Box>
            }
            secondary={item.korean}
          />
          <IconButton
            size="small"
            onClick={() => onPlayTTS?.(item)}
            disabled={playingWordId === item.wordId}
          >
            <TrendingUpIcon
              fontSize="small"
              color={playingWordId === item.wordId ? 'primary' : 'action'}
            />
          </IconButton>
        </ListItem>
      ))}
    </List>
  )
}

// 레벨별 진행률 차트
function LevelProgressChart({ data }) {
  if (!data) return null

  return (
    <Box>
      {Object.entries(LEVEL_LABELS).map(([level, label]) => {
        const levelData = data[level] || { total: 0, learned: 0 }
        const progress = levelData.total > 0
          ? (levelData.learned / levelData.total) * 100
          : 0

        return (
          <Box key={level} mb={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" fontWeight={600}>
                {label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {levelData.learned}/{levelData.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={LEVEL_COLORS[level] || 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )
      })}
    </Box>
  )
}

// 난이도 분포 차트
function DifficultyChart({ data }) {
  if (!data) return null

  const total = Object.values(data).reduce((sum, val) => sum + val, 0)

  const colors = {
    EASY: '#4caf50',
    NORMAL: '#2196f3',
    HARD: '#ff9800',
  }

  return (
    <Box>
      {/* 막대 그래프 */}
      <Box display="flex" height={120} alignItems="flex-end" gap={2} mb={2}>
        {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => {
          const count = data[key] || 0
          const height = total > 0 ? (count / total) * 100 : 0

          return (
            <Box key={key} flex={1} textAlign="center">
              <Typography variant="caption" fontWeight={600}>
                {count}
              </Typography>
              <Box
                sx={{
                  height: `${Math.max(height, 5)}%`,
                  backgroundColor: colors[key],
                  borderRadius: '4px 4px 0 0',
                  minHeight: 8,
                  transition: 'height 0.3s',
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

// 통계 요약 카드
function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color || 'text.primary'}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: `${color || '#1976d2'}15`,
            }}
          >
            <Icon sx={{ color: color || 'primary.main' }} />
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default function StatsPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState(0) // 0: 일간, 1: 주간, 2: 월간
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 통계 데이터
  const [overviewStats, setOverviewStats] = useState(null)
  const [calendarData, setCalendarData] = useState([])
  const [weakWords, setWeakWords] = useState([])
  const [levelProgress, setLevelProgress] = useState(null)
  const [difficultyDist, setDifficultyDist] = useState(null)

  // TTS
  const [playingWordId, setPlayingWordId] = useState(null)

  useEffect(() => {
    fetchAllStats()
  }, [])

  useEffect(() => {
    fetchPeriodStats()
  }, [tab])

  const fetchAllStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const [overviewRes, dailyRes, weakRes] = await Promise.all([
        statsService.getOverall(TEMP_USER_ID),
        statsService.getDaily(TEMP_USER_ID, { limit: 84 }),
        statsService.getWeakness(TEMP_USER_ID),
      ])

      setOverviewStats(overviewRes?.data)
      setCalendarData(dailyRes?.data?.dailyStats || [])
      setWeakWords(weakRes?.data?.weakWords || [])
      setLevelProgress(overviewRes?.data?.levelProgress)
      setDifficultyDist(overviewRes?.data?.difficultyDistribution)
    } catch (err) {
      console.error('Fetch stats error:', err)
      setError('통계를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriodStats = async () => {
    // 기간별 통계는 getDaily로 처리
    try {
      const limits = [7, 30, 90] // 일간, 주간, 월간
      const response = await statsService.getDaily(TEMP_USER_ID, {
        limit: limits[tab],
      })
      // 기간별 통계 처리
    } catch (err) {
      console.error('Period stats error:', err)
    }
  }

  const handlePlayTTS = async (word) => {
    if (playingWordId) return

    try {
      setPlayingWordId(word.wordId)
      const response = await voiceService.synthesize({
        text: word.english,
        voiceType: VOICE_TYPES.FEMALE,
      })

      if (response?.audioUrl) {
        const audio = new Audio(response.audioUrl)
        audio.onended = () => setPlayingWordId(null)
        audio.onerror = () => setPlayingWordId(null)
        await audio.play()
      } else {
        setPlayingWordId(null)
      }
    } catch (err) {
      console.error('TTS error:', err)
      setPlayingWordId(null)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" gap={1} py={2}>
        <IconButton onClick={() => navigate('/vocab')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          학습 통계
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 기간 탭 */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{ mb: 3 }}
        variant="fullWidth"
      >
        <Tab label="일간" />
        <Tab label="주간" />
        <Tab label="월간" />
      </Tabs>

      {/* 요약 카드 */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <StatCard
            title="총 학습 단어"
            value={overviewStats?.totalLearned || 0}
            subtitle={`전체 ${overviewStats?.totalWords || 0}개 중`}
            icon={TrendingUpIcon}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            title="평균 정답률"
            value={`${overviewStats?.averageAccuracy?.toFixed(0) || 0}%`}
            icon={TrendingUpIcon}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            title="연속 학습"
            value={`${overviewStats?.streakDays || 0}일`}
            icon={CalendarIcon}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            title="취약 단어"
            value={weakWords.length}
            subtitle="복습이 필요해요"
            icon={WarningIcon}
            color="#f44336"
          />
        </Grid>
      </Grid>

      {/* 학습 캘린더 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          학습 기록
        </Typography>
        <LearningCalendar data={calendarData} />
      </Paper>

      {/* 레벨별 진행률 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          레벨별 진행률
        </Typography>
        <LevelProgressChart data={levelProgress} />
      </Paper>

      {/* 난이도 분포 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          난이도 분포
        </Typography>
        <DifficultyChart data={difficultyDist} />
      </Paper>

      {/* 취약 단어 */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            취약 단어 TOP 10
          </Typography>
          <Chip
            label="복습하기"
            size="small"
            color="error"
            variant="outlined"
            onClick={() => navigate('/vocab/daily?mode=weak')}
          />
        </Box>
        <WeakWordsList
          words={weakWords}
          onPlayTTS={handlePlayTTS}
          playingWordId={playingWordId}
        />
      </Paper>
    </Container>
  )
}
