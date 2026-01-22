import {useNavigate} from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import SignupForm from '../../domains/auth/components/SignupForm';

export default function SignUpPage() {
    const navigate = useNavigate();
    return (
        <AuthLayout>
            <SignupForm onSwitchToLogin={() => navigate('/login')}/>
        </AuthLayout>
    );
}
