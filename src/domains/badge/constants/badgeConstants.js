/**
 * Badge domain constants
 * Based on Backend BadgeType enum
 */

// 배지 타입
export const BADGE_TYPES = {
  FIRST_STEP: 'FIRST_STEP',
  STREAK_3: 'STREAK_3',
  STREAK_7: 'STREAK_7',
  STREAK_30: 'STREAK_30',
  WORDS_100: 'WORDS_100',
  WORDS_500: 'WORDS_500',
  WORDS_1000: 'WORDS_1000',
  PERFECT_SCORE: 'PERFECT_SCORE',
  TEST_10: 'TEST_10',
  ACCURACY_90: 'ACCURACY_90',
  GAME_FIRST_PLAY: 'GAME_FIRST_PLAY',
  GAME_10_WINS: 'GAME_10_WINS',
  QUICK_GUESSER: 'QUICK_GUESSER',
  PERFECT_DRAWER: 'PERFECT_DRAWER',
  MASTER: 'MASTER',
}

// 배지 카테고리
export const BADGE_CATEGORIES = {
  FIRST_STUDY: 'FIRST_STUDY',
  STREAK: 'STREAK',
  WORDS_LEARNED: 'WORDS_LEARNED',
  PERFECT_TEST: 'PERFECT_TEST',
  TESTS_COMPLETED: 'TESTS_COMPLETED',
  ACCURACY: 'ACCURACY',
  GAMES_PLAYED: 'GAMES_PLAYED',
  GAMES_WON: 'GAMES_WON',
  QUICK_GUESSES: 'QUICK_GUESSES',
  PERFECT_DRAWS: 'PERFECT_DRAWS',
  ALL_BADGES: 'ALL_BADGES',
}

// 배지 카테고리 라벨 (한국어)
export const BADGE_CATEGORY_LABELS_KO = {
  FIRST_STUDY: '첫 시작',
  STREAK: '연속 학습',
  WORDS_LEARNED: '단어 학습',
  PERFECT_TEST: '완벽한 테스트',
  TESTS_COMPLETED: '테스트 완료',
  ACCURACY: '정확도',
  GAMES_PLAYED: '게임 참여',
  GAMES_WON: '게임 승리',
  QUICK_GUESSES: '빠른 정답',
  PERFECT_DRAWS: '완벽한 출제',
  ALL_BADGES: '마스터',
}

// 배지 카테고리 라벨 (영어)
export const BADGE_CATEGORY_LABELS_EN = {
  FIRST_STUDY: 'First Steps',
  STREAK: 'Streak',
  WORDS_LEARNED: 'Words Learned',
  PERFECT_TEST: 'Perfect Test',
  TESTS_COMPLETED: 'Tests Completed',
  ACCURACY: 'Accuracy',
  GAMES_PLAYED: 'Games Played',
  GAMES_WON: 'Games Won',
  QUICK_GUESSES: 'Quick Guesser',
  PERFECT_DRAWS: 'Perfect Drawer',
  ALL_BADGES: 'Master',
}

// 배지 카테고리 색상
export const BADGE_CATEGORY_COLORS = {
  FIRST_STUDY: '#10b981',
  STREAK: '#f59e0b',
  WORDS_LEARNED: '#3b82f6',
  PERFECT_TEST: '#8b5cf6',
  TESTS_COMPLETED: '#06b6d4',
  ACCURACY: '#ec4899',
  GAMES_PLAYED: '#14b8a6',
  GAMES_WON: '#f97316',
  QUICK_GUESSES: '#6366f1',
  PERFECT_DRAWS: '#84cc16',
  ALL_BADGES: '#eab308',
}

// 배지 이름 (영어 - 백엔드는 한국어만 제공하므로 프론트에서 번역)
export const BADGE_NAMES_EN = {
  FIRST_STEP: 'First Step',
  STREAK_3: '3-Day Streak',
  STREAK_7: 'Week Streak',
  STREAK_30: 'Month Streak',
  WORDS_100: 'Word Collector',
  WORDS_500: 'Word Expert',
  WORDS_1000: 'Word Master',
  PERFECT_SCORE: 'Perfectionist',
  TEST_10: 'Test Challenger',
  ACCURACY_90: 'Accuracy Pro',
  GAME_FIRST_PLAY: 'First Game',
  GAME_10_WINS: '10 Wins',
  QUICK_GUESSER: 'Lightning Fast',
  PERFECT_DRAWER: 'Perfect Host',
  MASTER: 'Learning Master',
}

// 배지 설명 (영어)
export const BADGE_DESCRIPTIONS_EN = {
  FIRST_STEP: 'Completed your first study session',
  STREAK_3: 'Studied for 3 consecutive days',
  STREAK_7: 'Studied for 7 consecutive days',
  STREAK_30: 'Studied for 30 consecutive days',
  WORDS_100: 'Learned 100 words',
  WORDS_500: 'Learned 500 words',
  WORDS_1000: 'Learned 1000 words',
  PERFECT_SCORE: 'Got a perfect score on a test',
  TEST_10: 'Completed 10 tests',
  ACCURACY_90: 'Achieved 90% overall accuracy',
  GAME_FIRST_PLAY: 'Played your first game',
  GAME_10_WINS: 'Won 10 games',
  QUICK_GUESSER: 'Answered correctly within 5 seconds',
  PERFECT_DRAWER: 'All players guessed your drawing correctly',
  MASTER: 'Achieved all badges',
}

export default {
  BADGE_TYPES,
  BADGE_CATEGORIES,
  BADGE_CATEGORY_LABELS_KO,
  BADGE_CATEGORY_LABELS_EN,
  BADGE_CATEGORY_COLORS,
  BADGE_NAMES_EN,
  BADGE_DESCRIPTIONS_EN,
}
