import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { IP_ADDRESS } from "../config/globalvariables";

const API_URL = `http://${IP_ADDRESS}:5000/api/auth`;  // change ip address in config global

export default function SignUp() {
  const router = useRouter();
  console.log("signUp function called");

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      setError(null); //This clears screen of errors when reloading screen
    }, []);

  const signUp = async () => {

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
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
    <View style={styles.menu}>  {/*email and password square*/}
      <Text style={styles.label}>Name</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Full Name" 
        value={name} 
        onChangeText={(text) => {
          setName(text);
          setError(null); /*clears error while new input being added*/
        }}
        placeholderTextColor="#aaa" />

      <Text style={styles.label}>Email</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Your Email" 
        value={email} 
        onChangeText={(text) => {
          setEmail(text);
          setError(null); /*clears error while new input being added*/
        }}
        placeholderTextColor="#aaa" />

      <Text style={styles.label}>Password</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter Your Password" 
        value={password} 
        onChangeText={(text) => {
          setPassword(text);
          setError(null); /*clears error while new input being added*/
        }}
        placeholderTextColor="#aaa" 
        secureTextEntry />


      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={signUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    
      {/*Go Back Button*/}
      <TouchableOpacity style={styles.newAccButton} onPress={() => router.back()}>
        <Text style={styles.newAccButtonText}>Go Back</Text>
      </TouchableOpacity>
    
    
    </View>
    
    
  );
}

const styles = StyleSheet.create({ 
  error: { 
    color: "red", 
    marginTop: 10,
    marginBottom: 10 ,
    textAlign: 'center',
  },
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
  },
  label: {
      fontSize: 14,
      color: '#555',
      marginBottom: 5,
  },
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
  buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
  },
  forgotPassword: {
      textAlign: 'center',
      color: '#555',
      textDecorationLine: 'underline',
      marginBottom: 8,
  },
  newAccButton: {
      backgroundColor: '#fff', // Muted lavender for the button
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
