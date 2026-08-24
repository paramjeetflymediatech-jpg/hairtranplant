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
  Alert,
  Image,
  Share,
  Platform,
  PermissionsAndroid
} from 'react-native';
import SweetAlert from '../components/SweetAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { BASE_URL } from '../config/apiConfig';
import { THEME } from '../config/theme';
import { saveAuthTokens, refreshAuthToken } from '../utils/apiClient';

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
  const [selectedHairline, setSelectedHairline] = useState<string>('straight');
  const [overlayYOffset, setOverlayYOffset] = useState<number>(0);
  const [overlayScale, setOverlayScale] = useState<number>(1.0);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.9);
  const [visualizerPhoto, setVisualizerPhoto] = useState<string>('');
  const [fluxResultPhoto, setFluxResultPhoto] = useState<string>('');
  const [loadingFlux, setLoadingFlux] = useState<boolean>(false);

  // Session state
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm',
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: onCancel ? () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        onCancel();
      } : undefined,
      confirmText,
      cancelText
    });
  };

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
        let storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          // Fetch user credentials
          let res = await fetch(`${BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Cookie': `graftdesk_session=${storedToken}`,
              'Authorization': `Bearer ${storedToken}`,
            }
          });
          if (res.status === 401) {
            const refreshed = await refreshAuthToken();
            if (refreshed) {
              storedToken = refreshed;
              setToken(refreshed);
              res = await fetch(`${BASE_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                  'Cookie': `graftdesk_session=${refreshed}`,
                  'Authorization': `Bearer ${refreshed}`,
                }
              });
            }
          }
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

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'ASG Hair Test requires access to your camera to take scalp photos for AI hair loss analysis.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  const triggerCamera = async (setter: (val: string) => void) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      showAlert('error', 'Permission Denied', 'Camera permission is required to take scalp photos.');
      return;
    }

    launchCamera({ mediaType: 'photo', includeBase64: true, quality: 0.8 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        const isUnavailable = response.errorMessage.toLowerCase().includes('camera_unavailable') || 
                              response.errorMessage.toLowerCase().includes('available');
        showAlert(
          'warning',
          'Camera Unavailable',
          isUnavailable 
            ? (Platform.OS === 'ios'
                ? 'The camera is not supported on the iOS Simulator by Apple. Please select "Choose from Gallery" or test on a physical iPhone.'
                : 'Camera is not available on this Android Emulator/Device. Please select "Choose from Gallery" or verify camera settings.')
            : response.errorMessage
        );
      } else if (response.assets && response.assets[0]?.base64) {
        setter(response.assets[0].base64);
      }
    });
  };

  const triggerGallery = (setter: (val: string) => void) => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.8 }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
      } else if (response.errorMessage) {
        showAlert('error', 'Gallery Error', response.errorMessage);
      } else if (response.assets && response.assets[0]?.base64) {
        setter(response.assets[0].base64);
      }
    });
  };

  const selectPhoto = (setter: (val: string) => void) => {
    Alert.alert(
      'Select Photo Source',
      'Choose a method to upload your photo:',
      [
        {
          text: 'Camera',
          onPress: () => triggerCamera(setter),
        },
        {
          text: 'Gallery',
          onPress: () => triggerGallery(setter),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const nextStep = () => {
    if (step === 1 && (!gender || !age)) {
      showAlert('error', 'Details Required', 'Please select both your gender and age group.');
      return;
    }
    if (step === 2 && (!thinningArea || !fallSpeed)) {
      showAlert('error', 'Details Required', 'Please specify your thinning area and rate of hair fall.');
      return;
    }
    if (step === 3 && (!sleep || !stress || !diet || !dandruff)) {
      showAlert('error', 'Details Required', 'Please provide sleep, stress, diet, and dandruff details.');
      return;
    }
    if (step === 4 && !familyHistory) {
      showAlert('error', 'Details Required', 'Please answer the family history query.');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!name || !email) {
      showAlert('error', 'Contact Required', 'Please enter your name and email to receive the report.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert('error', 'Invalid Email', 'Please enter a valid email address.');
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
      setVisualizerPhoto(frontPhoto || '');
      setActiveLeadId(data.leadId || null);
      setIsGuest(data.isGuest !== false);
      setPatientId(data.patientId || null);
      setWhatsappTracked(false);

      showAlert('success', 'Analysis Complete!', 'Your scalp assessment diagnostics report is ready.');
    } catch (err: any) {
      showAlert('error', 'Diagnostics Failed', err.message || 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!registerPassword) {
      showAlert('error', 'Password Required', 'Please enter a password.');
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

      await saveAuthTokens(data.token, data.refreshToken);
      setToken(data.token);
      setIsLoggedIn(true);
      setIsGuest(false);

      showAlert('success', 'Account Created!', 'Your account has been registered successfully.');
    } catch (e: any) {
      showAlert('error', 'Registration Failed', e.message);
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
    setVisualizerPhoto('');
    setFluxResultPhoto('');
    setLoadingFlux(false);
  };

  const generateTransplantVisual = async () => {
    if (!visualizerPhoto) {
      showAlert('error', 'Photo Required', 'Please upload a front view photograph to simulate your transplant.');
      return;
    }

    setLoadingFlux(true);
    setFluxResultPhoto('');

    try {
      const res = await fetch(`${BASE_URL}/api/public/simulate-transplant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: visualizerPhoto,
          hairlineStyle: selectedHairline
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to simulate transplant');

      if (data.isDemo) {
        showAlert(
          'info',
          'Demo Mode Active',
          'To generate real AI-inpainted transplant portraits, configure your FAL_KEY inside the .env file. Showing instant simulated overlay preview.'
        );
      }
      
      setFluxResultPhoto(data.simulatedPhotoUrl);
    } catch (e: any) {
      showAlert('error', 'Simulation Failed', e.message || 'Failed to communicate with AI server.');
    } finally {
      setLoadingFlux(false);
    }
  };

  const downloadResultImage = async () => {
    const targetPhoto = fluxResultPhoto || visualizerPhoto;
    if (!targetPhoto) {
      showAlert('error', 'No Image Available', 'Please generate or upload a photo first.');
      return;
    }

    try {
      if (targetPhoto.startsWith('http://') || targetPhoto.startsWith('https://')) {
        const supported = await Linking.canOpenURL(targetPhoto);
        if (supported) {
          await Linking.openURL(targetPhoto);
        } else {
          await Share.share({
            url: targetPhoto,
            title: 'Hair Transplant Simulation Result',
            message: 'My AI Hair Transplant Simulation Result: ' + targetPhoto,
          });
        }
      } else {
        await Share.share({
          url: targetPhoto.startsWith('data:') ? targetPhoto : `data:image/jpeg;base64,${targetPhoto}`,
          title: 'Hair Transplant Simulation Result',
          message: 'My AI Hair Transplant Simulation Result',
        });
      }
    } catch (err: any) {
      console.warn('Download image error:', err);
      showAlert('info', 'Download Options', 'Open the image link or save to your photo library.');
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>AI Hair Diagnostic Test</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loaderText}>Processing Diagnostic Report...</Text>
        </View>
      ) : result ? (
        // Assessment Report Dashboard
        <View style={styles.resultsCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>AI DIAGNOSTICS COMPLETED</Text>
          </View>

          {renderAnalysisDetails(result)}

          {/* AI Transplant Visualizer Section */}
          <View style={styles.visualizerCard}>
            <Text style={styles.visualizerCardTitle}>✨ AI Transplant Outcome Visualizer</Text>
            <Text style={styles.visualizerDesc}>
              Preview your future hairline! Adjust the style below, then generate a realistic AI-inpainted portrait to see your younger, restored look.
            </Text>

            {!visualizerPhoto ? (
              <TouchableOpacity 
                style={[styles.photoUploadButton, { backgroundColor: THEME.primary }]} 
                onPress={() => selectPhoto(setVisualizerPhoto)}
              >
                <Text style={styles.photoUploadButtonText}>📸 Upload Front View Photo</Text>
              </TouchableOpacity>
            ) : (
              <View>
                {/* Clean Photo Preview */}
                <View style={styles.previewContainer}>
                  <Image 
                    source={{ uri: (fluxResultPhoto || visualizerPhoto).startsWith('http') || (fluxResultPhoto || visualizerPhoto).startsWith('data:') ? (fluxResultPhoto || visualizerPhoto) : `data:image/jpeg;base64,${fluxResultPhoto || visualizerPhoto}` }}
                    style={styles.previewBgImage}
                    resizeMode="cover"
                  />
                </View>

                {fluxResultPhoto && (
                  <View style={styles.successBadge}>
                    <Text style={styles.successBadgeText}>✨ Post-Transplant Look Generated!</Text>
                  </View>
                )}

                <View style={{ height: 16 }} />

                {loadingFlux ? (
                  <View style={styles.fluxLoader}>
                    <ActivityIndicator size="small" color={THEME.primary} />
                    <Text style={styles.fluxLoaderText}>Running Flux AI Image Generation...</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.fluxGenerateBtn} 
                    onPress={generateTransplantVisual}
                  >
                    <Text style={styles.fluxGenerateBtnText}>
                      {fluxResultPhoto ? '🔄 Generate New Design (Flux AI)' : '✨ Generate Post-Transplant Look (Flux AI)'}
                    </Text>
                  </TouchableOpacity>
                )}

                {fluxResultPhoto && (
                  <TouchableOpacity 
                    style={[styles.fluxGenerateBtn, { backgroundColor: '#059669', marginTop: 10 }]} 
                    onPress={downloadResultImage}
                  >
                    <Text style={styles.fluxGenerateBtnText}>📥 Download / Save Resulted Image</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.resetVisualizerBtn}
                  onPress={() => {
                    setVisualizerPhoto('');
                    setFluxResultPhoto('');
                  }}
                >
                  <Text style={styles.resetVisualizerBtnText}>Upload Different Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

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
              <Text style={styles.questionLabel}>Select Gender <Text style={{ color: '#ef4444' }}>*</Text></Text>
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

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Select Age Group <Text style={{ color: '#ef4444' }}>*</Text></Text>
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
              <Text style={styles.questionLabel}>Primary Thinning Zone <Text style={{ color: '#ef4444' }}>*</Text></Text>
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

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Rate of Hair Fall <Text style={{ color: '#ef4444' }}>*</Text></Text>
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
              <Text style={styles.questionLabel}>Daily Sleep Duration <Text style={{ color: '#ef4444' }}>*</Text></Text>
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

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Stress Level <Text style={{ color: '#ef4444' }}>*</Text></Text>
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

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Dietary Habits <Text style={{ color: '#ef4444' }}>*</Text></Text>
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

              <Text style={[styles.questionLabel, { marginTop: 20 }]}>Active Dandruff Concern? <Text style={{ color: '#ef4444' }}>*</Text></Text>
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
              <Text style={styles.questionLabel}>Does hair thinning run in your family? <Text style={{ color: '#ef4444' }}>*</Text></Text>
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

              {frontPhoto ? (
                <View style={styles.previewCard}>
                  <Text style={styles.previewCardTitle}>Uploaded Front Hairline Photo</Text>
                  
                  <View style={styles.previewContainer}>
                    <Image 
                      source={{ uri: `data:image/jpeg;base64,${frontPhoto}` }}
                      style={styles.previewBgImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              ) : null}

              <View style={{ height: 16 }} />

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
                placeholder="Full Name *"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput 
                placeholder="Email Address *"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                editable={!isLoggedIn}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
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
              <TouchableOpacity style={[styles.nextBtn, { backgroundColor: THEME.primary }]} onPress={handleSubmit}>
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
    <SweetAlert
      visible={alertConfig.visible}
      type={alertConfig.type}
      title={alertConfig.title}
      message={alertConfig.message}
      onConfirm={alertConfig.onConfirm}
      onCancel={alertConfig.onCancel}
      confirmText={alertConfig.confirmText}
      cancelText={alertConfig.cancelText}
    />
  </View>
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
    color: THEME.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  zoneValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textPrimary,
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
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  paramValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  detailListText: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.primary,
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
    color: THEME.textSecondary,
    marginTop: 16,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 24,
  },
  stepText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.primary,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  stepContainer: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.textPrimary,
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
    borderWidth: 1.5,
    borderColor: THEME.cardBorder,
    backgroundColor: THEME.card,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.badge,
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textSecondary,
  },
  optionTextActive: {
    color: THEME.primary,
  },
  photoTip: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginBottom: 16,
    lineHeight: 15,
  },
  photoUploadButton: {
    backgroundColor: THEME.primary,
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
    borderWidth: 1.5,
    borderColor: THEME.cardBorder,
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 13,
    color: THEME.textPrimary,
    backgroundColor: THEME.card,
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
    borderWidth: 1.5,
    borderColor: THEME.cardBorder,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.textSecondary,
  },
  nextBtn: {
    height: 46,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: THEME.primary,
    marginLeft: 'auto',
  },
  nextBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultsCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 24,
  },
  resultHeader: {
    backgroundColor: THEME.badge,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    color: THEME.badgeText,
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
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.cardBorder,
  },
  explanationBox: {
    backgroundColor: THEME.bg,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 6,
  },
  explanationDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 16,
  },
  obsItem: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 3,
  },
  signupBox: {
    backgroundColor: THEME.badge,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 16,
    marginTop: 20,
  },
  signupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  signupDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 15,
    marginBottom: 12,
  },
  signupButton: {
    backgroundColor: THEME.primary,
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
    color: THEME.textPrimary,
    marginBottom: 4,
  },
  whatsappDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
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
    backgroundColor: THEME.primary,
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
    color: THEME.textSecondary,
  },
  previewCard: {
    backgroundColor: '#FAF5F2',
    borderWidth: 1.5,
    borderColor: '#FFEBE0',
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  previewCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.primary,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewContainer: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  previewBgImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlayImage: {
    position: 'absolute',
    left: '5%',
    width: '90%',
    height: 140,
  },
  selectorTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  styleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    backgroundColor: '#ffffff',
  },
  styleButtonActive: {
    borderColor: THEME.primary,
    backgroundColor: THEME.badge,
  },
  styleButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.textSecondary,
  },
  styleButtonTextActive: {
    color: THEME.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5EAE4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D4CA',
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.primary,
  },
  resetPreviewBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  resetPreviewBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.textSecondary,
    textDecorationLine: 'underline',
  },
  visualizerCard: {
    backgroundColor: '#FAF5F2',
    borderWidth: 1.5,
    borderColor: '#FFEBE0',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  visualizerCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.primary,
    marginBottom: 6,
  },
  visualizerDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    lineHeight: 15,
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  successBadgeText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: 'bold',
  },
  fluxLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8,
  },
  fluxLoaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.textSecondary,
  },
  fluxGenerateBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fluxGenerateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resetVisualizerBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  resetVisualizerBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.textSecondary,
    textDecorationLine: 'underline',
  },
});
