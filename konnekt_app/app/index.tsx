import { View, StyleSheet } from "react-native";
//import { useRouter } from "expo-router"; // Expo Router Navigation
import SignIn from "../src/components/auth/SignIn";
import AuthDetails from "../src/components/auth/AuthDetails";
import { useEffect } from "react";
import { useRouter } from 'expo-router';

const router = useRouter();


export default function HomeScreen() {
  
  useEffect(() => {
    if(global.authUser) {
      router.replace("/(tabs)/homepage");
  }
}, []);

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
