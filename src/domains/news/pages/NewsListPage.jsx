import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    Skeleton,
    TextField,
    Typography,
} from '@mui/material'
import {
    Bookmark as BookmarkIcon,
    BookmarkBorder as BookmarkBorderIcon,
    Newspaper as NewsIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { getNewsList, NEWS_CATEGORIES, LEVEL_COLORS, toggleBookmark } from '../services/newsService'

const NewsListPage = () => {
    const navigate = useNavigate()
    const { t, isKorean } = useSettings()

    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [cursor, setCursor] = useState(null)
    const [error, setError] = useState(null)

    // Filters
    const [levelFilter, setLevelFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    // 북마크 상태
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

    const fetchNews = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true)
            } else {
                setLoading(true)
                setCursor(null)
            }

            const response = await getNewsList({
                level: levelFilter || undefined,
                category: categoryFilter || undefined,
                limit: 10,
                cursor: isLoadMore ? cursor : undefined,
            })

            const newArticles = response.data?.articles || []

            // 북마크 상태 초기화 (API에서 isBookmarked 제공)
            const bookmarked = new Set()
            newArticles.forEach(article => {
                if (article.isBookmarked) {
                    bookmarked.add(article.articleId)
                }
            })

            if (isLoadMore) {
                setArticles(prev => [...prev, ...newArticles])
                setBookmarkedIds(prev => new Set([...prev, ...bookmarked]))
            } else {
                setArticles(newArticles)
                setBookmarkedIds(bookmarked)
            }

            setCursor(response.data?.nextCursor || null)
            setHasMore(response.data?.hasMore || false)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch news:', err)
            setError(err.message)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }, [levelFilter, categoryFilter, cursor])

    useEffect(() => {
        fetchNews(false)
    }, [levelFilter, categoryFilter])

    // 무한 스크롤
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 100
                && hasMore
                && !loadingMore
                && !loading
            ) {
                fetchNews(true)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [hasMore, loadingMore, loading, fetchNews])

    const handleBookmark = async (e, articleId) => {
        e.stopPropagation()
        try {
            await toggleBookmark(articleId)
            setBookmarkedIds(prev => {
                const newSet = new Set(prev)
                if (newSet.has(articleId)) {
                    newSet.delete(articleId)
                } else {
                    newSet.add(articleId)
                }
                return newSet
            })
        } catch (err) {
            console.error('Failed to toggle bookmark:', err)
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

    const filteredArticles = articles.filter(article => {
        if (!searchQuery) return true
        return (
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now - date
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)

        if (hours < 1) return isKorean ? '방금 전' : 'Just now'
        if (hours < 24) return isKorean ? `${hours}시간 전` : `${hours}h ago`
        if (days < 7) return isKorean ? `${days}일 전` : `${days}d ago`
        return date.toLocaleDateString()
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.3)',
                        }}
                    >
                        <NewsIcon sx={{ fontSize: 26, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>
                            {isKorean ? '뉴스 영어 학습' : 'News English Learning'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isKorean ? '실제 뉴스로 영어 실력을 키워보세요' : 'Improve your English with real news'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: '12px' }}
                    >
                        <MenuItem value="">{isKorean ? '전체 레벨' : 'All Levels'}</MenuItem>
                        <MenuItem value="BEGINNER">{isKorean ? '초급' : 'Beginner'}</MenuItem>
                        <MenuItem value="INTERMEDIATE">{isKorean ? '중급' : 'Intermediate'}</MenuItem>
                        <MenuItem value="ADVANCED">{isKorean ? '고급' : 'Advanced'}</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: '12px' }}
                    >
                        <MenuItem value="">{isKorean ? '전체 카테고리' : 'All Categories'}</MenuItem>
                        {NEWS_CATEGORIES.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {isKorean ? cat.label : cat.labelEn}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    placeholder={isKorean ? '뉴스 검색...' : 'Search news...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{
                        flex: 1,
                        minWidth: 200,
                        '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Error State */}
            {error && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            {/* News Grid */}
            <Grid container spacing={3}>
                {loading ? (
                    // Skeleton loading
                    [...Array(6)].map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ borderRadius: '16px', height: '100%' }}>
                                <Skeleton variant="rectangular" height={180} />
                                <CardContent>
                                    <Skeleton width="40%" height={24} />
                                    <Skeleton width="100%" height={28} sx={{ mt: 1 }} />
                                    <Skeleton width="80%" height={20} sx={{ mt: 1 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : filteredArticles.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <NewsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography color="text.secondary">
                                {isKorean ? '뉴스가 없습니다' : 'No news articles found'}
                            </Typography>
                        </Box>
                    </Grid>
                ) : (
                    filteredArticles.map((article) => {
                        const levelColor = LEVEL_COLORS[article.level] || LEVEL_COLORS.INTERMEDIATE
                        const isBookmarked = bookmarkedIds.has(article.articleId)

                        return (
                            <Grid key={article.articleId} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card
                                    onClick={() => navigate(`/news/${article.articleId}`)}
                                    sx={{
                                        borderRadius: '16px',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
                                        },
                                    }}
                                >
                                    {/* Image */}
                                    <CardMedia
                                        component="img"
                                        height="180"
                                        image={article.imageUrl || '/news-placeholder.jpg'}
                                        alt={article.title}
                                        sx={{ objectFit: 'cover' }}
                                    />

                                    <CardContent sx={{ p: 2.5 }}>
                                        {/* Tags */}
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                            <Chip
                                                label={getCategoryLabel(article.category)}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `${getCategoryColor(article.category)}15`,
                                                    color: getCategoryColor(article.category),
                                                    fontWeight: 600,
                                                    fontSize: 11,
                                                }}
                                            />
                                            <Chip
                                                label={getLevelLabel(article.level)}
                                                size="small"
                                                sx={{
                                                    backgroundColor: levelColor.bg,
                                                    color: levelColor.main,
                                                    fontWeight: 600,
                                                    fontSize: 11,
                                                }}
                                            />
                                        </Box>

                                        {/* Title */}
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight={700}
                                            sx={{
                                                mb: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {article.title}
                                        </Typography>

                                        {/* Summary */}
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {article.summary}
                                        </Typography>

                                        {/* Meta */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {article.source}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDate(article.publishedAt)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <ViewIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                    <Typography variant="caption" color="text.disabled">
                                                        {article.readCount}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleBookmark(e, article.articleId)}
                                                sx={{ color: isBookmarked ? '#f97316' : 'text.secondary' }}
                                            >
                                                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })
                )}
            </Grid>

            {/* Load More Indicator */}
            {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                </Box>
            )}

            {/* No More Items */}
            {!hasMore && articles.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                        {isKorean ? '모든 뉴스를 불러왔습니다' : 'All news loaded'}
                    </Typography>
                </Box>
            )}
        </Container>
    )
}

export default NewsListPage
