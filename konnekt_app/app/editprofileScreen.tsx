import { View, StyleSheet } from "react-native";
import ProfileEditScreen from "../src/components/profile/editprofile";
 
export default function SignUpScreen() {

  return (
    <View style={styles.container}>
      <ProfileEditScreen />      
       
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