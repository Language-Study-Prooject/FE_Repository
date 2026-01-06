import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Box, Typography, Container, Card, CardContent, Grid, Button, Collapse, IconButton } from '@mui/material'
import {
  School as EnglishIcon,
  Chat as FreetalkIcon,
  Headphones as OpicIcon,
  Edit as WritingIcon,
  People as PeopleIcon,
  SmartToy as AiIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import MainLayout from './layouts/MainLayout'

// 임시 대시보드 페이지
function Dashboard() {
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState(null)

  const learningModes = [
    {
      id: 'english',
      title: '영어공부',
      description: 'OPIC 연습, 작문 연습으로 영어 실력 향상',
      icon: EnglishIcon,
      color: '#2196f3',
      children: [
        { id: 'opic', title: 'OPIC 연습', icon: OpicIcon, path: '/opic', description: '레벨별 맞춤 연습' },
        { id: 'writing', title: '작문 연습', icon: WritingIcon, path: '/writing', description: '문법 교정 & 피드백' },
      ],
    },
    {
      id: 'freetalk',
      title: '프리토킹',
      description: '사람들과 또는 AI와 자유롭게 대화',
      icon: FreetalkIcon,
      color: '#4caf50',
      children: [
        { id: 'freetalk-people', title: '사람들과', icon: PeopleIcon, path: '/freetalk/people', description: '다른 학습자와 대화' },
        { id: 'freetalk-ai', title: 'AI와', icon: AiIcon, path: '/freetalk/ai', description: 'AI와 자유 대화' },
      ],
    },
  ]

  const handleCardClick = (mode) => {
    if (mode.children) {
      setExpandedCard(expandedCard === mode.id ? null : mode.id)
    } else if (mode.path) {
      navigate(mode.path)
    }
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

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {learningModes.map((mode) => {
          const Icon = mode.icon
          const isExpanded = expandedCard === mode.id
          const hasChildren = mode.children && mode.children.length > 0

          return (
            <Box
              key={mode.id}
              sx={{
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                width: isExpanded ? { xs: '100%', md: '500px' } : { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
                minWidth: isExpanded ? { xs: '100%', md: '500px' } : 'auto',
              }}
            >
              <Card
                onClick={() => handleCardClick(mode)}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isExpanded ? 8 : 1,
                  border: isExpanded ? `2px solid ${mode.color}` : '2px solid transparent',
                  '&:hover': {
                    transform: isExpanded ? 'scale(1.02)' : 'translateY(-4px)',
                    boxShadow: isExpanded ? 8 : 4,
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
            </Box>
          )
        })}
      </Box>

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
function InterviewPage() {
  return (
    <Container>
      <Typography variant="h4">면접 시뮬레이션</Typography>
      <Typography color="text.secondary">AI 면접관과 실전 연습</Typography>
    </Container>
  )
}

function OpicPage() {
  return (
    <Container>
      <Typography variant="h4">OPIC 연습</Typography>
      <Typography color="text.secondary">레벨별 맞춤 연습</Typography>
    </Container>
  )
}

function FreetalkPeoplePage() {
  return (
    <Container>
      <Typography variant="h4">프리토킹 - 사람들과</Typography>
      <Typography color="text.secondary">다른 학습자와 영어로 대화</Typography>
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
  return (
    <Container>
      <Typography variant="h4">설정</Typography>
      <Typography color="text.secondary">계정 및 앱 설정</Typography>
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
  return (
    <Routes>
      {/* MainLayout 적용 라우트 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/opic" element={<OpicPage />} />
        <Route path="/freetalk/people" element={<FreetalkPeoplePage />} />
        <Route path="/freetalk/ai" element={<FreetalkAiPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
