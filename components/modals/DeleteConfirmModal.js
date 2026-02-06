import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';

export default function DeleteConfirmModal({ visible, gardenName, onConfirm, onCancel }) {
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
          <Text style={styles.modalTitle}>{t('deleteGardenTitle')}</Text>
          <Text style={styles.modalMessage}>
            {t('deleteGardenMessage')} "{gardenName}"?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.modalCancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalDeleteButton]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonText}>{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
