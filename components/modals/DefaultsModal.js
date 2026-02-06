import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DefaultsModal({ 
  visible, 
  defaultSort, 
  defaultYearPlanted, 
  defaultOwner,
  onChangeSort,
  onChangeYear,
  onChangeOwner,
  onSave, 
  onCancel 
}) {
  const { t } = useLanguage();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('defaultValuesTitle')}</Text>
          <Text style={styles.modalMessage}>
            {t('defaultValuesMessage')}
          </Text>
          
          <Text style={styles.label}>{t('defaultSort')}</Text>
          <TextInput
            style={styles.input}
            value={defaultSort}
            onChangeText={onChangeSort}
            placeholder={t('placeholderSort')}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>{t('defaultYearPlanted')}</Text>
          <TextInput
            style={styles.input}
            value={defaultYearPlanted}
            onChangeText={onChangeYear}
            placeholder={t('placeholderYear')}
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>{t('defaultOwner')}</Text>
          <TextInput
            style={styles.input}
            value={defaultOwner}
            onChangeText={onChangeOwner}
            placeholder={t('placeholderOwner')}
            placeholderTextColor="#999"
          />

          <View style={styles.modalSpacer} />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.modalCancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={onSave}
            >
              <Text style={styles.modalButtonText}>{t('save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
