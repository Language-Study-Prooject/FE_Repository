import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Tab,
    Tabs,
    Typography,
    Snackbar,
    Alert,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    CheckCircle as SyncedIcon,
    Delete as DeleteIcon,
    Sync as SyncIcon,
    LibraryBooks as WordsIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { getCollectedWords, deleteCollectedWord, syncToVocab } from '../services/newsService'

const NewsWordsPage = () => {
    const navigate = useNavigate()
    const { isKorean } = useSettings()

    const [words, setWords] = useState([])
    const [stats, setStats] = useState({ totalWords: 0, syncedToVocab: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState(0) // 0: 전체, 1: 미연동, 2: 연동완료
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

    useEffect(() => {
        fetchWords()
    }, [])

    const fetchWords = async () => {
        try {
            setLoading(true)
            const response = await getCollectedWords()
            setWords(response.data?.words || [])
            setStats(response.data?.stats || { totalWords: 0, syncedToVocab: 0 })
            setError(null)
        } catch (err) {
            console.error('Failed to fetch words:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (word, articleId) => {
        try {
            await deleteCollectedWord(articleId, word)
            setWords(prev => prev.filter(w => w.word !== word))
            setStats(prev => ({ ...prev, totalWords: prev.totalWords - 1 }))
            setSnackbar({
                open: true,
                message: isKorean ? '단어가 삭제되었습니다' : 'Word deleted',
                severity: 'success',
            })
        } catch (err) {
            console.error('Failed to delete word:', err)
            setSnackbar({
                open: true,
                message: isKorean ? '삭제 실패' : 'Failed to delete',
                severity: 'error',
            })
        }
    }

    const handleSync = async (word, articleId) => {
        try {
            await syncToVocab(word, articleId)
            setWords(prev =>
                prev.map(w =>
                    w.word === word ? { ...w, syncedToVocab: true } : w
                )
            )
            setStats(prev => ({ ...prev, syncedToVocab: prev.syncedToVocab + 1 }))
            setSnackbar({
                open: true,
                message: isKorean ? 'Vocabulary에 연동되었습니다' : 'Synced to Vocabulary',
                severity: 'success',
            })
        } catch (err) {
            console.error('Failed to sync word:', err)
            setSnackbar({
                open: true,
                message: isKorean ? '연동 실패' : 'Failed to sync',
                severity: 'error',
            })
        }
    }

    const filteredWords = words.filter(word => {
        if (activeTab === 0) return true
        if (activeTab === 1) return !word.syncedToVocab
        if (activeTab === 2) return word.syncedToVocab
        return true
    })

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        )
    }

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
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        <WordsIcon sx={{ fontSize: 26, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>
                            {isKorean ? '수집한 단어' : 'Collected Words'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stats.totalWords}{isKorean ? '개' : ' words'} | {stats.syncedToVocab}{isKorean ? '개 연동됨' : ' synced'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Tabs */}
            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                        borderRadius: '12px',
                        minHeight: 40,
                        textTransform: 'none',
                        fontWeight: 600,
                    },
                }}
            >
                <Tab label={isKorean ? '전체' : 'All'} />
                <Tab label={isKorean ? '미연동' : 'Not Synced'} />
                <Tab label={isKorean ? '연동완료' : 'Synced'} />
            </Tabs>

            {/* Error State */}
            {error && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            {/* Empty State */}
            {filteredWords.length === 0 && !error && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <WordsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                        {activeTab === 0
                            ? (isKorean ? '수집한 단어가 없습니다' : 'No collected words')
                            : activeTab === 1
                                ? (isKorean ? '미연동 단어가 없습니다' : 'No unsynced words')
                                : (isKorean ? '연동된 단어가 없습니다' : 'No synced words')
                        }
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/news')}
                        sx={{ mt: 2, borderRadius: '12px' }}
                    >
                        {isKorean ? '뉴스 읽으러 가기' : 'Read News'}
                    </Button>
                </Box>
            )}

            {/* Words List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredWords.map((word, index) => (
                    <Card
                        key={index}
                        sx={{
                            borderRadius: '16px',
                            border: '2px solid',
                            borderColor: word.syncedToVocab ? '#10B981' : 'transparent',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <Typography variant="h6" fontWeight={700}>
                                            {word.word}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {word.pronunciation}
                                        </Typography>
                                        {word.syncedToVocab && (
                                            <Chip
                                                icon={<SyncedIcon sx={{ fontSize: 16 }} />}
                                                label={isKorean ? '연동됨' : 'Synced'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#D1FAE5',
                                                    color: '#10B981',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                                        {word.meaning}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            p: 1.5,
                                            backgroundColor: '#F3F4F6',
                                            borderRadius: '8px',
                                            fontStyle: 'italic',
                                            mb: 1,
                                        }}
                                    >
                                        "{word.context}"
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        {isKorean ? '출처:' : 'From:'} {word.articleTitle}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {!word.syncedToVocab && (
                                        <IconButton
                                            onClick={() => handleSync(word.word, word.articleId)}
                                            sx={{
                                                backgroundColor: '#EFF6FF',
                                                '&:hover': { backgroundColor: '#DBEAFE' },
                                            }}
                                        >
                                            <SyncIcon sx={{ color: '#3B82F6' }} />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        onClick={() => handleDelete(word.word, word.articleId)}
                                        sx={{
                                            backgroundColor: '#FEF2F2',
                                            '&:hover': { backgroundColor: '#FEE2E2' },
                                        }}
                                    >
                                        <DeleteIcon sx={{ color: '#EF4444' }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

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

export default NewsWordsPage
