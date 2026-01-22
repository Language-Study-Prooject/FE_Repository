import {Box, Button, Card, CardContent, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';

export default function DashboardPage() {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{p: 4, maxWidth: 600, mx: 'auto'}}>
            <Typography variant="h4" fontWeight={700} gutterBottom>🎉 로그인 성공!</Typography>
            <Card sx={{mb: 3}}>
                <CardContent>
                    <Typography><strong>이메일:</strong> {user?.email}</Typography>
                    <Typography variant="body2" color="text.secondary">JWT 토큰이 자동으로 관리되고 있습니다.</Typography>
                </CardContent>
            </Card>
            <Button variant="contained" color="error" onClick={handleLogout}>로그아웃</Button>
        </Box>
    );
}
