/**
 * Grammar domain constants
 * Based on Backend GrammarErrorType enum
 */

// 문법 오류 타입
export const GRAMMAR_ERROR_TYPES = {
  VERB_TENSE: 'VERB_TENSE',
  SUBJECT_VERB_AGREEMENT: 'SUBJECT_VERB_AGREEMENT',
  ARTICLE: 'ARTICLE',
  PREPOSITION: 'PREPOSITION',
  WORD_ORDER: 'WORD_ORDER',
  PLURAL_SINGULAR: 'PLURAL_SINGULAR',
  PRONOUN: 'PRONOUN',
  SPELLING: 'SPELLING',
  PUNCTUATION: 'PUNCTUATION',
  WORD_CHOICE: 'WORD_CHOICE',
  SENTENCE_STRUCTURE: 'SENTENCE_STRUCTURE',
  OTHER: 'OTHER',
}

// 문법 오류 타입 라벨 (한국어)
export const GRAMMAR_ERROR_LABELS_KO = {
  VERB_TENSE: '동사 시제',
  SUBJECT_VERB_AGREEMENT: '주어-동사 일치',
  ARTICLE: '관사',
  PREPOSITION: '전치사',
  WORD_ORDER: '어순',
  PLURAL_SINGULAR: '단수/복수',
  PRONOUN: '대명사',
  SPELLING: '철자',
  PUNCTUATION: '구두점',
  WORD_CHOICE: '단어 선택',
  SENTENCE_STRUCTURE: '문장 구조',
  OTHER: '기타',
}

// 문법 오류 타입 라벨 (영어)
export const GRAMMAR_ERROR_LABELS_EN = {
  VERB_TENSE: 'Verb Tense',
  SUBJECT_VERB_AGREEMENT: 'Subject-Verb Agreement',
  ARTICLE: 'Article',
  PREPOSITION: 'Preposition',
  WORD_ORDER: 'Word Order',
  PLURAL_SINGULAR: 'Singular/Plural',
  PRONOUN: 'Pronoun',
  SPELLING: 'Spelling',
  PUNCTUATION: 'Punctuation',
  WORD_CHOICE: 'Word Choice',
  SENTENCE_STRUCTURE: 'Sentence Structure',
  OTHER: 'Other',
}

// 문법 오류 타입별 색상
export const GRAMMAR_ERROR_COLORS = {
  VERB_TENSE: '#ef4444',
  SUBJECT_VERB_AGREEMENT: '#f97316',
  ARTICLE: '#eab308',
  PREPOSITION: '#22c55e',
  WORD_ORDER: '#06b6d4',
  PLURAL_SINGULAR: '#3b82f6',
  PRONOUN: '#8b5cf6',
  SPELLING: '#ec4899',
  PUNCTUATION: '#6b7280',
  WORD_CHOICE: '#14b8a6',
  SENTENCE_STRUCTURE: '#f59e0b',
  OTHER: '#9ca3af',
}

// 문법 오류 타입별 배경 색상 (밝은 버전)
export const GRAMMAR_ERROR_BG_COLORS = {
  VERB_TENSE: '#fef2f2',
  SUBJECT_VERB_AGREEMENT: '#fff7ed',
  ARTICLE: '#fefce8',
  PREPOSITION: '#f0fdf4',
  WORD_ORDER: '#ecfeff',
  PLURAL_SINGULAR: '#eff6ff',
  PRONOUN: '#f5f3ff',
  SPELLING: '#fdf2f8',
  PUNCTUATION: '#f9fafb',
  WORD_CHOICE: '#f0fdfa',
  SENTENCE_STRUCTURE: '#fffbeb',
  OTHER: '#f3f4f6',
}

// 학습 레벨
export const GRAMMAR_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
}

// 학습 레벨 라벨 (한국어)
export const GRAMMAR_LEVEL_LABELS_KO = {
  BEGINNER: '초급',
  INTERMEDIATE: '중급',
  ADVANCED: '고급',
}

// 학습 레벨 라벨 (영어)
export const GRAMMAR_LEVEL_LABELS_EN = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

// 학습 레벨 설명 (한국어)
export const GRAMMAR_LEVEL_DESC_KO = {
  BEGINNER: '한국어 번역 포함, 쉬운 설명',
  INTERMEDIATE: '영어 설명, 일반적인 패턴 학습',
  ADVANCED: '상세한 문법 규칙, 뉘앙스 학습',
}

// 학습 레벨 설명 (영어)
export const GRAMMAR_LEVEL_DESC_EN = {
  BEGINNER: 'Korean translations, simple explanations',
  INTERMEDIATE: 'English explanations, common patterns',
  ADVANCED: 'Detailed rules, nuanced usage',
}

// 학습 레벨 색상
export const GRAMMAR_LEVEL_COLORS = {
  BEGINNER: '#059669',
  INTERMEDIATE: '#f97316',
  ADVANCED: '#ef4444',
}

// 학습 레벨 배경 색상
export const GRAMMAR_LEVEL_BG_COLORS = {
  BEGINNER: '#ecfdf5',
  INTERMEDIATE: '#fff7ed',
  ADVANCED: '#fef2f2',
}

// 점수 등급
export const SCORE_GRADES = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent', labelKo: '훌륭해요!' },
  GOOD: { min: 70, max: 89, label: 'Good', labelKo: '잘했어요!' },
  FAIR: { min: 50, max: 69, label: 'Fair', labelKo: '괜찮아요' },
  POOR: { min: 0, max: 49, label: 'Needs Practice', labelKo: '더 연습해요' },
}

// 점수에 따른 등급 반환
export const getScoreGrade = (score) => {
  if (score >= 90) return SCORE_GRADES.EXCELLENT
  if (score >= 70) return SCORE_GRADES.GOOD
  if (score >= 50) return SCORE_GRADES.FAIR
  return SCORE_GRADES.POOR
}

// 점수에 따른 색상 반환
export const getScoreColor = (score) => {
  if (score >= 90) return '#059669'
  if (score >= 70) return '#f97316'
  if (score >= 50) return '#eab308'
  return '#ef4444'
}

// 메시지 역할
export const MESSAGE_ROLES = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
}

// 텍스트 제한
export const TEXT_LIMITS = {
  MIN_SENTENCE_LENGTH: 3,
  MAX_SENTENCE_LENGTH: 500,
  MAX_MESSAGE_LENGTH: 1000,
}

export default {
  GRAMMAR_ERROR_TYPES,
  GRAMMAR_ERROR_LABELS_KO,
  GRAMMAR_ERROR_LABELS_EN,
  GRAMMAR_ERROR_COLORS,
  GRAMMAR_ERROR_BG_COLORS,
  GRAMMAR_LEVELS,
  GRAMMAR_LEVEL_LABELS_KO,
  GRAMMAR_LEVEL_LABELS_EN,
  GRAMMAR_LEVEL_DESC_KO,
  GRAMMAR_LEVEL_DESC_EN,
  GRAMMAR_LEVEL_COLORS,
  GRAMMAR_LEVEL_BG_COLORS,
  SCORE_GRADES,
  getScoreGrade,
  getScoreColor,
  MESSAGE_ROLES,
  TEXT_LIMITS,
}
