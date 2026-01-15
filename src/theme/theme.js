import {createTheme} from '@mui/material/styles'

// ============================================
// Design Tokens - Consistent across the app
// ============================================

export const DESIGN_TOKENS = {
    // Level Colors (for vocabulary levels)
    level: {
        beginner: {
            bg: '#ecfdf5',
            bgDark: '#064e3b',
            text: '#059669',
            textDark: '#34d399',
            label: '초급',
        },
        intermediate: {
            bg: '#fff7ed',
            bgDark: '#431407',
            text: '#f97316',
            textDark: '#fb923c',
            label: '중급',
        },
        advanced: {
            bg: '#fef2f2',
            bgDark: '#450a0a',
            text: '#ef4444',
            textDark: '#f87171',
            label: '고급',
        },
    },
    // Chat Colors
    chat: {
        background: {
            light: '#e8f4f8',
            dark: '#1e293b',
        },
        ownMessage: {
            light: '#fef08a', // Yellow 200
            dark: '#facc15', // Yellow 400
        },
        otherMessage: {
            light: '#ffffff',
            dark: '#374151',
        },
    },
    // Spacing
    spacing: {
        pageBottom: 6,
        cardPadding: 3,
        sectionGap: 4,
    },
    // Border Radius Scale
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
    },
    // Icon Sizes
    iconSize: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 28,
        xl: 32,
    },
    // Gradients
    gradients: {
        primary: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        primaryDark: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        warning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        warningDark: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
    },
}

// Helper function to get level styles
export const getLevelStyles = (level, isDark = false) => {
    const levelKey = level?.toLowerCase() || 'beginner'
    const levelConfig = DESIGN_TOKENS.level[levelKey] || DESIGN_TOKENS.level.beginner
    return {
        backgroundColor: isDark ? levelConfig.bgDark : levelConfig.bg,
        color: isDark ? levelConfig.textDark : levelConfig.text,
    }
}

// Helper function to get chat styles
export const getChatStyles = (isOwn, isDark = false) => {
    if (isOwn) {
        return {
            backgroundColor: isDark
                ? DESIGN_TOKENS.chat.ownMessage.dark
                : DESIGN_TOKENS.chat.ownMessage.light,
        }
    }
    return {
        backgroundColor: isDark
            ? DESIGN_TOKENS.chat.otherMessage.dark
            : DESIGN_TOKENS.chat.otherMessage.light,
    }
}

// Fresh Editorial Design System - MUI Theme Integration
const baseTheme = {
    typography: {
        fontFamily: '"DM Sans", "Noto Sans KR", system-ui, sans-serif',
        h1: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 600,
        },
        h5: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 600,
        },
        h6: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 600,
        },
        subtitle1: {
            fontWeight: 500,
        },
        subtitle2: {
            fontWeight: 600,
        },
        body1: {
            lineHeight: 1.6,
        },
        body2: {
            lineHeight: 1.5,
        },
        button: {
            fontFamily: '"Outfit", "Noto Sans KR", system-ui, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                    padding: '10px 20px',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    },
                },
                sizeLarge: {
                    padding: '14px 28px',
                    fontSize: '1rem',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
                elevation1: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
                elevation3: {
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                    borderRadius: 8,
                },
                sizeSmall: {
                    height: 24,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                },
                bar: {
                    borderRadius: 8,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'scale(1.1)',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 8,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                    },
                },
            },
        },
    },
}

// Light Theme - Fresh Emerald
export const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: '#059669',      // Emerald 600
            light: '#34d399',     // Emerald 400
            dark: '#047857',      // Emerald 700
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f97316',      // Orange 500
            light: '#fb923c',     // Orange 400
            dark: '#ea580c',      // Orange 600
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981',      // Emerald 500
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#f59e0b',      // Amber 500
            light: '#fbbf24',
            dark: '#d97706',
            contrastText: '#1c1917',
        },
        error: {
            main: '#ef4444',      // Red 500
            light: '#f87171',
            dark: '#dc2626',
            contrastText: '#ffffff',
        },
        info: {
            main: '#3b82f6',      // Blue 500
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
        },
        background: {
            default: '#fafaf9',   // Stone 50
            paper: '#ffffff',
        },
        text: {
            primary: '#1c1917',   // Stone 900
            secondary: '#57534e', // Stone 600
            disabled: '#a8a29e',  // Stone 400
        },
        divider: '#e7e5e4',     // Stone 200
        action: {
            hover: 'rgba(5, 150, 105, 0.04)',
            selected: 'rgba(5, 150, 105, 0.08)',
            focus: 'rgba(5, 150, 105, 0.12)',
        },
    },
})

// Dark Theme
export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#34d399',      // Emerald 400
            light: '#6ee7b7',     // Emerald 300
            dark: '#10b981',      // Emerald 500
            contrastText: '#064e3b',
        },
        secondary: {
            main: '#fb923c',      // Orange 400
            light: '#fdba74',     // Orange 300
            dark: '#f97316',      // Orange 500
            contrastText: '#1c1917',
        },
        success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#10b981',
            contrastText: '#064e3b',
        },
        warning: {
            main: '#fbbf24',
            light: '#fcd34d',
            dark: '#f59e0b',
            contrastText: '#1c1917',
        },
        error: {
            main: '#f87171',
            light: '#fca5a5',
            dark: '#ef4444',
            contrastText: '#1c1917',
        },
        info: {
            main: '#60a5fa',
            light: '#93c5fd',
            dark: '#3b82f6',
            contrastText: '#1c1917',
        },
        background: {
            default: '#0c0a09',   // Stone 950
            paper: '#1c1917',     // Stone 900
        },
        text: {
            primary: '#fafaf9',   // Stone 50
            secondary: '#a8a29e', // Stone 400
            disabled: '#78716c',  // Stone 500
        },
        divider: '#292524',     // Stone 800
        action: {
            hover: 'rgba(52, 211, 153, 0.08)',
            selected: 'rgba(52, 211, 153, 0.16)',
            focus: 'rgba(52, 211, 153, 0.24)',
        },
    },
})

export default lightTheme
