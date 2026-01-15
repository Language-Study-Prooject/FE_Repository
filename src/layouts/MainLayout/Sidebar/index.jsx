import {useEffect, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {
    Box,
    Collapse,
    Divider,
    Drawer,
    IconButton,
    LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import {
    Assessment as ReportIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Create as WritingCategoryIcon,
    Dashboard as DashboardIcon,
    Edit as WritingIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Headphones as OpicIcon,
    LibraryBooks as WordListIcon,
    MenuBook as VocabIcon,
    Mic as SpeakingIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    School as LearnIcon,
    Settings as SettingsIcon,
    SmartToy as AiIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {useTranslation} from '../../../contexts/SettingsContext'

const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 76

const Sidebar = ({open, collapsed, onToggleCollapse, onClose}) => {
    const theme = useTheme()
    const {mode} = useThemeMode()
    const location = useLocation()
    const navigate = useNavigate()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const {t} = useTranslation()

    const [expandedMenus, setExpandedMenus] = useState(() => {
        const saved = localStorage.getItem('expandedMenus')
        return saved ? JSON.parse(saved) : {speaking: true, writing: true, vocab: true}
    })

    useEffect(() => {
        localStorage.setItem('expandedMenus', JSON.stringify(expandedMenus))
    }, [expandedMenus])

    const menuItems = [
        {
            category: t('sidebar.learningMode'),
            items: [
                {
                    id: 'speaking',
                    label: t('sidebar.speaking'),
                    icon: SpeakingIcon,
                    color: '#3b82f6',
                    bgColor: '#eff6ff',
                    children: [
                        {
                            id: 'opic',
                            label: t('sidebar.opicPractice'),
                            icon: OpicIcon,
                            path: '/opic',
                            description: t('sidebar.opicDesc'),
                        },
                        {
                            id: 'ai-talk',
                            label: t('sidebar.aiTalk'),
                            icon: AiIcon,
                            path: '/freetalk/ai',
                            description: t('sidebar.aiTalkDesc'),
                        },
                    ],
                },
                {
                    id: 'writing',
                    label: t('sidebar.writing'),
                    icon: WritingCategoryIcon,
                    color: '#8b5cf6',
                    bgColor: '#f5f3ff',
                    children: [
                        {
                            id: 'chat-people',
                            label: t('sidebar.chatPeople'),
                            icon: PeopleIcon,
                            path: '/freetalk/people',
                            description: t('sidebar.chatPeopleDesc'),
                        },
                        {
                            id: 'writing-practice',
                            label: t('sidebar.writingPractice'),
                            icon: WritingIcon,
                            path: '/writing',
                            description: t('sidebar.writingPracticeDesc'),
                        },
                    ],
                },
                {
                    id: 'vocab',
                    label: t('sidebar.vocab'),
                    icon: VocabIcon,
                    color: '#059669',
                    bgColor: '#ecfdf5',
                    children: [
                        {
                            id: 'vocab-daily',
                            label: t('sidebar.vocabLearn'),
                            icon: LearnIcon,
                            path: '/vocab',
                            description: t('sidebar.vocabLearnDesc'),
                        },
                        {
                            id: 'vocab-test',
                            label: t('sidebar.vocabTest'),
                            icon: QuizIcon,
                            path: '/vocab/test',
                            description: t('sidebar.vocabTestDesc'),
                        },
                        {
                            id: 'vocab-words',
                            label: t('sidebar.vocabWords'),
                            icon: WordListIcon,
                            path: '/vocab/words',
                            description: t('sidebar.vocabWordsDesc'),
                        },
                        {
                            id: 'vocab-stats',
                            label: t('vocabDash.viewStats'),
                            icon: TrendingIcon,
                            path: '/vocab/stats',
                            description: t('sidebar.reportsDesc'),
                        },
                    ],
                },
            ],
        },
        {
            category: t('sidebar.other'),
            items: [
                {
                    id: 'dashboard',
                    label: t('nav.dashboard'),
                    icon: DashboardIcon,
                    path: '/dashboard',
                    description: t('sidebar.dashboardDesc'),
                    color: '#f97316',
                    bgColor: '#fff7ed',
                },
                {
                    id: 'reports',
                    label: t('nav.reports'),
                    icon: ReportIcon,
                    path: '/reports',
                    description: t('sidebar.reportsDesc'),
                    color: '#ec4899',
                    bgColor: '#fdf2f8',
                },
                {
                    id: 'settings',
                    label: t('nav.settings'),
                    icon: SettingsIcon,
                    path: '/settings',
                    description: t('sidebar.settingsDesc'),
                    color: '#6b7280',
                    bgColor: '#f3f4f6',
                },
            ],
        },
    ]

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
        const itemColor = item.color || '#059669'
        const itemBgColor = item.bgColor || '#ecfdf5'

        return (
            <Box key={item.id}>
                <ListItem disablePadding sx={{mb: 0.5}}>
                    <ListItemButton
                        onClick={() => {
                            if (hasChildren) {
                                handleToggleExpand(item.id)
                            } else if (item.path) {
                                handleNavigation(item.path)
                            }
                        }}
                        sx={{
                            borderRadius: '14px',
                            minHeight: collapsed ? 48 : 52,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            px: collapsed ? 1.5 : 2,
                            pl: isChild && !collapsed ? 3.5 : (collapsed ? 1.5 : 2),
                            mx: 1,
                            backgroundColor: active && !hasChildren
                                ? itemBgColor
                                : 'transparent',
                            border: '2px solid',
                            borderColor: active && !hasChildren ? itemColor : 'transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: active && !hasChildren
                                    ? itemBgColor
                                    : mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderColor: active && !hasChildren ? itemColor : 'transparent',
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: collapsed ? 0 : 40,
                                justifyContent: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: isChild ? 32 : 36,
                                    height: isChild ? 32 : 36,
                                    borderRadius: '10px',
                                    backgroundColor: active && !hasChildren ? itemColor : (hasChildren && active ? `${itemColor}15` : 'transparent'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Icon
                                    fontSize={isChild ? 'small' : 'medium'}
                                    sx={{
                                        color: active && !hasChildren ? 'white' : (active ? itemColor : 'text.secondary'),
                                    }}
                                />
                            </Box>
                        </ListItemIcon>

                        {!collapsed && (
                            <>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: isChild ? 13 : 14,
                                        fontWeight: active ? 700 : 500,
                                        color: active && !hasChildren ? itemColor : 'text.primary',
                                    }}
                                />
                                {hasChildren && (
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '8px',
                                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {expanded ? (
                                            <ExpandLessIcon sx={{fontSize: 18, color: 'text.secondary'}}/>
                                        ) : (
                                            <ExpandMoreIcon sx={{fontSize: 18, color: 'text.secondary'}}/>
                                        )}
                                    </Box>
                                )}
                            </>
                        )}
                    </ListItemButton>
                </ListItem>

                {hasChildren && !collapsed && (
                    <Collapse in={expanded} timeout={200} unmountOnExit>
                        <List disablePadding>
                            {item.children.map((child) => renderMenuItem({
                                ...child,
                                color: itemColor,
                                bgColor: itemBgColor
                            }, true))}
                        </List>
                    </Collapse>
                )}
            </Box>
        )
    }

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: mode === 'dark' ? 'background.paper' : 'white',
            }}
        >
            {/* Header spacing */}
            <Box sx={{height: 64}}/>

            {/* Collapse toggle */}
            {!isMobile && (
                <Box sx={{display: 'flex', justifyContent: 'flex-end', px: 1.5, py: 1}}>
                    <IconButton
                        onClick={onToggleCollapse}
                        size="small"
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '10px',
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        {collapsed ? (
                            <ChevronRightIcon fontSize="small"/>
                        ) : (
                            <ChevronLeftIcon fontSize="small"/>
                        )}
                    </IconButton>
                </Box>
            )}

            {/* Menu list */}
            <Box sx={{flex: 1, overflow: 'auto', py: 1}}>
                {menuItems.map((category, categoryIndex) => (
                    <Box key={category.category} sx={{mb: 2}}>
                        {!collapsed && (
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    display: 'block',
                                    color: 'text.disabled',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontSize: 10,
                                }}
                            >
                                {category.category}
                            </Typography>
                        )}

                        <List disablePadding>
                            {category.items.map((item) => renderMenuItem(item))}
                        </List>

                        {categoryIndex < menuItems.length - 1 && !collapsed && (
                            <Divider sx={{my: 2, mx: 2}}/>
                        )}
                    </Box>
                ))}
            </Box>

            {/* Bottom stats */}
            {!collapsed && (
                <Box
                    sx={{
                        p: 2.5,
                        mx: 2,
                        mb: 2,
                        borderRadius: '16px',
                        background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(5, 150, 105, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)'
                            : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {t('sidebar.todayStudyTime')}
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: '#059669',
                            mt: 0.5,
                            fontFamily: '"Outfit", sans-serif',
                        }}
                    >
                        1h 23m
                    </Typography>
                    <Box sx={{mt: 1.5}}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">
                                {t('vocabDash.todayProgress')}
                            </Typography>
                            <Typography variant="caption" fontWeight={600} color="#059669">
                                68%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={68}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(5, 150, 105, 0.15)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                                },
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    )

    // Mobile: Temporary Drawer
    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                ModalProps={{keepMounted: true}}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        borderRight: 'none',
                        boxShadow: '4px 0 24px -4px rgba(0,0,0,0.1)',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        )
    }

    // Desktop: Permanent Drawer
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
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
