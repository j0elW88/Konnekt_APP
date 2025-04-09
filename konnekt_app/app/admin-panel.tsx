import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { IP_ADDRESS } from '../src/components/config/globalvariables';
import useAuthRedirect from "../src/hooks/useAuthRedirect";

interface User {
  _id: string;
  username: string;
  full_name: string;
  meetingsAttended?: number;
}

interface Club {
  _id: string;
  name: string;
  isPublic: boolean;
  useLocationTracking: boolean;
  joinCode: string;
  admins: string[]; // usernames
  owner: string;    // username
  pending: User[];
  members: User[];
}

export default function AdminPanel() {
  useAuthRedirect();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);
  const username = global.authUser?.username ?? '';

  const fetchClub = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
      const data = await res.json();
      setClub(data);
    } catch (err) {
      Alert.alert("Error", "Failed to load club");
    }
  };

  useEffect(() => {
    if (id) fetchClub();
  }, [id]);

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

  const handleSetLocation = async () => {
    if (!club) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Location permission denied");

    const loc = await Location.getCurrentPositionAsync({});
    const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: global.authUser?._id,
        lat: loc.coords.latitude,
        lon: loc.coords.longitude
      })
    });

    if (res.ok) Alert.alert("Success", "Check-in location updated.");
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    if (!club) return;
    const endpoint = approve ? 'approve' : 'reject';
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/${endpoint}/${userId}`, {
      method: 'PATCH'
    });
    fetchClub();
  };

  const handlePromoteDemote = async (userId: string, promote: boolean) => {
    if (!club) return;
    const endpoint = promote ? 'promote' : 'demote';
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/${endpoint}/${userId}`, {
      method: 'PATCH'
    });
    fetchClub();
  };

  const handleKick = async (targetUserId: string) => {
    if (!club) return;
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/kick/${targetUserId}`, {
      method: 'PATCH'
    });
    fetchClub();
  };

  if (!club) return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 40 }} />;

  const isAdmin = club.admins.includes(username);
  const isOwner = club.owner === username;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Panel - {club.name}</Text>

      {(isAdmin || isOwner) && (
        <>
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
          {club.pending?.length === 0 && <Text style={styles.emptyText}>No pending requests</Text>}
          {club.pending?.map(user => (
            <View key={user._id} style={styles.userRow}>
              <Text>{user.full_name}</Text>
              <TouchableOpacity onPress={() => handleApproval(user._id, true)}><Text>✅</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => handleApproval(user._id, false)}><Text>❌</Text></TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <Text style={styles.subheader}>Club Members</Text>
      {club.members?.map(user => (
        <View key={user._id} style={styles.userRow}>
          <Text>{user.full_name} {user.meetingsAttended !== undefined ? `(${user.meetingsAttended} meetings)` : ''}</Text>
          {(isAdmin || isOwner) && (
            <>
              {club.admins.includes(user.username) ? (
                <TouchableOpacity onPress={() => handlePromoteDemote(user._id, false)}><Text>⬇️</Text></TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handlePromoteDemote(user._id, true)}><Text>⬆️</Text></TouchableOpacity>
              )}
              {user.username !== username && (
                <TouchableOpacity onPress={() => handleKick(user._id)}><Text>🗑️</Text></TouchableOpacity>
              )}
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subheader: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6
  },
  button: {
    backgroundColor: '#4c87df',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { fontStyle: 'italic', color: '#555' }
});
