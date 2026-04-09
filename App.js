import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [showHome, setShowHome] = useState(false);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {showHome ? (
        <HomeScreen />
      ) : (
        <WelcomeScreen onTakeTour={() => setShowHome(true)} />
      )}
    </SafeAreaProvider>
  );
}
