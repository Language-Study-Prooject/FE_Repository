import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material'
import { useThemeMode } from '../../../contexts/ThemeContext'

const Header = ({ onMenuClick, sidebarOpen }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { mode, toggleTheme } = useThemeMode()

  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    handleProfileMenuClose()
    // TODO: 로그아웃 로직
    navigate('/login')
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'primary.main',
      }}
    >
      <Toolbar>
        {/* 햄버거 메뉴 (모바일/태블릿) */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* 로고 & 서비스명 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <SchoolIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.5px',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            AI 언어 학습
          </Typography>
        </Box>

        {/* 중앙 네비게이션 (데스크톱) */}
        {!isMobile && (
          <Box sx={{ display: 'flex', ml: 4, gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ fontWeight: 500 }}
            >
              대시보드
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/learning')}
              sx={{ fontWeight: 500 }}
            >
              학습 모드
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/reports')}
              sx={{ fontWeight: 500 }}
            >
              리포트
            </Button>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* 우측 아이콘들 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* 다크모드 토글 */}
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            title={mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* 알림 */}
          <IconButton
            color="inherit"
            onClick={handleNotificationOpen}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* 프로필 */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'secondary.main',
              }}
            >
              U
            </Avatar>
          </IconButton>
        </Box>

        {/* 알림 메뉴 */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              알림
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2">
                면접 연습 세션이 완료되었습니다.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                10분 전
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2">
                OPIC 모의고사 결과가 도착했습니다.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1시간 전
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box>
              <Typography variant="body2">
                새로운 학습 리포트가 생성되었습니다.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                어제
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

        {/* 프로필 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          PaperProps={{
            sx: { width: 200 },
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              사용자님
            </Typography>
            <Typography variant="caption" color="text.secondary">
              user@example.com
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
            <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
            내 프로필
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
            <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
            설정
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header
