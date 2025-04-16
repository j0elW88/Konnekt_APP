import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { IP_ADDRESS } from "../config/globalvariables";
const API_URL = `http://${IP_ADDRESS}:5000/api/auth`;

export default function ProfileEditScreen() {
  const router = useRouter();
  const email = global.authUser?.email;
  const [full_name, setNewName] = useState(global.authUser?.full_name);
  const [username, setNewUsername] = useState(global.authUser?.username);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      setError(null);
    }, []);

  const editProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/editprofile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, full_name }),
      });

      const data = await response.json();
      if (response.ok) {
        global.authUser = data.user;
        setError(null);
        console.log("Profile updated:", data.user);
        router.replace("/(tabs)/profiletab");

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
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.menu}>
            <Text style={styles.label}>Username</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholderTextColor="#aaa"
                    onChangeText={setNewUsername}
                    value={username}
                    />
            <Text style={styles.label}>Name</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholderTextColor="#aaa" 
                    onChangeText={setNewName}
                    value={full_name}
                    />
            <TouchableOpacity style={styles.button} onPress={() => {editProfile();}}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.back_button} onPress={() => router.replace("/(tabs)/profiletab")} >
                    <Text style={styles.buttonText}>Go Back</Text>
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
      width: '200%',
      maxWidth: 350,
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      shadowColor: '#000',
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
  back_button: {
    backgroundColor: '#ff0000', 
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
  });