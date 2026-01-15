import {useState} from 'react'
import {Box, CircularProgress, FormControl, IconButton, MenuItem, Select, TextField, Tooltip,} from '@mui/material'
import {School as SchoolIcon, Send as SendIcon} from '@mui/icons-material'
import {useSettings} from '../../../contexts/SettingsContext'
import {GRAMMAR_LEVEL_COLORS, GRAMMAR_LEVELS, TEXT_LIMITS,} from '../constants/grammarConstants'

export default function ChatInput({onSend, loading = false, level, onLevelChange}) {
    const {t, isKorean} = useSettings()
    const [message, setMessage] = useState('')

    const handleSend = () => {
        if (message.trim().length < TEXT_LIMITS.MIN_SENTENCE_LENGTH || loading) return
        onSend?.(message.trim())
        setMessage('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const canSend = message.trim().length >= TEXT_LIMITS.MIN_SENTENCE_LENGTH && !loading

    const levelOptions = [
        {value: GRAMMAR_LEVELS.BEGINNER, label: isKorean ? '초급' : 'Beginner'},
        {value: GRAMMAR_LEVELS.INTERMEDIATE, label: isKorean ? '중급' : 'Intermediate'},
        {value: GRAMMAR_LEVELS.ADVANCED, label: isKorean ? '고급' : 'Advanced'},
    ]

    return (
        <Box
            sx={{
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#fff',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 1.5,
                    maxWidth: 900,
                    mx: 'auto',
                }}
            >
                {/* Level Selector */}
                <Tooltip title={isKorean ? '학습 레벨' : 'Learning Level'}>
                    <FormControl size="small" sx={{minWidth: 100}}>
                        <Select
                            value={level}
                            onChange={(e) => onLevelChange?.(e.target.value)}
                            displayEmpty
                            sx={{
                                borderRadius: '12px',
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    py: 1,
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: GRAMMAR_LEVEL_COLORS[level],
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: GRAMMAR_LEVEL_COLORS[level],
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: GRAMMAR_LEVEL_COLORS[level],
                                },
                            }}
                            renderValue={(value) => (
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <SchoolIcon
                                        sx={{fontSize: 18, color: GRAMMAR_LEVEL_COLORS[value]}}
                                    />
                                    <span style={{color: GRAMMAR_LEVEL_COLORS[value], fontWeight: 600}}>
                    {levelOptions.find((o) => o.value === value)?.label}
                  </span>
                                </Box>
                            )}
                        >
                            {levelOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <SchoolIcon
                                            sx={{fontSize: 18, color: GRAMMAR_LEVEL_COLORS[option.value]}}
                                        />
                                        <span style={{color: GRAMMAR_LEVEL_COLORS[option.value]}}>
                      {option.label}
                    </span>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Tooltip>

                {/* Text Input */}
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isKorean
                            ? '영어 문장을 입력하세요...'
                            : 'Type your English sentence...'
                    }
                    disabled={loading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: '#f9fafb',
                            '&:hover': {
                                backgroundColor: '#f3f4f6',
                            },
                            '&.Mui-focused': {
                                backgroundColor: '#fff',
                            },
                            '& fieldset': {
                                borderColor: '#e5e7eb',
                            },
                            '&:hover fieldset': {
                                borderColor: '#d1d5db',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: GRAMMAR_LEVEL_COLORS[level],
                            },
                        },
                        '& .MuiInputBase-input': {
                            py: 1.5,
                            px: 2,
                            '&::placeholder': {
                                color: '#9ca3af',
                                opacity: 1,
                            },
                        },
                    }}
                />

                {/* Send Button */}
                <IconButton
                    onClick={handleSend}
                    disabled={!canSend}
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        backgroundColor: canSend ? GRAMMAR_LEVEL_COLORS[level] : '#e5e7eb',
                        color: '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: canSend ? GRAMMAR_LEVEL_COLORS[level] : '#e5e7eb',
                            filter: canSend ? 'brightness(0.9)' : 'none',
                        },
                        '&:disabled': {
                            color: '#9ca3af',
                        },
                    }}
                >
                    {loading ? (
                        <CircularProgress size={22} sx={{color: '#fff'}}/>
                    ) : (
                        <SendIcon sx={{fontSize: 22}}/>
                    )}
                </IconButton>
            </Box>

            {/* Character count hint */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mt: 0.5,
                    pr: 8,
                }}
            >
                <Box
                    component="span"
                    sx={{
                        fontSize: '0.7rem',
                        color:
                            message.length > TEXT_LIMITS.MAX_SENTENCE_LENGTH
                                ? '#ef4444'
                                : '#9ca3af',
                    }}
                >
                    {message.length > 0 && `${message.length}/${TEXT_LIMITS.MAX_SENTENCE_LENGTH}`}
                </Box>
            </Box>
        </Box>
    )
}
