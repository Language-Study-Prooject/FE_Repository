import { Box, Typography, Skeleton } from '@mui/material'
import BadgeCard from './BadgeCard'
import { useSettings } from '../../../contexts/SettingsContext'

export default function BadgeGrid({ badges = [], loading = false, size = 'medium' }) {
  const { isKorean } = useSettings()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(3, 1fr)',
            sm: 'repeat(4, 1fr)',
            md: 'repeat(5, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
          justifyItems: 'center',
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Skeleton variant="text" width={60} sx={{ mt: 1 }} />
          </Box>
        ))}
      </Box>
    )
  }

  if (badges.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
        }}
      >
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
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(3, 1fr)',
          sm: 'repeat(4, 1fr)',
          md: 'repeat(5, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: { xs: 1.5, sm: 2, md: 3 },
        justifyItems: 'center',
      }}
    >
      {sortedBadges.map((badge) => (
        <BadgeCard key={badge.badgeType} badge={badge} size={size} />
      ))}
    </Box>
  )
}
