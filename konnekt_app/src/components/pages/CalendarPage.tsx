import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity } from 'react-native';
import { Agenda, AgendaEntry } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { IP_ADDRESS } from "../config/globalvariables";

type EventItem = {  // specify to typescript about additions to .event field
  name: string;
  event: any;
};

const API_URL = `http://${IP_ADDRESS}:5000/api`;


export default function CalendarPage() {
  const [events, setEvents] = useState<{ [date: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchRsvpEvents = async () => {
        try {
          const userId = global.authUser?._id;
          if (!userId) return;
  
          const response = await fetch(`${API_URL}/events/rsvped/${userId}`);
          const data = await response.json();
  
          console.log("📅 RSVP’d events from API:", data);
  
          const groupedEvents: { [date: string]: any[] } = {};
          data.forEach((event: any) => {
            const date = new Date(event.date).toISOString().split("T")[0]; // normalize date
            if (!groupedEvents[date]) groupedEvents[date] = [];
            groupedEvents[date].push({ name: event.title, event });
          });
  
          setEvents(groupedEvents);
          setSelectedDate(new Date().toISOString().split("T")[0]); // optional: reset view to today
        } catch (error) {
          console.error("Error fetching RSVP’d events:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchRsvpEvents();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📅 Your Calendar</Text>

      <Agenda
        items={events}
        selected={selectedDate}
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        renderItem={(item: EventItem, firstItemInDay: boolean) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              setSelectedEvent(item.event);
              setModalVisible(true);
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        renderEmptyData={() => (
          <View style={styles.emptyItem}>
            <Text>No RSVP’d events for this day.</Text>
          </View>
        )}
        theme={{
          selectedDayBackgroundColor: "#4c87df",
          todayTextColor: "#4c87df",
          agendaDayTextColor: "gray",
          agendaKnobColor: "#4c87df",
          dotColor: "#4c87df",
          selectedDotColor: "#fff",
        }}
      />

      {/* Event Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
            <Text style={styles.modalText}>📅 {selectedEvent?.date}</Text>
            <Text style={styles.modalText}>
              📍 {selectedEvent?.location || 'No location provided'}
            </Text>
            <Text style={styles.modalText}>
              👥 RSVP’d: {selectedEvent?.rsvps?.length || 0}
            </Text>
            <Text style={styles.modalText}>
              📝 {selectedEvent?.description || 'No description.'}
            </Text>

            <TouchableOpacity
              style={styles.checkinBtn}
              onPress={() => {
                alert('Check-in not implemented yet.');
              }}
            >
              <Text style={styles.checkinText}>Check In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: '#555' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: Platform.select({
      ios: 60,
      default: 30,
    }),
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  emptyItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginVertical: 5,
  },
  checkinBtn: {
    backgroundColor: '#4c87df',
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkinText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 15,
    alignSelf: 'center',
  },
});