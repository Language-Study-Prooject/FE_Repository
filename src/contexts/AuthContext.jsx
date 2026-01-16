import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import {
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    getCurrentUser,
    fetchAuthSession,
    resendSignUpCode,
} from 'aws-amplify/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuthUser()
    }, [])

    // 현재 인증된 사용자 확인
    const checkAuthUser = async () => {
        try {
            const currentUser = await getCurrentUser()

            setUser({
                ...currentUser,
                email: currentUser.signInDetails?.loginId || currentUser.username,
            })
            setIsAuthenticated(true)
        } catch (error) {
            // 로그인되지 않은 상태
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    // 로그인
    const login = useCallback(async (email, password) => {
        try {
            const result = await signIn({ username: email, password })

            if (result.isSignedIn) {
                await checkAuthUser()
                return { success: true }
            }

            return {
                success: false,
                message: '로그인에 실패했습니다.'
            }
        } catch (error) {
            return {
                success: false,
                message: getAuthErrorMessage(error)
            }
        }
    }, [])

    // 회원가입
    const register = useCallback(async (email, password) => {
        try {
            const result = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email: email,
                    }
                }
            })

            return {
                success: true,
                nextStep: result.nextStep,
                message: '인증 코드가 이메일로 발송되었습니다.'
            }
        } catch (error) {
            console.error('회원가입 실패:', error)
            return {
                success: false,
                message: getAuthErrorMessage(error)
            }
        }
    }, [])

    // 이메일 인증 코드 확인
    const confirmEmail = useCallback(async (email, code) => {
        try {
            const result = await confirmSignUp({
                username: email,
                confirmationCode: code,
            })

            return {
                success: true,
                message: '회원가입이 완료되었습니다! 로그인해주세요.'
            }
        } catch (error) {
            console.error('이메일 인증 코드 확인 실패:', error)
            return {
                success: false,
                message: getAuthErrorMessage(error)
            }
        }
    }, [])

    // 인증 코드 재전송
    const resendCode = useCallback(async (email) => {
        try {
            await resendSignUpCode({ username: email })
            return {
                success: true,
                message: '인증 코드가 재전송되었습니다.'
            }
        } catch (error) {
            console.error('인증 코드 재전송 실패:', error)
            return {
                success: false,
                message: getAuthErrorMessage(error)
            }
        }
    }, [])


    // 로그아웃
    const logout = useCallback(async () => {
        try {
            await signOut()
            setUser(null)
            setIsAuthenticated(false)
            return { success: true }
        } catch (error) {
            console.error('Logout error:', error)
            return {
                success: false,
                message: '로그아웃 실패'
            }
        }
    }, [])

    const value = useMemo(() => ({
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        confirmEmail,
        resendCode,
        logout,
        checkAuthUser,
    }), [
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        confirmEmail,
        resendCode,
        logout,
        checkAuthUser,
    ])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다')
    }
    return context
}

// Cognito 에러 메시지 변환 헬퍼
function getAuthErrorMessage(error) {
    const errorMessages = {
        'UserNotFoundException': '등록되지 않은 이메일입니다.',
        'NotAuthorizedException': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'UserNotConfirmedException': '이메일 인증이 완료되지 않았습니다.',
        'UsernameExistsException': '이미 사용 중인 이메일입니다.',
        'InvalidPasswordException': '비밀번호 형식이 올바르지 않습니다. (8자 이상, 대소문자, 숫자, 특수문자 포함)',
        'CodeMismatchException': '인증 코드가 올바르지 않습니다.',
        'ExpiredCodeException': '인증 코드가 만료되었습니다. 다시 요청해주세요.',
        'LimitExceededException': '요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
        'TooManyRequestsException': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        'InvalidParameterException': '입력 정보가 올바르지 않습니다.',
    }

    // Cognito 에러 코드로 메시지 찾기
    const errorName = error.name || error.code
    if (errorMessages[errorName]) {
        return errorMessages[errorName]
    }

    // 기본 메시지
    return error.message || '오류가 발생했습니다. 다시 시도해주세요.'
}
