import { useState } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'
import { GAME_COLORS } from '../../theme/gameTheme'

/**
 * WordInput - 단어 입력 필드
 */
const WordInput = ({ onSubmit, disabled, nextLetter, isMyTurn }) => {
    const [word, setWord] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        const trimmedWord = word.trim().toLowerCase()

        // 유효성 검사
        if (!trimmedWord) {
            setError('단어를 입력하세요')
            return
        }

        if (nextLetter && trimmedWord[0] !== nextLetter.toLowerCase()) {
            setError(`단어는 '${nextLetter}'로 시작해야 합니다`)
            return
        }

        // 알파벳만 허용
        if (!/^[a-z]+$/.test(trimmedWord)) {
            setError('영어 알파벳만 입력하세요')
            return
        }

        setError('')
        onSubmit(trimmedWord)
        setWord('')
    }

    const handleChange = (e) => {
        setWord(e.target.value)
        setError('')
    }

    return (
        <Box>
            {!isMyTurn && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                    다른 플레이어의 턴입니다
                </Typography>
            )}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    gap: 1,
                }}
            >
                <TextField
                    fullWidth
                    value={word}
                    onChange={handleChange}
                    placeholder={nextLetter ? `${nextLetter}로 시작하는 단어 입력` : '단어 입력'}
                    disabled={disabled || !isMyTurn}
                    error={!!error}
                    helperText={error}
                    autoComplete="off"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                        },
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={disabled || !isMyTurn || !word.trim()}
                    sx={{
                        minWidth: 100,
                        bgcolor: GAME_COLORS.primary,
                        '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                    endIcon={<SendIcon />}
                >
                    제출
                </Button>
            </Box>
        </Box>
    )
}

export default WordInput
