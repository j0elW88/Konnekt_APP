// src/hooks/useAuthRedirect.ts
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!global.authUser) {
        router.replace('/');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);
}
