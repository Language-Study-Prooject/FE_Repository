import {useState} from 'react'
import {Box, Fade, LinearProgress, Tooltip, Typography,} from '@mui/material'
import {EmojiEvents as TrophyIcon, Lock as LockIcon,} from '@mui/icons-material'
import {useSettings} from '../../../contexts/SettingsContext'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {BADGE_CATEGORY_COLORS, BADGE_DESCRIPTIONS_EN, BADGE_NAMES_EN, NEWS_BADGE_TYPES,} from '../constants/badgeConstants'

// 뉴스 뱃지 색상
const NEWS_BADGE_COLOR = '#10b981'

export default function BadgeCard({badge, size = 'medium'}) {
    const {isKorean} = useSettings()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
    const [imageError, setImageError] = useState(false)

    const isEarned = badge.earned
    const progress = Math.min((badge.progress / badge.threshold) * 100, 100)
    const isNewsBadge = NEWS_BADGE_TYPES.includes(badge.badgeType) || badge.badgeType?.startsWith('NEWS_')
    const badgeColor = isNewsBadge ? NEWS_BADGE_COLOR : BADGE_CATEGORY_COLORS[badge.category]

    // Size configurations
    const sizes = {
        small: {card: 100, image: 60, icon: 24},
        medium: {card: 140, image: 80, icon: 32},
        large: {card: 180, image: 100, icon: 40},
    }
    const config = sizes[size] || sizes.medium

    // Get localized badge info
    const badgeName = isKorean ? badge.name : (BADGE_NAMES_EN[badge.badgeType] || badge.name)
    const badgeDescription = isKorean
        ? badge.description
        : (BADGE_DESCRIPTIONS_EN[badge.badgeType] || badge.description)

    // Format earned date
    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return isKorean
            ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
            : date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'})
    }

    // Tooltip content
    const tooltipContent = (
        <Box sx={{p: 1, maxWidth: 200}}>
            <Typography variant="subtitle2" fontWeight={700} sx={{mb: 0.5}}>
                {badgeName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                {badgeDescription}
            </Typography>

            {!isEarned && (
                <Box sx={{mb: 1}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 0.5}}>
                        <Typography variant="caption" color="text.secondary">
                            {isKorean ? '진행도' : 'Progress'}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                            {badge.progress} / {badge.threshold}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${badgeColor} 0%, ${badgeColor}99 100%)`,
                            },
                        }}
                    />
                </Box>
            )}

            {isEarned && badge.earnedAt && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        backgroundColor: '#ecfdf5',
                        borderRadius: '8px',
                        px: 1,
                        py: 0.5,
                    }}
                >
                    <TrophyIcon sx={{fontSize: 14, color: '#059669'}}/>
                    <Typography variant="caption" color="#059669" fontWeight={600}>
                        {formatDate(badge.earnedAt)}
                    </Typography>
                </Box>
            )}
        </Box>
    )

    return (
        <Tooltip
            title={tooltipContent}
            placement="top"
            arrow
            TransitionComponent={Fade}
            TransitionProps={{timeout: 300}}
            PopperProps={{
                sx: {
                    '& .MuiTooltip-tooltip': {
                        backgroundColor: isDark ? '#27272a' : '#fff',
                        color: '#1f2937',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                    },
                    '& .MuiTooltip-arrow': {
                        color: isDark ? '#27272a' : '#fff',
                        '&::before': {
                            border: '1px solid #e5e7eb',
                        },
                    },
                },
            }}
        >
            <Box
                sx={{
                    width: config.card,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: isEarned ? 'translateY(-4px) scale(1.05)' : 'scale(1.02)',
                    },
                }}
            >
                {/* Badge Image Container */}
                <Box
                    sx={{
                        width: config.image,
                        height: config.image,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        background: isEarned
                            ? `linear-gradient(135deg, ${badgeColor}20 0%, ${badgeColor}10 100%)`
                            : isDark ? '#3f3f46' : '#f3f4f6',
                        border: isEarned ? `3px solid ${badgeColor}` : '3px solid #d1d5db',
                        boxShadow: isEarned
                            ? `0 8px 24px -4px ${badgeColor}40`
                            : 'none',
                        overflow: 'hidden',
                    }}
                >
                    {!imageError ? (
                        <Box
                            component="img"
                            src={badge.imageUrl}
                            alt={badgeName}
                            onError={() => setImageError(true)}
                            sx={{
                                width: '70%',
                                height: '70%',
                                objectFit: 'contain',
                                filter: isEarned ? 'none' : 'grayscale(100%) blur(1px)',
                                opacity: isEarned ? 1 : 0.4,
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ) : (
                        <TrophyIcon
                            sx={{
                                fontSize: config.icon,
                                color: isEarned ? badgeColor : '#9ca3af',
                                filter: isEarned ? 'none' : 'grayscale(100%)',
                                opacity: isEarned ? 1 : 0.4,
                            }}
                        />
                    )}

                    {/* Lock overlay for unearned badges */}
                    {!isEarned && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -4,
                                right: -4,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: isDark ? '2px solid #27272a' : '2px solid #fff',
                            }}
                        >
                            <LockIcon sx={{fontSize: 12, color: '#fff'}}/>
                        </Box>
                    )}
                </Box>

                {/* Badge Name */}
                <Typography
                    variant="caption"
                    fontWeight={isEarned ? 700 : 500}
                    color={isEarned ? 'text.primary' : 'text.secondary'}
                    sx={{
                        mt: 1,
                        textAlign: 'center',
                        maxWidth: config.card,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {badgeName}
                </Typography>

                {/* Progress indicator for unearned */}
                {!isEarned && size !== 'small' && (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{fontSize: '0.65rem'}}
                    >
                        {badge.progress}/{badge.threshold}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    )
}
