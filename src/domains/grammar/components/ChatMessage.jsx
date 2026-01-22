import {Box, Chip, Collapse, IconButton, keyframes, Typography} from '@mui/material'
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    SmartToy as AiIcon,
} from '@mui/icons-material'
import {useState} from 'react'
import {useSettings} from '../../../contexts/SettingsContext'
import {useThemeMode} from '../../../contexts/ThemeContext'
import {getScoreColor, GRAMMAR_ERROR_BG_COLORS, GRAMMAR_ERROR_COLORS,} from '../constants/grammarConstants'

// 커서 깜빡임 애니메이션
const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`

export default function ChatMessage({
                                        message,
                                        isUser = false,
                                        isStreaming = false,
                                        streamingText = '',
                                    }) {
    const {t, isKorean} = useSettings()
    const {mode} = useThemeMode()
    const isDark = mode === 'dark'
    const [showDetails, setShowDetails] = useState(false)

    const {
        content,
        correctedContent,
        grammarScore,
        errors = [],
        feedback,
        isCorrect,
        aiResponse,
        conversationTip,
    } = message

    const hasErrors = errors && errors.length > 0
    const scoreColor = grammarScore ? getScoreColor(grammarScore) : '#059669'

    // 스트리밍 중일 때 표시할 텍스트
    const displayText = isStreaming ? streamingText : (aiResponse || content)

    if (isUser) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    mb: 2,
                    px: 2,
                }}
            >
                <Box sx={{maxWidth: '75%'}}>
                    {/* User Message Bubble */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: '20px 20px 4px 20px',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px -2px rgba(5, 150, 105, 0.3)',
                        }}
                    >
                        <Typography sx={{fontSize: '1rem', lineHeight: 1.6}}>
                            {content}
                        </Typography>
                    </Box>

                    {/* Grammar Score Badge */}
                    {grammarScore !== undefined && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 1,
                                mt: 1,
                                px: 1,
                            }}
                        >
                            {grammarScore >= 90 ? (
                                <CheckIcon sx={{fontSize: 16, color: '#059669'}}/>
                            ) : (
                                <ErrorIcon sx={{fontSize: 16, color: scoreColor}}/>
                            )}
                            <Typography
                                variant="caption"
                                sx={{color: scoreColor, fontWeight: 600}}
                            >
                                {grammarScore}
                            </Typography>
                            {hasErrors && (
                                <IconButton
                                    size="small"
                                    onClick={() => setShowDetails(!showDetails)}
                                    sx={{p: 0.25}}
                                >
                                    <ExpandMoreIcon
                                        sx={{
                                            fontSize: 18,
                                            transform: showDetails ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.2s',
                                            color: 'text.secondary',
                                        }}
                                    />
                                </IconButton>
                            )}
                        </Box>
                    )}

                    {/* Correction Details */}
                    <Collapse in={showDetails && hasErrors}>
                        <Box
                            sx={{
                                mt: 1,
                                p: 2,
                                borderRadius: '12px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                            }}
                        >
                            {/* Corrected Sentence */}
                            {correctedContent && correctedContent !== content && (
                                <Box sx={{mb: 2}}>
                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        color="#dc2626"
                                        sx={{mb: 0.5, display: 'block'}}
                                    >
                                        {t('grammar.corrected')}
                                    </Typography>
                                    <Typography
                                        sx={{fontSize: '0.95rem', color: '#16a34a', fontWeight: 500}}
                                    >
                                        {correctedContent}
                                    </Typography>
                                </Box>
                            )}

                            {/* Errors */}
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                                {errors.map((error, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '8px',
                                            backgroundColor: GRAMMAR_ERROR_BG_COLORS[error.type] || '#fff',
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Chip
                                                label={t(`grammar.errorTypes.${error.type}`)}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.7rem',
                                                    backgroundColor: GRAMMAR_ERROR_COLORS[error.type],
                                                    color: '#fff',
                                                }}
                                            />
                                            <Typography variant="caption">
                        <span style={{textDecoration: 'line-through', color: '#ef4444'}}>
                          {error.original}
                        </span>
                                                {' → '}
                                                <span style={{color: '#16a34a', fontWeight: 600}}>
                          {error.corrected}
                        </span>
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {error.explanation}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* Feedback */}
                            {feedback && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 1.5,
                                        borderRadius: '8px',
                                        backgroundColor: '#fef3c7',
                                        border: '1px solid #fcd34d',
                                    }}
                                >
                                    <Typography variant="caption" sx={{color: '#92400e', lineHeight: 1.5}}>
                                        💡 {feedback}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </Box>

                {/* User Avatar */}
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#3f3f46' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ml: 1.5,
                        flexShrink: 0,
                    }}
                >
                    <PersonIcon sx={{fontSize: 20, color: isDark ? '#a1a1aa' : '#6b7280'}}/>
                </Box>
            </Box>
        )
    }

    // AI Message
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                mb: 2,
                px: 2,
            }}
        >
            {/* AI Avatar */}
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    flexShrink: 0,
                    boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.3)',
                }}
            >
                <AiIcon sx={{fontSize: 20, color: 'white'}}/>
            </Box>

            <Box sx={{maxWidth: '75%'}}>
                {/* AI Message Bubble */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: '20px 20px 20px 4px',
                        backgroundColor: isDark ? '#3f3f46' : '#f3f4f6',
                        border: `1px solid ${isDark ? '#52525b' : '#e5e7eb'}`,
                        minHeight: isStreaming ? 48 : 'auto',
                    }}
                >
                    <Typography
                        component="div"
                        sx={{fontSize: '1rem', lineHeight: 1.6, color: isDark ? '#fafafa' : '#374151'}}
                    >
                        {displayText}
                        {/* 스트리밍 커서 */}
                        {isStreaming && (
                            <Box
                                component="span"
                                sx={{
                                    display: 'inline-block',
                                    width: 2,
                                    height: '1.2em',
                                    backgroundColor: '#3b82f6',
                                    ml: 0.5,
                                    verticalAlign: 'text-bottom',
                                    animation: `${blink} 1s infinite`,
                                }}
                            />
                        )}
                    </Typography>
                </Box>

                {/* Conversation Tip - 스트리밍 완료 후에만 표시 */}
                {!isStreaming && conversationTip && (
                    <Box
                        sx={{
                            mt: 1.5,
                            p: 1.5,
                            borderRadius: '10px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef3c7',
                        }}
                    >
                        <Typography variant="caption" sx={{color: '#92400e', lineHeight: 1.5}}>
                            💡 {conversationTip}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    )
}
