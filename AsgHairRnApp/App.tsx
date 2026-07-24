import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ClinicHomeScreen from './src/screens/ClinicHomeScreen';
import HairTestScreen from './src/screens/HairTestScreen';
import PatientPortalScreen from './src/screens/PatientPortalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';

type Screen = 'Splash' | 'Welcome' | 'ClinicHome' | 'HairTest' | 'Portal' | 'Profile' | 'History';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#C23500" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('Splash');

  // Shared portal auth context — lifted so all portal sub-screens share it
  const [portalToken, setPortalToken] = useState('');
  const [portalName, setPortalName] = useState('');
  const [portalStatus, setPortalStatus] = useState('');
  const [portalPhone, setPortalPhone] = useState('');
  const [allAnalyses, setAllAnalyses] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSplashOrWelcome = screen === 'Splash' || screen === 'Welcome';
  const paddingStyle = isSplashOrWelcome
    ? { flex: 1 }
    : { flex: 1, paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom };

  const handleLogout = () => {
    setPortalToken('');
    setPortalName('');
    setPortalStatus('');
    setPortalPhone('');
    setAllAnalyses([]);
    setScreen('Portal');
  };

  const handleProfileSaved = (name: string, phone: string, newToken?: string) => {
    setPortalName(name);
    setPortalPhone(phone);
    if (newToken) setPortalToken(newToken);
  };

  return (
    <View style={[styles.container, paddingStyle]}>
      {screen === 'Splash' && <SplashScreen onFinish={() => setScreen('Welcome')} />}

      {screen === 'Welcome' && (
        <WelcomeScreen
          onTakeTest={() => setScreen('HairTest')}
          onExploreClinic={() => setScreen('ClinicHome')}
          onGoToPortal={() => setScreen('Portal')}
        />
      )}

      {screen === 'ClinicHome' && (
        <ClinicHomeScreen
          onTakeTest={() => setScreen('HairTest')}
          onGoToPortal={() => setScreen('Portal')}
          onBack={() => setScreen('Welcome')}
        />
      )}

      {screen === 'HairTest' && <HairTestScreen onBack={() => setScreen('Welcome')} />}

      {screen === 'Portal' && (
        <PatientPortalScreen
          onBack={() => setScreen('Welcome')}
          onGoToProfile={(token, name, status, phone, analyses) => {
            setPortalToken(token);
            setPortalName(name);
            setPortalStatus(status);
            setPortalPhone(phone);
            setAllAnalyses(analyses);
            setScreen('Profile');
          }}
          onGoToHistory={(token, name, status, analyses) => {
            setPortalToken(token);
            setPortalName(name);
            setPortalStatus(status);
            setAllAnalyses(analyses);
            setScreen('History');
          }}
        />
      )}

      {screen === 'Profile' && (
        <ProfileScreen
          token={portalToken}
          patientName={portalName}
          patientStatus={portalStatus}
          patientPhone={portalPhone}
          onDrawerOpen={() => setDrawerOpen(true)}
          onLogout={handleLogout}
          onBack={() => setScreen('Portal')}
          onProfileSaved={handleProfileSaved}
        />
      )}

      {screen === 'History' && (
        <HistoryScreen
          allAnalyses={allAnalyses}
          onDrawerOpen={() => setDrawerOpen(true)}
          onBack={() => setScreen('Portal')}
        />
      )}

      {/* Global Drawer — shown over Profile and History screens */}
      {drawerOpen && (screen === 'Profile' || screen === 'History') && (
        <>
          <View
            style={styles.drawerBackdrop}
            // @ts-ignore
            onClick={() => setDrawerOpen(false)}
            onTouchEnd={() => setDrawerOpen(false)}
          />
          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.drawerDot} /><View style={styles.drawerDot} /><View style={styles.drawerDot} />
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  drawerBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(26,10,0,0.55)', zIndex: 90 },
  drawerPanel: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, backgroundColor: '#1A0A00', zIndex: 100 },
  drawerHeader: { padding: 20, paddingTop: 40 },
  drawerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C23500', margin: 2 },
});

export default App;
