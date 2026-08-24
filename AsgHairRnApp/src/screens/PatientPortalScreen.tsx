import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SweetAlert from '../components/SweetAlert';
import { BASE_URL } from '../config/apiConfig';
import { THEME } from '../config/theme';
import { saveAuthTokens, clearAuthTokens, refreshAuthToken, getAuthToken } from '../utils/apiClient';

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

type Props = {
  onBack: () => void;
  onDrawerOpen: () => void;
  onPortalDataLoaded: (token: string, name: string, status: string, phone: string, analyses: any[]) => void;
  onGoToProfile: (token: string, name: string, status: string, phone: string, analyses: any[]) => void;
  onGoToHistory: (token: string, name: string, status: string, analyses: any[]) => void;
};

export default function PatientPortalScreen({
  onBack,
  onDrawerOpen,
  onPortalDataLoaded,
  onGoToProfile,
  onGoToHistory,
}: Props) {
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

  // Tab / Drawer Navigation State
  const [activeTab, setActiveTab] = useState<'treatment' | 'profile'>('treatment');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Pagination State
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);

  // Login Form States
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Portal Data States
  const [loadingData, setLoadingData] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientStatus, setPatientStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Past Test List State
  const [allAnalyses, setAllAnalyses] = useState<any[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Profile Form States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPasswordState, setShowNewPasswordState] = useState(false);
  const [showConfirmPasswordState, setShowConfirmPasswordState] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const handleDrawerNav = (tab: 'treatment' | 'profile') => {
    setActiveTab(tab);
    setCurrentPage(1);
    closeDrawer();
  };

  const goToProfile = () => {
    closeDrawer();
    onGoToProfile(token, patientName, patientStatus, editPhone, allAnalyses);
  };

  const goToHistory = () => {
    closeDrawer();
    onGoToHistory(token, patientName, patientStatus, allAnalyses);
  };

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
          setEditName(patient.name || '');
          setEditPhone(patient.phone || '');

          const analyses = patient.hairAnalyses;
          setAllAnalyses(analyses || []);

          // Sync parent auth context
          onPortalDataLoaded(activeToken, patient.name || 'Patient', patient.status || 'CONSULTATION', patient.phone || '', analyses || []);

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
        // Attempt silent token refresh before logging user out
        const refreshedToken = await refreshAuthToken();
        if (refreshedToken) {
          setToken(refreshedToken);
          fetchPortalData(refreshedToken);
          return;
        }
        await clearAuthTokens();
        setToken('');
        setIsLoggedIn(false);
        showAlert('warning', 'Session Expired', 'Please log in again.');
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
            <Text style={[styles.explanationDesc, { marginTop: 8, color: THEME.textSecondary }]}>
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
            <Text style={[styles.explanationTitle, { color: THEME.headerBg }]}>Clinical Observations</Text>
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
              <Text key={idx} style={[styles.obsItem, { color: THEME.textSecondary }]}>• {stepStr}</Text>
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
      showAlert('error', 'Details Required', 'Email and password are required.');
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

      await saveAuthTokens(data.token, data.refreshToken);
      setToken(data.token);
      setIsLoggedIn(true);
      fetchPortalData(data.token);
    } catch (e: any) {
      showAlert('error', 'Login Failed', e.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSendResetLink = async () => {
    if (!forgotEmail.trim()) {
      showAlert('error', 'Email Required', 'Please enter your registered email address.');
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      
      showAlert(
        'success',
        'Reset Link Generated',
        'A secure password reset link has been simulated. If an account is registered with this email, the reset link is printed in the server logs.',
        () => {
          setIsForgotMode(false);
          setForgotEmail('');
        }
      );
    } catch (e: any) {
      showAlert('error', 'Request Failed', e.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await clearAuthTokens();
    setToken('');
    setIsLoggedIn(false);
    setPatientName('');
    setPatientStatus('');
    setAnalysisResult(null);
  };

  const handleUpdateProfile = async () => {
    if (!editName) {
      showAlert('error', 'Validation Error', 'Full Name is required.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showAlert('error', 'Validation Error', 'New passwords do not match.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const payload: any = {
        name: editName.trim(),
        phone: editPhone.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `graftdesk_session=${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      // Update stored session tokens (resigned access + refresh tokens returned by backend)
      if (data.token) {
        await saveAuthTokens(data.token, data.refreshToken);
        setToken(data.token);
      }

      setPatientName(data.user.name || 'Patient');
      setEditName(data.user.name || '');
      setEditPhone(data.user.phone || '');

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showAlert('success', 'Success', 'Your profile details have been updated successfully.');
    } catch (e: any) {
      showAlert('error', 'Error', e.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Compute paginated slice of history
  const totalPages = Math.max(1, Math.ceil(allAnalyses.length / ITEMS_PER_PAGE));
  const pagedAnalyses = allAnalyses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <View style={{ flex: 1, backgroundColor: THEME.bg }}>

      {/* ====== FIXED PORTAL HEADER ====== */}
      {isLoggedIn && (
        <View style={styles.portalHeader}>
          <TouchableOpacity style={styles.hamburgerBtn} onPress={onDrawerOpen}>
            <View style={styles.hamLine} />
            <View style={styles.hamLine} />
            <View style={styles.hamLine} />
          </TouchableOpacity>
          <View style={styles.portalHeaderCenter}>
            <Text style={styles.portalHeaderTitle}>ASG Patient Portal</Text>
            <Text style={styles.portalHeaderSubtitle}>
              {activeTab === 'treatment' ? 'Active Treatment' : 'Profile & History'}
            </Text>
          </View>
          <View style={styles.hamburgerBtn} />
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, isLoggedIn && { paddingTop: 8 }]}
      >
        {!isLoggedIn && <Text style={styles.title}>ASG Patient Portal</Text>}

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

              {activeTab === 'treatment' ? (
                <View>
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
                </View>
              ) : (
                // PROFILE & HISTORY VIEW
                <View style={styles.tabContent}>
                  {/* 1. Update Profile Fields */}
                  <Text style={styles.subHeading}>Update Profile Details</Text>

                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    placeholder="Full Name"
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.input}
                  />

                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <TextInput
                    placeholder="Phone Number (Optional)"
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />

                  <Text style={[styles.subHeading, { marginTop: 16 }]}>Change Account Password (Optional)</Text>
                  
                  <Text style={styles.fieldLabel}>Current Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      placeholder="Enter Current Password"
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry={!showCurrentPassword}
                      style={styles.passwordInput}
                      placeholderTextColor={THEME.textSecondary}
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.eyeButton}>
                      <Text style={styles.eyeText}>{showCurrentPassword ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.fieldLabel}>New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      placeholder="Enter New Password"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPasswordState}
                      style={styles.passwordInput}
                      placeholderTextColor={THEME.textSecondary}
                    />
                    <TouchableOpacity onPress={() => setShowNewPasswordState(!showNewPasswordState)} style={styles.eyeButton}>
                      <Text style={styles.eyeText}>{showNewPasswordState ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.fieldLabel}>Confirm New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPasswordState}
                      style={styles.passwordInput}
                      placeholderTextColor={THEME.textSecondary}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPasswordState(!showConfirmPasswordState)} style={styles.eyeButton}>
                      <Text style={styles.eyeText}>{showConfirmPasswordState ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.saveProfileButton}
                    onPress={handleUpdateProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.saveProfileButtonText}>Save Profile Changes</Text>
                    )}
                  </TouchableOpacity>

                  <View style={[styles.divider, { marginVertical: 20 }]} />

                  {/* 2. Paginated Past Test History List */}
                  <View style={styles.historyHeaderRow}>
                    <Text style={styles.subHeading}>Past AI Test Results</Text>
                    {allAnalyses.length > 0 && (
                      <Text style={styles.pageIndicator}>
                        Page {currentPage} of {totalPages}
                      </Text>
                    )}
                  </View>

                  {allAnalyses.length > 0 ? (
                    <View>
                      {pagedAnalyses.map((analysis, idx) => {
                        let dateStr = 'Unknown Date';
                        if (analysis.createdAt) {
                          dateStr = new Date(analysis.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          });
                        }
                        const minG = analysis.estimatedMinGrafts || 1500;
                        const maxG = analysis.estimatedMaxGrafts || 2000;
                        const stage = analysis.hairLossStage || 'UNCERTAIN';

                        return (
                          <View key={analysis.id || idx} style={styles.historyCard}>
                            <View style={styles.historyHeader}>
                              <Text style={styles.historyDate}>{dateStr}</Text>
                              <View style={styles.historyBadge}>
                                <Text style={styles.historyBadgeText}>{stage}</Text>
                              </View>
                            </View>
                            <Text style={styles.historyDesc}>Estimated Grafts: {minG} – {maxG}</Text>
                            <Text style={styles.historyDesc}>Donor Area: {analysis.donorAreaQuality || 'GOOD'} Quality</Text>
                            <TouchableOpacity
                              style={styles.viewReportBtn}
                              onPress={() => {
                                let parsed: any = null;
                                if (analysis.aiAnalysis) {
                                  try { parsed = JSON.parse(analysis.aiAnalysis); } catch (_) {}
                                }
                                if (!parsed) {
                                  parsed = {
                                    norwoodStage: stage,
                                    estimatedGraftRequirement: { minimumGrafts: minG, maximumGrafts: maxG },
                                    donorArea: { rating: analysis.donorAreaQuality || 'GOOD', densityEstimateGraftsPerCm2: analysis.hairDensity },
                                    procedureAssessment: { preliminaryRecommendation: 'FUE' }
                                  };
                                }
                                setSelectedAnalysis(parsed);
                                setModalVisible(true);
                              }}
                            >
                              <Text style={styles.viewReportBtnText}>View Full Report →</Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <View style={styles.paginationRow}>
                          <TouchableOpacity
                            style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>‹ Prev</Text>
                          </TouchableOpacity>

                          <View style={styles.pageDots}>
                            {Array.from({ length: totalPages }).map((_, i) => (
                              <TouchableOpacity
                                key={i}
                                onPress={() => setCurrentPage(i + 1)}
                                style={[styles.pageDot, currentPage === i + 1 && styles.pageDotActive]}
                              />
                            ))}
                          </View>

                          <TouchableOpacity
                            style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                            onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Next ›</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.noHistoryText}>No past tests found.</Text>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )
        ) : isForgotMode ? (
          // Forgot Password View (Sends link to email)
          <View style={styles.card}>
            <Text style={styles.loginTitle}>Forgot Password</Text>
            
            <Text style={styles.forgotInstruction}>
              Enter your registered email address below. We will generate a secure link to reset your password.
            </Text>

            <TextInput
              placeholder="Registered Email Address"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor={THEME.textSecondary}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleSendResetLink} disabled={isResetting}>
              {isResetting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => setIsForgotMode(false)}>
              <Text style={styles.backToLoginText}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
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
              placeholderTextColor={THEME.textSecondary}
            />

            <View style={styles.passwordInputContainer}>
              <TextInput
                placeholder="Account Password"
                value={passwordInput}
                onChangeText={setPasswordInput}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                placeholderTextColor={THEME.textSecondary}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordBtn} onPress={() => setIsForgotMode(true)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

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
          <Text style={styles.backHomeBtnText}>← Back to Clinic Info</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Detailed Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedAnalysis(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detailed Diagnostics Report</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedAnalysis(null);
                }}
              >
                <Text style={styles.modalCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {selectedAnalysis && renderAnalysisDetails(selectedAnalysis)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    color: THEME.headerBg,
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
    borderColor: THEME.cardBorder,
    padding: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  patientName: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.headerBg,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: THEME.badge,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginBottom: 24,
  },
  statusBadgeText: {
    color: THEME.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  assessmentBox: {
    marginTop: 10,
  },
  assessmentHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: THEME.headerBg,
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
    color: THEME.textSecondary,
    fontWeight: '600',
  },
  paramValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.headerBg,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  noDataText: {
    fontSize: 12,
    color: THEME.textSecondary,
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
    color: THEME.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  zoneValue: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textSecondary,
    lineHeight: 16,
  },
  detailListText: {
    fontSize: 10,
    color: THEME.textSecondary,
    marginTop: 6,
    fontWeight: '600',
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
  logoutButton: {
    backgroundColor: THEME.headerBg,
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
    color: THEME.headerBg,
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
    color: THEME.headerBg,
    backgroundColor: '#ffffff',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 16,
    height: 48,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 13,
    color: THEME.headerBg,
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeText: {
    fontSize: 16,
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: 2,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: THEME.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  backToLoginBtn: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  backToLoginText: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  forgotInstruction: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  loginButton: {
    backgroundColor: THEME.primary,
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
    color: THEME.textSecondary,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textSecondary,
  },
  tabButtonTextActive: {
    color: THEME.primary,
  },
  tabContent: {
    marginTop: 10,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.headerBg,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: THEME.textSecondary,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
  },
  saveProfileButton: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveProfileButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  historyCard: {
    backgroundColor: THEME.bg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.headerBg,
  },
  historyBadge: {
    backgroundColor: THEME.badge,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  historyBadgeText: {
    color: THEME.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  historyDesc: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginBottom: 4,
  },
  viewReportBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewReportBtnText: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: 'bold',
  },
  noHistoryText: {
    fontSize: 12,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: THEME.cardBorder,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.headerBg,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: 'bold',
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  /* ── Portal fixed header ── */
  portalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.headerBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  portalHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  portalHeaderTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  portalHeaderSubtitle: {
    color: THEME.accent,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 1,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  hamLine: {
    width: 22,
    height: 2.5,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginVertical: 2,
  },

  /* ── Drawer backdrop + panel ── */
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
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

  /* ── History pagination ── */
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageIndicator: {
    fontSize: 10,
    color: THEME.textSecondary,
    fontWeight: 'bold',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: THEME.primary,
  },
  pageBtnDisabled: {
    backgroundColor: THEME.disabled,
  },
  pageBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pageBtnTextDisabled: {
    color: THEME.drawerText,
  },
  pageDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.dotInactive,
    margin: 3,
  },
  pageDotActive: {
    backgroundColor: THEME.primary,
    width: 20,
    borderRadius: 4,
  },
});
