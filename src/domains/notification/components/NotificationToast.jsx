import { Snackbar, Box, Typography, IconButton, alpha } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { useNotificationContext } from '../contexts/NotificationContext'
import { NotificationConfig, getNotificationMessage, formatTimeAgo } from '../types/notificationTypes'

const AUTO_HIDE_DURATION = 5000

export function NotificationToast() {
  const { currentToast, closeToast } = useNotificationContext()
  const { isKorean } = useSettings()

  if (!currentToast) return null

  const config = NotificationConfig[currentToast.type] || {
    icon: '🔔',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    titleKo: '알림',
    titleEn: 'Notification',
  }

  const title = isKorean ? config.titleKo : config.titleEn
  const message = getNotificationMessage(currentToast, isKorean)

  return (
    <Snackbar
      open={!!currentToast}
      autoHideDuration={AUTO_HIDE_DURATION}
      onClose={closeToast}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        top: { xs: 70, md: 80 },
        right: { xs: 8, md: 24 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          minWidth: 300,
          maxWidth: 400,
          borderRadius: '16px',
          backgroundColor: 'background.paper',
          boxShadow: `0 10px 40px -10px ${alpha(config.color, 0.3)}, 0 4px 12px -2px rgba(0,0,0,0.1)`,
          border: '1px solid',
          borderColor: alpha(config.color, 0.2),
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: config.color,
            borderRadius: '4px 0 0 4px',
          },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            backgroundColor: config.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 22,
          }}
        >
          {config.icon}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{ color: config.color, mb: 0.25 }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {message}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={closeToast}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: alpha(config.color, 0.1),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  )
}

export default NotificationToast
