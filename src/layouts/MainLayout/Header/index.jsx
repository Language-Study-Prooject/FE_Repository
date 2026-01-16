import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Chip,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material'
import {
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Translate as TranslateIcon,
} from '@mui/icons-material'
import { useThemeMode } from '../../../contexts/ThemeContext'
import { useSettings, useTranslation } from '../../../contexts/SettingsContext'
import { LANGUAGE_LABELS, LANGUAGES } from '../../../i18n/translations'
import { useAuth } from '../../../contexts/AuthContext'

const Header = ({ onMenuClick, sidebarOpen }) => {
    const theme = useTheme()
    const navigate = useNavigate()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const { mode, toggleTheme } = useThemeMode()
    const { setLanguage, language } = useSettings()
    const { t } = useTranslation()

    const [anchorEl, setAnchorEl] = useState(null)
    const [notificationAnchor, setNotificationAnchor] = useState(null)
    const [langAnchor, setLangAnchor] = useState(null)
    const { logout } = useAuth()

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

    const handleLangOpen = (event) => {
        setLangAnchor(event.currentTarget)
    }

    const handleLangClose = () => {
        setLangAnchor(null)
    }

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        handleLangClose()
    }

    const handleLogout = async () => {
        handleProfileMenuClose()
        await logout()        // Cognito 로그아웃 (토큰 삭제)
        navigate('/login')
    }

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                background: mode === 'dark'
                    ? 'rgba(30, 30, 30, 0.85)'
                    : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid',
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
        >
            <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
                {/* Hamburger menu (mobile) */}
                {isMobile && (
                    <IconButton
                        edge="start"
                        onClick={onMenuClick}
                        sx={{
                            mr: 1.5,
                            color: 'text.primary',
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                {/* Logo */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: 1.5,
                    }}
                    onClick={() => navigate('/')}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px -2px rgba(5, 150, 105, 0.4)',
                        }}
                    >
                        <Typography
                            sx={{
                                color: 'white',
                                fontWeight: 800,
                                fontSize: 20,
                                fontFamily: '"Outfit", sans-serif',
                            }}
                        >
                            L
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '-0.5px',
                                color: 'text.primary',
                                fontFamily: '"Outfit", sans-serif',
                                lineHeight: 1.2,
                            }}
                        >
                            {t('header.appName')}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Right side icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Language selector */}
                    <IconButton
                        onClick={handleLangOpen}
                        sx={{
                            color: 'text.secondary',
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        <TranslateIcon fontSize="small" />
                    </IconButton>

                    {/* Dark mode toggle */}
                    <IconButton
                        onClick={toggleTheme}
                        title={mode === 'dark' ? t('header.lightMode') : t('header.darkMode')}
                        sx={{
                            color: 'text.secondary',
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                    </IconButton>

                    {/* Notifications */}
                    <IconButton
                        onClick={handleNotificationOpen}
                        sx={{
                            color: 'text.secondary',
                            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            '&:hover': {
                                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        <Badge
                            badgeContent={3}
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: 10,
                                    minWidth: 18,
                                    height: 18,
                                },
                            }}
                        >
                            <NotificationsIcon fontSize="small" />
                        </Badge>
                    </IconButton>

                    {/* Profile */}
                    <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{ ml: 0.5 }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                                fontWeight: 700,
                                fontSize: 14,
                            }}
                        >
                            U
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Language Menu */}
                <Menu
                    anchorEl={langAnchor}
                    open={Boolean(langAnchor)}
                    onClose={handleLangClose}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                            minWidth: 160,
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                            {t('settings.language')}
                        </Typography>
                    </Box>
                    <Divider />
                    {Object.entries(LANGUAGES).map(([key, value]) => (
                        <MenuItem
                            key={value}
                            onClick={() => handleLanguageChange(value)}
                            selected={language === value}
                            sx={{
                                py: 1.5,
                                px: 2,
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(5, 150, 105, 0.08)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(5, 150, 105, 0.12)',
                                    },
                                },
                            }}
                        >
                            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                <Typography variant="body2" fontWeight={language === value ? 600 : 400}>
                                    {LANGUAGE_LABELS[value]}
                                </Typography>
                                {language === value && (
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            backgroundColor: '#059669',
                                        }}
                                    />
                                )}
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>

                {/* Notification Menu */}
                <Menu
                    anchorEl={notificationAnchor}
                    open={Boolean(notificationAnchor)}
                    onClose={handleNotificationClose}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            width: 340,
                            maxHeight: 420,
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {t('nav.notifications')}
                        </Typography>
                        <Chip
                            label="3"
                            size="small"
                            sx={{
                                height: 22,
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: 11,
                            }}
                        />
                    </Box>
                    <Divider />
                    {[
                        {
                            text: language === 'ko' ? '면접 연습 세션이 완료되었습니다.' : 'Interview session completed.',
                            time: language === 'ko' ? '10분 전' : '10 min ago'
                        },
                        {
                            text: language === 'ko' ? 'OPIC 모의고사 결과가 도착했습니다.' : 'OPIC test results arrived.',
                            time: language === 'ko' ? '1시간 전' : '1 hour ago'
                        },
                        {
                            text: language === 'ko' ? '새로운 학습 리포트가 생성되었습니다.' : 'New learning report generated.',
                            time: language === 'ko' ? '어제' : 'Yesterday'
                        },
                    ].map((item, index) => (
                        <MenuItem
                            key={index}
                            onClick={handleNotificationClose}
                            sx={{
                                py: 2,
                                px: 2.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(5, 150, 105, 0.04)',
                                },
                            }}
                        >
                            <Box>
                                <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                                    {item.text}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {item.time}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>

                {/* Profile Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            width: 220,
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {t('header.user')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            user@example.com
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem
                        onClick={() => {
                            handleProfileMenuClose();
                            navigate('/profile');
                        }}
                        sx={{ py: 1.5, px: 2.5 }}
                    >
                        <PersonIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">{t('nav.profile')}</Typography>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleProfileMenuClose();
                            navigate('/settings');
                        }}
                        sx={{ py: 1.5, px: 2.5 }}
                    >
                        <SettingsIcon sx={{ mr: 1.5, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">{t('nav.settings')}</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                        onClick={handleLogout}
                        sx={{ py: 1.5, px: 2.5, color: 'error.main' }}
                    >
                        <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2">{t('nav.logout')}</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}

export default Header
