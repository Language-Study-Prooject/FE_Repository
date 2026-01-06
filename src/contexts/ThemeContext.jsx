import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '../theme/theme'

const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
})

export const useThemeMode = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // localStorage에서 테마 모드 불러오기 (시스템 설정 기본값)
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode')
    if (savedMode) return savedMode

    // 시스템 다크모드 감지
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const savedMode = localStorage.getItem('themeMode')
      if (!savedMode) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 테마 변경 시 localStorage 저장
  useEffect(() => {
    localStorage.setItem('themeMode', mode)
    // body 클래스 추가 (CSS 변수 등에서 활용)
    document.body.classList.remove('light-mode', 'dark-mode')
    document.body.classList.add(`${mode}-mode`)
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme
  }, [mode])

  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
    setMode,
  }), [mode])

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeContext
