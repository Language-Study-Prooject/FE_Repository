import {useCallback, useEffect, useRef, useState} from 'react'
import {Alert, Box, Drawer, IconButton, Typography, useMediaQuery, useTheme,} from '@mui/material'
import {Edit as EditIcon, Menu as MenuIcon, SmartToy as AiIcon,} from '@mui/icons-material'
import {useSettings} from '../../../contexts/SettingsContext'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import SessionSidebar from '../components/SessionSidebar'
import {sessionService} from '../services/grammarService'
import {useGrammarStream} from '../hooks/useGrammarStream'
import {GRAMMAR_LEVELS} from '../constants/grammarConstants'

export default function WritingPage() {
    const {t, isKorean} = useSettings()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
    const [sessions, setSessions] = useState([])
    const [currentSessionId, setCurrentSessionId] = useState(null)
    const [messages, setMessages] = useState([])
    const [level, setLevel] = useState(GRAMMAR_LEVELS.BEGINNER)
    const [loading, setLoading] = useState(false)
    const [sessionsLoading, setSessionsLoading] = useState(true)
    const [error, setError] = useState(null)

    // 스트리밍 상태
    const [streamingMessageId, setStreamingMessageId] = useState(null)

    const messagesEndRef = useRef(null)

    // WebSocket 스트리밍 훅
    const {
        isStreaming,
        streamingText,
        result: streamResult,
        error: streamError,
        sendMessage: sendStreamMessage,
        connect: connectStream,
        grammarCheck: streamGrammarCheck,
        conversationTip: streamConversationTip,
    } = useGrammarStream()

    // 컴포넌트 마운트 시 WebSocket 연결
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        connectStream(token)
    }, [connectStream])

    // Load sessions on mount
    useEffect(() => {
        loadSessions()
    }, [])

    // Scroll to bottom when messages change or streaming text updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages, streamingText])

    // 스트리밍 완료 시 메시지 업데이트
    useEffect(() => {
        if (streamResult && streamingMessageId) {
            // 사용자 메시지에 문법 검사 결과 추가
            setMessages((prev) =>
                prev.map((msg) => {
                    if (msg.id === streamingMessageId) {
                        return {
                            ...msg,
                            correctedContent: streamResult.grammarCheck?.correctedSentence,
                            grammarScore: streamResult.grammarCheck?.score,
                            errors: streamResult.grammarCheck?.errors || [],
                        }
                    }
                    return msg
                })
            )

            // AI 응답 메시지 추가
            const aiMessage = {
                id: `ai-${Date.now()}`,
                content: streamResult.aiResponse,
                aiResponse: streamResult.aiResponse,
                conversationTip: streamResult.conversationTip,
                isUser: false,
                createdAt: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, aiMessage])

            // 세션 ID 업데이트
            if (!currentSessionId && streamResult.sessionId) {
                setCurrentSessionId(streamResult.sessionId)
                loadSessions()
            }

            setStreamingMessageId(null)
            setLoading(false)
        }
    }, [streamResult, streamingMessageId, currentSessionId])

    // 스트리밍 에러 처리
    useEffect(() => {
        if (streamError) {
            setError(streamError)
            setStreamingMessageId(null)
            setLoading(false)
        }
    }, [streamError])

    const loadSessions = async () => {
        try {
            setSessionsLoading(true)
            const response = await sessionService.getList({limit: 20})
            setSessions(response.sessions || [])
        } catch (err) {
            console.error('Failed to load sessions:', err)
        } finally {
            setSessionsLoading(false)
        }
    }

    const loadSessionMessages = async (sessionId) => {
        try {
            setLoading(true)
            const response = await sessionService.getDetail(sessionId)
            if (response.session) {
                setLevel(response.session.level || GRAMMAR_LEVELS.BEGINNER)
            }
            // Convert messages to our format
            const formattedMessages = (response.messages || []).map((msg) => ({
                id: msg.messageId,
                content: msg.content,
                correctedContent: msg.correctedContent,
                grammarScore: msg.grammarScore,
                errors: msg.errorsJson ? JSON.parse(msg.errorsJson) : [],
                aiResponse: msg.role === 'ASSISTANT' ? msg.content : null,
                isUser: msg.role === 'USER',
                createdAt: msg.createdAt,
            }))
            setMessages(formattedMessages)
        } catch (err) {
            console.error('Failed to load session messages:', err)
            setError(isKorean ? '메시지를 불러오는데 실패했습니다' : 'Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSession = (sessionId) => {
        setCurrentSessionId(sessionId)
        loadSessionMessages(sessionId)
        if (isMobile) {
            setSidebarOpen(false)
        }
    }

    const handleNewSession = () => {
        setCurrentSessionId(null)
        setMessages([])
        setError(null)
        if (isMobile) {
            setSidebarOpen(false)
        }
    }

    const handleDeleteSession = async (sessionId) => {
        try {
            await sessionService.delete(sessionId)
            setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
            if (currentSessionId === sessionId) {
                handleNewSession()
            }
        } catch (err) {
            console.error('Failed to delete session:', err)
        }
    }

    // 스트리밍 모드로 메시지 전송
    const handleSendMessage = useCallback(async (message) => {
        try {
            setLoading(true)
            setError(null)

            // 사용자 메시지 즉시 추가
            const userMessageId = `user-${Date.now()}`
            const userMessage = {
                id: userMessageId,
                content: message,
                isUser: true,
                createdAt: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, userMessage])
            setStreamingMessageId(userMessageId)

            // WebSocket 스트리밍 시작
            sendStreamMessage(message, {
                level,
                sessionId: currentSessionId,
            })
        } catch (err) {
            console.error('Failed to send message:', err)
            setError(isKorean ? '메시지 전송에 실패했습니다' : 'Failed to send message')
            setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('user-')))
            setStreamingMessageId(null)
            setLoading(false)
        }
    }, [level, currentSessionId, sendStreamMessage, isKorean])

    const sidebarContent = (
        <SessionSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            loading={sessionsLoading}
        />
    )

    return (
        <Box
            sx={{
                height: 'calc(100vh - 120px)',
                display: 'flex',
                overflow: 'hidden',
                backgroundColor: '#fff',
                borderRadius: {xs: 0, md: '20px'},
                border: {xs: 'none', md: '1px solid'},
                borderColor: 'divider',
                mx: {xs: 0, md: 3},
                my: {xs: 0, md: 2},
            }}
        >
            {/* Sidebar - Desktop */}
            {!isMobile && sidebarOpen && sidebarContent}

            {/* Sidebar - Mobile Drawer */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    PaperProps={{
                        sx: {width: 280},
                    }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            {/* Main Chat Area */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
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
                    <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{mr: 0.5}}>
                        <MenuIcon/>
                    </IconButton>

                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.3)',
                        }}
                    >
                        <EditIcon sx={{fontSize: 22, color: 'white'}}/>
                    </Box>

                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {t('grammar.title')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('grammar.subtitle')}
                        </Typography>
                    </Box>
                </Box>

                {/* Messages Area */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        py: 2,
                        backgroundColor: '#fff',
                    }}
                >
                    {error && (
                        <Alert severity="error" sx={{mx: 2, mb: 2, borderRadius: '12px'}}>
                            {error}
                        </Alert>
                    )}

                    {messages.length === 0 && !isStreaming ? (
                        <Box
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: 4,
                                textAlign: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                    boxShadow: '0 12px 24px -6px rgba(59, 130, 246, 0.3)',
                                }}
                            >
                                <AiIcon sx={{fontSize: 40, color: 'white'}}/>
                            </Box>
                            <Typography variant="h5" fontWeight={700} sx={{mb: 1}}>
                                {isKorean ? 'AI 문법 교정 도우미' : 'AI Grammar Assistant'}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{maxWidth: 400, lineHeight: 1.6}}
                            >
                                {isKorean
                                    ? '영어 문장을 입력하면 문법을 교정하고, 자연스러운 대화로 영어 실력을 향상시켜 드립니다.'
                                    : 'Type an English sentence to get grammar corrections and improve your English through natural conversation.'}
                            </Typography>

                            <Box
                                sx={{
                                    mt: 4,
                                    p: 2,
                                    borderRadius: '12px',
                                    backgroundColor: '#f3f4f6',
                                    maxWidth: 400,
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} sx={{mb: 1}}>
                                    {isKorean ? '예시 문장:' : 'Example sentences:'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                    • "I go to school yesterday."
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
                                    • "She have a beautiful car."
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • "The informations is useful."
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <ChatMessage key={msg.id} message={msg} isUser={msg.isUser}/>
                            ))}

                            {/* 스트리밍 중인 AI 응답 */}
                            {isStreaming && streamingText && (
                                <ChatMessage
                                    message={{
                                        id: 'streaming',
                                        content: streamingText,
                                        aiResponse: streamingText,
                                    }}
                                    isUser={false}
                                    isStreaming={true}
                                    streamingText={streamingText}
                                />
                            )}

                            <div ref={messagesEndRef}/>
                        </>
                    )}
                </Box>

                {/* Input Area */}
                <ChatInput
                    onSend={handleSendMessage}
                    loading={loading || isStreaming}
                    level={level}
                    onLevelChange={setLevel}
                />
            </Box>
        </Box>
    )
}
