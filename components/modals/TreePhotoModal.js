import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../../styles/GardensListScreen.styles';

export default function TreePhotoModal({ 
  visible, 
  onClose, 
  photoUrl, 
  isAdminUser 
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && photoUrl) {
      setLoading(true);
    }
  }, [visible, photoUrl]);

  if (!visible || !photoUrl) return null;

  const modalContent = (
    <div style={styles.photoViewModalOverlay} onClick={onClose}>
      <div style={styles.photoViewModalContent} onClick={(e) => e.stopPropagation()}>
        <TouchableOpacity 
          style={styles.photoModalCloseOutside}
          onPress={onClose}
        >
          <FontAwesome name="times" size={28} color="#556b2f" />
        </TouchableOpacity>
        
        {loading && (
          <div style={styles.photoModalLoading}>
            <ActivityIndicator size="large" color="#556b2f" />
          </div>
        )}
        <img 
          src={photoUrl} 
          alt="Tree"
          style={styles.photoViewImage}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
}
