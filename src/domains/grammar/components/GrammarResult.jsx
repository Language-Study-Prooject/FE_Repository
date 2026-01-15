import {Box, Chip, Collapse, Divider, IconButton, Paper, Typography} from '@mui/material'
import {
    ArrowForward as ArrowForwardIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    ExpandMore as ExpandMoreIcon,
    Lightbulb as LightbulbIcon,
} from '@mui/icons-material'
import {useState} from 'react'
import {useSettings} from '../../../contexts/SettingsContext'
import {
    getScoreColor,
    getScoreGrade,
    GRAMMAR_ERROR_BG_COLORS,
    GRAMMAR_ERROR_COLORS,
} from '../constants/grammarConstants'

export default function GrammarResult({result}) {
    const {t, isKorean} = useSettings()
    const [expandedError, setExpandedError] = useState(null)

    if (!result) return null

    const {
        originalSentence,
        correctedSentence,
        score,
        isCorrect,
        errors = [],
        feedback,
    } = result

    const scoreGrade = getScoreGrade(score)
    const scoreColor = getScoreColor(score)

    const toggleError = (index) => {
        setExpandedError(expandedError === index ? null : index)
    }

    // 문장에서 오류 부분을 하이라이트하는 함수
    const renderHighlightedSentence = (sentence, sentenceErrors, isCorrected = false) => {
        if (!sentenceErrors || sentenceErrors.length === 0) {
            return <Typography sx={{fontSize: '1.1rem', lineHeight: 1.8}}>{sentence}</Typography>
        }

        // 오류를 시작 인덱스 기준으로 정렬
        const sortedErrors = [...sentenceErrors].sort((a, b) => a.startIndex - b.startIndex)
        const parts = []
        let lastIndex = 0

        sortedErrors.forEach((error, idx) => {
            // 오류 이전 텍스트
            if (error.startIndex > lastIndex) {
                parts.push(
                    <span key={`text-${idx}`}>
            {sentence.slice(lastIndex, error.startIndex)}
          </span>
                )
            }

            // 오류 부분 하이라이트
            const highlightText = isCorrected ? error.corrected : error.original
            parts.push(
                <Box
                    key={`error-${idx}`}
                    component="span"
                    sx={{
                        backgroundColor: isCorrected
                            ? '#dcfce7'
                            : GRAMMAR_ERROR_BG_COLORS[error.type] || '#fef2f2',
                        color: isCorrected
                            ? '#16a34a'
                            : GRAMMAR_ERROR_COLORS[error.type] || '#ef4444',
                        borderRadius: '4px',
                        px: 0.5,
                        py: 0.25,
                        fontWeight: 600,
                        textDecoration: isCorrected ? 'none' : 'line-through',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            filter: 'brightness(0.95)',
                        },
                    }}
                >
                    {highlightText}
                </Box>
            )

            lastIndex = error.endIndex
        })

        // 마지막 오류 이후 텍스트
        if (lastIndex < sentence.length) {
            parts.push(
                <span key="text-end">{sentence.slice(lastIndex)}</span>
            )
        }

        return (
            <Typography sx={{fontSize: '1.1rem', lineHeight: 1.8}}>
                {parts}
            </Typography>
        )
    }

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
            }}
        >
            {/* Score Header */}
            <Box
                sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${scoreColor}15 0%, ${scoreColor}08 100%)`,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                        {isCorrect ? (
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    backgroundColor: '#dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CheckCircleIcon sx={{fontSize: 32, color: '#16a34a'}}/>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px',
                                    backgroundColor: `${scoreColor}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ErrorIcon sx={{fontSize: 32, color: scoreColor}}/>
                            </Box>
                        )}
                        <Box>
                            <Typography variant="h5" fontWeight={800} color={scoreColor}>
                                {isCorrect
                                    ? t('grammar.perfect')
                                    : isKorean
                                        ? scoreGrade.labelKo
                                        : scoreGrade.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isCorrect
                                    ? t('grammar.noProblem')
                                    : `${errors.length} ${t('grammar.errorCount')}`}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Score Circle */}
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            border: `4px solid ${scoreColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#fff',
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={800}
                            color={scoreColor}
                            sx={{lineHeight: 1}}
                        >
                            {score}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {t('grammar.score')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Original vs Corrected */}
            <Box sx={{p: 3}}>
                {/* Original Sentence */}
                <Box sx={{mb: 3}}>
                    <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="text.secondary"
                        sx={{mb: 1}}
                    >
                        {t('grammar.original')}
                    </Typography>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: isCorrect ? '#f0fdf4' : '#fef2f2',
                            border: '1px solid',
                            borderColor: isCorrect ? '#bbf7d0' : '#fecaca',
                        }}
                    >
                        {renderHighlightedSentence(originalSentence, errors, false)}
                    </Box>
                </Box>

                {/* Arrow */}
                {!isCorrect && (
                    <Box display="flex" justifyContent="center" sx={{mb: 3}}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ArrowForwardIcon
                                sx={{fontSize: 20, color: '#6b7280', transform: 'rotate(90deg)'}}
                            />
                        </Box>
                    </Box>
                )}

                {/* Corrected Sentence */}
                {!isCorrect && (
                    <Box sx={{mb: 3}}>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="text.secondary"
                            sx={{mb: 1}}
                        >
                            {t('grammar.corrected')}
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: '12px',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid',
                                borderColor: '#bbf7d0',
                            }}
                        >
                            <Typography sx={{fontSize: '1.1rem', lineHeight: 1.8, color: '#16a34a'}}>
                                {correctedSentence}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Errors List */}
                {errors.length > 0 && (
                    <>
                        <Divider sx={{my: 3}}/>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            color="text.secondary"
                            sx={{mb: 2}}
                        >
                            {t('grammar.errors')}
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
                            {errors.map((error, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        borderRadius: '14px',
                                        border: '1px solid',
                                        borderColor: expandedError === index
                                            ? GRAMMAR_ERROR_COLORS[error.type]
                                            : 'divider',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Box
                                        onClick={() => toggleError(index)}
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            backgroundColor: expandedError === index
                                                ? GRAMMAR_ERROR_BG_COLORS[error.type]
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: GRAMMAR_ERROR_BG_COLORS[error.type],
                                            },
                                        }}
                                    >
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Chip
                                                label={t(`grammar.errorTypes.${error.type}`)}
                                                size="small"
                                                sx={{
                                                    backgroundColor: GRAMMAR_ERROR_COLORS[error.type],
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                }}
                                            />
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: '#ef4444',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {error.original}
                                                </Typography>
                                                <ArrowForwardIcon sx={{fontSize: 16, color: '#9ca3af'}}/>
                                                <Typography sx={{color: '#16a34a', fontWeight: 600}}>
                                                    {error.corrected}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton size="small">
                                            <ExpandMoreIcon
                                                sx={{
                                                    transform: expandedError === index ? 'rotate(180deg)' : 'none',
                                                    transition: 'transform 0.2s ease',
                                                }}
                                            />
                                        </IconButton>
                                    </Box>
                                    <Collapse in={expandedError === index}>
                                        <Box
                                            sx={{
                                                px: 2,
                                                pb: 2,
                                                pt: 1,
                                                backgroundColor: GRAMMAR_ERROR_BG_COLORS[error.type],
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {error.explanation}
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </Box>
                            ))}
                        </Box>
                    </>
                )}

                {/* Feedback */}
                {feedback && (
                    <>
                        <Divider sx={{my: 3}}/>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: '14px',
                                backgroundColor: '#fffbeb',
                                border: '1px solid #fef3c7',
                            }}
                        >
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                                <LightbulbIcon sx={{color: '#f59e0b', mt: 0.25}}/>
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={600}
                                        color="#b45309"
                                        sx={{mb: 0.5}}
                                    >
                                        {t('grammar.feedback')}
                                    </Typography>
                                    <Typography variant="body2" color="#92400e">
                                        {feedback}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Paper>
    )
}
