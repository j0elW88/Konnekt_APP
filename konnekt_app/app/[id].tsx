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
  owner: string;
  admins: string[];
};

export default function ClubDetailScreen() {
  useAuthRedirect();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔎 Club ID from URL:", id);
    if (!id || typeof id !== 'string') {
      Alert.alert("Error", "Invalid club ID.");
      return;
    }

    const fetchClub = async () => {
      try {
        console.log("🌐 Fetching club from backend...");
        const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
        const data = await response.json();

        console.log("📦 Club data received:", data);

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
    console.log("📍 Location button clicked");
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

  if (loading) {
    return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 50 }} />;
  }

  if (!club) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>❌ Club Not Found</Text>
      </View>
    );
  }

  const isAdmin = club.admins?.includes(global.authUser?._id ?? '');
  const isOwner = club.owner === global.authUser?._id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{club.name}</Text>
      <Text style={styles.subtitle}>{club.description}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <Text style={styles.buttonText}>Check In with Location</Text>
        </TouchableOpacity>
      )}

      {location && <ProximityChecker anchor={location} />}

      <ClubMembersPanel
        clubId={club._id}
        currentUserId={global.authUser?._id ?? ''}
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
