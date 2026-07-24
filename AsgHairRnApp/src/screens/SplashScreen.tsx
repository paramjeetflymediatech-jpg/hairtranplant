import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const pulseAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in text and logo
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse loop animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Finish splash after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Glowing Logo Icon */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.logoWrapper}>
            <Animated.Image 
              source={require('../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Branding text */}
        <Text style={styles.brandTitle}>A S G</Text>
        <Text style={styles.brandSubtitle}>HAIR RESTORATION</Text>
        <Text style={styles.tagline}>Precision Diagnostics • Advanced Surgery</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>POWERED BY GEMINI AI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19', // Premium midnight dark blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#0d9488',
    padding: 10,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d9488', // Teal accent
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
  },
});
