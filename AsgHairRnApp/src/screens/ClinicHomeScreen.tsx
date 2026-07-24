import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../config/theme';

interface ClinicHomeScreenProps {
  onTakeTest: () => void;
  onGoToPortal: () => void;
  onBack?: () => void;
}

export default function ClinicHomeScreen({ onTakeTest, onGoToPortal, onBack }: ClinicHomeScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Clinic Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.headerBackBtn} onPress={onBack}>
            <Text style={styles.headerBackBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitleBrand}>ASG</Text>
        <Text style={styles.headerTitleNormal}>HAIR TRANSPLANT</Text>
      </View>

      {/* Hero card */}
      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PREMIER HAIR INSTITUTE</Text>
        </View>

        <Text style={styles.heroHeading}>
          Aesthetic Precision.{"\n"}Natural Grafts Density.
        </Text>

        <Text style={styles.locationText}>
          📍 Lajpat Nagar, Link Road, Jalandhar, Punjab
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onTakeTest}>
          <Text style={styles.primaryButtonText}>Take Free AI Hair Test</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>10,000+</Text>
          <Text style={styles.statLabel}>Successful Cases</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: THEME.primary }]}>99.2%</Text>
          <Text style={styles.statLabel}>Graft Survival</Text>
        </View>
      </View>

      {/* Treatments list */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Our Specialized Treatments</Text>

        <View style={styles.treatmentItem}>
          <Text style={styles.treatmentTitle}>Sapphire FUE Hair Transplant</Text>
          <Text style={styles.treatmentDesc}>
            Individual follicle extraction and implanting in micro-channels created with Sapphire blades.
          </Text>
        </View>

        <View style={styles.treatmentItem}>
          <Text style={styles.treatmentTitle}>Choi DHI (Direct Implantation)</Text>
          <Text style={styles.treatmentDesc}>
            Placing grafts directly with clinical DHI implanter pens to maintain custom angle & density.
          </Text>
        </View>

        <View style={styles.treatmentItem}>
          <Text style={styles.treatmentTitle}>PRP & GFC Therapies</Text>
          <Text style={styles.treatmentDesc}>
            Growth factor concentration scalp micro-injections to reinforce active roots.
          </Text>
        </View>
      </View>

      {/* WhatsApp banner */}
      <View style={[styles.sectionCard, { borderColor: THEME.cardBorder, backgroundColor: 'rgba(214,57,0,0.05)' }]}>
        <Text style={[styles.sectionTitle, { color: THEME.primary, textAlign: 'center' }]}>
          12-Month WhatsApp Support
        </Text>
        <Text style={styles.supportDesc}>
          Every transplant client is enrolled in our 12-month post-op recovery tracking. Regular photo uploads receive direct surgeon feedback.
        </Text>
      </View>

      {/* Clinic Leadership */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Led by Dr. Sachin Goel</Text>
        <Text style={[styles.supportDesc, { textAlign: 'left' }]}>
          ASG Hair Transplant Centre is led by Dr. Sachin Goel, guiding one of the most experienced surgical teams in India. We offer FUE, FUT, Bio-FUE, and stem cell restoration at affordable costs.
        </Text>
        <View style={[styles.divider, { marginVertical: 12 }]} />
        <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 8 }]}>Our Locations</Text>
        <Text style={[styles.supportDesc, { textAlign: 'left' }]}>
          📍 422-A, Mota Singh Nagar, Cool Road, Jalandhar, Punjab, India
        </Text>
        <Text style={[styles.supportDesc, { textAlign: 'left', marginTop: 6 }]}>
          📍 Ludhiana, Punjab, India
        </Text>
      </View>

      {/* Patient Portal Option */}
      <View style={styles.portalBox}>
        <Text style={styles.portalPrompt}>Already an ASG Patient?</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={onGoToPortal}>
          <Text style={styles.secondaryButtonText}>Enter Patient Portal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
    height: 40,
  },
  headerBackBtn: {
    position: 'absolute',
    left: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: THEME.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  headerBackBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.textSecondary,
  },
  headerTitleBrand: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.primary,
    marginRight: 6,
  },
  headerTitleNormal: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  heroCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  badge: {
    backgroundColor: THEME.badge,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    color: THEME.badgeText,
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: THEME.textSecondary,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 16,
  },
  treatmentItem: {
    marginBottom: 16,
  },
  treatmentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  treatmentDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 16,
  },
  supportDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.cardBorder,
    width: '100%',
  },
  portalBox: {
    alignItems: 'center',
    marginTop: 10,
  },
  portalPrompt: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: THEME.primary,
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: THEME.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
