import badgeApi from '../../../api/badgeApi'

// Mock 데이터 사용 여부 (환경변수로 제어: VITE_USE_MOCK=true)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Placeholder 이미지 (실제 S3 이미지가 없을 경우 대비)
const PLACEHOLDER_BADGE = 'https://via.placeholder.com/100x100/FFD700/000000?text=Badge'

// ============================================
// Mock 데이터
// ============================================

const mockBadges = [
    {
        badgeType: 'FIRST_STEP',
        name: '첫 걸음',
        description: '첫 학습을 완료했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        category: 'FIRST_STUDY',
        threshold: 1,
        progress: 1,
        earned: true,
        earnedAt: '2024-12-01T10:30:00Z',
    },
    {
        badgeType: 'STREAK_3',
        name: '3일 연속 학습',
        description: '3일 연속으로 학습했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135783.png',
        category: 'STREAK',
        threshold: 3,
        progress: 3,
        earned: true,
        earnedAt: '2024-12-05T09:15:00Z',
    },
    {
        badgeType: 'STREAK_7',
        name: '일주일 연속 학습',
        description: '7일 연속으로 학습했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png',
        category: 'STREAK',
        threshold: 7,
        progress: 5,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'STREAK_30',
        name: '한 달 연속 학습',
        description: '30일 연속으로 학습했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135810.png',
        category: 'STREAK',
        threshold: 30,
        progress: 5,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'WORDS_100',
        name: '단어 수집가',
        description: '100개의 단어를 학습했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
        category: 'WORDS_LEARNED',
        threshold: 100,
        progress: 85,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'WORDS_500',
        name: '단어 전문가',
        description: '500개의 단어를 학습했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2232/2232691.png',
        category: 'WORDS_LEARNED',
        threshold: 500,
        progress: 85,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'WORDS_1000',
        name: '단어 마스터',
        description: '1000개의 단어를 학습했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/2232/2232696.png',
        category: 'WORDS_LEARNED',
        threshold: 1000,
        progress: 85,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'PERFECT_SCORE',
        name: '완벽주의자',
        description: '테스트에서 만점을 받았습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3176/3176293.png',
        category: 'PERFECT_TEST',
        threshold: 1,
        progress: 1,
        earned: true,
        earnedAt: '2024-12-10T14:20:00Z',
    },
    {
        badgeType: 'TEST_10',
        name: '테스트 도전자',
        description: '10회의 테스트를 완료했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3176/3176366.png',
        category: 'TESTS_COMPLETED',
        threshold: 10,
        progress: 7,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'ACCURACY_90',
        name: '정확도 달인',
        description: '전체 정확도 90%를 달성했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3176/3176271.png',
        category: 'ACCURACY',
        threshold: 90,
        progress: 78,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'GAME_FIRST_PLAY',
        name: '첫 게임',
        description: '첫 게임에 참여했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3612/3612569.png',
        category: 'GAMES_PLAYED',
        threshold: 1,
        progress: 1,
        earned: true,
        earnedAt: '2024-12-08T16:45:00Z',
    },
    {
        badgeType: 'GAME_10_WINS',
        name: '게임 10승',
        description: '게임에서 10번 1등을 했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3612/3612530.png',
        category: 'GAMES_WON',
        threshold: 10,
        progress: 3,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'QUICK_GUESSER',
        name: '번개 정답',
        description: '5초 내에 정답을 맞췄습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3612/3612557.png',
        category: 'QUICK_GUESSES',
        threshold: 1,
        progress: 0,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'PERFECT_DRAWER',
        name: '완벽한 출제자',
        description: '출제 시 전원이 정답을 맞췄습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3612/3612537.png',
        category: 'PERFECT_DRAWS',
        threshold: 1,
        progress: 0,
        earned: false,
        earnedAt: null,
    },
    {
        badgeType: 'MASTER',
        name: '학습 마스터',
        description: '모든 업적을 달성했습니다',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135706.png',
        category: 'ALL_BADGES',
        threshold: 1,
        progress: 0,
        earned: false,
        earnedAt: null,
    },
]

// ============================================
// API with Mock fallback
// ============================================

const withMock = (apiCall, mockData) => {
    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockData), 500)
        })
    }
    // 실제 API 호출 시 응답의 data 필드 추출 (백엔드 응답: { isSuccess, message, data })
    return apiCall()
        .then(response => response.data || response)
        .catch(() => mockData)
}

/**
 * Badge API Service
 */
export const badgeService = {
    // GET /badges - 전체 배지 목록 (획득 여부, 진행도 포함)
    getAll: () =>
        withMock(
            () => badgeApi.get('/badges'),
            {
                badges: mockBadges,
                totalCount: mockBadges.length,
                earnedCount: mockBadges.filter((b) => b.earned).length,
            }
        ),

    // GET /badges/earned - 획득한 배지만 조회
    getEarned: () =>
        withMock(
            () => badgeApi.get('/badges/earned'),
            {
                badges: mockBadges.filter((b) => b.earned),
                count: mockBadges.filter((b) => b.earned).length,
            }
        ),
}

export default badgeService
