import {Box, Container, Link, Typography} from '@mui/material'
import {useTranslation} from '../../../contexts/SettingsContext'

const Footer = () => {
    const {t} = useTranslation()

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
                        flexDirection: {xs: 'column', sm: 'row'},
                        justifyContent: 'space-between',
                        alignItems: {xs: 'center', sm: 'flex-start'},
                        gap: 2,
                    }}
                >
                    {/* Copyright */}
                    <Typography variant="body2" color="text.secondary">
                        {t('footer.copyright')}
                    </Typography>

                    {/* Links */}
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
                            {t('footer.terms')}
                        </Link>
                        <Link
                            href="/privacy"
                            color="text.secondary"
                            underline="hover"
                            variant="body2"
                        >
                            {t('footer.privacy')}
                        </Link>
                        <Link
                            href="/contact"
                            color="text.secondary"
                            underline="hover"
                            variant="body2"
                        >
                            {t('footer.contact')}
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

export default Footer
