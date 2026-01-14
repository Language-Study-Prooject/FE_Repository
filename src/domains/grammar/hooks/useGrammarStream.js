import { useState, useCallback, useEffect, useRef } from 'react'
import { grammarStreamService } from '../services/grammarStreamService'

/**
 * Grammar WebSocket 스트리밍 훅
 * 실시간 AI 응답을 위한 상태 관리
 */
export function useGrammarStream() {
  // 스트리밍 상태
  const [isStreaming, setIsStreaming] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [error, setError] = useState(null)

  // 최종 결과
  const [result, setResult] = useState(null)

  // 연결 상태 추적
  const isConnectedRef = useRef(false)

  /**
   * WebSocket 연결
   */
  const connect = useCallback(async (token = null) => {
    try {
      setError(null)
      await grammarStreamService.connect(token)
      setIsConnected(true)
      isConnectedRef.current = true
    } catch (err) {
      console.error('[useGrammarStream] Connection error:', err)
      setError('연결에 실패했습니다')
      setIsConnected(false)
      isConnectedRef.current = false
    }
  }, [])

  /**
   * 연결 종료
   */
  const disconnect = useCallback(() => {
    grammarStreamService.disconnect()
    setIsConnected(false)
    isConnectedRef.current = false
  }, [])

  /**
   * 스트리밍 메시지 전송
   */
  const sendMessage = useCallback((message, options = {}) => {
    // 상태 초기화
    setIsStreaming(true)
    setStreamingText('')
    setResult(null)
    setError(null)

    // 콜백 설정
    grammarStreamService.setCallbacks({
      onStart: (data) => {
        console.log('[useGrammarStream] Stream started:', data.sessionId)
        setSessionId(data.sessionId)
      },

      onToken: (data) => {
        setStreamingText((prev) => prev + data.token)
      },

      onComplete: (data) => {
        console.log('[useGrammarStream] Stream complete')
        setResult(data)
        setIsStreaming(false)
      },

      onError: (data) => {
        console.error('[useGrammarStream] Stream error:', data.message)
        setError(data.message || '스트리밍 중 오류가 발생했습니다')
        setIsStreaming(false)
      },

      onClose: (event) => {
        if (event.code !== 1000) {
          console.log('[useGrammarStream] Unexpected close:', event.code)
        }
      },
    })

    // 메시지 전송
    grammarStreamService.send(message, options)
  }, [])

  /**
   * 스트리밍 취소
   */
  const cancelStream = useCallback(() => {
    setIsStreaming(false)
    setStreamingText('')
    // 연결은 유지하고 스트리밍만 취소
  }, [])

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setIsStreaming(false)
    setStreamingText('')
    setResult(null)
    setError(null)
    setSessionId(null)
  }, [])

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      if (isConnectedRef.current) {
        grammarStreamService.disconnect()
      }
    }
  }, [])

  return {
    // 상태
    isStreaming,
    isConnected,
    streamingText,
    sessionId,
    result,
    error,

    // 액션
    connect,
    disconnect,
    sendMessage,
    cancelStream,
    reset,

    // 편의 getter
    grammarCheck: result?.grammarCheck || null,
    aiResponse: result?.aiResponse || streamingText,
    conversationTip: result?.conversationTip || null,
  }
}

export default useGrammarStream
