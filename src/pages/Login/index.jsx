import {useNavigate} from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import LoginForm from '../../domains/auth/components/LoginForm';

export default function LoginPage() {
    const navigate = useNavigate();
    return (
        <AuthLayout>
            <LoginForm onSwitchToSignUp={() => navigate('/signup')}/>
        </AuthLayout>
    );
}
