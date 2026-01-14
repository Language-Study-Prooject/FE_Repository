import { useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
  History as HistoryIcon,
} from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import { GRAMMAR_LEVEL_COLORS, GRAMMAR_LEVEL_BG_COLORS } from '../constants/grammarConstants'

export default function SessionSidebar({
  sessions = [],
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  loading = false,
}) {
  const { t, isKorean } = useSettings()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)

  const handleDeleteClick = (session, e) => {
    e.stopPropagation()
    setSessionToDelete(session)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession?.(sessionToDelete.sessionId)
    }
    setDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return isKorean ? '방금 전' : 'Just now'
    if (diffMins < 60) return isKorean ? `${diffMins}분 전` : `${diffMins}m ago`
    if (diffHours < 24) return isKorean ? `${diffHours}시간 전` : `${diffHours}h ago`
    if (diffDays < 7) return isKorean ? `${diffDays}일 전` : `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getLevelLabel = (level) => {
    if (!level) return ''
    const labels = {
      BEGINNER: isKorean ? '초급' : 'Beginner',
      INTERMEDIATE: isKorean ? '중급' : 'Intermediate',
      ADVANCED: isKorean ? '고급' : 'Advanced',
    }
    return labels[level] || level
  }

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid',
        borderColor: 'divider',
        backgroundColor: '#fafafa',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewSession}
          sx={{
            py: 1.25,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            boxShadow: '0 4px 12px -2px rgba(5, 150, 105, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
            },
          }}
        >
          {isKorean ? '새 대화' : 'New Chat'}
        </Button>
      </Box>

      {/* Sessions List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <HistoryIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {isKorean ? '대화 기록' : 'History'}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={24} />
          </Box>
        ) : sessions.length === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <ChatIcon sx={{ fontSize: 40, color: '#d1d5db', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {isKorean ? '대화 기록이 없습니다' : 'No conversations yet'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 1, py: 0 }}>
            {sessions.map((session) => (
              <ListItem
                key={session.sessionId}
                disablePadding
                sx={{ mb: 0.5 }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleDeleteClick(session, e)}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '.MuiListItem-root:hover &': {
                        opacity: 1,
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={currentSessionId === session.sessionId}
                  onClick={() => onSelectSession?.(session.sessionId)}
                  sx={{
                    borderRadius: '10px',
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: '#ecfdf5',
                      '&:hover': {
                        backgroundColor: '#d1fae5',
                      },
                    },
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                          }}
                        >
                          {session.topic || (isKorean ? '대화' : 'Chat')}
                        </Typography>
                        {session.level && (
                          <Chip
                            label={getLevelLabel(session.level)}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              backgroundColor: GRAMMAR_LEVEL_BG_COLORS[session.level],
                              color: GRAMMAR_LEVEL_COLORS[session.level],
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 140,
                          }}
                        >
                          {session.lastMessage || `${session.messageCount} ${isKorean ? '메시지' : 'messages'}`}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatDate(session.updatedAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isKorean ? '대화 삭제' : 'Delete Conversation'}
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            {isKorean
              ? '이 대화를 삭제하시겠습니까? 삭제된 대화는 복구할 수 없습니다.'
              : 'Are you sure you want to delete this conversation? This action cannot be undone.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: '10px', textTransform: 'none' }}
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
