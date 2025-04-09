import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IP_ADDRESS } from '../../components/config/globalvariables';

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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Members</Text>
      {members.map(member => (
        <View key={member._id} style={styles.memberRow}>
          <Text style={styles.memberName}>
            {member.full_name} ({member.username})
            {member._id === ownerId ? ' 👑' : admins.includes(member._id) ? ' ⭐' : ''}
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
});
