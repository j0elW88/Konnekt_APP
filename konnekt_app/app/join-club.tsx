import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { IP_ADDRESS } from '../src/components/config/globalvariables';
import useAuthRedirect from '../src/hooks/useAuthRedirect';

export default function JoinClubScreen() {
  useAuthRedirect();
  const [code, setCode] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) return Alert.alert("Enter a valid code");

    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/join-code/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: global.authUser?._id }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Request sent or joined if public.");
      } else {
        Alert.alert("Error", data.error || "Invalid code");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not join club");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Club with a Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Join Code"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Join Club</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#f4f6fc',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4c87df',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
