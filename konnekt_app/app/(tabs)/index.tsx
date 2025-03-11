import { View, StyleSheet, Button } from "react-native";
import { useRouter } from "expo-router"; // Expo Router Navigation
import SignIn from "../../src/components/auth/SignIn";
import SignUp from "../../src/components/auth/SignUp";
import AuthDetails from "../../src/components/auth/AuthDetails";


export default function HomeScreen() {
  const router = useRouter(); // Router Hook to Navigate

  return (
    <View style={styles.container}>
      <SignIn />
      <SignUp />
      <AuthDetails />       

    </View>
    // New Components Declared Above
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
