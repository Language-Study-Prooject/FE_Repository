/**
 * News API Service
 * 뉴스 영어 학습 관련 API 호출
 */

import api from '../../../api/axios'

/**
 * API 요청 헬퍼 - 공통 axios 인스턴스 사용 (토큰 갱신 로직 포함)
 */
const fetchWithAuth = async (endpoint, options = {}) => {
    const { method = 'GET', body, ...restOptions } = options

    const config = {
        ...restOptions,
    }

    if (method === 'GET') {
        const response = await api.get(endpoint, config)
        return response.data
    } else if (method === 'POST') {
        const response = await api.post(endpoint, body ? JSON.parse(body) : undefined, config)
        return response.data
    } else if (method === 'PUT') {
        const response = await api.put(endpoint, body ? JSON.parse(body) : undefined, config)
        return response.data
    } else if (method === 'DELETE') {
        const response = await api.delete(endpoint, config)
        return response.data
    }

    throw new Error(`Unsupported method: ${method}`)
}

/**
 * 뉴스 목록 조회
 */
export const getNewsList = async ({ level, category, limit = 10, cursor } = {}) => {
    const params = new URLSearchParams()
    if (level) params.append('level', level)
    if (category) params.append('category', category)
    if (limit) params.append('limit', limit)
    if (cursor) params.append('cursor', cursor)

    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchWithAuth(`/news${query}`)
}

/**
 * 오늘의 뉴스 조회
 */
export const getTodayNews = async ({ limit = 10, cursor } = {}) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit)
    if (cursor) params.append('cursor', cursor)

    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchWithAuth(`/news/today${query}`)
}

/**
 * 추천 뉴스 조회
 */
export const getRecommendedNews = async ({ limit = 10, cursor } = {}) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit)
    if (cursor) params.append('cursor', cursor)

    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchWithAuth(`/news/recommended${query}`)
}

/**
 * 뉴스 상세 조회
 */
export const getNewsDetail = async (articleId) => {
    return fetchWithAuth(`/news/${articleId}`)
}

/**
 * 읽기 완료 기록
 */
export const markAsRead = async (articleId) => {
    return fetchWithAuth(`/news/${articleId}/read`, {
        method: 'POST',
    })
}

/**
 * 북마크 토글
 */
export const toggleBookmark = async (articleId) => {
    return fetchWithAuth(`/news/${articleId}/bookmark`, {
        method: 'POST',
    })
}

/**
 * 북마크 목록 조회
 */
export const getBookmarks = async ({ limit = 20 } = {}) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit)

    const query = params.toString() ? `?${params.toString()}` : ''
    return fetchWithAuth(`/news/bookmarks${query}`)
}

/**
 * TTS 오디오 URL 조회
 */
export const getAudioUrl = async (articleId, voice = 'Joanna') => {
    const params = new URLSearchParams({ voice })
    return fetchWithAuth(`/news/${articleId}/audio?${params.toString()}`)
}

/**
 * 퀴즈 조회
 */
export const getQuiz = async (articleId) => {
    return fetchWithAuth(`/news/${articleId}/quiz`)
}

/**
 * 퀴즈 제출
 */
export const submitQuiz = async (articleId, answers, timeTaken) => {
    return fetchWithAuth(`/news/${articleId}/quiz`, {
        method: 'POST',
        body: JSON.stringify({ answers, timeTaken }),
    })
}

/**
 * 퀴즈 기록 조회
 */
export const getQuizHistory = async () => {
    return fetchWithAuth('/news/quiz/history')
}

/**
 * 단어 수집
 * - 단어 수집 시 자동으로 단어장(user-words)에 NEWS 카테고리로 추가됨
 * - meaning, example은 기사 키워드에서 자동 추출됨
 */
export const collectWord = async (articleId, word, context) => {
    return fetchWithAuth(`/news/${articleId}/words`, {
        method: 'POST',
        body: JSON.stringify({ word, context }),
    })
}

/**
 * 수집 단어 목록 조회
 */
export const getCollectedWords = async () => {
    return fetchWithAuth('/news/words')
}

/**
 * 수집 단어 삭제
 */
export const deleteCollectedWord = async (articleId, word) => {
    return fetchWithAuth(`/news/${articleId}/words/${encodeURIComponent(word)}`, {
        method: 'DELETE',
    })
}

/**
 * Vocabulary 연동
 */
export const syncToVocab = async (word, articleId) => {
    return fetchWithAuth(`/news/words/${encodeURIComponent(word)}/sync`, {
        method: 'POST',
        body: JSON.stringify({ articleId }),
    })
}

/**
 * 학습 통계 조회
 */
export const getNewsStats = async () => {
    return fetchWithAuth('/news/stats')
}

/**
 * 대시보드 통합 통계 조회
 * GET /stats/dashboard
 * Response: {
 *   today: { wordsLearned, articlesRead, quizScore, studyTime },
 *   overall: { totalWords, totalArticles, averageQuizScore, totalStudyTime },
 *   weeklyProgress: [{ date, wordsLearned, articlesRead }],
 *   levelDistribution: { BEGINNER, INTERMEDIATE, ADVANCED }
 * }
 */
export const getDashboardStats = async () => {
    return fetchWithAuth('/stats/dashboard')
}

/**
 * 카테고리 목록
 */
export const NEWS_CATEGORIES = [
    { id: 'WORLD', label: '국제', labelEn: 'World', color: '#14B8A6' },
    { id: 'POLITICS', label: '정치', labelEn: 'Politics', color: '#6366F1' },
    { id: 'BUSINESS', label: '경제', labelEn: 'Business', color: '#F59E0B' },
    { id: 'TECH', label: '기술', labelEn: 'Tech', color: '#3B82F6' },
    { id: 'SCIENCE', label: '과학', labelEn: 'Science', color: '#06B6D4' },
    { id: 'HEALTH', label: '건강', labelEn: 'Health', color: '#10B981' },
    { id: 'SPORTS', label: '스포츠', labelEn: 'Sports', color: '#EF4444' },
    { id: 'ENTERTAINMENT', label: '엔터테인먼트', labelEn: 'Entertainment', color: '#EC4899' },
    { id: 'LIFESTYLE', label: '라이프스타일', labelEn: 'Lifestyle', color: '#F97316' },
]

/**
 * 난이도별 색상
 */
export const LEVEL_COLORS = {
    BEGINNER: { main: '#10B981', bg: '#D1FAE5' },
    INTERMEDIATE: { main: '#3B82F6', bg: '#DBEAFE' },
    ADVANCED: { main: '#8B5CF6', bg: '#EDE9FE' },
}

/**
 * TTS 음성 옵션
 */
export const TTS_VOICES = [
    { id: 'Joanna', label: 'Joanna (미국 여성)', accent: 'US' },
    { id: 'Matthew', label: 'Matthew (미국 남성)', accent: 'US' },
    { id: 'Ivy', label: 'Ivy (미국 아동)', accent: 'US' },
    { id: 'Amy', label: 'Amy (영국 여성)', accent: 'UK' },
    { id: 'Brian', label: 'Brian (영국 남성)', accent: 'UK' },
]

export default {
    getNewsList,
    getTodayNews,
    getRecommendedNews,
    getNewsDetail,
    markAsRead,
    toggleBookmark,
    getBookmarks,
    getAudioUrl,
    getQuiz,
    submitQuiz,
    getQuizHistory,
    collectWord,
    getCollectedWords,
    deleteCollectedWord,
    syncToVocab,
    getNewsStats,
    getDashboardStats,
    NEWS_CATEGORIES,
    LEVEL_COLORS,
    TTS_VOICES,
}
