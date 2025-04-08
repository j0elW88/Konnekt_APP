import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import useAuthRedirect from '../../src/hooks/useAuthRedirect';
import ProximityChecker from '../../src/components/ProximityChecker';
import { IP_ADDRESS } from '../../src/components/config/globalvariables';

type ClubData = {
  _id: string;
  name: string;
  description: string;
  color: string;
  imageUrl?: string;
  useLocationTracking: boolean;
  members: string[];
  admins: string[];
};

export default function ClubDetailScreen() {
  useAuthRedirect();
  const { id } = useLocalSearchParams();
  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
        const data = await response.json();
        setClub(data);
      } catch (err) {
        console.error("Error fetching club data:", err);
        Alert.alert("Error", "Unable to load club details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [id]);

  const handleCheckIn = async () => {
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
      console.log("User location:", loc.coords);
    } catch (err) {
      Alert.alert("Error", "Could not get location.");
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

      {location ? (
        <ProximityChecker anchor={location} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <Text style={styles.buttonText}>Check In with Location</Text>
        </TouchableOpacity>
      )}
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
