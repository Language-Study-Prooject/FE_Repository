import { useState, useRef, useEffect } from 'react'
import {
    Box,
    IconButton,
    TextField,
    Tooltip,
    FormControl,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
} from '@mui/material'
import {
    Mic as MicIcon,
    Stop as StopIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import {
    SPEAKING_LEVELS,
    SPEAKING_LEVEL_COLORS,
    SPEAKING_LEVEL_LABELS,
    AUDIO_CONFIG,
} from '../constants/speakingConstants'

export default function SpeakingInput({
    onSendVoice,
    onSendText,
    onLevelChange,
    onReset,
    loading = false,
    level = SPEAKING_LEVELS.INTERMEDIATE,
}) {
    const { isKorean } = useSettings()
    const [message, setMessage] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)

    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const timerRef = useRef(null)

    // 녹음 타이머
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev >= AUDIO_CONFIG.MAX_DURATION / 1000) {
                        stopRecording()
                        return 0
                    }
                    return prev + 1
                })
            }, 1000)
        } else {
            clearInterval(timerRef.current)
            setRecordingTime(0)
        }

        return () => clearInterval(timerRef.current)
    }, [isRecording])

    /**
     * 녹음 시작
     */
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                }
            })
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: AUDIO_CONFIG.MIME_TYPE || 'audio/webm;codecs=opus',
                audioBitsPerSecond: 16000,
            })

            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: AUDIO_CONFIG.MIME_TYPE,
                })

                // 용량 확인용 로그 WㅉWWWWWWWs
                console.log(`[Recording] Final size: ${audioBlob.size} bytes`);

                // Blob → Base64 변환
                const reader = new FileReader()
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1]
                    onSendVoice?.(base64)
                }
                reader.readAsDataURL(audioBlob)

                // 스트림 정리
                stream.getTracks().forEach((track) => track.stop())
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Microphone access denied:', error)
            alert(isKorean ? '마이크 접근이 거부되었습니다.' : 'Microphone access denied.')
        }
    }

    /**
     * 녹음 중지
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    /**
     * 텍스트 전송
     */
    const handleSendText = () => {
        console.log('[SpeakingInput] handleSendText called, message:', message)
        if (message.trim().length < 2 || loading) {
            console.log('[SpeakingInput] Blocked - length or loading')
            return
        }
        console.log('[SpeakingInput] Calling onSendText')
        onSendText?.(message.trim())
        setMessage('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendText()
        }
    }

    const levelOptions = Object.values(SPEAKING_LEVELS).map((value) => ({
        value,
        label: isKorean
            ? SPEAKING_LEVEL_LABELS.ko[value]
            : SPEAKING_LEVEL_LABELS.en[value],
    }))

    return (
        <Box
            sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#fff',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    maxWidth: 900,
                    mx: 'auto',
                }}
            >
                {/* Level Selector */}
                <FormControl size="small" sx={{ minWidth: 90 }}>
                    <Select
                        value={level}
                        onChange={(e) => onLevelChange?.(e.target.value)}
                        disabled={loading || isRecording}
                        sx={{
                            '& .MuiSelect-select': {
                                color: SPEAKING_LEVEL_COLORS[level],
                                fontWeight: 600,
                            },
                        }}
                    >
                        {levelOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* 녹음 버튼 */}
                <Box sx={{ position: 'relative' }}>
                    <Tooltip
                        title={
                            isRecording
                                ? isKorean ? '녹음 중지' : 'Stop Recording'
                                : isKorean ? '음성 녹음' : 'Voice Record'
                        }
                    >
                        <IconButton
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={loading}
                            sx={{
                                backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: isRecording ? '#dc2626' : '#2563eb',
                                },
                                '&:disabled': {
                                    backgroundColor: '#9ca3af',
                                },
                            }}
                        >
                            {isRecording ? <StopIcon /> : <MicIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* 녹음 시간 표시 */}
                    {isRecording && (
                        <Typography
                            variant="caption"
                            sx={{
                                position: 'absolute',
                                bottom: -20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: '#ef4444',
                                fontWeight: 600,
                            }}
                        >
                            {recordingTime}s
                        </Typography>
                    )}
                </Box>

                {/* 텍스트 입력 */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder={
                        isKorean
                            ? '영어로 말해보세요... (또는 타이핑)'
                            : 'Speak in English... (or type)'
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading || isRecording}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                        },
                    }}
                />

                {/* 전송 버튼 */}
                <Tooltip title={isKorean ? '전송' : 'Send'}>
                    <span>
                        <IconButton
                            onClick={handleSendText}
                            disabled={loading || isRecording || message.trim().length < 2}
                            sx={{
                                backgroundColor: '#10b981',
                                color: '#fff',
                                '&:hover': { backgroundColor: '#059669' },
                                '&:disabled': { backgroundColor: '#d1d5db' },
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                <SendIcon />
                            )}
                        </IconButton>
                    </span>
                </Tooltip>

                {/* 대화 초기화 버튼 */}
                <Tooltip title={isKorean ? '대화 초기화' : 'Reset Conversation'}>
                    <IconButton
                        onClick={onReset}
                        disabled={loading || isRecording}
                        sx={{ color: '#6b7280' }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    )
}