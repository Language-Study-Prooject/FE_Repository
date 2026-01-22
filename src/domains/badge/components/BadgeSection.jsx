import {useEffect, useState} from 'react'
import {Alert, Box, Chip, LinearProgress, Paper, Typography,} from '@mui/material'
import {EmojiEvents as TrophyIcon, WorkspacePremium as BadgeIcon,} from '@mui/icons-material'
import BadgeGrid from './BadgeGrid'
import {badgeService} from '../services/badgeService'
import {useSettings} from '../../../contexts/SettingsContext'
import {useThemeMode} from '../../../contexts/ThemeContext'

export default function BadgeSection() {
    const {isKorean} = useSettings()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
    const [badges, setBadges] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [earnedCount, setEarnedCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        loadBadges()
    }, [])

    const loadBadges = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await badgeService.getAll()
            setBadges(response.badges || [])
            setTotalCount(response.totalCount || 0)
            setEarnedCount(response.earnedCount || 0)
        } catch (err) {
            console.error('Failed to load badges:', err)
            setError(isKorean ? '배지를 불러오는데 실패했습니다' : 'Failed to load badges')
        } finally {
            setLoading(false)
        }
    }

    const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0

    return (
        <Paper
            elevation={0}
            sx={{
                p: {xs: 2, sm: 3},
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: isDark ? '#27272a' : '#fff',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', sm: 'row'},
                    alignItems: {xs: 'flex-start', sm: 'center'},
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px -4px rgba(234, 179, 8, 0.4)',
                        }}
                    >
                        <TrophyIcon sx={{fontSize: 26, color: 'white'}}/>
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {isKorean ? '획득한 배지' : 'Earned Badges'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isKorean
                                ? '학습 목표를 달성하고 배지를 모아보세요!'
                                : 'Achieve learning goals and collect badges!'}
                        </Typography>
                    </Box>
                </Box>

                {/* Stats Chip */}
                <Chip
                    icon={<BadgeIcon sx={{fontSize: 18}}/>}
                    label={
                        <Box component="span" sx={{fontWeight: 700}}>
                            {earnedCount} / {totalCount}
                        </Box>
                    }
                    sx={{
                        px: 1,
                        height: 36,
                        borderRadius: '18px',
                        backgroundColor: earnedCount === totalCount ? '#ecfdf5' : '#fef3c7',
                        color: earnedCount === totalCount ? '#059669' : '#d97706',
                        border: `1px solid ${earnedCount === totalCount ? '#10b981' : '#f59e0b'}`,
                        '& .MuiChip-icon': {
                            color: earnedCount === totalCount ? '#059669' : '#d97706',
                        },
                    }}
                />
            </Box>

            {/* Progress Bar */}
            <Box sx={{mb: 3}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {isKorean ? '전체 진행률' : 'Overall Progress'}
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">
                        {Math.round(progress)}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: isDark ? '#3f3f46' : '#f3f4f6',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background:
                                progress === 100
                                    ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                                    : 'linear-gradient(135deg, #eab308 0%, #facc15 100%)',
                        },
                    }}
                />
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{mb: 2, borderRadius: '12px'}}>
                    {error}
                </Alert>
            )}

            {/* Badge Grid */}
            <BadgeGrid badges={badges} loading={loading} size="medium"/>

            {/* Completion Message */}
            {!loading && earnedCount === totalCount && totalCount > 0 && (
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body1" fontWeight={700} color="#059669">
                        {isKorean
                            ? '축하합니다! 모든 배지를 획득했습니다! 🎉'
                            : 'Congratulations! You collected all badges! 🎉'}
                    </Typography>
                </Box>
            )}
        </Paper>
    )
}
