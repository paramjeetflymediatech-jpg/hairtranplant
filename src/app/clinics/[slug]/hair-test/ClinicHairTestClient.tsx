'use client';

import React, { useState } from 'react';
import { ConfigProvider, Steps, Progress, Input, Button, Spin, theme as antdTheme } from 'antd';
import { Sparkles, Activity, ShieldCheck, Award } from 'lucide-react';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  ArrowLeftOutlined, 
  ArrowRightOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  CameraOutlined,
  AimOutlined,
  NodeIndexOutlined,
  DatabaseOutlined,
  DashboardOutlined,
  HeartOutlined,
  SlidersOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  SolutionOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';

interface ClinicData {
  name: string;
  slug: string;
  logo: string | null;
  phone: string;
  email: string;
  backgroundImage?: string | null;
  themeColor?: string | null;
}

// Slug-based color config for Ant Design primary tokens
const CLINIC_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  'asg-hair': {
    primary: '#f59e0b', // Amber
    secondary: '#ef4444', // Red
    glow: 'from-amber-500/10 to-red-500/10'
  },
  'apex-hair': {
    primary: '#0d9488', // Teal
    secondary: '#10b981', // Emerald
    glow: 'from-teal-500/10 to-emerald-500/10'
  },
  'harley-hair': {
    primary: '#eab308', // Yellow/Gold
    secondary: '#f59e0b', // Amber
    glow: 'from-yellow-500/10 to-amber-500/10'
  },
  'default': {
    primary: '#0d9488',
    secondary: '#10b981',
    glow: 'from-teal-500/10 to-emerald-500/10'
  }
};

export default function ClinicHairTestClient({ clinic }: { clinic: ClinicData }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [whatsappTracked, setWhatsappTracked] = useState(false);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const user = await res.json();
          if (user && user.role === 'PATIENT') {
            setIsLoggedIn(true);
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
          }
        }
      } catch (e) {
        console.error('Session check failed:', e);
      }
    };
    checkSession();
  }, []);

  // Resolve dynamic theme colors based on slug or custom database override
  const baseScheme = CLINIC_COLORS[clinic.slug] || CLINIC_COLORS.default;
  const colorScheme = {
    primary: clinic.themeColor || baseScheme.primary,
    secondary: baseScheme.secondary,
    glow: baseScheme.glow,
  };

  // Ant Design Custom Theme configuration
  const themeConfig = {
    token: {
      colorPrimary: colorScheme.primary,
      colorBgContainer: '#111827', // Gray 900
      colorBgElevated: '#1f2937', // Gray 800
      colorText: '#f3f4f6', // Gray 100
      colorTextDescription: '#9ca3af', // Gray 400
      colorBorder: '#374151', // Gray 700
      borderRadius: 16,
    },
    algorithm: antdTheme.darkAlgorithm,
  };

  // Questionnaire States
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [thinningArea, setThinningArea] = useState('');
  const [fallSpeed, setFallSpeed] = useState('');
  const [sleep, setSleep] = useState('');
  const [stress, setStress] = useState('');
  const [dandruff, setDandruff] = useState('');
  const [diet, setDiet] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');

  // Contact States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Photo States (Base64)
  const [frontPhoto, setFrontPhoto] = useState('');
  const [topPhoto, setTopPhoto] = useState('');
  const [backPhoto, setBackPhoto] = useState('');

  // Convert File helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const cleanBase64 = base64.split(',')[1] || '';
      setter(cleanBase64);
    };
    reader.readAsDataURL(file);
  };

  const nextStep = () => {
    if (step === 1 && (!gender || !age)) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'warning',
        title: 'Details Required',
        text: 'Please select both your gender and age group.',
        confirmButtonColor: colorScheme.primary
      });
      return;
    }
    if (step === 2 && (!thinningArea || !fallSpeed)) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'warning',
        title: 'Details Required',
        text: 'Please specify your thinning area and rate of hair fall.',
        confirmButtonColor: colorScheme.primary
      });
      return;
    }
    if (step === 3 && (!sleep || !stress || !diet)) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'warning',
        title: 'Details Required',
        text: 'Please provide sleep, stress, and dietary details.',
        confirmButtonColor: colorScheme.primary
      });
      return;
    }
    if (step === 4 && !familyHistory) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'warning',
        title: 'Details Required',
        text: 'Please answer the family history query.',
        confirmButtonColor: colorScheme.primary
      });
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!name || !email) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'warning',
        title: 'Contact Required',
        text: 'Please enter your name and email to receive the report.',
        confirmButtonColor: colorScheme.primary
      });
      return;
    }

    setLoading(true);

    const answersSummary = `Traya Lifestyle Profile: Gender: ${gender}, Age: ${age}, Concern: ${thinningArea}, Hairfall Rate: ${fallSpeed}, Sleep: ${sleep}, Stress: ${stress}, Dandruff: ${dandruff || 'No'}, Diet: ${diet}, Genetic Factor: ${familyHistory}`;

    const photosPayload: any = {};
    if (frontPhoto) photosPayload.frontPhoto = frontPhoto;
    if (topPhoto) photosPayload.topPhoto = topPhoto;
    if (backPhoto) photosPayload.backPhoto = backPhoto;

    if (Object.keys(photosPayload).length === 0) {
      photosPayload.frontPhoto = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    try {
      const res = await fetch('/api/public/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          photos: photosPayload,
          notes: answersSummary,
          clinicSlug: clinic.slug
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze');

      setResult(data.analysis);
      setActiveLeadId(data.leadId || null);
      setIsGuest(data.isGuest !== false);
      setPatientId(data.patientId || null);
      setWhatsappTracked(false);

      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'success',
        title: 'Analysis Complete!',
        text: `Your report has been saved under ${clinic.name}.`,
        confirmButtonColor: colorScheme.primary
      });
    } catch (err: any) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'error',
        title: 'Diagnostics Failed',
        text: err.message || 'Connection to the diagnosis engine failed.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setLoading(false);
    }
  };

  const getLifestyleRecommendation = () => {
    const list = [];
    if (stress === 'High') {
      list.push("High cortisol (stress hormone) triggers Telogen Effluvium. Consider daily meditation or Ashwagandha root extracts to calm roots.");
    }
    if (sleep === 'Less than 6 hours') {
      list.push("Poor sleep limits protein synthesis. Ensure at least 7.5 hours of dark sleep to maintain healthy follicle division.");
    }
    if (diet === 'Vegetarian') {
      list.push("Plant diets can be low in iron and amino acids. Integrate pumpkin seeds, spinach, or plant-based iron supplements.");
    }
    if (familyHistory === 'Yes') {
      list.push("Genetic Androgenetic Alopecia factor detected. Early intervention with topical clinical DHT-blocker serums is highly recommended.");
    }
    if (list.length === 0) {
      list.push("Your routines look solid. Continue maintaining hydration, biotin-rich diets, and proper hair wash routines.");
    }
    return list;
  };

  const stepsItems = [
    { title: 'Profile' },
    { title: 'Concerns' },
    { title: 'Lifestyle' },
    { title: 'Genetics' },
    { title: 'Photos' },
    { title: 'Contact' }
  ];

  return (
    <ConfigProvider theme={themeConfig}>
      <div 
        className="min-h-screen text-slate-100 flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden bg-[#070b13]"
        style={clinic.backgroundImage ? {
          backgroundImage: `linear-gradient(to bottom, rgba(7, 11, 19, 0.88), rgba(7, 11, 19, 0.94)), url(${clinic.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {/* Ambient background glows using dynamic theme color */}
        <div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" 
          style={{
            background: `radial-gradient(circle, ${colorScheme.primary}18 0%, transparent 70%)`
          }}
        />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl w-full space-y-8 z-10">
          {/* Header Section */}
          <div className="text-center space-y-4">
            {clinic.logo ? (
              <img src={clinic.logo} alt={clinic.name} className="h-14 object-contain mx-auto mb-2 rounded-xl border border-slate-800/85 p-1.5 bg-slate-900/40" />
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-850 text-xs font-semibold tracking-wide">
                <Award className="w-4 h-4" style={{ color: colorScheme.primary }} />
                <span style={{ color: colorScheme.primary }}>Certified Partner Clinic</span>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {clinic.name} Hair & Lifestyle Test
            </h1>
            <p className="text-slate-400 max-w-md mx-auto text-xs md:text-sm font-medium leading-relaxed">
              Get an instant clinical-grade hair diagnostics report and custom routine guidance powered by our medical team.
            </p>
          </div>

          {result ? (
            /* Premium Results Dashboard View with larger typography and dynamic icons */
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(255,255,255,0.03)] space-y-8 animate-in fade-in zoom-in-95 duration-500">
              
              {/* Header info */}
              <div className="text-center space-y-2 pb-6 border-b border-slate-800/60">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircleOutlined />
                  <span>AI Diagnostics Report Verified</span>
                </div>
                <h2 className="text-3xl font-bold text-white">Full Scalp & Follicular Assessment</h2>
                <p className="text-sm text-white font-medium">Auto-generated diagnostic report for {clinic.name}</p>
              </div>

              {/* Row 1: Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Norwood Stage */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-3.5 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <NodeIndexOutlined />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Alopecia Stage</span>
                  <span className="text-4xl font-extrabold block" style={{ color: colorScheme.primary }}>{result.norwoodStage || 'N/A'}</span>
                  <span className="text-xs text-white font-medium block">Norwood Scale classification</span>
                </div>

                {/* Graft Estimate */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-3.5 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <DatabaseOutlined />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Est. Graft count</span>
                  <span className="text-3xl font-extrabold text-white block">
                    {result.estimatedGraftRequirement?.minimumGrafts || 1500} - {result.estimatedGraftRequirement?.maximumGrafts || 2000}
                  </span>
                  <span className="text-xs text-white font-medium block">Required for optimal coverage</span>
                </div>

                {/* Donor Area */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-3.5 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <DashboardOutlined />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">Donor Capacity</span>
                  <span className="text-3xl font-extrabold text-white block">{result.donorArea?.rating || 'GOOD'}</span>
                  <span className="text-xs text-white font-medium block">
                    ({result.donorArea?.densityEstimateGraftsPerCm2 || 75} Grafts/cm²)
                  </span>
                </div>
              </div>

              {/* Row 2: Rationale & Recommendation Detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Treatment Rationale */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <MedicineBoxOutlined />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span>Clinical Recommendation</span>
                  </h4>
                  <div className="space-y-3">
                    <p className="text-sm text-white font-bold">
                      Suggested Treatment: <span style={{ color: colorScheme.primary }}>{result.procedureAssessment?.preliminaryRecommendation || 'FUE'}</span>
                    </p>
                    <p className="text-sm text-white leading-relaxed font-medium">
                      {result.procedureAssessment?.rationale || 'Detailed hair restoration procedure based on local baldness severity.'}
                    </p>
                  </div>
                </div>

                {/* Next Steps & Confidence Score */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-5 relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <SlidersOutlined />
                  </div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircleOutlined style={{ color: '#10b981' }} />
                    <span>AI Diagnostics Reliability</span>
                  </h4>
                  
                  {/* Confidence Meter using Ant Design Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>Analysis Confidence Score</span>
                      <span>{Math.round((result.confidenceScore || 0.95) * 100)}%</span>
                    </div>
                    <Progress 
                      percent={Math.round((result.confidenceScore || 0.95) * 100)} 
                      showInfo={false} 
                      size="small"
                      strokeColor={colorScheme.primary}
                    />
                  </div>

                  {/* Next Steps List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-widest block font-sans">Recommended Next Steps:</span>
                    <ul className="text-sm text-white space-y-1.5 list-disc pl-5 font-medium">
                      {result.recommendedNextSteps?.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Row 3: Zone Breakdown Details */}
              {result.zoneBreakdown && (
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider block">Detailed Follicular Zone Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {/* Frontal */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        <AimOutlined className="text-teal-500" />
                        <span>Frontal Recession</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.frontalRecession || 'Moderate Hair Loss'}</span>
                    </div>
                    {/* Mid Scalp */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        <DashboardOutlined className="text-teal-500" />
                        <span>Mid-Scalp Density</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.midScalpDensity || 'Thinning Detected'}</span>
                    </div>
                    {/* Crown */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        <EnvironmentOutlined className="text-teal-500" />
                        <span>Crown / Vertex</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.crownVertex || 'Thinning whorl'}</span>
                    </div>
                    {/* Temples */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                        <SolutionOutlined className="text-teal-500" />
                        <span>Temporal Peaks</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.temporalPeaks || 'Mild Recession'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 4: Lifestyle & Observations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lifestyle Recs */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider block">Diet & Lifestyle Corrections</h4>
                  <div className="space-y-3.5 text-sm text-white leading-relaxed font-medium">
                    {getLifestyleRecommendation().map((rec, i) => (
                      <p key={i} className="flex gap-3 items-start">
                        <HeartOutlined style={{ color: colorScheme.primary }} className="mt-1" />
                        <span>{rec}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Clinical Indicators */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider block">Detected Indicators</h4>
                  <ul className="text-sm text-white space-y-3 leading-relaxed font-medium list-none pl-0">
                    {result.clinicalObservations?.map((obs: string, idx: number) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <WarningOutlined className="text-amber-500 mt-1" />
                        <span>{obs}</span>
                      </li>
                    )) || <li>No scaling, infection or severe signs detected.</li>}
                  </ul>
                </div>
              </div>

              {/* Booking Call to Action */}
              <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl text-xs md:text-sm text-amber-300 font-semibold leading-relaxed text-center shadow-inner">
                ⚠️ Automated estimate based on provided details. A hair restoration specialist from <strong>{clinic.name}</strong> will review these findings and reach out to you shortly at {phone || email} to plan your FUE consultation.
              </div>

              {/* Norwood Stage Explanation Details */}
              {result.norwoodStage && (
                (() => {
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
                      care: 'Medical DHT-blocker therapies or minor Sapphire FUE transplant.',
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
                  const info = STAGE_DETAILS[result.norwoodStage] || STAGE_DETAILS.UNCERTAIN;
                  return (
                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider block" style={{ color: colorScheme.primary }}>
                        {info.title}
                      </h4>
                      <p className="text-sm text-slate-355 leading-relaxed">
                        {info.desc}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-900/30 p-4 border border-slate-850 rounded-xl">
                          <span className="font-bold text-slate-200 block mb-1.5">Visual Indicators</span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-400">
                            {info.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                        <div className="bg-slate-900/30 p-4 border border-slate-850 rounded-xl">
                          <span className="font-bold text-slate-200 block mb-1.5">Recommended Care</span>
                          <p className="text-slate-400">{info.care}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Guest Patient Registration Form */}
              {isGuest && !isLoggedIn && (
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Save Your Diagnostics Permanently</h3>
                    <p className="text-xs text-slate-400 mt-1">Create a password to register your patient account and save this diagnosis report to the {clinic.name} patient portal.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input.Password 
                      placeholder="Create Password" 
                      size="large"
                      className="flex-1 bg-slate-900/40 border-slate-800 text-white rounded-xl"
                      id="register-password"
                    />
                    <Button
                      type="primary"
                      size="large"
                      className="rounded-xl font-bold"
                      onClick={async () => {
                        const passwordInput = (document.getElementById('register-password') as HTMLInputElement)?.value;
                        if (!passwordInput) {
                          Swal.fire({
                            background: '#111827',
                            color: '#f3f4f6',
                            icon: 'warning',
                            title: 'Password Required',
                            text: 'Please enter a password to register your account.',
                            confirmButtonColor: colorScheme.primary
                          });
                          return;
                        }
                        try {
                          const res = await fetch('/api/auth/register-patient', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name,
                              email,
                              phone,
                              password: passwordInput,
                              leadId: activeLeadId
                            })
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error || 'Failed to register');
                          setIsLoggedIn(true);
                          setIsGuest(false);
                          Swal.fire({
                            background: '#111827',
                            color: '#f3f4f6',
                            icon: 'success',
                            title: 'Account Registered!',
                            text: 'You have been registered. Redirecting to your patient portal...',
                            confirmButtonColor: colorScheme.primary
                          }).then(() => {
                            window.location.href = '/portal';
                          });
                        } catch (e: any) {
                          Swal.fire({
                            background: '#111827',
                            color: '#f3f4f6',
                            icon: 'error',
                            title: 'Registration Failed',
                            text: e.message || 'Unable to register account at this time.',
                            confirmButtonColor: '#e11d48'
                          });
                        }
                      }}
                    >
                      Register Patient Account
                    </Button>
                  </div>
                </div>
              )}

              {/* WhatsApp Tracking CTA */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 text-center space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider block">12-Month WhatsApp Recovery Tracking</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-lg mx-auto">
                    Enroll in our 12-month post-operative WhatsApp care plan to submit regular growth audits and get recovery checks directly from our surgeons.
                  </p>
                </div>
                <Button
                  type="primary"
                  size="large"
                  style={{ backgroundColor: whatsappTracked ? '#10b981' : '#25D366', borderColor: whatsappTracked ? '#10b981' : '#25D366' }}
                  className="rounded-xl font-bold inline-flex items-center gap-2 hover:opacity-90"
                  onClick={async () => {
                    try {
                      await fetch('/api/public/track-whatsapp', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ leadId: activeLeadId, patientId })
                      });
                      setWhatsappTracked(true);
                      const greeting = `Hello ${clinic.name}! My name is ${name}. I just completed my AI Hair Test (Norwood Stage ${result.norwoodStage}). Please enroll me in my 12-month post-op WhatsApp recovery list.`;
                      const url = `https://wa.me/${clinic.phone.replace(/[^0-9]/g, '') || '919501554888'}?text=${encodeURIComponent(greeting)}`;
                      window.open(url, '_blank');
                    } catch (e) {
                      console.error('Failed to register WhatsApp tracking:', e);
                    }
                  }}
                >
                  {whatsappTracked ? 'Enrolled in WhatsApp Tracker ✓' : 'Track My Growth on WhatsApp'}
                </Button>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => {
                    setResult(null);
                    setStep(1);
                    resetForm();
                  }}
                  type="default"
                  size="large"
                  className="rounded-2xl px-6 font-bold"
                >
                  Reset and Take Test Again
                </Button>
              </div>
            </div>
          ) : (
            /* Premium Form Wizard Card using Ant Design */
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(255,255,255,0.03)] space-y-8">
              
              {/* Ant Design Steps Navigation */}
              <div className="pb-6 mb-8 border-b border-slate-800/60">
                <Steps 
                  current={step - 1} 
                  items={stepsItems} 
                  size="small" 
                />
              </div>

              {loading ? (
                <div className="py-20 text-center space-y-4">
                  <Spin size="large" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compiling AI Health Profile...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* STEP 1: GENDER & AGE */}
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Gender</label>
                        <div className="grid grid-cols-2 gap-4">
                          {['Male', 'Female'].map((g) => (
                            <button
                              key={g}
                              onClick={() => setGender(g)}
                              className={`p-4.5 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                                gender === g
                                  ? `bg-slate-950/40 text-white`
                                  : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                              }`}
                              style={gender === g ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Age Group</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {['18-24', '25-34', '35-44', '45+'].map((a) => (
                            <button
                              key={a}
                              onClick={() => setAge(a)}
                              className={`p-4.5 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                                age === a
                                  ? `bg-slate-950/40 text-white`
                                  : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                              }`}
                              style={age === a ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CONCERNS */}
                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Thinning Zone</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {['Frontal Hairline', 'Crown Vertex', 'Overall Thinning'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setThinningArea(t)}
                              className={`p-4.5 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                                thinningArea === t
                                  ? `bg-slate-950/40 text-white`
                                  : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                              }`}
                              style={thinningArea === t ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rate of Hair Fall</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {['Normal (Less than 50/day)', 'Moderate (50-100/day)', 'High (Over 100/day)'].map((f) => (
                            <button
                              key={f}
                              onClick={() => setFallSpeed(f)}
                              className={`p-4.5 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                                fallSpeed === f
                                  ? `bg-slate-950/40 text-white`
                                  : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                              }`}
                              style={fallSpeed === f ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: LIFESTYLE */}
                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Sleep Duration</label>
                          <div className="flex flex-col gap-3">
                            {['Less than 6 hours', '6 to 8 hours', 'More than 8 hours'].map((s) => (
                              <button
                                key={s}
                                onClick={() => setSleep(s)}
                                className={`p-4 rounded-2xl text-xs font-bold border text-left px-5 transition-all duration-300 ${
                                  sleep === s
                                    ? `bg-slate-950/40 text-white`
                                    : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                }`}
                                style={sleep === s ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stress Levels</label>
                          <div className="flex flex-col gap-3">
                            {['Low', 'Medium', 'High'].map((st) => (
                              <button
                                key={st}
                                onClick={() => setStress(st)}
                                className={`p-4 rounded-2xl text-xs font-bold border text-left px-5 transition-all duration-300 ${
                                  stress === st
                                    ? `bg-slate-950/40 text-white`
                                    : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                }`}
                                style={stress === st ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dietary Habits</label>
                          <div className="flex flex-col gap-3">
                            {['Vegetarian', 'Non-Vegetarian', 'Vegan'].map((d) => (
                              <button
                                key={d}
                                onClick={() => setDiet(d)}
                                className={`p-4 rounded-2xl text-xs font-bold border text-left px-5 transition-all duration-300 ${
                                  diet === d
                                    ? `bg-slate-950/40 text-white`
                                    : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                }`}
                                style={diet === d ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Dandruff Concern?</label>
                          <div className="flex flex-col gap-3">
                            {['Yes, flaky/itchy scalp', 'No, clear scalp'].map((df) => (
                              <button
                                key={df}
                                onClick={() => setDandruff(df)}
                                className={`p-4 rounded-2xl text-xs font-bold border text-left px-5 transition-all duration-300 ${
                                  dandruff === df
                                    ? `bg-slate-950/40 text-white`
                                    : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                                }`}
                                style={dandruff === df ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                              >
                                {df}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: GENETICS */}
                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-3 text-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">Does hair thinning run in your family?</label>
                        <p className="text-[11px] text-slate-500 font-semibold max-w-sm mx-auto">Genetic hair loss (androgenetic alopecia) typically follows maternal or paternal lineage.</p>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
                          {['Yes', 'No'].map((fh) => (
                            <button
                              key={fh}
                              onClick={() => setFamilyHistory(fh)}
                              className={`p-5 rounded-2xl text-xs font-bold border transition-all duration-300 ${
                                familyHistory === fh
                                  ? `bg-slate-950/40 text-white`
                                  : 'bg-slate-950/20 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                              }`}
                              style={familyHistory === fh ? { borderColor: colorScheme.primary, boxShadow: `0 0 15px ${colorScheme.primary}40`, color: colorScheme.primary } : {}}
                            >
                              {fh}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: PHOTOS */}
                  {step === 5 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">Upload Scalp Images (Optional)</label>
                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed">
                          Clear photos enable highly accurate computer vision assessments. evaluation is done under strict clinical confidentiality.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Front */}
                        <div className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 text-center space-y-3.5 hover:border-slate-800 transition-colors">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Front Hairline</span>
                          <input
                            type="file"
                            accept="image/*"
                            id="front-input-c"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setFrontPhoto)}
                          />
                          <label
                            htmlFor="front-input-c"
                            className={`inline-block w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-300 ${
                              frontPhoto
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
                            }`}
                            style={frontPhoto ? { borderColor: '#10b981', color: '#10b981' } : {}}
                          >
                            <CameraOutlined className="mr-1.5" />
                            {frontPhoto ? 'Selected ✓' : 'Choose Photo'}
                          </label>
                        </div>

                        {/* Top */}
                        <div className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 text-center space-y-3.5 hover:border-slate-800 transition-colors">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Top / Crown</span>
                          <input
                            type="file"
                            accept="image/*"
                            id="top-input-c"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setTopPhoto)}
                          />
                          <label
                            htmlFor="top-input-c"
                            className={`inline-block w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-300 ${
                              topPhoto
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
                            }`}
                            style={topPhoto ? { borderColor: '#10b981', color: '#10b981' } : {}}
                          >
                            <CameraOutlined className="mr-1.5" />
                            {topPhoto ? 'Selected ✓' : 'Choose Photo'}
                          </label>
                        </div>

                        {/* Back */}
                        <div className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 text-center space-y-3.5 hover:border-slate-800 transition-colors">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Back / Donor</span>
                          <input
                            type="file"
                            accept="image/*"
                            id="back-input-c"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setBackPhoto)}
                          />
                          <label
                            htmlFor="back-input-c"
                            className={`inline-block w-full py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-300 ${
                              backPhoto
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-md'
                            }`}
                            style={backPhoto ? { borderColor: '#10b981', color: '#10b981' } : {}}
                          >
                            <CameraOutlined className="mr-1.5" />
                            {backPhoto ? 'Selected ✓' : 'Choose Photo'}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: CONTACT DETAILS */}
                  {step === 6 && (
                    <div className="space-y-6 animate-in fade-in duration-300 max-w-md mx-auto font-sans">
                      <div className="space-y-2 text-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confirm Contact Details</label>
                        <p className="text-[11px] text-slate-550 font-semibold leading-relaxed">
                          Your diagnostic report will be compiled under these credentials. If you have an active patient account, use the registered email to link your results.
                        </p>
                      </div>

                      <div className="space-y-4 max-w-md mx-auto pt-2">
                        <Input 
                          prefix={<UserOutlined className="text-slate-400" />} 
                          placeholder="Full Name" 
                          size="large"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        <Input 
                          prefix={<MailOutlined className="text-slate-400" />} 
                          placeholder="Email Address" 
                          size="large"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoggedIn}
                        />
                        <Input 
                          prefix={<PhoneOutlined className="text-slate-400" />} 
                          placeholder="Phone Number (Optional)" 
                          size="large"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-6">
                    {step > 1 ? (
                      <Button
                        onClick={prevStep}
                        icon={<ArrowLeftOutlined />}
                        size="large"
                        className="rounded-xl border border-slate-800"
                      >
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {step < 6 ? (
                      <Button
                        onClick={nextStep}
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        size="large"
                        className="rounded-xl ml-auto font-bold"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        type="primary"
                        icon={<Sparkles className="w-4 h-4 text-white" />}
                        size="large"
                        className="rounded-xl ml-auto font-bold bg-gradient-to-r"
                      >
                        Generate Diagnosis Report
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ConfigProvider>
  );

  function resetForm() {
    setGender('');
    setAge('');
    setThinningArea('');
    setFallSpeed('');
    setSleep('');
    setStress('');
    setDandruff('');
    setDiet('');
    setFamilyHistory('');
    setName('');
    setEmail('');
    setPhone('');
    setFrontPhoto('');
    setTopPhoto('');
    setBackPhoto('');
  }
}
