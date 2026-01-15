import {useState} from 'react'
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import {
    Cancel as CancelIcon,
    CheckCircle as CheckIcon,
    Close as CloseIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    VolumeUp as VolumeIcon,
} from '@mui/icons-material'
import {
    CATEGORY_LABELS,
    DIFFICULTY,
    DIFFICULTY_LABELS,
    LEVEL_LABELS,
    VOICE_TYPES,
    WORD_STATUS_LABELS,
} from '../constants/vocabConstants'
import {useTranslation} from '../../../contexts/SettingsContext'

export default function WordDetailModal({
                                            open,
                                            onClose,
                                            word,
                                            userWord,
                                            onPlayTTS,
                                            onToggleBookmark,
                                            onToggleFavorite,
                                            onSetDifficulty,
                                            isPlayingTTS,
                                        }) {
    const {t} = useTranslation()
    const [selectedVoice, setSelectedVoice] = useState(VOICE_TYPES.FEMALE)

    if (!word) return null

    const wordData = word
    const userData = userWord || word

    const handlePlayTTS = () => {
        onPlayTTS?.(selectedVoice)
    }

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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'MASTERED':
                return {bg: '#ecfdf5', color: '#059669'}
            case 'REVIEWING':
                return {bg: '#eff6ff', color: '#3b82f6'}
            case 'LEARNING':
                return {bg: '#fff7ed', color: '#f97316'}
            default:
                return {bg: '#f5f5f4', color: '#57534e'}
        }
    }

    const levelStyle = getLevelStyle(wordData.level)
    const statusStyle = getStatusStyle(userData?.status)

    const totalAttempts = (userData?.correctCount || 0) + (userData?.incorrectCount || 0)
    const accuracy = totalAttempts > 0
        ? ((userData?.correctCount || 0) / totalAttempts * 100).toFixed(0)
        : 0

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '24px',
                    overflow: 'hidden',
                },
            }}
        >
            {/* 헤더 */}
            <Box
                sx={{
                    p: 3,
                    pb: 4,
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* 장식 요소 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -20,
                        left: 20,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                    }}
                />

                <Box display="flex" justifyContent="space-between" alignItems="flex-start" position="relative">
                    <Box>
                        <Typography
                            variant="h3"
                            sx={{color: 'white', fontWeight: 800, mb: 1, letterSpacing: '-0.02em'}}
                        >
                            {wordData.english}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            {wordData.level && (
                                <Chip
                                    label={LEVEL_LABELS[wordData.level] || wordData.level}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 600,
                                        backdropFilter: 'blur(8px)',
                                    }}
                                />
                            )}
                            {wordData.category && (
                                <Chip
                                    label={CATEGORY_LABELS[wordData.category] || wordData.category}
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
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '&:hover': {backgroundColor: 'rgba(255,255,255,0.2)'},
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </Box>
            </Box>

            <DialogContent sx={{p: 3}}>
                {/* 뜻 */}
                <Box mb={4}>
                    <Typography
                        variant="h4"
                        sx={{fontWeight: 700, color: '#1c1917', mb: 1}}
                    >
                        {wordData.korean}
                    </Typography>
                    {userData?.status && (
                        <Chip
                            label={WORD_STATUS_LABELS[userData.status] || userData.status}
                            size="small"
                            sx={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                                fontWeight: 600,
                            }}
                        />
                    )}
                </Box>

                {/* 예문 */}
                {wordData.example && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            mb: 4,
                            backgroundColor: '#fafaf9',
                            borderRadius: '14px',
                            borderLeft: '4px solid #059669',
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{mb: 0.5, display: 'block'}}>
                            {t('wordDetail.example')}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{fontStyle: 'italic', color: '#1c1917'}}
                        >
                            "{wordData.example}"
                        </Typography>
                    </Paper>
                )}

                {/* TTS */}
                <Box mb={4}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 1.5, fontWeight: 500}}>
                        {t('wordDetail.pronunciation')}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <ToggleButtonGroup
                            value={selectedVoice}
                            exclusive
                            onChange={(e, val) => val && setSelectedVoice(val)}
                            size="small"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    px: 2,
                                    '&.Mui-selected': {
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        '&:hover': {backgroundColor: '#047857'},
                                    },
                                },
                            }}
                        >
                            <ToggleButton value={VOICE_TYPES.FEMALE}>{t('wordDetail.voiceFemale')}</ToggleButton>
                            <ToggleButton value={VOICE_TYPES.MALE}>{t('wordDetail.voiceMale')}</ToggleButton>
                        </ToggleButtonGroup>
                        <Button
                            variant="contained"
                            startIcon={<VolumeIcon/>}
                            onClick={handlePlayTTS}
                            disabled={isPlayingTTS}
                            sx={{
                                backgroundColor: '#059669',
                                '&:hover': {backgroundColor: '#047857'},
                            }}
                        >
                            {isPlayingTTS ? t('wordDetail.playing') : t('wordDetail.listen')}
                        </Button>
                    </Box>
                </Box>

                {/* 학습 현황 */}
                {userData && (userData.correctCount > 0 || userData.incorrectCount > 0) && (
                    <Box mb={4}>
                        <Typography variant="body2" color="text.secondary" sx={{mb: 1.5, fontWeight: 500}}>
                            {t('wordDetail.learningStatus')}
                        </Typography>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                backgroundColor: '#fafaf9',
                                borderRadius: '14px',
                            }}
                        >
                            <Box display="flex" justifyContent="space-around" mb={2}>
                                <Box textAlign="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '12px',
                                            backgroundColor: '#ecfdf5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1,
                                        }}
                                    >
                                        <CheckIcon sx={{color: '#10b981', fontSize: 28}}/>
                                    </Box>
                                    <Typography variant="h5" fontWeight={800} sx={{color: '#10b981'}}>
                                        {userData.correctCount || 0}
                                    </Typography>
                                    <Typography variant="caption"
                                                color="text.secondary">{t('wordDetail.correctCount')}</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '12px',
                                            backgroundColor: '#fef2f2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1,
                                        }}
                                    >
                                        <CancelIcon sx={{color: '#ef4444', fontSize: 28}}/>
                                    </Box>
                                    <Typography variant="h5" fontWeight={800} sx={{color: '#ef4444'}}>
                                        {userData.incorrectCount || 0}
                                    </Typography>
                                    <Typography variant="caption"
                                                color="text.secondary">{t('wordDetail.incorrectCount')}</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '12px',
                                            backgroundColor: accuracy >= 80 ? '#ecfdf5' : accuracy >= 50 ? '#fff7ed' : '#fef2f2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={800}
                                            sx={{
                                                color: accuracy >= 80 ? '#10b981' : accuracy >= 50 ? '#f97316' : '#ef4444',
                                            }}
                                        >
                                            %
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                        sx={{
                                            color: accuracy >= 80 ? '#10b981' : accuracy >= 50 ? '#f97316' : '#ef4444',
                                        }}
                                    >
                                        {accuracy}
                                    </Typography>
                                    <Typography variant="caption"
                                                color="text.secondary">{t('wordDetail.accuracyLabel')}</Typography>
                                </Box>
                            </Box>

                            {userData.lastReviewedAt && (
                                <Box display="flex" justifyContent="space-between" alignItems="center" pt={2}
                                     borderTop="1px solid #e7e5e4">
                                    <Typography variant="body2"
                                                color="text.secondary">{t('wordDetail.lastReviewed')}</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {new Date(userData.lastReviewedAt).toLocaleDateString('ko-KR')}
                                    </Typography>
                                </Box>
                            )}
                            {userData.nextReviewAt && (
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                                    <Typography variant="body2"
                                                color="text.secondary">{t('wordDetail.nextReview')}</Typography>
                                    <Typography variant="body2" fontWeight={600} sx={{color: '#059669'}}>
                                        {new Date(userData.nextReviewAt).toLocaleDateString('ko-KR')}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}

                <Divider sx={{my: 3}}/>

                {/* 액션 */}
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" gap={1}>
                        <IconButton
                            onClick={onToggleBookmark}
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: userData?.bookmarked ? '#fef3c7' : '#f5f5f4',
                                '&:hover': {backgroundColor: userData?.bookmarked ? '#fde68a' : '#e7e5e4'},
                            }}
                        >
                            {userData?.bookmarked ? (
                                <StarIcon sx={{color: '#f59e0b'}}/>
                            ) : (
                                <StarBorderIcon sx={{color: '#78716c'}}/>
                            )}
                        </IconButton>
                        <IconButton
                            onClick={onToggleFavorite}
                            sx={{
                                width: 48,
                                height: 48,
                                backgroundColor: userData?.favorite ? '#fef2f2' : '#f5f5f4',
                                '&:hover': {backgroundColor: userData?.favorite ? '#fecaca' : '#e7e5e4'},
                            }}
                        >
                            {userData?.favorite ? (
                                <FavoriteIcon sx={{color: '#ef4444'}}/>
                            ) : (
                                <FavoriteBorderIcon sx={{color: '#78716c'}}/>
                            )}
                        </IconButton>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {t('wordDetail.difficulty')}
                        </Typography>
                        <ToggleButtonGroup
                            value={userData?.difficulty || DIFFICULTY.NORMAL}
                            exclusive
                            onChange={(e, val) => val && onSetDifficulty?.(val)}
                            size="small"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    px: 1.5,
                                    fontSize: 12,
                                    '&.Mui-selected': {
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        '&:hover': {backgroundColor: '#047857'},
                                    },
                                },
                            }}
                        >
                            {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                                <ToggleButton key={key} value={key}>
                                    {label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}
