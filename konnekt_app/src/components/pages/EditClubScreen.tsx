import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ClubMembersPanel from './ClubMembersPanel';
import { IP_ADDRESS } from '../config/globalvariables';

type Club = {
  _id: string;
  name: string;
  description: string;
  color: string;
  useLocationTracking: boolean;
  isPublic: boolean;
  joinCode: string;
  admins: string[];
};

export default function EditClubScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = club?.admins?.includes(global.authUser?._id ?? '');


  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
        const data = await response.json();
        setClub(data);
      } catch (err) {
        console.error("Failed to fetch club:", err);
        Alert.alert("Error", "Could not load club info.");
      }
    };

    if (id) fetchClub();
  }, [id]);

  const handleUpdateClub = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: {
            name: club?.name,
            description: club?.description,
            color: club?.color,
            useLocationTracking: club?.useLocationTracking,
            isPublic: club?.isPublic
          }
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Club updated successfully!");
        router.replace(`/(tabs)/homepage`);
      } else {
        Alert.alert("Error", data.error || "Update failed.");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update club.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateJoinCode = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}/join-code/reset`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: global.authUser?._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setClub((prev) => prev && { ...prev, joinCode: data.joinCode });
        Alert.alert("Join code reset!");
      } else {
        Alert.alert("Error", data.error || "Could not reset code");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to reset join code");
    }
  };

  if (!club) {
    return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Club</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={club.name}
        onChangeText={(text) => setClub({ ...club, name: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={club.description}
        onChangeText={(text) => setClub({ ...club, description: text })}
      />

      <Text style={styles.label}>Color</Text>
      <TextInput
        style={styles.input}
        value={club.color}
        onChangeText={(text) => setClub({ ...club, color: text })}
      />

      <View style={styles.row}>
        <Text style={styles.label}>Location Tracking</Text>
        <Switch
          value={club.useLocationTracking}
          onValueChange={(value) => setClub({ ...club, useLocationTracking: value })}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Public Club</Text>
        <Switch
          value={club.isPublic}
          onValueChange={(value) => setClub({ ...club, isPublic: value })}
        />
      </View>

      {isAdmin && (
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.label}>Join Code</Text>
          <Text style={styles.joinCode}>{club.joinCode}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#666', marginTop: 10 }]}
            onPress={handleRegenerateJoinCode}
          >
            <Text style={styles.buttonText}>Regenerate Join Code</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdateClub} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
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
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  joinCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#4c87df",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
