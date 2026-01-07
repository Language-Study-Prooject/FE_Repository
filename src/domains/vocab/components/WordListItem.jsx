import {
  Box,
  Typography,
  IconButton,
  Chip,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material'
import {
  VolumeUp as VolumeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material'
import {
  LEVEL_LABELS,
  LEVEL_COLORS,
  CATEGORY_LABELS,
  WORD_STATUS_LABELS,
  WORD_STATUS_COLORS,
} from '../constants/vocabConstants'

export default function WordListItem({
  word,
  userWord,
  onPlayTTS,
  onToggleBookmark,
  onClick,
  isPlayingTTS,
}) {
  const status = userWord?.status
  const bookmarked = userWord?.bookmarked

  return (
    <ListItem
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" fontWeight={600}>
              {word.english}
            </Typography>
            <Chip
              label={LEVEL_LABELS[word.level]}
              size="small"
              color={LEVEL_COLORS[word.level]}
              sx={{ height: 20, fontSize: 11 }}
            />
            <Chip
              label={CATEGORY_LABELS[word.category]}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: 11 }}
            />
          </Box>
        }
        secondary={
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Typography variant="body2" color="text.secondary">
              {word.korean}
            </Typography>
            {status && (
              <Chip
                label={WORD_STATUS_LABELS[status]}
                size="small"
                color={WORD_STATUS_COLORS[status]}
                sx={{ height: 18, fontSize: 10 }}
              />
            )}
          </Box>
        }
      />

      <Box display="flex" alignItems="center" gap={0.5}>
        <Tooltip title="발음 듣기">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onPlayTTS?.()
            }}
            disabled={isPlayingTTS}
          >
            <VolumeIcon
              fontSize="small"
              color={isPlayingTTS ? 'primary' : 'action'}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={bookmarked ? '북마크 해제' : '북마크'}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark?.()
            }}
          >
            {bookmarked ? (
              <StarIcon fontSize="small" color="warning" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </ListItem>
  )
}
