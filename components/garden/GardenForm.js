import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../styles/GardensListScreen.styles';
import { useLanguage } from '../../contexts/LanguageContext';

export default function GardenForm({
  isEditMode,
  name,
  description,
  location,
  backgroundImage,
  saving,
  onChangeName,
  onChangeDescription,
  onChangeLocation,
  onChangeBackgroundImage,
  onSave,
  onCancel,
}) {
  const { t } = useLanguage();
  
  return (
    <ScrollView style={styles.formContent} contentContainerStyle={styles.formContentContainer}>
      <View>
        <Text style={styles.formTitle}>{isEditMode ? t('editGarden') : t('newGarden')}</Text>
        
        <Text style={styles.label}>{t('gardenName')} *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onChangeName}
          placeholder={t('placeholderGardenName')}
        />

        <Text style={styles.label}>{t('description')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={onChangeDescription}
          placeholder={t('placeholderDescription')}
          multiline
          numberOfLines={2}
        />

        <Text style={styles.label}>{t('location')}</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={onChangeLocation}
          placeholder={t('placeholderLocation')}
        />

        <Text style={styles.label}>{t('backgroundImageUrl')}</Text>
        <TextInput
          style={styles.input}
          value={backgroundImage}
          onChangeText={onChangeBackgroundImage}
          placeholder={t('placeholderBackgroundUrl')}
        />
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: '#6c757d' }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? t('saving') : t('save')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
