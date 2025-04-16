import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

export default function ProfileHomeScreen() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(global.authUser || null);

  const handleSignOut = () => {
    global.authUser = null;
    setAuthUser(null);
    console.log("Signed out");
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.menu}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          readOnly
          placeholder={global.authUser?.email}
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          readOnly
          placeholder={global.authUser?.username}
          placeholderTextColor="#aaa"
        />
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          readOnly
          placeholder={global.authUser?.full_name}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/editprofile")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.back_button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingVertical: 10,
  },
  menu: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A1B5D8",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  button: {
    backgroundColor: "#4c87df",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  back_button: {
    backgroundColor: "#ff0000",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
