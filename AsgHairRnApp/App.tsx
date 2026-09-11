import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ClinicHomeScreen from './src/screens/ClinicHomeScreen';
import HairTestScreen from './src/screens/HairTestScreen';
import PatientPortalScreen from './src/screens/PatientPortalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { THEME } from './src/config/theme';
import { clearAuthTokens } from './src/utils/apiClient';
import SessionKeepAlive from './src/components/SessionKeepAlive';

type Screen = 'Splash' | 'Welcome' | 'ClinicHome' | 'HairTest' | 'Portal' | 'Profile' | 'History';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#C23500" />
      <SessionKeepAlive />
      <AppContent />
    </View>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('Splash');

  // Shared portal auth context — lifted so all portal sub-screens share it
  const [portalToken, setPortalToken] = useState('');
  const [portalName, setPortalName] = useState('');
  const [portalStatus, setPortalStatus] = useState('');
  const [portalPhone, setPortalPhone] = useState('');
  const [allAnalyses, setAllAnalyses] = useState<any[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isSplashOrWelcome = screen === 'Splash' || screen === 'Welcome';

  const handleLogout = async () => {
    await clearAuthTokens();
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

  const navigateTo = (targetScreen: Screen) => {
    setDrawerOpen(false);
    setScreen(targetScreen);
  };

  const content = (
    <View style={styles.container}>
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
          onDrawerOpen={() => setDrawerOpen(true)}
          onPortalDataLoaded={(token, name, status, phone, analyses) => {
            setPortalToken(token);
            setPortalName(name);
            setPortalStatus(status);
            setPortalPhone(phone);
            setAllAnalyses(analyses);
          }}
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

      {/* Global Drawer — overlays Portal, Profile, and History screens */}
      {drawerOpen && isPortalScreen && (
        <>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
          <View style={styles.drawerPanel}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerBrand}>ASG Hair</Text>
                <Text style={styles.drawerSubBrand}>Patient Portal</Text>
              </View>
              <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.drawerCloseBtn}>
                <Text style={styles.drawerCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Patient Info */}
            <View style={styles.drawerPatientBadge}>
              <View style={styles.drawerAvatar}>
                <Text style={styles.drawerAvatarText}>
                  {portalName ? portalName.charAt(0).toUpperCase() : 'P'}
                </Text>
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.drawerPatientName}>{portalName || 'Patient'}</Text>
                <Text style={styles.drawerPatientStatus}>{portalStatus || 'CONSULTATION'}</Text>
              </View>
            </View>

            <View style={styles.drawerDivider} />

            {/* Navigation links */}
            <TouchableOpacity
              style={[styles.drawerNavItem, screen === 'Portal' && styles.drawerNavItemActive]}
              onPress={() => navigateTo('Portal')}
            >
              <Text style={styles.drawerNavIcon}>📊</Text>
              <Text style={[styles.drawerNavText, screen === 'Portal' && styles.drawerNavTextActive]}>
                Active Treatment
              </Text>
              {screen === 'Portal' && <View style={styles.drawerNavDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.drawerNavItem, screen === 'Profile' && styles.drawerNavItemActive]}
              onPress={() => navigateTo('Profile')}
            >
              <Text style={styles.drawerNavIcon}>👤</Text>
              <Text style={[styles.drawerNavText, screen === 'Profile' && styles.drawerNavTextActive]}>
                My Profile
              </Text>
              {screen === 'Profile' && <View style={styles.drawerNavDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.drawerNavItem, screen === 'History' && styles.drawerNavItemActive]}
              onPress={() => navigateTo('History')}
            >
              <Text style={styles.drawerNavIcon}>📋</Text>
              <Text style={[styles.drawerNavText, screen === 'History' && styles.drawerNavTextActive]}>
                Test History
              </Text>
              {screen === 'History' && <View style={styles.drawerNavDot} />}
            </TouchableOpacity>

            <View style={styles.drawerDivider} />

            <TouchableOpacity
              style={styles.drawerNavItem}
              onPress={() => navigateTo('ClinicHome')}
            >
              <Text style={styles.drawerNavIcon}>🏥</Text>
              <Text style={styles.drawerNavText}>Back to Clinic Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.drawerNavItem, { marginTop: 'auto' }]}
              onPress={() => { setDrawerOpen(false); handleLogout(); }}
            >
              <Text style={styles.drawerNavIcon}>🚪</Text>
              <Text style={[styles.drawerNavText, { color: '#FF6929' }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  if (isSplashOrWelcome) {
    return content;
  }

  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  safeArea: { flex: 1, backgroundColor: THEME.bg },
  container: { flex: 1, backgroundColor: THEME.bg },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26,10,0,0.55)',
    zIndex: 90,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: THEME.drawerBg,
    zIndex: 100,
    paddingBottom: 40,
    flexDirection: 'column',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderColor: THEME.drawerBorder,
  },
  drawerBrand: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  drawerSubBrand: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  drawerCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.drawerActive,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerCloseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  drawerPatientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 16,
  },
  drawerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: THEME.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  drawerPatientName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  drawerPatientStatus: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  drawerNavItemActive: {
    backgroundColor: THEME.drawerActive,
  },
  drawerNavIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  drawerNavText: {
    color: THEME.drawerText,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  drawerNavTextActive: {
    color: THEME.primaryLight,
    fontWeight: 'bold',
  },
  drawerNavDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primaryLight,
  },
});

export default App;
