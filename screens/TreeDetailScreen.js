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
import { styles } from '../styles/TreeDetailScreen.styles';

export default function TreeDetailScreen({ route, navigation }) {
  const { treeId, gardenId } = route.params;
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTreeDetails();
  }, []);

  const fetchTreeDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('id', treeId)
        .single();

      if (error) throw error;
      setTree(data);
    } catch (error) {
      console.error('Error fetching tree details:', error);
      Alert.alert('Error', 'Failed to load tree details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Tree', 'Are you sure you want to delete this tree?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('trees').delete().eq('id', treeId);
            if (error) throw error;
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete tree');
          }
        },
      },
    ]);
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
        <Text style={styles.title}>{tree?.name}</Text>
        
        {tree?.species && (
          <View style={styles.row}>
            <Text style={styles.label}>Species:</Text>
            <Text style={styles.value}>{tree.species}</Text>
          </View>
        )}
        
        {tree?.planted_date && (
          <View style={styles.row}>
            <Text style={styles.label}>Planted:</Text>
            <Text style={styles.value}>{tree.planted_date}</Text>
          </View>
        )}
        
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, styles.status]}>{tree?.status}</Text>
        </View>
        
        {tree?.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.label}>Notes:</Text>
            <Text style={styles.notes}>{tree.notes}</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditTree', { treeId, gardenId })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
