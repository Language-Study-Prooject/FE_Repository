import { useState, useRef } from 'react'
import { Avatar, Box, IconButton, Typography, Tooltip, keyframes } from '@mui/material'
import {
    Person as PersonIcon,
    SmartToy as AiIcon,
    VolumeUp as VolumeUpIcon,
    Stop as StopIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`

export default function SpeakingChatMessage({ message, isUser = false }) {
    const { isKorean } = useSettings()
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef(null)

    const {
        content,
        userTranscript,
        aiText,
        aiAudioUrl,
        confidence,
    } = message

    const displayText = isUser ? (userTranscript || content) : (aiText || content)

    /**
     * AI 응답 음성 재생
     */
    const playAudio = () => {
        if (!aiAudioUrl) return

        if (audioRef.current) {
            audioRef.current.pause()
        }

        const audio = new Audio(aiAudioUrl)
        audioRef.current = audio

        audio.onplay = () => setIsPlaying(true)
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
            setIsPlaying(false)
            console.error('Audio playback error')
        }

        audio.play()
    }

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            setIsPlaying(false)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 1.5,
                mb: 2,
                flexDirection: isUser ? 'row-reverse' : 'row',
            }}
        >
            {/* 아바타 */}
            <Avatar
                sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: isUser ? '#3b82f6' : '#10b981',
                }}
            >
                {isUser ? <PersonIcon /> : <AiIcon />}
            </Avatar>

            {/* 메시지 내용 */}
            <Box sx={{ maxWidth: '70%' }}>
                {/* 역할 라벨 */}
                <Typography
                    variant="caption"
                    sx={{
                        color: '#6b7280',
                        mb: 0.5,
                        display: 'block',
                        textAlign: isUser ? 'right' : 'left',
                    }}
                >
                    {isUser
                        ? (isKorean ? '나' : 'You')
                        : 'Amy (AI)'}
                </Typography>

                {/* 메시지 버블 */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: '16px',
                        backgroundColor: isUser ? '#3b82f6' : '#f3f4f6',
                        color: isUser ? '#fff' : '#374151',
                        borderTopRightRadius: isUser ? 4 : 16,
                        borderTopLeftRadius: isUser ? 16 : 4,
                    }}
                >
                    <Typography sx={{ fontSize: '1rem', lineHeight: 1.6 }}>
                        {displayText}
                    </Typography>

                    {/* STT 신뢰도 표시 (사용자 메시지) */}
                    {isUser && confidence && (
                        <Typography
                            variant="caption"
                            sx={{ opacity: 0.7, mt: 1, display: 'block' }}
                        >
                            {isKorean ? '인식률' : 'Confidence'}: {Math.round(confidence * 100)}%
                        </Typography>
                    )}
                </Box>

                {/* AI 응답 음성 재생 버튼 */}
                {!isUser && aiAudioUrl && (
                    <Box sx={{ mt: 1 }}>
                        <Tooltip
                            title={
                                isPlaying
                                    ? (isKorean ? '정지' : 'Stop')
                                    : (isKorean ? '음성 듣기' : 'Listen')
                            }
                        >
                            <IconButton
                                size="small"
                                onClick={isPlaying ? stopAudio : playAudio}
                                sx={{
                                    backgroundColor: isPlaying ? '#ef4444' : '#10b981',
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: isPlaying ? '#dc2626' : '#059669',
                                    },
                                    animation: isPlaying ? `${pulse} 1s infinite` : 'none',
                                }}
                            >
                                {isPlaying ? <StopIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                        <Typography
                            variant="caption"
                            sx={{ ml: 1, color: '#6b7280' }}
                        >
                            {isPlaying
                                ? (isKorean ? '재생 중...' : 'Playing...')
                                : (isKorean ? '음성 듣기' : 'Listen')}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}