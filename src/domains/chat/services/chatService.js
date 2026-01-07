import chatApi from '../../../api/chatApi'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'

// 채팅방 API
export const chatRoomService = {
  // 채팅방 생성
  create: async (data) => {
    return chatApi.post('/chat/rooms', {
      ...data,
      createdBy: TEMP_USER_ID,
    })
  },

  // 채팅방 목록 조회
  getList: async (params = {}) => {
    const { limit = 10, level, joined, cursor } = params
    const queryParams = new URLSearchParams()

    queryParams.append('limit', limit)
    if (level) queryParams.append('level', level)
    if (joined) {
      queryParams.append('joined', 'true')
      queryParams.append('userId', TEMP_USER_ID)
    }
    if (cursor) queryParams.append('cursor', cursor)

    return chatApi.get(`/chat/rooms?${queryParams.toString()}`)
  },

  // 채팅방 상세 조회
  getDetail: async (roomId) => {
    return chatApi.get(`/chat/rooms/${roomId}`)
  },

  // 채팅방 입장
  join: async (roomId, password) => {
    return chatApi.post(`/chat/rooms/${roomId}/join`, {
      userId: TEMP_USER_ID,
      ...(password && { password }),
    })
  },

  // 채팅방 퇴장
  leave: async (roomId) => {
    return chatApi.post(`/chat/rooms/${roomId}/leave`, {
      userId: TEMP_USER_ID,
    })
  },
}

// 메시지 API
export const messageService = {
  // 메시지 전송
  send: async (roomId, content, messageType = 'TEXT') => {
    return chatApi.post(`/chat/rooms/${roomId}/messages`, {
      userId: TEMP_USER_ID,
      content,
      messageType,
    })
  },

  // 메시지 목록 조회
  getList: async (roomId, params = {}) => {
    const { limit = 20, cursor } = params
    const queryParams = new URLSearchParams()

    queryParams.append('limit', limit)
    if (cursor) queryParams.append('cursor', cursor)

    return chatApi.get(`/chat/rooms/${roomId}/messages?${queryParams.toString()}`)
  },
}

// 음성 API
export const voiceService = {
  // TTS 변환
  synthesize: async (messageId, roomId, voice = 'FEMALE') => {
    return chatApi.post('/chat/voice/synthesize', { messageId, roomId, voice })
  },
}

export { TEMP_USER_ID }
