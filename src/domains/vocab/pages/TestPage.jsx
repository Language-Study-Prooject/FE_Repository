import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    IconButton,
    LinearProgress,
    Paper,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    AutoAwesome as SparkleIcon,
    EmojiEvents as TrophyIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
    PlayArrow as PlayIcon,
    Quiz as QuizIcon,
    Timer as TimerIcon,
} from '@mui/icons-material'
import TestQuestion from '../components/TestQuestion'
import {testService} from '../services/vocabService'
import {useTranslation} from '../../../contexts/SettingsContext'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'
const QUESTION_TIME_LIMIT = 5

// Test Setup Screen
function TestSetup({onStart, recentResults, loading, t}) {
    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    mb: 4,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -30,
                        left: 30,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                    }}
                />

                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '24px',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <QuizIcon sx={{fontSize: 44, color: 'white'}}/>
                </Box>

                <Typography variant="h4" fontWeight={800} sx={{color: 'white', mb: 1}}>
                    {t('test.title')}
                </Typography>
                <Typography variant="body1" sx={{color: 'rgba(255,255,255,0.8)', mb: 4}}>
                    {t('test.subtitle')}
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <PlayIcon/>}
                    onClick={onStart}
                    disabled={loading}
                    sx={{
                        backgroundColor: 'white',
                        color: '#059669',
                        fontWeight: 700,
                        px: 5,
                        py: 1.5,
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.95)',
                        },
                    }}
                >
                    {t('test.startButton')}
                </Button>
            </Paper>

            {/* Recent Results */}
            {recentResults.length > 0 && (
                <Box>
                    <Typography variant="h6" fontWeight={700} sx={{mb: 2}}>
                        {t('test.recentResults')}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        {recentResults.map((result, index) => (
                            <Card key={result.testId || index} elevation={0} sx={{border: '1px solid #e7e5e4'}}>
                                <CardContent sx={{py: 2, px: 3, '&:last-child': {pb: 2}}}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                                {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : '-'}
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {result.totalQuestions || 0} {t('test.question')}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                borderRadius: '10px',
                                                backgroundColor:
                                                    result.successRate >= 80
                                                        ? '#ecfdf5'
                                                        : result.successRate >= 60
                                                            ? '#fff7ed'
                                                            : '#fef2f2',
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                sx={{
                                                    color:
                                                        result.successRate >= 80
                                                            ? '#059669'
                                                            : result.successRate >= 60
                                                                ? '#f97316'
                                                                : '#ef4444',
                                                }}
                                            >
                                                {result.successRate?.toFixed(0) || 0}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    )
}

// Test In Progress Screen
function TestInProgress({
                            questions,
                            currentIndex,
                            answers,
                            timeRemaining,
                            onAnswer,
                            onNext,
                            onPrev,
                            onSubmit,
                            t,
                        }) {
    const currentQuestion = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100
    const timerProgress = (timeRemaining / QUESTION_TIME_LIMIT) * 100

    if (!currentQuestion) return null

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700}>
                    {currentIndex + 1} / {questions.length}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: '12px',
                        backgroundColor: timeRemaining <= 2 ? '#fef2f2' : '#f5f5f4',
                    }}
                >
                    <TimerIcon sx={{fontSize: 20, color: timeRemaining <= 2 ? '#ef4444' : '#57534e'}}/>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{color: timeRemaining <= 2 ? '#ef4444' : '#1c1917', minWidth: 24, textAlign: 'center'}}
                    >
                        {timeRemaining}
                    </Typography>
                </Box>
            </Box>

            {/* Timer Progress */}
            <LinearProgress
                variant="determinate"
                value={timerProgress}
                sx={{
                    height: 4,
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: '#e7e5e4',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        backgroundColor: timeRemaining <= 2 ? '#ef4444' : '#059669',
                        transition: 'width 1s linear',
                    },
                }}
            />

            {/* Overall Progress */}
            <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 4,
                    backgroundColor: '#e7e5e4',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                    },
                }}
            />

            {/* Question */}
            <TestQuestion
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.wordId]}
                onSelect={(answer) => onAnswer(currentQuestion.wordId, answer)}
            />

            {/* Navigation */}
            <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                    variant="text"
                    startIcon={<PrevIcon/>}
                    onClick={onPrev}
                    disabled={currentIndex === 0}
                    sx={{color: 'text.secondary'}}
                >
                    {t('common.previous')}
                </Button>

                {currentIndex === questions.length - 1 ? (
                    <Button variant="contained" onClick={onSubmit} sx={{px: 4}}>
                        {t('common.submit')}
                    </Button>
                ) : (
                    <Button variant="contained" endIcon={<NextIcon/>} onClick={onNext} sx={{px: 4}}>
                        {t('common.next')}
                    </Button>
                )}
            </Box>

            {/* Question Indicators */}
            <Box display="flex" justifyContent="center" gap={1} mt={4} flexWrap="wrap">
                {questions.map((q, idx) => (
                    <Box
                        key={q.wordId}
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            backgroundColor: answers[q.wordId]
                                ? '#059669'
                                : idx === currentIndex
                                    ? '#10b981'
                                    : '#f5f5f4',
                            color: answers[q.wordId] || idx === currentIndex ? 'white' : '#57534e',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {answers[q.wordId] ? '✓' : idx + 1}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

// Result Screen
function TestResult({result, onRetry, onHome, t}) {
    const score = result.successRate || 0
    const isGreat = score >= 80
    const isGood = score >= 60

    return (
        <Box textAlign="center" py={4}>
            <Box
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '28px',
                    background: isGreat
                        ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                        : isGood
                            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                            : 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: isGreat
                        ? '0 16px 32px -8px rgba(251, 191, 36, 0.5)'
                        : isGood
                            ? '0 16px 32px -8px rgba(5, 150, 105, 0.4)'
                            : '0 16px 32px -8px rgba(249, 115, 22, 0.4)',
                }}
            >
                <TrophyIcon sx={{fontSize: 52, color: 'white'}}/>
            </Box>

            <Typography variant="h2" fontWeight={800} sx={{mb: 1}}>
                {score.toFixed(0)}{t('test.score')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                {result.totalQuestions || 0} {t('test.question')} / {result.correctCount || 0} {t('test.correct')}
            </Typography>

            <Paper elevation={0} sx={{p: 4, mb: 4, backgroundColor: '#fafaf9', borderRadius: '20px'}}>
                <Box display="flex" justifyContent="center" gap={6} mb={3}>
                    <Box textAlign="center">
                        <Typography variant="h3" sx={{color: '#10b981', fontWeight: 800}}>
                            {result.correctCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {t('test.correct')}
                        </Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h3" sx={{color: '#ef4444', fontWeight: 800}}>
                            {result.incorrectCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {t('test.incorrect')}
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
                        backgroundColor: isGreat ? '#fef3c7' : isGood ? '#ecfdf5' : '#fff7ed',
                    }}
                >
                    <SparkleIcon sx={{color: isGreat ? '#f59e0b' : isGood ? '#059669' : '#f97316'}}/>
                    <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{color: isGreat ? '#92400e' : isGood ? '#047857' : '#c2410c'}}
                    >
                        {isGreat ? t('test.excellent') : isGood ? t('test.good') : t('test.needPractice')}
                    </Typography>
                </Box>
            </Paper>

            {/* Wrong Answers */}
            {result.results?.filter((r) => !r.isCorrect).length > 0 && (
                <Box mb={4} textAlign="left">
                    <Typography variant="h6" fontWeight={700} sx={{mb: 2}}>
                        {t('test.reviewWrong')}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1.5}>
                        {result.results
                            .filter((r) => !r.isCorrect)
                            .map((r, idx) => (
                                <Paper
                                    key={idx}
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        border: '1px solid #fecaca',
                                        borderRadius: '14px',
                                        backgroundColor: '#fef2f2'
                                    }}
                                >
                                    <Typography variant="h6" fontWeight={700} sx={{mb: 1}}>
                                        {r.english}
                                    </Typography>
                                    <Box display="flex" gap={3}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('test.myAnswer')}
                                            </Typography>
                                            <Typography variant="body2" sx={{color: '#ef4444', fontWeight: 600}}>
                                                {r.userAnswer || t('test.noAnswer')}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('test.correctAnswer')}
                                            </Typography>
                                            <Typography variant="body2" sx={{color: '#059669', fontWeight: 600}}>
                                                {r.correctAnswer}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                    </Box>
                </Box>
            )}

            <Box display="flex" gap={2} justifyContent="center">
                <Button variant="outlined" size="large" onClick={onRetry} sx={{px: 4}}>
                    {t('test.retake')}
                </Button>
                <Button variant="contained" size="large" onClick={onHome} sx={{px: 4}}>
                    {t('test.toDashboard')}
                </Button>
            </Box>
        </Box>
    )
}

export default function TestPage() {
    const navigate = useNavigate()
    const {t} = useTranslation()
    const [phase, setPhase] = useState('setup')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [recentResults, setRecentResults] = useState([])

    const [testId, setTestId] = useState(null)
    const [questions, setQuestions] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState({})
    const [timeRemaining, setTimeRemaining] = useState(0)
    const [result, setResult] = useState(null)

    useEffect(() => {
        fetchRecentResults()
    }, [])

    useEffect(() => {
        if (phase !== 'testing' || questions.length === 0) return

        setTimeRemaining(QUESTION_TIME_LIMIT)

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (currentIndex < questions.length - 1) {
                        setCurrentIndex((idx) => idx + 1)
                    } else {
                        handleSubmit()
                    }
                    return QUESTION_TIME_LIMIT
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [phase, currentIndex, questions.length])

    const fetchRecentResults = async () => {
        try {
            const response = await testService.getResults(TEMP_USER_ID, {limit: 5})
            setRecentResults(response?.testResults || [])
        } catch (err) {
            console.error('Fetch results error:', err)
        }
    }

    const handleStart = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await testService.start(TEMP_USER_ID, 'DAILY')

            const testData = response?.data || response
            if (testData?.testId) {
                setTestId(testData.testId)
                setQuestions(testData.questions || [])
                setTimeRemaining(QUESTION_TIME_LIMIT)
                setAnswers({})
                setCurrentIndex(0)
                setPhase('testing')
            } else {
                setError('시험 데이터를 불러오지 못했습니다.')
            }
        } catch (err) {
            console.error('Start test error:', err)
            const errorMsg = err.response?.data?.message || '시험을 시작할 수 없습니다.'
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleAnswer = (wordId, answer) => {
        setAnswers((prev) => ({...prev, [wordId]: answer}))
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const answersArray = questions.map((q) => ({
                wordId: q.wordId,
                answer: answers[q.wordId] || '',
            }))

            const response = await testService.submit(TEMP_USER_ID, testId, answersArray)

            const resultData = response?.data || response
            if (resultData) {
                setResult(resultData)
                setPhase('result')
            }
        } catch (err) {
            console.error('Submit error:', err)
            setError('제출에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleRetry = () => {
        setPhase('setup')
        setTestId(null)
        setQuestions([])
        setAnswers({})
        setResult(null)
        fetchRecentResults()
    }

    return (
        <Container maxWidth="sm" sx={{pb: 6}}>
            {/* Header */}
            <Box display="flex" alignItems="center" gap={1} py={2} mb={2}>
                <IconButton onClick={() => navigate('/vocab')}>
                    <BackIcon/>
                </IconButton>
                <Typography variant="h5" fontWeight={700}>
                    {t('test.title')}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 3}} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {phase === 'setup' &&
                <TestSetup onStart={handleStart} recentResults={recentResults} loading={loading} t={t}/>}

            {phase === 'testing' && questions.length > 0 && (
                <TestInProgress
                    questions={questions}
                    currentIndex={currentIndex}
                    answers={answers}
                    timeRemaining={timeRemaining}
                    onAnswer={handleAnswer}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onSubmit={handleSubmit}
                    t={t}
                />
            )}

            {phase === 'result' && result && (
                <TestResult result={result} onRetry={handleRetry} onHome={() => navigate('/vocab')} t={t}/>
            )}
        </Container>
    )
}
