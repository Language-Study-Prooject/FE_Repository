import {useRef, useState} from 'react'
import {useLocation, useNavigate} from 'react-router-dom'
import {Box, Fade, Paper, Typography, useMediaQuery, useTheme,} from '@mui/material'
import {
    Assessment as ReportIcon,
    Create as WritingIcon,
    Dashboard as DashboardIcon,
    Edit as WriteIcon,
    Headphones as OpicIcon,
    LibraryBooks as WordListIcon,
    MenuBook as VocabIcon,
    Mic as SpeakingIcon,
    Newspaper as NewsIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    School as LearnIcon,
    Settings as SettingsIcon,
    SmartToy as AiIcon,
    SportsEsports as GameIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {useTranslation} from '../../../contexts/SettingsContext'

// 고정 크기로 일정한 드롭다운 보장
const DROPDOWN_ITEM_WIDTH = 200
const DROPDOWN_ITEM_HEIGHT = 72  // 각 아이템의 고정 높이
const DROPDOWN_PADDING = 12

const HorizontalNav = () => {
    const theme = useTheme()
    const {mode} = useThemeMode()
    const location = useLocation()
    const navigate = useNavigate()
    const {t} = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const [activeMenu, setActiveMenu] = useState(null)
    const navRef = useRef(null)
    const timeoutRef = useRef(null)

    // 메뉴 정의
    const menuItems = [
        {
            id: 'speaking',
            label: t('sidebar.speaking'),
            icon: SpeakingIcon,
            color: '#059669',
            children: [
                {
                    id: 'opic',
                    label: t('sidebar.opicPractice'),
                    icon: OpicIcon,
                    path: '/opic',
                    desc: t('sidebar.opicDesc')
                },
                {
                    id: 'ai-talk',
                    label: t('sidebar.aiTalk'),
                    icon: AiIcon,
                    path: '/freetalk/ai',
                    desc: t('sidebar.aiTalkDesc')
                },
            ],
        },
        {
            id: 'writing',
            label: t('sidebar.writing'),
            icon: WritingIcon,
            color: '#8b5cf6',
            children: [
                {
                    id: 'chat-people',
                    label: t('sidebar.chatPeople'),
                    icon: PeopleIcon,
                    path: '/freetalk/people',
                    desc: t('sidebar.chatPeopleDesc')
                },
                {
                    id: 'writing-practice',
                    label: t('sidebar.writingPractice'),
                    icon: WriteIcon,
                    path: '/writing',
                    desc: t('sidebar.writingPracticeDesc')
                },
                {
                    id: 'news-learning',
                    label: t('sidebar.newsLearning'),
                    icon: NewsIcon,
                    path: '/news',
                    desc: t('sidebar.newsLearningDesc')
                },
            ],
        },
        {
            id: 'vocab',
            label: t('sidebar.vocab'),
            icon: VocabIcon,
            color: '#f97316',
            children: [
                {
                    id: 'vocab-daily',
                    label: t('sidebar.vocabLearn'),
                    icon: LearnIcon,
                    path: '/vocab',
                    desc: t('sidebar.vocabLearnDesc')
                },
                {
                    id: 'vocab-test',
                    label: t('sidebar.vocabTest'),
                    icon: QuizIcon,
                    path: '/vocab/test',
                    desc: t('sidebar.vocabTestDesc')
                },
                {
                    id: 'vocab-words',
                    label: t('sidebar.vocabWords'),
                    icon: WordListIcon,
                    path: '/vocab/words',
                    desc: t('sidebar.vocabWordsDesc')
                },
                {
                    id: 'vocab-stats',
                    label: t('vocabDash.viewStats'),
                    icon: TrendingIcon,
                    path: '/vocab/stats',
                    desc: t('sidebar.reportsDesc')
                },
            ],
        },
        {
            id: 'games',
            label: t('games.title'),
            icon: GameIcon,
            color: '#06b6d4',
            children: [
                {
                    id: 'catchmind',
                    label: t('games.catchmindTitle'),
                    icon: GameIcon,
                    path: '/games/catchmind',
                    desc: t('games.catchmindDesc')
                },
                {
                    id: 'wordchain',
                    label: t('games.wordchainTitle') || '끝말잇기',
                    icon: GameIcon,
                    path: '/games/wordchain',
                    desc: t('games.wordchainDesc') || '영어 끝말잇기'
                },
            ],
        },
        {
            id: 'dashboard',
            label: t('nav.dashboard'),
            icon: DashboardIcon,
            color: '#f97316',
            path: '/dashboard',
        },
        {
            id: 'reports',
            label: t('nav.reports'),
            icon: ReportIcon,
            color: '#ec4899',
            path: '/reports',
        },
        {
            id: 'settings',
            label: t('nav.settings'),
            icon: SettingsIcon,
            color: mode === 'dark' ? '#a1a1aa' : '#6b7280',
            path: '/settings',
        },
    ]

    // 가장 많은 하위 메뉴 개수 찾기 (일정한 드롭다운 높이를 위해)
    const maxChildren = Math.max(...menuItems.filter(m => m.children).map(m => m.children.length), 0)

    const handleMouseEnter = (menuId) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setActiveMenu(menuId)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveMenu(null)
        }, 150)
    }

    const handleNavigation = (path) => {
        navigate(path)
        setActiveMenu(null)
    }

    const isActive = (path) => location.pathname === path
    const isParentActive = (children) => children?.some((child) => location.pathname.startsWith(child.path))

    // 모바일에서는 숨기기
    if (isMobile) return null

    return (
        <Box
            ref={navRef}
            sx={{
                position: 'fixed',
                top: 64,
                left: 0,
                right: 0,
                zIndex: theme.zIndex.appBar - 1,
                backgroundColor: mode === 'dark' ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid',
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
        >
            {/* 메인 네비게이션 바 */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                    px: 3,
                    py: 1,
                }}
            >
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const hasChildren = item.children && item.children.length > 0
                    const active = item.path ? isActive(item.path) : isParentActive(item.children)
                    const isOpen = activeMenu === item.id && hasChildren

                    return (
                        <Box
                            key={item.id}
                            onMouseEnter={() => handleMouseEnter(item.id)}
                            onMouseLeave={handleMouseLeave}
                            sx={{position: 'relative'}}
                        >
                            {/* 메인 메뉴 버튼 */}
                            <Box
                                onClick={() => !hasChildren && handleNavigation(item.path)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    backgroundColor: active
                                        ? `${item.color}15`
                                        : isOpen
                                            ? (mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                                            : 'transparent',
                                    border: '2px solid',
                                    borderColor: active ? item.color : 'transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: active
                                            ? `${item.color}20`
                                            : mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '8px',
                                        backgroundColor: active ? item.color : `${item.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Icon
                                        sx={{
                                            fontSize: 18,
                                            color: active ? 'white' : item.color,
                                        }}
                                    />
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: active ? 700 : 600,
                                        color: active ? item.color : 'text.primary',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {item.label}
                                </Typography>
                            </Box>

                            {/* 드롭다운 메뉴 */}
                            {hasChildren && (
                                <Fade in={isOpen}>
                                    <Paper
                                        elevation={8}
                                        onMouseEnter={() => handleMouseEnter(item.id)}
                                        onMouseLeave={handleMouseLeave}
                                        sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            mt: 0.5,
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            // 고정 너비로 모든 드롭다운 크기 통일
                                            width: DROPDOWN_ITEM_WIDTH + DROPDOWN_PADDING * 2,
                                            // 최대 하위 메뉴 개수 기준으로 고정 높이 설정
                                            minHeight: maxChildren * DROPDOWN_ITEM_HEIGHT + DROPDOWN_PADDING * 2,
                                            backgroundColor: mode === 'dark' ? '#27272a' : 'white',
                                            boxShadow: mode === 'dark'
                                                ? '0 10px 40px -10px rgba(0,0,0,0.5)'
                                                : '0 10px 40px -10px rgba(0,0,0,0.15)',
                                            display: isOpen ? 'block' : 'none',
                                        }}
                                    >
                                        <Box sx={{p: `${DROPDOWN_PADDING}px`}}>
                                            {item.children.map((child) => {
                                                const ChildIcon = child.icon
                                                const childActive = isActive(child.path)

                                                return (
                                                    <Box
                                                        key={child.id}
                                                        onClick={() => handleNavigation(child.path)}
                                                        sx={{
                                                            // 고정 높이로 아이템 크기 통일
                                                            height: DROPDOWN_ITEM_HEIGHT - 8,
                                                            p: 1.5,
                                                            mb: 1,
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            backgroundColor: childActive
                                                                ? `${item.color}10`
                                                                : 'transparent',
                                                            transition: 'all 0.2s ease',
                                                            '&:hover': {
                                                                backgroundColor: childActive
                                                                    ? `${item.color}15`
                                                                    : mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                                            },
                                                            '&:last-child': {
                                                                mb: 0,
                                                            },
                                                        }}
                                                    >
                                                        <Box display="flex" alignItems="center" gap={1.5} height="100%">
                                                            <Box
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: '10px',
                                                                    backgroundColor: childActive ? item.color : `${item.color}15`,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <ChildIcon
                                                                    sx={{
                                                                        fontSize: 18,
                                                                        color: childActive ? 'white' : item.color,
                                                                    }}
                                                                />
                                                            </Box>
                                                            <Box sx={{
                                                                minWidth: 0,
                                                                flex: 1,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        fontWeight: childActive ? 700 : 600,
                                                                        color: childActive ? item.color : 'text.primary',
                                                                        lineHeight: 1.3,
                                                                        fontSize: 13,
                                                                    }}
                                                                >
                                                                    {child.label}
                                                                </Typography>
                                                                {child.desc && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: 'text.secondary',
                                                                            display: 'block',
                                                                            lineHeight: 1.2,
                                                                            mt: 0.25,
                                                                            fontSize: 11,
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            whiteSpace: 'nowrap',
                                                                        }}
                                                                    >
                                                                        {child.desc}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Paper>
                                </Fade>
                            )}
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}

export default HorizontalNav
