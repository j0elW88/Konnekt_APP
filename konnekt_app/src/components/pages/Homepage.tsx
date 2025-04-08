import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

type Club = {
  _id: string;
  name: string;
  color?: string;
};

type HomepageProps = {
  clubs: Club[];
};

export default function Homepage({ clubs }: HomepageProps) {
  const router = useRouter();

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
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
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
