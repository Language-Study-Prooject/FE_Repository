import { createTheme } from '@mui/material/styles'

const baseTheme = {
  typography: {
    fontFamily: '"Roboto", "Noto Sans KR", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
}

// 라이트 모드
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#0124ac',
      light: '#4a52d4',
      dark: '#001a7a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },
})

// 다크 모드
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4a6cf7',
      light: '#7b93f9',
      dark: '#2148c4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#42a5f5',
      contrastText: '#000000',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: '#334155',
  },
})

// 기본 export (하위 호환성)
export default lightTheme
