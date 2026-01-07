import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'

const DRAWER_WIDTH = 260
const DRAWER_WIDTH_COLLAPSED = 72

const MainLayout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // 모바일 사이드바 열림 상태
  const [mobileOpen, setMobileOpen] = useState(false)

  // 데스크톱 사이드바 접힘 상태 (localStorage 저장)
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // collapsed 상태 localStorage 저장
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
  }, [collapsed])

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed)
  }

  const drawerWidth = isMobile ? 0 : (collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header
        onMenuClick={handleMobileToggle}
        sidebarOpen={mobileOpen}
      />

      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        collapsed={collapsed}
        onToggleCollapse={handleCollapseToggle}
        onClose={handleMobileClose}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ml: { xs: 0, md: `${drawerWidth}px` },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Toolbar 높이만큼 여백 */}
        <Box sx={{ height: 64 }} />

        {/* 콘텐츠 영역 */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            backgroundColor: 'background.default',
          }}
        >
          <Outlet />
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  )
}

export default MainLayout
