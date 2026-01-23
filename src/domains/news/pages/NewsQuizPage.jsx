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
    LinearProgress,
    Typography,
} from '@mui/material'
import {
    ArrowBack as BackIcon,
    ArrowForward as NextIcon,
    CheckCircle as CorrectIcon,
    Cancel as WrongIcon,
    Timer as TimerIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { getQuiz, submitQuiz } from '../services/newsService'

const QUIZ_TYPE_LABELS = {
    COMPREHENSION: { ko: '독해력', en: 'Comprehension' },
    WORD_MATCH: { ko: '단어 매칭', en: 'Word Match' },
    FILL_BLANK: { ko: '빈칸 채우기', en: 'Fill Blank' },
}

const NewsQuizPage = () => {
    const { articleId } = useParams()
    const navigate = useNavigate()
    const { isKorean } = useSettings()
    const timerRef = useRef(null)

    const [quizData, setQuizData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState({})
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showFeedback, setShowFeedback] = useState(false)
    const [timeElapsed, setTimeElapsed] = useState(0)
    const [quizResult, setQuizResult] = useState(null)

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true)
                const response = await getQuiz(articleId)
                setQuizData(response.data)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch quiz:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (articleId) {
            fetchQuiz()
        }
    }, [articleId])

    // Timer
    useEffect(() => {
        if (!loading && !quizResult) {
            timerRef.current = setInterval(() => {
                setTimeElapsed(prev => prev + 1)
            }, 1000)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [loading, quizResult])

    const handleSelectAnswer = (answer) => {
        if (showFeedback) return
        setSelectedAnswer(answer)
    }

    const handleNext = () => {
        if (!selectedAnswer) return

        const question = quizData.questions[currentQuestion]
        setAnswers(prev => ({
            ...prev,
            [question.questionId]: selectedAnswer,
        }))

        if (currentQuestion < quizData.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            setSelectedAnswer(answers[quizData.questions[currentQuestion + 1]?.questionId] || null)
            setShowFeedback(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedAnswer) return

        const question = quizData.questions[currentQuestion]
        const finalAnswers = {
            ...answers,
            [question.questionId]: selectedAnswer,
        }

        const answersArray = Object.entries(finalAnswers).map(([questionId, answer]) => ({
            questionId,
            answer,
        }))

        try {
            setSubmitting(true)
            clearInterval(timerRef.current)

            const response = await submitQuiz(articleId, answersArray, timeElapsed)
            setQuizResult(response.data)
        } catch (err) {
            console.error('Failed to submit quiz:', err)
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
            </Container>
        )
    }

    if (error || !quizData) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="error">{error || 'Quiz not found'}</Typography>
                <Button onClick={() => navigate(`/news/${articleId}`)} sx={{ mt: 2 }}>
                    {isKorean ? '기사로 돌아가기' : 'Back to article'}
                </Button>
            </Container>
        )
    }

    // 퀴즈 결과 화면
    if (quizResult) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        {isKorean ? '퀴즈 완료!' : 'Quiz Complete!'}
                    </Typography>

                    {/* Score Circle */}
                    <Box
                        sx={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            background: quizResult.score >= 80
                                ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'
                                : quizResult.score >= 60
                                    ? 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)'
                                    : 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            my: 4,
                            boxShadow: '0 12px 24px -8px rgba(0,0,0,0.2)',
                        }}
                    >
                        <Typography variant="h2" fontWeight={800} color="white">
                            {quizResult.score}
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.8)">
                            / {quizResult.totalPoints}
                        </Typography>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 4 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight={700} color="#10B981">
                                {quizResult.results.filter(r => r.correct).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '정답' : 'Correct'}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight={700} color="#EF4444">
                                {quizResult.results.filter(r => !r.correct).length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '오답' : 'Incorrect'}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h5" fontWeight={700}>
                                {formatTime(timeElapsed)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isKorean ? '소요 시간' : 'Time'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* New Badges */}
                    {quizResult.newBadges?.length > 0 && (
                        <Card sx={{ borderRadius: '16px', mb: 4, backgroundColor: '#FEF3C7' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="subtitle1" fontWeight={700} color="#F59E0B" gutterBottom>
                                    {isKorean ? '새 뱃지 획득!' : 'New Badge Earned!'}
                                </Typography>
                                {quizResult.newBadges.map((badge, index) => (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="h4">🏆</Typography>
                                        <Box>
                                            <Typography fontWeight={600}>{badge.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {badge.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </Box>

                {/* Results Detail */}
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    {isKorean ? '문제별 결과' : 'Question Results'}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                    {quizResult.results.map((result, index) => (
                        <Card
                            key={index}
                            sx={{
                                borderRadius: '12px',
                                border: '2px solid',
                                borderColor: result.correct ? '#10B981' : '#EF4444',
                            }}
                        >
                            <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                {result.correct ? (
                                    <CorrectIcon sx={{ color: '#10B981', fontSize: 28 }} />
                                ) : (
                                    <WrongIcon sx={{ color: '#EF4444', fontSize: 28 }} />
                                )}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Q{index + 1}
                                    </Typography>
                                    <Typography fontWeight={600}>
                                        {result.correctAnswer}
                                    </Typography>
                                    {!result.correct && result.userAnswer && (
                                        <Typography variant="body2" color="error">
                                            {isKorean ? '내 답:' : 'Your answer:'} {result.userAnswer}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate(`/news/${articleId}`)}
                        sx={{ borderRadius: '12px', py: 1.5 }}
                    >
                        {isKorean ? '기사로 돌아가기' : 'Back to Article'}
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate('/news')}
                        sx={{ borderRadius: '12px', py: 1.5 }}
                    >
                        {isKorean ? '뉴스 목록' : 'News List'}
                    </Button>
                </Box>
            </Container>
        )
    }

    const question = quizData.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / quizData.questions.length) * 100
    const earnedPoints = Object.keys(answers).length * 20

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate(`/news/${articleId}`)}
                    sx={{ color: 'text.secondary' }}
                >
                    {isKorean ? '종료' : 'Exit'}
                </Button>

                <Typography variant="subtitle1" fontWeight={600}>
                    {currentQuestion + 1} / {quizData.questions.length}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimerIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography fontWeight={600}>{formatTime(timeElapsed)}</Typography>
                </Box>
            </Box>

            {/* Progress */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            flex: 1,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)',
                            },
                        }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" textAlign="right">
                    {earnedPoints} / {quizData.totalPoints} {isKorean ? '점' : 'pts'}
                </Typography>
            </Box>

            {/* Question */}
            <Card sx={{ borderRadius: '16px', mb: 4 }}>
                <CardContent sx={{ p: 4 }}>
                    <Chip
                        label={isKorean ? QUIZ_TYPE_LABELS[question.type]?.ko : QUIZ_TYPE_LABELS[question.type]?.en}
                        size="small"
                        sx={{
                            mb: 2,
                            backgroundColor: '#EFF6FF',
                            color: '#3B82F6',
                            fontWeight: 600,
                        }}
                    />

                    <Typography variant="h6" fontWeight={700} sx={{ mb: 4, lineHeight: 1.6 }}>
                        {question.question}
                    </Typography>

                    {/* Options */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {question.options.map((option, index) => {
                            const isSelected = selectedAnswer === option
                            const optionLabels = ['A', 'B', 'C', 'D']

                            return (
                                <Card
                                    key={index}
                                    onClick={() => handleSelectAnswer(option)}
                                    sx={{
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: isSelected ? '#3B82F6' : 'transparent',
                                        backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: isSelected ? '#3B82F6' : '#E5E7EB',
                                            backgroundColor: isSelected ? '#EFF6FF' : '#F3F4F6',
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '8px',
                                                backgroundColor: isSelected ? '#3B82F6' : '#E5E7EB',
                                                color: isSelected ? 'white' : 'text.secondary',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: 14,
                                            }}
                                        >
                                            {optionLabels[index]}
                                        </Box>
                                        <Typography fontWeight={isSelected ? 600 : 500}>
                                            {option}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </Box>
                </CardContent>
            </Card>

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {currentQuestion < quizData.questions.length - 1 ? (
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<NextIcon />}
                        onClick={handleNext}
                        disabled={!selectedAnswer}
                        sx={{
                            borderRadius: '12px',
                            px: 6,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                        }}
                    >
                        {isKorean ? '다음' : 'Next'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!selectedAnswer || submitting}
                        sx={{
                            borderRadius: '12px',
                            px: 6,
                            py: 1.5,
                            background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : (isKorean ? '제출' : 'Submit')}
                    </Button>
                )}
            </Box>
        </Container>
    )
}

export default NewsQuizPage
