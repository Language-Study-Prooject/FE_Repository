/**
 * Game Design System
 * 캐치마인드 게임 전용 디자인 토큰
 */

export const GAME_COLORS = {
    // 브랜드 (청록색 - 사이드바와 통일)
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryBg: '#ecfeff',

    // 게임 상태
    status: {
        waiting: '#10B981',
        waitingBg: '#D1FAE5',
        playing: '#F59E0B',
        playingBg: '#FEF3C7',
        finished: '#6B7280',
        finishedBg: '#F3F4F6',
    },

    // 정답/오답
    answer: {
        correct: '#F59E0B',
        correctBg: '#FEF3C7',
        correctText: '#92400E',
        wrong: '#EF4444',
        wrongBg: '#FEE2E2',
    },

    // 타이머
    timer: {
        normal: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
    },

    // 캔버스
    canvas: {
        border: '#E5E7EB',
        borderActive: '#10B981',
        borderDanger: '#EF4444',
        background: '#FFFFFF',
    },

    // 비눗방울
    bubble: {
        normal: 'linear-gradient(135deg, rgba(224,242,254,0.95) 0%, rgba(186,230,253,0.9) 100%)',
        correct: 'linear-gradient(135deg, rgba(254,243,199,0.95) 0%, rgba(253,230,138,0.9) 100%)',
    },

    // 순위
    rank: {
        gold: '#F59E0B',
        silver: '#9CA3AF',
        bronze: '#CD7F32',
    },
}

export const GAME_TYPOGRAPHY = {
    word: {
        fontFamily: 'Pretendard, -apple-system, sans-serif',
        fontWeight: 700,
        fontSize: '28px',
    },
    timer: {
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontWeight: 600,
        fontSize: '24px',
    },
    score: {
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontWeight: 700,
        fontSize: '16px',
    },
    chat: {
        fontFamily: 'Pretendard, -apple-system, sans-serif',
        fontWeight: 400,
        fontSize: '14px',
    },
}

export const GAME_LAYOUT = {
    splitView: {
        canvas: '65%',
        chat: '35%',
    },
    canvas: {
        width: 640,
        height: 320,
    },
    spacing: {
        header: 36,
        toolbar: 32,
        gap: 6,
    },
}

export const GAME_ANIMATIONS = {
    bubble: {
        duration: '3s',
        easing: 'ease-out',
    },
    timerPulse: {
        duration: '1s',
        easing: 'ease-in-out',
    },
    transition: {
        duration: '0.3s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
}

// MUI sx props에서 사용할 수 있는 스타일 객체들
export const gameStyles = {
    // 게임 상태 뱃지
    statusBadge: (status) => ({
        px: 1.5,
        py: 0.5,
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        bgcolor: GAME_COLORS.status[`${status}Bg`] || GAME_COLORS.status.waitingBg,
        color: GAME_COLORS.status[status] || GAME_COLORS.status.waiting,
    }),

    // 타이머 스타일
    timer: (seconds) => ({
        fontFamily: GAME_TYPOGRAPHY.timer.fontFamily,
        fontWeight: GAME_TYPOGRAPHY.timer.fontWeight,
        fontSize: GAME_TYPOGRAPHY.timer.fontSize,
        color: seconds <= 10
            ? GAME_COLORS.timer.danger
            : seconds <= 30
                ? GAME_COLORS.timer.warning
                : GAME_COLORS.timer.normal,
        animation: seconds <= 10 ? 'pulse 1s ease-in-out infinite' : 'none',
    }),

    // 캔버스 컨테이너
    canvasContainer: (isActive, isDanger) => ({
        border: '3px solid',
        borderColor: isDanger
            ? GAME_COLORS.canvas.borderDanger
            : isActive
                ? GAME_COLORS.canvas.borderActive
                : GAME_COLORS.canvas.border,
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: GAME_COLORS.canvas.background,
        transition: `border-color ${GAME_ANIMATIONS.transition.duration} ${GAME_ANIMATIONS.transition.easing}`,
    }),

    // 정답 메시지
    correctMessage: {
        bgcolor: GAME_COLORS.answer.correctBg,
        color: GAME_COLORS.answer.correctText,
        fontWeight: 700,
        borderRadius: '8px',
        px: 1.5,
        py: 0.75,
    },

    // 순위 아이콘
    rankIcon: (rank) => {
        const colors = {
            1: GAME_COLORS.rank.gold,
            2: GAME_COLORS.rank.silver,
            3: GAME_COLORS.rank.bronze,
        }
        return {
            color: colors[rank] || 'text.secondary',
            fontWeight: 700,
        }
    },
}

export default {
    GAME_COLORS,
    GAME_TYPOGRAPHY,
    GAME_LAYOUT,
    GAME_ANIMATIONS,
    gameStyles,
}
