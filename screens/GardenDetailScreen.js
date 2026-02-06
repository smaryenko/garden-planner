import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/GardenDetailScreen.styles';

export default function GardenDetailScreen({ route, navigation }) {
  const { gardenId } = route.params;
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGardenDetails();
  }, []);

  const fetchGardenDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('gardens')
        .select('*')
        .eq('id', gardenId)
        .single();

      if (error) throw error;
      setGarden(data);
    } catch (error) {
      console.error('Error fetching garden details:', error);
      Alert.alert('Error', 'Failed to load garden details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGarden = () => {
    Alert.alert(
      'Delete Garden',
      'Are you sure you want to delete this garden?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('gardens').delete().eq('id', gardenId);
              if (error) throw error;
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete garden');
            }
          },
        },
      ]
    );
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
      <View style={styles.content}>
        <Text style={styles.title}>{garden?.name}</Text>
        <Text style={styles.gardenId}>ID: {garden?.id}</Text>
        
        {garden?.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{garden.description}</Text>
          </View>
        )}
        
        {garden?.location && (
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{garden.location}</Text>
          </View>
        )}
        
        {garden?.background_image && (
          <View style={styles.section}>
            <Text style={styles.label}>Background Image</Text>
            <Text style={styles.value}>{garden.background_image}</Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.statusText, !garden?.is_active && styles.statusInactive]}>
            {garden?.is_active ? '● Active' : '○ Inactive'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditGarden', { gardenId })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteGarden}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
