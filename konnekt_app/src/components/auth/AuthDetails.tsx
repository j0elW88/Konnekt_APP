import { onAuthStateChanged, signOut, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth } from "../../firebase";

export default function AuthDetails() {
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });

    return () => unsubscribe();
  }, []);

  const userSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {authUser ? (
        <>
          <Text style={styles.text}>{`Signed in as: ${authUser.email}`}</Text>
          <Button title="Sign Out" onPress={userSignOut} />
        </>
      ) : (
        <Text style={styles.text}>Signed Out</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  text: {
    fontSize: 18,
  },
});
