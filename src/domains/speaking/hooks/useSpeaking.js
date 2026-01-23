import { useCallback, useState } from 'react'
import { speakingService } from '../services/speakingService'

/**
 * Speaking REST API 훅
 */
export function useSpeaking() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [sessionId, setSessionId] = useState(null)
    const [currentLevel, setCurrentLevel] = useState('INTERMEDIATE')

    /**
     * 음성 전송
     */
    const sendVoice = useCallback(async (audioBase64) => {
        setIsProcessing(true)
        setResult(null)
        setError(null)

        try {
            const response = await speakingService.chat({
                sessionId,
                audio: audioBase64,
                level: currentLevel,
            })

            setSessionId(response.sessionId)
            setResult(response)
            return response
        } catch (err) {
            console.error('[useSpeaking] Voice error:', err)
            setError(err.message || '처리 중 오류가 발생했습니다')
            throw err
        } finally {
            setIsProcessing(false)
        }
    }, [sessionId, currentLevel])

    /**
     * 텍스트 전송
     */
    const sendText = useCallback(async (text) => {
        setIsProcessing(true)
        setResult(null)
        setError(null)

        try {
            const response = await speakingService.chat({
                sessionId,
                text,
                level: currentLevel,
            })

            setSessionId(response.sessionId)
            setResult(response)
            return response
        } catch (err) {
            console.error('[useSpeaking] Text error:', err)
            setError(err.message || '처리 중 오류가 발생했습니다')
            throw err
        } finally {
            setIsProcessing(false)
        }
    }, [sessionId, currentLevel])

    /**
     * 레벨 변경
     */
    const setLevel = useCallback((level) => {
        setCurrentLevel(level)
    }, [])

    /**
     * 대화 초기화
     */
    const resetConversation = useCallback(async () => {
        if (!sessionId) {
            // 세션이 없으면 로컬 상태만 초기화
            setResult(null)
            setError(null)
            return
        }

        try {
            await speakingService.reset(sessionId)
        } catch (err) {
            console.error('[useSpeaking] Reset error:', err)
        } finally {
            // 에러가 나도 로컬 상태는 초기화
            setSessionId(null)
            setResult(null)
            setError(null)
        }
    }, [sessionId])

    /**
     * 새 세션 시작
     */
    const startNewSession = useCallback(() => {
        setSessionId(null)
        setResult(null)
        setError(null)
    }, [])

    return {
        isProcessing,
        error,
        result,
        sessionId,
        currentLevel,
        sendVoice,
        sendText,
        setLevel,
        resetConversation,
        startNewSession,
    }
}