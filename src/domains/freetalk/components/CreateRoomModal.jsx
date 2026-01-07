import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material'
import { chatRoomService } from '../../chat/services/chatService'

const CreateRoomModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'BEGINNER',
    maxParticipants: 6,
    isPrivate: false,
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('채팅방 이름을 입력해주세요')
      return
    }

    if (formData.isPrivate && !formData.password) {
      setError('비밀방은 비밀번호가 필요합니다')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        level: formData.level,
        maxParticipants: formData.maxParticipants,
        isPrivate: formData.isPrivate,
        ...(formData.isPrivate && { password: formData.password }),
      }

      await chatRoomService.create(payload)
      handleClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Failed to create room:', err)
      setError('채팅방 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      level: 'BEGINNER',
      maxParticipants: 6,
      isPrivate: false,
      password: '',
    })
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>새 채팅방 만들기</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="채팅방 이름"
            placeholder="예: 영어 프리토킹방"
            value={formData.name}
            onChange={handleChange('name')}
            required
            fullWidth
          />

          <TextField
            label="설명"
            placeholder="채팅방 설명을 입력하세요"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={2}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>레벨</InputLabel>
            <Select
              value={formData.level}
              label="레벨"
              onChange={handleChange('level')}
            >
              <MenuItem value="BEGINNER">초급</MenuItem>
              <MenuItem value="INTERMEDIATE">중급</MenuItem>
              <MenuItem value="ADVANCED">고급</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>최대 인원</InputLabel>
            <Select
              value={formData.maxParticipants}
              label="최대 인원"
              onChange={handleChange('maxParticipants')}
            >
              {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                <MenuItem key={num} value={num}>
                  {num}명
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isPrivate}
                onChange={handleChange('isPrivate')}
              />
            }
            label="비밀방으로 설정"
          />

          {formData.isPrivate && (
            <TextField
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange('password')}
              required
              fullWidth
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          {loading ? '생성중...' : '생성하기'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateRoomModal
