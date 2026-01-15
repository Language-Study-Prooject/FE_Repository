import grammarApi from '../../../api/grammarApi'

// Mock 데이터 사용 여부 (true: 목 데이터 사용, false: 실제 API 호출)
const USE_MOCK = true

// ============================================
// Mock 데이터
// ============================================

const mockGrammarCheckResponse = {
    originalSentence: 'She go to the school yesterday.',
    correctedSentence: 'She went to school yesterday.',
    score: 60,
    isCorrect: false,
    errors: [
        {
            type: 'VERB_TENSE',
            original: 'go',
            corrected: 'went',
            explanation: '과거 시제에서는 "go"가 "went"로 변합니다.',
            startIndex: 4,
            endIndex: 6,
        },
        {
            type: 'ARTICLE',
            original: 'the school',
            corrected: 'school',
            explanation: '일반적인 장소를 나타낼 때는 관사를 생략합니다.',
            startIndex: 11,
            endIndex: 21,
        },
    ],
    feedback:
        '동사 시제와 관사 사용에 주의가 필요합니다. 과거의 일을 말할 때는 과거 시제를 사용하세요.',
}

const mockConversationHistory = [
    {
        messageId: 'msg-1',
        role: 'USER',
        content: 'Hello, how are you?',
        correctedContent: 'Hello, how are you?',
        grammarScore: 100,
        createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
        messageId: 'msg-2',
        role: 'ASSISTANT',
        content: "I'm doing great, thank you for asking! How about you?",
        createdAt: new Date(Date.now() - 240000).toISOString(),
    },
    {
        messageId: 'msg-3',
        role: 'USER',
        content: 'I am fine. I go to work today.',
        correctedContent: 'I am fine. I went to work today.',
        grammarScore: 85,
        errorsJson: JSON.stringify([
            {
                type: 'VERB_TENSE',
                original: 'go',
                corrected: 'went',
                explanation: '과거의 일을 말할 때는 과거 시제를 사용합니다.',
            },
        ]),
        createdAt: new Date(Date.now() - 180000).toISOString(),
    },
    {
        messageId: 'msg-4',
        role: 'ASSISTANT',
        content: "That's great! What kind of work do you do?",
        createdAt: new Date(Date.now() - 120000).toISOString(),
    },
]

const mockSessions = [
    {
        sessionId: 'session-1',
        userId: 'user1',
        level: 'BEGINNER',
        topic: 'Daily Conversation',
        messageCount: 8,
        lastMessage: 'Thank you for practicing with me!',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        sessionId: 'session-2',
        userId: 'user1',
        level: 'INTERMEDIATE',
        topic: 'Business English',
        messageCount: 12,
        lastMessage: 'I will schedule a meeting for next week.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        sessionId: 'session-3',
        userId: 'user1',
        level: 'BEGINNER',
        topic: 'Travel Conversation',
        messageCount: 6,
        lastMessage: 'Where is the nearest subway station?',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
]

// ============================================
// API with Mock fallback
// ============================================

const withMock = (apiCall, mockData) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockData), 800)
        })
    }
    return apiCall().catch(() => mockData)
}

/**
 * 문법 검사 API - Backend: POST /grammar/check
 */
export const grammarCheckService = {
    // POST /grammar/check - 문법 검사
    check: (sentence, level = 'BEGINNER') =>
        withMock(
            () => grammarApi.post('/grammar/check', {sentence, level}),
            {
                ...mockGrammarCheckResponse,
                originalSentence: sentence,
                correctedSentence:
                    sentence.length > 10
                        ? sentence.replace(/go /g, 'went ').replace(/the school/g, 'school')
                        : sentence,
                isCorrect: sentence.length <= 10,
                score: sentence.length <= 10 ? 100 : Math.floor(Math.random() * 40) + 60,
                errors:
                    sentence.length <= 10
                        ? []
                        : mockGrammarCheckResponse.errors.slice(0, Math.floor(Math.random() * 2) + 1),
            }
        ),
}

/**
 * 대화형 문법 교정 API - Backend: POST /grammar/conversation
 */
export const conversationService = {
    // POST /grammar/conversation - AI 대화
    send: (message, sessionId = null, level = 'BEGINNER') =>
        withMock(
            () => grammarApi.post('/grammar/conversation', {message, sessionId, level}),
            {
                sessionId: sessionId || `session-${Date.now()}`,
                grammarCheck: {
                    originalSentence: message,
                    correctedSentence: message.replace(/go /g, 'went '),
                    score: Math.floor(Math.random() * 30) + 70,
                    isCorrect: !message.includes('go '),
                    errors: message.includes('go ')
                        ? [
                            {
                                type: 'VERB_TENSE',
                                original: 'go',
                                corrected: 'went',
                                explanation: '과거 시제를 사용해야 합니다.',
                                startIndex: message.indexOf('go '),
                                endIndex: message.indexOf('go ') + 2,
                            },
                        ]
                        : [],
                    feedback: message.includes('go ')
                        ? '동사 시제에 주의하세요!'
                        : '훌륭한 문장입니다!',
                },
                aiResponse:
                    "That's interesting! Could you tell me more about it?",
                conversationTip:
                    'Try using more descriptive adjectives in your next sentence.',
            }
        ),
}

/**
 * 세션 관리 API - Backend: GET/DELETE /grammar/sessions
 */
export const sessionService = {
    // GET /grammar/sessions - 세션 목록 조회
    getList: ({limit = 10, cursor} = {}) =>
        withMock(
            () => grammarApi.get('/grammar/sessions', {params: {limit, cursor}}),
            {
                sessions: mockSessions.slice(0, limit),
                nextCursor: null,
                hasMore: false,
            }
        ),

    // GET /grammar/sessions/{sessionId} - 세션 상세 조회
    getDetail: (sessionId, {messageLimit = 50} = {}) =>
        withMock(
            () =>
                grammarApi.get(`/grammar/sessions/${sessionId}`, {
                    params: {messageLimit},
                }),
            {
                session:
                    mockSessions.find((s) => s.sessionId === sessionId) || mockSessions[0],
                messages: mockConversationHistory.slice(0, messageLimit),
            }
        ),

    // DELETE /grammar/sessions/{sessionId} - 세션 삭제
    delete: (sessionId) =>
        withMock(() => grammarApi.delete(`/grammar/sessions/${sessionId}`), {
            code: 'SUCCESS',
            message: 'Session deleted successfully',
        }),
}

// 단일 export로 모든 서비스 묶기
export default {
    grammarCheckService,
    conversationService,
    sessionService,
}
