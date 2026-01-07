import vocabApi from '../../../api/vocabApi'

/**
 * 단어 관리 API (#65)
 */
export const wordService = {
  // 단어 목록 조회
  getList: ({ level, category, limit = 20, cursor } = {}) =>
    vocabApi.get('/vocab/words', { params: { level, category, limit, cursor } }),

  // 단어 목록 조회 (alias)
  getWords: (params) =>
    vocabApi.get('/vocab/words', { params }),

  // 단어 검색
  search: ({ q, limit = 20, cursor } = {}) =>
    vocabApi.get('/vocab/words/search', { params: { q, limit, cursor } }),

  // 단어 상세 조회
  getDetail: (wordId) =>
    vocabApi.get(`/vocab/words/${wordId}`),
}

/**
 * 일일 학습 API (#66)
 */
export const dailyService = {
  // 오늘의 학습 단어 조회
  getWords: (userId) =>
    vocabApi.get(`/vocab/daily/${userId}`),

  // 단어 학습 완료 표시
  markLearned: (userId, wordId, isCorrect) =>
    vocabApi.post(`/vocab/daily/${userId}/words/${wordId}/learned`, { isCorrect }),
}

/**
 * 사용자 단어 학습 상태 API (#67)
 */
export const userWordService = {
  // 학습 상태 조회
  getList: (userId, { status, limit = 20, cursor } = {}) =>
    vocabApi.get(`/vocab/users/${userId}/words`, { params: { status, limit, cursor } }),

  // 사용자 단어 정보 조회 (wordIds로 조회)
  getUserWords: (userId, params) =>
    vocabApi.get(`/vocab/users/${userId}/words`, { params }),

  // 학습 결과 업데이트 (정답/오답)
  update: (userId, wordId, isCorrect) =>
    vocabApi.put(`/vocab/users/${userId}/words/${wordId}`, { isCorrect }),

  // 단어 태그 변경 (북마크/즐겨찾기/난이도)
  updateTag: (userId, wordId, { bookmarked, favorite, difficulty }) =>
    vocabApi.put(`/vocab/users/${userId}/words/${wordId}/tag`, { bookmarked, favorite, difficulty }),

  // 사용자 단어 업데이트 (alias for updateTag)
  updateUserWord: (userId, wordId, data) =>
    vocabApi.put(`/vocab/users/${userId}/words/${wordId}/tag`, data),
}

/**
 * 시험 API (#68)
 */
export const testService = {
  // 시험 시작
  start: (userId, { wordCount = 20, level, type = 'ENGLISH_TO_KOREAN' } = {}) =>
    vocabApi.post(`/vocab/test/${userId}/start`, { wordCount, level, type }),

  // 답안 제출
  submit: (userId, testId, answers) =>
    vocabApi.post(`/vocab/test/${userId}/submit`, { testId, answers }),

  // 시험 결과 조회
  getResults: (userId, { limit = 20, cursor } = {}) =>
    vocabApi.get(`/vocab/test/${userId}/results`, { params: { limit, cursor } }),
}

/**
 * 통계 API (#69)
 */
export const statsService = {
  // 전체 학습 통계
  getOverall: (userId) =>
    vocabApi.get(`/vocab/stats/${userId}`),

  // 일별 학습 통계
  getDaily: (userId, { limit = 30 } = {}) =>
    vocabApi.get(`/vocab/stats/${userId}/daily`, { params: { limit } }),

  // 약점 분석
  getWeakness: (userId) =>
    vocabApi.get(`/vocab/stats/${userId}/weakness`),
}

/**
 * 음성 API (TTS) (#70)
 */
export const voiceService = {
  // 단어 발음 합성
  synthesize: (wordId, text, voice = 'FEMALE') =>
    vocabApi.post('/vocab/voice/synthesize', { wordId, text, voice }),
}
