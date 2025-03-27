import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const handleCheckIn = async () => {
    console.log("📍 Location button clicked");

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    Alert.alert(
      "Check-In Successful",
      `Lat: ${loc.coords.latitude.toFixed(5)}\nLon: ${loc.coords.longitude.toFixed(5)}`
    );

    // You can now send `loc` to MongoDB or log it
    console.log("User location:", loc.coords);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Details</Text>
      <Text style={styles.subtitle}>Club ID: {id}</Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
        <Text style={styles.buttonText}>Check In with Location</Text>
      </TouchableOpacity>
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
