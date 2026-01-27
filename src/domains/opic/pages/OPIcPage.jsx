import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    Grid,
    Paper
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
    Home as HomeIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
    Lightbulb as LightbulbIcon,
    Email as EmailIcon
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { useAuth } from '../../../contexts/AuthContext'
import { sessionService, uploadAudioToS3, pollForAnswerResult } from '../services/opicService'
import {
    OPIC_TOPICS,
    OPIC_TOPIC_LABELS,
    OPIC_SUBTOPICS,
} from '../constants/opicConstants'

export default function OPIcPage() {
    const { t, isKorean } = useSettings()
    const { user } = useAuth()
    const theme = useTheme()
    const navigate = useNavigate()
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
    const [processingStatus, setProcessingStatus] = useState(null)

    // Upload state
    const [uploadUrl, setUploadUrl] = useState(null)
    const [s3Key, setS3Key] = useState(null)

    // Feedback state
    const [feedback, setFeedback] = useState(null)

    // Report state
    const [sessionReport, setSessionReport] = useState(null)
    const [showReport, setShowReport] = useState(false)

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
        setProcessingStatus(null)
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
                await handleCompleteSession()
                return
            }

            if (data.question) {
                displayQuestion(data.question)

                // 질문 번호 업데이트 (백엔드에서 오는 questionNumber가 있으면 사용, 없으면 수동 계산)
                setQuestionNumber(data.question.questionNumber || questionNumber + 1)
            } else {
                console.error("❌ 질문 데이터를 찾을 수 없습니다:", data)
                setError(isKorean ? '질문 데이터를 불러오지 못했습니다' : 'Failed to load question data')
            }
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
            setProcessingStatus(isKorean ? 'S3에 업로드 중...' : 'Uploading to S3...')

            // 1. S3 업로드
            await uploadAudioToS3(uploadUrl, recordedBlob)
            setUploadProgress(20)
            setProcessingStatus(isKorean ? '답변 제출 중...' : 'Submitting...')

            // 2. 답변 제출 (비동기 처리 시작 요청)
            const submitResult = await sessionService.submitAnswer(sessionId, { audioS3Key: s3Key })
            setUploadProgress(40)
            setProcessingStatus(isKorean ? 'AI가 분석 중...' : 'AI is analyzing...')

            // 3. 폴링으로 결과 대기 (백엔드 완료될 때까지 반복 확인)
            const result = await pollForAnswerResult(sessionId, submitResult.questionIndex, {
                onProgress: ({ attempt }) => {
                    // 진행 상황에 따라 프로그레스 바를 조금씩 채움 (40% ~ 90%)
                    setUploadProgress(prev => Math.min(prev + 1, 90))
                }
            })

            // 4. 최종 결과 세팅
            setFeedback(result)
            setUploadProgress(100)
            setProcessingStatus(null)

        } catch (err) {
            console.error('Failed to submit answer:', err)
            setError(isKorean ? '분석 중 오류가 발생했습니다. 다시 시도해주세요.' : 'Analysis failed. Please try again.')
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

            const reportData = report.data || report;

            // 리포트 데이터 저장 및 화면 전환
            setSessionReport(reportData)
            setShowReport(true)
        } catch (err) {
            console.error('Failed to complete session:', err)
            setError(isKorean ? '세션 완료에 실패했습니다' : 'Failed to complete session')
        } finally {
            setLoading(false)
        }
    }

    const handleStartNewSession = () => {
        setSessionId(null)
        setCurrentQuestion(null)
        setQuestionNumber(0)
        setFeedback(null)
        setShowReport(false)
        setSessionReport(null)
        setRecordedBlob(null)
        setRecordedUrl(null)
        setUploadUrl(null)
        setS3Key(null)
    }

    // Navigate to reports page
    const handleGoToReports = () => {
        navigate('/reports')
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

    const getLevelColor = (level) => {
        const colors = {
            'IM1': '#22c55e', 'IM2': '#3b82f6', 'IM3': '#8b5cf6',
            'IH': '#f97316', 'AL': '#ef4444'
        };
        return colors[level] || '#3b82f6';
    }

    // 결과 리포트 화면
    if (showReport && sessionReport) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: '1px solid #e0e0e0', bgcolor: '#fff' }}>

                    {/* Header: Score & Level */}
                    <Box sx={{ textAlign: 'center', mb: 5 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5, fontWeight: 600 }}>
                            {isKorean ? '테스트 결과 리포트' : 'TEST REPORT'}
                        </Typography>

                        <Box sx={{ mt: 3, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                            {/* Level */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h2" fontWeight={800} color="primary.main" sx={{ lineHeight: 1, mb: 0.5 }}>
                                    {sessionReport.estimatedLevel}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1 }}>LEVEL</Typography>
                            </Box>

                            <Divider orientation="vertical" flexItem sx={{ height: 40, alignSelf: 'center', bgcolor: '#e0e0e0' }} />

                            {/* Score */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h2" fontWeight={800} color="text.primary" sx={{ lineHeight: 1, mb: 0.5 }}>
                                    {sessionReport.overallScore}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1 }}>SCORE</Typography>
                            </Box>
                        </Box>

                        {/* Overall Feedback */}
                        <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 3, textAlign: 'left', border: '1px solid #f1f5f9' }}>
                            <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#334155' }}>
                                {sessionReport.feedback}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

                    {/* Details Grid */}
                    <Grid container spacing={4}>
                        {[
                            { title: isKorean ? "잘한 점" : "Strengths", items: sessionReport.strengths, color: "#16a34a", icon: TrendingUpIcon },
                            { title: isKorean ? "아쉬운 점" : "Weaknesses", items: sessionReport.weaknesses, color: "#ea580c", icon: WarningIcon },
                            { title: isKorean ? "학습 추천" : "Tips", items: sessionReport.recommendations, color: "#7c3aed", icon: LightbulbIcon }
                        ].map((section, idx) => (
                            <Grid item xs={12} md={4} key={idx}>
                                <Paper elevation={0} sx={{ p: 2, height: '100%', border: `1px solid ${section.color}`, borderRadius: 3, bgcolor: `${section.color}0d` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <section.icon sx={{ color: section.color }} />
                                        <Typography variant="h6" fontWeight={700} color={section.color}>
                                            {section.title}
                                        </Typography>
                                    </Box>
                                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                        {section.items && section.items.length > 0 ? (
                                            section.items.map((item, i) => (
                                                <Typography component="li" key={i} variant="body2" sx={{ mb: 1, color: '#334155' }}>
                                                    {item}
                                                </Typography>
                                            ))
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">-</Typography>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Email Notification */}
                    <Box sx={{ mt: 5, textAlign: 'center' }}>
                        <Chip
                            icon={<EmailIcon style={{ fontSize: 16 }} />}
                            label={isKorean ? "결과가 이메일로 발송되었습니다." : "Report sent to your email."}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: '#e2e8f0', color: '#94a3b8', fontSize: '0.8rem' }}
                        />
                    </Box>
                </Paper>

                {/* Bottom Actions */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        onClick={() => navigate('/')}
                        sx={{ color: '#64748b' }}
                    >
                        {isKorean ? '나가기' : 'Exit'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleStartNewSession}
                        disableElevation
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            bgcolor: '#0f172a',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#1e293b' }
                        }}
                    >
                        {isKorean ? '새 테스트 시작' : 'Start New Test'}
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{
            minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', backgroundColor: '#fff',
            borderRadius: { xs: 0, md: '20px' }, border: { xs: 'none', md: '1px solid' }, borderColor: 'divider',
            mx: { xs: 0, md: 3 }, my: { xs: 0, md: 2 }, overflow: 'auto',
        }}>

            {/* Header */}
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#fafafa' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.3)' }}>
                    <VoiceIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700}>{isKorean ? 'OPIc 스피킹 테스트' : 'OPIc Speaking Test'}</Typography>
                    <Typography variant="caption" color="text.secondary">{isKorean ? 'AI 기반 OPIc 연습 및 피드백' : 'AI-powered English speaking practice'}</Typography>
                </Box>
            </Box>

            {/* Main Content */}
            <Box sx={{ flex: 1, p: { xs: 2, md: 4 }, maxWidth: 800, width: '100%', mx: 'auto' }}>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

                {/* --- [1] Session Setup --- */}
                {!sessionId && (
                    <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>{isKorean ? 'OPIc 질문 생성' : 'Session Setup'}</Typography>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{isKorean ? '질문 유형' : 'Question Type'}</InputLabel>
                                <Select value={sessionSettings.topic} label={isKorean ? '질문 유형' : 'Question Type'} onChange={(e) => setSessionSettings((prev) => ({ ...prev, topic: e.target.value }))}>
                                    {Object.values(OPIC_TOPICS).map((topic) => (
                                        <MenuItem key={topic} value={topic}>{isKorean ? OPIC_TOPIC_LABELS[topic].ko : OPIC_TOPIC_LABELS[topic].en}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>{isKorean ? '주제' : 'Topic'}</InputLabel>
                                <Select value={sessionSettings.subTopic} label={isKorean ? '주제' : 'Topic'} onChange={(e) => setSessionSettings((prev) => ({ ...prev, subTopic: e.target.value }))} MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}>
                                    {OPIC_SUBTOPICS.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>{isKorean ? item.labelKo : item.labelEn}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, ml: 1 }}>
                                * {isKorean ? `프로필에 설정된 나의 레벨(${user?.level || 'IM2'})에 맞춰 AI 피드백이 제공됩니다.` : `AI feedback tailored to level (${user?.level || 'IM2'}).`}
                            </Typography>

                            <Button fullWidth variant="contained" size="large" onClick={handleCreateSession} disabled={loading} sx={{ borderRadius: '12px', py: 1.5 }}>
                                {loading ? <CircularProgress size={24} color="inherit" /> : isKorean ? '시작하기' : 'Start Session'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* --- [2] Question Area --- */}
                {sessionId && currentQuestion && (
                    <>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip label={`${isKorean ? '질문' : 'Question'} ${questionNumber}/${totalQuestions}`} color="primary" sx={{ fontWeight: 600 }} />
                            <LinearProgress variant="determinate" value={(questionNumber / totalQuestions) * 100} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                        </Box>

                        {/* 질문 카드 */}
                        <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3, backgroundColor: '#e7f3ff' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#1976d2', whiteSpace: 'pre-line' }}>{currentQuestion.questionText}</Typography>
                                {currentQuestion.audioUrl && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconButton onClick={handlePlayQuestionAudio} sx={{ backgroundColor: '#1976d2', color: 'white', '&:hover': { backgroundColor: '#1565c0' } }}>
                                            {isPlayingQuestion ? <PauseIcon /> : <SpeakerIcon />}
                                        </IconButton>
                                        <Typography variant="body2" color="text.secondary">{isKorean ? '질문 듣기' : 'Listen'}</Typography>
                                        <audio ref={questionAudioRef} src={currentQuestion.audioUrl} onEnded={() => setIsPlayingQuestion(false)} style={{ display: 'none' }} />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* 녹음 카드 */}
                        <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{isKorean ? '답변 녹음' : 'Record Answer'}</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <Button variant={isRecording ? 'outlined' : 'contained'} color={isRecording ? 'error' : 'primary'} size="large" startIcon={isRecording ? <StopIcon /> : <MicIcon />} onClick={toggleRecording} disabled={feedback !== null} sx={{ borderRadius: '12px', minWidth: 200, py: 1.5, animation: isRecording ? 'pulse 1.5s infinite' : 'none', '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } } }}>
                                        {isRecording ? (isKorean ? '녹음 중지' : 'Stop') : (isKorean ? '녹음 시작' : 'Start Recording')}
                                    </Button>
                                    {isRecording && <Typography variant="h6" color="error" fontWeight={600}>{formatTime(recordingTime)}</Typography>}
                                    {recordedUrl && !isRecording && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            <IconButton onClick={handlePlayRecordedAudio} sx={{ backgroundColor: '#10b981', color: 'white', '&:hover': { backgroundColor: '#059669' } }}>
                                                {isPlayingRecorded ? <PauseIcon /> : <PlayIcon />}
                                            </IconButton>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>{isKorean ? '녹음 완료' : 'Recorded'}</Typography>
                                            </Box>
                                            <audio ref={recordedAudioRef} src={recordedUrl} onEnded={() => setIsPlayingRecorded(false)} style={{ display: 'none' }} />
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* 제출 버튼 영역 */}
                        {recordedBlob && !feedback && (
                            <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {!uploadUrl ? (
                                            <Button fullWidth variant="outlined" startIcon={<UploadIcon />} onClick={handleGetUploadUrl} disabled={loading} sx={{ borderRadius: '12px', py: 1.5 }}>
                                                {loading ? 'Preparing...' : isKorean ? '업로드 준비' : 'Prepare Upload'}
                                            </Button>
                                        ) : (
                                            <Button fullWidth variant="contained" color="success" startIcon={<SendIcon />} onClick={handleSubmitAnswer} disabled={loading} sx={{ borderRadius: '12px', py: 1.5 }}>
                                                {loading ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CircularProgress size={20} color="inherit" />
                                                        <span>{processingStatus || (isKorean ? '처리 중...' : 'Processing...')}</span>
                                                    </Box>
                                                ) : isKorean ? '제출하기' : 'Submit'}
                                            </Button>
                                        )}
                                    </Box>
                                    {uploadProgress > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 4, height: 6 }} />
                                            {processingStatus && (
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}>
                                                    {processingStatus}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* 피드백 및 다음 질문 버튼 */}
                        {feedback && (
                            <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', mb: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>AI Feedback</Typography>

                                    {feedback.transcript && (
                                        <Box sx={{ mb: 2, p: 2, borderRadius: '8px', backgroundColor: '#f3f4f6' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{isKorean ? '내 답변' : 'Your Answer'}</Typography>
                                            <Typography variant="body2">{feedback.transcript}</Typography>
                                        </Box>
                                    )}

                                    {feedback.feedback?.correctedAnswer && (
                                        <Box sx={{ mb: 2, p: 2, borderRadius: '8px', backgroundColor: '#fef3c7' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{isKorean ? '교정된 답변' : 'Corrected'}</Typography>
                                            <Typography variant="body2">{feedback.feedback.correctedAnswer}</Typography>
                                        </Box>
                                    )}
                                    {feedback.feedback?.errors && feedback.feedback.errors.length > 0 && (
                                        <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#fee2e2', mb: 2, border: '1px solid #fca5a5' }}>
                                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: '#991b1b' }}>
                                                {isKorean ? ' 문법 오류 체크' : 'Grammar Errors'}
                                            </Typography>
                                            {feedback.feedback.errors.map((error, index) => (
                                                <Box key={index} sx={{ mb: 1 }}>
                                                    <Typography variant="body2" sx={{ color: '#b91c1c' }}>
                                                        • <strong>{error.original}</strong> → <strong>{error.corrected}</strong>
                                                    </Typography>
                                                    {error.explanation && (
                                                        <Typography variant="caption" sx={{ display: 'block', color: '#7f1d1d', ml: 2 }}>
                                                            └ {error.explanation}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}

                                    {(feedback.feedback?.grammarCorrection || feedback.feedback?.feedback) && (
                                        <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <LightbulbIcon sx={{ fontSize: 18, color: '#0284c7' }} />
                                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#0369a1' }}>
                                                    {isKorean ? ' AI 학습 팁 & 문법 교정' : 'Tips & Grammar Correction'}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#0c4a6e', lineHeight: 1.6 }}>
                                                {/* grammarCorrection이 있으면 우선 보여주고, 없으면 전체 feedback을 보여줌 */}
                                                {feedback.feedback.grammarCorrection || feedback.feedback.feedback}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 3 }} />

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {/* 마지막 질문이 아니면 '다음 질문' 버튼, 마지막 질문이면 '세션 완료' 버튼 */}
                                        {questionNumber < totalQuestions ? (
                                            <Button fullWidth variant="contained" onClick={handleNextQuestion} disabled={loading} sx={{ borderRadius: '12px', py: 1.5 }}>
                                                {isKorean ? '다음 질문' : 'Next Question'}
                                            </Button>
                                        ) : (
                                            <Button fullWidth variant="contained" color="success" startIcon={<CheckIcon />} onClick={handleCompleteSession} disabled={loading} sx={{ borderRadius: '12px', py: 1.5 }}>
                                                {loading ? (isKorean ? '완료 중...' : 'Completing...') : (isKorean ? '결과 보기' : 'View Results')}
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
    );
}

