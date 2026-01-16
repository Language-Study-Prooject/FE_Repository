import { useState, useRef, useEffect } from 'react'
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Link,
} from '@mui/material'
import {
    ArrowBack as ArrowBackIcon,
    Email as EmailIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useAuth } from '../../../contexts/AuthContext'

export default function EmailVerification({ email, onComplete, onBack }) {
    const { confirmEmail, resendCode } = useAuth()

    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [countdown, setCountdown] = useState(0)

    const inputRefs = useRef([])

    // 카운트다운 타이머
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // 코드 입력 처리
    const handleCodeChange = (index, value) => {
        // 숫자만 허용
        if (value && !/^\d+$/.test(value)) return

        const newCode = [...code]

        // 붙여넣기 처리
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split('')
            pastedCode.forEach((char, i) => {
                if (index + i < 6) {
                    newCode[index + i] = char
                }
            })
            setCode(newCode)

            // 마지막 입력 필드로 포커스
            const nextIndex = Math.min(index + pastedCode.length, 5)
            inputRefs.current[nextIndex]?.focus()
            return
        }

        newCode[index] = value
        setCode(newCode)
        setError('')

        // 다음 입력 필드로 자동 이동
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    // 키 입력 처리
    const handleKeyDown = (index, e) => {
        // 백스페이스: 이전 필드로 이동
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        // Enter: 제출
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    // 인증 코드 확인
    const handleSubmit = async () => {
        const verificationCode = code.join('')

        if (verificationCode.length !== 6) {
            setError('6자리 인증 코드를 입력해주세요.')
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const result = await confirmEmail(email, verificationCode)

            if (result.success) {
                setSuccess(result.message)
                setTimeout(() => {
                    onComplete()
                }, 1500)
            } else {
                setError(result.message)
                // 코드 초기화
                setCode(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            }
        } catch (err) {
            setError('인증 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    // 인증 코드 재전송
    const handleResend = async () => {
        if (countdown > 0) return

        setError('')
        setSuccess('')
        setIsResending(true)

        try {
            const result = await resendCode(email)

            if (result.success) {
                setSuccess(result.message)
                setCountdown(60) // 60초 쿨다운
                // 코드 초기화
                setCode(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            } else {
                setError(result.message)
            }
        } catch (err) {
            setError('코드 재전송 중 오류가 발생했습니다.')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                width: '100%',
            }}
        >
            {/* 뒤로가기 */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                sx={{ alignSelf: 'flex-start', ml: -1 }}
            >
                돌아가기
            </Button>

            {/* 타이틀 */}
            <Box sx={{ textAlign: 'center' }}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <EmailIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    이메일 인증
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    <strong>{email}</strong>로 발송된
                    <br />
                    6자리 인증 코드를 입력해주세요.
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

            {/* 인증 코드 입력 */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                }}
            >
                {code.map((digit, index) => (
                    <TextField
                        key={index}
                        inputRef={(el) => (inputRefs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isLoading}
                        inputProps={{
                            maxLength: 6, // 붙여넣기 허용
                            style: {
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                padding: '12px',
                            },
                        }}
                        sx={{
                            width: 48,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                ))}
            </Box>

            {/* 확인 버튼 */}
            <Button
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isLoading || code.join('').length !== 6}
                sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                }}
            >
                {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    '인증 완료'
                )}
            </Button>

            {/* 재전송 */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    코드를 받지 못하셨나요?{' '}
                    {countdown > 0 ? (
                        <Typography component="span" color="primary" fontWeight={600}>
                            {countdown}초 후 재전송 가능
                        </Typography>
                    ) : (
                        <Link
                            component="button"
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            sx={{
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            {isResending ? (
                                <CircularProgress size={14} />
                            ) : (
                                <RefreshIcon sx={{ fontSize: 16 }} />
                            )}
                            재전송
                        </Link>
                    )}
                </Typography>
            </Box>
        </Box>
    )
}