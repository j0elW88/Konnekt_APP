import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IP_ADDRESS } from '../../components/config/globalvariables';
import { useRouter } from 'expo-router';

type Member = {
  _id: string;
  username: string;
  full_name: string;
};

type Props = {
  clubId: string;
  currentUserId: string;
  isAdmin: boolean;
  isOwner: boolean;
};

export default function ClubMembersPanel({
  clubId,
  currentUserId,
  isAdmin,
  isOwner,
}: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/members`)
      .then(res => res.json())
      .then(data => {
        setMembers(data.members);
        setAdmins(data.admins.map((admin: any) => admin._id));
        setOwnerId(data.owner._id);
      })
      .catch(err => console.error('Failed to load members', err));
  }, [clubId]);

  const handlePromote = async (userId: string) => {
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/promote/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    setAdmins(prev => [...prev, userId]);
  };

  const handleDemote = async (userId: string) => {
    await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/demote/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    setAdmins(prev => prev.filter(id => id !== userId));
  };

  const handleDeleteClub = async () => {
    Alert.alert("Are you sure?", "This will permanently delete the club.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: currentUserId }),
            });
            const result = await response.json();
            console.log("Delete response:", result);
            router.replace('/(tabs)/homepage'); // auto-refresh redirect
          } catch (err) {
            console.error("Failed to delete club:", err);
          }
        }
      }
    ]);
  };

  const handleLeaveClub = async () => {
    console.log("🚪 Leave Club button pressed");

    Alert.alert("Leave Club?", "Are you sure you want to leave this club?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            if (isOwner && members.length === 1) {
              console.log("🧨 Deleting club because owner is alone");
              await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
              });
            } else {
              const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/${clubId}/leave`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
              });
              const result = await response.json();
              console.log("Leave response:", result);
            }

            router.replace('/(tabs)/homepage'); // go back & refresh
          } catch (err) {
            console.error("Error leaving club:", err);
            Alert.alert("Error", "Could not leave club.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Members</Text>
      {members.map(member => (
        <View key={member._id} style={styles.memberRow}>
          <Text style={styles.memberName}>
            {member.full_name} ({member.username})
            {member._id === ownerId ? " 👑" : admins.includes(member._id) ? " ⭐" : ""}
          </Text>
          {isAdmin && member._id !== currentUserId && member._id !== ownerId && (
            admins.includes(member._id) ? (
              <TouchableOpacity onPress={() => handleDemote(member._id)}>
                <Text style={styles.action}>Demote</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => handlePromote(member._id)}>
                <Text style={styles.action}>Promote</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ))}

      {!isOwner && (
        <TouchableOpacity onPress={handleLeaveClub} style={styles.leaveBtn}>
          <Text style={styles.leaveText}>Leave Club</Text>
        </TouchableOpacity>
      )}
      
      {isOwner && (
        <TouchableOpacity onPress={handleLeaveClub} style={styles.leaveBtn}>
          <Text style={styles.leaveText}>Leave Club</Text>
        </TouchableOpacity>
      )}


      {isOwner && (
        <TouchableOpacity onPress={handleDeleteClub} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete Club</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    width: '100%',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
  },
  action: {
    color: '#4c87df',
    fontWeight: '600',
  },
  deleteBtn: {
    marginTop: 20,
    backgroundColor: '#ff5c5c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveBtn: {
    marginTop: 10,
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
