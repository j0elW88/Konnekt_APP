// src/hooks/useAuthRedirect.ts
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useNavigationContainerRef } from '@react-navigation/native';


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

