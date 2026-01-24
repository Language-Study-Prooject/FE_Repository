/**
 * 채팅 메시지 타입 상수
 * @enum {string}
 */
export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VOICE: 'VOICE',
  SYSTEM_COMMAND: 'SYSTEM_COMMAND',
  POLL_CREATE: 'POLL_CREATE',
  POLL_VOTE: 'POLL_VOTE',
  POLL_END: 'POLL_END',
  CLEAR_CHAT: 'CLEAR_CHAT',
  LEAVE_ROOM: 'LEAVE_ROOM',
}

/**
 * 사용 가능한 채팅 명령어 목록
 */
export const COMMANDS = [
  {
    command: '/help',
    description: '사용 가능한 명령어 목록 보기',
    usage: '/help',
  },
  {
    command: '/members',
    description: '현재 참여 중인 멤버 목록 보기',
    usage: '/members',
  },
  {
    command: '/poll',
    description: '투표 생성하기',
    usage: '/poll [질문] [옵션1] [옵션2] ...',
  },
  {
    command: '/vote',
    description: '투표하기',
    usage: '/vote [투표ID] [옵션번호]',
  },
  {
    command: '/endpoll',
    description: '투표 종료하기',
    usage: '/endpoll [투표ID]',
  },
  {
    command: '/clear',
    description: '내 메시지 모두 삭제',
    usage: '/clear',
  },
  {
    command: '/leave',
    description: '채팅방 나가기',
    usage: '/leave',
  },
  {
    command: '/dice',
    description: '주사위 굴리기 (1-6)',
    usage: '/dice',
  },
  {
    command: '/coin',
    description: '동전 던지기 (앞면/뒷면)',
    usage: '/coin',
  },
  {
    command: '/random',
    description: '무작위 숫자 생성',
    usage: '/random [최소값] [최대값]',
  },
]

/**
 * @typedef {Object} PollOption
 * @property {number} optionId - 옵션 ID
 * @property {string} text - 옵션 텍스트
 * @property {number} voteCount - 투표 수
 * @property {string[]} voters - 투표한 사용자 ID 목록
 */

/**
 * @typedef {Object} PollCreateData
 * @property {string} pollId - 투표 ID
 * @property {string} question - 투표 질문
 * @property {PollOption[]} options - 투표 옵션 목록
 * @property {string} creatorId - 생성자 ID
 * @property {string} createdAt - ISO-8601 생성 시간
 * @property {boolean} isActive - 활성 상태
 */

/**
 * @typedef {Object} PollVoteData
 * @property {string} pollId - 투표 ID
 * @property {number} optionId - 선택한 옵션 ID
 * @property {string} userId - 투표한 사용자 ID
 * @property {PollOption[]} updatedOptions - 업데이트된 옵션 목록
 */

/**
 * @typedef {Object} PollEndData
 * @property {string} pollId - 투표 ID
 * @property {PollOption[]} finalResults - 최종 결과
 * @property {string} endedBy - 종료한 사용자 ID
 * @property {string} endedAt - ISO-8601 종료 시간
 */

/**
 * @typedef {Object} SystemCommandData
 * @property {string} commandType - 명령어 타입 (dice, coin, random, members, help)
 * @property {string} userId - 명령어 실행 사용자 ID
 * @property {Object} result - 명령어 실행 결과
 * @property {string} displayText - 표시할 텍스트
 */

/**
 * @typedef {Object} ClearChatData
 * @property {string} userId - 삭제 요청 사용자 ID
 * @property {string[]} messageIds - 삭제된 메시지 ID 목록
 */

/**
 * @typedef {Object} LeaveRoomData
 * @property {string} userId - 퇴장한 사용자 ID
 * @property {string} roomId - 방 ID
 * @property {string} leftAt - ISO-8601 퇴장 시간
 */

/**
 * @typedef {Object} MembersListData
 * @property {string[]} memberIds - 멤버 ID 목록
 * @property {number} totalCount - 총 멤버 수
 */

/**
 * 명령어 파싱 유틸리티
 * @param {string} message - 입력된 메시지
 * @returns {{isCommand: boolean, command: string, args: string[]}}
 */
export function parseCommand(message) {
  const trimmed = message.trim()

  if (!trimmed.startsWith('/')) {
    return { isCommand: false, command: '', args: [] }
  }

  const parts = trimmed.split(/\s+/)
  const command = parts[0].toLowerCase()
  const args = parts.slice(1)

  return {
    isCommand: true,
    command,
    args,
  }
}

/**
 * 명령어가 유효한지 확인
 * @param {string} command - 명령어 (예: '/help')
 * @returns {boolean}
 */
export function isValidCommand(command) {
  return COMMANDS.some(cmd => cmd.command === command.toLowerCase())
}

/**
 * 명령어 검색 (자동완성용)
 * @param {string} input - 사용자 입력
 * @returns {Array} 일치하는 명령어 목록
 */
export function searchCommands(input) {
  const lowerInput = input.toLowerCase()
  return COMMANDS.filter(cmd => cmd.command.startsWith(lowerInput))
}

/**
 * 투표 결과 계산
 * @param {PollOption[]} options - 투표 옵션 목록
 * @returns {{totalVotes: number, percentages: number[]}}
 */
export function calculatePollResults(options) {
  const totalVotes = options.reduce((sum, opt) => sum + opt.voteCount, 0)
  const percentages = options.map(opt =>
    totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0
  )

  return { totalVotes, percentages }
}

/**
 * 시스템 명령어 아이콘 및 색상 설정
 */
export const SystemCommandConfig = {
  dice: {
    icon: '🎲',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
  coin: {
    icon: '🪙',
    color: '#f59e0b',
    bgColor: '#fffbeb',
  },
  random: {
    icon: '🔢',
    color: '#06b6d4',
    bgColor: '#ecfeff',
  },
  members: {
    icon: '👥',
    color: '#10b981',
    bgColor: '#ecfdf5',
  },
  help: {
    icon: '❓',
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
}
