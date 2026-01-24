import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationType, NotificationConfig, getNotificationMessage } from '../types/notificationTypes'

const NotificationContext = createContext(null)

const MAX_NOTIFICATIONS = 50

export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toastQueue, setToastQueue] = useState([])
  const [currentToast, setCurrentToast] = useState(null)

  // 알림 수신 핸들러
  const handleNotification = useCallback((notification) => {
    // 클라이언트에서 isRead 속성 추가
    const enrichedNotification = {
      ...notification,
      isRead: false,
      receivedAt: new Date().toISOString(),
    }

    // 알림 목록에 추가 (최신순, 최대 개수 제한)
    setNotifications((prev) => {
      const updated = [enrichedNotification, ...prev]
      return updated.slice(0, MAX_NOTIFICATIONS)
    })

    // 읽지 않은 알림 카운트 증가
    setUnreadCount((prev) => prev + 1)

    // 토스트 큐에 추가
    setToastQueue((prev) => [...prev, enrichedNotification])
  }, [])

  // SSE 연결
  const userId = isAuthenticated && user?.username ? user.username : null
  const { isConnected, error, reconnect } = useNotifications(userId, handleNotification)

  // 토스트 표시 로직 - 큐에서 하나씩 처리
  useEffect(() => {
    if (toastQueue.length > 0 && !currentToast) {
      const [next, ...rest] = toastQueue
      setCurrentToast(next)
      setToastQueue(rest)
    }
  }, [toastQueue, currentToast])

  // 토스트 닫기
  const closeToast = useCallback(() => {
    setCurrentToast(null)
  }, [])

  // 알림 읽음 처리
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [])

  // 알림 삭제
  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.notificationId === notificationId)
      if (notification && !notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }
      return prev.filter((n) => n.notificationId !== notificationId)
    })
  }, [])

  // 모든 알림 삭제
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isConnected,
      connectionError: error,
      currentToast,
      closeToast,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      reconnect,
    }),
    [
      notifications,
      unreadCount,
      isConnected,
      error,
      currentToast,
      closeToast,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      reconnect,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider')
  }
  return context
}

export { NotificationType, NotificationConfig, getNotificationMessage }
