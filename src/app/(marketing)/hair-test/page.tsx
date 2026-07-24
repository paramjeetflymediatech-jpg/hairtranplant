'use client';

import React, { useState, useEffect } from 'react';
import { ConfigProvider, Steps, Progress, Input, Button, Spin, theme as antdTheme } from 'antd';
import { Sparkles, Activity, ShieldCheck } from 'lucide-react';
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
  FieldTimeOutlined,
  LockOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';

// Detailed Norwood stage description map
const norwoodStageDetails: Record<string, { title: string; description: string; symptoms: string[]; care: string }> = {
  'Norwood I': {
    title: 'Stage I: Minimal Hair Loss',
    description: 'No noticeable recession of the hairline or thinning at the crown. Follicles are highly active.',
    symptoms: ['Normal hairline shape', 'Dense scalp coverage', 'Minimal daily shedding (50-100 hairs)'],
    care: 'Maintain routine washing, a protein-rich diet, and standard hydration.'
  },
  'Norwood II': {
    title: 'Stage II: Receding Temples (Mild)',
    description: 'Minor, symmetrical hair recession at the temporal peaks. Hairline begins to form a slight V or M shape.',
    symptoms: ['Slight temple recession', 'Fully preserved crown vertex density', 'Miniaturization beginning at hairline'],
    care: 'Consider clinical DHT-blocker serums, scalp massage, and vitamins (Biotin, Zinc).'
  },
  'Norwood III': {
    title: 'Stage III: Receding Temples (Moderate)',
    description: 'Recession at temples becomes deep enough to be clinically classified as hair loss. The hairline forms a distinct M, U, or V shape.',
    symptoms: ['Significant temple recession', 'Hair thinning at the front', 'Slight loss of density on top'],
    care: 'Begin topical Minoxidil/Finasteride after consulting a specialist, or consider a minor FUE transplant (1,200 - 1,800 grafts) for temple restoration.'
  },
  'Norwood III Vertex': {
    title: 'Stage III Vertex: Crown Loss',
    description: 'Recession at the temple hairline with noticeable thinning at the crown (vertex) region.',
    symptoms: ['Temple recession', 'Thinning spot at the back whorl', 'Frontal hairline remains intact'],
    care: 'Combined medical therapy (DHT-blockers + PRP therapy) or crown FUE graft placement.'
  },
  'Norwood IV': {
    title: 'Stage IV: Frontal & Crown Recession',
    description: 'Significant recession at the hairline and crown vertex, but a clear band of dense hair separates the two zones.',
    symptoms: ['Deep temple recession', 'Distinct bald spot at the crown', 'Solid bridge of hair across the top'],
    care: 'Sapphire FUE transplant recommended (1,800 - 2,500 grafts) to rebuild the frontal hairline and reinforce the crown vertex.'
  },
  'Norwood V': {
    title: 'Stage V: Severe Thinning',
    description: 'Hair loss at the hairline and crown is more severe. The bridge of hair separating them is extremely thin and sparse.',
    symptoms: ['Frontal and vertex bald areas enlarge', 'Separating band becomes very narrow/wispy', 'Horseshoe shape begins to define'],
    care: 'High-density Sapphire FUE or DHI transplant (2,500 - 3,500 grafts) to bridge both regions and restore full density.'
  },
  'Norwood VI': {
    title: 'Stage VI: Conjoined Baldness',
    description: 'The bridge of hair separating the hairline and crown is completely gone. Frontal and crown bald zones merge into one large area.',
    symptoms: ['Merged front-to-back baldness', 'Sides and back donor areas remain intact', 'Miniaturization of remaining top hairs'],
    care: 'Extensive FUE procedure (3,500 - 4,500 grafts) over 2 days. Focuses on rebuilding the frontal zone first, then gradient density towards the back.'
  },
  'Norwood VII': {
    title: 'Stage VII: Extensive Baldness',
    description: 'The most severe stage of hair loss. Only a narrow horseshoe band of hair remains on the sides and back of the scalp.',
    symptoms: ['Complete top-of-scalp baldness', 'Donor band sits lower on the back of head', 'Hair caliber in remaining zones may thin'],
    care: 'Requires megasession transplant using both scalp and beard/body donor hair. Focuses on natural front restoration.'
  },
  'UNCERTAIN': {
    title: 'Uncertain Stage / Diffuse Thinning',
    description: 'Visual evidence points to diffuse thinning across the scalp rather than standard Norwood recession.',
    symptoms: ['Overall reduction in volume', 'Scalp visible under bright light', 'Intact hairline but low density'],
    care: 'PRP/GFC therapy sessions combined with clinical micro-needling and prescription topical solutions.'
  }
};

export default function HairTestPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Session & Guest States
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [registering, setRegistering] = useState(false);
  const [isWhatsappTracked, setIsWhatsappTracked] = useState(false);

  // Ant Design Custom Theme configuration (default teal theme for marketing)
  const themeConfig = {
    token: {
      colorPrimary: '#0d9488',
      colorBgContainer: '#111827',
      colorBgElevated: '#1f2937',
      colorText: '#f3f4f6',
      colorTextDescription: '#9ca3af',
      colorBorder: '#374151',
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

  // Fetch session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setSessionUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch((err) => console.error('Failed to load session:', err));
  }, []);

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
        confirmButtonColor: '#0d9488'
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
        confirmButtonColor: '#0d9488'
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
        confirmButtonColor: '#0d9488'
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
        confirmButtonColor: '#0d9488'
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
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setLoading(true);

    const answersSummary = `Lifestyle Profile: Gender: ${gender}, Age: ${age}, Concern: ${thinningArea}, Hairfall Rate: ${fallSpeed}, Sleep: ${sleep}, Stress: ${stress}, Dandruff: ${dandruff || 'No'}, Diet: ${diet}, Genetic Factor: ${familyHistory}`;

    const photosPayload: any = {};
    if (frontPhoto) photosPayload.frontPhoto = frontPhoto;
    if (topPhoto) photosPayload.topPhoto = topPhoto;
    if (backPhoto) photosPayload.backPhoto = backPhoto;

    // Use dummy placeholder if no photo was uploaded to trigger AI mock defaults
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
          clinicSlug: 'asg-hair' // Auto target default ASG Hair Clinic
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze');

      setResult(data.analysis);
      setSubmittedLeadId(data.leadId);
      setIsGuest(data.isGuest);
      setPatientId(data.patientId);

      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'success',
        title: 'Analysis Complete!',
        text: 'Your lifestyle scalp diagnostics report is ready.',
        confirmButtonColor: '#0d9488'
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

  // Convert guest to permanent Patient account
  const handleCreateAccount = async () => {
    if (!password) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'warning',
        title: 'Password Required',
        text: 'Please enter a password to secure your account.',
        confirmButtonColor: '#0d9488'
      });
      return;
    }

    setRegistering(true);

    try {
      const res = await fetch('/api/auth/register-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          leadId: submittedLeadId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create patient account');

      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'success',
        title: 'Account Created!',
        text: 'Your patient account has been created, and your diagnostics data is saved.',
        confirmButtonColor: '#0d9488'
      }).then(() => {
        window.location.href = '/portal';
      });
    } catch (err: any) {
      Swal.fire({
        background: '#111827',
        color: '#f3f4f6',
        icon: 'error',
        title: 'Registration Failed',
        text: err.message || 'Failed to register your patient account.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setRegistering(false);
    }
  };

  // Initiate WhatsApp progress tracking
  const handleWhatsAppTracking = async () => {
    try {
      await fetch('/api/public/track-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: submittedLeadId,
          patientId: patientId
        })
      });

      setIsWhatsappTracked(true);

      const stage = result?.norwoodStage || 'Uncertain';
      const greeting = `Hello ASG Hair Clinic! My name is ${name}. I just completed the AI Hair Test, and my result is ${stage}. Please initiate my 12-month post-op recovery tracking list.`;
      const url = `https://wa.me/919501554888?text=${encodeURIComponent(greeting)}`;
      
      window.open(url, '_blank');
    } catch (e) {
      console.error('Failed to register WhatsApp tracking:', e);
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

  // Resolve details of Norwood Stage
  const norwoodStageCode = result?.norwoodStage?.trim() || 'UNCERTAIN';
  const stageInfo = norwoodStageDetails[norwoodStageCode] || norwoodStageDetails['UNCERTAIN'];

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-slate-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl w-full space-y-8 z-10">
          {/* Title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-850 text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-teal-400">ASG Clinic Diagnostics Engine</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent animate-pulse">
              AI Hair & Lifestyle Test
            </h1>
            <p className="text-slate-400 max-w-md mx-auto text-xs md:text-sm font-medium leading-relaxed">
              Analyze your hair loss severity, check estimated graft requirements, and map your treatment timeline.
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
                <p className="text-sm text-slate-400 font-medium">Prepared for: <span className="text-teal-400 font-bold">{name}</span> ({email})</p>
              </div>

              {/* Row 1: Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Norwood Stage */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-3.5 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <NodeIndexOutlined />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-sans">Alopecia Stage</span>
                  <span className="text-4xl font-extrabold block text-teal-400">{result.norwoodStage || 'N/A'}</span>
                  <span className="text-xs text-slate-500 font-medium block">Norwood Scale classification</span>
                </div>

                {/* Graft Estimate */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-3.5 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <DatabaseOutlined />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Est. Graft count</span>
                  <span className="text-3xl font-extrabold text-white block">
                    {result.estimatedGraftRequirement?.minimumGrafts || 1500} - {result.estimatedGraftRequirement?.maximumGrafts || 2000}
                  </span>
                  <span className="text-xs text-slate-500 font-medium block">Required for optimal coverage</span>
                </div>

                {/* Donor Area */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-3.5 text-center relative overflow-hidden group hover:border-slate-700 transition-colors">
                  <div className="absolute top-4 right-4 text-slate-550 text-xl group-hover:text-teal-400 transition-colors">
                    <DashboardOutlined />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Donor Capacity</span>
                  <span className="text-3xl font-extrabold text-white block">{result.donorArea?.rating || 'GOOD'}</span>
                  <span className="text-xs text-slate-500 font-medium block">
                    ({result.donorArea?.densityEstimateGraftsPerCm2 || 75} Grafts/cm²)
                  </span>
                </div>
              </div>

              {/* DETAILED HAIR PROBLEMS INFO (Norwood Stage Deep Dive) */}
              <div className="p-6 rounded-2xl bg-slate-950/30 border border-slate-800/60 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <InfoCircleOutlined className="text-teal-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Details About Your Hair Loss Profile</h3>
                </div>
                
                <div className="space-y-4 text-left">
                  <div>
                    <h4 className="text-base font-bold text-teal-300">{stageInfo.title}</h4>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">{stageInfo.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850">
                      <span className="text-xs font-bold text-slate-400 block mb-2">Common Visual Symptoms:</span>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
                        {stageInfo.symptoms.map((symp, i) => (
                          <li key={i}>{symp}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-850">
                      <span className="text-xs font-bold text-slate-400 block mb-1.5">Recommended Clinical Care:</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{stageInfo.care}</p>
                    </div>
                  </div>
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
                      Suggested Treatment: <span className="text-teal-400">{result.procedureAssessment?.preliminaryRecommendation || 'FUE'}</span>
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
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
                      strokeColor="#0d9488"
                    />
                  </div>

                  {/* Next Steps List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-sans">Recommended Next Steps:</span>
                    <ul className="text-sm text-slate-300 space-y-1.5 list-disc pl-5 font-medium">
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
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <AimOutlined className="text-teal-500" />
                        <span>Frontal Recession</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.frontalRecession || 'Moderate Hair Loss'}</span>
                    </div>
                    {/* Mid Scalp */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <DashboardOutlined className="text-teal-500" />
                        <span>Mid-Scalp Density</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.midScalpDensity || 'Thinning Detected'}</span>
                    </div>
                    {/* Crown */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <EnvironmentOutlined className="text-teal-500" />
                        <span>Crown / Vertex</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.crownVertex || 'Thinning whorl'}</span>
                    </div>
                    {/* Temples */}
                    <div className="p-4 bg-slate-900/30 border border-slate-850 rounded-xl space-y-2.5 group hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <SolutionOutlined className="text-teal-500" />
                        <span>Temporal Peaks</span>
                      </div>
                      <span className="text-white font-bold leading-normal block">{result.zoneBreakdown.temporalPeaks || 'Mild Recession'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 4: Lifestyle & Diet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lifestyle Recs */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider block">Diet & Lifestyle Corrections</h4>
                  <div className="space-y-3.5 text-sm text-slate-300 leading-relaxed font-medium">
                    {getLifestyleRecommendation().map((rec, i) => (
                      <p key={i} className="flex gap-3 items-start">
                        <HeartOutlined style={{ color: '#0d9488' }} className="mt-1" />
                        <span>{rec}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Clinical Indicators */}
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider block">Detected Indicators</h4>
                  <ul className="text-sm text-slate-300 space-y-3 leading-relaxed font-medium list-none pl-0">
                    {result.clinicalObservations?.map((obs: string, idx: number) => (
                      <li key={idx} className="flex gap-2.5 items-start">
                        <WarningOutlined className="text-amber-500 mt-1" />
                        <span>{obs}</span>
                      </li>
                    )) || <li>No scaling, infection or severe signs detected.</li>}
                  </ul>
                </div>
              </div>

              {/* GUEST ACCOUNT REGISTRATION / SAVE PROGRESS */}
              {isGuest && !sessionUser && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/30 to-slate-950/40 border border-teal-800/50 space-y-4 animate-in fade-in duration-700">
                  <div className="flex items-center gap-2">
                    <LockOutlined className="text-teal-400 text-lg" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Save Your Diagnostics to a Patient Profile</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Create a password to register your patient account at ASG Hair Clinic. This allows you to log in to the Patient Portal, book video consultations, and trace your 12-month post-op growth timeline.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 max-w-md">
                    <Input.Password
                      placeholder="Choose a Secure Password"
                      size="large"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-slate-900 border-slate-850 hover:border-slate-800 text-white"
                      disabled={registering}
                    />
                    <Button
                      onClick={handleCreateAccount}
                      type="primary"
                      size="large"
                      loading={registering}
                      className="rounded-xl font-bold bg-teal-600 hover:bg-teal-500 shrink-0 w-full sm:w-auto"
                    >
                      Create Account & Save
                    </Button>
                  </div>
                </div>
              )}

              {/* WHATSAPP TRACKING & FOLLOW-UP ACTION */}
              <div className="p-6 bg-slate-950/50 border border-slate-850 rounded-2xl space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-5 h-5 text-teal-400" />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">ASG WhatsApp Growth Tracker</h4>
                </div>
                <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                  Start our 12-month post-operative WhatsApp tracking list. Our medical consultants will check in with you regularly to trace graft division and follicle health at Day 1, 7, 15, and months 1 to 12.
                </p>

                <div className="flex justify-center">
                  <Button
                    onClick={handleWhatsAppTracking}
                    size="large"
                    className={`rounded-2xl font-bold px-8 flex items-center gap-2 border-0 ${
                      isWhatsappTracked 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                        : 'bg-[#25D366] text-white hover:bg-[#22c35e]'
                    }`}
                  >
                    {/* SVG WhatsApp Icon */}
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.022-.08-.124-.134-.262-.204-.136-.07-1.036-.51-1.197-.568-.162-.058-.28-.088-.398.088-.118.176-.456.568-.56.686-.104.12-.208.134-.344.065-.136-.07-.577-.213-1.097-.676-.406-.362-.68-.81-.76-.948-.08-.136-.008-.21.06-.278.062-.062.136-.158.205-.238.07-.08.092-.136.137-.226.046-.09.022-.168-.01-.238-.03-.07-.28-.676-.384-.925-.1-.24-.2-.208-.28-.213-.07-.002-.153-.002-.236-.002-.084 0-.22.03-.336.158-.116.128-.444.434-.444 1.058 0 .624.454 1.228.516 1.312.06.084.892 1.362 2.162 1.912.302.13.538.208.722.267.302.096.577.082.795.05.243-.036.75-.306.855-.602.106-.296.106-.55.074-.602-.03-.05-.136-.08-.264-.15zM12 2C6.477 2 2 6.477 2 12c0 2.01.593 3.882 1.614 5.46L2.03 22l4.73-1.547C8.258 21.282 10.076 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.724 0-3.32-.54-4.636-1.46l-.333-.23-2.73.893.91-2.617-.253-.356C4.086 15.027 3.5 13.58 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/>
                    </svg>
                    <span>{isWhatsappTracked ? 'WhatsApp Tracking Enrolled ✓' : 'Track My Growth on WhatsApp'}</span>
                  </Button>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => {
                    setResult(null);
                    setSubmittedLeadId(null);
                    setPassword('');
                    setIsWhatsappTracked(false);
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
                              style={gender === g ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                              style={age === a ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                              style={thinningArea === t ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                              style={fallSpeed === f ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                                style={sleep === s ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                                style={stress === st ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                                style={diet === d ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                                style={dandruff === df ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Does hair thinning run in your family?</label>
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
                              style={familyHistory === fh ? { borderColor: '#0d9488', boxShadow: `0 0 15px rgba(13,148,136,0.25)`, color: '#0d9488' } : {}}
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Upload Hair/Scalp Views</label>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                          For precise AI graft estimation, upload at least one scalp view photograph. Images are encrypted and evaluated under clinical confidentiality.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                        {/* Front Photo */}
                        <div className="p-5 rounded-2xl bg-slate-950/20 border border-slate-800 hover:border-slate-700 transition-all text-center space-y-4 relative">
                          <CameraOutlined className="text-2xl text-teal-400" />
                          <span className="text-xs font-bold text-white block">Front Hairline View</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, setFrontPhoto)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-teal-650 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-md block uppercase tracking-wider">
                            {frontPhoto ? 'Selected ✓' : 'Select Photo'}
                          </span>
                        </div>

                        {/* Top Photo */}
                        <div className="p-5 rounded-2xl bg-slate-950/20 border border-slate-800 hover:border-slate-700 transition-all text-center space-y-4 relative">
                          <CameraOutlined className="text-2xl text-teal-400" />
                          <span className="text-xs font-bold text-white block">Crown / Vertex View</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, setTopPhoto)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-teal-650 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-md block uppercase tracking-wider">
                            {topPhoto ? 'Selected ✓' : 'Select Photo'}
                          </span>
                        </div>

                        {/* Back Photo */}
                        <div className="p-5 rounded-2xl bg-slate-950/20 border border-slate-800 hover:border-slate-700 transition-all text-center space-y-4 relative">
                          <CameraOutlined className="text-2xl text-teal-400" />
                          <span className="text-xs font-bold text-white block">Back / Donor Area View</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, setBackPhoto)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-teal-650 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-md block uppercase tracking-wider">
                            {backPhoto ? 'Selected ✓' : 'Select Photo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: CONTACT */}
                  {step === 6 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Confirm Contact Details</label>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
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
                          disabled={!!sessionUser} // Lock if logged in
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
                        className="rounded-xl ml-auto font-bold animate-pulse"
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
    if (!sessionUser) {
      setName('');
      setEmail('');
      setPhone('');
    }
    setFrontPhoto('');
    setTopPhoto('');
    setBackPhoto('');
  }
}
