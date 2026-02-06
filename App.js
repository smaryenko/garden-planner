import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AppHeader from './components/AppHeader';
import './styles/global.css';

import LoginScreen from './screens/LoginScreen';
import GardensListScreen from './screens/GardensListScreen';
import EditGardenScreen from './screens/EditGardenScreen';
import GardenDetailScreen from './screens/GardenDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="GardensList"
            screenOptions={{
              headerStyle: { 
                backgroundColor: '#556b2f',
                borderBottomWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: '#fff',
              headerTitleStyle: { 
                fontWeight: '600',
                fontSize: 18,
                letterSpacing: 0.5,
              },
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GardensList"
              component={GardensListScreen}
              options={{
                header: () => <AppHeader title="My Gardens" />
              }}
            />
            <Stack.Screen
              name="EditGarden"
              component={EditGardenScreen}
              options={{ title: 'Edit Garden' }}
            />
            <Stack.Screen
              name="GardenDetail"
              component={GardenDetailScreen}
              options={{ title: 'Garden Details' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </LanguageProvider>
  );
}
