import {useEffect, useState} from 'react'
import {Outlet} from 'react-router-dom'
import {Box, useMediaQuery, useTheme} from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'
import HorizontalNav from './HorizontalNav'
import Footer from './Footer'

const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 76

// 가로 네비게이션 사용 여부 (true: 가로 네비게이션, false: 사이드바)
const USE_HORIZONTAL_NAV = true

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

    // 가로 네비게이션 사용 시 사이드바 너비는 0
    const drawerWidth = USE_HORIZONTAL_NAV
        ? 0
        : (isMobile ? 0 : (collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH))

    // 헤더 + 가로 네비게이션 높이 (64 + 56)
    const topOffset = USE_HORIZONTAL_NAV && !isMobile ? 120 : 64

    return (
        <Box sx={{display: 'flex', minHeight: '100vh'}}>
            {/* Header */}
            <Header
                onMenuClick={handleMobileToggle}
                sidebarOpen={mobileOpen}
            />

            {/* 가로 네비게이션 (데스크톱) */}
            {USE_HORIZONTAL_NAV && <HorizontalNav/>}

            {/* 사이드바 (모바일에서만 사용하거나 USE_HORIZONTAL_NAV가 false일 때) */}
            {(!USE_HORIZONTAL_NAV || isMobile) && (
                <Sidebar
                    open={mobileOpen}
                    collapsed={collapsed}
                    onToggleCollapse={handleCollapseToggle}
                    onClose={handleMobileClose}
                />
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    ml: {xs: 0, md: `${drawerWidth}px`},
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                {/* 상단 여백 (헤더 + 가로 네비게이션) */}
                <Box sx={{height: topOffset}}/>

                {/* 콘텐츠 영역 */}
                <Box
                    sx={{
                        flex: 1,
                        p: 3,
                        backgroundColor: 'background.default',
                    }}
                >
                    <Outlet/>
                </Box>

                {/* Footer */}
                <Footer/>
            </Box>
        </Box>
    )
}

export default MainLayout
