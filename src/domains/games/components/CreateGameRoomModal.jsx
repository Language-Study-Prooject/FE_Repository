import {useState} from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Slider,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import {Close as CloseIcon} from '@mui/icons-material'
import {GAME_COLORS} from '../theme/gameTheme'

const levelOptions = [
    { value: 'BEGINNER', label: '초급', color: '#10B981' },
    { value: 'INTERMEDIATE', label: '중급', color: '#F59E0B' },
    { value: 'ADVANCED', label: '고급', color: '#EF4444' },
]

const CreateGameRoomModal = ({ open, onClose, onCreate, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        level: 'BEGINNER',
        maxParticipants: 4,
        maxRounds: 5,
        roundTimeLimit: 60,
    })

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = () => {
        if (!formData.name.trim()) return
        onCreate?.(formData)
    }

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            level: 'BEGINNER',
            maxParticipants: 4,
            maxRounds: 5,
            roundTimeLimit: 60,
        })
        onClose?.()
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    overflow: 'hidden',
                },
            }}
        >
            {/* 헤더 */}
            <DialogTitle
                sx={{
                    bgcolor: GAME_COLORS.primary,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 2,
                }}
            >
                <Typography variant="h6" fontWeight={700}>
                    새 게임방 만들기
                </Typography>
                <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {/* 방 이름 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        방 이름 *
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="예: 초보 환영방"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            },
                        }}
                    />
                </Box>

                {/* 설명 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        설명 (선택)
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="방에 대한 간단한 설명"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            },
                        }}
                    />
                </Box>

                {/* 난이도 */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        난이도
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.level}
                        exclusive
                        onChange={(e, value) => value && handleChange('level', value)}
                        fullWidth
                        sx={{
                            '& .MuiToggleButton-root': {
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1,
                            },
                        }}
                    >
                        {levelOptions.map((opt) => (
                            <ToggleButton
                                key={opt.value}
                                value={opt.value}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: `${opt.color}20`,
                                        color: opt.color,
                                        borderColor: opt.color,
                                        '&:hover': {
                                            bgcolor: `${opt.color}30`,
                                        },
                                    },
                                }}
                            >
                                {opt.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {/* 최대 인원 */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            최대 인원
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={GAME_COLORS.primary}>
                            {formData.maxParticipants}명
                        </Typography>
                    </Box>
                    <Slider
                        value={formData.maxParticipants}
                        onChange={(e, value) => handleChange('maxParticipants', value)}
                        min={2}
                        max={8}
                        step={1}
                        marks
                        sx={{
                            color: GAME_COLORS.primary,
                            '& .MuiSlider-markLabel': {
                                fontSize: '0.7rem',
                            },
                        }}
                    />
                </Box>

                {/* 라운드 수 */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            라운드 수
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={GAME_COLORS.primary}>
                            {formData.maxRounds}라운드
                        </Typography>
                    </Box>
                    <Slider
                        value={formData.maxRounds}
                        onChange={(e, value) => handleChange('maxRounds', value)}
                        min={3}
                        max={10}
                        step={1}
                        marks
                        sx={{
                            color: GAME_COLORS.primary,
                        }}
                    />
                </Box>

                {/* 라운드 시간 */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            라운드 시간
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={GAME_COLORS.primary}>
                            {formData.roundTimeLimit}초
                        </Typography>
                    </Box>
                    <Slider
                        value={formData.roundTimeLimit}
                        onChange={(e, value) => handleChange('roundTimeLimit', value)}
                        min={30}
                        max={120}
                        step={15}
                        marks={[
                            { value: 30, label: '30초' },
                            { value: 60, label: '60초' },
                            { value: 90, label: '90초' },
                            { value: 120, label: '120초' },
                        ]}
                        sx={{
                            color: GAME_COLORS.primary,
                            '& .MuiSlider-markLabel': {
                                fontSize: '0.65rem',
                            },
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
                <Button
                    onClick={handleClose}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 3,
                    }}
                >
                    취소
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!formData.name.trim() || loading}
                    sx={{
                        bgcolor: GAME_COLORS.primary,
                        '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                        borderRadius: '10px',
                        textTransform: 'none',
                        px: 3,
                        fontWeight: 600,
                    }}
                >
                    {loading ? '생성 중...' : '만들기'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateGameRoomModal
