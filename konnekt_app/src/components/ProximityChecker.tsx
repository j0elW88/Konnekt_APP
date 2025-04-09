import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

interface Props {
  anchor: {
    latitude: number;
    longitude: number;
  };
}

export default function ProximityChecker({ anchor }: Props) {
  const [currentLoc, setCurrentLoc] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const radius = 25; // feet

  // Converts degrees to radians
  const toRad = (value: number) => (value * Math.PI) / 180;

  // Haversine formula for distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distMeters = R * c;
    return distMeters * 3.28084; // Convert to feet
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLoc(loc);

        const dist = getDistance(
          anchor.latitude,
          anchor.longitude,
          loc.coords.latitude,
          loc.coords.longitude
        );
        setDistance(dist);
      } catch (error) {
        console.error('Location update error:', error);
      }
    }, 1000); // update every 1s

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.box}>
      <Text style={styles.title}>
        {distance !== null && distance <= radius
          ? '✅ You are within the check-in radius!'
          : '❌ Outside of check-in radius.'}
      </Text>
      <Text style={styles.subtitle}>
        {distance !== null
          ? `Approx. ${distance.toFixed(2)} ft away`
          : 'Calculating...'}
      </Text>

      {currentLoc && (
        <Text style={styles.debug}>
          BUG TESTING: Lat: {currentLoc.coords.latitude.toFixed(6)}, Lon: {currentLoc.coords.longitude.toFixed(6)} |
          Distance: {distance?.toFixed(2)} ft
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  debug: {
    marginTop: 12,
    color: 'black',
    fontSize: 12,
  },
});