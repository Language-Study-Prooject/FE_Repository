import { Box, Typography, Link, Container, Divider } from '@mui/material'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 2,
          }}
        >
          {/* 저작권 */}
          <Typography variant="body2" color="text.secondary">
            © 2026 AI Language Learning. All rights reserved.
          </Typography>

          {/* 링크 */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <Link
              href="/terms"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/contact"
              color="text.secondary"
              underline="hover"
              variant="body2"
            >
              고객센터
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
