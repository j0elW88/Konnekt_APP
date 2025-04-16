import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Platform } from 'react-native';  // used to conditionally apply styles depending on platform
import { Agenda } from 'react-native-calendars';

type EventItem = {
  name: string;
};

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState('');

  const generateAgendaItems = (start: string, end: string) => {
    const items: { [date: string]: EventItem[] } = {};
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      items[dateStr] = []; // default to empty
    }
  
    // Add your actual events
    items['2025-04-07'] = [{ name: 'Robotics Club Meeting' }];
    items['2025-04-08'] = [{ name: 'Art Club: Watercolor Workshop' }];
    items['2025-04-10'] = [{ name: 'Coding Challenge Day' }];
  
    return items;
  };

  const mockEvents = generateAgendaItems('2025-04-06', '2025-04-12');
  
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📅 Calendar Page</Text>
      <Text style={styles.subheading}>Here are your RSVP’d events</Text>

      <Agenda
        items={mockEvents}
        selected={selectedDate || '2025-04-07'}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        renderItem={(item: EventItem, firstItemInDay: boolean) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
          </View>
        )}
        renderEmptyDate={() => (
          <View style={styles.item}>
            <Text>No events</Text>
          </View>
        )}
        theme={{
            selectedDayBackgroundColor: '#4c87df', // your app's primary color
            selectedDayTextColor: '#fff',
            todayTextColor: '#4c87df',
            dayTextColor: '#000',
            dotColor: '#4c87df',
            selectedDotColor: '#fff',
        }}       
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f4f6fc',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: Platform.select({
        ios: 15,       // adjust this as needed
        default: 0,    // for web/local host
      }),
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 10,
    shadowColor: '#ccc',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
});
