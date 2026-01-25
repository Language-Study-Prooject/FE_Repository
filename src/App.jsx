import { useState, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useDispatch } from 'react-redux'
import { Box, Button, Card, CardContent, CircularProgress, Collapse, Container, Grid, Typography } from '@mui/material'
import {
    ChevronRight as ChevronRightIcon,
    Create as WritingCategoryIcon,
    Edit as WritingIcon,
    Headphones as OpicIcon,
    LibraryBooks as WordListIcon,
    MenuBook as VocabIcon,
    Mic as SpeakingIcon,
    Newspaper as NewsIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    School as LearnIcon,
    SmartToy as AiIcon,
    SportsEsports as GameIcon,
    WavingHand as WaveIcon,
} from '@mui/icons-material'
import MainLayout from './layouts/MainLayout'
import FreetalkPeoplePage from './domains/freetalk/pages/FreetalkPeoplePage'
import { SpeakingPage } from './domains/speaking'
import ChatRoomPage from './domains/freetalk/pages/ChatRoomPage'
import ChatRoomModal from './domains/freetalk/components/ChatRoomModal'
import VocabDashboard from './domains/vocab/pages/VocabDashboard'
import DailyLearning from './domains/vocab/pages/DailyLearning'
import TestPage from './domains/vocab/pages/TestPage'
import WordListPage from './domains/vocab/pages/WordListPage'
import StatsPage from './domains/vocab/pages/StatsPage'
import { WritingPage } from './domains/grammar'
import { BadgeSection } from './domains/badge'
import CatchmindLobbyPage from './domains/games/pages/CatchmindLobbyPage'
import CatchmindWaitingPage from './domains/games/pages/CatchmindWaitingPage'
import CatchmindPlayPage from './domains/games/pages/CatchmindPlayPage'
import WordchainLobbyPage from './domains/games/pages/WordchainLobbyPage'
import WordchainWaitingPage from './domains/games/pages/WordchainWaitingPage'
import WordchainPlayPage from './domains/games/pages/WordchainPlayPage'
import { NewsListPage, NewsDetailPage, NewsQuizPage, NewsWordsPage, NewsStatsPage } from './domains/news'
import { dailyService, statsService } from './domains/vocab/services/vocabService'
import { getNewsStats, getDashboardStats } from './domains/news/services/newsService'
import { useChat } from './contexts/ChatContext'
import { useSettings } from './contexts/SettingsContext'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/Login'
import SignUpPage from './pages/SignUp'
import { fetchMyProfile } from "./domains/profile/store/profileSlice";
import ProfilePage from './domains/profile/pages/ProfilePage'


function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return children
}

// 이미 로그인된 경우 대시보드로
function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return (
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress />
            </Box>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

// Dashboard Page
function Dashboard() {
    const navigate = useNavigate()
    const [expandedCard, setExpandedCard] = useState(null)
    const { t, isKorean } = useSettings()
    const [activityData, setActivityData] = useState(null)
    const [loadingActivity, setLoadingActivity] = useState(true)

    // 최근 활동 데이터 로드 - 통합 대시보드 API 사용
    useEffect(() => {
        const fetchActivityData = async () => {
            try {
                setLoadingActivity(true)

                // 통합 대시보드 API 호출
                const dashboardRes = await getDashboardStats().catch(() => null)
                const dashboard = dashboardRes?.data || dashboardRes

                console.log('📊 Dashboard Stats:', dashboard)

                if (dashboard) {
                    // 통합 API 응답 구조:
                    // { today, overall, weeklyProgress, levelDistribution }
                    setActivityData({
                        todayWords: dashboard.today?.wordsLearned || 0,
                        totalWords: dashboard.overall?.totalWordsLearned || 0,
                        dailyTotal: dashboard.today?.wordsTotal || 25,
                        vocabStreak: dashboard.overall?.currentStreak || 0,
                        newsRead: dashboard.today?.newsRead || 0,
                        totalNewsRead: dashboard.overall?.totalNewsRead || 0,
                        quizzesTaken: dashboard.today?.quizzesTaken || 0,
                        totalQuizzes: dashboard.overall?.totalQuizzes || 0,
                        averageAccuracy: dashboard.overall?.averageAccuracy || 0,
                        longestStreak: dashboard.overall?.longestStreak || 0,
                        weeklyProgress: dashboard.weeklyProgress || [],
                        levelDistribution: dashboard.levelDistribution || {},
                    })
                } else {
                    // 통합 API 실패 시 개별 API 폴백
                    const [dailyRes, statsRes, newsRes] = await Promise.allSettled([
                        dailyService.getWords().catch(() => null),
                        statsService.getOverall().catch(() => null),
                        getNewsStats().catch(() => null),
                    ])

                    const dailyData = dailyRes.status === 'fulfilled' ? dailyRes.value : null
                    const statsData = statsRes.status === 'fulfilled' ? statsRes.value : null
                    const newsData = newsRes.status === 'fulfilled' ? newsRes.value?.data : null

                    const daily = dailyData?.data || dailyData
                    const todayLearned = daily?.progress?.learned || daily?.dailyStudy?.learnedCount || 0
                    const totalWords = daily?.progress?.total || daily?.dailyStudy?.totalWords || 0

                    const stats = statsData?.data || statsData
                    const vocabStreak = stats?.currentStreak || stats?.streakDays || 0
                    const totalLearned = stats?.newWordsLearned || stats?.totalLearned || 0

                    setActivityData({
                        todayWords: todayLearned,
                        totalWords: totalLearned,
                        dailyTotal: totalWords,
                        vocabStreak: vocabStreak,
                        newsRead: newsData?.todayRead || 0,
                        totalNewsRead: newsData?.totalRead || 0,
                        newsStreak: newsData?.currentStreak || 0,
                        quizScore: newsData?.averageQuizScore || 0,
                    })
                }
            } catch (err) {
                console.error('Failed to fetch activity data:', err)
            } finally {
                setLoadingActivity(false)
            }
        }

        fetchActivityData()
    }, [])

    const learningModes = [
        {
            id: 'speaking',
            title: t('dashboard.speakingTitle'),
            description: t('dashboard.speakingDesc'),
            icon: SpeakingIcon,
            color: '#059669',
            bgColor: '#ecfdf5',
            children: [
                {
                    id: 'opic',
                    title: t('dashboard.opicTitle'),
                    icon: OpicIcon,
                    path: '/opic',
                    description: t('dashboard.opicDesc')
                },
                {
                    id: 'ai-talk',
                    title: t('dashboard.aiTalkTitle'),
                    icon: AiIcon,
                    path: '/freetalk/ai',
                    description: t('dashboard.aiTalkDesc')
                },
            ],
        },
        {
            id: 'writing',
            title: t('dashboard.writingTitle'),
            description: t('dashboard.writingDesc'),
            icon: WritingCategoryIcon,
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            children: [
                {
                    id: 'chat-people',
                    title: t('dashboard.chatTitle'),
                    icon: PeopleIcon,
                    path: '/freetalk/people',
                    description: t('dashboard.chatDesc')
                },
                {
                    id: 'writing-practice',
                    title: t('dashboard.compositionTitle'),
                    icon: WritingIcon,
                    path: '/writing',
                    description: t('dashboard.compositionDesc')
                },
                {
                    id: 'news-learning',
                    title: t('dashboard.newsTitle') || '뉴스 학습',
                    icon: NewsIcon,
                    path: '/news',
                    description: t('dashboard.newsDesc') || '실제 뉴스로 영어 학습'
                },
            ],
        },
        {
            id: 'vocab',
            title: t('dashboard.vocabTitle'),
            description: t('dashboard.vocabDesc'),
            icon: VocabIcon,
            color: '#f97316',
            bgColor: '#fff7ed',
            children: [
                {
                    id: 'vocab-daily',
                    title: t('dashboard.dailyWordsTitle'),
                    icon: LearnIcon,
                    path: '/vocab',
                    description: t('dashboard.dailyWordsDesc')
                },
                {
                    id: 'vocab-test',
                    title: t('dashboard.quizTitle'),
                    icon: QuizIcon,
                    path: '/vocab/test',
                    description: t('dashboard.quizDesc')
                },
                {
                    id: 'vocab-words',
                    title: t('dashboard.wordListTitle'),
                    icon: WordListIcon,
                    path: '/vocab/words',
                    description: t('dashboard.wordListDesc')
                },
            ],
        },
        {
            id: 'games',
            title: t('games.title'),
            description: t('games.description'),
            icon: GameIcon,
            color: '#06b6d4',
            bgColor: '#ecfeff',
            children: [
                {
                    id: 'catchmind',
                    title: t('games.catchmindTitle'),
                    icon: GameIcon,
                    path: '/games/catchmind',
                    description: t('games.catchmindDesc')
                },
                {
                    id: 'wordchain',
                    title: t('games.wordchainTitle'),
                    icon: GameIcon,
                    path: '/games/wordchain',
                    description: t('games.wordchainDesc')
                },
            ],
        },
    ]

    const handleCardHover = (modeId) => {
        setExpandedCard(modeId)
    }

    const handleCardLeave = () => {
        setExpandedCard(null)
    }

    const handleSubItemClick = (path, e) => {
        e.stopPropagation()
        navigate(path)
    }

    return (
        <Container maxWidth="lg" sx={{ pb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 5, pt: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.3)',
                        }}
                    >
                        <WaveIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                            {t('dashboard.greeting')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('dashboard.subtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Learning Mode Cards */}
            <Grid container spacing={3}>
                {learningModes.map((mode) => {
                    const Icon = mode.icon
                    const isExpanded = expandedCard === mode.id
                    const hasChildren = mode.children && mode.children.length > 0

                    return (
                        <Grid key={mode.id} size={{ xs: 12, md: 6 }}>
                            <Card
                                onMouseEnter={() => handleCardHover(mode.id)}
                                onMouseLeave={handleCardLeave}
                                onClick={() => !hasChildren && mode.path && navigate(mode.path)}
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid transparent',
                                    borderColor: isExpanded ? mode.color : 'transparent',
                                    transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
                                    boxShadow: isExpanded
                                        ? `0 20px 40px -12px ${mode.color}30`
                                        : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                                    '&:hover': {
                                        borderColor: mode.color,
                                    },
                                    height: 'auto',
                                    minHeight: isExpanded ? 'auto' : 140,
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                                        {/* Icon */}
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '16px',
                                                backgroundColor: mode.bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 28, color: mode.color }} />
                                        </Box>

                                        {/* Text */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Typography variant="h6" fontWeight={700}>
                                                    {mode.title}
                                                </Typography>
                                                {hasChildren && (
                                                    <ChevronRightIcon
                                                        sx={{
                                                            transition: 'transform 0.3s',
                                                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                            color: mode.color,
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                {mode.description}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Sub-items */}
                                    {hasChildren && (
                                        <Collapse in={isExpanded} timeout={300}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: mode.children.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                                                    gap: 2,
                                                    mt: 3,
                                                    pt: 3,
                                                    borderTop: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                {mode.children.map((child, index) => {
                                                    const ChildIcon = child.icon
                                                    return (
                                                        <Box
                                                            key={child.id}
                                                            onClick={(e) => handleSubItemClick(child.path, e)}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: '14px',
                                                                backgroundColor: mode.bgColor,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                transform: isExpanded ? 'translateY(0)' : 'translateY(-8px)',
                                                                opacity: isExpanded ? 1 : 0,
                                                                transitionDelay: `${index * 50}ms`,
                                                                '&:hover': {
                                                                    backgroundColor: `${mode.color}20`,
                                                                    transform: 'scale(1.02)',
                                                                },
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                textAlign: 'center',
                                                                minHeight: 100,
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    borderRadius: '12px',
                                                                    backgroundColor: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    mb: 1.5,
                                                                    boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1)',
                                                                }}
                                                            >
                                                                <ChildIcon sx={{ color: mode.color, fontSize: 22 }} />
                                                            </Box>
                                                            <Typography variant="subtitle2" fontWeight={700}
                                                                sx={{ mb: 0.5 }}>
                                                                {child.title}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary"
                                                                sx={{ lineHeight: 1.3 }}>
                                                                {child.description}
                                                            </Typography>
                                                        </Box>
                                                    )
                                                })}
                                            </Box>
                                        </Collapse>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>

            {/* Today's Activity Stats */}
            <Box sx={{ mt: 6 }}>
                {loadingActivity ? (
                    <Grid container spacing={2}>
                        {[...Array(4)].map((_, i) => (
                            <Grid key={i} size={{ xs: 6, md: 3 }}>
                                <Card sx={{ borderRadius: '16px', height: 140 }}>
                                    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                                        <CircularProgress size={24} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid container spacing={2}>
                        {/* 오늘 외운 단어 */}
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Card
                                onClick={() => navigate('/vocab')}
                                sx={{
                                    borderRadius: '16px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px -8px rgba(249, 115, 22, 0.2)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '14px',
                                            backgroundColor: '#fff7ed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        <VocabIcon sx={{ color: '#f97316', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} color="#f97316">
                                        {activityData?.todayWords || 0}
                                        {activityData?.dailyTotal > 0 && (
                                            <Typography component="span" variant="h6" fontWeight={600} color="text.secondary">
                                                /{activityData.dailyTotal}
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isKorean ? '오늘 외운 단어' : 'Words Today'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {/* 읽은 뉴스 */}
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Card
                                onClick={() => navigate('/news')}
                                sx={{
                                    borderRadius: '16px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px -8px rgba(139, 92, 246, 0.2)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '14px',
                                            backgroundColor: '#f5f3ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        <NewsIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} color="#8b5cf6">
                                        {activityData?.newsRead || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isKorean ? '오늘 읽은 뉴스' : 'News Today'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {/* 총 학습 단어 */}
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Card
                                onClick={() => navigate('/vocab/words')}
                                sx={{
                                    borderRadius: '16px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px -8px rgba(249, 115, 22, 0.2)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '14px',
                                            backgroundColor: '#fff7ed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        <WordListIcon sx={{ color: '#f97316', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} color="#f97316">
                                        {activityData?.totalWords || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isKorean ? '총 학습 단어' : 'Total Words'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        {/* 연속 학습 */}
                        <Grid size={{ xs: 6, md: 3 }}>
                            <Card
                                onClick={() => navigate('/reports')}
                                sx={{
                                    borderRadius: '16px',
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px -8px rgba(236, 72, 153, 0.2)',
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '14px',
                                            backgroundColor: '#fce7f3',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        <LearnIcon sx={{ color: '#ec4899', fontSize: 24 }} />
                                    </Box>
                                    <Typography variant="h4" fontWeight={800} color="#ec4899">
                                        {Math.max(activityData?.vocabStreak || 0, activityData?.newsStreak || 0)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {isKorean ? '연속 학습' : 'Day Streak'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Container>
    )
}

// Placeholder Pages
function OpicPage() {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={700}>OPIC Practice</Typography>
            <Typography color="text.secondary">Level-based training</Typography>
        </Container>
    )
}


function ReportsPage() {
    const { isKorean } = useSettings()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalStudyDays: 0,
        totalWords: 0,
        totalTests: 0,
        averageScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        newsRead: 0,
        newsQuizScore: 0,
    })

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true)
                const [vocabStatsRes, vocabHistoryRes, newsStatsRes] = await Promise.allSettled([
                    statsService.getOverall().catch(() => null),
                    statsService.getDaily(null, { limit: 30 }).catch(() => null),
                    getNewsStats().catch(() => null),
                ])

                const vocabStats = vocabStatsRes.status === 'fulfilled' ? (vocabStatsRes.value?.data || vocabStatsRes.value) : null
                const vocabHistory = vocabHistoryRes.status === 'fulfilled' ? (vocabHistoryRes.value?.data || vocabHistoryRes.value) : null
                const newsStats = newsStatsRes.status === 'fulfilled' ? newsStatsRes.value?.data : null

                // 학습일 계산 (히스토리에서 학습한 날 수)
                const historyData = vocabHistory?.history || vocabHistory?.dailyStats || []
                const studyDays = historyData.filter(d => (d.newWordsLearned || d.learnedCount || 0) > 0).length

                setStats({
                    totalStudyDays: studyDays || 0,
                    totalWords: vocabStats?.newWordsLearned || vocabStats?.totalLearned || 0,
                    totalTests: vocabStats?.testsCompleted || vocabStats?.testCount || 0,
                    averageScore: Math.round(vocabStats?.successRate || vocabStats?.averageAccuracy || 0),
                    currentStreak: vocabStats?.currentStreak || vocabStats?.streakDays || 0,
                    bestStreak: vocabStats?.longestStreak || 0,
                    newsRead: newsStats?.totalRead || 0,
                    newsQuizScore: newsStats?.averageQuizScore || 0,
                })
            } catch (err) {
                console.error('Failed to fetch report data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchReportData()
    }, [])

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            </Container>
        )
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <QuizIcon sx={{ fontSize: 26, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>
                            {isKorean ? '학습 리포트' : 'Learning Report'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isKorean ? '나의 학습 현황을 확인하세요' : 'Check your learning progress'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 통계 요약 카드 */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {isKorean ? '총 학습일' : 'Study Days'}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="#059669">
                            {stats.totalStudyDays}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {isKorean ? '일' : 'days'}
                        </Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {isKorean ? '학습한 단어' : 'Words Learned'}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="#10b981">
                            {stats.totalWords}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {isKorean ? '개' : 'words'}
                        </Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {isKorean ? '테스트 완료' : 'Tests Taken'}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="#f97316">
                            {stats.totalTests}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {isKorean ? '회' : 'tests'}
                        </Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {isKorean ? '평균 점수' : 'Average Score'}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="#8b5cf6">
                            {stats.averageScore}%
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {isKorean ? '정확도' : 'accuracy'}
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* 뉴스 학습 통계 */}
            {(stats.newsRead > 0 || stats.newsQuizScore > 0) && (
                <Card sx={{ p: 3, borderRadius: '20px', mb: 4, backgroundColor: '#f5f3ff' }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom color="#8b5cf6">
                        {isKorean ? '뉴스 학습' : 'News Learning'}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 6 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight={800} color="#8b5cf6">
                                    {stats.newsRead}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '읽은 기사' : 'Articles Read'}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight={800} color="#8b5cf6">
                                    {stats.newsQuizScore}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isKorean ? '퀴즈 평균' : 'Quiz Average'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Card>
            )}

            {/* 연속 학습 */}
            <Card sx={{ p: 3, borderRadius: '20px', mb: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {isKorean ? '연속 학습 기록' : 'Study Streak'}
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                backgroundColor: '#fff7ed',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h3" fontWeight={800} color="#f97316">
                                {stats.currentStreak}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '현재 연속' : 'Current Streak'}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                backgroundColor: '#ecfdf5',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h3" fontWeight={800} color="#10b981">
                                {stats.bestStreak}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '최고 기록' : 'Best Streak'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* 배지 섹션 */}
            <BadgeSection />
        </Container>
    )
}

function SettingsPage() {
    const { settings, setTtsVoice, setLanguage, t } = useSettings()

    const languageOptions = [
        { value: 'ko', label: '한국어', flag: '🇰🇷' },
        { value: 'en', label: 'English', flag: '🇺🇸' },
    ]

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 12px -3px rgba(107, 114, 128, 0.3)',
                        }}
                    >
                        <VocabIcon sx={{ fontSize: 26, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                            {t('settings.title')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('settings.subtitle')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={3}>
                {/* Language Settings */}
                <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Box
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        }}
                    >
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                            {t('settings.language')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {t('settings.languageDesc')}
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            {languageOptions.map((option) => (
                                <Grid key={option.value} size={{ xs: 6 }}>
                                    <Box
                                        onClick={() => setLanguage(option.value)}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '16px',
                                            border: '2px solid',
                                            borderColor: settings.language === option.value ? '#059669' : 'divider',
                                            backgroundColor: settings.language === option.value ? '#ecfdf5' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            textAlign: 'center',
                                            '&:hover': {
                                                borderColor: '#059669',
                                                backgroundColor: '#ecfdf5',
                                            },
                                        }}
                                    >
                                        <Typography variant="h4" sx={{ mb: 1 }}>
                                            {option.flag}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            fontWeight={settings.language === option.value ? 700 : 500}
                                            color={settings.language === option.value ? '#059669' : 'text.primary'}
                                        >
                                            {option.label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* TTS Voice Settings */}
                <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Box
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        }}
                    >
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                            {t('settings.ttsVoice')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {t('settings.ttsVoiceDesc')}
                        </Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Box
                                    onClick={() => setTtsVoice('FEMALE')}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: '16px',
                                        border: '2px solid',
                                        borderColor: settings.ttsVoice === 'FEMALE' ? '#059669' : 'divider',
                                        backgroundColor: settings.ttsVoice === 'FEMALE' ? '#ecfdf5' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center',
                                        '&:hover': {
                                            borderColor: '#059669',
                                            backgroundColor: '#ecfdf5',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            backgroundColor: settings.ttsVoice === 'FEMALE' ? '#059669' : '#f5f5f4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 24 }}>👩</Typography>
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        fontWeight={settings.ttsVoice === 'FEMALE' ? 700 : 500}
                                        color={settings.ttsVoice === 'FEMALE' ? '#059669' : 'text.primary'}
                                    >
                                        {t('settings.femaleVoice')}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Box
                                    onClick={() => setTtsVoice('MALE')}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: '16px',
                                        border: '2px solid',
                                        borderColor: settings.ttsVoice === 'MALE' ? '#059669' : 'divider',
                                        backgroundColor: settings.ttsVoice === 'MALE' ? '#ecfdf5' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center',
                                        '&:hover': {
                                            borderColor: '#059669',
                                            backgroundColor: '#ecfdf5',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '50%',
                                            backgroundColor: settings.ttsVoice === 'MALE' ? '#059669' : '#f5f5f4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1.5,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 24 }}>👨</Typography>
                                    </Box>
                                    <Typography
                                        variant="body1"
                                        fontWeight={settings.ttsVoice === 'MALE' ? 700 : 500}
                                        color={settings.ttsVoice === 'MALE' ? '#059669' : 'text.primary'}
                                    >
                                        {t('settings.maleVoice')}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    )
}

function NotFound() {
    const navigate = useNavigate()
    const { t } = useSettings()

    return (
        <Container maxWidth="sm">
            <Box textAlign="center" py={12}>
                <Typography
                    variant="h1"
                    sx={{
                        fontWeight: 800,
                        fontSize: '8rem',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                    }}
                >
                    404
                </Typography>
                <Typography variant="h5" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                    {t('notFound.title')}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    {t('notFound.message')}
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                >
                    {t('notFound.backHome')}
                </Button>
            </Box>
        </Container>
    )
}

function App() {
    const dispatch = useDispatch()
    const { isAuthenticated } = useAuth()
    const { activeRoom, closeChatRoom } = useChat()

    useEffect(() => {
        if (isAuthenticated) {
            // redux로 프로필 정보 API(/users/profile/me) 호출
            dispatch(fetchMyProfile())
        }
    }, [isAuthenticated, dispatch])

    const handleRefreshRooms = () => {
        // Refresh rooms list after leaving a room
    }

    return (
        <>
            <Routes>
                {/* Chat room page (separate layout) */}
                <Route path="/freetalk/people/room/:roomId" element={<ChatRoomPage />} />

                {/* 로그인 / 회원가입 route */}
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />
                <Route path="/signup" element={
                    <PublicRoute>
                        <SignUpPage />
                    </PublicRoute>
                } />

                {/* MainLayout routes */}
                <Route element={<ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
                }>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/opic" element={<OpicPage />} />
                    <Route path="/freetalk/people" element={<FreetalkPeoplePage />} />
                    <Route path="/freetalk/ai" element={<SpeakingPage />} />
                    <Route path="/writing" element={<WritingPage />} />
                    <Route path="/vocab" element={<VocabDashboard />} />
                    <Route path="/vocab/daily" element={<DailyLearning />} />
                    <Route path="/vocab/test" element={<TestPage />} />
                    <Route path="/vocab/words" element={<WordListPage />} />
                    <Route path="/vocab/stats" element={<StatsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/games/catchmind" element={<CatchmindLobbyPage />} />
                    <Route path="/games/catchmind/:roomId/waiting" element={<CatchmindWaitingPage />} />
                    <Route path="/games/catchmind/:roomId/play" element={<CatchmindPlayPage />} />
                    <Route path="/games/wordchain" element={<WordchainLobbyPage />} />
                    <Route path="/games/wordchain/:roomId/waiting" element={<WordchainWaitingPage />} />
                    <Route path="/games/wordchain/:roomId/play" element={<WordchainPlayPage />} />
                    <Route path="/news" element={<NewsListPage />} />
                    <Route path="/news/:articleId" element={<NewsDetailPage />} />
                    <Route path="/news/:articleId/quiz" element={<NewsQuizPage />} />
                    <Route path="/news/words" element={<NewsWordsPage />} />
                    <Route path="/news/stats" element={<NewsStatsPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global chat modal */}
            <ChatRoomModal
                open={!!activeRoom}
                onClose={closeChatRoom}
                room={activeRoom}
                onLeave={handleRefreshRooms}
            />
        </>
    )
}

export default App
