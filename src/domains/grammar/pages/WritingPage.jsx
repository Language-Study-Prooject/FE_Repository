import { useState } from 'react'
import { Container, Box, Typography, Alert, Grid, Button } from '@mui/material'
import { Edit as EditIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useSettings } from '../../../contexts/SettingsContext'
import GrammarInput from '../components/GrammarInput'
import GrammarResult from '../components/GrammarResult'
import { grammarCheckService } from '../services/grammarService'

export default function WritingPage() {
  const { t } = useSettings()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleCheck = async (sentence, level) => {
    try {
      setLoading(true)
      setError(null)
      const response = await grammarCheckService.check(sentence, level)
      setResult(response)
    } catch (err) {
      console.error('Grammar check failed:', err)
      setError(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5, pt: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.3)',
            }}
          >
            <EditIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {t('grammar.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('grammar.subtitle')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} lg={result ? 6 : 12}>
          <GrammarInput onCheck={handleCheck} loading={loading} />
        </Grid>

        {/* Result Section */}
        {result && (
          <Grid item xs={12} lg={6}>
            <Box sx={{ position: 'sticky', top: 140 }}>
              <GrammarResult result={result} />

              {/* Reset Button */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleReset}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  {t('grammar.newSentence')}
                </Button>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  )
}
