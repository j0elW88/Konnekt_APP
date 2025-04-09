import { View, StyleSheet, Button } from "react-native";
import SignUp from "../src/components/auth/SignUp";
import AuthDetails from "../src/components/auth/AuthDetails";
import { useRouter } from "expo-router";

export default function SignUpScreen() {
  const router = useRouter();

  const handleBypassLogin = () => {
    router.replace("/(tabs)/homepage");
  };

  return (
    <View style={styles.container}>
      <SignUp />
      <AuthDetails />
      <Button title="Skip for now" onPress={handleBypassLogin} />
    </View>
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
