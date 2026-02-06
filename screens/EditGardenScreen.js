import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/EditGardenScreen.styles';

export default function EditGardenScreen({ route, navigation }) {
  const { gardenId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGarden();
  }, []);

  const fetchGarden = async () => {
    try {
      const { data, error } = await supabase
        .from('gardens')
        .select('*')
        .eq('id', gardenId)
        .single();

      if (error) throw error;
      
      setName(data.name);
      setDescription(data.description || '');
      setLocation(data.location || '');
      setBackgroundImage(data.background_image || '');
    } catch (error) {
      console.error('Error fetching garden:', error);
      Alert.alert('Error', 'Failed to load garden');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a garden name');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('gardens')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          background_image: backgroundImage.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', gardenId);

      if (error) throw error;

      Alert.alert('Success', 'Garden updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating garden:', error);
      Alert.alert('Error', 'Failed to update garden');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Garden Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Backyard Garden"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your garden..."
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Backyard, Front Yard"
        />

        <Text style={styles.label}>Background Image URL</Text>
        <TextInput
          style={styles.input}
          value={backgroundImage}
          onChangeText={setBackgroundImage}
          placeholder="https://example.com/image.jpg"
        />

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'Saving...' : 'Update Garden'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
