import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Linking, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { BASE_URL } from '../config/apiConfig';

// Norwood descriptions dictionary
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

interface HairTestScreenProps {
  onBack: () => void;
}

export default function HairTestScreen({ onBack }: HairTestScreenProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Session state
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form Questionnaire States
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [thinningArea, setThinningArea] = useState('');
  const [fallSpeed, setFallSpeed] = useState('');
  const [sleep, setSleep] = useState('');
  const [stress, setStress] = useState('');
  const [diet, setDiet] = useState('');
  const [dandruff, setDandruff] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Contact details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Photo Base64s
  const [frontPhoto, setFrontPhoto] = useState('');
  const [topPhoto, setTopPhoto] = useState('');
  const [backPhoto, setBackPhoto] = useState('');

  // Result Metadata
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [registerPassword, setRegisterPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [whatsappTracked, setWhatsappTracked] = useState(false);

  // Fetch session on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch user credentials
          const res = await fetch(`${BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: { 'Cookie': `graftdesk_session=${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user && data.user.role === 'PATIENT') {
              setIsLoggedIn(true);
              setName(data.user.name || '');
              setEmail(data.user.email || '');
              setPhone(data.user.phone || '');
            }
          }
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    };
    fetchSession();
  }, []);

  const selectPhoto = (setter: (val: string) => void) => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
      if (response.assets && response.assets[0]?.base64) {
        setter(response.assets[0].base64);
      }
    });
  };

  const nextStep = () => {
    if (step === 1 && (!gender || !age)) {
      Alert.alert('Details Required', 'Please select both your gender and age group.');
      return;
    }
    if (step === 2 && (!thinningArea || !fallSpeed)) {
      Alert.alert('Details Required', 'Please specify your thinning area and rate of hair fall.');
      return;
    }
    if (step === 3 && (!sleep || !stress || !diet || !dandruff)) {
      Alert.alert('Details Required', 'Please provide sleep, stress, diet, and dandruff details.');
      return;
    }
    if (step === 4 && !familyHistory) {
      Alert.alert('Details Required', 'Please answer the family history query.');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!name || !email) {
      Alert.alert('Contact Required', 'Please enter your name and email to receive the report.');
      return;
    }

    setLoading(true);

    const answersSummary = `Lifestyle Profile: Gender: ${gender}, Age: ${age}, Concern: ${thinningArea}, Hairfall Rate: ${fallSpeed}, Sleep: ${sleep}, Stress: ${stress}, Dandruff: ${dandruff}, Diet: ${diet}, Genetic Factor: ${familyHistory}`;

    const photosPayload: any = {};
    if (frontPhoto) photosPayload.frontPhoto = frontPhoto;
    if (topPhoto) photosPayload.topPhoto = topPhoto;
    if (backPhoto) photosPayload.backPhoto = backPhoto;

    // Use dummy placeholder if no photo was uploaded
    if (Object.keys(photosPayload).length === 0) {
      photosPayload.frontPhoto = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    try {
      const res = await fetch(`${BASE_URL}/api/public/ai-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cookie': token ? `graftdesk_session=${token}` : ''
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          photos: photosPayload,
          notes: answersSummary,
          clinicSlug: 'asg-hair'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze');

      setResult(data.analysis);
      setActiveLeadId(data.leadId || null);
      setIsGuest(data.isGuest !== false);
      setPatientId(data.patientId || null);
      setWhatsappTracked(false);

      Alert.alert('Analysis Complete!', 'Your scalp assessment diagnostics report is ready.');
    } catch (err: any) {
      Alert.alert('Diagnostics Failed', err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!registerPassword) {
      Alert.alert('Password Required', 'Please enter a password.');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password: registerPassword,
          leadId: activeLeadId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      await AsyncStorage.setItem('auth_token', data.token);
      setToken(data.token);
      setIsLoggedIn(true);
      setIsGuest(false);

      Alert.alert('Account Created!', 'Your account has been registered successfully.');
    } catch (e: any) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleWhatsAppTracking = async () => {
    try {
      await fetch(`${BASE_URL}/api/public/track-whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: activeLeadId, patientId })
      });
      setWhatsappTracked(true);
      const greeting = `Hello ASG Hair Clinic! My name is ${name}. I just completed my AI Hair Test (Norwood Stage ${result.norwoodStage}). Please enroll me in my 12-month post-op WhatsApp recovery list.`;
      const url = `https://wa.me/919501554888?text=${encodeURIComponent(greeting)}`;
      Linking.openURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setGender('');
    setAge('');
    setThinningArea('');
    setFallSpeed('');
    setSleep('');
    setStress('');
    setDiet('');
    setDandruff('');
    setFamilyHistory('');
    if (!isLoggedIn) {
      setName('');
      setEmail('');
      setPhone('');
    }
    setFrontPhoto('');
    setTopPhoto('');
    setBackPhoto('');
    setResult(null);
    setStep(1);
    setWhatsappTracked(false);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Hair Diagnostic Test</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loaderText}>Processing Diagnostic Report...</Text>
        </View>
      ) : result ? (
        // Assessment Report Dashboard
        <View style={styles.resultsCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>AI DIAGNOSTICS COMPLETED</Text>
          </View>

          {renderAnalysisDetails(result)}

          {/* Guest Signup */}
          {isGuest && !isLoggedIn && (
            <View style={styles.signupBox}>
              <Text style={styles.signupTitle}>Save Your Scalp Diagnostics</Text>
              <Text style={styles.signupDesc}>
                Create a password to register your patient account and save these results permanently.
              </Text>
              <TextInput
                placeholder="Choose Password"
                secureTextEntry
                value={registerPassword}
                onChangeText={setRegisterPassword}
                style={styles.input}
              />
              <TouchableOpacity style={styles.signupButton} onPress={handleCreateAccount} disabled={isRegistering}>
                <Text style={styles.signupButtonText}>Create Account & Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* WhatsApp care enrollment */}
          <View style={styles.whatsappBox}>
            <Text style={styles.whatsappTitle}>WhatsApp Recovery Tracker</Text>
            <Text style={styles.whatsappDesc}>
              Enroll in our 12-month post-op care program to receive progress audits from our surgeons.
            </Text>
            <TouchableOpacity 
              style={[styles.whatsappButton, { backgroundColor: whatsappTracked ? '#059669' : '#25D366' }]} 
              onPress={handleWhatsAppTracking}
            >
              <Text style={styles.whatsappButtonText}>
                {whatsappTracked ? 'Enrolled in WhatsApp ✓' : 'Track Grafts on WhatsApp'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
            <Text style={styles.resetButtonText}>Run New Assessment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Diagnostic steps
        <View style={styles.card}>
          <Text style={styles.stepText}>Step {step} of 6</Text>

          {/* Step 1 */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.questionLabel}>Select Gender</Text>
              <View style={styles.optionsRow}>
                {['Male', 'Female'].map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    style={[styles.optionButton, gender === g && styles.optionButtonActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.optionText, gender === g && styles.optionTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Select Age Group</Text>
              <View style={styles.optionsGrid}>
                {['18-24', '25-34', '35-44', '45+'].map((a) => (
                  <TouchableOpacity 
                    key={a} 
                    style={[styles.optionButton, age === a && styles.optionButtonActive]}
                    onPress={() => setAge(a)}
                  >
                    <Text style={[styles.optionText, age === a && styles.optionTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.questionLabel}>Primary Thinning Zone</Text>
              <View style={styles.optionsGrid}>
                {['Frontal Hairline', 'Crown Vertex', 'Overall Thinning'].map((t) => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.optionButton, thinningArea === t && styles.optionButtonActive]}
                    onPress={() => setThinningArea(t)}
                  >
                    <Text style={[styles.optionText, thinningArea === t && styles.optionTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Rate of Hair Fall</Text>
              <View style={styles.optionsGrid}>
                {['Normal (Less than 50/day)', 'Moderate (50-100/day)', 'High (Over 100/day)'].map((f) => (
                  <TouchableOpacity 
                    key={f} 
                    style={[styles.optionButton, fallSpeed === f && styles.optionButtonActive]}
                    onPress={() => setFallSpeed(f)}
                  >
                    <Text style={[styles.optionText, fallSpeed === f && styles.optionTextActive]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.questionLabel}>Daily Sleep Duration</Text>
              <View style={styles.optionsGrid}>
                {['Less than 6 hours', '6 to 8 hours', 'More than 8 hours'].map((s) => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.optionButton, sleep === s && styles.optionButtonActive]}
                    onPress={() => setSleep(s)}
                  >
                    <Text style={[styles.optionText, sleep === s && styles.optionTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Stress Level</Text>
              <View style={styles.optionsGrid}>
                {['Low', 'Medium', 'High'].map((st) => (
                  <TouchableOpacity 
                    key={st} 
                    style={[styles.optionButton, stress === st && styles.optionButtonActive]}
                    onPress={() => setStress(st)}
                  >
                    <Text style={[styles.optionText, stress === st && styles.optionTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Dietary Habits</Text>
              <View style={styles.optionsGrid}>
                {['Vegetarian', 'Non-Vegetarian', 'Vegan'].map((d) => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.optionButton, diet === d && styles.optionButtonActive]}
                    onPress={() => setDiet(d)}
                  >
                    <Text style={[styles.optionText, diet === d && styles.optionTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Active Dandruff Concern?</Text>
              <View style={styles.optionsGrid}>
                {['Yes, flaky/itchy scalp', 'No, clear scalp'].map((df) => (
                  <TouchableOpacity 
                    key={df} 
                    style={[styles.optionButton, dandruff === df && styles.optionButtonActive]}
                    onPress={() => setDandruff(df)}
                  >
                    <Text style={[styles.optionText, dandruff === df && styles.optionTextActive]}>{df}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.questionLabel}>Does hair thinning run in your family?</Text>
              <View style={styles.optionsRow}>
                {['Yes', 'No'].map((fh) => (
                  <TouchableOpacity 
                    key={fh} 
                    style={[styles.optionButton, familyHistory === fh && styles.optionButtonActive]}
                    onPress={() => setFamilyHistory(fh)}
                  >
                    <Text style={[styles.optionText, familyHistory === fh && styles.optionTextActive]}>{fh}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <View style={styles.stepContainer}>
              <Text style={styles.questionLabel}>Upload Scalp Photographs (Optional)</Text>
              <Text style={styles.photoTip}>Clear photos enable highly accurate computer vision graft assessments.</Text>
              
              <TouchableOpacity style={styles.photoUploadButton} onPress={() => selectPhoto(setFrontPhoto)}>
                <Text style={styles.photoUploadButtonText}>
                  {frontPhoto ? 'Front Hairline Selected ✓' : 'Upload Front View'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoUploadButton} onPress={() => selectPhoto(setTopPhoto)}>
                <Text style={styles.photoUploadButtonText}>
                  {topPhoto ? 'Crown Vertex Selected ✓' : 'Upload Crown View'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoUploadButton} onPress={() => selectPhoto(setBackPhoto)}>
                <Text style={styles.photoUploadButtonText}>
                  {backPhoto ? 'Back Donor Selected ✓' : 'Upload Back/Donor View'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <View style={styles.stepContainer}>
              <Text style={styles.questionLabel}>Confirm Contact Details</Text>
              <Text style={styles.photoTip}>Your diagnostics report will be saved under these details.</Text>

              <TextInput 
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput 
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                editable={!isLoggedIn}
              />
              <TextInput 
                placeholder="Phone Number (Optional)"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
              />
            </View>
          )}

          {/* Nav buttons */}
          <View style={styles.navRow}>
            {step > 1 ? (
              <TouchableOpacity style={styles.backBtn} onPress={prevStep}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {step < 6 ? (
              <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
                <Text style={styles.nextBtnText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.nextBtn, { backgroundColor: '#0d9488' }]} onPress={handleSubmit}>
                <Text style={styles.nextBtnText}>Submit Diagnostics</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Footer Nav */}
      <TouchableOpacity style={styles.backHomeBtn} onPress={onBack}>
        <Text style={styles.backHomeBtnText}>Back to Clinic Info</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  detailListText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '600',
  },
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
  loaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  stepText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  stepContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionsGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#0d9488',
    backgroundColor: 'rgba(13,148,136,0.06)',
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  optionTextActive: {
    color: '#0d9488',
  },
  photoTip: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 15,
  },
  photoUploadButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoUploadButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    height: 46,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  nextBtn: {
    height: 46,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#0f172a',
    marginLeft: 'auto',
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  resultHeader: {
    backgroundColor: 'rgba(13,148,136,0.1)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    color: '#0d9488',
    fontSize: 10,
    fontWeight: 'bold',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
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
  signupBox: {
    backgroundColor: 'rgba(13,148,136,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(13,148,136,0.2)',
    padding: 16,
    marginTop: 20,
  },
  signupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  signupDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
    marginBottom: 12,
  },
  signupButton: {
    backgroundColor: '#0d9488',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  whatsappBox: {
    backgroundColor: 'rgba(37,211,102,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.2)',
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  whatsappTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  whatsappDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
    marginBottom: 12,
    textAlign: 'center',
  },
  whatsappButton: {
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  whatsappButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  resetButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
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
