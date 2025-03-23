import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";

const API_URL = "http://(PUT YOUR IP ADDRESS HERE):5000/api/auth";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const signUp = async () => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        global.authUser = data.user; // Simulate logged-in user
        setError(null);
        console.log("User signed up:", data.user);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Sign Up" onPress={signUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderBottomWidth: 1, marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
});
