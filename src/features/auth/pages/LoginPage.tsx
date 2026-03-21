import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '@/common/stores/authStore';
import { Button } from '@/common/components';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setToken = useAuthStore((s) => s.setToken);

  const from = (location.state as LocationState)?.from?.pathname ?? '/';

  const handleDevLogin = () => {
    setToken('dev-token');
    navigate(from, { replace: true });
  };

  return (
    <div>
      <h1>Login</h1>
      <Button onClick={handleDevLogin}>Dev Login</Button>
    </div>
  );
}
