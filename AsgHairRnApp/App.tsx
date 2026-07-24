import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ClinicHomeScreen from './src/screens/ClinicHomeScreen';
import HairTestScreen from './src/screens/HairTestScreen';
import PatientPortalScreen from './src/screens/PatientPortalScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<'Splash' | 'Welcome' | 'ClinicHome' | 'HairTest' | 'Portal'>('Splash');

  const paddingStyle = currentScreen === 'Splash' || currentScreen === 'Welcome'
    ? { flex: 1 }
    : { flex: 1, paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom };

  return (
    <View style={[styles.container, paddingStyle]}>
      {currentScreen === 'Splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('Welcome')} />
      )}
      {currentScreen === 'Welcome' && (
        <WelcomeScreen 
          onTakeTest={() => setCurrentScreen('HairTest')}
          onExploreClinic={() => setCurrentScreen('ClinicHome')}
          onGoToPortal={() => setCurrentScreen('Portal')}
        />
      )}
      {currentScreen === 'ClinicHome' && (
        <ClinicHomeScreen 
          onTakeTest={() => setCurrentScreen('HairTest')}
          onGoToPortal={() => setCurrentScreen('Portal')}
          onBack={() => setCurrentScreen('Welcome')}
        />
      )}
      {currentScreen === 'HairTest' && (
        <HairTestScreen 
          onBack={() => setCurrentScreen('Welcome')}
        />
      )}
      {currentScreen === 'Portal' && (
        <PatientPortalScreen 
          onBack={() => setCurrentScreen('Welcome')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});

export default App;
