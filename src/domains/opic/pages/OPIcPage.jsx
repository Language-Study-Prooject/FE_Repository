import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    LinearProgress,
    Chip,
    Divider,
    IconButton,
} from '@mui/material'
import {
    RecordVoiceOver as VoiceIcon,
    Mic as MicIcon,
    Stop as StopIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    CheckCircle as CheckIcon,
    Send as SendIcon,
    UploadFile as UploadIcon,
    VolumeUp as SpeakerIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { useAuth } from '../../../contexts/AuthContext'
import { sessionService, uploadAudioToS3 } from '../services/opicService'
import {
    OPIC_TOPICS,
    OPIC_TOPIC_LABELS,
    OPIC_SUBTOPICS,
} from '../constants/opicConstants'

export default function OPIcPage() {
    const { t, isKorean } = useSettings()
    const { user } = useAuth()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    // Session state
    const [sessionId, setSessionId] = useState(null)
    const [sessionSettings, setSessionSettings] = useState({
        topic: OPIC_TOPICS.DESCRIPTION,
        subTopic: 'HOMES',
    })

    // Question state
    const [currentQuestion, setCurrentQuestion] = useState(null)
    const [questionNumber, setQuestionNumber] = useState(0)
    const [totalQuestions, setTotalQuestions] = useState(12)

    // Recording state
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState(null)
    const [recordedUrl, setRecordedUrl] = useState(null)
    const [mediaRecorder, setMediaRecorder] = useState(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const audioChunksRef = useRef([])

    // Upload state
    const [uploadUrl, setUploadUrl] = useState(null)
    const [s3Key, setS3Key] = useState(null)

    // Feedback state
    const [feedback, setFeedback] = useState(null)

    // UI state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    // Audio playback state
    const [isPlayingQuestion, setIsPlayingQuestion] = useState(false)
    const [isPlayingRecorded, setIsPlayingRecorded] = useState(false)
    const questionAudioRef = useRef(null)
    const recordedAudioRef = useRef(null)

    // Recording timer
    useEffect(() => {
        let interval
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } else {
            setRecordingTime(0)
        }
        return () => clearInterval(interval)
    }, [isRecording])

    // Format recording time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Create session
    const handleCreateSession = async () => {
        try {
            setLoading(true)
            setError(null)
            const userTargetLevel = user?.level || 'IM2';

            const requestData = {
                topic: sessionSettings.topic,
                subTopic: sessionSettings.subTopic,
                targetLevel: userTargetLevel
            };

            const data = await sessionService.create(requestData)

            console.log("✅ 백엔드 응답 데이터:", data);

            setSessionId(data.sessionId)
            const firstQuestionData = data.question || data.questionResponse || data.firstQuestion;

            if (firstQuestionData) {
                displayQuestion(firstQuestionData)
                setQuestionNumber(1)
            } else {
                console.error("❌ 질문 데이터가 응답에 없습니다:", data);
                setError("서버 응답에서 질문 데이터를 찾을 수 없습니다.");
            }

            if (data.totalQuestions) {
                setTotalQuestions(data.totalQuestions)
            }
        } catch (err) {
            console.error('Failed to create session:', err)
            setError(isKorean ? '세션 생성에 실패했습니다' : 'Failed to create session')
        } finally {
            setLoading(false)
        }
    }

    // Display question
    const displayQuestion = (questionData) => {
        setCurrentQuestion(questionData)
        setFeedback(null)
        setRecordedBlob(null)
        setRecordedUrl(null)
        setUploadUrl(null)
        setS3Key(null)
    }

    // Get next question
    const handleNextQuestion = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await sessionService.getNextQuestion(sessionId)

            // 모든 질문 완료 확인
            if (data.completed) {
                // 세션 완료 처리
                handleCompleteSession()
                return
            }

            // 질문 데이터로 화면 업데이트
            displayQuestion(data)  // data.question → data로 수정
            setQuestionNumber(data.questionNumber || questionNumber + 1)
            setTotalQuestions(data.totalQuestions || totalQuestions)
        } catch (err) {
            console.error('Failed to get next question:', err)
            setError(isKorean ? '다음 질문을 불러오는데 실패했습니다' : 'Failed to get next question')
        } finally {
            setLoading(false)
        }
    }

    // Toggle recording
    const toggleRecording = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const recorder = new MediaRecorder(stream, {
                    mimeType: MediaRecorder.isTypeSupported('audio/webm')
                        ? 'audio/webm'
                        : 'audio/mp4',
                })

                audioChunksRef.current = []

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data)
                    }
                }

                recorder.onstop = () => {
                    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                    setRecordedBlob(blob)
                    const url = URL.createObjectURL(blob)
                    setRecordedUrl(url)
                    stream.getTracks().forEach((track) => track.stop())
                }

                recorder.start()
                setMediaRecorder(recorder)
                setIsRecording(true)
            } catch (err) {
                console.error('Failed to start recording:', err)
                setError(isKorean ? '녹음을 시작할 수 없습니다' : 'Failed to start recording')
            }
        } else {
            if (mediaRecorder) {
                mediaRecorder.stop()
                setMediaRecorder(null)
                setIsRecording(false)
            }
        }
    }

    // Get upload URL
    const handleGetUploadUrl = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await sessionService.getUploadUrl(sessionId)
            setUploadUrl(data.uploadUrl)
            setS3Key(data.s3Key)
        } catch (err) {
            console.error('Failed to get upload URL:', err)
            setError(isKorean ? 'Upload URL 발급에 실패했습니다' : 'Failed to get upload URL')
        } finally {
            setLoading(false)
        }
    }

    // Submit answer
    const handleSubmitAnswer = async () => {
        try {
            setLoading(true)
            setError(null)
            setUploadProgress(0)

            // Upload to S3
            await uploadAudioToS3(uploadUrl, recordedBlob)
            setUploadProgress(50)

            // Submit answer
            const data = await sessionService.submitAnswer(sessionId, { audioS3Key: s3Key })
            setFeedback(data)
            setUploadProgress(100)
        } catch (err) {
            console.error('Failed to submit answer:', err)
            setError(isKorean ? '답변 제출에 실패했습니다' : 'Failed to submit answer')
        } finally {
            setLoading(false)
            setTimeout(() => setUploadProgress(0), 2000)
        }
    }



    // Complete session
    const handleCompleteSession = async () => {
        try {
            setLoading(true)
            setError(null)
            const report = await sessionService.complete(sessionId)
            // TODO: Navigate to report page or display report
            console.log('Session completed:', report)
            alert(
                isKorean
                    ? '세션이 완료되었습니다! 리포트를 확인하세요.'
                    : 'Session completed! Check your report.'
            )
            // Reset for new session
            setSessionId(null)
            setCurrentQuestion(null)
            setQuestionNumber(0)
            setFeedback(null)
        } catch (err) {
            console.error('Failed to complete session:', err)
            setError(isKorean ? '세션 완료에 실패했습니다' : 'Failed to complete session')
        } finally {
            setLoading(false)
        }
    }

    // Play question audio
    const handlePlayQuestionAudio = () => {
        if (questionAudioRef.current) {
            if (isPlayingQuestion) {
                questionAudioRef.current.pause()
                setIsPlayingQuestion(false)
            } else {
                questionAudioRef.current.play()
                setIsPlayingQuestion(true)
            }
        }
    }

    // Play recorded audio
    const handlePlayRecordedAudio = () => {
        if (recordedAudioRef.current) {
            if (isPlayingRecorded) {
                recordedAudioRef.current.pause()
                setIsPlayingRecorded(false)
            } else {
                recordedAudioRef.current.play()
                setIsPlayingRecorded(true)
            }
        }
    }

    return (
        <Box
            sx={{
                minHeight: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                borderRadius: { xs: 0, md: '20px' },
                border: { xs: 'none', md: '1px solid' },
                borderColor: 'divider',
                mx: { xs: 0, md: 3 },
                my: { xs: 0, md: 2 },
                overflow: 'auto',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: '#fafafa',
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.3)',
                    }}
                >
                    <VoiceIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {isKorean ? 'OPIc 스피킹 테스트' : 'OPIc Speaking Test'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {isKorean
                            ? 'AI 기반 OPIc 연습 및 피드백'
                            : 'AI-powered English speaking practice & feedback'}
                    </Typography>
                </Box>
            </Box>

            {/* Main Content */}
            <Box
                sx={{
                    flex: 1,
                    p: { xs: 2, md: 4 },
                    maxWidth: 800,
                    width: '100%',
                    mx: 'auto',
                }}
            >
                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {/* Session Setup */}
                {!sessionId && (
                    <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                                {isKorean ? 'OPIc 질문 생성' : 'Session Setup'}
                            </Typography>

                            {/* 주제 선택 */}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{isKorean ? '질문 유형' : 'Question Type'}</InputLabel>
                                <Select
                                    value={sessionSettings.topic}
                                    label={isKorean ? '질문 유형' : 'Question Type'}
                                    onChange={(e) =>
                                        setSessionSettings((prev) => ({
                                            ...prev,
                                            topic: e.target.value,
                                        }))
                                    }
                                >
                                    {Object.values(OPIC_TOPICS).map((topic) => (
                                        <MenuItem key={topic} value={topic}>
                                            {isKorean
                                                ? OPIC_TOPIC_LABELS[topic].ko
                                                : OPIC_TOPIC_LABELS[topic].en}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* 세부 주제 (소재) 선택 - 업데이트된 목록 사용 */}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{isKorean ? '주제' : 'Topic'}</InputLabel>
                                <Select
                                    value={sessionSettings.subTopic}
                                    label={isKorean ? '주제' : 'Topic'}
                                    onChange={(e) =>
                                        setSessionSettings((prev) => ({
                                            ...prev,
                                            subTopic: e.target.value,
                                        }))
                                    }
                                    MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }} // 목록이 기니까 스크롤
                                >
                                    {OPIC_SUBTOPICS.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {isKorean ? item.labelKo : item.labelEn}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>


                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, ml: 1 }}>
                                * {isKorean
                                    ? `프로필에 설정된 나의 레벨(${user?.level})에 맞춰 AI 피드백이 제공됩니다.`
                                    : `AI feedback will be tailored to your current level (${user?.level || 'IM2'}).`}
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleCreateSession}
                                disabled={loading}
                            // ... 스타일 유지
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : isKorean ? (
                                    '시작하기'
                                ) : (
                                    'Start Session'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Question Area */}
                {sessionId && currentQuestion && (
                    <>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                label={`${isKorean ? '질문' : 'Question'} ${questionNumber}/${totalQuestions}`}
                                color="primary"
                                sx={{ fontWeight: 600 }}
                            />
                            <LinearProgress
                                variant="determinate"
                                value={(questionNumber / totalQuestions) * 100}
                                sx={{ flex: 1, height: 8, borderRadius: 4 }}
                            />
                        </Box>

                        <Card
                            sx={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                mb: 3,
                                backgroundColor: '#e7f3ff',
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{ mb: 2, color: '#1976d2' }}
                                >
                                    {currentQuestion.questionText}
                                </Typography>

                                {currentQuestion.audioUrl && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton
                                            onClick={handlePlayQuestionAudio}
                                            sx={{
                                                backgroundColor: '#1976d2',
                                                color: 'white',
                                                '&:hover': { backgroundColor: '#1565c0' },
                                            }}
                                        >
                                            {isPlayingQuestion ? (
                                                <PauseIcon />
                                            ) : (
                                                <SpeakerIcon />
                                            )}
                                        </IconButton>
                                        <Typography variant="body2" color="text.secondary">
                                            {isKorean ? '질문 듣기' : 'Listen to question'}
                                        </Typography>
                                        <audio
                                            ref={questionAudioRef}
                                            src={currentQuestion.audioUrl}
                                            onEnded={() => setIsPlayingQuestion(false)}
                                            style={{ display: 'none' }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recording Area */}
                        <Card
                            sx={{
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                mb: 3,
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                    {isKorean ? '답변 녹음' : 'Record Answer'}
                                </Typography>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Button
                                        variant={isRecording ? 'outlined' : 'contained'}
                                        color={isRecording ? 'error' : 'primary'}
                                        size="large"
                                        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
                                        onClick={toggleRecording}
                                        disabled={feedback !== null}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            minWidth: 200,
                                            py: 1.5,
                                            animation: isRecording
                                                ? 'pulse 1.5s ease-in-out infinite'
                                                : 'none',
                                            '@keyframes pulse': {
                                                '0%, 100%': { opacity: 1 },
                                                '50%': { opacity: 0.6 },
                                            },
                                        }}
                                    >
                                        {isRecording
                                            ? isKorean
                                                ? '녹음 중지'
                                                : 'Stop Recording'
                                            : isKorean
                                                ? '녹음 시작'
                                                : 'Start Recording'}
                                    </Button>

                                    {isRecording && (
                                        <Typography variant="h6" color="error" fontWeight={600}>
                                            {formatTime(recordingTime)}
                                        </Typography>
                                    )}

                                    {recordedUrl && !isRecording && (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                width: '100%',
                                            }}
                                        >
                                            <IconButton
                                                onClick={handlePlayRecordedAudio}
                                                sx={{
                                                    backgroundColor: '#10b981',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: '#059669' },
                                                }}
                                            >
                                                {isPlayingRecorded ? <PauseIcon /> : <PlayIcon />}
                                            </IconButton>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {isKorean ? '녹음 완료' : 'Recording Ready'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {isKorean
                                                        ? '재생하여 확인하세요'
                                                        : 'Play to review'}
                                                </Typography>
                                            </Box>
                                            <audio
                                                ref={recordedAudioRef}
                                                src={recordedUrl}
                                                onEnded={() => setIsPlayingRecorded(false)}
                                                style={{ display: 'none' }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Submit Area */}
                        {recordedBlob && !feedback && (
                            <Card
                                sx={{
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    mb: 3,
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {!uploadUrl ? (
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<UploadIcon />}
                                                onClick={handleGetUploadUrl}
                                                disabled={loading}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    py: 1.5,
                                                }}
                                            >
                                                {loading
                                                    ? isKorean
                                                        ? '준비 중...'
                                                        : 'Preparing...'
                                                    : isKorean
                                                        ? 'Upload URL 발급'
                                                        : 'Get Upload URL'}
                                            </Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                startIcon={<SendIcon />}
                                                onClick={handleSubmitAnswer}
                                                disabled={loading}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    py: 1.5,
                                                }}
                                            >
                                                {loading
                                                    ? isKorean
                                                        ? '제출 중...'
                                                        : 'Submitting...'
                                                    : isKorean
                                                        ? '답변 제출'
                                                        : 'Submit Answer'}
                                            </Button>
                                        )}
                                    </Box>
                                    {uploadProgress > 0 && (
                                        <LinearProgress
                                            variant="determinate"
                                            value={uploadProgress}
                                            sx={{ mt: 2, borderRadius: 4, height: 6 }}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Feedback Area */}
                        {feedback && (
                            <Card
                                sx={{
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    mb: 3,
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                                        {isKorean ? 'AI 피드백' : 'AI Feedback'}
                                    </Typography>

                                    {/* My Answer (STT) */}
                                    {feedback.transcript && (
                                        <Box sx={{ mb: 2, p: 2, borderRadius: '8px', backgroundColor: '#f3f4f6' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                {isKorean ? '내 답변' : 'Your Answer'}
                                            </Typography>
                                            <Typography variant="body2">{feedback.transcript}</Typography>
                                        </Box>
                                    )}

                                    {/* Corrected Answer */}
                                    {feedback.feedback?.correctedAnswer && (
                                        <Box sx={{ mb: 2, p: 2, borderRadius: '8px', backgroundColor: '#fef3c7' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                {isKorean ? '교정된 답변' : 'Corrected Answer'}
                                            </Typography>
                                            <Typography variant="body2">{feedback.feedback.correctedAnswer}</Typography>
                                        </Box>
                                    )}

                                    {/* Model Answer */}
                                    {feedback.feedback?.sampleAnswer && (
                                        <Box sx={{ mb: 2, p: 2, borderRadius: '8px', backgroundColor: '#dcfce7' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                {isKorean ? '모범 답변' : 'Model Answer'}
                                            </Typography>
                                            <Typography variant="body2">{feedback.feedback.sampleAnswer}</Typography>
                                        </Box>
                                    )}

                                    {/* Grammar Errors */}
                                    {feedback.feedback?.errors && feedback.feedback.errors.length > 0 && (
                                        <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#fee2e2' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                {isKorean ? '문법 오류' : 'Grammar Errors'}
                                            </Typography>
                                            {feedback.feedback.errors.map((error, index) => (
                                                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                                    • <strong>{error.type}</strong>: {error.original} → {error.corrected}
                                                    <br />
                                                    <Typography component="span" variant="caption" color="text.secondary">
                                                        {error.explanation}
                                                    </Typography>
                                                </Typography>
                                            ))}
                                        </Box>
                                    )}


                                    <Divider sx={{ my: 3 }} />

                                    {/* Action Buttons */}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {feedback.hasNextQuestion ? (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={handleNextQuestion}
                                                disabled={loading}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    py: 1.5,
                                                }}
                                            >
                                                {isKorean ? '다음 질문' : 'Next Question'}
                                            </Button>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="success"
                                                startIcon={<CheckIcon />}
                                                onClick={handleCompleteSession}
                                                disabled={loading}
                                                sx={{
                                                    borderRadius: '12px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    py: 1.5,
                                                }}
                                            >
                                                {loading
                                                    ? isKorean
                                                        ? '완료 중...'
                                                        : 'Completing...'
                                                    : isKorean
                                                        ? '세션 완료'
                                                        : 'Complete Session'}
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </Box>
        </Box>
    )
}
