import {Box, Paper, Typography} from '@mui/material';

export default function AuthLayout({children}) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)',
                p: 2,
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    width: '100%',
                    maxWidth: 440,
                    p: 4,
                    borderRadius: 4,
                }}
            >
                <Box sx={{textAlign: 'center', mb: 4}}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <Typography sx={{fontSize: '1.5rem', fontWeight: 800, color: 'white'}}>
                            AI
                        </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                        AI 언어 학습
                    </Typography>
                </Box>
                {children}
            </Paper>
        </Box>
    );
}
