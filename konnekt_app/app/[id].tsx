import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import useAuthRedirect from '../src/hooks/useAuthRedirect';
import ProximityChecker from '../src/components/ProximityChecker';
import { IP_ADDRESS } from '../src/components/config/globalvariables';

type ClubData = {
  _id: string;
  name: string;
  description: string;
  color: string;
  useLocationTracking: boolean;
};

export default function ClubDetailScreen() {
  useAuthRedirect();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
        const data = await res.json();
        setClub(data);
      } catch (err) {
        console.error("Error fetching club:", err);
        Alert.alert("Error", "Could not load club data.");
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  const handleLocationCheckIn = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (err) {
      Alert.alert("Error", "Could not get your location.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !club) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4c87df" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: club.color || '#A1B5D8' }]}>
      <Text style={styles.title}>{club.name}</Text>
      <Text style={styles.subtitle}>{club.description}</Text>

      {club.useLocationTracking ? (
        location ? (
          <ProximityChecker anchor={location.coords} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLocationCheckIn}>
            <Text style={styles.buttonText}>Check In with Location</Text>
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity style={styles.button} onPress={() => Alert.alert("Checked In", "You checked in successfully!")}>
          <Text style={styles.buttonText}>Check In</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, { marginTop: 30, backgroundColor: '#666' }]}
        onPress={() => router.push(`/edit-club?id=${club._id}`)}
      >
        <Text style={styles.buttonText}>Edit Club Info</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: '#eee',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#4c87df',
    fontWeight: '600',
    fontSize: 16,
  },
});
