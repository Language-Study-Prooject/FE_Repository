import { Routes, Route } from 'react-router-dom'
import { Box, Typography, Container, Button, Stack } from '@mui/material'

function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to FE Repository
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          React + Vite + MUI 프로젝트가 준비되었습니다.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          <Button variant="contained" color="primary" size="large">
            Primary 버튼
          </Button>
          <Button variant="outlined" color="primary" size="large">
            Outlined 버튼
          </Button>
          <Button variant="contained" color="secondary" size="large">
            Secondary 버튼
          </Button>
        </Stack>

        <Box sx={{
          mt: 4,
          p: 3,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2
        }}>
          <Typography variant="h6">
            Primary Color: #0124ac
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
