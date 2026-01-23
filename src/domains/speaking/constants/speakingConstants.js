export const SPEAKING_LEVELS = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED',
}

export const SPEAKING_LEVEL_COLORS = {
    [SPEAKING_LEVELS.BEGINNER]: '#22c55e',      // 초록
    [SPEAKING_LEVELS.INTERMEDIATE]: '#f59e0b',  // 주황
    [SPEAKING_LEVELS.ADVANCED]: '#ef4444',      // 빨강
}

export const SPEAKING_LEVEL_LABELS = {
    ko: {
        [SPEAKING_LEVELS.BEGINNER]: '초급',
        [SPEAKING_LEVELS.INTERMEDIATE]: '중급',
        [SPEAKING_LEVELS.ADVANCED]: '고급',
    },
    en: {
        [SPEAKING_LEVELS.BEGINNER]: 'Beginner',
        [SPEAKING_LEVELS.INTERMEDIATE]: 'Intermediate',
        [SPEAKING_LEVELS.ADVANCED]: 'Advanced',
    },
}

// 음성 녹음 설정
export const AUDIO_CONFIG = {
    MAX_DURATION: 60000,    // 최대 녹음 시간 (60초)
    MIME_TYPE: 'audio/webm',
    SAMPLE_RATE: 16000,
}