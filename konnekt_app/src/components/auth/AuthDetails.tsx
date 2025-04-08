import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function AuthDetails() {
  const [authUser, setAuthUser] = useState(global.authUser || null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (global.authUser?.email !== authUser?.email) {
        setAuthUser(global.authUser);
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [authUser]);

  const handleSignOut = () => {
    global.authUser = null;
    setAuthUser(null);
    console.log("Signed out");
  };

  return (
    <View style={styles.container}>
      {authUser ? (
        <>
          <Text>{`Signed in as: ${authUser.username}`}</Text>
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <Text>Signed Out</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  //This is just a test display
});
