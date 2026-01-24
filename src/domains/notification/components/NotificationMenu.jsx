import {
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Chip,
  IconButton,
  Button,
  alpha,
} from '@mui/material'
import {
  DoneAll as MarkReadIcon,
  DeleteSweep as ClearAllIcon,
  Wifi as ConnectedIcon,
  WifiOff as DisconnectedIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { useNotificationContext } from '../contexts/NotificationContext'
import {
  NotificationConfig,
  getNotificationMessage,
  formatTimeAgo,
} from '../types/notificationTypes'

export function NotificationMenu({ anchorEl, open, onClose }) {
  const { isKorean } = useSettings()
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionError,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    reconnect,
  } = useNotificationContext()

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId)
    }
    // TODO: 알림 타입별 페이지 네비게이션 추가 가능
    onClose()
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1,
          width: 380,
          maxHeight: 480,
          borderRadius: '16px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {isKorean ? '알림' : 'Notifications'}
          </Typography>
          {unreadCount > 0 && (
            <Chip
              label={unreadCount > 99 ? '99+' : unreadCount}
              size="small"
              sx={{
                height: 22,
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* 연결 상태 */}
          <IconButton
            size="small"
            onClick={reconnect}
            title={
              isConnected
                ? isKorean
                  ? '연결됨'
                  : 'Connected'
                : isKorean
                ? '재연결'
                : 'Reconnect'
            }
            sx={{
              color: isConnected ? '#10b981' : '#ef4444',
            }}
          >
            {isConnected ? (
              <ConnectedIcon fontSize="small" />
            ) : (
              <RefreshIcon fontSize="small" />
            )}
          </IconButton>

          {/* 모두 읽음 */}
          {unreadCount > 0 && (
            <IconButton
              size="small"
              onClick={markAllAsRead}
              title={isKorean ? '모두 읽음' : 'Mark all read'}
            >
              <MarkReadIcon fontSize="small" />
            </IconButton>
          )}

          {/* 모두 삭제 */}
          {notifications.length > 0 && (
            <IconButton
              size="small"
              onClick={clearAllNotifications}
              title={isKorean ? '모두 삭제' : 'Clear all'}
            >
              <ClearAllIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider />

      {/* 연결 에러 표시 */}
      {connectionError && (
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" color="error">
            {connectionError}
          </Typography>
          <Button size="small" onClick={reconnect} sx={{ minWidth: 'auto' }}>
            {isKorean ? '재연결' : 'Retry'}
          </Button>
        </Box>
      )}

      {/* 알림 목록 */}
      {notifications.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {isKorean ? '알림이 없습니다' : 'No notifications'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: 340, overflow: 'auto' }}>
          {notifications.map((notification) => {
            const config = NotificationConfig[notification.type] || {
              icon: '🔔',
              color: '#6b7280',
              bgColor: '#f3f4f6',
            }
            const message = getNotificationMessage(notification, isKorean)
            const timeAgo = formatTimeAgo(notification.createdAt, isKorean)

            return (
              <MenuItem
                key={notification.notificationId}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 2,
                  px: 2.5,
                  alignItems: 'flex-start',
                  backgroundColor: notification.isRead
                    ? 'transparent'
                    : alpha(config.color, 0.04),
                  '&:hover': {
                    backgroundColor: alpha(config.color, 0.08),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    backgroundColor: config.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mr: 1.5,
                    fontSize: 18,
                  }}
                >
                  {config.icon}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={notification.isRead ? 400 : 600}
                    sx={{
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo}
                  </Typography>
                </Box>

                {!notification.isRead && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: config.color,
                      ml: 1,
                      mt: 0.5,
                      flexShrink: 0,
                    }}
                  />
                )}
              </MenuItem>
            )
          })}
        </Box>
      )}
    </Menu>
  )
}

export default NotificationMenu
