import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';

import ProximityChecker from '../src/components/ProximityChecker';
import ClubMembersPanel from '../src/components/pages/ClubMembersPanel';
import { IP_ADDRESS } from '../src/components/config/globalvariables';
import useAuthRedirect from '../src/hooks/useAuthRedirect';

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
};

export default function ClubDetailScreen() {
  useAuthRedirect();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      Alert.alert("Error", "Invalid club ID.");
      return;
    }

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

    fetchClub();
  }, [id]);

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

  if (loading || !club) {
    return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 50 }} />;
  }

  const isAdmin = club.admins.includes(global.authUser?.username ?? '');
  const isOwner = club.owner === global.authUser?.username;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{club.name}</Text>
      <Text style={styles.subtitle}>{club.description}</Text>

      <Text style={styles.statusText}>
        📍 Location Check-In is {club.useLocationTracking ? 'enabled ✅' : 'disabled ❌'}
      </Text>

      {(isAdmin || isOwner) && (
        <TouchableOpacity
          style={styles.setLocButton}
          onPress={() => router.push({ pathname: '/admin-panel', params: { id: club._id } })}
        >
          <Text style={styles.buttonText}>Admin Settings</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
        <Text style={styles.buttonText}>
          {club.useLocationTracking ? 'Check In with Location' : 'Check In'}
        </Text>
      </TouchableOpacity>

      {location && club.useLocationTracking && club.checkInCoords && (
        <ProximityChecker anchor={club.checkInCoords} />
      )}

      <ClubMembersPanel
        clubId={club._id}
        currentUserId={global.authUser?.username ?? ''}
        isAdmin={isAdmin}
        isOwner={isOwner}
      />
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
  setLocButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
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
});
