import {useRef, useState} from 'react'
import {Box, Skeleton, Typography} from '@mui/material'
import BadgeCard from './BadgeCard'
import {useSettings} from '../../../contexts/SettingsContext'

export default function BadgeGrid({badges = [], loading = false, size = 'medium'}) {
    const {isKorean} = useSettings()
    const scrollRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startX, setStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)

    // 드래그 스크롤 핸들러
    const handleMouseDown = (e) => {
        setIsDragging(true)
        setStartX(e.pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const handleMouseLeave = () => {
        setIsDragging(false)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return
        e.preventDefault()
        const x = e.pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    // 터치 이벤트 핸들러
    const handleTouchStart = (e) => {
        setIsDragging(true)
        setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft)
        setScrollLeft(scrollRef.current.scrollLeft)
    }

    const handleTouchMove = (e) => {
        if (!isDragging) return
        const x = e.touches[0].pageX - scrollRef.current.offsetLeft
        const walk = (x - startX) * 1.5
        scrollRef.current.scrollLeft = scrollLeft - walk
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
    }

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': {height: 6},
                    '&::-webkit-scrollbar-thumb': {backgroundColor: '#d1d5db', borderRadius: 3},
                }}
            >
                {Array.from({length: 6}).map((_, index) => (
                    <Box key={index}
                         sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0}}>
                        <Skeleton variant="circular" width={72} height={72}/>
                        <Skeleton variant="text" width={50} sx={{mt: 1}}/>
                    </Box>
                ))}
            </Box>
        )
    }

    if (badges.length === 0) {
        return (
            <Box sx={{py: 4, textAlign: 'center'}}>
                <Typography variant="body1" color="text.secondary">
                    {isKorean ? '배지가 없습니다' : 'No badges available'}
                </Typography>
            </Box>
        )
    }

    // Sort badges: earned first, then by category
    const sortedBadges = [...badges].sort((a, b) => {
        if (a.earned && !b.earned) return -1
        if (!a.earned && b.earned) return 1
        return 0
    })

    return (
        <Box
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
                display: 'flex',
                gap: {xs: 1.5, sm: 2},
                overflowX: 'auto',
                pb: 1,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                '&::-webkit-scrollbar': {
                    height: 6,
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f3f4f6',
                    borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#d1d5db',
                    borderRadius: 3,
                    '&:hover': {
                        backgroundColor: '#9ca3af',
                    },
                },
                scrollBehavior: isDragging ? 'auto' : 'smooth',
                // 스크롤 힌트 그라데이션
                maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
            }}
        >
            {sortedBadges.map((badge) => (
                <Box key={badge.badgeType} sx={{flexShrink: 0}}>
                    <BadgeCard badge={badge} size={size}/>
                </Box>
            ))}
        </Box>
    )
}
