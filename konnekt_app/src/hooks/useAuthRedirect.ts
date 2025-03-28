import { useRouter } from "expo-router";
import { useEffect } from "react";

export const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!global.authUser) {
      router.replace("/");
    }
  }, []);
};
