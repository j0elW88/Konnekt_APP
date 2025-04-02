import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { Image } from 'expo-image'
import { IP_ADDRESS } from "../config/globalvariables";

const API_URL = `http://${IP_ADDRESS}:5000/api/auth`;

export default function SignIn() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, []);

  const signIn = async () => {
    try {
      const response = await fetch(`${API_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (response.ok) {
        global.authUser = data.user;
        setError(null);
        console.log("User signed in:", data.user);
        router.replace("/(tabs)/homepage" as any);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  return (
    <View style={styles.menu}>
      <Text style={styles.label}>Email or Username</Text>
      <TextInput 
        style={styles.input}
        placeholder="Enter Email or Username"
        value={identifier}
        onChangeText={(text) => {
          setIdentifier(text);
          setError(null);
        }}
        placeholderTextColor="#aaa"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Your Password" 
        value={password} 
        onChangeText={(text) => {
          setPassword(text);
          setError(null);
        }}
        placeholderTextColor="#aaa" 
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.label2}>---- or ---</Text>

      <TouchableOpacity style={styles.newAccButton} onPress={() => router.replace('/signupScreen')}>
        <Text style={styles.newAccButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  error: { color: "red", marginTop: 5, marginBottom: 10, textAlign: 'center' },
  menu: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 10,
  },
  label: { fontSize: 14, color: '#555', marginBottom: 5 },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#F9F9F9',
  },
  button: {
    backgroundColor: '#4c87df',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  label2: { textAlign: 'center', color: '#555', marginBottom: 8 },
  newAccButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 5,
    borderColor: '#4c87df',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  newAccButtonText: {
    color: '#4c87df',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
