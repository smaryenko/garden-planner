import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';

export default function EditPhotoModal({ 
  visible, 
  onClose, 
  photoUrl, 
  onSave,
}) {
  const [urlInput, setUrlInput] = useState(photoUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(photoUrl || '');

  useEffect(() => {
    if (visible) {
      setUrlInput(photoUrl || '');
      setPreviewUrl(photoUrl || '');
    }
  }, [visible, photoUrl]);

  useEffect(() => {
    if (urlInput && urlInput !== previewUrl && !uploading) {
      setPreviewUrl(urlInput);
    }
  }, [urlInput]);

  if (!visible) return null;

  const handleSave = async () => {
    await onSave(urlInput);
    onClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    }
  };

  const handleFileUpload = (file) => {
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreviewUrl(dataUrl);
      setUrlInput(dataUrl);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const modalContent = (
    <View style={styles.modalOverlay} onClick={onClose}>
      <View style={styles.photoModalContent} onClick={(e) => e.stopPropagation()}>
        <Text style={styles.modalTitle}>Edit Tree Photo</Text>

        <Text style={styles.label}>Photo URL</Text>
        <TextInput
          style={styles.input}
          value={urlInput}
          onChangeText={setUrlInput}
          placeholder="Enter image URL"
          placeholderTextColor="#999"
        />

        <View style={styles.photoModalDivider}>
          <View style={styles.photoModalDividerLine} />
          <Text style={styles.photoModalDividerText}>OR</Text>
          <View style={styles.photoModalDividerLine} />
        </View>

        <div
          style={{
            ...styles.photoDropZone,
            ...(isDragging && styles.photoDropZoneDragging),
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="edit-photo-file-input"
          />
          <label htmlFor="edit-photo-file-input" style={styles.photoDropZoneLabel}>
            <FontAwesome name="cloud-upload" size={32} color="#556b2f" />
            <Text style={styles.photoDropZoneText}>
              {isDragging ? 'Drop image here' : 'Drag & drop or click to select'}
            </Text>
          </label>
        </div>

        {uploading && (
          <View style={styles.photoPreviewContainer}>
            <ActivityIndicator size="large" color="#556b2f" />
          </View>
        )}

        {!uploading && previewUrl && (
          <View style={styles.photoPreviewContainer}>
            <Image 
              source={{ uri: previewUrl }} 
              style={styles.photoPreview}
              resizeMode="contain"
            />
          </View>
        )}

        {!uploading && !previewUrl && (
          <View style={styles.photoPreviewContainer}>
            <Text style={styles.photoNoPreviewText}>No photo available</Text>
          </View>
        )}

        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalCancelButton]}
            onPress={onClose}
          >
            <Text style={styles.modalCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modalButton, styles.modalSaveButton]}
            onPress={handleSave}
          >
            <Text style={styles.modalButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}
