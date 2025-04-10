import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { IP_ADDRESS } from '../src/components/config/globalvariables';
import useAuthRedirect from '../src/hooks/useAuthRedirect';

import ProximityChecker from '../src/components/ProximityChecker';
import ClubMembersPanel from '../src/components/pages/ClubMembersPanel';

type Club = {
  _id: string;
  name: string;
  description: string;
  color: string;
  useLocationTracking: boolean;
  owner: string; // now a username
  admins: string[]; // usernames
  isPublic: boolean;
  checkInCoords?: {
    latitude: number;
    longitude: number;
  };
  joinCode: string;
  pending: User[];
  members: User[];
};

type User = {
  _id: string;
  username: string;
  full_name: string;
  meetingsAttended?: number;
};

export default function ClubDetailScreen() {
  useAuthRedirect();
  const { id } = useLocalSearchParams();
  const [club, setClub] = useState<Club | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const username = global.authUser?.username ?? '';

  // Fetch club details
  const fetchClub = async () => {
    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
      const data = await response.json();
      if (response.ok) {
        setClub(data);
      } else {
        Alert.alert("Error", data.error || "Club not found.");
      }
    } catch (err) {
      console.error("❌ Failed to fetch club:", err);
      Alert.alert("Error", "Could not load club info.");
    } finally {
      setLoading(false);
    }
  };

  // Handle location tracking
  const handleCheckIn = async () => {
    setLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Enable location sharing to check in.');
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (err) {
      console.error("❌ Location fetch error:", err);
      Alert.alert("Error", "Could not retrieve your location.");
    } finally {
      setLoading(false);
    }
  };

  // Set club check-in location
  const handleSetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      const coords = await Location.getCurrentPositionAsync({});
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: global.authUser?._id,
          lat: coords.coords.latitude,
          lon: coords.coords.longitude
        })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Check-in location updated!");
        setClub(prev => prev ? { ...prev, checkInCoords: data.checkInCoords } : prev);
      } else {
        Alert.alert("Error", data.error || "Failed to set location.");
      }
    } catch (err) {
      console.error("Error setting location:", err);
      Alert.alert("Error", "Could not update location.");
    }
  };

  // Update club settings (like public, location tracking)
  const handleUpdateToggle = async (updates: Partial<Club>) => {
    if (!club) return;
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (res.ok) setClub(prev => prev ? { ...prev, ...updates } : prev);
    } catch (err) {
      Alert.alert("Error", "Failed to update");
    }
  };

  // Promote or demote members
  const handlePromoteDemote = async (userId: string, promote: boolean) => {
    if (!club) return;
    const endpoint = promote ? 'promote' : 'demote';
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/${endpoint}/${userId}`, {
      method: 'PATCH'
    });
    fetchClub();
  };

  // Kick members from club
  const handleKick = async (userId: string) => {
    if (!club) return;
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/kick/${userId}`, {
      method: 'PATCH'
    });
    fetchClub();
  };

  // Handle approval or rejection of pending members
  const handleApproval = async (userId: string, approve: boolean) => {
    if (!club) return;
    const endpoint = approve ? 'approve' : 'reject';
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/${endpoint}/${userId}`, {
        method: 'PATCH',
      });
  
      if (res.ok) {
        Alert.alert("Success", `User ${approve ? 'approved' : 'rejected'}`);
        fetchClub(); // Reload club details
      } else {
        const data = await res.json();
        Alert.alert("Error", data.error || "Failed to update user status.");
      }
    } catch (err) {
      console.error("❌ Approval error:", err);
      Alert.alert("Error", "Could not update user status.");
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      Alert.alert("Error", "Invalid club ID.");
      return;
    }
    fetchClub();
  }, [id]);

  if (loading || !club) {
    return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{club.name}</Text>
      <Text style={styles.subtitle}>{club.description}</Text>

      <Text style={styles.statusText}>
        📍 Location Check-In is {club.useLocationTracking ? 'enabled ✅' : 'disabled ❌'}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
        <Text style={styles.buttonText}>
          {club.useLocationTracking ? 'Check In with Location' : 'Check In'}
        </Text>
      </TouchableOpacity>

      {location && club.useLocationTracking && club.checkInCoords && (
        <ProximityChecker anchor={club.checkInCoords} />
      )}

      <Text style={styles.subheader}>Admin Options</Text>
      <View style={styles.toggleRow}>
        <Text>Public Club</Text>
        <Switch
          value={club.isPublic}
          onValueChange={(val) => handleUpdateToggle({ isPublic: val })}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text>Location Tracking</Text>
        <Switch
          value={club.useLocationTracking}
          onValueChange={(val) => handleUpdateToggle({ useLocationTracking: val })}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSetLocation}>
        <Text style={styles.buttonText}>Set Check-in Location</Text>
      </TouchableOpacity>

      <Text style={styles.subheader}>Join Code: {club.joinCode}</Text>

      <Text style={styles.subheader}>Pending Approvals</Text>
      {club.pending?.map(user => (
        <View key={user._id} style={styles.userRow}>
          <Text>{user.full_name}</Text>
          <TouchableOpacity onPress={() => handleApproval(user._id, true)}><Text>✅</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleApproval(user._id, false)}><Text>❌</Text></TouchableOpacity>
        </View>
      ))}

      <Text style={styles.subheader}>Members</Text>
      {club.members?.map(user => (
        <View key={user._id} style={styles.userRow}>
          <Text>{user.full_name}</Text>
          {club.admins.includes(user.username) ? (
            <TouchableOpacity onPress={() => handlePromoteDemote(user._id, false)}><Text>⬇️</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handlePromoteDemote(user._id, true)}><Text>⬆️</Text></TouchableOpacity>
          )}
          {user._id !== username && (
            <TouchableOpacity onPress={() => handleKick(user._id)}><Text>🗑️</Text></TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A1B5D8',
    padding: 30,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4c87df',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
});
