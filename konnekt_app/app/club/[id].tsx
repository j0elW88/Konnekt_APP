import React, { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocation(null);
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    } catch (error) {
      console.error("Location fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Details</Text>
      <Text style={styles.subtitle}>Club ID: {id}</Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckIn}>
        <Text style={styles.buttonText}>Check In with Location</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 20 }} />
      )}

      {!loading && location && (
        <>
          <Text style={styles.locationText}>
            📍 Latitude: {location.coords.latitude.toFixed(5)}
          </Text>
          <Text style={styles.locationText}>
            📍 Longitude: {location.coords.longitude.toFixed(5)}
          </Text>

          {Platform.OS !== 'web' ? (
            <MapView
              style={styles.map}
              region={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
              showsMyLocationButton
            >
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title="You are here"
              />
            </MapView>
          ) : (
            <View style={styles.iframeContainer}>
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                    <iframe 
                      width="100%" 
                      height="300" 
                      style="border:0; border-radius: 12px;" 
                      loading="lazy" 
                      allowfullscreen
                      src="https://maps.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}&z=15&output=embed">
                    </iframe>`,
                }}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A1B5D8',
    padding: 30,
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
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  map: {
    width: Dimensions.get('window').width * 0.9,
    height: 300,
    borderRadius: 12,
    marginTop: 15,
  },
  iframeContainer: {
    width: '100%',
    maxWidth: 600,
    height: 300,
    marginTop: 15,
  },
});
