/**
 * OPIc domain constants
 * Based on grammarConstants.js pattern
 */

// ============================================
// 주제 타입
// ============================================
export const OPIC_TOPICS = {
    DESCRIPTION: 'DESCRIPTION',
    HABIT: 'HABIT',
    PAST_EXPERIENCE: 'PAST_EXPERIENCE',
    COMPARISON: 'COMPARISON',
    ROLE_PLAY: 'ROLE_PLAY',
    ISSUE: 'ISSUE',
}


export const OPIC_TOPIC_LABELS = {
    DESCRIPTION: { ko: '단순 묘사', en: 'Description' },
    HABIT: { ko: '습관/경향', en: 'Habit' },
    PAST_EXPERIENCE: { ko: '과거 경험', en: 'Past Experience' },
    COMPARISON: { ko: '비교', en: 'Comparison' },
    ROLE_PLAY: { ko: '롤플레이', en: 'Role Play' },
    ISSUE: { ko: '사회 이슈/심화', en: 'Social Issues' },
}

// 주제별 아이콘
export const OPIC_TOPIC_ICONS = {
    DESCRIPTION: '🏠',
    HABIT: '🔄',
    PAST_EXPERIENCE: '📅',
}

// 주제별 색상
export const OPIC_TOPIC_COLORS = {
    DESCRIPTION: '#3b82f6',
    HABIT: '#22c55e',
    PAST_EXPERIENCE: '#f97316',
}

// ============================================
// 세부 주제
// ============================================
export const OPIC_SUBTOPICS = [
    { value: 'BANKS', labelKo: '은행', labelEn: 'Banks' },
    { value: 'BARS', labelKo: '술집/바', labelEn: 'Bars' },
    { value: 'CAFES', labelKo: '카페', labelEn: 'Cafes' },
    { value: 'CONCERTS', labelKo: '콘서트', labelEn: 'Concerts' },
    { value: 'FAMILY', labelKo: '가족', labelEn: 'Family' },
    { value: 'FURNITURE', labelKo: '가구', labelEn: 'Furniture' },
    { value: 'GAMES', labelKo: '게임', labelEn: 'Games' },
    { value: 'GYM', labelKo: '헬스장', labelEn: 'Gym' },
    { value: 'HEALTH', labelKo: '건강', labelEn: 'Health' },
    { value: 'HOLIDAYS', labelKo: '명절/휴일', labelEn: 'Holidays' },
    { value: 'HOMES', labelKo: '집', labelEn: 'Homes' },
    { value: 'HOTEL', labelKo: '호텔', labelEn: 'Hotel' },
    { value: 'INTERNET', labelKo: '인터넷', labelEn: 'Internet' },
    { value: 'MOVIES', labelKo: '영화', labelEn: 'Movies' },
    { value: 'MUSIC', labelKo: '음악', labelEn: 'Music' },
    { value: 'PARKS', labelKo: '공원', labelEn: 'Parks' },
    { value: 'PHONE', labelKo: '전화기', labelEn: 'Phone' },
    { value: 'RECYCLING', labelKo: '재활용', labelEn: 'Recycling' },
    { value: 'RESTAURANTS', labelKo: '식당', labelEn: 'Restaurants' },
    { value: 'SHOPPING', labelKo: '쇼핑', labelEn: 'Shopping' },
    { value: 'TECHNOLOGY', labelKo: '기술', labelEn: 'Technology' },
    { value: 'TRAVEL', labelKo: '여행', labelEn: 'Travel' },
    { value: 'VACATION', labelKo: '휴가', labelEn: 'Vacation' },
    { value: 'WEATHER', labelKo: '날씨', labelEn: 'Weather' },
    { value: 'FREESTYLE', labelKo: '돌발/자유', labelEn: 'Freestyle' },
    { value: 'GENERAL', labelKo: '일반', labelEn: 'General' },
];

// ============================================
// 레벨
// ============================================
export const OPIC_LEVELS = {
    IM1: 'IM1',
    IM2: 'IM2',
    IM3: 'IM3',
    IH: 'IH',
    AL: 'AL',
}

export const OPIC_LEVEL_LABELS = {
    IM1: { ko: 'IM1 (중급 하)', en: 'IM1 (Intermediate Mid 1)' },
    IM2: { ko: 'IM2 (중급 중)', en: 'IM2 (Intermediate Mid 2)' },
    IM3: { ko: 'IM3 (중급 상)', en: 'IM3 (Intermediate Mid 3)' },
    IH: { ko: 'IH (중상급)', en: 'IH (Intermediate High)' },
    AL: { ko: 'AL (고급)', en: 'AL (Advanced Low)' },
}

// 레벨별 색상
export const OPIC_LEVEL_COLORS = {
    IM1: '#22c55e',
    IM2: '#3b82f6',
    IM3: '#8b5cf6',
    IH: '#f97316',
}

// 레벨별 배경 색상
export const OPIC_LEVEL_BG_COLORS = {
    IM1: '#f0fdf4',
    IM2: '#eff6ff',
    IM3: '#f5f3ff',
    IH: '#fff7ed',
}

// ============================================
// UI 번역 (한국어)
// ============================================
export const OPIC_UI_KO = {
    // 헤더
    title: 'OPIc 스피킹 테스트',
    subtitle: 'AI 기반 영어 스피킹 연습 및 피드백',

    // 세션 설정
    sessionSetup: '세션 설정',
    topic: '주제',
    subTopic: '세부 주제',
    targetLevel: '목표 레벨',
    start: '시작하기',

    // 질문
    question: '질문',
    listenQuestion: '질문 듣기',

    // 녹음
    recordAnswer: '답변 녹음',
    startRecording: '녹음 시작',
    stopRecording: '녹음 중지',
    recording: '녹음 중...',
    recordingReady: '녹음 완료',
    playToReview: '재생하여 확인하세요',
    reRecord: '다시 녹음',

    // 제출
    getUploadUrl: 'Upload URL 발급',
    preparing: '준비 중...',
    submitAnswer: '답변 제출',
    submitting: '제출 중...',

    // 피드백
    aiFeedback: 'AI 피드백',
    yourAnswer: '내 답변',
    correctedAnswer: '교정된 답변',
    modelAnswer: '모범 답변',
    grammarErrors: '문법 오류',

    // 네비게이션
    nextQuestion: '다음 질문',
    completeSession: '세션 완료',
    completing: '완료 중...',

    // 결과
    sessionCompleted: '세션이 완료되었습니다!',
    checkReport: '리포트를 확인하세요.',
    overallScore: '종합 점수',
    totalQuestions: '총 질문 수',
    answeredQuestions: '답변한 질문',

    // 에러
    errorCreateSession: '세션 생성에 실패했습니다',
    errorGetQuestion: '다음 질문을 불러오는데 실패했습니다',
    errorStartRecording: '녹음을 시작할 수 없습니다',
    errorGetUploadUrl: 'Upload URL 발급에 실패했습니다',
    errorSubmitAnswer: '답변 제출에 실패했습니다',
    errorCompleteSession: '세션 완료에 실패했습니다',

    // 마이크 권한
    micPermissionRequired: '마이크 권한이 필요합니다',
    micPermissionDenied: '마이크 권한이 거부되었습니다',
}

// ============================================
// UI 번역 (영어)
// ============================================
export const OPIC_UI_EN = {
    // 헤더
    title: 'OPIc Speaking Test',
    subtitle: 'AI-powered English speaking practice & feedback',

    // 세션 설정
    sessionSetup: 'Session Setup',
    topic: 'Topic',
    subTopic: 'Sub Topic',
    targetLevel: 'Target Level',
    start: 'Start Session',

    // 질문
    question: 'Question',
    listenQuestion: 'Listen to question',

    // 녹음
    recordAnswer: 'Record Answer',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    recording: 'Recording...',
    recordingReady: 'Recording Ready',
    playToReview: 'Play to review',
    reRecord: 'Re-record',

    // 제출
    getUploadUrl: 'Get Upload URL',
    preparing: 'Preparing...',
    submitAnswer: 'Submit Answer',
    submitting: 'Submitting...',

    // 피드백
    aiFeedback: 'AI Feedback',
    yourAnswer: 'Your Answer',
    correctedAnswer: 'Corrected Answer',
    modelAnswer: 'Model Answer',
    grammarErrors: 'Grammar Errors',

    // 네비게이션
    nextQuestion: 'Next Question',
    completeSession: 'Complete Session',
    completing: 'Completing...',

    // 결과
    sessionCompleted: 'Session completed!',
    checkReport: 'Check your report.',
    overallScore: 'Overall Score',
    totalQuestions: 'Total Questions',
    answeredQuestions: 'Answered Questions',

    // 에러
    errorCreateSession: 'Failed to create session',
    errorGetQuestion: 'Failed to get next question',
    errorStartRecording: 'Failed to start recording',
    errorGetUploadUrl: 'Failed to get upload URL',
    errorSubmitAnswer: 'Failed to submit answer',
    errorCompleteSession: 'Failed to complete session',

    // 마이크 권한
    micPermissionRequired: 'Microphone permission required',
    micPermissionDenied: 'Microphone permission denied',
}

// ============================================
// 점수 등급 (grammarConstants 패턴)
// ============================================
export const OPIC_SCORE_GRADES = {
    EXCELLENT: { min: 90, max: 100, label: 'Excellent', labelKo: '훌륭해요!' },
    GOOD: { min: 70, max: 89, label: 'Good', labelKo: '잘했어요!' },
    FAIR: { min: 50, max: 69, label: 'Fair', labelKo: '괜찮아요' },
    POOR: { min: 0, max: 49, label: 'Needs Practice', labelKo: '더 연습해요' },
}

// 점수에 따른 등급 반환
export const getOpicScoreGrade = (score) => {
    if (score >= 90) return OPIC_SCORE_GRADES.EXCELLENT
    if (score >= 70) return OPIC_SCORE_GRADES.GOOD
    if (score >= 50) return OPIC_SCORE_GRADES.FAIR
    return OPIC_SCORE_GRADES.POOR
}

// 점수에 따른 색상 반환
export const getOpicScoreColor = (score) => {
    if (score >= 90) return '#059669'
    if (score >= 70) return '#3b82f6'
    if (score >= 50) return '#f97316'
    return '#ef4444'
}

// ============================================
// 설정값
// ============================================
export const OPIC_CONFIG = {
    DEFAULT_TOTAL_QUESTIONS: 12,
    MAX_RECORDING_TIME: 120, // 2분
    MIN_RECORDING_TIME: 5,   // 5초
    AUDIO_MIME_TYPE: 'audio/webm',
    FALLBACK_MIME_TYPE: 'audio/mp4',
}

// ============================================
// 헬퍼 함수 (오류 수정됨)
// ============================================

// 언어에 따른 주제 라벨 반환
export const getTopicLabel = (topic, isKorean) => {
    const labelObj = OPIC_TOPIC_LABELS[topic];
    return labelObj ? (isKorean ? labelObj.ko : labelObj.en) : topic;
}

// 언어에 따른 세부주제 라벨 반환
export const getSubtopicLabel = (subtopicValue, isKorean) => {
    const found = OPIC_SUBTOPICS.find(item => item.value === subtopicValue);
    if (!found) return subtopicValue;
    return isKorean ? found.labelKo : found.labelEn;
}

// 언어에 따른 레벨 라벨 반환
export const getLevelLabel = (level, isKorean) => {
    const labelObj = OPIC_LEVEL_LABELS[level];
    return labelObj ? (isKorean ? labelObj.ko : labelObj.en) : level;
}

// 녹음 시간 포맷 (mm:ss)
export const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default {
    OPIC_TOPICS,
    OPIC_TOPIC_LABELS,
    OPIC_TOPIC_ICONS,
    OPIC_SUBTOPICS,
    OPIC_LEVELS,
    OPIC_LEVEL_LABELS,
    getTopicLabel,
    getSubtopicLabel,
    getLevelLabel,
    formatRecordingTime,
}