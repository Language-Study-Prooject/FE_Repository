import vocabApi from '../../../api/vocabApi'

// Mock 데이터 사용 여부 (환경변수로 제어: VITE_USE_MOCK=true)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ============================================
// Mock 데이터
// ============================================

const mockWords = [
    {
        wordId: 'w1',
        english: 'apple',
        korean: '사과',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'I eat an apple every day.'
    },
    {
        wordId: 'w2',
        english: 'beautiful',
        korean: '아름다운',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'The sunset is beautiful.'
    },
    {
        wordId: 'w3',
        english: 'computer',
        korean: '컴퓨터',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'I use a computer for work.'
    },
    {
        wordId: 'w4',
        english: 'delicious',
        korean: '맛있는',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'This pizza is delicious.'
    },
    {
        wordId: 'w5',
        english: 'environment',
        korean: '환경',
        level: 'INTERMEDIATE',
        category: 'ACADEMIC',
        example: 'We must protect the environment.'
    },
    {
        wordId: 'w6',
        english: 'fundamental',
        korean: '기본적인',
        level: 'INTERMEDIATE',
        category: 'ACADEMIC',
        example: 'This is a fundamental concept.'
    },
    {
        wordId: 'w7',
        english: 'generate',
        korean: '생성하다',
        level: 'INTERMEDIATE',
        category: 'BUSINESS',
        example: 'The company generates revenue.'
    },
    {
        wordId: 'w8',
        english: 'hypothesis',
        korean: '가설',
        level: 'ADVANCED',
        category: 'ACADEMIC',
        example: 'We need to test this hypothesis.'
    },
    {
        wordId: 'w9',
        english: 'implement',
        korean: '구현하다',
        level: 'INTERMEDIATE',
        category: 'BUSINESS',
        example: 'We will implement the new system.'
    },
    {
        wordId: 'w10',
        english: 'jurisdiction',
        korean: '관할권',
        level: 'ADVANCED',
        category: 'BUSINESS',
        example: 'This falls under federal jurisdiction.'
    },
    {
        wordId: 'w11',
        english: 'knowledge',
        korean: '지식',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'Knowledge is power.'
    },
    {
        wordId: 'w12',
        english: 'legitimate',
        korean: '합법적인',
        level: 'ADVANCED',
        category: 'BUSINESS',
        example: 'Is this a legitimate business?'
    },
    {
        wordId: 'w13',
        english: 'magnificent',
        korean: '웅장한',
        level: 'INTERMEDIATE',
        category: 'DAILY',
        example: 'The castle is magnificent.'
    },
    {
        wordId: 'w14',
        english: 'negotiate',
        korean: '협상하다',
        level: 'INTERMEDIATE',
        category: 'BUSINESS',
        example: 'They will negotiate the contract.'
    },
    {
        wordId: 'w15',
        english: 'opportunity',
        korean: '기회',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'This is a great opportunity.'
    },
    {
        wordId: 'w16',
        english: 'perseverance',
        korean: '인내',
        level: 'ADVANCED',
        category: 'DAILY',
        example: 'Success requires perseverance.'
    },
    {
        wordId: 'w17',
        english: 'question',
        korean: '질문',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'Do you have any questions?'
    },
    {
        wordId: 'w18',
        english: 'responsibility',
        korean: '책임',
        level: 'INTERMEDIATE',
        category: 'BUSINESS',
        example: 'Take responsibility for your actions.'
    },
    {
        wordId: 'w19',
        english: 'sophisticated',
        korean: '정교한',
        level: 'ADVANCED',
        category: 'ACADEMIC',
        example: 'This is a sophisticated algorithm.'
    },
    {
        wordId: 'w20',
        english: 'technology',
        korean: '기술',
        level: 'BEGINNER',
        category: 'DAILY',
        example: 'Technology is advancing rapidly.'
    },
]

const mockUserWords = mockWords.map((word, idx) => ({
    ...word,
    status: idx < 5 ? 'MASTERED' : idx < 12 ? 'REVIEWING' : idx < 17 ? 'LEARNING' : 'NEW',
    correctCount: Math.floor(Math.random() * 10) + 1,
    incorrectCount: Math.floor(Math.random() * 5),
    bookmarked: idx % 4 === 0,
    favorite: idx % 5 === 0,
    difficulty: ['EASY', 'NORMAL', 'HARD'][idx % 3],
    lastReviewedAt: new Date(Date.now() - idx * 86400000).toISOString(),
    nextReviewAt: new Date(Date.now() + (idx + 1) * 86400000).toISOString(),
}))

const generateDailyStats = () => {
    const stats = []
    for (let i = 0; i < 84; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        stats.push({
            date: date.toISOString().split('T')[0],
            learnedCount: Math.random() > 0.3 ? Math.floor(Math.random() * 55) + 5 : 0,
            wordsStudied: Math.floor(Math.random() * 30) + 5,
            successRate: Math.floor(Math.random() * 40) + 60,
            correctCount: Math.floor(Math.random() * 40) + 10,
            incorrectCount: Math.floor(Math.random() * 15),
        })
    }
    return stats
}

const mockTestResults = [
    {
        testId: 't1',
        testType: 'DAILY',
        totalQuestions: 20,
        correctAnswers: 18,
        successRate: 90,
        completedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        testId: 't2',
        testType: 'DAILY',
        totalQuestions: 20,
        correctAnswers: 15,
        successRate: 75,
        completedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        testId: 't3',
        testType: 'DAILY',
        totalQuestions: 20,
        correctAnswers: 12,
        successRate: 60,
        completedAt: new Date(Date.now() - 259200000).toISOString()
    },
]

// ============================================
// API with Mock fallback
// ============================================

const withMock = (apiCall, mockData) => {
    if (USE_MOCK) {
        // interceptor가 response.data를 반환하므로 mockData를 직접 반환
        return Promise.resolve(mockData)
    }
    // 실제 API 호출 시 응답의 data 필드 추출 (백엔드 응답: { isSuccess, message, data })
    return apiCall()
        .then(response => response.data || response)
        .catch(() => mockData)
}

/**
 * 단어 관리 API - Backend: GET /words, GET /words/search
 */
export const wordService = {
    // GET /words - 단어 목록 조회
    getList: ({level, category, limit = 20, cursor} = {}) =>
        withMock(
            () => vocabApi.get('/vocab/words', {params: {level, category, limit, cursor}}),
            {
                words: mockWords.filter(w => (!level || w.level === level) && (!category || w.category === category)).slice(0, limit),
                hasMore: false,
                nextCursor: null,
            }
        ),

    // GET /words - 단어 목록 조회 (별칭)
    getWords: (params) =>
        withMock(
            () => vocabApi.get('/vocab/words', {params}),
            {words: mockWords, hasMore: false}
        ),

    // GET /words/search - 단어 검색
    search: ({q, limit = 20, cursor} = {}) =>
        withMock(
            () => vocabApi.get('/words/search', {params: {q, limit, cursor}}),
            {
                words: mockWords.filter(w =>
                    w.english.toLowerCase().includes(q?.toLowerCase() || '') ||
                    w.korean.includes(q || '')
                ).slice(0, limit),
                query: q,
                hasMore: false,
            }
        ),

    // GET /words/{wordId} - 단어 상세 조회 (백엔드 문서에 없지만 필요시)
    getDetail: (wordId) =>
        withMock(
            () => vocabApi.get(`/words/${wordId}`),
            mockWords.find(w => w.wordId === wordId) || mockWords[0]
        ),

    // POST /words/batch - 배치 단어 생성
    createBatch: (words) =>
        withMock(
            () => vocabApi.post('/vocab/words/batch', {words}),
            {successCount: words.length, failCount: 0, totalRequested: words.length}
        ),

    // POST /words/batch/get - 배치 단어 조회
    getBatch: (wordIds) =>
        withMock(
            () => vocabApi.post('/vocab/words/batch/get', {wordIds}),
            {
                words: mockWords.filter(w => wordIds.includes(w.wordId)),
                requestedCount: wordIds.length,
                retrievedCount: wordIds.length,
            }
        ),
}

/**
 * 일일 학습 API - Backend: GET /vocab/daily?level={level}, POST /vocab/daily/words/{wordId}/learned
 * userId는 토큰에서 추출됨
 */
export const dailyService = {
    // GET /vocab/daily?level={level} - 오늘의 학습 단어 조회
    // 첫 호출 시 자동으로 생성됨
    getWords: (level) =>
        withMock(
            () => vocabApi.get('/vocab/daily', {params: {level: level?.toUpperCase()}}),
            {
                dailyStudy: {
                    date: new Date().toISOString().split('T')[0],
                    totalWords: 55,
                    learnedCount: 0,
                    isCompleted: false,
                },
                newWords: mockWords.filter(w => !level || w.level === level.toUpperCase()).slice(0, 50),
                reviewWords: mockUserWords.filter(w => w.status === 'REVIEWING').slice(0, 5),
                progress: {
                    total: 55,
                    learned: 0,
                    remaining: 55,
                    percentage: 0,
                    isCompleted: false,
                },
            }
        ),

    // POST /vocab/daily/words/{wordId}/learned - 단어 학습 완료 표시
    // body 필요 없음 (userId는 토큰에서 추출)
    markLearned: (wordId) =>
        withMock(
            () => vocabApi.post(`/vocab/daily/words/${wordId}/learned`),
            {
                total: 55,
                learned: 1,
                remaining: 54,
                percentage: 1.82,
                isCompleted: false,
            }
        ),
}

/**
 * 사용자 단어 학습 상태 API - Backend: POST /user-words/{wordId}/review, PATCH /user-words/{wordId}/tag
 */
export const userWordService = {
    // GET /user-words/review - 복습 예정 단어 조회
    getList: (userId, {status, limit = 20, cursor, date} = {}) =>
        withMock(
            () => vocabApi.get('/vocab/user-words', {params: {userId, status, limit, cursor, date}}),
            {
                userWords: mockUserWords.filter(w => !status || w.status === status).slice(0, limit),
                hasMore: false,
                nextCursor: null,
            }
        ),

    // GET /user-words/review - 사용자 단어 조회 (별칭)
    getUserWords: (userId, params) =>
        withMock(
            () => vocabApi.get('/vocab/user-words', {params: {userId, ...params}}),
            {words: mockUserWords, hasMore: false}
        ),

    // PUT /user-words/{wordId} - 사용자 단어 학습 업데이트
    update: (userId, wordId, isCorrect) =>
        withMock(
            () => vocabApi.put(`/vocab/user-words/${wordId}`, {userId, isCorrect}),
            {
                userId,
                wordId,
                status: isCorrect ? 'REVIEWING' : 'LEARNING',
                interval: isCorrect ? 6 : 1,
                easeFactor: isCorrect ? 2.5 : 2.3,
                repetitions: isCorrect ? 2 : 0,
                nextReviewAt: new Date(Date.now() + (isCorrect ? 6 : 1) * 86400000).toISOString().split('T')[0],
                lastReviewedAt: new Date().toISOString(),
                correctCount: isCorrect ? 5 : 4,
                incorrectCount: isCorrect ? 1 : 2,
            }
        ),

    // PATCH /user-words/{wordId}/tag - 사용자 단어 태그 업데이트
    // userId는 토큰에서 추출되므로 body에 포함하지 않음
    updateTag: (userId, wordId, {bookmarked, favorite, difficulty}) =>
        withMock(
            () => vocabApi.patch(`/vocab/user-words/${wordId}/tag`, {bookmarked, favorite, difficulty}),
            {success: true, userId, wordId, bookmarked, favorite, difficulty}
        ),

    // PATCH /user-words/{wordId}/tag - 사용자 단어 업데이트 (별칭)
    // userId는 토큰에서 추출되므로 body에 포함하지 않음
    updateUserWord: (userId, wordId, data) =>
        withMock(
            () => vocabApi.patch(`/vocab/user-words/${wordId}/tag`, data),
            {success: true, ...data}
        ),
}

/**
 * 나의 단어장 API - 북마크/오답 필터링
 */
export const myWordService = {
    // GET /user-words/review - 나의 단어 목록 (필터링)
    getList: (userId, {bookmarked, incorrectOnly, limit = 20, cursor} = {}) =>
        withMock(
            () => vocabApi.get('/vocab/user-words', {
                params: {userId, bookmarked, incorrectOnly, limit, cursor}
            }),
            {
                userWords: mockUserWords
                    .filter(w => (!bookmarked || w.bookmarked) && (!incorrectOnly || w.incorrectCount > 0))
                    .slice(0, limit),
                hasMore: false,
            }
        ),

    // 북마크된 단어 조회
    getBookmarked: (userId, {limit = 20, cursor} = {}) =>
        withMock(
            () => vocabApi.get('/vocab/user-words', {params: {userId, bookmarked: true, limit, cursor}}),
            {userWords: mockUserWords.filter(w => w.bookmarked).slice(0, limit), hasMore: false}
        ),

    // 오답 단어 조회
    getIncorrect: (userId, {limit = 20, cursor} = {}) =>
        withMock(
            () => vocabApi.get('/vocab/user-words', {params: {userId, incorrectOnly: true, limit, cursor}}),
            {userWords: mockUserWords.filter(w => w.incorrectCount > 0).slice(0, limit), hasMore: false}
        ),

    // PATCH /user-words/{wordId}/tag - 북마크 토글
    // userId는 토큰에서 추출되므로 body에 포함하지 않음
    toggleBookmark: (userId, wordId, bookmarked) =>
        withMock(
            () => vocabApi.patch(`/vocab/user-words/${wordId}/tag`, {bookmarked}),
            {success: true, wordId, bookmarked}
        ),
}

/**
 * 시험 API - Backend: POST /tests/start, POST /tests/{testId}/submit
 */
export const testService = {
    // POST /tests/start - 시험 시작
    start: (userId, testType = 'DAILY', wordCount = 20, level) =>
        withMock(
            () => vocabApi.post('/vocab/test/start', {userId, testType, wordCount, level}),
            {
                testId: `test-${Date.now()}`,
                testType,
                words: mockWords.slice(0, wordCount || 10).map(w => ({
                    wordId: w.wordId,
                    english: w.english,
                    options: [w.korean, '다른뜻1', '다른뜻2', '다른뜻3'].sort(() => Math.random() - 0.5),
                })),
                startedAt: new Date().toISOString(),
            }
        ),

    // POST /vocab/test/submit - 시험 제출
    submit: (userId, testId, answers) =>
        withMock(
            () => vocabApi.post('/vocab/test/submit', {userId, testId, answers}),
            {
                testId,
                totalQuestions: answers.length,
                correctAnswers: Math.floor(answers.length * 0.8),
                incorrectAnswers: Math.ceil(answers.length * 0.2),
                successRate: 80,
                incorrectWordIds: answers.slice(Math.floor(answers.length * 0.8)).map(a => a.wordId),
                completedAt: new Date().toISOString(),
            }
        ),

    // 시험 결과 조회 (프론트엔드 전용 - 백엔드에서 미구현)
    getResults: (userId, {limit = 20, cursor} = {}) =>
        withMock(
            () => vocabApi.get('/vocab/test/results', {params: {userId, limit, cursor}}),
            {testResults: mockTestResults.slice(0, limit), hasMore: false}
        ),
}

/**
 * 통계 API - Backend: GET /stats/total, GET /stats/history, GET /vocab/stats/weakness
 * userId는 토큰에서 추출되므로 파라미터로 전달하지 않음
 */
export const statsService = {
    // GET /stats/total - 전체 통계 조회
    getOverall: () =>
        withMock(
            () => vocabApi.get('/stats/total'),
            {
                periodType: 'TOTAL',
                period: 'ALL',
                testsCompleted: 4,
                questionsAnswered: 100,
                correctAnswers: 78,
                incorrectAnswers: 22,
                successRate: 78.0,
                newWordsLearned: 50,
                wordsReviewed: 20,
                currentStreak: 7,
                longestStreak: 15,
                lastStudyDate: new Date().toISOString().split('T')[0],
                // 프론트엔드 호환용 필드
                totalLearned: 50,
                averageSuccessRate: 78.0,
                averageAccuracy: 78.0,
                streakDays: 7,
            }
        ),

    // GET /stats/history - 히스토리 조회 (히트맵/차트용)
    getDaily: (userId, {limit = 7} = {}) =>
        withMock(
            () => vocabApi.get('/stats/history', {params: {limit}}),
            {
                history: generateDailyStats().slice(0, limit).map(s => ({
                    period: s.date,
                    testsCompleted: Math.floor(Math.random() * 3),
                    questionsAnswered: s.wordsStudied,
                    correctAnswers: s.correctCount,
                    successRate: s.successRate,
                    newWordsLearned: s.learnedCount,
                    wordsReviewed: Math.floor(Math.random() * 10),
                    // 프론트엔드 호환용
                    date: s.date,
                    learnedCount: s.learnedCount,
                    isCompleted: s.learnedCount >= 55,
                })),
                dailyStats: generateDailyStats().slice(0, limit),
                hasMore: false,
            }
        ),

    // GET /vocab/stats/weakness - 취약점 분석
    getWeakness: () =>
        withMock(
            () => vocabApi.get('/vocab/stats/weakness'),
            {
                weakCategories: [
                    {category: 'BUSINESS', incorrectRate: 35.5, totalAnswered: 100, incorrectCount: 35},
                    {category: 'ACADEMIC', incorrectRate: 28.0, totalAnswered: 50, incorrectCount: 14},
                ],
                frequentMistakes: mockUserWords
                    .filter(w => w.incorrectCount > 0)
                    .sort((a, b) => b.incorrectCount - a.incorrectCount)
                    .slice(0, 10)
                    .map(w => ({
                        wordId: w.wordId,
                        english: w.english,
                        korean: w.korean,
                        incorrectCount: w.incorrectCount,
                        accuracy: Math.round((w.correctCount / (w.correctCount + w.incorrectCount)) * 100),
                    })),
                weakWords: mockUserWords
                    .filter(w => w.incorrectCount > 0)
                    .slice(0, 10)
                    .map(w => ({
                        ...w,
                        accuracy: Math.round((w.correctCount / (w.correctCount + w.incorrectCount)) * 100),
                    })),
                weakestWords: mockUserWords
                    .filter(w => w.incorrectCount > 0)
                    .slice(0, 5),
                recommendedReview: 15,
            }
        ),
}

/**
 * 음성 API (TTS) - Backend: POST /voice/synthesize
 */
export const voiceService = {
    // POST /voice/synthesize - 음성 합성
    synthesize: (wordId, text, voice = 'female', type = 'word') =>
        withMock(
            () => vocabApi.post('/vocab/voice/synthesize', {wordId, text, voice, type}),
            {
                audioUrl: null, // Mock에서는 실제 오디오 없음
                cached: false,
            }
        ),
}
