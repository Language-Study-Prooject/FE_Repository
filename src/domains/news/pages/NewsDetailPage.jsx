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
                setArticle(response.data)
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
            const response = await collectWord(articleId, keyword.word, `From article: ${article.title}`)
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
                {article.title}
            </Typography>

            {/* Source & Date */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
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

            <Divider sx={{ my: 4 }} />

            {/* Keywords */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {isKorean ? '핵심 단어' : 'Key Vocabulary'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {article.keywords?.map((keyword, index) => {
                        const isCollected = collectedWords.has(keyword.word)
                        const keywordLevelColor = LEVEL_COLORS[keyword.level] || LEVEL_COLORS.INTERMEDIATE

                        return (
                            <Card
                                key={index}
                                sx={{
                                    borderRadius: '12px',
                                    minWidth: 140,
                                    border: '2px solid',
                                    borderColor: isCollected ? '#10B981' : 'transparent',
                                }}
                            >
                                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {keyword.word}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {keyword.meaning}
                                    </Typography>
                                    <Chip
                                        label={getLevelLabel(keyword.level)}
                                        size="small"
                                        sx={{
                                            mt: 1,
                                            backgroundColor: keywordLevelColor.bg,
                                            color: keywordLevelColor.main,
                                            fontSize: 10,
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCollectWord(keyword)}
                                        disabled={isCollected}
                                        sx={{ mt: 1 }}
                                    >
                                        {isCollected ? (
                                            <CheckIcon sx={{ color: '#10B981' }} />
                                        ) : (
                                            <AddIcon />
                                        )}
                                    </IconButton>
                                </CardContent>
                            </Card>
                        )
                    })}
                </Box>
            </Box>

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
