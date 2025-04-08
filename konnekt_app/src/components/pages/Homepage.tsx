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
<<<<<<< HEAD
  color?: string;
};
=======
}
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)

interface Props {
  clubs: Club[];
}

export default function Homepage({ clubs }: Props) {
  const router = useRouter();

  //Change global.authUser?.email to .name when we add username, this prob can be removed entirely later
  return (
<<<<<<< HEAD
    <View style={styles.container}>
      <Text style={styles.heading}>Your Clubs</Text>

      {clubs.map((club) => (
        <TouchableOpacity
          key={club._id}
          style={[styles.clubButton, { backgroundColor: club.color || '#fff' }]}
          onPress={() => router.push(`/club/${club._id}`)}
        >
          <Text style={styles.clubText}>{club.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.clubButton, { backgroundColor: '#4c87df' }]}
        onPress={() => router.push('/join-club')}
      >
        <Text style={styles.createButtonText}>Join a Club</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-club')}
      >
        <Text style={styles.createButtonText}>+ Create New Club</Text>
      </TouchableOpacity>
    </View>
=======
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome {global.authUser?.username}</Text> 
      <Text style={styles.subheader}>Organizations</Text>

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
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)
  );
}

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    padding: 20,
    backgroundColor: "#f4f6fc",
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  clubButton: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  clubText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#4c87df",
    padding: 15,
    borderRadius: 8,
=======
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#A1B5D8",
    flexGrow: 1,
>>>>>>> parent of 43d71eac (Beginning Implementation of Create Club Page)
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
