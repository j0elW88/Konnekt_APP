import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();

  const handleButtonClick = () => {
    console.log(` Button clicked on club page: ${id}`);
    Alert.alert("Clicked!", `You clicked on club: ${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Club Details</Text>
      <Text style={styles.subtitle}>Club ID: {id}</Text>

      <TouchableOpacity style={styles.button} onPress={handleButtonClick}>
        <Text style={styles.buttonText}>Click Me</Text>
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
