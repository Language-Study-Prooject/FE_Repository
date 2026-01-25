import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    FormControlLabel,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Switch,
    Typography,
} from '@mui/material'
import {
    Add as AddIcon,
    Link as LinkIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material'
import GameRoomCard from '../components/GameRoomCard'
import CreateGameRoomModal from '../components/CreateGameRoomModal'
import { gameService } from '../services/gameService'
import { GAME_COLORS } from '../theme/gameTheme'
import { useAuth } from '../../../contexts/AuthContext'

const WordchainLobbyPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)

    // 필터
    const [filters, setFilters] = useState({
        level: '',
        waitingOnly: true,
    })

    // 방 목록 조회 - gameType을 WORDCHAIN으로 필터링
    const fetchRooms = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = {
                gameType: 'WORDCHAIN',
            }
            if (filters.level) params.level = filters.level
            if (filters.waitingOnly) params.status = 'WAITING'

            const response = await gameService.getRooms(params)
            setRooms(response.data.rooms || [])
        } catch (err) {
            console.error('Failed to fetch rooms:', err)
            setError('방 목록을 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        fetchRooms()
    }, [fetchRooms])

    // 방 생성
    const handleCreateRoom = async (data) => {
        try {
            setCreating(true)
            // gameType을 WORDCHAIN으로 설정
            const response = await gameService.createRoom({
                ...data,
                gameType: 'WORDCHAIN',
            })
            setCreateModalOpen(false)
            // 생성된 방의 대기실로 이동
            navigate(`/games/wordchain/${response.data.roomId}/waiting`)
        } catch (err) {
            console.error('Failed to create room:', err)
            setError('방 생성에 실패했습니다')
        } finally {
            setCreating(false)
        }
    }

    // 방 참가
    const handleJoinRoom = async (room) => {
        try {
            const response = await gameService.joinRoom(room.roomId)
            // roomToken을 sessionStorage에 저장 (WebSocket 연결 시 사용)
            if (response.data?.roomToken) {
                sessionStorage.setItem(`roomToken_${room.roomId}`, response.data.roomToken)
            }
            navigate(`/games/wordchain/${room.roomId}/waiting`)
        } catch (err) {
            console.error('Failed to join room:', err)
            setError(err.message || '방 참가에 실패했습니다')
        }
    }

    // 관전
    const handleSpectateRoom = (room) => {
        navigate(`/games/wordchain/${room.roomId}/play?spectate=true`)
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* 헤더 */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            background: `linear-gradient(135deg, ${GAME_COLORS.primary} 0%, ${GAME_COLORS.primaryLight} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 24px -8px ${GAME_COLORS.primary}60`,
                        }}
                    >
                        <LinkIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800}>
                            끝말잇기
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            영어 단어로 끝말잇기를 즐겨보세요
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 필터 + 액션 */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {/* 필터 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Select
                        value={filters.level}
                        onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                        displayEmpty
                        size="small"
                        sx={{
                            minWidth: 100,
                            borderRadius: '10px',
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: '10px',
                            },
                        }}
                    >
                        <MenuItem value="">전체 난이도</MenuItem>
                        <MenuItem value="BEGINNER">초급</MenuItem>
                        <MenuItem value="INTERMEDIATE">중급</MenuItem>
                        <MenuItem value="ADVANCED">고급</MenuItem>
                    </Select>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.waitingOnly}
                                onChange={(e) => setFilters(prev => ({ ...prev, waitingOnly: e.target.checked }))}
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: GAME_COLORS.primary,
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        bgcolor: GAME_COLORS.primary,
                                    },
                                }}
                            />
                        }
                        label={<Typography variant="body2">대기중만</Typography>}
                    />

                    <IconButton onClick={fetchRooms} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>

                    <Chip
                        label={`${rooms.length}개 방`}
                        size="small"
                        sx={{ bgcolor: GAME_COLORS.primaryBg, color: GAME_COLORS.primary, fontWeight: 600 }}
                    />
                </Box>

                {/* 방 만들기 버튼 */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateModalOpen(true)}
                    sx={{
                        bgcolor: GAME_COLORS.primary,
                        '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                    }}
                >
                    방 만들기
                </Button>
            </Box>

            {/* 에러 */}
            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                </Alert>
            )}

            {/* 방 목록 */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: GAME_COLORS.primary }} />
                </Box>
            ) : rooms.length === 0 ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        bgcolor: 'background.paper',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '20px',
                            bgcolor: GAME_COLORS.primaryBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <LinkIcon sx={{ fontSize: 40, color: GAME_COLORS.primary }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        대기 중인 방이 없습니다
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        새로운 게임방을 만들어보세요!
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateModalOpen(true)}
                        sx={{
                            bgcolor: GAME_COLORS.primary,
                            '&:hover': { bgcolor: GAME_COLORS.primaryLight },
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        방 만들기
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {rooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.roomId}>
                            <GameRoomCard
                                room={room}
                                onJoin={handleJoinRoom}
                                onSpectate={handleSpectateRoom}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* 방 생성 모달 */}
            <CreateGameRoomModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCreate={handleCreateRoom}
                loading={creating}
                gameType="WORDCHAIN"
            />
        </Container>
    )
}

export default WordchainLobbyPage
