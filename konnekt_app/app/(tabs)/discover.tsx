import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { IP_ADDRESS } from '../../src/components/config/globalvariables';
import useAuthRedirect from "../../src/hooks/useAuthRedirect"; //send back to index if signed out



type Club = {
  _id: string;
  name: string;
  description: string;
};

export default function DiscoverTab() {
    useAuthRedirect();
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/public`);
        const data = await res.json();
        setClubs(data);
      } catch (err) {
        console.error("Failed to load clubs", err);
      }
    };

    fetchClubs();
  }, []);

  const handleJoin = async (clubId: string) => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: global.authUser?._id }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "You’ve joined the club!");
      } else {
        Alert.alert("Error", data.msg || "Failed to join club");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong while joining");
    }
  };

  const renderItem = ({ item }: { item: Club }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <TouchableOpacity onPress={() => handleJoin(item._id)} style={styles.button}>
        <Text style={styles.buttonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Discover Public Clubs</Text>
      <FlatList
        data={clubs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6fc',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 16,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginVertical: 6,
    color: '#555',
  },
  button: {
    backgroundColor: '#4c87df',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
