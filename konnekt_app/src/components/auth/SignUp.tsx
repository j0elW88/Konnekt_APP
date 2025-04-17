import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from 'expo-router';
import { IP_ADDRESS } from "../config/globalvariables";

const API_URL = `http://${IP_ADDRESS}:5000/api/auth`;

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    setError(null);
  }, []);

  const signUp = async () => {
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const full_name = `${firstName} ${lastName}`.trim();

      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, full_name }),
      });

      const data = await response.json();
      if (response.ok) {
        global.authUser = data.user;
        console.log("User signed up:", data.user);
        router.replace("/(tabs)/homepage");
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
      <Image
        source={require('../../../assets/images/knktMainLogo.png')}
        style={styles.logo}
        resizeMode="contain"/>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Unique Username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setError(null);
        }}
        placeholderTextColor="#aaa"
      />

    <Text style={styles.label}>Name</Text>
      <View style={styles.nameRow}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="First Name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            setError(null);
          }}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Last Name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            setError(null);
          }}
          placeholderTextColor="#aaa"
        />
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Your Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
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

      <TouchableOpacity style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.newAccButton} onPress={() => router.replace('/')}>
      <Text style={styles.newAccButtonText}>Go Back</Text>
      </TouchableOpacity>



    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "red",
    marginTop: 10,
    marginBottom: 10,
    textAlign: "center",
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
  logo: {
    width: 80, // Adjust size as needed
    height: 80,
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#F9F9F9",
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    width: '48%',
  },
  button: {
    backgroundColor: "#4c87df",
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
  newAccButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 5,
    borderColor: "#4c87df",
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 8,
  },
  newAccButtonText: {
    color: "#4c87df",
    fontSize: 16,
    fontWeight: "bold",
  },
});
