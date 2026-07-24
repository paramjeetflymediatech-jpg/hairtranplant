import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Image
} from 'react-native';

const { width } = Dimensions.get('window');

interface WelcomeScreenProps {
  onTakeTest: () => void;
  onExploreClinic: () => void;
  onGoToPortal: () => void;
}

export default function WelcomeScreen({ 
  onTakeTest, 
  onExploreClinic, 
  onGoToPortal 
}: WelcomeScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>★ DR. SACHIN GOEL</Text>
        </View>
        <Text style={styles.title}>ASG Hair Transplant</Text>
        <Text style={styles.subtitle}>
          India's Leading Restorative Centre • Jalandhar & Ludhiana, Punjab
        </Text>
      </View>

      {/* Feature Cards Grid */}
      <View style={styles.cardsContainer}>
        {/* Card 1 */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🛡️</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>FUE & FUT Hair Transplants</Text>
            <Text style={styles.cardDesc}>
              Advanced Follicular Unit Extraction (FUE), FUT, and Bio-FUE techniques for natural high-density results.
            </Text>
          </View>
        </View>

        {/* Card 2 */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🤖</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>AI Scalp Diagnostics</Text>
            <Text style={styles.cardDesc}>
              Instantly analyze hairline recession, crown whorl thinning, and Norwood Alopecia stage in seconds.
            </Text>
          </View>
        </View>

        {/* Card 3 */}
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>💬</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>PRP & Recovery Support</Text>
            <Text style={styles.cardDesc}>
              Continuous post-op graft growth tracking and dedicated growth therapies via our WhatsApp care line.
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Stack */}
      <View style={styles.btnStack}>
        <TouchableOpacity style={styles.primaryBtn} onPress={onTakeTest}>
          <Text style={styles.primaryBtnText}>Take Free AI Hair Test</Text>
          <Text style={styles.btnSubtext}>Takes 2 mins • Requires photos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onExploreClinic}>
          <Text style={styles.secondaryBtnText}>Explore Clinic & Procedures</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={onGoToPortal}>
          <Text style={styles.linkBtnText}>Already a patient? Sign In here</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        *Disclaimer: AI diagnostics is a preliminary visual assessment tool. Final plans require in-person clinical evaluation by our hair surgeons.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19', // Premium midnight theme
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  badgeContainer: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0d9488',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 36,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  btnStack: {
    gap: 14,
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnSubtext: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  secondaryBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryBtnText: {
    color: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linkBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkBtnText: {
    color: '#0d9488',
    fontWeight: 'bold',
    fontSize: 13,
  },
  disclaimer: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 13,
  },
});
