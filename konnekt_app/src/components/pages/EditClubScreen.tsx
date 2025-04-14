import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IP_ADDRESS } from '../config/globalvariables';

type User = {
  _id: string;
  username: string;
  full_name: string;
};

type Club = {
  _id: string;
  name: string;
  description: string;
  color: string;
  useLocationTracking: boolean;
  isPublic: boolean;
  joinCode: string;
  admins: string[];
  pending: User[];
  members: User[];
};

export default function EditClubScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [checkinCounts, setCheckinCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

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

  const fetchCheckinStats = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/club/${id}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        const counts: Record<string, number> = {};
        data.forEach(entry => {
          const userId = entry.user?._id;
          if (userId) {
            counts[userId] = (counts[userId] || 0) + 1;
          }
        });
        setCheckinCounts(counts);
      } else {
        console.warn("Unexpected check-in data:", data);
      }
    } catch (err) {
      console.error("Failed to fetch check-in stats:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClub();
      fetchCheckinStats();
    }
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

  const handleApproval = async (userId: string, approve: boolean) => {
    if (!club) return;
    const endpoint = approve ? 'approve' : 'reject';

    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/${endpoint}/${userId}`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `User ${approve ? 'approved' : 'rejected'}`);
        fetchClub();
        fetchCheckinStats();
      } else {
        Alert.alert("Error", data.error || "Failed to update user status.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not update user status.");
      console.error("❌ Approval error:", err);
    }
  };

  if (!club) {
    return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Edit Club</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={club.name}
        onChangeText={(text) => setClub({ ...club, name: text })}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionBox]}
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

      {club.pending?.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Pending Members</Text>
          {club.pending.map((user) => (
            <View key={String(user._id)} style={styles.userRow}>
              <Text style={styles.userName}>{user.full_name || user.username || "Unnamed"}</Text>
              <View style={styles.approvalButtons}>
                <TouchableOpacity onPress={() => user._id && handleApproval(user._id, true)}>
                  <Text style={styles.approveText}>✅</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => user._id && handleApproval(user._id, false)}>
                  <Text style={styles.rejectText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ marginTop: 30 }}>
        <Text style={styles.label}>Approved Members</Text>
        {club.members.map((user) => (
          <View key={user._id} style={styles.userRow}>
            <Text style={styles.userName}>
              {user.full_name || user.username || 'Unknown'} —{' '}
              <Text style={{ fontWeight: 'bold' }}>{checkinCounts[user._id] || 0} Meetings Attended</Text>
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateClub} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6fc",
    paddingBottom: 80,
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
  descriptionBox: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  approveText: {
    fontSize: 20,
  },
  rejectText: {
    fontSize: 20,
    marginLeft: 10,
  },
});
