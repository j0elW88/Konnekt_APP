import { View, StyleSheet } from "react-native";
import SignUp from "../src/components/auth/SignUp";
import AuthDetails from "../src/components/auth/AuthDetails";
 
export default function SignUpScreen() {

  return (
    <View style={styles.container}>
      <SignUp />      
      <AuthDetails />  
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