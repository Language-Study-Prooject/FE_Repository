// 학습 레벨
export const LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
}

export const LEVEL_LABELS = {
  [LEVELS.BEGINNER]: '초급',
  [LEVELS.INTERMEDIATE]: '중급',
  [LEVELS.ADVANCED]: '고급',
}

export const LEVEL_COLORS = {
  [LEVELS.BEGINNER]: 'success',
  [LEVELS.INTERMEDIATE]: 'warning',
  [LEVELS.ADVANCED]: 'error',
}

// 카테고리
export const CATEGORIES = {
  DAILY: 'DAILY',
  BUSINESS: 'BUSINESS',
  ACADEMIC: 'ACADEMIC',
}

export const CATEGORY_LABELS = {
  [CATEGORIES.DAILY]: '일상',
  [CATEGORIES.BUSINESS]: '비즈니스',
  [CATEGORIES.ACADEMIC]: '학술',
}

// 학습 상태
export const WORD_STATUS = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  REVIEWING: 'REVIEWING',
  MASTERED: 'MASTERED',
}

export const WORD_STATUS_LABELS = {
  [WORD_STATUS.NEW]: '새 단어',
  [WORD_STATUS.LEARNING]: '학습 중',
  [WORD_STATUS.REVIEWING]: '복습 중',
  [WORD_STATUS.MASTERED]: '암기 완료',
}

export const WORD_STATUS_COLORS = {
  [WORD_STATUS.NEW]: 'default',
  [WORD_STATUS.LEARNING]: 'warning',
  [WORD_STATUS.REVIEWING]: 'info',
  [WORD_STATUS.MASTERED]: 'success',
}

// 난이도
export const DIFFICULTY = {
  EASY: 'EASY',
  NORMAL: 'NORMAL',
  HARD: 'HARD',
}

export const DIFFICULTY_LABELS = {
  [DIFFICULTY.EASY]: '쉬움',
  [DIFFICULTY.NORMAL]: '보통',
  [DIFFICULTY.HARD]: '어려움',
}

// 시험 유형
export const TEST_TYPES = {
  KOREAN_TO_ENGLISH: 'KOREAN_TO_ENGLISH',
  ENGLISH_TO_KOREAN: 'ENGLISH_TO_KOREAN',
}

export const TEST_TYPE_LABELS = {
  [TEST_TYPES.KOREAN_TO_ENGLISH]: '한국어 → 영어',
  [TEST_TYPES.ENGLISH_TO_KOREAN]: '영어 → 한국어',
}

// TTS 음성
export const VOICE_TYPES = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
}

export const VOICE_LABELS = {
  [VOICE_TYPES.MALE]: '남성',
  [VOICE_TYPES.FEMALE]: '여성',
}

// 일일 학습 목표
export const DAILY_GOAL = {
  NEW_WORDS: 50,
  REVIEW_WORDS: 5,
  TOTAL: 55,
}
