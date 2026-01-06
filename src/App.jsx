import { Routes, Route } from 'react-router-dom'
import { Box, Typography, Container, Card, CardContent, Grid, Button } from '@mui/material'
import {
  RecordVoiceOver as InterviewIcon,
  Headphones as OpicIcon,
  Chat as FreetalkIcon,
  Edit as WritingIcon,
} from '@mui/icons-material'
import MainLayout from './layouts/MainLayout'

// 임시 대시보드 페이지
function Dashboard() {
  const learningModes = [
    {
      id: 'interview',
      title: '면접 시뮬레이션',
      description: 'AI 면접관과 실전처럼 연습하세요',
      icon: InterviewIcon,
      color: '#0124ac',
      path: '/interview',
    },
    {
      id: 'opic',
      title: 'OPIC 연습',
      description: '레벨별 맞춤 문제로 실력 향상',
      icon: OpicIcon,
      color: '#2196f3',
      path: '/opic',
    },
    {
      id: 'freetalk',
      title: '프리토킹',
      description: 'AI와 자유롭게 영어로 대화',
      icon: FreetalkIcon,
      color: '#4caf50',
      path: '/freetalk',
    },
    {
      id: 'writing',
      title: '작문 연습',
      description: '문법 교정과 표현 피드백',
      icon: WritingIcon,
      color: '#ff9800',
      path: '/writing',
    },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          안녕하세요! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          오늘은 어떤 학습을 해볼까요?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {learningModes.map((mode) => {
          const Icon = mode.icon
          return (
            <Grid item xs={12} sm={6} md={3} key={mode.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: `${mode.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Icon sx={{ fontSize: 32, color: mode.color }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {mode.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mode.description}
                  </Typography>
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

function FreetalkPage() {
  return (
    <Container>
      <Typography variant="h4">프리토킹</Typography>
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
        <Route path="/freetalk" element={<FreetalkPage />} />
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
