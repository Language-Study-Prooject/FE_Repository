import {useState} from 'react'
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import {School as SchoolIcon, Spellcheck as SpellcheckIcon,} from '@mui/icons-material'
import {useSettings} from '../../../contexts/SettingsContext'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {
    GRAMMAR_LEVEL_BG_COLORS,
    GRAMMAR_LEVEL_COLORS,
    GRAMMAR_LEVELS,
    TEXT_LIMITS,
} from '../constants/grammarConstants'

export default function GrammarInput({onCheck, loading = false}) {
    const {t, isKorean} = useSettings()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
    const [sentence, setSentence] = useState('')
    const [level, setLevel] = useState(GRAMMAR_LEVELS.BEGINNER)
    const [error, setError] = useState('')

    const handleSentenceChange = (e) => {
        const value = e.target.value
        setSentence(value)

        if (value.length > TEXT_LIMITS.MAX_SENTENCE_LENGTH) {
            setError(t('grammar.maxLength'))
        } else {
            setError('')
        }
    }

    const handleLevelChange = (_, newLevel) => {
        if (newLevel) {
            setLevel(newLevel)
        }
    }

    const handleCheck = () => {
        if (sentence.trim().length < TEXT_LIMITS.MIN_SENTENCE_LENGTH) {
            setError(t('grammar.minLength'))
            return
        }

        if (sentence.length > TEXT_LIMITS.MAX_SENTENCE_LENGTH) {
            setError(t('grammar.maxLength'))
            return
        }

        setError('')
        onCheck?.(sentence.trim(), level)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
            e.preventDefault()
            handleCheck()
        }
    }

    const charCount = sentence.length
    const isOverLimit = charCount > TEXT_LIMITS.MAX_SENTENCE_LENGTH
    const canSubmit =
        sentence.trim().length >= TEXT_LIMITS.MIN_SENTENCE_LENGTH &&
        !isOverLimit &&
        !loading

    const levelOptions = [
        {
            value: GRAMMAR_LEVELS.BEGINNER,
            label: t('grammar.beginner'),
            desc: t('grammar.beginnerDesc'),
        },
        {
            value: GRAMMAR_LEVELS.INTERMEDIATE,
            label: t('grammar.intermediate'),
            desc: t('grammar.intermediateDesc'),
        },
        {
            value: GRAMMAR_LEVELS.ADVANCED,
            label: t('grammar.advanced'),
            desc: t('grammar.advancedDesc'),
        },
    ]

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            }}
        >
            {/* Level Selection */}
            <Box sx={{mb: 3}}>
                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <SchoolIcon sx={{fontSize: 20, color: 'text.secondary'}}/>
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        {t('grammar.selectLevel')}
                    </Typography>
                </Box>
                <ToggleButtonGroup
                    value={level}
                    exclusive
                    onChange={handleLevelChange}
                    aria-label="learning level"
                    sx={{
                        display: 'flex',
                        gap: 1.5,
                        '& .MuiToggleButtonGroup-grouped': {
                            border: '2px solid',
                            borderRadius: '14px !important',
                            px: 2.5,
                            py: 1.5,
                            flex: 1,
                            '&:not(:first-of-type)': {
                                borderLeft: '2px solid',
                                marginLeft: 0,
                            },
                        },
                    }}
                >
                    {levelOptions.map((option) => (
                        <ToggleButton
                            key={option.value}
                            value={option.value}
                            sx={{
                                borderColor:
                                    level === option.value
                                        ? GRAMMAR_LEVEL_COLORS[option.value]
                                        : 'divider',
                                backgroundColor:
                                    level === option.value
                                        ? GRAMMAR_LEVEL_BG_COLORS[option.value]
                                        : 'transparent',
                                '&:hover': {
                                    borderColor: GRAMMAR_LEVEL_COLORS[option.value],
                                    backgroundColor: GRAMMAR_LEVEL_BG_COLORS[option.value],
                                },
                                '&.Mui-selected': {
                                    borderColor: GRAMMAR_LEVEL_COLORS[option.value],
                                    backgroundColor: GRAMMAR_LEVEL_BG_COLORS[option.value],
                                    '&:hover': {
                                        backgroundColor: GRAMMAR_LEVEL_BG_COLORS[option.value],
                                    },
                                },
                            }}
                        >
                            <Box sx={{textAlign: 'center'}}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    sx={{
                                        color:
                                            level === option.value
                                                ? GRAMMAR_LEVEL_COLORS[option.value]
                                                : 'text.primary',
                                        textTransform: 'none',
                                    }}
                                >
                                    {option.label}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color:
                                            level === option.value
                                                ? GRAMMAR_LEVEL_COLORS[option.value]
                                                : 'text.secondary',
                                        display: {xs: 'none', sm: 'block'},
                                        textTransform: 'none',
                                        opacity: 0.8,
                                    }}
                                >
                                    {option.desc}
                                </Typography>
                            </Box>
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>

            {/* Text Input */}
            <Box sx={{mb: 2}}>
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    maxRows={8}
                    value={sentence}
                    onChange={handleSentenceChange}
                    onKeyDown={handleKeyDown}
                    placeholder={t('grammar.inputPlaceholder')}
                    disabled={loading}
                    error={!!error}
                    helperText={error}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            lineHeight: 1.7,
                            fontFamily: '"DM Sans", sans-serif',
                            backgroundColor: isDark ? '#27272a' : '#fff',
                            '&:hover fieldset': {
                                borderColor: GRAMMAR_LEVEL_COLORS[level],
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: GRAMMAR_LEVEL_COLORS[level],
                                borderWidth: 2,
                            },
                        },
                        '& .MuiInputBase-input': {
                            '&::placeholder': {
                                color: isDark ? '#a1a1aa' : '#9ca3af',
                                opacity: 1,
                            },
                        },
                    }}
                />

                {/* Character Count */}
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    mt={0.5}
                    px={1}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: isOverLimit ? '#ef4444' : (isDark ? '#a1a1aa' : '#9ca3af'),
                            fontWeight: isOverLimit ? 600 : 400,
                        }}
                    >
                        {charCount} / {TEXT_LIMITS.MAX_SENTENCE_LENGTH}
                    </Typography>
                </Box>
            </Box>

            {/* Submit Button */}
            <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleCheck}
                disabled={!canSubmit}
                startIcon={
                    loading ? (
                        <CircularProgress size={20} color="inherit"/>
                    ) : (
                        <SpellcheckIcon/>
                    )
                }
                sx={{
                    py: 1.75,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${GRAMMAR_LEVEL_COLORS[level]} 0%, ${GRAMMAR_LEVEL_COLORS[level]}dd 100%)`,
                    boxShadow: `0 8px 24px -4px ${GRAMMAR_LEVEL_COLORS[level]}40`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${GRAMMAR_LEVEL_COLORS[level]}ee 0%, ${GRAMMAR_LEVEL_COLORS[level]} 100%)`,
                        boxShadow: `0 12px 28px -4px ${GRAMMAR_LEVEL_COLORS[level]}50`,
                    },
                    '&:disabled': {
                        background: isDark ? '#3f3f46' : '#e5e7eb',
                        color: isDark ? '#a1a1aa' : '#9ca3af',
                        boxShadow: 'none',
                    },
                }}
            >
                {loading ? t('grammar.checking') : t('grammar.checkButton')}
            </Button>
        </Paper>
    )
}
