import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { IP_ADDRESS } from '../../src/components/config/globalvariables';
import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out



type Club = {
  _id: string;
  name: string;
  description: string;
};

export default function DiscoverClubs() {
  useAuthRedirect();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<string[]>([]);

const fetchClubs = async () => {
  try {
    const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/public`);
    const data = await res.json();
    
    if (Array.isArray(data)) {
      setClubs(data);
    } else {
      console.warn("Expected array of clubs, got:", data);
      setClubs([]); // prevent crash if malformed
    }
  } catch (err) {
    console.error('Failed to load public clubs:', err);
    setClubs([]); // prevent crash if network error
  }
};

  const fetchUserClubs = async () => {
    if (!global.authUser || !global.authUser._id) return;
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/user/${global.authUser._id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJoinedClubs(data.map((club: Club) => club._id));
      }
    } catch (err) {
      console.error('Failed to load user clubs:', err);
    }
  };

  const joinClub = async (clubId: string) => {
    if (!global.authUser || !global.authUser._id) {
      Alert.alert("Error", "You must be signed in to join a club.");
      return;
    }

    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: global.authUser._id }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Joined!", "You have successfully joined the club.");
        await fetchUserClubs();
      } else {
        Alert.alert("Error", data.error || "Failed to join club.");
      }
    } catch (err) {
      console.error("Join error:", err);
      Alert.alert("Error", "Something went wrong while joining the club.");
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchUserClubs();
  }, []);

  const alreadyJoined = clubs.filter((club) => joinedClubs.includes(club._id));
  const notJoined = clubs.filter((club) => !joinedClubs.includes(club._id));

  const renderClub = (club: Club, isJoined: boolean) => (
    <View key={club._id} style={styles.clubCard}>
      <Text style={styles.clubTitle}>{club.name}</Text>
      <Text style={styles.clubDesc}>{club.description}</Text>
      {!isJoined && (
        <TouchableOpacity style={styles.joinButton} onPress={() => joinClub(club._id)}>
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Discover Clubs</Text>

      {alreadyJoined.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🟦 ALREADY JOINED</Text>
          {alreadyJoined.map((club) => renderClub(club, true))}
        </>
      )}

      {notJoined.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🟩 JOINABLE CLUBS</Text>
          {notJoined.map((club) => renderClub(club, false))}
        </>
      )}

      {alreadyJoined.length === 0 && notJoined.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No clubs available right now.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#444',
  },
  clubCard: {
    backgroundColor: '#698de7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  clubTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  clubDesc: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  joinButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222',
  },
  joinText: {
    color: '#698de7',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
