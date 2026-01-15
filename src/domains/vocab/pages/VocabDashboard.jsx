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
    CheckCircle as CheckIcon,
    EmojiEvents as TrophyIcon,
    LocalFireDepartment as FireIcon,
    MenuBook as VocabIcon,
    PlayArrow as PlayIcon,
    Quiz as TestIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    TrendingUp as TrendingIcon,
    VolumeUp as VolumeIcon,
} from '@mui/icons-material'
import {dailyService, statsService, userWordService, voiceService} from '../services/vocabService'
import {DAILY_GOAL, LEVEL_LABELS,} from '../constants/vocabConstants'
import {useTranslation} from '../../../contexts/SettingsContext'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

export default function VocabDashboard() {
    const navigate = useNavigate()
    const {t, isKorean} = useTranslation()
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
                statsService.getDaily(TEMP_USER_ID, {limit: 7}).catch(() => null),
                statsService.getWeakness(TEMP_USER_ID).catch(() => null),
            ])

            setDailyData(daily)
            setStatsData(stats)
            setWeeklyStats(weekly?.dailyStats || [])
            setWeakWords(weakness?.weakestWords?.slice(0, 5) || [])
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

    const learnedCount = dailyData?.learnedCount || 0
    const totalWords = dailyData?.totalWords || DAILY_GOAL.TOTAL
    const progress = totalWords > 0 ? (learnedCount / totalWords) * 100 : 0
    const newWordsCount = dailyData?.newWords?.length || 0
    const reviewWordsCount = dailyData?.reviewWords?.length || 0

    // Calculate streak from weekly stats
    const streak = weeklyStats.filter(s => s?.isCompleted).length

    return (
        <Container maxWidth="lg" sx={{pb: 6}}>
            {/* Header */}
            <Box sx={{mb: 5, pt: 2}}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.3)',
                        }}
                    >
                        <VocabIcon sx={{fontSize: 28, color: 'white'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700} sx={{lineHeight: 1.2}}>
                            {t('vocabDash.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('vocabDash.subtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 3}}>
                    {error}
                </Alert>
            )}

            {/* Hero Progress Card */}
            <Card
                sx={{
                    mb: 4,
                    background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative Elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -60,
                        right: -60,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: '30%',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                    }}
                />

                <CardContent sx={{p: {xs: 3, md: 4}, position: 'relative', zIndex: 1}}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                        <Box>
                            <Typography
                                variant="overline"
                                sx={{color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1}}
                            >
                                {t('vocabDash.todayProgress')}
                            </Typography>
                            <Typography variant="h2" fontWeight={800} sx={{color: 'white', mt: 0.5}}>
                                {Math.round(progress)}%
                            </Typography>
                        </Box>

                        {streak > 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(8px)',
                                    borderRadius: '12px',
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                <FireIcon sx={{color: '#fbbf24', fontSize: 24}}/>
                                <Box>
                                    <Typography variant="h6" sx={{color: 'white', fontWeight: 700, lineHeight: 1}}>
                                        {streak}
                                    </Typography>
                                    <Typography variant="caption" sx={{color: 'rgba(255,255,255,0.8)'}}>
                                        {t('vocabDash.days')}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{my: 3}}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.8)'}}>
                                {learnedCount} / {totalWords} {t('vocabDash.wordsLearned')}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: 'white',
                                    borderRadius: 5,
                                },
                            }}
                        />
                    </Box>

                    <Box display="flex" gap={4} mb={4} flexWrap="wrap">
                        <Box>
                            <Typography variant="caption" sx={{
                                color: 'rgba(255,255,255,0.7)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}>
                                {isKorean ? '새 단어' : 'New Words'}
                            </Typography>
                            <Typography variant="h5" sx={{color: 'white', fontWeight: 700}}>
                                {newWordsCount} <Typography component="span" variant="body2"
                                                            sx={{color: 'rgba(255,255,255,0.6)'}}>/ {DAILY_GOAL.NEW_WORDS}</Typography>
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{
                                color: 'rgba(255,255,255,0.7)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}>
                                {isKorean ? '복습' : 'Review'}
                            </Typography>
                            <Typography variant="h5" sx={{color: 'white', fontWeight: 700}}>
                                {reviewWordsCount} <Typography component="span" variant="body2"
                                                               sx={{color: 'rgba(255,255,255,0.6)'}}>/ {DAILY_GOAL.REVIEW_WORDS}</Typography>
                            </Typography>
                        </Box>
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
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        {dailyData?.isCompleted ? (isKorean ? '다시 복습' : 'Review Again') : t('vocabDash.startDailyLearning')}
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid item xs={12} sm={4}>
                    <Card
                        sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
                            },
                        }}
                        onClick={() => navigate('/vocab/stats')}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '14px',
                                    backgroundColor: '#ecfdf5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                }}
                            >
                                <TrendingIcon sx={{fontSize: 28, color: '#059669'}}/>
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('vocabDash.viewStats')}
                            </Typography>
                            <Typography variant="h3" fontWeight={800} color="primary.main" sx={{mb: 0.5}}>
                                {statsData?.totalWords || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('vocabDash.wordsLearned')}
                            </Typography>
                            <Chip
                                label={`${statsData?.accuracy?.toFixed(0) || 0}% ${t('vocabDash.accuracy')}`}
                                size="small"
                                sx={{
                                    mt: 2,
                                    backgroundColor: '#ecfdf5',
                                    color: '#059669',
                                    fontWeight: 600,
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card
                        sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
                            },
                        }}
                        onClick={() => navigate('/vocab/test')}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '14px',
                                    backgroundColor: '#fff7ed',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                }}
                            >
                                <TestIcon sx={{fontSize: 28, color: '#f97316'}}/>
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('vocabDash.takeQuiz')}
                            </Typography>
                            <Typography variant="h3" fontWeight={800} color="secondary.main" sx={{mb: 0.5}}>
                                {statsData?.avgSuccessRate?.toFixed(0) || 0}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '평균 점수' : 'average score'}
                            </Typography>
                            <Chip
                                label={`${statsData?.testCount || 0} ${isKorean ? '회 응시' : 'tests taken'}`}
                                size="small"
                                sx={{
                                    mt: 2,
                                    backgroundColor: '#fff7ed',
                                    color: '#f97316',
                                    fontWeight: 600,
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card
                        sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
                            },
                        }}
                        onClick={() => navigate('/vocab/words')}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '14px',
                                    backgroundColor: '#f0fdf4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                }}
                            >
                                <TrophyIcon sx={{fontSize: 28, color: '#16a34a'}}/>
                            </Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('vocabDash.viewWordList')}
                            </Typography>
                            <Typography variant="h3" fontWeight={800} sx={{color: '#16a34a', mb: 0.5}}>
                                {statsData?.wordStatusCounts?.MASTERED || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '마스터' : 'mastered'}
                            </Typography>
                            <Chip
                                label={`${statsData?.bookmarkedCount || 0} ${isKorean ? '북마크' : 'bookmarked'}`}
                                size="small"
                                sx={{
                                    mt: 2,
                                    backgroundColor: '#f0fdf4',
                                    color: '#16a34a',
                                    fontWeight: 600,
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Weekly Progress */}
            <Card sx={{mb: 4}}>
                <CardContent sx={{p: 3}}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        {t('vocabDash.weeklyProgress')}
                    </Typography>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={3}
                        sx={{
                            gap: 1,
                        }}
                    >
                        {(isKorean ? ['월', '화', '수', '목', '금', '토', '일'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).map((day, index) => {
                            const stat = weeklyStats[index]
                            const isCompleted = stat?.isCompleted
                            const hasProgress = stat?.learnedCount > 0
                            const isToday = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6)

                            return (
                                <Box
                                    key={day}
                                    textAlign="center"
                                    sx={{
                                        flex: 1,
                                        p: 1.5,
                                        borderRadius: '12px',
                                        backgroundColor: isToday ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                                        border: isToday ? '2px solid' : '2px solid transparent',
                                        borderColor: isToday ? 'primary.main' : 'transparent',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: isToday ? 'primary.main' : 'text.secondary',
                                            fontWeight: isToday ? 700 : 500,
                                        }}
                                    >
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
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '10px',
                                                    backgroundColor: '#059669',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CheckIcon sx={{color: 'white', fontSize: 20}}/>
                                            </Box>
                                        ) : hasProgress ? (
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fbbf24',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{color: 'white', fontWeight: 700}}>
                                                    {stat?.learnedCount}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '10px',
                                                    backgroundColor: '#f5f5f4',
                                                    border: '2px dashed #d6d3d1',
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                </CardContent>
            </Card>

            {/* Weak Words */}
            {weakWords.length > 0 && (
                <Card>
                    <CardContent sx={{p: 3}}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h6" fontWeight={700}>
                                {t('vocabDash.focusWords')}
                            </Typography>
                            <Chip label={isKorean ? '연습 필요' : 'Needs practice'} size="small" color="warning"/>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            {isKorean ? '추가 연습이 필요한 단어입니다' : 'These words need extra attention'}
                        </Typography>

                        {weakWords.map((word, index) => (
                            <Box
                                key={word.wordId}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    py: 2,
                                    px: 2,
                                    mx: -2,
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.02)',
                                    },
                                    borderBottom: index < weakWords.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider',
                                }}
                            >
                                <Box flex={1}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {word.english}
                                        </Typography>
                                        <Chip
                                            label={LEVEL_LABELS[word.level]}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                backgroundColor: word.level === 'BEGINNER' ? '#ecfdf5' : word.level === 'INTERMEDIATE' ? '#fff7ed' : '#fef2f2',
                                                color: word.level === 'BEGINNER' ? '#059669' : word.level === 'INTERMEDIATE' ? '#f97316' : '#ef4444',
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
                                        {word.korean}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <Chip
                                        label={`${word.accuracy?.toFixed(0) || 0}%`}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#fef2f2',
                                            color: '#ef4444',
                                            fontWeight: 700,
                                        }}
                                    />
                                    <Tooltip title="Listen">
                                        <IconButton
                                            size="small"
                                            onClick={() => handlePlayTTS(word)}
                                            disabled={playingTTS === word.wordId}
                                            sx={{
                                                backgroundColor: playingTTS === word.wordId ? 'primary.main' : 'transparent',
                                                '&:hover': {backgroundColor: 'rgba(5, 150, 105, 0.1)'},
                                            }}
                                        >
                                            <VolumeIcon
                                                fontSize="small"
                                                sx={{color: playingTTS === word.wordId ? 'white' : 'text.secondary'}}
                                            />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={word.bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                                        <IconButton size="small" onClick={() => handleToggleBookmark(word)}>
                                            {word.bookmarked ? (
                                                <StarIcon fontSize="small" sx={{color: '#fbbf24'}}/>
                                            ) : (
                                                <StarBorderIcon fontSize="small" sx={{color: 'text.secondary'}}/>
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
