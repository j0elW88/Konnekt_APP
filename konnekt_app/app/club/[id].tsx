import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';

import useAuthRedirect from '../../src/hooks/useAuthRedirect'; // send back to index if signed out
import ProximityChecker from '../../src/components/ProximityChecker'; // new component


export default function ClubDetailScreen() {
  useAuthRedirect();

  const { id } = useLocalSearchParams();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    console.log("Location button clicked");
    setLoading(true);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Please Enable Location Sharing', 'Location permission is required.');
      setLoading(false);
      return;
    }

    try {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

     /* 
        Alert.alert(
        "Check-In Successful",
        `Lat: ${loc.coords.latitude.toFixed(5)}\nLon: ${loc.coords.longitude.toFixed(5)}` //Extra Notification for IOS
      );

      */

      console.log("User location:", loc.coords);
    } catch (err) {
      console.error("Location fetch error:", err);
      Alert.alert("Error", "Unable to retrieve location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Details</Text>
      <Text style={styles.subtitle}>Club ID: {id}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
          <Text style={styles.buttonText}>Check In with Location</Text>
        </TouchableOpacity>
      )}

      {location && <ProximityChecker anchor={location} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A1B5D8',
    padding: 30,
    justifyContent: 'center',
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