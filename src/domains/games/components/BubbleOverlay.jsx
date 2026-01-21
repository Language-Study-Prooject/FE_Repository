import {useEffect, useState} from 'react'
import {Box, Typography} from '@mui/material'
import {GAME_COLORS} from '../theme/gameTheme'

const BubbleOverlay = ({ bubbles, containerWidth, containerHeight }) => {
    const [activeBubbles, setActiveBubbles] = useState([])

    useEffect(() => {
        if (!bubbles || bubbles.length === 0) return

        // 새 버블 추가 - 항상 고유한 내부 ID 생성
        const now = Date.now()
        const newBubbles = bubbles.map((bubble, index) => ({
            ...bubble,
            internalId: `${now}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            x: Math.random() * (containerWidth - 120) + 60,
            startTime: now,
        }))

        setActiveBubbles(prev => [...prev, ...newBubbles])

        // 3초 후 자동 제거
        const timeoutIds = newBubbles.map(bubble =>
            setTimeout(() => {
                setActiveBubbles(prev => prev.filter(b => b.internalId !== bubble.internalId))
            }, 3000)
        )

        return () => {
            timeoutIds.forEach(id => clearTimeout(id))
        }
    }, [bubbles, containerWidth])

    // 애니메이션 프레임
    const [, setFrame] = useState(0)
    useEffect(() => {
        if (activeBubbles.length === 0) return

        const interval = setInterval(() => {
            setFrame(f => f + 1)
        }, 50)

        return () => clearInterval(interval)
    }, [activeBubbles.length])

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
            }}
        >
            {activeBubbles.map(bubble => {
                const elapsed = (Date.now() - bubble.startTime) / 1000
                const progress = Math.min(elapsed / 3, 1)
                const y = containerHeight * (1 - progress * 0.8)
                const opacity = 1 - progress * 0.7
                const scale = 1 + progress * 0.2

                return (
                    <Box
                        key={bubble.internalId}
                        sx={{
                            position: 'absolute',
                            left: bubble.x,
                            top: y,
                            transform: `translate(-50%, -50%) scale(${scale})`,
                            opacity,
                            transition: 'opacity 0.1s linear',
                        }}
                    >
                        <Box
                            sx={{
                                background: bubble.isCorrect
                                    ? GAME_COLORS.bubble.correct
                                    : GAME_COLORS.bubble.normal,
                                borderRadius: '24px',
                                padding: '10px 16px',
                                boxShadow: bubble.isCorrect
                                    ? '0 4px 20px rgba(245,158,11,0.4), inset 0 -3px 12px rgba(255,255,255,0.5)'
                                    : '0 4px 16px rgba(59,130,246,0.2), inset 0 -3px 12px rgba(255,255,255,0.5)',
                                border: bubble.isCorrect
                                    ? '2px solid rgba(245,158,11,0.6)'
                                    : '1px solid rgba(255,255,255,0.7)',
                                backdropFilter: 'blur(4px)',
                                minWidth: 70,
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    color: bubble.isCorrect ? '#92400E' : '#1E40AF',
                                    mb: 0.25,
                                }}
                            >
                                {bubble.isCorrect && '🎉 '}
                                {bubble.nickname || bubble.userId}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: bubble.isCorrect ? '#78350F' : '#1E3A8A',
                                }}
                            >
                                {bubble.content}
                            </Typography>
                            {bubble.isCorrect && bubble.score && (
                                <Typography
                                    sx={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#D97706',
                                        mt: 0.25,
                                    }}
                                >
                                    +{bubble.score}점
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}

export default BubbleOverlay
