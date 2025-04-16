import { View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router"; // Expo Router Navigation
import ProfileHomeScreen from "../../src/components/profile/profilepage";
import useAuthRedirect from "@/src/hooks/useAuthRedirect";

export default function ProfileScreen() {
  useAuthRedirect();
  const router = useRouter(); // Router Hook to Navigate

  return (
    <View style={styles.container}>
      <ProfileHomeScreen />       

    </View>
    // New Components Declared Above
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A1B5D8",
  },
});