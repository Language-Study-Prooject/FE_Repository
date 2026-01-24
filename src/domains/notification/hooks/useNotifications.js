import { useEffect, useCallback, useRef, useState } from 'react'

const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_URL

const MAX_RETRY_COUNT = 5
const RETRY_DELAY_MS = 3000

// 디버깅용: 브라우저 콘솔에서 직접 테스트
// const es = new EventSource('https://flhf42jd6xgrh26wrqgwxmbmee0zmjnv.lambda-url.ap-northeast-2.on.aws/?userId=64983d3c-90a1-700e-48af-f1d7779cd66a');
// es.onmessage = (e) => console.log('알림:', e.data);
// es.onerror = (e) => console.log('에러:', e);
// es.onopen = () => console.log('연결됨!');

/**
 * SSE를 통한 실시간 알림 연결 훅
 * @param {string|null} userId - 로그인한 사용자 ID
 * @param {function} onNotification - 알림 수신 시 콜백
 * @returns {{ isConnected: boolean, error: string|null, disconnect: function, reconnect: function }}
 */
export function useNotifications(userId, onNotification) {
  const eventSourceRef = useRef(null)
  const retryCountRef = useRef(0)
  const retryTimeoutRef = useRef(null)

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setIsConnected(false)
  }, [])

  const connect = useCallback(() => {
    console.log('[Notifications] connect() called', { userId, NOTIFICATION_URL })

    if (!userId) {
      console.warn('[Notifications] Missing userId')
      return
    }

    if (!NOTIFICATION_URL) {
      console.warn('[Notifications] Missing NOTIFICATION_URL env variable')
      return
    }

    // 기존 연결 정리
    disconnect()

    const url = `${NOTIFICATION_URL}?userId=${encodeURIComponent(userId)}`
    console.log('[Notifications] Connecting to:', url)

    try {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('[Notifications] 연결됨!')
        setIsConnected(true)
        setError(null)
        retryCountRef.current = 0
      }

      eventSource.onmessage = (event) => {
        console.log('[Notifications] 알림:', event.data)

        // Heartbeat 무시
        if (event.data === 'HEARTBEAT') {
          return
        }

        // Stream end 처리
        if (event.data === 'STREAM_END') {
          console.log('[Notifications] Stream ended, reconnecting...')
          scheduleReconnect()
          return
        }

        try {
          const notification = JSON.parse(event.data)
          console.log('[Notifications] Parsed:', notification)
          onNotification?.(notification)
        } catch (e) {
          console.error('[Notifications] Failed to parse:', e, event.data)
        }
      }

      eventSource.onerror = (err) => {
        console.log('[Notifications] 에러:', err)
        console.log('[Notifications] readyState:', eventSource.readyState)
        setIsConnected(false)

        // EventSource가 자동으로 재연결을 시도하지만,
        // 연속 실패 시 수동 재연결 로직 적용
        if (eventSource.readyState === EventSource.CLOSED) {
          scheduleReconnect()
        }
      }
    } catch (err) {
      console.error('[Notifications] Failed to create EventSource:', err)
      setError('알림 연결에 실패했습니다.')
      scheduleReconnect()
    }
  }, [userId, onNotification, disconnect])

  const scheduleReconnect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRY_COUNT) {
      setError('알림 서버 연결에 실패했습니다. 새로고침해주세요.')
      console.error('[Notifications] Max retry count reached')
      return
    }

    retryCountRef.current += 1
    const delay = RETRY_DELAY_MS * retryCountRef.current

    console.log(`[Notifications] Retry ${retryCountRef.current}/${MAX_RETRY_COUNT} in ${delay}ms`)

    retryTimeoutRef.current = setTimeout(() => {
      connect()
    }, delay)
  }, [connect])

  // userId 변경 시 연결/해제
  // StrictMode에서 중복 연결 방지를 위한 debounce
  useEffect(() => {
    let mounted = true
    let connectTimeout = null

    if (userId) {
      // 100ms 지연으로 StrictMode 중복 호출 방지
      connectTimeout = setTimeout(() => {
        if (mounted) {
          connect()
        }
      }, 100)
    } else {
      disconnect()
    }

    return () => {
      mounted = false
      if (connectTimeout) {
        clearTimeout(connectTimeout)
      }
      disconnect()
    }
  }, [userId, connect, disconnect])

  const reconnect = useCallback(() => {
    retryCountRef.current = 0
    setError(null)
    connect()
  }, [connect])

  return {
    isConnected,
    error,
    disconnect,
    reconnect,
  }
}

export default useNotifications
