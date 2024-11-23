import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface WithAuthProps {
  requiredRole?: 'patient' | 'therapist' | 'admin';
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole }: WithAuthProps = {}
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
      if (!isLoading && (!isAuthenticated || (requiredRole && user?.role !== requiredRole))) {
        router.push('/login');
      }
    }, [isAuthenticated, user, router, isLoading]);

    if (isLoading) {
      return null; // hoặc loading spinner
    }

    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}