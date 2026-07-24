import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
          <Text style={[styles.statNumber, { color: '#0d9488' }]}>99.2%</Text>
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
      <View style={[styles.sectionCard, { borderColor: 'rgba(5,150,105,0.2)', backgroundColor: 'rgba(5,150,105,0.04)' }]}>
        <Text style={[styles.sectionTitle, { color: '#059669', textAlign: 'center' }]}>
          12-Month WhatsApp Support
        </Text>
        <Text style={styles.supportDesc}>
          Every transplant client is enrolled in our 12-month post-op recovery tracking. regular photo uploads receive direct surgeon feedback.
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  headerBackBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  headerTitleBrand: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0d9488',
    marginRight: 6,
  },
  headerTitleNormal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  badge: {
    backgroundColor: 'rgba(13,148,136,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    color: '#0d9488',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0d9488',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  treatmentItem: {
    marginBottom: 16,
  },
  treatmentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 4,
  },
  treatmentDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  supportDesc: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    width: '100%',
  },
  portalBox: {
    alignItems: 'center',
    marginTop: 10,
  },
  portalPrompt: {
    fontSize: 12,
    color: '#475569',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#0f172a',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
