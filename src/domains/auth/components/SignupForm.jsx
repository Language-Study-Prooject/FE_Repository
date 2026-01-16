import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Link,
    Divider,
    LinearProgress,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Check as CheckIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

export default function SignupForm({ onSwitchToLogin }) {
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        // TODO : 유효성 검사 추가

        try {
            const result = await register(formData.email, formData.password)

            if (result.success) {
                setSuccess(result.message)
                setStep('verify')
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('회원가입 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
            }}
        >
            {/* 타이틀 */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1,
                    }}
                >
                    회원가입
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    새로운 계정을 만들어보세요
                </Typography>
            </Box>

            {/* 에러/성공 메시지 */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                    {success}
                </Alert>
            )}

            {/* 이메일 입력 */}
            <TextField
                fullWidth
                name="email"
                type="email"
                label="이메일"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailIcon color="action" />
                        </InputAdornment>
                    ),
                }}
            />

            {/* 비밀번호 입력 */}
            <Box>
                <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="비밀번호"
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* TODO : 비밀번호 강도 표시 추가 */}
            </Box>

            {/* 비밀번호 확인 */}
            <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                error={formData.confirmPassword && formData.password !== formData.confirmPassword}
                helperText={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? '비밀번호가 일치하지 않습니다'
                        : ''
                }
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                size="small"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {/* 가입 버튼 */}
            <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                    },
                }}
            >
                {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    '인증 코드 받기'
                )}
            </Button>

            {/* 구분선 */}
            <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    또는
                </Typography>
            </Divider>

            {/* 로그인 안내 */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    이미 계정이 있으신가요?{' '}
                    <Link
                        component="button"
                        type="button"
                        onClick={onSwitchToLogin}
                        sx={{ fontWeight: 600, textDecoration: 'none' }}
                    >
                        로그인
                    </Link>
                </Typography>
            </Box>
        </Box>
    )
}