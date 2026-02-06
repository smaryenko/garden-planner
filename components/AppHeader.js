import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';

export default function AppHeader({ title }) {
  const { user, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigation = useNavigation();
  const isAdminUser = isAdmin();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{t('myGardens')}</Text>
      <View style={styles.rightSection}>
        {/* Language Selector */}
        <select
          className="language-selector"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">🇬🇧 EN</option>
          <option value="uk">🇺🇦 UA</option>
          <option value="it">🇮🇹 IT</option>
        </select>
        
        {user && (
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>
              {isAdminUser ? `👤 ${t('admin')}` : `👁️ ${t('viewer')}`}
            </Text>
          </View>
        )}
        
        {isAdminUser ? (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
              navigation.replace('GardensList');
            }}
            activeOpacity={0.7}
          >
            <FontAwesome name="sign-out" size={14} color="#fff" />
            <Text style={styles.buttonText}>{t('logout')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <FontAwesome name="sign-in" size={14} color="#fff" />
            <Text style={styles.buttonText}>{t('login')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#556b2f',
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  languageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  userBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  userBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
