import vocabApi from '../../../api/vocabApi'

// Mock 데이터 사용 여부 (true: 목 데이터 사용, false: 실제 API 호출)
const USE_MOCK = true

// ============================================
// Mock 데이터
// ============================================

const mockWords = [
  { wordId: 'w1', english: 'apple', korean: '사과', level: 'BEGINNER', category: 'DAILY', example: 'I eat an apple every day.' },
  { wordId: 'w2', english: 'beautiful', korean: '아름다운', level: 'BEGINNER', category: 'DAILY', example: 'The sunset is beautiful.' },
  { wordId: 'w3', english: 'computer', korean: '컴퓨터', level: 'BEGINNER', category: 'DAILY', example: 'I use a computer for work.' },
  { wordId: 'w4', english: 'delicious', korean: '맛있는', level: 'BEGINNER', category: 'DAILY', example: 'This pizza is delicious.' },
  { wordId: 'w5', english: 'environment', korean: '환경', level: 'INTERMEDIATE', category: 'ACADEMIC', example: 'We must protect the environment.' },
  { wordId: 'w6', english: 'fundamental', korean: '기본적인', level: 'INTERMEDIATE', category: 'ACADEMIC', example: 'This is a fundamental concept.' },
  { wordId: 'w7', english: 'generate', korean: '생성하다', level: 'INTERMEDIATE', category: 'BUSINESS', example: 'The company generates revenue.' },
  { wordId: 'w8', english: 'hypothesis', korean: '가설', level: 'ADVANCED', category: 'ACADEMIC', example: 'We need to test this hypothesis.' },
  { wordId: 'w9', english: 'implement', korean: '구현하다', level: 'INTERMEDIATE', category: 'BUSINESS', example: 'We will implement the new system.' },
  { wordId: 'w10', english: 'jurisdiction', korean: '관할권', level: 'ADVANCED', category: 'BUSINESS', example: 'This falls under federal jurisdiction.' },
  { wordId: 'w11', english: 'knowledge', korean: '지식', level: 'BEGINNER', category: 'DAILY', example: 'Knowledge is power.' },
  { wordId: 'w12', english: 'legitimate', korean: '합법적인', level: 'ADVANCED', category: 'BUSINESS', example: 'Is this a legitimate business?' },
  { wordId: 'w13', english: 'magnificent', korean: '웅장한', level: 'INTERMEDIATE', category: 'DAILY', example: 'The castle is magnificent.' },
  { wordId: 'w14', english: 'negotiate', korean: '협상하다', level: 'INTERMEDIATE', category: 'BUSINESS', example: 'They will negotiate the contract.' },
  { wordId: 'w15', english: 'opportunity', korean: '기회', level: 'BEGINNER', category: 'DAILY', example: 'This is a great opportunity.' },
  { wordId: 'w16', english: 'perseverance', korean: '인내', level: 'ADVANCED', category: 'DAILY', example: 'Success requires perseverance.' },
  { wordId: 'w17', english: 'question', korean: '질문', level: 'BEGINNER', category: 'DAILY', example: 'Do you have any questions?' },
  { wordId: 'w18', english: 'responsibility', korean: '책임', level: 'INTERMEDIATE', category: 'BUSINESS', example: 'Take responsibility for your actions.' },
  { wordId: 'w19', english: 'sophisticated', korean: '정교한', level: 'ADVANCED', category: 'ACADEMIC', example: 'This is a sophisticated algorithm.' },
  { wordId: 'w20', english: 'technology', korean: '기술', level: 'BEGINNER', category: 'DAILY', example: 'Technology is advancing rapidly.' },
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
  { testId: 't1', testType: 'DAILY', totalQuestions: 20, correctAnswers: 18, successRate: 90, completedAt: new Date(Date.now() - 86400000).toISOString() },
  { testId: 't2', testType: 'DAILY', totalQuestions: 20, correctAnswers: 15, successRate: 75, completedAt: new Date(Date.now() - 172800000).toISOString() },
  { testId: 't3', testType: 'DAILY', totalQuestions: 20, correctAnswers: 12, successRate: 60, completedAt: new Date(Date.now() - 259200000).toISOString() },
]

// ============================================
// API with Mock fallback
// ============================================

const withMock = (apiCall, mockData) => {
  if (USE_MOCK) {
    // interceptor가 response.data를 반환하므로 mockData를 직접 반환
    return Promise.resolve(mockData)
  }
  return apiCall().catch(() => mockData)
}

/**
 * 단어 관리 API - Backend: GET /words, GET /words/search
 */
export const wordService = {
  // GET /words - 단어 목록 조회
  getList: ({ level, category, limit = 20, cursor } = {}) =>
    withMock(
      () => vocabApi.get('/words', { params: { level, category, limit, cursor } }),
      {
        words: mockWords.filter(w => (!level || w.level === level) && (!category || w.category === category)).slice(0, limit),
        hasMore: false,
        nextCursor: null,
      }
    ),

  // GET /words - 단어 목록 조회 (별칭)
  getWords: (params) =>
    withMock(
      () => vocabApi.get('/words', { params }),
      { words: mockWords, hasMore: false }
    ),

  // GET /words/search - 단어 검색
  search: ({ q, limit = 20, cursor } = {}) =>
    withMock(
      () => vocabApi.get('/words/search', { params: { q, limit, cursor } }),
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
      () => vocabApi.post('/words/batch', { words }),
      { successCount: words.length, failCount: 0, totalRequested: words.length }
    ),

  // POST /words/batch/get - 배치 단어 조회
  getBatch: (wordIds) =>
    withMock(
      () => vocabApi.post('/words/batch/get', { wordIds }),
      {
        words: mockWords.filter(w => wordIds.includes(w.wordId)),
        requestedCount: wordIds.length,
        retrievedCount: wordIds.length,
      }
    ),
}

/**
 * 일일 학습 API - Backend: POST /daily-study/record, GET /user-words/review
 */
export const dailyService = {
  // 일일 학습용 단어 조회 (새 단어 + 복습 단어)
  getWords: (userId, level) =>
    withMock(
      () => vocabApi.get('/user-words/review', { params: { userId, ...(level ? { level } : {}) } }),
      {
        newWords: mockWords.filter(w => !level || w.level === level).slice(0, 10),
        reviewWords: mockUserWords.filter(w => w.status === 'REVIEWING').slice(0, 5),
        learnedCount: 0,
        isCompleted: false,
      }
    ),

  // POST /daily-study/record - 일일 학습 기록
  markLearned: (userId, wordId, isCorrect, studyType = 'REVIEW') =>
    withMock(
      () => vocabApi.post('/daily-study/record', { userId, wordId, isCorrect, studyType }),
      {
        userId,
        date: new Date().toISOString().split('T')[0],
        wordsStudied: 1,
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1,
      }
    ),
}

/**
 * 사용자 단어 학습 상태 API - Backend: POST /user-words/{wordId}/review, PATCH /user-words/{wordId}/tag
 */
export const userWordService = {
  // GET /user-words/review - 복습 예정 단어 조회
  getList: (userId, { status, limit = 20, cursor, date } = {}) =>
    withMock(
      () => vocabApi.get('/user-words/review', { params: { userId, status, limit, cursor, date } }),
      {
        userWords: mockUserWords.filter(w => !status || w.status === status).slice(0, limit),
        hasMore: false,
        nextCursor: null,
      }
    ),

  // GET /user-words/review - 사용자 단어 조회 (별칭)
  getUserWords: (userId, params) =>
    withMock(
      () => vocabApi.get('/user-words/review', { params: { userId, ...params } }),
      { words: mockUserWords, hasMore: false }
    ),

  // POST /user-words/{wordId}/review - 사용자 단어 학습 업데이트
  update: (userId, wordId, isCorrect) =>
    withMock(
      () => vocabApi.post(`/user-words/${wordId}/review`, { userId, isCorrect }),
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
  updateTag: (userId, wordId, { bookmarked, favorite, difficulty }) =>
    withMock(
      () => vocabApi.patch(`/user-words/${wordId}/tag`, { userId, bookmarked, favorite, difficulty }),
      { success: true, userId, wordId, bookmarked, favorite, difficulty }
    ),

  // PATCH /user-words/{wordId}/tag - 사용자 단어 업데이트 (별칭)
  updateUserWord: (userId, wordId, data) =>
    withMock(
      () => vocabApi.patch(`/user-words/${wordId}/tag`, { userId, ...data }),
      { success: true, ...data }
    ),
}

/**
 * 나의 단어장 API - 북마크/오답 필터링
 */
export const myWordService = {
  // GET /user-words/review - 나의 단어 목록 (필터링)
  getList: (userId, { bookmarked, incorrectOnly, limit = 20, cursor } = {}) =>
    withMock(
      () => vocabApi.get('/user-words/review', {
        params: { userId, bookmarked, incorrectOnly, limit, cursor }
      }),
      {
        userWords: mockUserWords
          .filter(w => (!bookmarked || w.bookmarked) && (!incorrectOnly || w.incorrectCount > 0))
          .slice(0, limit),
        hasMore: false,
      }
    ),

  // 북마크된 단어 조회
  getBookmarked: (userId, { limit = 20, cursor } = {}) =>
    withMock(
      () => vocabApi.get('/user-words/review', { params: { userId, bookmarked: true, limit, cursor } }),
      { userWords: mockUserWords.filter(w => w.bookmarked).slice(0, limit), hasMore: false }
    ),

  // 오답 단어 조회
  getIncorrect: (userId, { limit = 20, cursor } = {}) =>
    withMock(
      () => vocabApi.get('/user-words/review', { params: { userId, incorrectOnly: true, limit, cursor } }),
      { userWords: mockUserWords.filter(w => w.incorrectCount > 0).slice(0, limit), hasMore: false }
    ),

  // PATCH /user-words/{wordId}/tag - 북마크 토글
  toggleBookmark: (userId, wordId, bookmarked) =>
    withMock(
      () => vocabApi.patch(`/user-words/${wordId}/tag`, { userId, bookmarked }),
      { success: true, wordId, bookmarked }
    ),
}

/**
 * 시험 API - Backend: POST /tests/start, POST /tests/{testId}/submit
 */
export const testService = {
  // POST /tests/start - 시험 시작
  start: (userId, testType = 'DAILY', wordCount = 20, level) =>
    withMock(
      () => vocabApi.post('/tests/start', { userId, testType, wordCount, level }),
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

  // POST /tests/{testId}/submit - 시험 제출
  submit: (userId, testId, answers) =>
    withMock(
      () => vocabApi.post(`/tests/${testId}/submit`, { userId, answers }),
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
  getResults: (userId, { limit = 20, cursor } = {}) =>
    withMock(
      () => vocabApi.get('/tests/results', { params: { userId, limit, cursor } }),
      { testResults: mockTestResults.slice(0, limit), hasMore: false }
    ),
}

/**
 * 통계 API - Backend: GET /statistics
 */
export const statsService = {
  // GET /statistics - 학습 통계 조회
  getOverall: (userId, period = 'ALL') =>
    withMock(
      () => vocabApi.get('/statistics', { params: { userId, period } }),
      {
        totalWords: mockWords.length,
        totalLearned: 15,
        masteredWords: 5,
        learningWords: 8,
        newWords: 7,
        averageSuccessRate: 78.5,
        averageAccuracy: 78.5,
        studyStreak: 7,
        streakDays: 7,
        dailyStats: generateDailyStats().slice(0, 7),
        levelProgress: {
          BEGINNER: { total: 8, learned: 6 },
          INTERMEDIATE: { total: 7, learned: 5 },
          ADVANCED: { total: 5, learned: 2 },
        },
        difficultyDistribution: {
          EASY: 6,
          NORMAL: 9,
          HARD: 5,
        },
      }
    ),

  // GET /statistics - 기간별 통계 (프론트엔드 래핑)
  getDaily: (userId, { limit = 30, period = 'MONTH' } = {}) =>
    withMock(
      () => vocabApi.get('/statistics', { params: { userId, period } }),
      { dailyStats: generateDailyStats().slice(0, limit) }
    ),

  // 취약 단어 조회 (프론트엔드 전용 - 백엔드에서 미구현)
  getWeakness: (userId) =>
    withMock(
      () => vocabApi.get('/statistics', { params: { userId, includeWeak: true } }),
      {
        weakWords: mockUserWords
          .filter(w => w.incorrectCount > 0)
          .sort((a, b) => (a.correctCount / (a.correctCount + a.incorrectCount)) - (b.correctCount / (b.correctCount + b.incorrectCount)))
          .slice(0, 10)
          .map(w => ({
            ...w,
            accuracy: Math.round((w.correctCount / (w.correctCount + w.incorrectCount)) * 100),
          })),
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
      () => vocabApi.post('/voice/synthesize', { wordId, text, voice, type }),
      {
        audioUrl: null, // Mock에서는 실제 오디오 없음
        cached: false,
      }
    ),
}
