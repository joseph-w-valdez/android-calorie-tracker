import { AddEntryModal } from '@/src/components/AddEntryModal';
import { EntryRow } from '@/src/components/EntryRow';
import type { Entry } from '@/src/db/schema';
import { useDay } from '@/src/hooks/useDay';
import { getTodayLocal, parseDateLocal } from '@/src/utils/dateUtils';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface TodayScreenProps {
  date?: string; // Optional date in YYYY-MM-DD format
}

export function TodayScreen({ date }: TodayScreenProps = {}) {
  // Use provided date or default to today
  const selectedDate = date || getTodayLocal();
  const { entries, caloriesIn, caloriesOut, net, weight, addEntry, updateEntry, deleteEntry, updateWeight } = useDay(selectedDate);
  
  const [weightInput, setWeightInput] = useState(weight?.toString() || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Sync weight input with database value
  useEffect(() => {
    setWeightInput(weight?.toString() || '');
  }, [weight]);

  const foodEntries = entries.filter(e => e.type === 'food');
  const exerciseEntries = entries.filter(e => e.type === 'exercise');

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setModalVisible(true);
  };

  const handleModalSubmit = (type: 'food' | 'exercise', name: string, calories: number, entryId?: string) => {
    if (entryId && editingEntry) {
      // Update existing entry
      updateEntry(entryId, type, name, calories);
      setEditingEntry(null);
    } else {
      // Add new entry
      addEntry(type, name, calories);
    }
    setModalVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingEntry(null);
  };

  const handleWeightChange = (text: string) => {
    setWeightInput(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      updateWeight(num);
    } else if (text === '') {
      updateWeight(null);
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date string in local timezone to avoid timezone issues
    const date = parseDateLocal(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Date Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>

        {/* Weight Input */}
        <View style={styles.weightContainer}>
          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.weightInput}
            value={weightInput}
            onChangeText={handleWeightChange}
            placeholder="Enter weight"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        {/* Net Calories Display */}
        <View style={styles.netContainer}>
          <Text style={styles.netLabel}>Net Calories</Text>
          <Text style={[styles.netValue, net < 0 ? styles.netNegative : styles.netPositive]}>
            {net > 0 ? '+' : ''}{net}
          </Text>
          <View style={styles.netBreakdown}>
            <Text style={styles.breakdownText}>In: {caloriesIn}</Text>
            <Text style={styles.breakdownText}>Out: {caloriesOut}</Text>
          </View>
        </View>

        {/* Food Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food ({foodEntries.length})</Text>
          {foodEntries.length === 0 ? (
            <Text style={styles.emptyText}>No food entries yet</Text>
          ) : (
            foodEntries.map(entry => (
              <EntryRow key={entry.id} entry={entry} onEdit={handleEditEntry} onDelete={deleteEntry} />
            ))
          )}
        </View>

        {/* Exercise Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise ({exerciseEntries.length})</Text>
          {exerciseEntries.length === 0 ? (
            <Text style={styles.emptyText}>No exercise entries yet</Text>
          ) : (
            exerciseEntries.map(entry => (
              <EntryRow key={entry.id} entry={entry} onEdit={handleEditEntry} onDelete={deleteEntry} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        style={styles.addButton}
        onPress={() => {
          setEditingEntry(null);
          setModalVisible(true);
        }}
        android_ripple={{ color: '#3a7fc4' }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      {/* Add/Edit Entry Modal */}
      <AddEntryModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        onDelete={deleteEntry}
        entry={editingEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dateText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  weightContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  weightInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  netContainer: {
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  netLabel: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  netValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  netNegative: {
    color: '#4ade80', // Green
  },
  netPositive: {
    color: '#f87171', // Red
  },
  netBreakdown: {
    flexDirection: 'row',
    gap: 20,
  },
  breakdownText: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a9eff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});

