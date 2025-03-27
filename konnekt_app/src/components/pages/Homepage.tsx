import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

interface Club {
  id: string;
  name: string;
}

interface Props {
  clubs: Club[];
}

export default function Homepage({ clubs }: Props) {
  const router = useRouter();

  //Change global.authUser?.email to .name when we add username, this prob can be removed entirely later
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome {global.authUser?.email}</Text> 
      <Text style={styles.subheader}>Your Clubs</Text>

      {clubs.length === 0 ? (
        <Text style={styles.noClubsText}>You’re not in any clubs yet.</Text>
      ) : (
        clubs.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.button}
            onPress={() => router.push(`/club/${club.id}` as any)}
          >
            <Text style={styles.buttonText}>{club.name}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#A1B5D8",
    flexGrow: 1,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subheader: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#444",
  },
  noClubsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "#4c87df",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
