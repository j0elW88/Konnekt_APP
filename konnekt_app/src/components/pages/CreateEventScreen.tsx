import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IP_ADDRESS } from '../config/globalvariables';


function isValidDateString(dateStr: string): boolean {
  const parsed = Date.parse(dateStr);
  return !isNaN(parsed);
}


export default function CreateEventScreen() {
  const { id: clubId } = useLocalSearchParams();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      return Alert.alert('Title is required');
    }
  
    // ✅ Validate the date format
    const isValidDate = !isNaN(new Date(date).getTime());
    if (!isValidDate) {
      Alert.alert("Invalid Date", "Please enter a valid date (MM/DD/YYYY).");
      return;
    }
  
    try {
      const response = await fetch(`http://${IP_ADDRESS}:5000/api/events/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location,
          date: new Date(date).toISOString().split('T')[0], // 👈 Safe conversion here
          clubId,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Event created successfully');
        router.back();
      } else {
        Alert.alert('Error', data.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Create event error:', err);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };  

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Create Event</Text>
    
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
    
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              multiline
            />
    
            <Text style={styles.label}>Date (MM/DD/YYYY)</Text>
            <TextInput
              style={styles.input}
              value={date.toLocaleDateString("en-US")}
              onChangeText={(text) => {
                const parts = text.split('/');
                if (parts.length === 3) {
                  const [month, day, year] = parts.map(Number);
                  const newDate = new Date(year, month - 1, day);
                  if (!isNaN(newDate.getTime())) {
                    setDate(newDate);
                  }
                }
              }}
              placeholder="MM/DD/YYYY"
            />
    
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} />
    
            <TouchableOpacity style={styles.button} onPress={handleCreate}>
              <Text style={styles.buttonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );  
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f6fc',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#4c87df',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
