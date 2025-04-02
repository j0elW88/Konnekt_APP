// src/hooks/useAuthRedirect.ts
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useNavigationContainerRef } from '@react-navigation/native';

export default function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!global.authUser && router.canGoBack !== undefined) {
      const timeout = setTimeout(() => {
        router.replace('/');
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [router]);
}
