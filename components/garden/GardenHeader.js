import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';
import Tooltip from '../Tooltip';

export default function GardenHeader({ 
  garden, 
  onOpenLocation, 
  onEdit, 
  onOpenDefaults,
  onDelete,
  isAdmin = false,
  showAvailableOnly = false,
  onToggleAvailableOnly,
}) {
  const { t } = useLanguage();
  
  return (
    <View style={styles.cardHeader}>
      <Text style={styles.cardHeaderTitle}>{garden.name}</Text>
      {garden.description && (
        <Text style={styles.cardHeaderDescription}>{garden.description}</Text>
      )}
      <View style={styles.headerButtons}>
        {garden?.location && (
          <Tooltip text={t('tooltipLocation')} position="bottom">
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => onOpenLocation(garden.location)}
            >
              <FontAwesome name="map-marker" size={18} color="#666" />
            </TouchableOpacity>
          </Tooltip>
        )}
        
        {/* Show Available Only Toggle */}
        <Tooltip text={t('showAvailableOnly')} position="bottom">
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onToggleAvailableOnly}
          >
            <View style={[
              styles.toggleSwitch,
              showAvailableOnly && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleKnob,
                showAvailableOnly && styles.toggleKnobActive
              ]} />
            </View>
          </TouchableOpacity>
        </Tooltip>
        
        {isAdmin && (
          <>
            <Tooltip text={t('tooltipEdit')} position="bottom">
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => onEdit(garden)}
              >
                <FontAwesome name="pencil" size={16} color="#666" />
              </TouchableOpacity>
            </Tooltip>
            <Tooltip text={t('tooltipDefaults')} position="bottom">
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onOpenDefaults}
              >
                <FontAwesome name="cog" size={16} color="#666" />
              </TouchableOpacity>
            </Tooltip>
            <Tooltip text={t('tooltipDelete')} position="bottom">
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => onDelete(garden)}
              >
                <FontAwesome name="trash-o" size={16} color="#666" />
              </TouchableOpacity>
            </Tooltip>
          </>
        )}
      </View>
    </View>
  );
}
