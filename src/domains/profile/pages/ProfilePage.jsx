import { useState, useEffect } from 'react'
import { Box, Button, Card, CardContent, Container, TextField, Typography, Avatar, Alert } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'

// ▼▼▼ [중요] 파일 위치가 바뀌었으니 import 경로도 수정했습니다! ▼▼▼
// (pages 폴더와 store 폴더가 같은 profile 폴더 안에 형제(sibling) 관계이므로)
import { updateProfile } from '../store/profileSlice'

const ProfilePage = () => {
    const dispatch = useDispatch()
    const { profile, updateLoading } = useSelector((state) => state.profile)

    const [nickname, setNickname] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // 리덕스에 있는 내 정보(profile)가 로드되면 입력창에 채워넣기
    useEffect(() => {
        if (profile?.nickname) {
            setNickname(profile.nickname)
        }
    }, [profile])

    const handleSave = async () => {
        try {
            // 1. 닉네임 변경 요청 보내기
            await dispatch(updateProfile({ nickname })).unwrap()

            // 2. 성공 메시지 띄우기
            setSuccessMsg('닉네임이 변경되었습니다! 로그아웃 후 다시 로그인해주세요.')
        } catch (error) {
            alert('변경 실패: ' + error)
        }
    }

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
                내 프로필 수정
            </Typography>

            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* 프로필 이미지 */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 100,
                                height: 100,
                                fontSize: 40,
                                background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
                            }}
                        >
                            {nickname ? nickname.substring(0, 1).toUpperCase() : 'U'}
                        </Avatar>
                    </Box>

                    {/* 이메일 (수정 불가) */}
                    <TextField
                        label="이메일"
                        value={profile?.email || ''}
                        disabled
                        fullWidth
                        variant="outlined"
                    />

                    {/* 닉네임 (수정 가능) */}
                    <TextField
                        label="닉네임"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        fullWidth
                        variant="outlined"
                        helperText="채팅방에서 사용할 멋진 닉네임을 지어주세요!"
                    />

                    {/* 성공 메시지 */}
                    {successMsg && (
                        <Alert severity="success">{successMsg}</Alert>
                    )}

                    {/* 저장 버튼 */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSave}
                        disabled={updateLoading}
                        sx={{
                            mt: 2,
                            height: 50,
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                        }}
                    >
                        {updateLoading ? '저장 중...' : '저장하기'}
                    </Button>

                </CardContent>
            </Card>
        </Container>
    )
}

export default ProfilePage