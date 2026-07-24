import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/apiConfig';

const STAGE_DETAILS: Record<string, { title: string; desc: string; symptoms: string[]; care: string }> = {
  'Norwood I': {
    title: 'Norwood Stage I: Minimal Loss',
    desc: 'No visible recession or crown thinning. Follicles are highly active.',
    symptoms: ['Symmetrical density', 'Intact hairline', 'Minimal daily shedding'],
    care: 'Standard biotin support, high-protein nutrition, and mild shampoos.',
  },
  'Norwood II': {
    title: 'Norwood Stage II: Mild Temple Recession',
    desc: 'Symmetrical hair recession at the temple peaks. Hairline starts to show M/V shaped recession.',
    symptoms: ['Mild temple recession', 'Preserved crown density', 'V-shape beginning'],
    care: 'DHT blocker serums, scalp stimulation, and multivitamins.',
  },
  'Norwood III': {
    title: 'Norwood Stage III: Moderate Receding Hairline',
    desc: 'Deep recession at the temples, forming a distinct M, U, or V shape. Officially classified as clinical alopecia.',
    symptoms: ['Deep temple recession', 'Frontal hairline thinning', 'Visible scalp under light'],
    care: 'Medical DHT-blocker therapies or minor FUE transplant.',
  },
  'Norwood III Vertex': {
    title: 'Norwood Stage III Vertex: Crown Loss',
    desc: 'Recessed temple hairline combined with thinning spot at the back whorl.',
    symptoms: ['Temple recession', 'Thinning spot at crown vertex', 'Frontal hairline intact'],
    care: 'PRP/GFC therapy combined with clinical micro-needling or crown FUE.',
  },
  'Norwood IV': {
    title: 'Norwood Stage IV: Frontal & Crown Recession',
    desc: 'Significant baldness at both the front hairline and the crown, with a dense bridge of hair separating them.',
    symptoms: ['Temples receded deeply', 'Crown bald spot visible', 'Solid hair bridge on top'],
    care: 'Sapphire FUE transplant recommended (1,800 - 2,500 grafts).',
  },
  'Norwood V': {
    title: 'Norwood Stage V: Severe Hair Loss',
    desc: 'The bridge of hair separating the front and back thinning areas becomes very thin and sparse.',
    symptoms: ['Frontal and vertex bald areas enlarge', 'Separating bridge thins out', 'Horseshoe shape outlines'],
    care: 'High-density Sapphire FUE / DHI transplant (2,500 - 3,500 grafts).',
  },
  'Norwood VI': {
    title: 'Norwood Stage VI: Conjoined Baldness',
    desc: 'The bridge of hair is completely gone, merging the front hairline and crown bald zone into one big area.',
    symptoms: ['Merged front-to-back baldness', 'Sparse top coverage', 'Donor area intact on sides'],
    care: 'Extensive Sapphire FUE transplant (3,500 - 4,500 grafts) over 2 days.',
  },
  'Norwood VII': {
    title: 'Norwood Stage VII: Extensive Baldness',
    desc: 'The most advanced stage of alopecia. Only a narrow horseshoe band of hair remains on the sides and back.',
    symptoms: ['Complete top baldness', 'Lower donor boundary', 'Wispy side hair texture'],
    care: 'Combination of scalp and beard/body hair FUE megasession.',
  },
  'UNCERTAIN': {
    title: 'Diffuse Thinning / Uncertain Classification',
    desc: 'Pattern presents diffuse thinning across the top rather than standard hairline recession.',
    symptoms: ['Overall reduction in density', 'Intact hairline shape', 'Visible scalp under light'],
    care: 'PRP/GFC therapy sessions combined with topical clinical hair boosters.',
  }
};

export default function PatientPortalScreen({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Portal Data States
  const [loadingData, setLoadingData] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientStatus, setPatientStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const fetchPortalData = async (activeToken: string) => {
    setLoadingData(true);
    try {
      const res = await fetch(`${BASE_URL}/api/portal/dashboard`, {
        method: 'GET',
        headers: { 'Cookie': `graftdesk_session=${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const patient = data.patient;
          setPatientName(patient.name || 'Patient');
          setPatientStatus(patient.status || 'CONSULTATION');

          const analyses = patient.hairAnalyses;
          if (analyses && analyses.length > 0) {
            const lastAnalysis = analyses[0];
            if (lastAnalysis.aiAnalysis) {
              try {
                const aiObj = JSON.parse(lastAnalysis.aiAnalysis);
                setAnalysisResult(aiObj);
              } catch (e) {
                setAnalysisResult({
                  norwoodStage: lastAnalysis.hairLossStage || 'UNCERTAIN',
                  estimatedGraftRequirement: {
                    minimumGrafts: lastAnalysis.estimatedMinGrafts || 1500,
                    maximumGrafts: lastAnalysis.estimatedMaxGrafts || 2000,
                  },
                  donorArea: {
                    rating: lastAnalysis.donorAreaQuality || 'GOOD',
                    densityEstimateGraftsPerCm2: lastAnalysis.hairDensity || null,
                  },
                  procedureAssessment: {
                    preliminaryRecommendation: 'FUE',
                  }
                });
              }
            } else {
              setAnalysisResult({
                norwoodStage: lastAnalysis.hairLossStage || 'UNCERTAIN',
                estimatedGraftRequirement: {
                  minimumGrafts: lastAnalysis.estimatedMinGrafts || 1500,
                  maximumGrafts: lastAnalysis.estimatedMaxGrafts || 2000,
                },
                donorArea: {
                  rating: lastAnalysis.donorAreaQuality || 'GOOD',
                  densityEstimateGraftsPerCm2: lastAnalysis.hairDensity || null,
                },
                procedureAssessment: {
                  preliminaryRecommendation: 'FUE',
                }
              });
            }
          } else {
            setAnalysisResult(null);
          }
        }
      } else if (res.status === 401) {
        await AsyncStorage.removeItem('auth_token');
        setToken('');
        setIsLoggedIn(false);
        Alert.alert('Session Expired', 'Please log in again.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const renderAnalysisDetails = (result: any) => {
    if (!result) return null;
    const info = STAGE_DETAILS[result.norwoodStage] || STAGE_DETAILS.UNCERTAIN;
    const confidence = result.confidenceScore
      ? `${(result.confidenceScore <= 1 ? result.confidenceScore * 100 : result.confidenceScore).toFixed(0)}%`
      : 'N/A';

    return (
      <View style={styles.detailsContainer}>
        {/* 1. IMAGE QUALITY & CONFIDENCE */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Assessment Confidence & Quality</Text>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>AI Confidence Score</Text>
            <Text style={styles.paramValue}>{confidence}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Image Quality Overall</Text>
            <Text style={styles.paramValue}>{result.imageQuality?.overall || 'GOOD'}</Text>
          </View>
          {result.imageQuality?.visibleAreas && result.imageQuality.visibleAreas.length > 0 && (
            <Text style={styles.detailListText}>
              Visible Areas: {result.imageQuality.visibleAreas.join(', ')}
            </Text>
          )}
        </View>

        {/* 2. ALOPECIA CLASSIFICATION */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>{info.title}</Text>
          <Text style={styles.explanationDesc}>{info.desc}</Text>
          {result.norwoodDescription ? (
            <Text style={[styles.explanationDesc, { marginTop: 6, fontStyle: 'italic' }]}>
              AI Description: {result.norwoodDescription}
            </Text>
          ) : null}
          <Text style={[styles.explanationDesc, { fontWeight: 'bold', marginTop: 8 }]}>
            Care Suggestion: {info.care}
          </Text>
        </View>

        {/* 3. LOSS PATTERN & SEVERITY */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Loss Pattern & Severity</Text>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Pattern Type</Text>
            <Text style={styles.paramValue}>{result.hairLossPattern || 'UNCERTAIN'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Severity Level</Text>
            <Text style={styles.paramValue}>{result.hairLossSeverity || 'UNCERTAIN'}</Text>
          </View>
        </View>

        {/* 4. DONOR AREA */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Donor Area Assessment</Text>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Quality Rating</Text>
            <Text style={styles.paramValue}>{result.donorArea?.rating || 'GOOD'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Density Estimate</Text>
            <Text style={styles.paramValue}>
              {result.donorArea?.densityEstimateGraftsPerCm2 
                ? `${result.donorArea.densityEstimateGraftsPerCm2} Grafts/cm²` 
                : 'N/A'}
            </Text>
          </View>
          {result.donorArea?.observations ? (
            <Text style={[styles.explanationDesc, { marginTop: 6 }]}>
              Observations: {result.donorArea.observations}
            </Text>
          ) : null}
        </View>

        {/* 5. GRAFT ESTIMATION & RECOMMENDATION */}
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Procedure Recommendation</Text>
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Suggested Method</Text>
            <Text style={styles.paramValue}>{result.procedureAssessment?.preliminaryRecommendation || 'FUE'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Grafts Range Estimate</Text>
            <Text style={styles.paramValue}>
              {result.estimatedGraftRequirement?.minimumGrafts || 1500} - {result.estimatedGraftRequirement?.maximumGrafts || 2000}
            </Text>
          </View>
          {result.estimatedGraftRequirement?.estimatedRangeDescription ? (
            <Text style={[styles.explanationDesc, { marginTop: 6, fontWeight: '500' }]}>
              Range Details: {result.estimatedGraftRequirement.estimatedRangeDescription}
            </Text>
          ) : null}
          {result.procedureAssessment?.rationale ? (
            <Text style={[styles.explanationDesc, { marginTop: 8, color: '#475569' }]}>
              Rationale: {result.procedureAssessment.rationale}
            </Text>
          ) : null}
        </View>

        {/* 6. ZONE BREAKDOWN */}
        {result.zoneBreakdown && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationTitle}>Zone-by-Zone Breakdown</Text>
            
            <View style={styles.zoneBlock}>
              <Text style={styles.zoneLabel}>Frontal Recession</Text>
              <Text style={styles.zoneValue}>{result.zoneBreakdown.frontalRecession || 'Moderate Hair Loss'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.zoneBlock}>
              <Text style={styles.zoneLabel}>Mid-Scalp Density</Text>
              <Text style={styles.zoneValue}>{result.zoneBreakdown.midScalpDensity || 'Thinning Detected'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.zoneBlock}>
              <Text style={styles.zoneLabel}>Crown Whorl</Text>
              <Text style={styles.zoneValue}>{result.zoneBreakdown.crownVertex || 'Thinning whorl'}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.zoneBlock}>
              <Text style={styles.zoneLabel}>Temporal Peaks</Text>
              <Text style={styles.zoneValue}>{result.zoneBreakdown.temporalPeaks || 'Mild Recession'}</Text>
            </View>
          </View>
        )}

        {/* 7. CLINICAL OBSERVATIONS */}
        {result.clinicalObservations && result.clinicalObservations.length > 0 && (
          <View style={styles.explanationBox}>
            <Text style={[styles.explanationTitle, { color: '#0f172a' }]}>Clinical Observations</Text>
            {result.clinicalObservations.map((obs: string, idx: number) => (
              <Text key={idx} style={styles.obsItem}>• {obs}</Text>
            ))}
          </View>
        )}

        {/* 8. NEXT STEPS */}
        {result.recommendedNextSteps && result.recommendedNextSteps.length > 0 && (
          <View style={styles.explanationBox}>
            <Text style={[styles.explanationTitle, { color: '#059669' }]}>Recommended Next Steps</Text>
            {result.recommendedNextSteps.map((stepStr: string, idx: number) => (
              <Text key={idx} style={[styles.obsItem, { color: '#475569' }]}>• {stepStr}</Text>
            ))}
          </View>
        )}

        {/* 9. CLINICAL DISCLAIMER */}
        {result.disclaimer ? (
          <View style={[styles.explanationBox, { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }]}>
            <Text style={[styles.explanationTitle, { color: '#dc2626' }]}>Clinical Disclaimer</Text>
            <Text style={[styles.explanationDesc, { color: '#991b1b', fontSize: 10 }]}>
              {result.disclaimer}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  useEffect(() => {
    const loadSession = async () => {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        setIsLoggedIn(true);
        fetchPortalData(storedToken);
      }
    };
    loadSession();
  }, []);

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) {
      Alert.alert('Details Required', 'Email and password are required.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput.trim(),
          clinicSlug: 'asg-hair'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      await AsyncStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      fetchPortalData(data.token);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setToken('');
    setIsLoggedIn(false);
    setPatientName('');
    setPatientStatus('');
    setAnalysisResult(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>ASG Patient Portal</Text>

      {isLoggedIn ? (
        loadingData ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0d9488" />
          </View>
        ) : (
          // Dashboard View
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.patientName}>{patientName}</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>Status: {patientStatus}</Text>
            </View>

            {analysisResult ? (
              <View style={styles.assessmentBox}>
                <Text style={styles.assessmentHeading}>Last AI Scalp Assessment</Text>
                {renderAnalysisDetails(analysisResult)}
              </View>
            ) : (
              <Text style={styles.noDataText}>
                No diagnostics records found. Take a hair test to submit photos and receive an AI scalp analysis.
              </Text>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out Profile</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        // Login View
        <View style={styles.card}>
          <Text style={styles.loginTitle}>Patient Sign In</Text>

          <TextInput 
            placeholder="Registered Email Address"
            value={emailInput}
            onChangeText={setEmailInput}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput 
            placeholder="Account Password"
            value={passwordInput}
            onChangeText={setPasswordInput}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In to Portal</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
        <Text style={styles.backHomeBtnText}>Back to Clinic Info</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 20,
  },
  loaderContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  patientName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(13,148,136,0.1)',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 24,
  },
  statusBadgeText: {
    color: '#0d9488',
    fontSize: 10,
    fontWeight: 'bold',
  },
  assessmentBox: {
    marginTop: 10,
  },
  assessmentHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 16,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center',
  },
  paramLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  paramValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  noDataText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  detailsContainer: {
    marginTop: 10,
  },
  zoneBlock: {
    paddingVertical: 10,
  },
  zoneLabel: {
    fontSize: 11,
    color: '#0d9488',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  zoneValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 16,
  },
  detailListText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '600',
  },
  explanationBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 6,
  },
  explanationDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  obsItem: {
    fontSize: 11,
    color: '#475569',
    marginTop: 3,
  },
  logoutButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  loginButton: {
    backgroundColor: '#0d9488',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backHomeBtn: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  backHomeBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
});
