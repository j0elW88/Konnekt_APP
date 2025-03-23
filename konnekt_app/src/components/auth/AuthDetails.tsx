import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function AuthDetails() {
  const [authUser, setAuthUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (global.authUser) {
        setAuthUser(global.authUser);
      } else {
        setAuthUser(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const userSignOut = () => {
    global.authUser = null;
    setAuthUser(null);
    console.log("User signed out");
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
