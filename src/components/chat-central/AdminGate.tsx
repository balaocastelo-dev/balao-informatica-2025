import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!ok) {
      navigate('/admin', { replace: true });
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) return null;

  return <>{children}</>;
}

