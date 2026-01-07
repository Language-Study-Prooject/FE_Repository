import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Collapse,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'
import {
  Mic as SpeakingIcon,
  Create as WritingCategoryIcon,
  Headphones as OpicIcon,
  Edit as WritingIcon,
  People as PeopleIcon,
  SmartToy as AiIcon,
  ChevronRight as ChevronRightIcon,
  MenuBook as VocabIcon,
  School as LearnIcon,
  Quiz as QuizIcon,
  LibraryBooks as WordListIcon,
} from '@mui/icons-material'
import MainLayout from './layouts/MainLayout'
import FreetalkPeoplePage from './domains/freetalk/pages/FreetalkPeoplePage'
import ChatRoomPage from './domains/freetalk/pages/ChatRoomPage'
import ChatRoomModal from './domains/freetalk/components/ChatRoomModal'
import VocabDashboard from './domains/vocab/pages/VocabDashboard'
import DailyLearning from './domains/vocab/pages/DailyLearning'
import TestPage from './domains/vocab/pages/TestPage'
import WordListPage from './domains/vocab/pages/WordListPage'
import StatsPage from './domains/vocab/pages/StatsPage'
import { useChat } from './contexts/ChatContext'
import { useSettings } from './contexts/SettingsContext'

// 임시 대시보드 페이지
function Dashboard() {
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState(null)

  const learningModes = [
    {
      id: 'speaking',
      title: '말하기연습',
      description: '오픽 연습과 AI 대화로 스피킹 실력 향상',
      icon: SpeakingIcon,
      color: '#2196f3',
      children: [
        { id: 'opic', title: '오픽연습', icon: OpicIcon, path: '/opic', description: '레벨별 맞춤 연습' },
        { id: 'ai-talk', title: 'AI와 말해보기', icon: AiIcon, path: '/freetalk/ai', description: 'AI와 자유로운 대화' },
      ],
    },
    {
      id: 'writing',
      title: '쓰기연습',
      description: '채팅과 작문으로 라이팅 실력 향상',
      icon: WritingCategoryIcon,
      color: '#4caf50',
      children: [
        { id: 'chat-people', title: '사람들과 채팅하기', icon: PeopleIcon, path: '/freetalk/people', description: '다른 학습자와 대화' },
        { id: 'writing-practice', title: '작문연습', icon: WritingIcon, path: '/writing', description: '문법 교정 & 피드백' },
      ],
    },
    {
      id: 'vocab',
      title: '단어 학습',
      description: '매일 55개 단어로 어휘력 향상',
      icon: VocabIcon,
      color: '#9c27b0',
      children: [
        { id: 'vocab-daily', title: '단어 외우기', icon: LearnIcon, path: '/vocab', description: '매일 55개 단어 학습' },
        { id: 'vocab-test', title: '시험 보기', icon: QuizIcon, path: '/vocab/test', description: '4지선다 퀴즈' },
        { id: 'vocab-words', title: '단어장', icon: WordListIcon, path: '/vocab/words', description: '전체 단어 목록' },
      ],
    },
  ]

  const handleCardHover = (modeId) => {
    setExpandedCard(modeId)
  }

  const handleCardLeave = () => {
    setExpandedCard(null)
  }

  const handleSubItemClick = (path, e) => {
    e.stopPropagation()
    navigate(path)
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          안녕하세요!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          오늘은 어떤 학습을 해볼까요?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {learningModes.map((mode) => {
          const Icon = mode.icon
          const isExpanded = expandedCard === mode.id
          const hasChildren = mode.children && mode.children.length > 0

          return (
            <Grid item xs={12} sm={6} key={mode.id}>
              <Card
                onMouseEnter={() => handleCardHover(mode.id)}
                onMouseLeave={handleCardLeave}
                onClick={() => !hasChildren && mode.path && navigate(mode.path)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isExpanded ? 8 : 1,
                  border: isExpanded ? `2px solid ${mode.color}` : '2px solid transparent',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {/* 메인 아이콘 */}
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: `${mode.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 32, color: mode.color }} />
                    </Box>

                    {/* 텍스트 */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight={600}>
                          {mode.title}
                        </Typography>
                        {hasChildren && (
                          <ChevronRightIcon
                            sx={{
                              transition: 'transform 0.3s',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              color: mode.color,
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {mode.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* 하위 카테고리 - 애니메이션으로 펼쳐짐 */}
                  {hasChildren && (
                    <Collapse in={isExpanded} timeout={400}>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          mt: 3,
                          pt: 3,
                          borderTop: 1,
                          borderColor: 'divider',
                        }}
                      >
                        {mode.children.map((child, index) => {
                          const ChildIcon = child.icon
                          return (
                            <Box
                              key={child.id}
                              onClick={(e) => handleSubItemClick(child.path, e)}
                              sx={{
                                flex: 1,
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: 'action.hover',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
                                opacity: isExpanded ? 1 : 0,
                                transitionDelay: `${index * 100}ms`,
                                '&:hover': {
                                  backgroundColor: `${mode.color}20`,
                                  transform: 'scale(1.02)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ChildIcon sx={{ color: mode.color, fontSize: 24 }} />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {child.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {child.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )
                        })}
                      </Box>
                    </Collapse>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* 최근 학습 */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          최근 학습
        </Typography>
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center" py={4}>
              아직 학습 기록이 없습니다. 학습을 시작해보세요!
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

// 임시 페이지들
function OpicPage() {
  return (
    <Container>
      <Typography variant="h4">OPIC 연습</Typography>
      <Typography color="text.secondary">레벨별 맞춤 연습</Typography>
    </Container>
  )
}

function FreetalkAiPage() {
  return (
    <Container>
      <Typography variant="h4">프리토킹 - AI와</Typography>
      <Typography color="text.secondary">AI와 자유로운 대화</Typography>
    </Container>
  )
}

function WritingPage() {
  return (
    <Container>
      <Typography variant="h4">작문 연습</Typography>
      <Typography color="text.secondary">문법 교정 & 피드백</Typography>
    </Container>
  )
}

function ReportsPage() {
  return (
    <Container>
      <Typography variant="h4">내 리포트</Typography>
      <Typography color="text.secondary">학습 결과 분석</Typography>
    </Container>
  )
}

function SettingsPage() {
  const { settings, setTtsVoice } = useSettings()

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          설정
        </Typography>
        <Typography variant="body1" color="text.secondary">
          앱 설정을 변경할 수 있습니다
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
              TTS 음성 선택
            </FormLabel>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              채팅에서 메시지를 읽어줄 음성을 선택하세요
            </Typography>
            <RadioGroup
              value={settings.ttsVoice}
              onChange={(e) => setTtsVoice(e.target.value)}
            >
              <FormControlLabel
                value="FEMALE"
                control={<Radio />}
                label="여성 음성"
              />
              <FormControlLabel
                value="MALE"
                control={<Radio />}
                label="남성 음성"
              />
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </Container>
  )
}

function NotFound() {
  return (
    <Container>
      <Box textAlign="center" py={8}>
        <Typography variant="h1" fontWeight={700} color="primary">
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          페이지를 찾을 수 없습니다
        </Typography>
        <Button variant="contained" href="/" sx={{ mt: 2 }}>
          홈으로 돌아가기
        </Button>
      </Box>
    </Container>
  )
}

function App() {
  const { activeRoom, closeChatRoom } = useChat()

  const handleRefreshRooms = () => {
    // 채팅방 퇴장 후 목록 새로고침 (페이지에서 처리)
  }

  return (
    <>
      <Routes>
        {/* 채팅방 페이지 (별도 레이아웃) */}
        <Route path="/freetalk/people/room/:roomId" element={<ChatRoomPage />} />

        {/* MainLayout 적용 라우트 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/opic" element={<OpicPage />} />
          <Route path="/freetalk/people" element={<FreetalkPeoplePage />} />
          <Route path="/freetalk/ai" element={<FreetalkAiPage />} />
          <Route path="/writing" element={<WritingPage />} />
          <Route path="/vocab" element={<VocabDashboard />} />
          <Route path="/vocab/daily" element={<DailyLearning />} />
          <Route path="/vocab/test" element={<TestPage />} />
          <Route path="/vocab/words" element={<WordListPage />} />
          <Route path="/vocab/stats" element={<StatsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* 전역 채팅 모달 */}
      <ChatRoomModal
        open={!!activeRoom}
        onClose={closeChatRoom}
        room={activeRoom}
        onLeave={handleRefreshRooms}
      />
    </>
  )
}

export default App
