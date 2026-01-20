import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Grid,
    IconButton,
    LinearProgress,
    Tooltip,
    Typography,
} from '@mui/material'
import {
    ArrowForward as ArrowIcon,
    CheckCircle as CheckIcon,
    LocalFireDepartment as FireIcon,
    MenuBook as VocabIcon,
    PlayArrow as PlayIcon,
    Quiz as TestIcon,
    School as LearnIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Timeline as StatsIcon,
    TrendingUp as TrendingIcon,
    VolumeUp as VolumeIcon,
    Warning as WarningIcon,
} from '@mui/icons-material'
import {dailyService, statsService, userWordService, voiceService} from '../services/vocabService'
import {DAILY_GOAL} from '../constants/vocabConstants'
import {useTranslation} from '../../../contexts/SettingsContext'
import {useAuth} from '../../../contexts/AuthContext'

export default function VocabDashboard() {
    const navigate = useNavigate()
    const {t, isKorean} = useTranslation()
    const {user} = useAuth()
    const userId = user?.userId || user?.username
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
                dailyService.getWords().catch(() => null),
                statsService.getOverall().catch(() => null),
                statsService.getDaily(null, {limit: 7}).catch(() => null),
                statsService.getWeakness().catch(() => null),
            ])

            setDailyData(daily)
            setStatsData(stats)
            // API: { data: { history: [...] } } 또는 mock: { history: [...] }
            const weeklyData = weekly?.data || weekly
            setWeeklyStats(weeklyData?.history || weeklyData?.dailyStats || [])
            // API: { data: { frequentMistakes: [...] } } 또는 mock: { frequentMistakes: [...] }
            const weaknessData = weakness?.data || weakness
            setWeakWords(weaknessData?.frequentMistakes?.slice(0, 5) || weaknessData?.weakestWords?.slice(0, 5) || [])
        } catch (err) {
            console.error('Dashboard fetch error:', err)
            setError('Failed to load data.')
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
            } else {
                setPlayingTTS(null)
            }
        } catch (err) {
            console.error('TTS error:', err)
            setPlayingTTS(null)
        }
    }

    const handleToggleBookmark = async (word) => {
        try {
            await userWordService.updateTag(userId, word.wordId, {
                bookmarked: !word.bookmarked,
            })
            setWeakWords((prev) =>
                prev.map((w) =>
                    w.wordId === word.wordId ? {...w, bookmarked: !w.bookmarked} : w
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
                    <CircularProgress sx={{color: 'primary.main'}}/>
                </Box>
            </Container>
        )
    }

    // API 응답 구조: { status, message, data: { dailyStudy, progress, newWords, reviewWords } }
    // 또는 mock: { dailyStudy, progress, newWords, reviewWords }
    const daily = dailyData?.data || dailyData
    const learnedCount = daily?.progress?.learned || daily?.dailyStudy?.learnedCount || 0
    const totalWords = daily?.progress?.total || daily?.dailyStudy?.totalWords || DAILY_GOAL.TOTAL
    const progress = daily?.progress?.percentage ?? (totalWords > 0 ? (learnedCount / totalWords) * 100 : 0)
    const isCompleted = daily?.progress?.isCompleted || daily?.dailyStudy?.isCompleted || false

    // 통계 데이터 (API: { status, data: {...} } 또는 mock: {...})
    const stats = statsData?.data || statsData
    const currentStreak = stats?.currentStreak || stats?.streakDays || 0
    const longestStreak = stats?.longestStreak || 0
    const wordsLearned = stats?.newWordsLearned || stats?.totalLearned || 0
    const successRate = stats?.successRate || stats?.averageAccuracy || 0
    const testsCompleted = stats?.testsCompleted || stats?.testCount || 0

    // 주간 통계에서 완료일 수 계산
    const weeklyCompleted = weeklyStats.filter(s => s?.isCompleted).length

    return (
        <Container maxWidth="lg" sx={{pb: 6}}>
            {/* Header */}
            <Box sx={{mb: 4, pt: 2}}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <VocabIcon sx={{fontSize: 24, color: 'white'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            {t('vocabDash.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('vocabDash.subtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                    {error}
                </Alert>
            )}

            {/* 상단 2열 레이아웃: 오늘의 학습 + 연속 학습 */}
            <Grid container spacing={3} sx={{mb: 3}}>
                {/* 오늘의 학습 카드 */}
                <Grid size={{xs: 12, md: 8}}>
                    <Card
                        sx={{
                            height: '100%',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -40,
                                right: -40,
                                width: 160,
                                height: 160,
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                            }}
                        />
                        <CardContent sx={{p: 3, position: 'relative', zIndex: 1}}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Box>
                                    <Typography variant="overline"
                                                sx={{color: 'rgba(255,255,255,0.8)', letterSpacing: 1}}>
                                        {isKorean ? '오늘의 학습' : "Today's Learning"}
                                    </Typography>
                                    <Box display="flex" alignItems="baseline" gap={1}>
                                        <Typography variant="h2" fontWeight={800} sx={{color: 'white'}}>
                                            {Math.round(progress)}
                                        </Typography>
                                        <Typography variant="h4" sx={{color: 'rgba(255,255,255,0.8)'}}>%</Typography>
                                    </Box>
                                </Box>
                                {isCompleted && (
                                    <Chip
                                        icon={<CheckIcon sx={{fontSize: 16, color: '#059669 !important'}}/>}
                                        label={isKorean ? '완료' : 'Done'}
                                        sx={{
                                            backgroundColor: 'white',
                                            color: '#059669',
                                            fontWeight: 700,
                                        }}
                                    />
                                )}
                            </Box>

                            <Box sx={{mb: 3}}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.9)'}}>
                                        {learnedCount} / {totalWords} {isKorean ? '단어' : 'words'}
                                    </Typography>
                                    <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.7)'}}>
                                        {totalWords - learnedCount} {isKorean ? '남음' : 'left'}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: 'white',
                                            borderRadius: 4,
                                        },
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<PlayIcon/>}
                                onClick={() => navigate('/vocab/daily')}
                                sx={{
                                    backgroundColor: 'white',
                                    color: '#059669',
                                    fontWeight: 700,
                                    px: 3,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                    },
                                }}
                            >
                                {isCompleted ? (isKorean ? '복습하기' : 'Review') : (isKorean ? '학습 시작' : 'Start Learning')}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 연속 학습 카드 */}
                <Grid size={{xs: 12, md: 4}}>
                    <Card sx={{height: '100%', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}}>
                        <CardContent sx={{p: 3, textAlign: 'center'}}>
                            <FireIcon sx={{fontSize: 48, color: 'white', mb: 1}}/>
                            <Typography variant="h2" fontWeight={800} sx={{color: 'white'}}>
                                {currentStreak}
                            </Typography>
                            <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.9)', mb: 2}}>
                                {isKorean ? '일 연속 학습' : 'Day Streak'}
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 2,
                                    p: 1.5,
                                }}
                            >
                                <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.8)'}}>
                                    {isKorean ? '최장 기록' : 'Best'}: <strong>{longestStreak}</strong> {isKorean ? '일' : 'days'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 통계 요약 카드 4개 */}
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid size={{xs: 6, sm: 3}}>
                    <Card
                        sx={{cursor: 'pointer', '&:hover': {boxShadow: 4}}}
                        onClick={() => navigate('/vocab/stats')}
                    >
                        <CardContent sx={{p: 2, textAlign: 'center'}}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    backgroundColor: '#ecfdf5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}
                            >
                                <LearnIcon sx={{fontSize: 22, color: '#059669'}}/>
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="#059669">
                                {wordsLearned}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isKorean ? '학습한 단어' : 'Words Learned'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 6, sm: 3}}>
                    <Card
                        sx={{cursor: 'pointer', '&:hover': {boxShadow: 4}}}
                        onClick={() => navigate('/vocab/stats')}
                    >
                        <CardContent sx={{p: 2, textAlign: 'center'}}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    backgroundColor: '#dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}
                            >
                                <TrendingIcon sx={{fontSize: 22, color: '#16a34a'}}/>
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="#16a34a">
                                {successRate.toFixed?.(0) || 0}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isKorean ? '정답률' : 'Accuracy'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 6, sm: 3}}>
                    <Card
                        sx={{cursor: 'pointer', '&:hover': {boxShadow: 4}}}
                        onClick={() => navigate('/vocab/test')}
                    >
                        <CardContent sx={{p: 2, textAlign: 'center'}}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    backgroundColor: '#fef3c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}
                            >
                                <TestIcon sx={{fontSize: 22, color: '#d97706'}}/>
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="#d97706">
                                {testsCompleted}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isKorean ? '테스트 완료' : 'Tests Done'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 6, sm: 3}}>
                    <Card
                        sx={{cursor: 'pointer', '&:hover': {boxShadow: 4}}}
                        onClick={() => navigate('/vocab/words')}
                    >
                        <CardContent sx={{p: 2, textAlign: 'center'}}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '10px',
                                    backgroundColor: '#f3e8ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1,
                                }}
                            >
                                <StatsIcon sx={{fontSize: 22, color: '#9333ea'}}/>
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="#9333ea">
                                {weeklyCompleted}/7
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isKorean ? '이번주 완료' : 'This Week'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 빠른 액션 */}
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid size={{xs: 12, sm: 4}}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {transform: 'translateY(-2px)', boxShadow: 4},
                        }}
                        onClick={() => navigate('/vocab/test')}
                    >
                        <CardContent sx={{p: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    backgroundColor: '#fff7ed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TestIcon sx={{fontSize: 24, color: '#f97316'}}/>
                            </Box>
                            <Box flex={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {isKorean ? '퀴즈 풀기' : 'Take Quiz'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '실력을 테스트해보세요' : 'Test your knowledge'}
                                </Typography>
                            </Box>
                            <ArrowIcon sx={{color: 'text.disabled'}}/>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 4}}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {transform: 'translateY(-2px)', boxShadow: 4},
                        }}
                        onClick={() => navigate('/vocab/words')}
                    >
                        <CardContent sx={{p: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    backgroundColor: '#ecfdf5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <VocabIcon sx={{fontSize: 24, color: '#059669'}}/>
                            </Box>
                            <Box flex={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {isKorean ? '단어장' : 'Word List'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '학습한 단어 보기' : 'View your words'}
                                </Typography>
                            </Box>
                            <ArrowIcon sx={{color: 'text.disabled'}}/>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{xs: 12, sm: 4}}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {transform: 'translateY(-2px)', boxShadow: 4},
                        }}
                        onClick={() => navigate('/vocab/stats')}
                    >
                        <CardContent sx={{p: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '12px',
                                    backgroundColor: '#ede9fe',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <StatsIcon sx={{fontSize: 24, color: '#7c3aed'}}/>
                            </Box>
                            <Box flex={1}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {isKorean ? '학습 통계' : 'Statistics'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '상세 통계 보기' : 'View detailed stats'}
                                </Typography>
                            </Box>
                            <ArrowIcon sx={{color: 'text.disabled'}}/>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 주간 학습 현황 */}
            <Card sx={{mb: 3}}>
                <CardContent sx={{p: 3}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={700}>
                            {isKorean ? '이번주 학습 현황' : 'This Week'}
                        </Typography>
                        <Chip
                            label={`${weeklyCompleted}/7 ${isKorean ? '완료' : 'done'}`}
                            size="small"
                            color={weeklyCompleted >= 7 ? 'success' : 'default'}
                        />
                    </Box>

                    <Box display="flex" justifyContent="space-between" gap={1}>
                        {(() => {
                            const days = isKorean ? ['월', '화', '수', '목', '금', '토', '일'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
                            const today = new Date()
                            const dayOfWeek = today.getDay()
                            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

                            return days.map((day, index) => {
                                const date = new Date(today)
                                date.setDate(today.getDate() + mondayOffset + index)
                                const dateStr = date.toISOString().split('T')[0]

                                // 해당 날짜의 통계 찾기
                                const stat = weeklyStats.find(s => s?.period === dateStr || s?.date === dateStr)
                                const isCompleted = stat?.isCompleted
                                const hasProgress = (stat?.newWordsLearned || stat?.learnedCount || 0) > 0
                                const isToday = date.toDateString() === today.toDateString()
                                const isFuture = date > today

                                return (
                                    <Box
                                        key={index}
                                        sx={{
                                            flex: 1,
                                            textAlign: 'center',
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: isToday ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                                            border: isToday ? '2px solid' : '2px solid transparent',
                                            borderColor: isToday ? 'primary.main' : 'transparent',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: isToday ? 'primary.main' : 'text.secondary',
                                                fontWeight: isToday ? 700 : 500,
                                                display: 'block',
                                                mb: 0.5,
                                            }}
                                        >
                                            {day}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{color: 'text.disabled', fontSize: 10, display: 'block', mb: 1}}
                                        >
                                            {date.getDate()}
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '10px',
                                                mx: 'auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: isCompleted
                                                    ? '#059669'
                                                    : hasProgress
                                                        ? '#fbbf24'
                                                        : isFuture
                                                            ? '#f5f5f5'
                                                            : '#fee2e2',
                                                border: isFuture ? '2px dashed #e5e5e5' : 'none',
                                            }}
                                        >
                                            {isCompleted ? (
                                                <CheckIcon sx={{color: 'white', fontSize: 20}}/>
                                            ) : hasProgress ? (
                                                <Typography variant="caption" sx={{color: 'white', fontWeight: 700}}>
                                                    {stat?.newWordsLearned || stat?.learnedCount || 0}
                                                </Typography>
                                            ) : isFuture ? null : (
                                                <Typography variant="caption" sx={{color: '#ef4444', fontWeight: 600}}>
                                                    X
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                )
                            })
                        })()}
                    </Box>
                </CardContent>
            </Card>

            {/* 취약 단어 */}
            {weakWords.length > 0 && (
                <Card>
                    <CardContent sx={{p: 3}}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                            <WarningIcon sx={{color: '#f59e0b', fontSize: 20}}/>
                            <Typography variant="h6" fontWeight={700}>
                                {isKorean ? '복습이 필요한 단어' : 'Words to Review'}
                            </Typography>
                            <Chip
                                label={`${weakWords.length}${isKorean ? '개' : ''}`}
                                size="small"
                                sx={{backgroundColor: '#fef3c7', color: '#d97706'}}
                            />
                        </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            {weakWords.map((word) => (
                                <Box
                                    key={word.wordId}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: '#fafafa',
                                        '&:hover': {backgroundColor: '#f5f5f5'},
                                    }}
                                >
                                    <Box flex={1}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {word.english}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {word.korean}
                                        </Typography>
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Chip
                                            label={`${word.incorrectCount || 0}${isKorean ? '회 오답' : ' wrong'}`}
                                            size="small"
                                            sx={{backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 600}}
                                        />
                                        <Tooltip title={isKorean ? '발음 듣기' : 'Listen'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handlePlayTTS(word)}
                                                disabled={playingTTS === word.wordId}
                                            >
                                                <VolumeIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip
                                            title={word.bookmarked ? (isKorean ? '북마크 해제' : 'Unbookmark') : (isKorean ? '북마크' : 'Bookmark')}>
                                            <IconButton size="small" onClick={() => handleToggleBookmark(word)}>
                                                {word.bookmarked ? (
                                                    <StarIcon fontSize="small" sx={{color: '#fbbf24'}}/>
                                                ) : (
                                                    <StarBorderIcon fontSize="small"/>
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
}
