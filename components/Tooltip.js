import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/GardensListScreen.styles';

export default function Tooltip({ children, text, position = 'top' }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <View style={[
          styles.tooltipContent,
          position === 'bottom' && styles.tooltipContentTop
        ]}>
          <Text style={styles.tooltipText}>{text}</Text>
          <div className={position === 'bottom' ? 'tooltip-arrow tooltip-arrow-top' : 'tooltip-arrow'} />
        </View>
      )}
    </div>
  );
}
