import { Box, Typography, IconButton, Chip } from '@mui/material'
import { VolumeUp as VolumeIcon } from '@mui/icons-material'
import { LEVEL_LABELS, LEVEL_COLORS, CATEGORY_LABELS } from '../constants/vocabConstants'

export default function FlashCard({ word, isFlipped, onFlip, onPlayTTS, isPlayingTTS }) {
  if (!word) return null

  return (
    <Box
      onClick={onFlip}
      sx={{
        perspective: '1000px',
        width: '100%',
        maxWidth: 400,
        height: 280,
        cursor: 'pointer',
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 - 영어 */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper',
            borderRadius: 3,
            boxShadow: 3,
            p: 3,
          }}
        >
          <Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>
            {word.english}
          </Typography>

          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onPlayTTS?.()
            }}
            disabled={isPlayingTTS}
            sx={{ mb: 2 }}
          >
            <VolumeIcon color={isPlayingTTS ? 'primary' : 'action'} fontSize="large" />
          </IconButton>

          {word.example && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{
                fontStyle: 'italic',
                maxWidth: '90%',
              }}
            >
              "{word.example}"
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ position: 'absolute', bottom: 16 }}
          >
            탭하여 뜻 보기
          </Typography>
        </Box>

        {/* 뒷면 - 한국어 */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 3,
            boxShadow: 3,
            p: 3,
          }}
        >
          <Typography variant="h3" fontWeight={700} textAlign="center" mb={3}>
            {word.korean}
          </Typography>

          <Box display="flex" gap={1}>
            <Chip
              label={LEVEL_LABELS[word.level]}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              }}
            />
            <Chip
              label={CATEGORY_LABELS[word.category]}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              }}
            />
          </Box>

          <Typography
            variant="caption"
            sx={{ position: 'absolute', bottom: 16, opacity: 0.8 }}
          >
            탭하여 영어 보기
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
