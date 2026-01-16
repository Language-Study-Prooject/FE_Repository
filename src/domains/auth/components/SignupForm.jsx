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

    const [step, setStep] = useState('form')

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

    const passwordChecks = {
        length: formData.password.length >= 8,
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    };

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        setError('')
    }

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
    const isPasswordValid = passwordStrength >= 4

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        // 유효성 검사 
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError('모든 필드를 입력해주세요.')
            setIsLoading(false)
            return
        }
        if (!isPasswordValid) {
            setError('비밀번호 조건을 충족해주세요.')
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.')
            setIsLoading(false)
            return
        }

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

    // 비밀번호 강도 표시
    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'error'
        if (passwordStrength <= 3) return 'warning'
        return 'success'
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

                {formData.password && (
                    <Box sx={{ mt: 1.5 }}>
                        {/* 세그먼트 바 + 강도 텍스트 */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            {/* 20칸 세그먼트 바 */}
                            <Box sx={{ display: 'flex', gap: '2px', flex: 1 }}>
                                {[...Array(20)].map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            flex: 1,
                                            height: 4,
                                            borderRadius: 0.5,
                                            backgroundColor: index < passwordStrength * 5
                                                ? passwordStrength <= 1 ? '#ef4444'
                                                    : passwordStrength <= 2 ? '#f59e0b'
                                                        : passwordStrength <= 3 ? '#84cc16'
                                                            : '#10b981'
                                                : '#e5e7eb',
                                        }}
                                    />
                                ))}
                            </Box>
                            {/* 강도 텍스트 */}
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                sx={{
                                    minWidth: 40,
                                    color: passwordStrength <= 1 ? '#ef4444'
                                        : passwordStrength <= 2 ? '#f59e0b'
                                            : passwordStrength <= 3 ? '#84cc16'
                                                : '#10b981',
                                }}
                            >
                                {passwordStrength <= 1 ? '약함'
                                    : passwordStrength <= 2 ? '보통'
                                        : passwordStrength <= 3 ? '좋음'
                                            : '강함'}
                            </Typography>
                        </Box>
                        {/* 체크 항목 */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <PasswordCheck checked={passwordChecks.length} label="8자 이상" />
                            <PasswordCheck checked={passwordChecks.lowercase} label="소문자" />
                            <PasswordCheck checked={passwordChecks.number} label="숫자" />
                            <PasswordCheck checked={passwordChecks.special} label="특수문자" />
                        </Box>
                    </Box>
                )}

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

// 비밀번호 체크 아이템 컴포넌트
function PasswordCheck({ checked, label }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.75rem',
                color: checked ? 'success.main' : 'text.disabled',
            }}
        >
            {checked ? (
                <CheckIcon sx={{ fontSize: 14 }} />
            ) : (
                <CloseIcon sx={{ fontSize: 14 }} />
            )}
            {label}
        </Box>
    )
}