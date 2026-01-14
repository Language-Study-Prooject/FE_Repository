/**
 * Grammar WebSocket Streaming Service
 * 실시간 토큰 단위 AI 응답을 위한 WebSocket 서비스
 */

// WebSocket URL - 환경변수에서 가져오거나 기본값 사용
const WS_URL = import.meta.env.VITE_GRAMMAR_WS_URL ||
  'wss://placeholder.execute-api.ap-northeast-2.amazonaws.com/dev'

// Mock 모드 (WebSocket 서버가 없을 때 테스트용)
const USE_MOCK = true
const MOCK_DELAY = 50 // 토큰 간 딜레이 (ms)

/**
 * Mock 스트리밍 응답 생성
 */
const createMockStream = (message, callbacks) => {
  const { onStart, onToken, onComplete, onError } = callbacks

  const sessionId = `session-${Date.now()}`
  const mockAiResponse = "That's an interesting sentence! I noticed a few grammar points we can work on together. Keep practicing and you'll improve quickly!"
  const mockGrammarCheck = {
    originalSentence: message,
    correctedSentence: message.replace(/go /g, 'went ').replace(/goed/g, 'went'),
    score: Math.floor(Math.random() * 30) + 70,
    isCorrect: !message.toLowerCase().includes('go '),
    errors: message.toLowerCase().includes('go ') ? [
      {
        type: 'VERB_TENSE',
        original: 'go',
        corrected: 'went',
        explanation: '과거 시제를 사용해야 합니다. "go"의 과거형은 "went"입니다.',
        startIndex: message.toLowerCase().indexOf('go '),
        endIndex: message.toLowerCase().indexOf('go ') + 2,
      }
    ] : [],
    feedback: message.toLowerCase().includes('go ')
      ? '동사 시제에 주의하세요! 과거의 일을 말할 때는 과거 시제를 사용합니다.'
      : '훌륭한 문장입니다! 문법적으로 정확해요.',
  }

  // Start event
  setTimeout(() => {
    onStart?.({ type: 'start', sessionId })
  }, 100)

  // Token events (simulate streaming)
  const tokens = mockAiResponse.split(' ')
  let tokenIndex = 0

  const streamTokens = () => {
    if (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex] + (tokenIndex < tokens.length - 1 ? ' ' : '')
      onToken?.({ type: 'token', token })
      tokenIndex++
      setTimeout(streamTokens, MOCK_DELAY + Math.random() * 30)
    } else {
      // Complete event
      setTimeout(() => {
        onComplete?.({
          type: 'complete',
          sessionId,
          grammarCheck: mockGrammarCheck,
          aiResponse: mockAiResponse,
          conversationTip: 'Try using more descriptive words in your sentences!',
        })
      }, 100)
    }
  }

  setTimeout(streamTokens, 300)

  // Return mock close function
  return {
    close: () => {},
    readyState: 1,
  }
}

/**
 * Grammar Streaming 클래스
 */
class GrammarStreamConnection {
  constructor() {
    this.ws = null
    this.callbacks = {}
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 3
  }

  /**
   * WebSocket 연결
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      if (USE_MOCK) {
        this.isConnected = true
        resolve()
        return
      }

      try {
        const url = token ? `${WS_URL}?token=${token}` : WS_URL
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          console.log('[GrammarStream] Connected')
          resolve()
        }

        this.ws.onclose = (event) => {
          this.isConnected = false
          console.log('[GrammarStream] Disconnected:', event.code)
          this.callbacks.onClose?.(event)
        }

        this.ws.onerror = (error) => {
          console.error('[GrammarStream] Error:', error)
          this.callbacks.onError?.({ type: 'error', message: 'WebSocket connection error' })
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleMessage(data)
          } catch (e) {
            console.error('[GrammarStream] Parse error:', e)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 메시지 핸들링
   */
  handleMessage(data) {
    switch (data.type) {
      case 'start':
        this.callbacks.onStart?.(data)
        break
      case 'token':
        this.callbacks.onToken?.(data)
        break
      case 'complete':
        this.callbacks.onComplete?.(data)
        break
      case 'error':
        this.callbacks.onError?.(data)
        break
      default:
        console.log('[GrammarStream] Unknown message type:', data.type)
    }
  }

  /**
   * 스트리밍 요청 전송
   */
  send(message, options = {}) {
    const { level = 'BEGINNER', sessionId = null } = options

    if (USE_MOCK) {
      return createMockStream(message, this.callbacks)
    }

    if (!this.isConnected || !this.ws) {
      this.callbacks.onError?.({ type: 'error', message: 'Not connected' })
      return
    }

    const request = {
      action: 'grammarStreaming',
      message,
      level,
      ...(sessionId && { sessionId }),
    }

    this.ws.send(JSON.stringify(request))
  }

  /**
   * 콜백 설정
   */
  setCallbacks(callbacks) {
    this.callbacks = callbacks
  }

  /**
   * 연결 종료
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.isConnected = false
  }

  /**
   * 연결 상태 확인
   */
  getConnectionState() {
    if (USE_MOCK) return 'connected'
    if (!this.ws) return 'disconnected'

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

// 싱글톤 인스턴스
let streamInstance = null

/**
 * Grammar Stream 서비스
 */
export const grammarStreamService = {
  /**
   * 인스턴스 가져오기 (싱글톤)
   */
  getInstance() {
    if (!streamInstance) {
      streamInstance = new GrammarStreamConnection()
    }
    return streamInstance
  },

  /**
   * 연결
   */
  async connect(token) {
    const instance = this.getInstance()
    return instance.connect(token)
  },

  /**
   * 스트리밍 요청
   */
  send(message, options = {}) {
    const instance = this.getInstance()
    return instance.send(message, options)
  },

  /**
   * 콜백 설정
   */
  setCallbacks(callbacks) {
    const instance = this.getInstance()
    instance.setCallbacks(callbacks)
  },

  /**
   * 연결 종료
   */
  disconnect() {
    const instance = this.getInstance()
    instance.disconnect()
  },

  /**
   * 연결 상태
   */
  getConnectionState() {
    const instance = this.getInstance()
    return instance.getConnectionState()
  },
}

export default grammarStreamService
