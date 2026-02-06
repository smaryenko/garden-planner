import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AvatarModal({ visible, avatarUrl, onChangeUrl, onSave, onCancel }) {
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
          <Text style={styles.modalTitle}>{t('customAvatarTitle')}</Text>
          <Text style={styles.modalMessage}>
            {t('customAvatarMessage')}
          </Text>
          <TextInput
            style={styles.input}
            value={avatarUrl}
            onChangeText={onChangeUrl}
            placeholder={t('placeholderBackgroundUrl')}
          />
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
