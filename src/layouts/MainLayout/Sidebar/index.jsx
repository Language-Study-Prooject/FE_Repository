import { useState, useEffect } from 'react'
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
  Collapse,
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
  School as EnglishIcon,
  People as PeopleIcon,
  SmartToy as AiIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'

const DRAWER_WIDTH = 260
const DRAWER_WIDTH_COLLAPSED = 72

const menuItems = [
  {
    category: '학습 모드',
    items: [
      {
        id: 'english',
        label: '영어공부',
        icon: EnglishIcon,
        children: [
          {
            id: 'opic',
            label: 'OPIC 연습',
            icon: OpicIcon,
            path: '/opic',
            description: '레벨별 맞춤 연습'
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
        id: 'interview',
        label: '면접 시뮬레이션',
        icon: InterviewIcon,
        path: '/interview',
        description: 'AI 면접관과 실전 연습'
      },
      {
        id: 'freetalk',
        label: '프리토킹',
        icon: FreetalkIcon,
        children: [
          {
            id: 'freetalk-people',
            label: '사람들과',
            icon: PeopleIcon,
            path: '/freetalk/people',
            description: '다른 학습자와 대화'
          },
          {
            id: 'freetalk-ai',
            label: 'AI와',
            icon: AiIcon,
            path: '/freetalk/ai',
            description: 'AI와 자유로운 대화'
          },
        ],
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

  // 펼침 상태 (localStorage 저장)
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const saved = localStorage.getItem('expandedMenus')
    return saved ? JSON.parse(saved) : { english: true, freetalk: true }
  })

  useEffect(() => {
    localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus))
  }, [expandedMenus])

  const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH

  const handleNavigation = (path) => {
    navigate(path)
    if (isMobile) {
      onClose()
    }
  }

  const handleToggleExpand = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  const isActive = (path) => location.pathname === path
  const isParentActive = (children) => children?.some((child) => location.pathname === child.path)

  const renderMenuItem = (item, isChild = false) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const active = item.path ? isActive(item.path) : isParentActive(item.children)
    const expanded = expandedMenus[item.id]

    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                handleToggleExpand(item.id)
              } else if (item.path) {
                handleNavigation(item.path)
              }
            }}
            sx={{
              borderRadius: 2,
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1 : 2,
              pl: isChild && !collapsed ? 4 : (collapsed ? 1 : 2),
              backgroundColor: active && !hasChildren ? 'primary.main' : 'transparent',
              color: active && !hasChildren ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: active && !hasChildren
                  ? 'primary.dark'
                  : 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 40,
                justifyContent: 'center',
                color: active && !hasChildren ? 'white' : 'primary.main',
              }}
            >
              <Icon fontSize={isChild ? 'small' : 'medium'} />
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  secondary={!hasChildren ? item.description : null}
                  primaryTypographyProps={{
                    fontSize: isChild ? 13 : 14,
                    fontWeight: active ? 600 : 500,
                  }}
                  secondaryTypographyProps={{
                    fontSize: 11,
                    color: active && !hasChildren ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  }}
                />
                {hasChildren && (
                  expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {/* 하위 메뉴 */}
        {hasChildren && !collapsed && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children.map((child) => renderMenuItem(child, true))}
            </List>
          </Collapse>
        )}
      </Box>
    )
  }

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
              {category.items.map((item) => renderMenuItem(item))}
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
