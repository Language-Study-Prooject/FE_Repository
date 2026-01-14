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
  WavingHand as WaveIcon,
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
import { WritingPage } from './domains/grammar'
import { BadgeSection } from './domains/badge'
import { useChat } from './contexts/ChatContext'
import { useSettings } from './contexts/SettingsContext'

// Dashboard Page
function Dashboard() {
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState(null)
  const { t } = useSettings()

  const learningModes = [
    {
      id: 'speaking',
      title: t('dashboard.speakingTitle'),
      description: t('dashboard.speakingDesc'),
      icon: SpeakingIcon,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      children: [
        { id: 'opic', title: t('dashboard.opicTitle'), icon: OpicIcon, path: '/opic', description: t('dashboard.opicDesc') },
        { id: 'ai-talk', title: t('dashboard.aiTalkTitle'), icon: AiIcon, path: '/freetalk/ai', description: t('dashboard.aiTalkDesc') },
      ],
    },
    {
      id: 'writing',
      title: t('dashboard.writingTitle'),
      description: t('dashboard.writingDesc'),
      icon: WritingCategoryIcon,
      color: '#10b981',
      bgColor: '#ecfdf5',
      children: [
        { id: 'chat-people', title: t('dashboard.chatTitle'), icon: PeopleIcon, path: '/freetalk/people', description: t('dashboard.chatDesc') },
        { id: 'writing-practice', title: t('dashboard.compositionTitle'), icon: WritingIcon, path: '/writing', description: t('dashboard.compositionDesc') },
      ],
    },
    {
      id: 'vocab',
      title: t('dashboard.vocabTitle'),
      description: t('dashboard.vocabDesc'),
      icon: VocabIcon,
      color: '#f97316',
      bgColor: '#fff7ed',
      children: [
        { id: 'vocab-daily', title: t('dashboard.dailyWordsTitle'), icon: LearnIcon, path: '/vocab', description: t('dashboard.dailyWordsDesc') },
        { id: 'vocab-test', title: t('dashboard.quizTitle'), icon: QuizIcon, path: '/vocab/test', description: t('dashboard.quizDesc') },
        { id: 'vocab-words', title: t('dashboard.wordListTitle'), icon: WordListIcon, path: '/vocab/words', description: t('dashboard.wordListDesc') },
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
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5, pt: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(249, 115, 22, 0.3)',
            }}
          >
            <WaveIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {t('dashboard.greeting')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.subtitle')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Learning Mode Cards */}
      <Grid container spacing={3}>
        {learningModes.map((mode) => {
          const Icon = mode.icon
          const isExpanded = expandedCard === mode.id
          const hasChildren = mode.children && mode.children.length > 0

          return (
            <Grid item xs={12} md={6} key={mode.id}>
              <Card
                onMouseEnter={() => handleCardHover(mode.id)}
                onMouseLeave={handleCardLeave}
                onClick={() => !hasChildren && mode.path && navigate(mode.path)}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '2px solid transparent',
                  borderColor: isExpanded ? mode.color : 'transparent',
                  transform: isExpanded ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isExpanded
                    ? `0 20px 40px -12px ${mode.color}30`
                    : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  '&:hover': {
                    borderColor: mode.color,
                  },
                  height: 'auto',
                  minHeight: isExpanded ? 'auto' : 140,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        backgroundColor: mode.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color: mode.color }} />
                    </Box>

                    {/* Text */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight={700}>
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
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {mode.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Sub-items */}
                  {hasChildren && (
                    <Collapse in={isExpanded} timeout={300}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: mode.children.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                          gap: 2,
                          mt: 3,
                          pt: 3,
                          borderTop: '1px solid',
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
                                p: 2,
                                borderRadius: '14px',
                                backgroundColor: mode.bgColor,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: isExpanded ? 'translateY(0)' : 'translateY(-8px)',
                                opacity: isExpanded ? 1 : 0,
                                transitionDelay: `${index * 50}ms`,
                                '&:hover': {
                                  backgroundColor: `${mode.color}20`,
                                  transform: 'scale(1.02)',
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                minHeight: 100,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  backgroundColor: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 1.5,
                                  boxShadow: '0 2px 8px -2px rgba(0,0,0,0.1)',
                                }}
                              >
                                <ChildIcon sx={{ color: mode.color, fontSize: 22 }} />
                              </Box>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                                {child.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                                {child.description}
                              </Typography>
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

      {/* Recent Activity */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
          {t('dashboard.recentActivity')}
        </Typography>
        <Card>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                backgroundColor: '#f5f5f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LearnIcon sx={{ fontSize: 32, color: '#a8a29e' }} />
            </Box>
            <Typography color="text.secondary" variant="body1" fontWeight={500}>
              {t('dashboard.noHistory')}
            </Typography>
            <Typography color="text.disabled" variant="body2" sx={{ mt: 0.5 }}>
              {t('dashboard.startLearning')}
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => navigate('/vocab')}
            >
              {t('dashboard.startButton')}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

// Placeholder Pages
function OpicPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700}>OPIC Practice</Typography>
      <Typography color="text.secondary">Level-based training</Typography>
    </Container>
  )
}

function FreetalkAiPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700}>AI Conversation</Typography>
      <Typography color="text.secondary">Free conversation with AI</Typography>
    </Container>
  )
}


function ReportsPage() {
  const { isKorean } = useSettings()

  // 더미 통계 데이터
  const stats = {
    totalStudyDays: 15,
    totalWords: 285,
    totalTests: 12,
    averageScore: 82,
    currentStreak: 5,
    bestStreak: 8,
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.3)',
            }}
          >
            <QuizIcon sx={{ fontSize: 26, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              {isKorean ? '학습 리포트' : 'Learning Report'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isKorean ? '나의 학습 현황을 확인하세요' : 'Check your learning progress'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 통계 요약 카드 */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isKorean ? '총 학습일' : 'Study Days'}
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#3b82f6">
              {stats.totalStudyDays}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {isKorean ? '일' : 'days'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isKorean ? '학습한 단어' : 'Words Learned'}
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#10b981">
              {stats.totalWords}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {isKorean ? '개' : 'words'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isKorean ? '테스트 완료' : 'Tests Taken'}
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#f97316">
              {stats.totalTests}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {isKorean ? '회' : 'tests'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: '16px', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {isKorean ? '평균 점수' : 'Average Score'}
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#8b5cf6">
              {stats.averageScore}%
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {isKorean ? '정확도' : 'accuracy'}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 연속 학습 */}
      <Card sx={{ p: 3, borderRadius: '20px', mb: 4 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {isKorean ? '연속 학습 기록' : 'Study Streak'}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#fff7ed',
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" fontWeight={800} color="#f97316">
                {stats.currentStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isKorean ? '현재 연속' : 'Current Streak'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#ecfdf5',
                textAlign: 'center',
              }}
            >
              <Typography variant="h3" fontWeight={800} color="#10b981">
                {stats.bestStreak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isKorean ? '최고 기록' : 'Best Streak'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* 배지 섹션 */}
      <BadgeSection />
    </Container>
  )
}

function SettingsPage() {
  const { settings, setTtsVoice, setLanguage, t } = useSettings()

  const languageOptions = [
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
  ]

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 12px -3px rgba(107, 114, 128, 0.3)',
            }}
          >
            <VocabIcon sx={{ fontSize: 26, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {t('settings.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('settings.subtitle')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* Language Settings */}
        <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
              {t('settings.language')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('settings.languageDesc')}
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {languageOptions.map((option) => (
                <Grid item xs={6} key={option.value}>
                  <Box
                    onClick={() => setLanguage(option.value)}
                    sx={{
                      p: 2.5,
                      borderRadius: '16px',
                      border: '2px solid',
                      borderColor: settings.language === option.value ? '#3b82f6' : 'divider',
                      backgroundColor: settings.language === option.value ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      '&:hover': {
                        borderColor: '#3b82f6',
                        backgroundColor: '#eff6ff',
                      },
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {option.flag}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={settings.language === option.value ? 700 : 500}
                      color={settings.language === option.value ? '#3b82f6' : 'text.primary'}
                    >
                      {option.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* TTS Voice Settings */}
        <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Box
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
              {t('settings.ttsVoice')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {t('settings.ttsVoiceDesc')}
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  onClick={() => setTtsVoice('FEMALE')}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: settings.ttsVoice === 'FEMALE' ? '#059669' : 'divider',
                    backgroundColor: settings.ttsVoice === 'FEMALE' ? '#ecfdf5' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: '#ecfdf5',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: settings.ttsVoice === 'FEMALE' ? '#059669' : '#f5f5f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 24 }}>👩</Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight={settings.ttsVoice === 'FEMALE' ? 700 : 500}
                    color={settings.ttsVoice === 'FEMALE' ? '#059669' : 'text.primary'}
                  >
                    {t('settings.femaleVoice')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  onClick={() => setTtsVoice('MALE')}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: settings.ttsVoice === 'MALE' ? '#059669' : 'divider',
                    backgroundColor: settings.ttsVoice === 'MALE' ? '#ecfdf5' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: '#ecfdf5',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: settings.ttsVoice === 'MALE' ? '#059669' : '#f5f5f4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 24 }}>👨</Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    fontWeight={settings.ttsVoice === 'MALE' ? 700 : 500}
                    color={settings.ttsVoice === 'MALE' ? '#059669' : 'text.primary'}
                  >
                    {t('settings.maleVoice')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

function NotFound() {
  const navigate = useNavigate()
  const { t } = useSettings()

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" py={12}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontSize: '8rem',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          {t('notFound.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          {t('notFound.message')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
        >
          {t('notFound.backHome')}
        </Button>
      </Box>
    </Container>
  )
}

function App() {
  const { activeRoom, closeChatRoom } = useChat()

  const handleRefreshRooms = () => {
    // Refresh rooms list after leaving a room
  }

  return (
    <>
      <Routes>
        {/* Chat room page (separate layout) */}
        <Route path="/freetalk/people/room/:roomId" element={<ChatRoomPage />} />

        {/* MainLayout routes */}
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

      {/* Global chat modal */}
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
