import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/AddTreeScreen.styles';

export default function AddTreeScreen({ route, navigation }) {
  const { gardenId } = route.params;
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [plantedDate, setPlantedDate] = useState('');
  const [status, setStatus] = useState('healthy');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a tree name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('trees').insert([
        {
          garden_id: gardenId,
          name: name.trim(),
          species: species.trim() || null,
          planted_date: plantedDate || null,
          status: status,
          notes: notes.trim() || null,
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Tree added successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding tree:', error);
      Alert.alert('Error', 'Failed to add tree');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Tree Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Apple Tree"
        />

        <Text style={styles.label}>Species</Text>
        <TextInput
          style={styles.input}
          value={species}
          onChangeText={setSpecies}
          placeholder="e.g., Malus domestica"
        />

        <Text style={styles.label}>Planted Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={plantedDate}
          onChangeText={setPlantedDate}
          placeholder="e.g., 2024-01-15"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusButtons}>
          {['healthy', 'needs attention', 'sick', 'dead'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusButton, status === s && styles.statusButtonActive]}
              onPress={() => setStatus(s)}
            >
              <Text style={[styles.statusButtonText, status === s && styles.statusButtonTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Tree'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
