import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    LinearProgress,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    BarChart as StatsIcon,
    LocalFireDepartment as StreakIcon,
    MenuBook as ReadIcon,
    Quiz as QuizIcon,
    LibraryBooks as WordsIcon,
    Bookmark as BookmarkIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { getNewsStats } from '../services/newsService'

const NewsStatsPage = () => {
    const navigate = useNavigate()
    const { isKorean } = useSettings()

    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true)
                const response = await getNewsStats()
                setStats(response.data)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch stats:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        )
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
                <Button onClick={() => navigate('/news')} sx={{ mt: 2 }}>
                    {isKorean ? '뉴스 목록으로' : 'Back to News'}
                </Button>
            </Container>
        )
    }

    const statCards = [
        {
            icon: ReadIcon,
            label: isKorean ? '읽은 기사' : 'Articles Read',
            value: stats?.totalRead || 0,
            subLabel: isKorean ? `오늘 ${stats?.todayRead || 0}개` : `Today: ${stats?.todayRead || 0}`,
            color: '#3B82F6',
            bgColor: '#EFF6FF',
        },
        {
            icon: QuizIcon,
            label: isKorean ? '퀴즈 완료' : 'Quizzes Completed',
            value: stats?.totalQuizzes || 0,
            subLabel: isKorean ? `평균 ${stats?.averageQuizScore || 0}점` : `Avg: ${stats?.averageQuizScore || 0}pts`,
            color: '#10B981',
            bgColor: '#ECFDF5',
        },
        {
            icon: WordsIcon,
            label: isKorean ? '수집 단어' : 'Words Collected',
            value: stats?.totalWordsCollected || 0,
            subLabel: isKorean ? '뉴스에서 수집' : 'From news',
            color: '#8B5CF6',
            bgColor: '#F5F3FF',
        },
        {
            icon: BookmarkIcon,
            label: isKorean ? '북마크' : 'Bookmarks',
            value: stats?.bookmarkCount || 0,
            subLabel: isKorean ? '저장된 기사' : 'Saved articles',
            color: '#F97316',
            bgColor: '#FFF7ED',
        },
    ]

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/news')}
                    sx={{ color: 'text.secondary' }}
                >
                    {isKorean ? '뉴스 목록' : 'News List'}
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.3)',
                        }}
                    >
                        <StatsIcon sx={{ fontSize: 26, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>
                            {isKorean ? '뉴스 학습 통계' : 'News Learning Stats'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isKorean ? '나의 학습 현황을 확인하세요' : 'Check your learning progress'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Streak Card */}
            <Card
                sx={{
                    borderRadius: '20px',
                    mb: 4,
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    border: '2px solid #F59E0B',
                }}
            >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: '#F59E0B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <StreakIcon sx={{ fontSize: 36, color: 'white' }} />
                    </Box>
                    <Typography variant="h2" fontWeight={800} color="#B45309">
                        {stats?.currentStreak || 0}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="#92400E">
                        {isKorean ? '일 연속 학습 중!' : 'Day Streak!'}
                    </Typography>
                    <Typography variant="body2" color="#A16207" sx={{ mt: 1 }}>
                        {isKorean ? `최고 기록: ${stats?.longestStreak || 0}일` : `Best: ${stats?.longestStreak || 0} days`}
                    </Typography>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Grid key={index} size={{ xs: 6 }}>
                            <Card sx={{ borderRadius: '16px', height: '100%' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '12px',
                                            backgroundColor: stat.bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Icon sx={{ color: stat.color, fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} color={stat.color}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {stat.subLabel}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>

            {/* Quiz Performance */}
            <Card sx={{ borderRadius: '20px', mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        {isKorean ? '퀴즈 성과' : 'Quiz Performance'}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '평균 점수' : 'Average Score'}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="#10B981">
                                {stats?.averageQuizScore || 0}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={stats?.averageQuizScore || 0}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#E5E7EB',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 5,
                                    background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                                },
                            }}
                        />
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: '#ECFDF5',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h5" fontWeight={800} color="#10B981">
                                    {stats?.perfectQuizzes || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '만점 횟수' : 'Perfect Scores'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: '#EFF6FF',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h5" fontWeight={800} color="#3B82F6">
                                    {stats?.totalQuizzes || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '총 퀴즈' : 'Total Quizzes'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Last Activity */}
            {stats?.lastReadDate && (
                <Card sx={{ borderRadius: '16px' }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {isKorean ? '마지막 학습' : 'Last Activity'}
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                            {new Date(stats.lastReadDate).toLocaleDateString()}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Container>
    )
}

export default NewsStatsPage
