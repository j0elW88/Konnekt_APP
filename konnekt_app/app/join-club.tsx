import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { IP_ADDRESS } from '../src/components/config/globalvariables';
import useAuthRedirect from '../src/hooks/useAuthRedirect';

export default function JoinClubScreen() {
  useAuthRedirect();
  const [code, setCode] = useState('');
  const [confirmationMsg, setConfirmationMsg] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) return Alert.alert("Enter a valid code");

    const userId = global.authUser?._id;
    console.log("🚀 Join code submitted:", code, "User ID:", userId);

    if (!userId) {
      Alert.alert("Error", "User not signed in.");
      return;
    }

    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/join-code/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      console.log("📦 Join response:", JSON.stringify(data, null, 2));

      if (response.ok) {
        const message = data.message?.toLowerCase().includes("request")
          ? "✅ Join request sent successfully!"
          : "✅ Joined club successfully!";
        setConfirmationMsg(message);
        setCode("");

        setTimeout(() => setConfirmationMsg(""), 3000); // clear after 3s
      } else {
        if (data.error === "Request already pending") {
          Alert.alert("Pending Request", "You've already requested to join this club. Please wait for approval.");
        } else if (data.error === "Already a member") {
          Alert.alert("Already Joined", "You're already a member of this club.");
        } else {
          Alert.alert("Error", data.error || "Invalid code or user.");
        }
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      Alert.alert("Error", "Could not join club");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join a Club with a Code</Text>

      {confirmationMsg !== '' && (
        <View style={styles.confirmationBanner}>
          <Text style={styles.confirmationText}>{confirmationMsg}</Text>
        </View>
      )}

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
  confirmationBanner: {
    backgroundColor: '#d1e7dd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  confirmationText: {
    color: '#0f5132',
    fontWeight: '600',
    textAlign: 'center',
  },
});
