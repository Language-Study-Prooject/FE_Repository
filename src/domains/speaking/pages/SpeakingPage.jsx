import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Box, Typography } from '@mui/material'
import { SmartToy as AiIcon } from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext' // 경로는 프로젝트 구조에 맞게 확인 필요
import SpeakingChatMessage from '../components/SpeakingChatMessage'
import SpeakingInput from '../components/SpeakingInput'
import { useSpeaking } from '../hooks/useSpeaking'
import { SPEAKING_LEVELS } from '../constants/speakingConstants'

export default function SpeakingPage() {
    const { isKorean } = useSettings()

    const [messages, setMessages] = useState([])
    const [level, setLevel] = useState(SPEAKING_LEVELS.INTERMEDIATE)
    const [error, setError] = useState(null)

    const messagesEndRef = useRef(null)

    // REST API 훅 사용 (훅 내부에서 speakingService를 호출하므로 안전함)
    const {
        isProcessing,
        result,
        error: apiError,
        sendVoice,
        sendText,
        setLevel: setApiLevel,
        resetConversation,
    } = useSpeaking()

    // 스크롤 자동 이동
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isProcessing]) // isProcessing 추가: 답변 준비 중일 때도 스크롤 이동

    // 결과 처리 (서버 응답이 오면 메시지 목록에 추가)
    useEffect(() => {
        if (result) {
            // 1. 사용자 메시지 추가 (STT 결과가 있을 경우)
            if (result.userTranscript) {
                const userMessage = {
                    id: `user-${Date.now()}`,
                    content: result.userTranscript,
                    userTranscript: result.userTranscript,
                    confidence: result.confidence,
                    isUser: true,
                    createdAt: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, userMessage])
            }

            // 2. AI 응답 메시지 추가
            if (result.aiText) {
                const aiMessage = {
                    id: `ai-${Date.now()}`,
                    content: result.aiText,
                    aiText: result.aiText,
                    aiAudioUrl: result.aiAudioUrl,
                    isUser: false,
                    createdAt: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, aiMessage])
            }
        }
    }, [result])

    // 에러 처리
    useEffect(() => {
        if (apiError) {
            setError(apiError)
        }
    }, [apiError])

    /**
     * 음성 전송
     */
    const handleSendVoice = useCallback(async (audioBase64) => {
        setError(null)
        try {
            await sendVoice(audioBase64)
        } catch (err) {
            // 에러는 훅 상태(apiError)를 통해 처리됨
        }
    }, [sendVoice])

    /**
     * 텍스트 전송
     */
    const handleSendText = useCallback(async (text) => {
        setError(null)
        try {
            await sendText(text)
        } catch (err) {
            // 에러는 훅 상태(apiError)를 통해 처리됨
        }
    }, [sendText])

    /**
     * 레벨 변경
     */
    const handleLevelChange = useCallback((newLevel) => {
        setLevel(newLevel)
        setApiLevel(newLevel)
    }, [setApiLevel])

    /**
     * 대화 초기화
     */
    const handleReset = useCallback(() => {
        setMessages([])
        resetConversation()
    }, [resetConversation])

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* 헤더 */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: '#fff',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {isKorean ? 'AI와 대화하기' : 'Talk with AI'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {isKorean
                        ? 'Amy와 영어로 자유롭게 대화해보세요'
                        : 'Have a free conversation with Amy in English!'}
                </Typography>
            </Box>

            {/* 에러 알림 */}
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {/* 메시지 영역 */}
            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 2,
                    backgroundColor: '#fafafa',
                }}
            >
                {messages.length === 0 ? (
                    // 빈 상태 (안내 메시지)
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#9ca3af',
                        }}
                    >
                        <AiIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {isKorean ? '안녕하세요! 저는 Amy예요.' : "Hi! I'm Amy."}
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 400 }}>
                            {isKorean
                                ? '마이크 버튼을 눌러 영어로 말해보세요. 제가 대화 상대가 되어드릴게요!'
                                : 'Press the microphone button and speak in English. I\'ll be your conversation partner!'}
                        </Typography>

                        {/* 팁 박스 */}
                        <Box sx={{ mt: 3, p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                                {isKorean ? '💡 대화 예시:' : '💡 Example:'}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                "Hello! How are you today?"
                            </Typography>
                            <Typography variant="body2">
                                "What did you do last weekend?"
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    // 메시지 목록
                    <>
                        {messages.map((msg) => (
                            <SpeakingChatMessage
                                key={msg.id}
                                message={msg}
                                isUser={msg.isUser}
                            />
                        ))}

                        {/* 처리 중 표시 (로딩 인디케이터) */}
                        {isProcessing && (
                            <Box sx={{ display: 'flex', gap: 1, ml: 2, mt: 2, color: '#6b7280', alignItems: 'center' }}>
                                <AiIcon fontSize="small" />
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {isKorean ? 'Amy가 답변을 생각하고 있어요...' : 'Amy is thinking...'}
                                </Typography>
                            </Box>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </Box>

            {/* 입력 영역 (컴포넌트 재사용) */}
            <SpeakingInput
                onSendVoice={handleSendVoice}
                onSendText={handleSendText}
                onLevelChange={handleLevelChange}
                onReset={handleReset}
                loading={isProcessing}
                level={level}
            />
        </Box>
    )
}