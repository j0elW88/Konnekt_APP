import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IP_ADDRESS } from '../src/../config/globalvariables';
import * as ImagePicker from 'expo-image-picker';

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4c87df');
  const [useLocationTracking, setUseLocationTracking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);

  const handleCreateClub = async () => {
    if (!global.authUser || !global.authUser._id) {
      Alert.alert("Error", "User not authenticated. Please sign in again.");
      console.log("global.authUser is missing or incomplete:", global.authUser);
      return;
    }

    console.log("Creating club with owner ID:", global.authUser._id);

    setLoading(true);

    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/clubs/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          color,
          description,
          imageUrl: image,
          useLocationTracking,
          isPublic,
          owner: global.authUser._id,
        }),
      });

      const data = await response.json();
      console.log("Club creation response:", data);

      if (response.ok) {
        Alert.alert("Success", "Club created!");
        router.replace("/(tabs)/homepage");
      } else {
        console.error("Club creation failed:", data);
        Alert.alert("Error", data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Network error during club creation:", error);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create a New Club</Text>

      <Text style={styles.label}>Club Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter club name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Write a description..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.row}>
        <Text style={styles.label}>Make Club Public</Text>
        <Switch value={isPublic} onValueChange={setIsPublic} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Enable Location Tracking</Text>
        <Switch
          value={useLocationTracking}
          onValueChange={setUseLocationTracking}
        />
      </View>

      <TouchableOpacity style={[styles.button, { marginBottom: 10 }]} onPress={pickImage}>
        <Text style={styles.buttonText}>Choose Club Image</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 120, borderRadius: 8, marginBottom: 16 }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateClub} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Club'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#4c87df',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
