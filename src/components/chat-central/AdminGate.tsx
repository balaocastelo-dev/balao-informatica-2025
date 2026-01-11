import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const isGoogleAdmin = user?.email === 'balaocastelo@gmail.com';
    const isLegacyAdmin = sessionStorage.getItem('admin_authenticated') === 'true';

    if (!isGoogleAdmin && !isLegacyAdmin) {
      navigate('/admin', { replace: true });
      return;
    }
    setReady(true);
  }, [navigate, user, isLoading]);

  if (isLoading || !ready) return null;

  return <>{children}</>;
}

