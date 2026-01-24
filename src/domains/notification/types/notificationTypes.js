/**
 * 알림 타입 상수
 * @enum {string}
 */
export const NotificationType = {
  BADGE_EARNED: 'BADGE_EARNED',
  DAILY_COMPLETE: 'DAILY_COMPLETE',
  STREAK_REMINDER: 'STREAK_REMINDER',
  TEST_COMPLETE: 'TEST_COMPLETE',
  NEWS_QUIZ_COMPLETE: 'NEWS_QUIZ_COMPLETE',
  GAME_END: 'GAME_END',
  GAME_STREAK: 'GAME_STREAK',
  OPIC_COMPLETE: 'OPIC_COMPLETE',
}

/**
 * @typedef {Object} BadgeEarnedPayload
 * @property {string} badgeType - 배지 타입 코드
 * @property {string} badgeName - 배지 이름
 * @property {string} description - 배지 설명
 * @property {string} iconUrl - 배지 아이콘 URL
 */

/**
 * @typedef {Object} DailyCompletePayload
 * @property {string} date - 학습 완료 날짜 (YYYY-MM-DD)
 * @property {number} wordsLearned - 오늘 학습한 단어 수
 * @property {number} totalWords - 총 학습 단어 수
 * @property {number} currentStreak - 현재 연속 학습 일수
 */

/**
 * @typedef {Object} StreakReminderPayload
 * @property {number} currentStreak - 현재 연속 학습 일수
 * @property {string} message - 리마인더 메시지
 */

/**
 * @typedef {Object} TestCompletePayload
 * @property {string} testId - 테스트 ID
 * @property {number} score - 점수 (0-100)
 * @property {number} correctCount - 맞힌 문제 수
 * @property {number} totalCount - 전체 문제 수
 * @property {boolean} isPerfect - 만점 여부
 */

/**
 * @typedef {Object} NewsQuizCompletePayload
 * @property {string} articleId - 뉴스 기사 ID
 * @property {string} articleTitle - 기사 제목
 * @property {number} score - 점수 (0-100)
 * @property {number} correctCount - 맞힌 문제 수
 * @property {number} totalCount - 전체 문제 수
 * @property {boolean} isPerfect - 만점 여부
 */

/**
 * @typedef {Object} GameEndPayload
 * @property {string} roomId - 게임 방 ID
 * @property {string} gameSessionId - 게임 세션 ID
 * @property {number} rank - 최종 순위
 * @property {number} totalPlayers - 전체 플레이어 수
 * @property {number} score - 획득 점수
 * @property {boolean} isWinner - 1등 여부
 */

/**
 * @typedef {Object} GameStreakPayload
 * @property {string} roomId - 게임 방 ID
 * @property {number} streakCount - 연속 정답 횟수
 * @property {number} bonusPoints - 보너스 점수
 */

/**
 * @typedef {Object} OpicCompletePayload
 * @property {string} sessionId - 세션 ID
 * @property {string} estimatedLevel - 예상 등급 (IM1, IM2, IH, AL 등)
 * @property {number} questionsAnswered - 답변한 문제 수
 * @property {string} feedbackSummary - 피드백 요약
 */

/**
 * @typedef {Object} Notification
 * @property {string} notificationId - 알림 ID ("notif-xxxxxxxx" 형식)
 * @property {string} type - 알림 타입
 * @property {string} userId - 대상 사용자 ID
 * @property {Object} payload - 타입별 상세 데이터
 * @property {string} createdAt - ISO-8601 형식 생성 시간
 * @property {boolean} [isRead] - 읽음 여부 (클라이언트 관리)
 */

/**
 * 알림 타입별 아이콘 및 스타일 설정
 */
export const NotificationConfig = {
  [NotificationType.BADGE_EARNED]: {
    icon: '🏆',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    titleKo: '배지 획득!',
    titleEn: 'Badge Earned!',
  },
  [NotificationType.DAILY_COMPLETE]: {
    icon: '✅',
    color: '#10b981',
    bgColor: '#ecfdf5',
    titleKo: '오늘의 학습 완료!',
    titleEn: 'Daily Learning Complete!',
  },
  [NotificationType.STREAK_REMINDER]: {
    icon: '⏰',
    color: '#f97316',
    bgColor: '#fff7ed',
    titleKo: '학습 리마인더',
    titleEn: 'Study Reminder',
  },
  [NotificationType.TEST_COMPLETE]: {
    icon: '📝',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    titleKo: '테스트 완료',
    titleEn: 'Test Complete',
  },
  [NotificationType.NEWS_QUIZ_COMPLETE]: {
    icon: '📰',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    titleKo: '뉴스 퀴즈 완료',
    titleEn: 'News Quiz Complete',
  },
  [NotificationType.GAME_END]: {
    icon: '🎮',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    titleKo: '게임 종료',
    titleEn: 'Game Over',
  },
  [NotificationType.GAME_STREAK]: {
    icon: '🔥',
    color: '#ef4444',
    bgColor: '#fef2f2',
    titleKo: '연속 정답!',
    titleEn: 'Answer Streak!',
  },
  [NotificationType.OPIC_COMPLETE]: {
    icon: '🎤',
    color: '#059669',
    bgColor: '#ecfdf5',
    titleKo: 'OPIc 연습 완료',
    titleEn: 'OPIc Practice Complete',
  },
}

/**
 * 알림 payload에서 표시할 메시지 생성
 * @param {Notification} notification
 * @param {boolean} isKorean
 * @returns {string}
 */
export function getNotificationMessage(notification, isKorean = true) {
  const { type, payload } = notification

  switch (type) {
    case NotificationType.BADGE_EARNED:
      return isKorean
        ? `"${payload.badgeName}" 배지를 획득했습니다!`
        : `You earned the "${payload.badgeName}" badge!`

    case NotificationType.DAILY_COMPLETE:
      return isKorean
        ? `${payload.wordsLearned}개 단어 학습 완료! (${payload.currentStreak}일 연속)`
        : `${payload.wordsLearned} words learned! (${payload.currentStreak} day streak)`

    case NotificationType.STREAK_REMINDER:
      return payload.message

    case NotificationType.TEST_COMPLETE:
      return isKorean
        ? `테스트 점수: ${payload.score}점 (${payload.correctCount}/${payload.totalCount})`
        : `Test score: ${payload.score} (${payload.correctCount}/${payload.totalCount})`

    case NotificationType.NEWS_QUIZ_COMPLETE:
      return isKorean
        ? `"${payload.articleTitle}" 퀴즈 완료! ${payload.score}점`
        : `"${payload.articleTitle}" quiz done! Score: ${payload.score}`

    case NotificationType.GAME_END:
      return isKorean
        ? `${payload.rank}등으로 게임 종료! (${payload.score}점)`
        : `Game over! Rank: #${payload.rank} (${payload.score} pts)`

    case NotificationType.GAME_STREAK:
      return isKorean
        ? `${payload.streakCount}연속 정답! +${payload.bonusPoints}점 보너스`
        : `${payload.streakCount} streak! +${payload.bonusPoints} bonus`

    case NotificationType.OPIC_COMPLETE:
      return isKorean
        ? `예상 등급: ${payload.estimatedLevel} (${payload.questionsAnswered}문제)`
        : `Estimated level: ${payload.estimatedLevel} (${payload.questionsAnswered} questions)`

    default:
      return isKorean ? '새 알림이 도착했습니다.' : 'New notification received.'
  }
}

/**
 * 시간 경과 표시 포맷
 * @param {string} createdAt - ISO-8601 날짜 문자열
 * @param {boolean} isKorean
 * @returns {string}
 */
export function formatTimeAgo(createdAt, isKorean = true) {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return isKorean ? '방금 전' : 'Just now'
  }
  if (diffMins < 60) {
    return isKorean ? `${diffMins}분 전` : `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return isKorean ? `${diffHours}시간 전` : `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return isKorean ? `${diffDays}일 전` : `${diffDays}d ago`
  }

  return created.toLocaleDateString(isKorean ? 'ko-KR' : 'en-US', {
    month: 'short',
    day: 'numeric',
  })
}
