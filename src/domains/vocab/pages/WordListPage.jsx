import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  List,
  CircularProgress,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import WordListItem from '../components/WordListItem'
import WordDetailModal from '../components/WordDetailModal'
import { wordService, userWordService, voiceService } from '../services/vocabService'
import {
  LEVELS,
  LEVEL_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  WORD_STATUS,
  WORD_STATUS_LABELS,
  VOICE_TYPES,
} from '../constants/vocabConstants'

const TEMP_USER_ID = import.meta.env.VITE_TEMP_USER_ID || 'user1'
const PAGE_SIZE = 20

// 디바운스 훅
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export default function WordListPage() {
  const navigate = useNavigate()
  const observerRef = useRef(null)
  const loadMoreRef = useRef(null)

  // 검색 & 필터
  const [searchText, setSearchText] = useState('')
  const [levelFilter, setLevelFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [statusFilter, setStatusFilter] = useState(null)
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false)

  // 필터 메뉴
  const [categoryAnchor, setCategoryAnchor] = useState(null)
  const [statusAnchor, setStatusAnchor] = useState(null)

  // 단어 데이터
  const [words, setWords] = useState([])
  const [userWords, setUserWords] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  // 상세 모달
  const [selectedWord, setSelectedWord] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // TTS
  const [playingWordId, setPlayingWordId] = useState(null)

  const debouncedSearch = useDebounce(searchText, 300)

  // 단어 목록 조회
  const fetchWords = useCallback(async (pageNum, reset = false) => {
    if (loading) return

    try {
      setLoading(true)
      setError(null)

      const params = {
        page: pageNum,
        size: PAGE_SIZE,
      }

      if (debouncedSearch) params.keyword = debouncedSearch
      if (levelFilter) params.level = levelFilter
      if (categoryFilter) params.category = categoryFilter

      const response = await wordService.getWords(params)
      const newWords = response?.words || []

      // 사용자 단어 정보 조회
      const wordIds = newWords.map(w => w.wordId)
      if (wordIds.length > 0) {
        try {
          const userWordResponse = await userWordService.getUserWords(TEMP_USER_ID, {
            wordIds: wordIds.join(','),
          })
          const userWordMap = {}
          ;(userWordResponse?.userWords || []).forEach(uw => {
            userWordMap[uw.wordId] = uw
          })
          setUserWords(prev => reset ? userWordMap : { ...prev, ...userWordMap })
        } catch (err) {
          console.error('User words fetch error:', err)
        }
      }

      // 필터링 (bookmarked, status는 클라이언트에서 처리)
      let filteredWords = newWords

      setWords(prev => reset ? filteredWords : [...prev, ...filteredWords])
      setHasMore(newWords.length === PAGE_SIZE)
      setPage(pageNum)
    } catch (err) {
      console.error('Fetch words error:', err)
      setError('단어 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [loading, debouncedSearch, levelFilter, categoryFilter])

  // 필터 변경시 리셋
  useEffect(() => {
    setWords([])
    setUserWords({})
    setPage(0)
    setHasMore(true)
    fetchWords(0, true)
  }, [debouncedSearch, levelFilter, categoryFilter])

  // 무한 스크롤
  useEffect(() => {
    if (loading || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchWords(page + 1)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, page, fetchWords])

  // 클라이언트 필터링 (북마크, 상태)
  const filteredWords = words.filter(word => {
    const userWord = userWords[word.wordId]

    if (bookmarkedOnly && !userWord?.bookmarked) return false
    if (statusFilter && userWord?.status !== statusFilter) return false

    return true
  })

  // TTS 재생
  const handlePlayTTS = async (word, voice = VOICE_TYPES.FEMALE) => {
    if (playingWordId) return

    try {
      setPlayingWordId(word.wordId)
      const response = await voiceService.synthesize({
        text: word.english,
        voiceType: voice,
      })

      if (response?.audioUrl) {
        const audio = new Audio(response.audioUrl)
        audio.onended = () => setPlayingWordId(null)
        audio.onerror = () => setPlayingWordId(null)
        await audio.play()
      } else {
        setPlayingWordId(null)
      }
    } catch (err) {
      console.error('TTS error:', err)
      setPlayingWordId(null)
    }
  }

  // 북마크 토글
  const handleToggleBookmark = async (word) => {
    const userWord = userWords[word.wordId]
    const newBookmarked = !userWord?.bookmarked

    try {
      await userWordService.updateUserWord(TEMP_USER_ID, word.wordId, {
        bookmarked: newBookmarked,
      })

      setUserWords(prev => ({
        ...prev,
        [word.wordId]: {
          ...prev[word.wordId],
          bookmarked: newBookmarked,
        },
      }))
    } catch (err) {
      console.error('Bookmark toggle error:', err)
    }
  }

  // 즐겨찾기 토글
  const handleToggleFavorite = async (word) => {
    const userWord = userWords[word.wordId]
    const newFavorite = !userWord?.favorite

    try {
      await userWordService.updateUserWord(TEMP_USER_ID, word.wordId, {
        favorite: newFavorite,
      })

      setUserWords(prev => ({
        ...prev,
        [word.wordId]: {
          ...prev[word.wordId],
          favorite: newFavorite,
        },
      }))
    } catch (err) {
      console.error('Favorite toggle error:', err)
    }
  }

  // 난이도 설정
  const handleSetDifficulty = async (word, difficulty) => {
    try {
      await userWordService.updateUserWord(TEMP_USER_ID, word.wordId, {
        difficulty,
      })

      setUserWords(prev => ({
        ...prev,
        [word.wordId]: {
          ...prev[word.wordId],
          difficulty,
        },
      }))
    } catch (err) {
      console.error('Set difficulty error:', err)
    }
  }

  // 단어 상세 열기
  const handleWordClick = (word) => {
    setSelectedWord(word)
    setModalOpen(true)
  }

  // 검색 초기화
  const handleClearSearch = () => {
    setSearchText('')
  }

  // 필터 초기화
  const handleClearFilters = () => {
    setLevelFilter(null)
    setCategoryFilter(null)
    setStatusFilter(null)
    setBookmarkedOnly(false)
  }

  const hasActiveFilters = levelFilter || categoryFilter || statusFilter || bookmarkedOnly

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      {/* 헤더 */}
      <Box display="flex" alignItems="center" gap={1} py={2}>
        <IconButton onClick={() => navigate('/vocab')}>
          <BackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          단어장
        </Typography>
      </Box>

      {/* 검색 */}
      <TextField
        fullWidth
        placeholder="단어 검색..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchText && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* 필터 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {/* 레벨 필터 */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
            레벨
          </Typography>
          <ToggleButtonGroup
            value={levelFilter}
            exclusive
            onChange={(e, val) => setLevelFilter(val)}
            size="small"
            fullWidth
          >
            <ToggleButton value={null}>전체</ToggleButton>
            {Object.entries(LEVEL_LABELS).map(([key, label]) => (
              <ToggleButton key={key} value={key}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* 추가 필터 */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {/* 카테고리 */}
          <Chip
            label={categoryFilter ? CATEGORY_LABELS[categoryFilter] : '카테고리'}
            onClick={(e) => setCategoryAnchor(e.currentTarget)}
            onDelete={categoryFilter ? () => setCategoryFilter(null) : undefined}
            variant={categoryFilter ? 'filled' : 'outlined'}
            size="small"
          />
          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={() => setCategoryAnchor(null)}
          >
            <MenuItem onClick={() => { setCategoryFilter(null); setCategoryAnchor(null) }}>
              전체
            </MenuItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <MenuItem
                key={key}
                onClick={() => { setCategoryFilter(key); setCategoryAnchor(null) }}
                selected={categoryFilter === key}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>

          {/* 학습 상태 */}
          <Chip
            label={statusFilter ? WORD_STATUS_LABELS[statusFilter] : '학습 상태'}
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            onDelete={statusFilter ? () => setStatusFilter(null) : undefined}
            variant={statusFilter ? 'filled' : 'outlined'}
            size="small"
          />
          <Menu
            anchorEl={statusAnchor}
            open={Boolean(statusAnchor)}
            onClose={() => setStatusAnchor(null)}
          >
            <MenuItem onClick={() => { setStatusFilter(null); setStatusAnchor(null) }}>
              전체
            </MenuItem>
            {Object.entries(WORD_STATUS_LABELS).map(([key, label]) => (
              <MenuItem
                key={key}
                onClick={() => { setStatusFilter(key); setStatusAnchor(null) }}
                selected={statusFilter === key}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>

          {/* 북마크 */}
          <Chip
            icon={<StarIcon fontSize="small" />}
            label="북마크"
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            color={bookmarkedOnly ? 'warning' : 'default'}
            variant={bookmarkedOnly ? 'filled' : 'outlined'}
            size="small"
          />

          {/* 필터 초기화 */}
          {hasActiveFilters && (
            <Chip
              label="초기화"
              onClick={handleClearFilters}
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>
      </Paper>

      {/* 결과 카운트 */}
      <Typography variant="body2" color="text.secondary" mb={1}>
        {filteredWords.length}개의 단어
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 단어 목록 */}
      <List disablePadding>
        {filteredWords.map((word) => (
          <WordListItem
            key={word.wordId}
            word={word}
            userWord={userWords[word.wordId]}
            onPlayTTS={() => handlePlayTTS(word)}
            onToggleBookmark={() => handleToggleBookmark(word)}
            onClick={() => handleWordClick(word)}
            isPlayingTTS={playingWordId === word.wordId}
          />
        ))}
      </List>

      {/* 로딩 & 더보기 트리거 */}
      <Box ref={loadMoreRef} display="flex" justifyContent="center" py={3}>
        {loading && <CircularProgress size={32} />}
        {!loading && !hasMore && filteredWords.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            모든 단어를 불러왔습니다
          </Typography>
        )}
        {!loading && filteredWords.length === 0 && !error && (
          <Typography variant="body2" color="text.secondary">
            검색 결과가 없습니다
          </Typography>
        )}
      </Box>

      {/* 상세 모달 */}
      <WordDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        word={selectedWord}
        userWord={selectedWord ? userWords[selectedWord.wordId] : null}
        onPlayTTS={(voice) => selectedWord && handlePlayTTS(selectedWord, voice)}
        onToggleBookmark={() => selectedWord && handleToggleBookmark(selectedWord)}
        onToggleFavorite={() => selectedWord && handleToggleFavorite(selectedWord)}
        onSetDifficulty={(diff) => selectedWord && handleSetDifficulty(selectedWord, diff)}
        isPlayingTTS={playingWordId === selectedWord?.wordId}
      />
    </Container>
  )
}
