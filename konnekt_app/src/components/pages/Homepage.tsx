import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Club = {
  _id: string;
  name: string;
  color?: string;
};

type HomepageProps = {
  clubs: Club[];
  onLeaveClub: (clubId: string, clubName: string) => void;
};

export default function Homepage({ clubs, onLeaveClub }: HomepageProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Dropdown icon */}
      <TouchableOpacity style={styles.menuIcon} onPress={() => setModalVisible(true)}>
        <Ionicons name="ellipsis-vertical" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.heading}>Your Clubs</Text>

      {clubs.map((club) => (
        <TouchableOpacity
          key={club._id}
          style={[styles.clubButton, { backgroundColor: club.color || '#fff' }]}
          onPress={() => router.push(`/${club._id}`)}
        >
          <Text style={styles.clubText}>{club.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.clubButton, { backgroundColor: '#777' }]}
        onPress={() => router.push('/join-club')}
      >
        <Text style={styles.createButtonText}>Join a Club</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/create-club')}
      >
        <Text style={styles.createButtonText}>+ Create New Club</Text>
      </TouchableOpacity>

      {/* Modal for leaving a club */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Leave a Club</Text>
            <FlatList
              data={clubs}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.leaveOption}
                  onPress={() => {
                    console.log("✅ Leave option tapped:", item.name);
                    onLeaveClub(item._id, item.name);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.leaveOptionText}>Leave {item.name}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: "#f4f6fc",
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  clubButton: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  clubText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  createButton: {
    backgroundColor: "#4c87df",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  leaveOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  leaveOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
