import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material'
import {
  Close as CloseIcon,
  VolumeUp as VolumeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material'
import {
  LEVEL_LABELS,
  LEVEL_COLORS,
  CATEGORY_LABELS,
  WORD_STATUS_LABELS,
  WORD_STATUS_COLORS,
  DIFFICULTY,
  DIFFICULTY_LABELS,
  VOICE_TYPES,
} from '../constants/vocabConstants'

export default function WordDetailModal({
  open,
  onClose,
  word,
  userWord,
  onPlayTTS,
  onToggleBookmark,
  onToggleFavorite,
  onSetDifficulty,
  isPlayingTTS,
}) {
  const [selectedVoice, setSelectedVoice] = useState(VOICE_TYPES.FEMALE)

  if (!word) return null

  const handlePlayTTS = () => {
    onPlayTTS?.(selectedVoice)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            {word.english}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* TTS */}
        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" mb={1}>
            발음 듣기
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={selectedVoice}
              exclusive
              onChange={(e, val) => val && setSelectedVoice(val)}
              size="small"
            >
              <ToggleButton value={VOICE_TYPES.FEMALE}>여성</ToggleButton>
              <ToggleButton value={VOICE_TYPES.MALE}>남성</ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<VolumeIcon />}
              onClick={handlePlayTTS}
              disabled={isPlayingTTS}
            >
              {isPlayingTTS ? '재생 중...' : '듣기'}
            </Button>
          </Box>
        </Box>

        {/* 뜻 */}
        <Box mb={3}>
          <Typography variant="h4" fontWeight={600}>
            {word.korean}
          </Typography>
          <Box display="flex" gap={1} mt={1}>
            <Chip
              label={LEVEL_LABELS[word.level]}
              color={LEVEL_COLORS[word.level]}
              size="small"
            />
            <Chip
              label={CATEGORY_LABELS[word.category]}
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        {/* 예문 */}
        {word.example && (
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={0.5}>
              예문
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontStyle: 'italic', color: 'text.primary' }}
            >
              "{word.example}"
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 학습 현황 */}
        {userWord && (
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              학습 현황
            </Typography>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'grey.50',
                borderRadius: 2,
              }}
            >
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">정답</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {userWord.correctCount || 0}회
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">오답</Typography>
                <Typography variant="body2" fontWeight={600} color="error.main">
                  {userWord.incorrectCount || 0}회
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">정확도</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {userWord.correctCount + userWord.incorrectCount > 0
                    ? (
                        (userWord.correctCount /
                          (userWord.correctCount + userWord.incorrectCount)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">상태</Typography>
                <Chip
                  label={WORD_STATUS_LABELS[userWord.status]}
                  color={WORD_STATUS_COLORS[userWord.status]}
                  size="small"
                />
              </Box>
              {userWord.nextReviewAt && (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">다음 복습</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(userWord.nextReviewAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* 액션 */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" gap={1}>
            <IconButton onClick={onToggleBookmark}>
              {userWord?.bookmarked ? (
                <StarIcon color="warning" />
              ) : (
                <StarBorderIcon />
              )}
            </IconButton>
            <IconButton onClick={onToggleFavorite}>
              {userWord?.favorite ? (
                <FavoriteIcon color="error" />
              ) : (
                <FavoriteBorderIcon />
              )}
            </IconButton>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" mr={1}>
              난이도
            </Typography>
            <ToggleButtonGroup
              value={userWord?.difficulty || DIFFICULTY.NORMAL}
              exclusive
              onChange={(e, val) => val && onSetDifficulty?.(val)}
              size="small"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (
                <ToggleButton key={key} value={key}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
