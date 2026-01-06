import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  RecordVoiceOver as InterviewIcon,
  Headphones as OpicIcon,
  Chat as FreetalkIcon,
  Edit as WritingIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

const DRAWER_WIDTH = 260
const DRAWER_WIDTH_COLLAPSED = 72

const menuItems = [
  {
    category: '학습 모드',
    items: [
      {
        id: 'interview',
        label: '면접 시뮬레이션',
        icon: InterviewIcon,
        path: '/interview',
        description: 'AI 면접관과 실전 연습'
      },
      {
        id: 'opic',
        label: 'OPIC 연습',
        icon: OpicIcon,
        path: '/opic',
        description: '레벨별 맞춤 연습'
      },
      {
        id: 'freetalk',
        label: '프리토킹',
        icon: FreetalkIcon,
        path: '/freetalk',
        description: 'AI와 자유로운 대화'
      },
      {
        id: 'writing',
        label: '작문 연습',
        icon: WritingIcon,
        path: '/writing',
        description: '문법 교정 & 피드백'
      },
    ],
  },
  {
    category: '기타',
    items: [
      {
        id: 'dashboard',
        label: '대시보드',
        icon: DashboardIcon,
        path: '/dashboard',
        description: '학습 현황 요약'
      },
      {
        id: 'reports',
        label: '내 리포트',
        icon: ReportIcon,
        path: '/reports',
        description: '학습 결과 분석'
      },
      {
        id: 'settings',
        label: '설정',
        icon: SettingsIcon,
        path: '/settings',
        description: '계정 및 앱 설정'
      },
    ],
  },
]

const Sidebar = ({ open, collapsed, onToggleCollapse, onClose }) => {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) {
      onClose()
    }
  }

  const isActive = (path) => location.pathname === path

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 영역 - Toolbar 높이만큼 여백 */}
      <Box sx={{ height: 64 }} />

      {/* 접기/펼치기 버튼 */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={onToggleCollapse} size="small">
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}

      {/* 메뉴 리스트 */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1 }}>
        {menuItems.map((category, categoryIndex) => (
          <Box key={category.category} sx={{ mb: 2 }}>
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 1,
                  display: 'block',
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {category.category}
              </Typography>
            )}

            <List disablePadding>
              {category.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)

                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        borderRadius: 2,
                        minHeight: 48,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: collapsed ? 1 : 2,
                        backgroundColor: active ? 'primary.main' : 'transparent',
                        color: active ? 'white' : 'text.primary',
                        '&:hover': {
                          backgroundColor: active
                            ? 'primary.dark'
                            : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: collapsed ? 0 : 40,
                          justifyContent: 'center',
                          color: active ? 'white' : 'primary.main',
                        }}
                      >
                        <Icon />
                      </ListItemIcon>

                      {!collapsed && (
                        <ListItemText
                          primary={item.label}
                          secondary={item.description}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: active ? 600 : 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: 11,
                            color: active ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>

            {categoryIndex < menuItems.length - 1 && !collapsed && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* 하단 정보 */}
      {!collapsed && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            오늘의 학습 시간
          </Typography>
          <Typography variant="h6" color="primary.main" fontWeight={600}>
            1시간 23분
          </Typography>
        </Box>
      )}
    </Box>
  )

  // 모바일: 임시 Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  // 데스크톱: 고정 Drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar
