import {useCallback, useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    Container,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Paper,
    Switch,
    Tooltip,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    AutoAwesome as SparkleIcon,
    Celebration as CelebrationIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    School as SchoolIcon,
    SkipNext as SkipIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    VolumeUp as VolumeIcon,
} from '@mui/icons-material'
import FlashCard from '../components/FlashCard'
import {dailyService, userWordService, voiceService} from '../services/vocabService'
import {LEVEL_LABELS, LEVELS} from '../constants/vocabConstants'
import {useTranslation} from '../../../contexts/SettingsContext'
import {useAuth} from '../../../contexts/AuthContext'

// 카드 셔플 애니메이션 컴포넌트
function ShuffleAnimation({count, isKorean}) {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* 카드 셔플 애니메이션 */}
            <Box sx={{position: 'relative', width: 200, height: 140, mb: 4}}>
                {[...Array(Math.min(count, 5))].map((_, i) => (
                    <Box
                        key={i}
                        sx={{
                            position: 'absolute',
                            width: 120,
                            height: 160,
                            backgroundColor: '#fff',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            animation: `shuffleCard${i} 1.5s ease-in-out infinite`,
                            animationDelay: `${i * 0.1}s`,
                            '@keyframes shuffleCard0': {
                                '0%, 100%': {transform: 'translate(-50%, -50%) rotate(0deg)'},
                                '25%': {transform: 'translate(-80%, -60%) rotate(-15deg)'},
                                '50%': {transform: 'translate(-50%, -50%) rotate(0deg)'},
                                '75%': {transform: 'translate(-20%, -40%) rotate(15deg)'},
                            },
                            '@keyframes shuffleCard1': {
                                '0%, 100%': {transform: 'translate(-50%, -50%) rotate(5deg)'},
                                '25%': {transform: 'translate(-30%, -70%) rotate(20deg)'},
                                '50%': {transform: 'translate(-50%, -50%) rotate(5deg)'},
                                '75%': {transform: 'translate(-70%, -30%) rotate(-10deg)'},
                            },
                            '@keyframes shuffleCard2': {
                                '0%, 100%': {transform: 'translate(-50%, -50%) rotate(-5deg)'},
                                '25%': {transform: 'translate(-60%, -40%) rotate(-20deg)'},
                                '50%': {transform: 'translate(-50%, -50%) rotate(-5deg)'},
                                '75%': {transform: 'translate(-40%, -60%) rotate(10deg)'},
                            },
                            '@keyframes shuffleCard3': {
                                '0%, 100%': {transform: 'translate(-50%, -50%) rotate(8deg)'},
                                '33%': {transform: 'translate(-70%, -50%) rotate(-12deg)'},
                                '66%': {transform: 'translate(-30%, -50%) rotate(18deg)'},
                            },
                            '@keyframes shuffleCard4': {
                                '0%, 100%': {transform: 'translate(-50%, -50%) rotate(-8deg)'},
                                '33%': {transform: 'translate(-50%, -70%) rotate(12deg)'},
                                '66%': {transform: 'translate(-50%, -30%) rotate(-18deg)'},
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography sx={{color: 'white', fontSize: 32}}>📚</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* 텍스트 */}
            <Typography
                variant="h5"
                fontWeight={700}
                color="white"
                textAlign="center"
                sx={{
                    animation: 'pulse 1s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': {opacity: 1},
                        '50%': {opacity: 0.6},
                    },
                }}
            >
                {isKorean ? '카드를 섞는 중...' : 'Shuffling cards...'}
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.7)" mt={1}>
                {isKorean
                    ? `${count}개의 단어를 다시 학습합니다`
                    : `Reviewing ${count} words again`
                }
            </Typography>
        </Box>
    )
}

// Level Selection Screen
function LevelSelect({onSelect, loading, t, isKorean}) {
    const levelConfig = {
        [LEVELS.BEGINNER]: {
            description: isKorean ? '기초 어휘 학습' : 'Basic vocabulary',
            color: '#059669',
            bgColor: '#ecfdf5',
            icon: '🌱',
        },
        [LEVELS.INTERMEDIATE]: {
            description: isKorean ? '실용 어휘 확장' : 'Intermediate vocabulary',
            color: '#f97316',
            bgColor: '#fff7ed',
            icon: '🌿',
        },
        [LEVELS.ADVANCED]: {
            description: isKorean ? '전문 어휘 마스터' : 'Advanced vocabulary',
            color: '#ef4444',
            bgColor: '#fef2f2',
            icon: '🌳',
        },
    }

    return (
        <Box py={4}>
            <Box textAlign="center" mb={5}>
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 12px 24px -6px rgba(5, 150, 105, 0.4)',
                    }}
                >
                    <SchoolIcon sx={{fontSize: 40, color: 'white'}}/>
                </Box>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    {t('dailyLearning.selectLevel')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isKorean ? '난이도를 선택하여 학습을 시작하세요' : 'Select a difficulty to start learning'}
                </Typography>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
                {Object.entries(LEVEL_LABELS).map(([level, label]) => {
                    const config = levelConfig[level]
                    return (
                        <Card
                            key={level}
                            sx={{
                                border: '2px solid transparent',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: config.color,
                                    transform: 'translateX(8px)',
                                    boxShadow: `0 8px 24px -8px ${config.color}40`,
                                },
                            }}
                        >
                            <CardActionArea onClick={() => !loading && onSelect(level)} disabled={loading}>
                                <CardContent sx={{p: 2.5}}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: '16px',
                                                backgroundColor: config.bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 28,
                                            }}
                                        >
                                            {config.icon}
                                        </Box>
                                        <Box flex={1}>
                                            <Typography variant="h6" fontWeight={700} sx={{color: config.color}}>
                                                {label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {config.description}
                                            </Typography>
                                        </Box>
                                        {loading && <CircularProgress size={24} sx={{color: config.color}}/>}
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    )
                })}
            </Box>
        </Box>
    )
}

export default function DailyLearning() {
    const navigate = useNavigate()
    const {t, isKorean} = useTranslation()
    const {user} = useAuth()
    const userId = user?.userId || user?.username
    const [phase, setPhase] = useState('loading')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [words, setWords] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [learnedIds, setLearnedIds] = useState(new Set())
    const [autoPlayTTS, setAutoPlayTTS] = useState(false)
    const [isPlayingTTS, setIsPlayingTTS] = useState(false)
    const [results, setResults] = useState({correct: 0, incorrect: 0})
    const [swipeDirection, setSwipeDirection] = useState(null)
    const [isEntering, setIsEntering] = useState(false)
    const [unknownWords, setUnknownWords] = useState([]) // "몰라요" 선택한 단어들
    const [totalWordCount, setTotalWordCount] = useState(0) // 전체 단어 수 (진행률 계산용)
    const [isShuffling, setIsShuffling] = useState(false) // 셔플 애니메이션 상태
    const [shuffleCount, setShuffleCount] = useState(0) // 셔플할 단어 수

    // 마운트 시 먼저 level 없이 시도 (기존 학습이 있으면 성공)
    // 실패하면 level 선택 화면으로 이동
    useEffect(() => {
        fetchDailyWords()
    }, [])

    const fetchDailyWords = async (level = null) => {
        try {
            setLoading(true)
            setError(null)

            const response = await dailyService.getWords(level)
            const dailyData = response?.data || response

            const allWords = [
                ...(dailyData?.newWords || []),
                ...(dailyData?.reviewWords || []),
            ]

            if (allWords.length === 0) {
                setError('No words to learn.')
                setPhase('select')
                return
            }

            setWords(allWords)
            setTotalWordCount(allWords.length) // 전체 단어 수 저장

            const learnedCount = dailyData?.learnedCount || 0
            if (learnedCount > 0 && learnedCount < allWords.length) {
                const learned = new Set(allWords.slice(0, learnedCount).map(w => w.wordId))
                setLearnedIds(learned)
                setCurrentIndex(learnedCount)
            }

            if (dailyData?.isCompleted) {
                setPhase('complete')
            } else {
                setPhase('learning')
            }
        } catch (err) {
            console.error('Fetch daily words error:', err)
            const errorMsg = err.response?.data?.message || err.message || ''

            if (errorMsg.includes('level') || err.response?.status === 400) {
                setPhase('select')
            } else {
                setError('Failed to load words.')
                setPhase('select')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleLevelSelect = (level) => {
        fetchDailyWords(level)
    }

    const currentWord = words[currentIndex]
    // 진행률: 학습 완료된 단어 / 전체 단어 수
    const progress = totalWordCount > 0 ? (learnedIds.size / totalWordCount) * 100 : 0
    // 현재 라운드에서 남은 단어 (몰라요 단어 재학습 시 표시용)
    const remainingInRound = words.length - currentIndex

    const playTTS = useCallback(async (word) => {
        if (!word || isPlayingTTS) return
        try {
            setIsPlayingTTS(true)
            const response = await voiceService.synthesize(word.wordId, word.english)
            if (response?.audioUrl) {
                const audio = new Audio(response.audioUrl)
                audio.onended = () => setIsPlayingTTS(false)
                audio.onerror = () => setIsPlayingTTS(false)
                await audio.play()
            } else {
                setIsPlayingTTS(false)
            }
        } catch (err) {
            console.error('TTS error:', err)
            setIsPlayingTTS(false)
        }
    }, [isPlayingTTS])

    useEffect(() => {
        if (autoPlayTTS && currentWord && !isFlipped && phase === 'learning') {
            playTTS(currentWord)
        }
    }, [currentIndex, autoPlayTTS, phase])

    const handleFlip = () => {
        setIsFlipped(!isFlipped)
    }

    const handleAnswer = async (isCorrect) => {
        if (!currentWord || swipeDirection) return

        setSwipeDirection(isCorrect ? 'right' : 'left')

        if (isCorrect) {
            // "알아요" 선택 - API 호출하고 학습 완료 처리
            try {
                await dailyService.markLearned(currentWord.wordId)
                setLearnedIds(prev => new Set([...prev, currentWord.wordId]))
                setResults(prev => ({...prev, correct: prev.correct + 1}))
            } catch (err) {
                console.error('Answer update error:', err)
            }
        } else {
            // "몰라요" 선택 - API 호출 X, 나중에 다시 학습하도록 저장
            setUnknownWords(prev => [...prev, currentWord])
            setResults(prev => ({...prev, incorrect: prev.incorrect + 1}))
        }

        setTimeout(() => {
            setSwipeDirection(null)
            setIsEntering(true)
            moveToNext()
            setTimeout(() => setIsEntering(false), 200)
        }, 250)
    }

    // 배열 섞기 함수
    const shuffleArray = (array) => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    const moveToNext = () => {
        setIsFlipped(false)
        if (currentIndex < words.length - 1) {
            // 다음 단어로 이동
            setCurrentIndex(prev => prev + 1)
        } else if (unknownWords.length > 0) {
            // 현재 리스트 끝 + "몰라요" 단어 있음 → 셔플 애니메이션 후 다시 학습
            setShuffleCount(unknownWords.length)
            setIsShuffling(true)
            setTimeout(() => {
                const shuffled = shuffleArray(unknownWords)
                setWords(shuffled)
                setUnknownWords([])
                setCurrentIndex(0)
                setIsShuffling(false)
            }, 1500) // 1.5초 애니메이션
        } else {
            // 모든 단어 "알아요" 완료 → 학습 완료
            setPhase('complete')
        }
    }

    // 건너뛰기 - "몰라요"와 동일하게 처리
    const handleSkip = () => {
        if (!currentWord || swipeDirection || isShuffling) return

        setIsFlipped(false)

        if (currentIndex < words.length - 1) {
            // 다음 단어가 있으면 현재 단어를 unknownWords에 추가하고 다음으로
            setUnknownWords(prev => [...prev, currentWord])
            setCurrentIndex(prev => prev + 1)
        } else {
            // 마지막 단어 건너뛰기 → 모든 unknown 단어 + 현재 단어로 셔플
            const allUnknown = [...unknownWords, currentWord]
            setShuffleCount(allUnknown.length)
            setIsShuffling(true)
            setTimeout(() => {
                const shuffled = shuffleArray(allUnknown)
                setWords(shuffled)
                setUnknownWords([])
                setCurrentIndex(0)
                setIsShuffling(false)
            }, 1500)
        }
    }

    const handleToggleBookmark = async () => {
        if (!currentWord) return
        try {
            const newBookmarked = !currentWord.bookmarked
            await userWordService.updateTag(userId, currentWord.wordId, {
                bookmarked: newBookmarked,
            })
            setWords(prev =>
                prev.map(w =>
                    w.wordId === currentWord.wordId ? {...w, bookmarked: newBookmarked} : w
                )
            )
        } catch (err) {
            console.error('Bookmark error:', err)
        }
    }

    const handleRestart = () => {
        // 처음부터 다시 시작 - 단어 목록 다시 가져오기
        setCurrentIndex(0)
        setLearnedIds(new Set())
        setUnknownWords([])
        setIsFlipped(false)
        setResults({correct: 0, incorrect: 0})
        setPhase('loading')
        fetchDailyWords() // 단어 다시 로드
    }

    // Loading Screen
    if (phase === 'loading') {
        return (
            <Container maxWidth="sm">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress sx={{color: 'primary.main'}}/>
                </Box>
            </Container>
        )
    }

    // Level Selection Screen
    if (phase === 'select') {
        return (
            <Container maxWidth="sm">
                <Box display="flex" alignItems="center" gap={1} py={2}>
                    <IconButton onClick={() => navigate('/vocab')}>
                        <BackIcon/>
                    </IconButton>
                    <Typography variant="h5" fontWeight={700}>
                        {t('dailyLearning.title')}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="info" sx={{mb: 2}} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <LevelSelect onSelect={handleLevelSelect} loading={loading} t={t} isKorean={isKorean}/>
            </Container>
        )
    }

    // Completion Screen
    if (phase === 'complete') {
        const totalAnswered = results.correct + results.incorrect
        const accuracy = totalAnswered > 0 ? (results.correct / totalAnswered) * 100 : 0

        return (
            <Container maxWidth="sm">
                <Box py={6} textAlign="center">
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '28px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            boxShadow: '0 16px 32px -8px rgba(251, 191, 36, 0.5)',
                            animation: 'float 3s ease-in-out infinite',
                            '@keyframes float': {
                                '0%, 100%': {transform: 'translateY(0px)'},
                                '50%': {transform: 'translateY(-8px)'},
                            },
                        }}
                    >
                        <CelebrationIcon sx={{fontSize: 52, color: 'white'}}/>
                    </Box>

                    <Typography variant="h3" fontWeight={800} gutterBottom>
                        {t('dailyLearning.greatJob')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={4}>
                        {t('dailyLearning.completedSession')}
                    </Typography>

                    <Paper sx={{p: 4, mb: 4, backgroundColor: '#fafaf9'}}>
                        <Box display="flex" justifyContent="center" gap={6} mb={3}>
                            <Box textAlign="center">
                                <Typography variant="h2" sx={{color: '#10b981', fontWeight: 800}}>
                                    {results.correct}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {t('dailyLearning.correct')}
                                </Typography>
                            </Box>
                            <Box textAlign="center">
                                <Typography variant="h2" sx={{color: '#ef4444', fontWeight: 800}}>
                                    {results.incorrect}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {t('dailyLearning.incorrect')}
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 3,
                                py: 1.5,
                                borderRadius: '12px',
                                backgroundColor: accuracy >= 80 ? '#ecfdf5' : accuracy >= 50 ? '#fff7ed' : '#fef2f2',
                            }}
                        >
                            <SparkleIcon
                                sx={{color: accuracy >= 80 ? '#059669' : accuracy >= 50 ? '#f97316' : '#ef4444'}}/>
                            <Typography
                                variant="h5"
                                fontWeight={700}
                                sx={{color: accuracy >= 80 ? '#059669' : accuracy >= 50 ? '#f97316' : '#ef4444'}}
                            >
                                {accuracy.toFixed(0)}% {t('dailyLearning.accuracy')}
                            </Typography>
                        </Box>
                    </Paper>

                    <Box display="flex" gap={2} justifyContent="center">
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={handleRestart}
                            sx={{px: 3}}
                        >
                            {t('dailyLearning.practiceAgain')}
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/vocab')}
                            sx={{px: 4}}
                        >
                            {t('dailyLearning.backToDashboard')}
                        </Button>
                    </Box>
                </Box>
            </Container>
        )
    }

    // Learning Screen
    return (
        <>
            {/* 셔플 애니메이션 오버레이 */}
            {isShuffling && (
                <ShuffleAnimation
                    count={shuffleCount}
                    isKorean={isKorean}
                />
            )}

            <Container maxWidth="sm" sx={{pb: 6}}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 2,
                    }}
                >
                    <IconButton onClick={() => navigate('/vocab')}>
                        <BackIcon/>
                    </IconButton>
                    <Box textAlign="center">
                        <Typography variant="h6" fontWeight={700}>
                            {currentIndex + 1} / {words.length}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoPlayTTS}
                                onChange={(e) => setAutoPlayTTS(e.target.checked)}
                                size="small"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#059669',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#059669',
                                    },
                                }}
                            />
                        }
                        label={<VolumeIcon fontSize="small" sx={{color: autoPlayTTS ? '#059669' : 'text.secondary'}}/>}
                    />
                </Box>

                {/* Progress Bar */}
                <Box sx={{mb: 4}}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {t('dailyLearning.progress')}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                            {Math.round(progress)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e7e5e4',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                            },
                        }}
                    />
                </Box>

                {/* FlashCard */}
                <Box
                    sx={{
                        mb: 4,
                        transition: swipeDirection
                            ? 'all 0.25s ease-out'
                            : isEntering
                                ? 'all 0.2s ease-out'
                                : 'none',
                        transform: swipeDirection === 'left'
                            ? 'translateX(-120%) rotate(-15deg)'
                            : swipeDirection === 'right'
                                ? 'translateX(120%) rotate(15deg)'
                                : 'scale(1)',
                        opacity: swipeDirection ? 0 : 1,
                        animation: isEntering ? 'popIn 0.2s ease-out' : 'none',
                        '@keyframes popIn': {
                            '0%': {transform: 'scale(0.9)', opacity: 0},
                            '100%': {transform: 'scale(1)', opacity: 1},
                        },
                    }}
                >
                    <FlashCard
                        word={currentWord}
                        isFlipped={isFlipped}
                        onFlip={handleFlip}
                        onPlayTTS={() => playTTS(currentWord)}
                        isPlayingTTS={isPlayingTTS}
                    />
                </Box>

                {/* Answer Buttons */}
                <Box display="flex" gap={2} justifyContent="center" mb={3}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<CloseIcon/>}
                        onClick={() => handleAnswer(false)}
                        disabled={!!swipeDirection}
                        sx={{
                            flex: 1,
                            maxWidth: 160,
                            py: 1.5,
                            backgroundColor: '#ef4444',
                            '&:hover': {
                                backgroundColor: '#dc2626',
                            },
                        }}
                    >
                        {t('dailyLearning.dontKnow')}
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<CheckIcon/>}
                        onClick={() => handleAnswer(true)}
                        disabled={!!swipeDirection}
                        sx={{
                            flex: 1,
                            maxWidth: 160,
                            py: 1.5,
                            backgroundColor: '#10b981',
                            '&:hover': {
                                backgroundColor: '#059669',
                            },
                        }}
                    >
                        {t('dailyLearning.knowIt')}
                    </Button>
                </Box>

                {/* Navigation */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Button
                        variant="text"
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                        disabled={currentIndex === 0}
                        startIcon={<BackIcon/>}
                        sx={{color: 'text.secondary'}}
                    >
                        {t('dailyLearning.previous')}
                    </Button>

                    <Tooltip
                        title={currentWord?.bookmarked ? t('dailyLearning.removeBookmark') : t('dailyLearning.bookmark')}>
                        <IconButton
                            onClick={handleToggleBookmark}
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: currentWord?.bookmarked ? '#fef3c7' : '#f5f5f4',
                                '&:hover': {
                                    backgroundColor: currentWord?.bookmarked ? '#fde68a' : '#e7e5e4',
                                },
                            }}
                        >
                            {currentWord?.bookmarked ? (
                                <StarIcon sx={{color: '#f59e0b'}}/>
                            ) : (
                                <StarBorderIcon sx={{color: '#78716c'}}/>
                            )}
                        </IconButton>
                    </Tooltip>

                    <Button
                        variant="text"
                        onClick={handleSkip}
                        disabled={isShuffling}
                        endIcon={<SkipIcon/>}
                        sx={{color: 'text.secondary'}}
                    >
                        {t('dailyLearning.skip')}
                    </Button>
                </Box>
            </Container>
        </>
    )
}
