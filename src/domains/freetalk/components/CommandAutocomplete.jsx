import { useEffect, useState } from 'react'
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import { useThemeMode } from '../../../contexts/ThemeContext'
import { searchCommands } from '../types/chatCommandTypes'

/**
 * 채팅 명령어 자동완성 컴포넌트
 * 사용자가 "/"를 입력하면 사용 가능한 명령어 목록을 표시합니다.
 *
 * @param {Object} props
 * @param {string} props.input - 현재 입력 값
 * @param {function} props.onSelect - 명령어 선택 시 호출되는 콜백
 * @param {boolean} props.show - 표시 여부
 * @returns {JSX.Element|null}
 */
const CommandAutocomplete = ({ input, onSelect, show }) => {
  const { mode } = useThemeMode()
  const isDark = mode === 'dark'
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState([])

  // 입력값에 따라 명령어 필터링
  useEffect(() => {
    if (!show || !input.startsWith('/')) {
      setFilteredCommands([])
      setSelectedIndex(0)
      return
    }

    const commands = searchCommands(input)
    setFilteredCommands(commands)
    setSelectedIndex(0)
  }, [input, show])

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show || filteredCommands.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault()
        onSelect(filteredCommands[selectedIndex].command)
      } else if (e.key === 'Escape') {
        onSelect('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [show, filteredCommands, selectedIndex, onSelect])

  // 표시할 항목이 없으면 렌더링하지 않음
  if (!show || filteredCommands.length === 0) {
    return null
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        mb: 1,
        maxHeight: 300,
        overflow: 'auto',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e0e0e0',
        borderRadius: 2,
        zIndex: 1000,
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          사용 가능한 명령어 ({filteredCommands.length})
        </Typography>
      </Box>

      <List sx={{ p: 0 }}>
        {filteredCommands.map((cmd, index) => (
          <ListItem key={cmd.command} disablePadding>
            <ListItemButton
              selected={index === selectedIndex}
              onClick={() => onSelect(cmd.command)}
              sx={{
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(254, 229, 0, 0.3)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(250, 204, 21, 0.25)' : 'rgba(254, 229, 0, 0.4)',
                  },
                },
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        fontFamily: 'monospace',
                        color: isDark ? '#facc15' : '#f59e0b',
                      }}
                    >
                      {cmd.command}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cmd.usage}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {cmd.description}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          p: 1,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f5f5f5',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e0e0e0',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          화살표로 선택, Enter로 입력, Esc로 닫기
        </Typography>
      </Box>
    </Paper>
  )
}

export default CommandAutocomplete
