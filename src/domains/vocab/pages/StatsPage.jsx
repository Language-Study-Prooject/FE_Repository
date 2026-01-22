import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    CheckCircle as CheckIcon,
    LocalFireDepartment as FireIcon,
    MenuBook as BookIcon,
    Quiz as QuizIcon,
    School as SchoolIcon,
    Timeline as TimelineIcon,
    TrendingUp as TrendingUpIcon,
    VolumeUp as VolumeIcon,
    Warning as WarningIcon,
} from '@mui/icons-material'
import {statsService, voiceService} from '../services/vocabService'
import {DIFFICULTY_LABELS, LEVEL_LABELS, VOICE_TYPES} from '../constants/vocabConstants'
import {useTranslation} from '../../../contexts/SettingsContext'
import {useAuth} from '../../../contexts/AuthContext'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {BadgeSection} from '../../badge'

// 학습 캘린더 히트맵 컴포넌트 (GitHub 스타일)
function LearningCalendar({data}) {
    const [hoveredDay, setHoveredDay] = useState(null)
    const [tooltipPos, setTooltipPos] = useState({x: 0, y: 0})

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // 12주(84일) 전부터 오늘까지
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 83)

    // 시작일을 해당 주의 일요일로 조정
    const startDayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - startDayOfWeek)

    const weeks = []
    const monthLabels = []
    let currentDate = new Date(startDate)
    let lastMonth = -1

    // 주별로 데이터 생성
    while (currentDate <= today || weeks.length < 13) {
        const week = []
        for (let d = 0; d < 7; d++) {
            const dateStr = currentDate.toISOString().split('T')[0]
            // 백엔드는 "period" 필드를 사용, 폴백으로 "date"도 지원
            const dayData = data?.find(item => (item.period || item.date) === dateStr)
            const isFuture = currentDate > today

            // 월 라벨 추가 (각 주의 첫 날이 새 달이면)
            if (d === 0 && currentDate.getMonth() !== lastMonth && !isFuture) {
                const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
                monthLabels.push({
                    month: monthNames[currentDate.getMonth()],
                    weekIndex: weeks.length,
                })
                lastMonth = currentDate.getMonth()
            }

            // 백엔드는 newWordsLearned 사용, 폴백으로 learnedCount도 지원
            const count = dayData?.newWordsLearned || dayData?.learnedCount || 0

            week.push({
                date: dateStr,
                count,
                isToday: dateStr === todayStr,
                isFuture,
                dayOfWeek: d,
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }
        weeks.push(week)
        if (weeks.length >= 14) break
    }

    // GitHub 스타일 색상 (초록 계열)
    const getColor = (count, isFuture) => {
        if (isFuture) return 'transparent'
        if (count === 0) return '#ebedf0'
        if (count < 5) return '#9be9a8'
        if (count < 15) return '#40c463'
        if (count < 30) return '#30a14e'
        return '#216e39'
    }

    const getLevel = (count) => {
        if (count === 0) return 0
        if (count < 5) return 1
        if (count < 15) return 2
        if (count < 30) return 3
        return 4
    }

    const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekday = dayLabels[date.getDay()]
        return `${year}년 ${month}월 ${day}일 (${weekday})`
    }

    const handleMouseEnter = (e, day) => {
        if (day.isFuture) return
        const rect = e.target.getBoundingClientRect()
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
        })
        setHoveredDay(day)
    }

    // 총 학습량 계산 (백엔드는 newWordsLearned 사용)
    const totalLearned = data?.reduce((sum, item) => sum + (item.newWordsLearned || item.learnedCount || 0), 0) || 0
    const activeDays = data?.filter(item => (item.newWordsLearned || item.learnedCount || 0) > 0).length || 0

    return (
        <Box sx={{position: 'relative'}}>
            {/* 요약 정보 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="text.secondary">
                    최근 12주간 <Typography component="span" fontWeight={700}
                                        color="text.primary">{totalLearned}개</Typography> 단어 학습
                </Typography>
                <Chip
                    size="small"
                    label={`${activeDays}일 활동`}
                    sx={{
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        fontWeight: 600,
                        fontSize: 11,
                    }}
                />
            </Box>

            {/* 월 라벨 */}
            <Box display="flex" pl="28px" mb={0.5}>
                {monthLabels.map((label, idx) => (
                    <Typography
                        key={idx}
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            left: `calc(28px + ${label.weekIndex * 15}px)`,
                            fontSize: 10,
                            color: 'text.secondary',
                            fontWeight: 500,
                        }}
                    >
                        {label.month}
                    </Typography>
                ))}
            </Box>

            {/* 캘린더 그리드 */}
            <Box display="flex" gap="3px" overflow="auto" pb={1} mt={2.5}>
                {/* 요일 라벨 */}
                <Box display="flex" flexDirection="column" gap="3px" mr="4px">
                    {dayLabels.map((label, idx) => (
                        <Typography
                            key={idx}
                            variant="caption"
                            sx={{
                                width: 20,
                                height: 12,
                                fontSize: 9,
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                pr: 0.5,
                            }}
                        >
                            {idx % 2 === 1 ? label : ''}
                        </Typography>
                    ))}
                </Box>

                {/* 주별 셀 */}
                {weeks.map((week, wIdx) => (
                    <Box key={wIdx} display="flex" flexDirection="column" gap="3px">
                        {week.map((day, dIdx) => (
                            <Box
                                key={dIdx}
                                onMouseEnter={(e) => handleMouseEnter(e, day)}
                                onMouseLeave={() => setHoveredDay(null)}
                                sx={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: getColor(day.count, day.isFuture),
                                    borderRadius: '2px',
                                    border: day.isToday
                                        ? '2px solid #10b981'
                                        : day.isFuture
                                            ? 'none'
                                            : '1px solid rgba(27, 31, 35, 0.06)',
                                    cursor: day.isFuture ? 'default' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxSizing: 'border-box',
                                    '&:hover': day.isFuture ? {} : {
                                        transform: 'scale(1.2)',
                                        borderColor: 'rgba(27, 31, 35, 0.15)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                    },
                                }}
                            />
                        ))}
                    </Box>
                ))}
            </Box>

            {/* 범례 */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Typography variant="caption" color="text.secondary" fontSize={10}>
                    오늘 학습하셨나요?
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="caption" color="text.secondary" fontSize={10}>Less</Typography>
                    {[0, 1, 2, 3, 4].map((level) => (
                        <Box
                            key={level}
                            sx={{
                                width: 10,
                                height: 10,
                                backgroundColor: level === 0 ? '#ebedf0'
                                    : level === 1 ? '#9be9a8'
                                        : level === 2 ? '#40c463'
                                            : level === 3 ? '#30a14e'
                                                : '#216e39',
                                borderRadius: '2px',
                                border: '1px solid rgba(27, 31, 35, 0.06)',
                            }}
                        />
                    ))}
                    <Typography variant="caption" color="text.secondary" fontSize={10}>More</Typography>
                </Box>
            </Box>

            {/* 호버 툴팁 */}
            {hoveredDay && (
                <Box
                    sx={{
                        position: 'fixed',
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        transform: 'translate(-50%, -100%)',
                        backgroundColor: '#24292f',
                        color: 'white',
                        px: 1.5,
                        py: 1,
                        borderRadius: '6px',
                        fontSize: 12,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        boxShadow: '0 8px 24px rgba(140, 149, 159, 0.2)',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -6,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #24292f',
                        },
                    }}
                >
                    <Box fontWeight={600} mb={0.5}>
                        {hoveredDay.count > 0
                            ? `${hoveredDay.count}개 단어 학습`
                            : '학습 기록 없음'}
                    </Box>
                    <Box sx={{opacity: 0.8, fontSize: 11}}>
                        {formatDate(hoveredDay.date)}
                    </Box>
                </Box>
            )}
        </Box>
    )
}

// 복습 필요 단어 목록 컴포넌트
function WeakWordsList({words, onPlayTTS, playingWordId, isDark}) {
    if (!words || words.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <CheckIcon sx={{fontSize: 48, color: '#10b981', mb: 1}}/>
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                    모든 단어를 잘 학습했어요!
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    복습이 필요한 단어가 없습니다
                </Typography>
            </Box>
        )
    }

    return (
        <List disablePadding>
            {words.slice(0, 5).map((item, index) => (
                <ListItem
                    key={item.wordId || index}
                    sx={{
                        py: 1.5,
                        px: 0,
                        borderBottom: index < Math.min(words.length, 5) - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            backgroundColor: item.accuracy < 50 ? '#fef2f2' : '#fffbeb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                        }}
                    >
                        <Typography
                            variant="caption"
                            fontWeight={700}
                            color={item.accuracy < 50 ? '#ef4444' : '#f59e0b'}
                        >
                            {index + 1}
                        </Typography>
                    </Box>
                    <ListItemText
                        primary={
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1" fontWeight={600}>
                                    {item.english}
                                </Typography>
                                {item.incorrectCount > 0 && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            backgroundColor: '#fee2e2',
                                            color: '#dc2626',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: 1,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.incorrectCount}회 오답
                                    </Typography>
                                )}
                            </Box>
                        }
                        secondary={item.korean}
                    />
                    <IconButton
                        size="small"
                        onClick={() => onPlayTTS?.(item)}
                        disabled={playingWordId === item.wordId}
                        sx={{
                            backgroundColor: isDark ? '#3f3f46' : '#f3f4f6',
                            '&:hover': {backgroundColor: isDark ? '#52525b' : '#e5e7eb'},
                        }}
                    >
                        <VolumeIcon fontSize="small" color={playingWordId === item.wordId ? 'primary' : 'action'}/>
                    </IconButton>
                </ListItem>
            ))}
        </List>
    )
}

// 레벨별 진행률 차트
function LevelProgressChart({data, isDark}) {
    if (!data) return null

    const levelConfig = {
        BEGINNER: {icon: '🌱', color: '#10b981', bgColor: '#ecfdf5'},
        INTERMEDIATE: {icon: '🌿', color: '#f97316', bgColor: '#fff7ed'},
        ADVANCED: {icon: '🌳', color: '#ef4444', bgColor: '#fef2f2'},
    }

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {Object.entries(LEVEL_LABELS).map(([level, label]) => {
                const levelData = data[level] || {total: 0, learned: 0}
                const progress = levelData.total > 0 ? (levelData.learned / levelData.total) * 100 : 0
                const config = levelConfig[level]

                return (
                    <Box key={level}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '8px',
                                        backgroundColor: config.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 14,
                                    }}
                                >
                                    {config.icon}
                                </Box>
                                <Typography variant="body2" fontWeight={600}>
                                    {label}
                                </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                {levelData.learned} / {levelData.total}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: isDark ? '#3f3f46' : '#f3f4f6',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: config.color,
                                },
                            }}
                        />
                    </Box>
                )
            })}
        </Box>
    )
}

// 난이도 분포 차트
function DifficultyChart({data}) {
    if (!data) return null

    const total = Object.values(data).reduce((sum, val) => sum + val, 0)

    const config = {
        EASY: {label: '쉬움', color: '#10b981', bgColor: '#ecfdf5', icon: '😊'},
        NORMAL: {label: '보통', color: '#3b82f6', bgColor: '#eff6ff', icon: '🤔'},
        HARD: {label: '어려움', color: '#ef4444', bgColor: '#fef2f2', icon: '😰'},
    }

    return (
        <Box display="flex" gap={2}>
            {Object.entries(DIFFICULTY_LABELS).map(([key]) => {
                const count = data[key] || 0
                const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0
                const cfg = config[key]

                return (
                    <Box
                        key={key}
                        flex={1}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: cfg.bgColor,
                            textAlign: 'center',
                        }}
                    >
                        <Typography fontSize={24} mb={0.5}>{cfg.icon}</Typography>
                        <Typography variant="h5" fontWeight={700} color={cfg.color}>
                            {count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {cfg.label} ({percentage}%)
                        </Typography>
                    </Box>
                )
            })}
        </Box>
    )
}

// 히어로 통계 카드
function HeroStatCard({icon: Icon, label, value, subValue, color, bgGradient}) {
    return (
        <Paper
            sx={{
                p: 2.5,
                background: bgGradient,
                borderRadius: 3,
                height: '100%',
            }}
        >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box>
                    <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.8)', fontWeight: 600}}>
                        {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="white">
                        {value}
                    </Typography>
                    {subValue && (
                        <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.7)'}}>
                            {subValue}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon sx={{color: 'white', fontSize: 24}}/>
                </Box>
            </Box>
        </Paper>
    )
}

// 미니 통계 카드
function MiniStatCard({icon: Icon, label, value, color, bgColor}) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Icon sx={{color, fontSize: 22}}/>
            </Box>
            <Box>
                <Typography variant="h6" fontWeight={700} color={color}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {label}
                </Typography>
            </Box>
        </Box>
    )
}

export default function StatsPage() {
    const navigate = useNavigate()
    const {t, isKorean} = useTranslation()
    const {user} = useAuth()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
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

    const fetchAllStats = async () => {
        try {
            setLoading(true)
            setError(null)

            const [overviewRes, dailyRes, weakRes] = await Promise.all([
                statsService.getOverall(),
                statsService.getDaily(null, {limit: 84}),
                statsService.getWeakness(),
            ])

            // API 응답 데이터 접근 (data 필드 또는 직접 접근)
            const overview = overviewRes?.data || overviewRes
            const daily = dailyRes?.data || dailyRes
            const weak = weakRes?.data || weakRes

            setOverviewStats(overview)
            // 다양한 응답 형식 지원: history, dailyStats, 또는 배열 자체
            const calendarHistory = daily?.history || daily?.dailyStats || (Array.isArray(daily) ? daily : [])
            setCalendarData(calendarHistory)
            setWeakWords(weak?.frequentMistakes || weak?.weakWords || weak?.weakestWords || [])
            setLevelProgress(overview?.levelProgress)
            setDifficultyDist(overview?.difficultyDistribution)
        } catch (err) {
            console.error('Fetch stats error:', err)
            setError('통계를 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
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
                    <CircularProgress sx={{color: '#10b981'}}/>
                </Box>
            </Container>
        )
    }

    // 데이터 추출
    const totalLearned = overviewStats?.totalLearned || overviewStats?.newWordsLearned || 0
    const successRate = overviewStats?.successRate || overviewStats?.averageAccuracy || 0
    const currentStreak = overviewStats?.currentStreak || overviewStats?.streakDays || 0
    const longestStreak = overviewStats?.longestStreak || currentStreak
    const testsCompleted = overviewStats?.testsCompleted || 0
    const correctAnswers = overviewStats?.correctAnswers || 0
    const incorrectAnswers = overviewStats?.incorrectAnswers || 0
    const wordsReviewed = overviewStats?.wordsReviewed || 0

    return (
        <Container maxWidth="sm" sx={{pb: 8}}>
            {/* 헤더 */}
            <Box display="flex" alignItems="center" gap={1} py={2}>
                <IconButton
                    onClick={() => navigate('/vocab')}
                    sx={{
                        backgroundColor: isDark ? '#3f3f46' : '#f3f4f6',
                        '&:hover': {backgroundColor: isDark ? '#52525b' : '#e5e7eb'},
                    }}
                >
                    <BackIcon/>
                </IconButton>
                <Box flex={1}>
                    <Typography variant="h5" fontWeight={800}>
                        학습 통계
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.username || '사용자'}님의 학습 현황
                    </Typography>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 2, borderRadius: 2}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* 히어로 섹션 - 핵심 통계 */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{xs: 6}}>
                    <HeroStatCard
                        icon={BookIcon}
                        label="학습한 단어"
                        value={totalLearned}
                        subValue="총 단어"
                        bgGradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    />
                </Grid>
                <Grid size={{xs: 6}}>
                    <HeroStatCard
                        icon={TrendingUpIcon}
                        label="정답률"
                        value={`${successRate.toFixed(0)}%`}
                        subValue={`${correctAnswers}개 정답`}
                        bgGradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                    />
                </Grid>
                <Grid size={{xs: 6}}>
                    <HeroStatCard
                        icon={FireIcon}
                        label="연속 학습"
                        value={`${currentStreak}일`}
                        subValue={`최장 ${longestStreak}일`}
                        bgGradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                    />
                </Grid>
                <Grid size={{xs: 6}}>
                    <HeroStatCard
                        icon={QuizIcon}
                        label="완료한 테스트"
                        value={testsCompleted}
                        subValue="회 테스트"
                        bgGradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                    />
                </Grid>
            </Grid>

            {/* 추가 통계 미니 카드 */}
            <Paper sx={{p: 2, mb: 3, borderRadius: 3}}>
                <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
                    상세 통계
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{xs: 6}}>
                        <MiniStatCard
                            icon={CheckIcon}
                            label="정답"
                            value={correctAnswers}
                            color="#10b981"
                            bgColor="#ecfdf5"
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <MiniStatCard
                            icon={WarningIcon}
                            label="오답"
                            value={incorrectAnswers}
                            color="#ef4444"
                            bgColor="#fef2f2"
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <MiniStatCard
                            icon={SchoolIcon}
                            label="복습한 단어"
                            value={wordsReviewed}
                            color="#8b5cf6"
                            bgColor="#f5f3ff"
                        />
                    </Grid>
                    <Grid size={{xs: 6}}>
                        <MiniStatCard
                            icon={WarningIcon}
                            label="복습 필요"
                            value={weakWords.length}
                            color="#f59e0b"
                            bgColor="#fffbeb"
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* 학습 캘린더 */}
            <Paper sx={{p: 2.5, mb: 3, borderRadius: 3}}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TimelineIcon sx={{color: '#10b981'}}/>
                    <Typography variant="subtitle1" fontWeight={700}>
                        학습 기록
                    </Typography>
                </Box>
                <LearningCalendar data={calendarData}/>
            </Paper>

            {/* 난이도 분포 */}
            {difficultyDist && (
                <Paper sx={{p: 2.5, mb: 3, borderRadius: 3}}>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                        체감 난이도 분포
                    </Typography>
                    <DifficultyChart data={difficultyDist}/>
                </Paper>
            )}

            {/* 레벨별 진행률 */}
            {levelProgress && (
                <Paper sx={{p: 2.5, mb: 3, borderRadius: 3}}>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>
                        레벨별 학습 진행률
                    </Typography>
                    <LevelProgressChart data={levelProgress} isDark={isDark}/>
                </Paper>
            )}

            {/* 복습이 필요한 단어 */}
            <Paper sx={{p: 2.5, mb: 3, borderRadius: 3}}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <WarningIcon sx={{color: '#f59e0b'}}/>
                        <Typography variant="subtitle1" fontWeight={700}>
                            복습이 필요한 단어
                        </Typography>
                    </Box>
                    {weakWords.length > 0 && (
                        <Chip
                            label="복습하기"
                            size="small"
                            sx={{
                                backgroundColor: '#fef2f2',
                                color: '#ef4444',
                                fontWeight: 600,
                                '&:hover': {backgroundColor: '#fee2e2'},
                            }}
                            onClick={() => navigate('/vocab/daily?mode=weak')}
                        />
                    )}
                </Box>
                <WeakWordsList
                    words={weakWords}
                    onPlayTTS={handlePlayTTS}
                    playingWordId={playingWordId}
                    isDark={isDark}
                />
            </Paper>

            {/* 배지 섹션 */}
            <BadgeSection/>
        </Container>
    )
}
