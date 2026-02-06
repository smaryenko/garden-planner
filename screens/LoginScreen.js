import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(process.env.EXPO_PUBLIC_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    setLoading(false);

    if (result.success) {
      navigation.replace('GardensList');
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleBackToViewer = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToViewer}
        >
          <Text style={styles.backButtonText}>← Back to Viewer Mode</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Garden Planner</Text>
        <Text style={styles.subtitle}>Admin Login</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login as Admin</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 40,
    paddingTop: 60,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '400',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2a2a2a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '300',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    fontSize: 15,
    color: '#2a2a2a',
  },
  error: {
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  button: {
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButton: {
    backgroundColor: '#556b2f',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
    elevation: 2,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  guestButtonText: {
    color: '#666',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
