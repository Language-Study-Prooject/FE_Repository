import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Skeleton,
    Snackbar,
    Alert,
    Tooltip,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    CheckCircle as CheckIcon,
    OpenInNew as ExternalIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon,
    Quiz as QuizIcon,
    VolumeUp as VolumeIcon,
    Add as AddIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import {
    getNewsDetail,
    markAsRead,
    toggleBookmark,
    getAudioUrl,
    collectWord,
    LEVEL_COLORS,
    NEWS_CATEGORIES,
    TTS_VOICES,
} from '../services/newsService'

const NewsDetailPage = () => {
    const { articleId } = useParams()
    const navigate = useNavigate()
    const { isKorean } = useSettings()
    const audioRef = useRef(null)

    const [article, setArticle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // States
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [isRead, setIsRead] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioLoading, setAudioLoading] = useState(false)
    const [selectedVoice, setSelectedVoice] = useState('Joanna')
    const [collectedWords, setCollectedWords] = useState(new Set())
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true)
                const response = await getNewsDetail(articleId)
                console.log('📰 Article Response:', response)
                console.log('📰 Article Data:', response.data)

                // 새 API 응답 구조: data.article (중첩) 또는 기존 data 직접
                const articleData = response.data?.article || response.data
                setArticle(articleData)

                // 북마크/읽음 상태 초기화 (새 API에서 제공)
                if (response.data?.isBookmarked !== undefined) {
                    setIsBookmarked(response.data.isBookmarked)
                }
                if (response.data?.isRead !== undefined) {
                    setIsRead(response.data.isRead)
                }

                setError(null)
            } catch (err) {
                console.error('Failed to fetch article:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (articleId) {
            fetchArticle()
        }
    }, [articleId])

    const handleBookmark = async () => {
        try {
            await toggleBookmark(articleId)
            setIsBookmarked(!isBookmarked)
            setSnackbar({
                open: true,
                message: isBookmarked
                    ? (isKorean ? '북마크가 해제되었습니다' : 'Bookmark removed')
                    : (isKorean ? '북마크에 추가되었습니다' : 'Added to bookmarks'),
                severity: 'success',
            })
        } catch (err) {
            console.error('Failed to toggle bookmark:', err)
        }
    }

    const handleMarkAsRead = async () => {
        if (isRead) return
        try {
            const response = await markAsRead(articleId)
            setIsRead(true)

            // 새 뱃지 획득 시 알림
            if (response.data?.newBadges?.length > 0) {
                setSnackbar({
                    open: true,
                    message: `${isKorean ? '새 뱃지 획득!' : 'New badge earned!'} ${response.data.newBadges[0].name}`,
                    severity: 'success',
                })
            } else {
                setSnackbar({
                    open: true,
                    message: isKorean ? '읽기 완료!' : 'Read complete!',
                    severity: 'success',
                })
            }
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }

    const handlePlayAudio = async () => {
        if (isPlaying && audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
            return
        }

        try {
            setAudioLoading(true)
            const response = await getAudioUrl(articleId, selectedVoice)
            const audioUrl = response.data?.audioUrl

            if (audioUrl) {
                if (!audioRef.current) {
                    audioRef.current = new Audio()
                }
                audioRef.current.src = audioUrl
                audioRef.current.onended = () => setIsPlaying(false)
                await audioRef.current.play()
                setIsPlaying(true)
            }
        } catch (err) {
            console.error('Failed to play audio:', err)
            setSnackbar({
                open: true,
                message: isKorean ? '오디오 재생 실패' : 'Failed to play audio',
                severity: 'error',
            })
        } finally {
            setAudioLoading(false)
        }
    }

    const handleCollectWord = async (keyword) => {
        if (collectedWords.has(keyword.word)) return

        try {
            // 단어 수집 - 백엔드에서 자동으로 단어장에 NEWS 카테고리로 추가됨
            const response = await collectWord(
                articleId,
                keyword.word,
                `From article: ${article.title}`
            )
            setCollectedWords(prev => new Set([...prev, keyword.word]))

            if (response.data?.newBadges?.length > 0) {
                setSnackbar({
                    open: true,
                    message: `${isKorean ? '새 뱃지 획득!' : 'New badge earned!'} ${response.data.newBadges[0].name}`,
                    severity: 'success',
                })
            } else {
                setSnackbar({
                    open: true,
                    message: isKorean ? '단어가 수집되었습니다' : 'Word collected',
                    severity: 'success',
                })
            }
        } catch (err) {
            console.error('Failed to collect word:', err)
            setSnackbar({
                open: true,
                message: isKorean ? '이미 수집된 단어입니다' : 'Word already collected',
                severity: 'warning',
            })
        }
    }

    const getLevelLabel = (level) => {
        const labels = {
            BEGINNER: isKorean ? '초급' : 'Beginner',
            INTERMEDIATE: isKorean ? '중급' : 'Intermediate',
            ADVANCED: isKorean ? '고급' : 'Advanced',
        }
        return labels[level] || level
    }

    const getCategoryLabel = (categoryId) => {
        const category = NEWS_CATEGORIES.find(c => c.id === categoryId)
        return category ? (isKorean ? category.label : category.labelEn) : categoryId
    }

    const getCategoryColor = (categoryId) => {
        const category = NEWS_CATEGORIES.find(c => c.id === categoryId)
        return category?.color || '#6b7280'
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: '16px', mb: 3 }} />
                <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
                <Skeleton width="100%" height={24} />
                <Skeleton width="100%" height={24} />
                <Skeleton width="80%" height={24} />
            </Container>
        )
    }

    if (error || !article) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="error">{error || 'Article not found'}</Typography>
                <Button onClick={() => navigate('/news')} sx={{ mt: 2 }}>
                    {isKorean ? '목록으로 돌아가기' : 'Back to list'}
                </Button>
            </Container>
        )
    }

    const levelColor = LEVEL_COLORS[article.level] || LEVEL_COLORS.INTERMEDIATE

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Top Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate('/news')}
                    sx={{ color: 'text.secondary' }}
                >
                    {isKorean ? '목록' : 'Back'}
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={isKorean ? '북마크' : 'Bookmark'}>
                        <IconButton onClick={handleBookmark}>
                            {isBookmarked ? (
                                <BookmarkIcon sx={{ color: '#f97316' }} />
                            ) : (
                                <BookmarkBorderIcon />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={isPlaying ? (isKorean ? '일시정지' : 'Pause') : (isKorean ? '듣기' : 'Listen')}>
                        <IconButton onClick={handlePlayAudio} disabled={audioLoading}>
                            {audioLoading ? (
                                <CircularProgress size={24} />
                            ) : isPlaying ? (
                                <PauseIcon sx={{ color: '#3B82F6' }} />
                            ) : (
                                <VolumeIcon />
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                    label={getCategoryLabel(article.category)}
                    size="small"
                    sx={{
                        backgroundColor: `${getCategoryColor(article.category)}15`,
                        color: getCategoryColor(article.category),
                        fontWeight: 600,
                    }}
                />
                <Chip
                    label={`${article.cefrLevel} - ${getLevelLabel(article.level)}`}
                    size="small"
                    sx={{
                        backgroundColor: levelColor.bg,
                        color: levelColor.main,
                        fontWeight: 600,
                    }}
                />
            </Box>

            {/* Title */}
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2, lineHeight: 1.3 }}>
                {article.title || (isKorean ? '제목 없음' : 'No Title')}
            </Typography>

            {/* Source & Date */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {article.source || 'Unknown'} | {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : (isKorean ? '날짜 없음' : 'No Date')}
            </Typography>

            {/* Image */}
            {article.imageUrl && (
                <Box
                    component="img"
                    src={article.imageUrl}
                    alt={article.title}
                    sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 400,
                        objectFit: 'cover',
                        borderRadius: '16px',
                        mb: 4,
                    }}
                />
            )}

            {/* Summary */}
            {article.summary && (
            <Card sx={{ borderRadius: '16px', mb: 4, backgroundColor: '#f8fafc' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
                        {isKorean ? '요약' : 'Summary'}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        {article.summary}
                    </Typography>
                </CardContent>
            </Card>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Keywords - 단어 카드 (keywords 배열 사용) */}
            {article.keywords && article.keywords.length > 0 && (
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box
                        sx={{
                            width: 6,
                            height: 24,
                            borderRadius: 3,
                            background: 'linear-gradient(180deg, #8B5CF6 0%, #A78BFA 100%)',
                        }}
                    />
                    <Typography variant="h6" fontWeight={700}>
                        {isKorean ? '핵심 단어' : 'Key Vocabulary'}
                    </Typography>
                    <Chip
                        label={`${article.keywords.length} ${isKorean ? '개' : 'words'}`}
                        size="small"
                        sx={{
                            ml: 1,
                            backgroundColor: '#EDE9FE',
                            color: '#7C3AED',
                            fontWeight: 600,
                            fontSize: 11,
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(4, 1fr)',
                        },
                        gap: 2,
                    }}
                >
                    {article.keywords.map((keyword, index) => {
                        const isCollected = collectedWords.has(keyword.word)
                        const keywordLevelColor = LEVEL_COLORS[keyword.level] || LEVEL_COLORS.INTERMEDIATE

                        return (
                            <Card
                                key={index}
                                sx={{
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'visible',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '2px solid',
                                    borderColor: isCollected ? '#10B981' : 'transparent',
                                    boxShadow: isCollected
                                        ? '0 8px 24px -4px rgba(16, 185, 129, 0.25)'
                                        : '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.15)',
                                    },
                                }}
                            >
                                {/* 난이도 뱃지 (카드 우상단) */}
                                <Chip
                                    label={getLevelLabel(keyword.level)}
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: 12,
                                        backgroundColor: keywordLevelColor.bg,
                                        color: keywordLevelColor.main,
                                        fontWeight: 700,
                                        fontSize: 10,
                                        height: 20,
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.15)',
                                    }}
                                />

                                {/* 수집 완료 표시 */}
                                {isCollected && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            left: 12,
                                            width: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            backgroundColor: '#10B981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.4)',
                                        }}
                                    >
                                        <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                                    </Box>
                                )}

                                <CardContent sx={{ p: 2.5, pt: 3 }}>
                                    {/* 단어 */}
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                        sx={{
                                            color: '#1F2937',
                                            mb: 1,
                                            fontSize: 18,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {keyword.word}
                                    </Typography>

                                    {/* 뜻 */}
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#6B7280',
                                            textAlign: 'center',
                                            mb: 1.5,
                                            minHeight: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {isKorean && keyword.meaningKo ? keyword.meaningKo : keyword.meaning}
                                    </Typography>

                                    {/* 영어 정의 (한국어 모드일 때) */}
                                    {isKorean && keyword.meaningKo && keyword.meaning && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: 'block',
                                                textAlign: 'center',
                                                color: '#9CA3AF',
                                                fontSize: 10,
                                                mb: 1.5,
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            {keyword.meaning}
                                        </Typography>
                                    )}

                                    {/* 예문 (있을 경우) */}
                                    {keyword.example && (
                                        <Box
                                            sx={{
                                                backgroundColor: '#F9FAFB',
                                                borderRadius: '8px',
                                                p: 1.5,
                                                mb: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#6B7280',
                                                    fontStyle: 'italic',
                                                    lineHeight: 1.5,
                                                    display: 'block',
                                                    fontSize: 11,
                                                }}
                                            >
                                                "{keyword.example}"
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* 수집 버튼 */}
                                    <Box
                                        onClick={() => !isCollected && handleCollectWord(keyword)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 0.5,
                                            py: 1,
                                            borderRadius: '8px',
                                            cursor: isCollected ? 'default' : 'pointer',
                                            backgroundColor: isCollected ? '#D1FAE5' : '#F3F4F6',
                                            color: isCollected ? '#059669' : '#6B7280',
                                            transition: 'all 0.2s ease',
                                            '&:hover': !isCollected && {
                                                backgroundColor: '#E5E7EB',
                                            },
                                        }}
                                    >
                                        {isCollected ? (
                                            <>
                                                <CheckIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={600}>
                                                    {isKorean ? '수집됨' : 'Collected'}
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <AddIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" fontWeight={600}>
                                                    {isKorean ? '단어 수집' : 'Collect'}
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Box>
            </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<QuizIcon />}
                    onClick={() => navigate(`/news/${articleId}/quiz`)}
                    sx={{
                        flex: 1,
                        borderRadius: '12px',
                        py: 1.5,
                        background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    }}
                >
                    {isKorean ? '퀴즈 풀기' : 'Take Quiz'}
                </Button>

                <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ExternalIcon />}
                    onClick={() => window.open(article.originalUrl, '_blank')}
                    sx={{
                        flex: 1,
                        borderRadius: '12px',
                        py: 1.5,
                    }}
                >
                    {isKorean ? '원문 보기' : 'View Original'}
                </Button>
            </Box>

            {/* Read Complete Button */}
            <Button
                fullWidth
                variant={isRead ? 'outlined' : 'contained'}
                size="large"
                startIcon={isRead ? <CheckIcon /> : null}
                onClick={handleMarkAsRead}
                disabled={isRead}
                sx={{
                    mt: 2,
                    borderRadius: '12px',
                    py: 1.5,
                    backgroundColor: isRead ? 'transparent' : '#10B981',
                    borderColor: isRead ? '#10B981' : 'transparent',
                    color: isRead ? '#10B981' : 'white',
                    '&:hover': {
                        backgroundColor: isRead ? 'transparent' : '#059669',
                    },
                }}
            >
                {isRead
                    ? (isKorean ? '읽기 완료됨' : 'Read Complete')
                    : (isKorean ? '읽기 완료' : 'Mark as Read')
                }
            </Button>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default NewsDetailPage
