import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Switch, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IP_ADDRESS } from '../config/globalvariables';
import { useFocusEffect } from '@react-navigation/native';
import Location from 'expo-location';
import Slider from '@react-native-community/slider';


type User = {
  _id: string;
  username: string;
  full_name: string;
};

type Club = {
  _id: string;
  name: string;
  description: string;
  color: string;
  useLocationTracking: boolean;
  isPublic: boolean;
  joinCode: string;
  admins: string[];
  pending: User[];
  members: User[];
  owner: string;
  activeEventId?: string | { _id: string } | null;
  checkInCoords?: {
    lat: number;
    lon: number;
  };
  checkInRadius?: number;
};


export default function EditClubScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [checkinCounts, setCheckinCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEventActive, setIsEventActive] = useState(false);
  const [checkInSummary, setCheckInSummary] = useState<Record<string, number>>({});

  const fetchClub = async () => {
    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`);
      const data = await response.json();
      setClub(data);

      const active = data.activeEventId;
      if (active && typeof active === 'object' && active._id) {
        setSelectedEventId(active._id);
        setIsEventActive(true);
      } else if (typeof active === 'string') {
        setSelectedEventId(active);
        setIsEventActive(true);
      } else {
        setSelectedEventId(null);
        setIsEventActive(false);
      }

    } catch (err) {
      console.error("Failed to fetch club:", err);
      Alert.alert("Error", "Could not load club info.");
    }
  };

  const fetchCheckinStats = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/club/${id}`);
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        const counts: Record<string, number> = {};
        data.forEach(entry => {
          const userId = entry.user?._id;
          if (userId) {
            counts[userId] = (counts[userId] || 0) + 1;
          }
        });
        setCheckinCounts(counts);
      } else {
        console.warn("Unexpected check-in data:", data);
      }
    } catch (err) {
      console.error("Failed to fetch check-in stats:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchClub();
      fetchCheckinStats();
      fetchEvents();
    }
  }, [id]);

  const fetchCheckInSummary = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/checkin/summary/${id}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const counts: Record<string, number> = {};
        data.forEach(user => {
          counts[user.userId] = user.total;
        });
        setCheckInSummary(counts);
      }
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err);
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        fetchClub();
        fetchCheckinStats();
        fetchEvents();
        fetchCheckInSummary(); // optional: refresh attendance
      }
    }, [id])
  );
  

  const fetchEvents = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/events/club/${id}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        const upcoming = data.filter((event) => !event.isArchived);
        setEvents(upcoming); // ✅ only non-archived events
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (err) {
      console.error("Event fetch error:", err);
    }
  };
  
  


  const handleUpdateClub = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: {
            name: club?.name,
            description: club?.description,
            color: club?.color,
            useLocationTracking: club?.useLocationTracking,
            isPublic: club?.isPublic,
            activeEventId: club?.activeEventId || null, 
            checkInCoords: club?.checkInCoords || null,
            checkInRadius: club?.checkInRadius || 0.01,            
          }
        }),        
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Club updated successfully!");
        //router.replace(`/${id}`);
        router.back() // maybe a better solution than above to prevent being stuck having to push back 12 times
      } else {
        Alert.alert("Error", data.error || "Update failed.");
      }
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update club.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateJoinCode = async () => {
    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}/join-code/reset`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: global.authUser?._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setClub((prev) => prev && { ...prev, joinCode: data.joinCode });
        Alert.alert("Join code reset!");
      } else {
        Alert.alert("Error", data.error || "Could not reset code");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to reset join code");
    }
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    if (!club) return;
    const endpoint = approve ? 'approve' : 'reject';

    try {
      const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${club._id}/${endpoint}/${userId}`, {
        method: 'PATCH',
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", `User ${approve ? 'approved' : 'rejected'}`);
        fetchClub();
        fetchCheckinStats();
      } else {
        Alert.alert("Error", data.error || "Failed to update user status.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not update user status.");
      console.error("❌ Approval error:", err);
    }
  };

  const handleDeleteClub = async () => {
    Alert.alert("Confirm", "Are you sure you want to delete this club?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: global.authUser?._id })
            });

            const data = await res.json();
            if (res.ok) {
              Alert.alert("Deleted", "Club deleted successfully.");
              router.replace(`/(tabs)/homepage`);
            } else {
              Alert.alert("Error", data.error || "Could not delete club");
            }
          } catch (err) {
            console.error("Delete error:", err);
            Alert.alert("Error", "Server error");
          }
        }
      }
    ]);
  };

  const isAdmin = (userId: string) => club?.admins.includes(userId);

  if (!club) {
    return <ActivityIndicator size="large" color="#4c87df" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Edit Club</Text>
  
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={club.name}
        onChangeText={(text) => setClub({ ...club, name: text })}
      />
  
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionBox]}
        multiline
        value={club.description}
        onChangeText={(text) => setClub({ ...club, description: text })}
      />
  
      <Text style={styles.label}>Color</Text>
      <TextInput
        style={styles.input}
        value={club.color}
        onChangeText={(text) => setClub({ ...club, color: text })}
      />
  
      <View style={styles.row}>
        <Text style={styles.label}>Location Tracking</Text>
        <Switch
          value={club.useLocationTracking}
          onValueChange={(value) => setClub({ ...club, useLocationTracking: value })}
        />
      </View>

      {club.useLocationTracking && (
  <View style={{ marginBottom: 24 }}>
    <Text style={styles.label}>Check-In Location</Text>

    {club.checkInCoords?.lat != null && club.checkInCoords?.lon != null ? (
      <Text>
        Latitude: {club.checkInCoords.lat.toFixed(5)} | Longitude: {club.checkInCoords.lon.toFixed(5)}
      </Text>
    ) : (
      <Text>No location set</Text>
    )}

    <TouchableOpacity
      style={[styles.button, { backgroundColor: '#999', marginTop: 10 }]}
      onPress={async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert("Permission Denied", "Location access is required.");
            return;
          }

          const loc = await Location.getCurrentPositionAsync({});
          setClub(prev => prev && {
            ...prev,
            checkInCoords: {
              lat: loc.coords.latitude,
              lon: loc.coords.longitude
            }
          });
        } catch (err) {
          console.error("Set location error:", err);
          Alert.alert("Error", "Failed to set location.");
        }
      }}
    >
      <Text style={styles.buttonText}>Set Current Location</Text>
    </TouchableOpacity>

    <Text style={[styles.label, { marginTop: 16 }]}>Check-In Radius (in feet)</Text>
      <View style={{ marginHorizontal: 20 }}>
      <Slider
          minimumValue={10}
          maximumValue={5280}
          step={10}
          value={(club.checkInRadius ?? (175 / 364000)) * 364000}
          onValueChange={(feet) => {
            const degrees = feet / 364000;
            setClub(prev => prev && {
              ...prev,
              checkInRadius: degrees
            });
          }}
          minimumTrackTintColor="#4c87df"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#4c87df"
          style={{ height: 30, width: '100%' }} // ← added width here
      />

      </View>

      <Text style={{ textAlign: 'center', marginTop: 8, color: '#555', fontSize: 14 }}>
        {Math.round((club.checkInRadius || 0.01) * 364000)} ft
      </Text>

      </View>
      )}

  
      <View style={styles.row}>
        <Text style={styles.label}>Public Club</Text>
        <Switch
          value={club.isPublic}
          onValueChange={(value) => setClub({ ...club, isPublic: value })}
        />
      </View>
  
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#888', marginTop: 10 }]}
        onPress={() => router.push(`/create-event?id=${club._id}`)}
      >
        <Text style={styles.buttonText}>Create New Event</Text>
      </TouchableOpacity>
  
      <View style={{ marginBottom: 24 }}>
        <Text style={styles.label}>Join Code</Text>
        <Text style={styles.joinCode}>{club.joinCode}</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#666', marginTop: 10 }]}
          onPress={handleRegenerateJoinCode}
        >
          <Text style={styles.buttonText}>Regenerate Join Code</Text>
        </TouchableOpacity>
      </View>
  
      {club.pending?.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Pending Members</Text>
          {club.pending.map((user) => (
            <View key={String(user._id)} style={styles.userRow}>
              <Text style={styles.userName}>{user.full_name || user.username || "Unnamed"}</Text>
              <View style={styles.approvalButtons}>
                <TouchableOpacity onPress={() => user._id && handleApproval(user._id, true)}>
                  <Text style={styles.approveText}>✅</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => user._id && handleApproval(user._id, false)}>
                  <Text style={styles.rejectText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
  
      <View style={{ marginTop: 30 }}>
        <Text style={styles.label}>Approved Members</Text>
        {club.members.map((user) => (
          <View key={user._id} style={styles.userRow}>
            <Text style={styles.userName}>
              {user.full_name || user.username || 'Unknown'}
              {club.owner === user._id ? ' 👑' : isAdmin(user._id) ? ' ⭐' : ''} —{" "}
              <Text style={{ fontWeight: "bold" }}>
                {checkInSummary[user._id] || 0} Meetings Attended
              </Text>
            </Text>
          </View>
        ))}
      </View>
  
      <View style={{ marginTop: 30 }}>
        <Text style={styles.label}>Select Event to Track Attendance</Text>
        <View style={styles.input}>
          {events.length === 0 ? (
            <Text>No events found</Text>
          ) : (
            events.map((event) => (
              <TouchableOpacity
                key={event._id}
                onPress={() => setSelectedEventId(event._id)}
                style={{
                  paddingVertical: 6,
                  backgroundColor: selectedEventId === event._id ? '#cde' : 'transparent',
                }}
              >
                <Text>{event.title} — {event.date}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
  
        {selectedEventId && (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isEventActive ? 'red' : 'green', marginTop: 10 },
            ]}
            onPress={async () => {
              try {
                const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${id}/active-event`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventId: isEventActive ? null : selectedEventId }),
                });
                if (response.ok) {
                  const result = await response.json();
                  const newActiveEvent = isEventActive ? null : selectedEventId;
                  setClub(prev => prev ? { ...prev, activeEventId: newActiveEvent } : prev);
                  setIsEventActive(!isEventActive);
                  Alert.alert(
                    isEventActive ? "Attendance Ended" : "Event Started",
                    club?.useLocationTracking
                      ? "Location tracking is active."
                      : "Location tracking not required."
                  );
                } else {
                  const error = await response.json();
                  Alert.alert("Error", error?.message || "Could not update active event.");
                }
              } catch (err) {
                console.error("Failed to toggle event tracking:", err);
                Alert.alert("Error", "Could not update active event.");
              }
            }}
          >
            <Text style={styles.buttonText}>
              {isEventActive ? "End Event" : "Start Event"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
  
      <TouchableOpacity style={styles.button} onPress={handleUpdateClub} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </TouchableOpacity>
  
      <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleDeleteClub}>
        <Text style={styles.buttonText}>Delete Club</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f4f6fc",
    paddingBottom: 80,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  descriptionBox: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  joinCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#4c87df",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  userName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  approvalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 12,
  },
  approveText: {
    fontSize: 20,
  },
  rejectText: {
    fontSize: 20,
    marginLeft: 10,
  },
});