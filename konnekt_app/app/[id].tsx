import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import useAuthRedirect from '../src/hooks/useAuthRedirect';
import ProximityChecker from '../src/components/ProximityChecker';
import { IP_ADDRESS } from '../src/components/config/globalvariables';
import { useFocusEffect } from '@react-navigation/native';


interface ClubData {
  _id: string;
  name: string;
  description: string;
  color: string;
  useLocationTracking: boolean;
  activeEventId?: string;
}

interface EventData {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  clubId: string;
}

export default function ClubDetailScreen() {
  useAuthRedirect();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<ClubData | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInSummary, setCheckInSummary] = useState<Record<string, number>>({}); //only here for one call and I couldn't figure out another way to do it so for now usiing this redundantly
 
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [archivedEvents, setArchivedEvents] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);


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

  const fetchCheckInSummary = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/summary/${id}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const counts: Record<string, number> = {};
        data.forEach(entry => {
          counts[entry.userId] = entry.total;
        });
        setCheckInSummary(counts);
      }
    } catch (err) {
      console.error("❌ Failed to fetch check-in summary:", err);
    }
  };
  
  const fetchEvents = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/events/club/${id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const upcoming = data.filter(event => !event.isArchived);
        const archived = data.filter(event => event.isArchived);
        setUpcomingEvents(upcoming);    
        setArchivedEvents(archived);     
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };
  

  const handleArchiveEvent = async (eventId: string, isArchived: boolean) => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/events/${eventId}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived }),
      });
  
      if (res.ok) {
        await fetchEvents(); // refresh UI
        Alert.alert("Event Updated", isArchived ? "Event archived." : "Event reopened.");
      } else {
        Alert.alert("Error", "Could not update archive status.");
      }
    } catch (err) {
      console.error("Archive event failed:", err);
      Alert.alert("Error", "Server error archiving event.");
    }
  };

  const confirmDelete = async (eventId: string) => {
    console.log("🔁 Attempting fetch to", `http://${IP_ADDRESS}:5000/api/events/${eventId}`);
  
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/events/${eventId}`, {
        method: 'DELETE',
      });
  
      let data = {};
      try {
        data = await res.json();
      } catch {
        console.warn("⚠️ No JSON returned");
      }
  
      console.log("🧾 Delete response status:", res.status);
      console.log("🧾 Delete response body:", data);
  
      if (res.ok) {
        console.log("✅ Event deleted");
        await fetchEvents();
      } else {
        console.error("❌ Error deleting event:", data);
      }
    } catch (err) {
      console.error("🔥 Delete error:", err);
    }
  };
  

/*const handleCheckIn = async () => {
    setLoading(true);
  
    try {
      if (!club?.activeEventId) {
        Alert.alert("No Active Event", "There is no event currently being tracked.");
        return;
      }
  
      let coords = null;
  
      // Only request location if club requires it
      if (club.useLocationTracking) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Required", "Location permission is required for this club.");
          return;
        }
  
        const loc = await Location.getCurrentPositionAsync({});
        coords = loc.coords;
      }
  
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/${club.activeEventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: global.authUser?._id,
          lat: coords?.latitude,  // undefined if not needed
          lon: coords?.longitude
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setCheckedIn(true);
        await fetchCheckInSummary(); // update stats if available
        Alert.alert("✅ Check-In Successful", data.message);
      } else {
        Alert.alert("❌ Check-In Failed", data.error || "Could not check in.");
      }
  
    } catch (err) {
      console.error("Check-in error:", err);
      Alert.alert("Error", "Could not perform check-in.");
    } finally {
      setLoading(false);
    }
  };
  */


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
  
      if (!club?.activeEventId) {
        Alert.alert("No Active Event", "There is no event currently being tracked.");
        return;
      }
  
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/${club.activeEventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: global.authUser!._id,
          lat: loc.coords.latitude,
          lon: loc.coords.longitude
        })
      });
  
      const data = await res.json();
      if (res.ok) {
        setCheckedIn(true);
        Alert.alert("✅ Check-In Successful", data.message);
        await fetchClub();
        await fetchCheckInSummary();
  
      } else {
        Alert.alert("❌ Check-In Failed", data.error || "Unable to check in.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not check in.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  

//Load initial
useEffect(() => {
  fetchClub();
  fetchEvents();
  fetchCheckInSummary();
}, [id]);

// Re-fetch for return to screen
useFocusEffect(
  React.useCallback(() => {
    fetchClub();
    fetchEvents();
    fetchCheckInSummary();
  }, [id])
);

  if (loading || !club) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4c87df" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: club.color || '#A1B5D8' }]}>
      <Text style={styles.title}>{club.name}</Text>
      <Text style={styles.subtitle}>{club.description}</Text>

      {checkedIn && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>✅ You’ve checked in for the active event!</Text>
        </View>
      )}


      {club.activeEventId && upcomingEvents.some(e => e._id === club.activeEventId) ? (
        club.useLocationTracking ? (
          location ? (
            <ProximityChecker anchor={location.coords} />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleLocationCheckIn}>
              <Text style={styles.buttonText}>Check In with Location</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              try {
                const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/${club.activeEventId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: global.authUser?._id })
                });
                const data = await res.json();
                if (res.ok) {
                  Alert.alert("✅ Check-In Successful", data.message);
                } else {
                  Alert.alert("❌ Check-In Failed", data.error || "Unable to check in.");
                }
              } catch (err) {
                Alert.alert("Error", "Could not check in.");
                console.error(err);
              }
            }}
          >
            <Text style={styles.buttonText}>Check In</Text>
          </TouchableOpacity>
        )
      ) : (
        <Text style={{ marginTop: 20, color: 'white' }}>No active event right now.</Text>
      )}


      <TouchableOpacity
        style={[styles.button, { marginTop: 30, backgroundColor: '#ffb6c1' }]}
        onPress={() => router.push(`/edit-club?id=${club._id}`)}
      >
        <Text style={styles.buttonText}>Edit Club Info</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 40, width: '100%' }}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.length === 0 ? (
          <Text style={styles.sectionText}>No events yet.</Text>
        ) : (
          upcomingEvents.map((event) => (
            <View key={event._id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDesc}>{event.description}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
          
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity
                  onPress={() => handleArchiveEvent(event._id, true)}
                  style={[styles.button, { backgroundColor: '#d3d3d3' }]}
                >
                  <Text style={styles.buttonText}>Archive</Text>
                </TouchableOpacity>
          
                <TouchableOpacity
                  onPress={() => confirmDelete(event._id)}
                  style={[styles.button, { backgroundColor: 'red' }]}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
          
        )}

        {/* Archived Dropdown */}
        <TouchableOpacity onPress={() => setShowArchived(!showArchived)} style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold', color: '#fff' }}>
            {showArchived ? 'Hide Archived Events ▲' : 'Show Archived Events ▼'}
          </Text>
        </TouchableOpacity>

        {/*  Archived Events */}
        {showArchived && archivedEvents.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.sectionTitle, { fontSize: 18 }]}>Archived Events</Text>
            {archivedEvents.map((event) => (
                <View key={event._id} style={[styles.eventCard, { backgroundColor: '#e8e8e8' }]}>
                  <Text style={[styles.eventTitle, { color: '#555' }]}>{event.title}</Text>
                  <Text style={[styles.eventDesc, { color: '#777' }]}>{event.description}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => handleArchiveEvent(event._id, false)}
                      style={[styles.button, { backgroundColor: '#4c87df' }]}
                    >
                      <Text style={styles.buttonText}>Reopen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => confirmDelete(event._id)}
                      style={[styles.button, { backgroundColor: 'red' }]}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
              }
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30,
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
    backgroundColor: '#d3d3d3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#00000',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  sectionText: {
    fontSize: 16,
    color: '#fff',
    alignSelf: 'flex-start',
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  eventDesc: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  eventDate: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
  },
  banner: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  bannerText: {
    color: '#155724',
    fontWeight: '600',
  },
  

});
