import {useCallback, useEffect, useRef, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    Clear as ClearIcon,
    ErrorOutline as ErrorIcon,
    LibraryBooks as WordListIcon,
    Search as SearchIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    VolumeUp as VolumeIcon,
} from '@mui/icons-material'
import WordDetailModal from '../components/WordDetailModal'
import {myWordService, voiceService} from '../services/vocabService'
import {LEVEL_LABELS, WORD_STATUS_LABELS,} from '../constants/vocabConstants'
import {useTranslation} from '../../../contexts/SettingsContext'
import {useAuth} from '../../../contexts/AuthContext'

const PAGE_SIZE = 20

// 디바운스 훅
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

export default function WordListPage() {
    const navigate = useNavigate()
    const {t} = useTranslation()
    const {user} = useAuth()
    const userId = user?.userId || user?.username
    const [searchParams] = useSearchParams()
    const observerRef = useRef(null)
    const loadMoreRef = useRef(null)

    const initialFilter = searchParams.get('filter')

    const [filterMode, setFilterMode] = useState(initialFilter || 'all')
    const [searchText, setSearchText] = useState('')

    const [userWords, setUserWords] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasMore, setHasMore] = useState(true)
    const [cursor, setCursor] = useState(null)

    const [selectedWord, setSelectedWord] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    const [playingWordId, setPlayingWordId] = useState(null)

    const debouncedSearch = useDebounce(searchText, 300)

    const fetchUserWords = useCallback(async (reset = false) => {
        if (loading) return

        try {
            setLoading(true)
            setError(null)

            const params = {
                limit: PAGE_SIZE,
                cursor: reset ? undefined : cursor,
            }

            if (filterMode === 'bookmarked') {
                params.bookmarked = true
            } else if (filterMode === 'incorrect') {
                params.incorrectOnly = true
            }

            const response = await myWordService.getList(userId, params)
            const data = response?.data || response
            const newWords = data?.userWords || []

            setUserWords(prev => reset ? newWords : [...prev, ...newWords])
            setHasMore(data?.hasMore || false)
            setCursor(data?.nextCursor || null)
        } catch (err) {
            console.error('Fetch user words error:', err)
            setError('단어 목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }, [loading, cursor, filterMode])

    useEffect(() => {
        setUserWords([])
        setCursor(null)
        setHasMore(true)
        fetchUserWords(true)
    }, [filterMode])

    useEffect(() => {
        if (loading || !hasMore) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchUserWords(false)
                }
            },
            {threshold: 0.1}
        )

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current)
        }

        observerRef.current = observer

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [hasMore, loading, fetchUserWords])

    const filteredWords = userWords.filter(word => {
        if (!debouncedSearch) return true
        const search = debouncedSearch.toLowerCase()
        return (
            word.english?.toLowerCase().includes(search) ||
            word.korean?.toLowerCase().includes(search)
        )
    })

    const handlePlayTTS = async (word) => {
        if (playingWordId) return

        try {
            setPlayingWordId(word.wordId)
            const response = await voiceService.synthesize(word.wordId, word.english)

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

    const handleToggleBookmark = async (word) => {
        const newBookmarked = !word.bookmarked

        try {
            await myWordService.toggleBookmark(userId, word.wordId, newBookmarked)

            setUserWords(prev =>
                prev.map(w =>
                    w.wordId === word.wordId ? {...w, bookmarked: newBookmarked} : w
                )
            )

            if (filterMode === 'bookmarked' && !newBookmarked) {
                setUserWords(prev => prev.filter(w => w.wordId !== word.wordId))
            }
        } catch (err) {
            console.error('Bookmark toggle error:', err)
        }
    }

    const handleWordClick = (word) => {
        setSelectedWord(word)
        setModalOpen(true)
    }

    const handleClearSearch = () => {
        setSearchText('')
    }

    const getLevelStyle = (level) => {
        switch (level) {
            case 'BEGINNER':
                return {bg: '#ecfdf5', color: '#059669'}
            case 'INTERMEDIATE':
                return {bg: '#fff7ed', color: '#f97316'}
            case 'ADVANCED':
                return {bg: '#fef2f2', color: '#ef4444'}
            default:
                return {bg: '#f5f5f4', color: '#57534e'}
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'MASTERED':
                return {bg: '#ecfdf5', color: '#059669'}
            case 'REVIEWING':
                return {bg: '#eff6ff', color: '#3b82f6'}
            case 'LEARNING':
                return {bg: '#fff7ed', color: '#f97316'}
            default:
                return {bg: '#f5f5f4', color: '#57534e'}
        }
    }

    return (
        <Container maxWidth="sm" sx={{pb: 6}}>
            {/* 헤더 */}
            <Box sx={{mb: 4, pt: 2}}>
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <IconButton onClick={() => navigate('/vocab')} sx={{ml: -1}}>
                        <BackIcon/>
                    </IconButton>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 12px -3px rgba(5, 150, 105, 0.3)',
                        }}
                    >
                        <WordListIcon sx={{fontSize: 24, color: 'white'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{lineHeight: 1.2}}>
                            {t('wordList.title')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {filteredWords.length} {t('wordList.wordsCount')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 검색 */}
            <TextField
                fullWidth
                placeholder={t('wordList.searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{color: '#a8a29e'}}/>
                        </InputAdornment>
                    ),
                    endAdornment: searchText && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={handleClearSearch}>
                                <ClearIcon fontSize="small"/>
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                    },
                }}
            />

            {/* 필터 탭 */}
            <Box sx={{mb: 3}}>
                <ToggleButtonGroup
                    value={filterMode}
                    exclusive
                    onChange={(e, val) => val && setFilterMode(val)}
                    size="small"
                    fullWidth
                    sx={{
                        '& .MuiToggleButton-root': {
                            flex: 1,
                            py: 1.5,
                            fontWeight: 600,
                            '&.Mui-selected': {
                                backgroundColor: '#059669',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#047857',
                                },
                            },
                        },
                    }}
                >
                    <ToggleButton value="all">
                        {t('wordList.filterAll')}
                    </ToggleButton>
                    <ToggleButton value="bookmarked">
                        <StarIcon fontSize="small" sx={{mr: 0.5}}/>
                        {t('wordList.filterBookmarked')}
                    </ToggleButton>
                    <ToggleButton value="incorrect">
                        <ErrorIcon fontSize="small" sx={{mr: 0.5}}/>
                        {t('wordList.filterIncorrect')}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 3}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* 단어 목록 */}
            <Box display="flex" flexDirection="column" gap={1.5}>
                {filteredWords.map((word) => {
                    const levelStyle = getLevelStyle(word.level)
                    const statusStyle = getStatusStyle(word.status)

                    return (
                        <Paper
                            key={word.wordId}
                            elevation={0}
                            onClick={() => handleWordClick(word)}
                            sx={{
                                p: 2.5,
                                cursor: 'pointer',
                                border: '2px solid transparent',
                                borderRadius: '16px',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: '#059669',
                                    boxShadow: '0 4px 12px -4px rgba(5, 150, 105, 0.2)',
                                },
                            }}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box flex={1} minWidth={0}>
                                    <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                                        <Typography variant="h6" fontWeight={700} sx={{color: '#1c1917'}}>
                                            {word.english}
                                        </Typography>
                                        {word.level && (
                                            <Chip
                                                label={LEVEL_LABELS[word.level] || word.level}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    backgroundColor: levelStyle.bg,
                                                    color: levelStyle.color,
                                                }}
                                            />
                                        )}
                                        {word.status && (
                                            <Chip
                                                label={WORD_STATUS_LABELS[word.status] || word.status}
                                                size="small"
                                                sx={{
                                                    height: 22,
                                                    fontSize: 11,
                                                    fontWeight: 500,
                                                    backgroundColor: statusStyle.bg,
                                                    color: statusStyle.color,
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Typography variant="body2" sx={{color: '#57534e', mb: 1}}>
                                        {word.korean}
                                    </Typography>

                                    {(word.correctCount > 0 || word.incorrectCount > 0) && (
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Typography variant="caption" sx={{color: '#10b981', fontWeight: 600}}>
                                                {t('wordList.correct')} {word.correctCount || 0}
                                            </Typography>
                                            <Typography variant="caption" sx={{color: '#ef4444', fontWeight: 600}}>
                                                {t('wordList.incorrect')} {word.incorrectCount || 0}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Box display="flex" alignItems="center" gap={0.5} ml={2}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handlePlayTTS(word)
                                        }}
                                        disabled={playingWordId === word.wordId}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: playingWordId === word.wordId ? '#059669' : '#f5f5f4',
                                            '&:hover': {backgroundColor: playingWordId === word.wordId ? '#047857' : '#e7e5e4'},
                                        }}
                                    >
                                        <VolumeIcon
                                            fontSize="small"
                                            sx={{color: playingWordId === word.wordId ? 'white' : '#57534e'}}
                                        />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleToggleBookmark(word)
                                        }}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: word.bookmarked ? '#fef3c7' : '#f5f5f4',
                                            '&:hover': {backgroundColor: word.bookmarked ? '#fde68a' : '#e7e5e4'},
                                        }}
                                    >
                                        {word.bookmarked ? (
                                            <StarIcon fontSize="small" sx={{color: '#f59e0b'}}/>
                                        ) : (
                                            <StarBorderIcon fontSize="small" sx={{color: '#78716c'}}/>
                                        )}
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    )
                })}
            </Box>

            {/* 로딩 & 더보기 트리거 */}
            <Box ref={loadMoreRef} display="flex" justifyContent="center" py={4}>
                {loading && <CircularProgress size={32} sx={{color: '#059669'}}/>}
                {!loading && !hasMore && filteredWords.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        {t('wordList.loadedAll')}
                    </Typography>
                )}
                {!loading && filteredWords.length === 0 && !error && (
                    <Box textAlign="center" py={4}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '16px',
                                backgroundColor: '#f5f5f4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <WordListIcon sx={{fontSize: 32, color: '#a8a29e'}}/>
                        </Box>
                        <Typography variant="body1" color="text.secondary" fontWeight={500} mb={1}>
                            {filterMode === 'bookmarked'
                                ? t('wordList.noBookmarks')
                                : filterMode === 'incorrect'
                                    ? t('wordList.noIncorrect')
                                    : t('wordList.noWords')}
                        </Typography>
                        <Chip
                            label={t('wordList.startLearning')}
                            onClick={() => navigate('/vocab/daily')}
                            sx={{
                                mt: 1,
                                backgroundColor: '#059669',
                                color: 'white',
                                fontWeight: 600,
                                '&:hover': {backgroundColor: '#047857'},
                            }}
                        />
                    </Box>
                )}
            </Box>

            {/* 상세 모달 */}
            <WordDetailModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                word={selectedWord}
                userWord={selectedWord}
                onPlayTTS={() => selectedWord && handlePlayTTS(selectedWord)}
                onToggleBookmark={() => selectedWord && handleToggleBookmark(selectedWord)}
                isPlayingTTS={playingWordId === selectedWord?.wordId}
            />
        </Container>
    )
}
