import {Box, Chip, IconButton, Typography} from '@mui/material'
import {TouchApp as TapIcon, VolumeUp as VolumeIcon} from '@mui/icons-material'
import {CATEGORY_LABELS, LEVEL_LABELS} from '../constants/vocabConstants'

export default function FlashCard({word, isFlipped, onFlip, onPlayTTS, isPlayingTTS}) {
    if (!word) return null

    const getLevelStyle = (level) => {
        switch (level) {
            case 'BEGINNER':
                return {bg: '#ecfdf5', color: '#059669'}
            case 'INTERMEDIATE':
                return {bg: '#fff7ed', color: '#f97316'}
            case 'ADVANCED':
                return {bg: '#fef2f2', color: '#ef4444'}
            default:
                return {bg: '#f5f5f4', color: '#57534e'}
        }
    }

    const levelStyle = getLevelStyle(word.level)

    return (
        <Box
            onClick={onFlip}
            sx={{
                perspective: '1200px',
                width: '100%',
                maxWidth: 380,
                height: 320,
                cursor: 'pointer',
                mx: 'auto',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front - English */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(180deg, #ffffff 0%, #fafaf9 100%)',
                        borderRadius: '24px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03)',
                        p: 4,
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative corner */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 100,
                            height: 100,
                            background: `linear-gradient(135deg, ${levelStyle.bg} 0%, transparent 70%)`,
                            borderRadius: '0 24px 0 0',
                        }}
                    />

                    {/* Level badge */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '8px',
                            backgroundColor: levelStyle.bg,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                color: levelStyle.color,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5
                            }}
                        >
                            {LEVEL_LABELS[word.level]}
                        </Typography>
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            color: '#1c1917',
                            mb: 3,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {word.english}
                    </Typography>

                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation()
                            onPlayTTS?.()
                        }}
                        disabled={isPlayingTTS}
                        sx={{
                            width: 56,
                            height: 56,
                            backgroundColor: isPlayingTTS ? '#059669' : '#f5f5f4',
                            mb: 3,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: isPlayingTTS ? '#047857' : '#e7e5e4',
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <VolumeIcon
                            sx={{
                                fontSize: 28,
                                color: isPlayingTTS ? 'white' : '#57534e',
                            }}
                        />
                    </IconButton>

                    {word.example && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontStyle: 'italic',
                                color: '#78716c',
                                textAlign: 'center',
                                maxWidth: '90%',
                                lineHeight: 1.5,
                            }}
                        >
                            "{word.example}"
                        </Typography>
                    )}

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: '#a8a29e',
                        }}
                    >
                        <TapIcon sx={{fontSize: 16}}/>
                        <Typography variant="caption" sx={{fontWeight: 500}}>
                            Tap to reveal meaning
                        </Typography>
                    </Box>
                </Box>

                {/* Back - Korean */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
                        borderRadius: '24px',
                        boxShadow: '0 10px 40px -10px rgba(5, 150, 105, 0.4), 0 0 0 1px rgba(0,0,0,0.03)',
                        p: 4,
                        overflow: 'hidden',
                    }}
                >
                    {/* Decorative elements */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -30,
                            left: -30,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.05)',
                        }}
                    />

                    <Typography
                        variant="overline"
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            fontWeight: 600,
                            letterSpacing: 2,
                            mb: 1,
                        }}
                    >
                        MEANING
                    </Typography>

                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: 'center',
                            color: 'white',
                            mb: 4,
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {word.korean}
                    </Typography>

                    <Box display="flex" gap={1}>
                        <Chip
                            label={LEVEL_LABELS[word.level]}
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 600,
                                backdropFilter: 'blur(8px)',
                            }}
                        />
                        {word.category && (
                            <Chip
                                label={CATEGORY_LABELS[word.category]}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 500,
                                    backdropFilter: 'blur(8px)',
                                }}
                            />
                        )}
                    </Box>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        <TapIcon sx={{fontSize: 16}}/>
                        <Typography variant="caption" sx={{fontWeight: 500}}>
                            Tap to see word
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
