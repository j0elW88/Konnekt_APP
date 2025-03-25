import { View, StyleSheet } from "react-native";
//import { useRouter } from "expo-router"; // Expo Router Navigation
import SignIn from "../../src/components/auth/SignIn";
import AuthDetails from "../../src/components/auth/AuthDetails";



export default function HomeScreen() {
  //const router = useRouter();

  return (
    <View style={styles.container}>
      <SignIn />
      <AuthDetails />       
    </View>
    //New Components Declared Above
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
