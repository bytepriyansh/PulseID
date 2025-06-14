import {
  FileText,
  Download,
  Share2,
  Calendar,
  User,
  Heart,
  Pill,
  AlertTriangle,
  Brain,
  Clock,
  Droplets,
  ChevronLeft,
  Clipboard,
  Shield,
  Activity,
  Thermometer
} from 'lucide-react';
import Layout from '../components/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  conditions: string;
  medications: string;
  allergies: string;
  symptoms: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  timestamp?: string;
}

interface RiskAssessment {
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  analysisDate: string;
  summary: string;
  guidelines: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    oxygenSaturation?: string;
  };
}

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const encodedData = searchParams.get('data');

  // Parse the profile data from URL
  const parseProfileData = (): ProfileData => {
    try {
      return encodedData
        ? JSON.parse(decodeURIComponent(encodedData))
        : {
          name: '',
          age: '',
          gender: 'Male',
          bloodGroup: 'A+',
          conditions: '',
          medications: '',
          allergies: '',
          symptoms: '',
          emergencyContactName: '',
          emergencyContactNumber: ''
        };
    } catch (error) {
      console.error('Error parsing profile data:', error);
      return {
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'A+',
        conditions: '',
        medications: '',
        allergies: '',
        symptoms: '',
        emergencyContactName: '',
        emergencyContactNumber: ''
      };
    }
  };

  const profileData = parseProfileData();

  // Generate simulated vital signs based on conditions
  const generateVitalSigns = (conditions: string): RiskAssessment['vitalSigns'] => {
    const vitals: RiskAssessment['vitalSigns'] = {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      oxygenSaturation: '98%'
    };

    if (conditions.toLowerCase().includes('hypertension')) {
      vitals.bloodPressure = '145/95 mmHg';
    }
    if (conditions.toLowerCase().includes('fever')) {
      vitals.temperature = '101.2°F';
    }
    if (conditions.toLowerCase().includes('asthma') || conditions.toLowerCase().includes('copd')) {
      vitals.oxygenSaturation = '92%';
    }
    if (conditions.toLowerCase().includes('tachycardia')) {
      vitals.heartRate = '110 bpm';
    }

    return vitals;
  };

  const generateRiskAssessment = (data: ProfileData): RiskAssessment => {
    const hasCriticalConditions = data.conditions?.toLowerCase().includes('diabetes') ||
      data.conditions?.toLowerCase().includes('heart') ||
      data.conditions?.toLowerCase().includes('asthma') ||
      data.conditions?.toLowerCase().includes('stroke');

    const hasSevereSymptoms = data.symptoms?.toLowerCase().includes('chest pain') ||
      data.symptoms?.toLowerCase().includes('difficulty breathing') ||
      data.symptoms?.toLowerCase().includes('severe bleeding');

    const hasAllergies = data.allergies?.trim().length > 0;
    const hasSymptoms = data.symptoms?.trim().length > 0;

    let riskLevel: RiskAssessment['level'] = 'LOW';
    let summary = 'No significant risk factors identified';
    const guidelines: string[] = [];
    const vitalSigns = generateVitalSigns(data.conditions);

    if (hasSevereSymptoms) {
      riskLevel = 'CRITICAL';
      summary = '⚠️ EMERGENCY: Patient shows signs of potentially life-threatening conditions requiring immediate intervention';

      if (data.symptoms?.toLowerCase().includes('chest pain')) {
        guidelines.push('Immediate ECG and cardiac enzyme testing required');
        guidelines.push('Administer aspirin 325mg if no contraindications');
        guidelines.push('Prepare for possible STEMI protocol');
      }

      if (data.symptoms?.toLowerCase().includes('difficulty breathing')) {
        guidelines.push('Administer supplemental oxygen to maintain SpO2 > 90%');
        guidelines.push('Prepare for possible intubation if respiratory distress worsens');
      }

      if (data.symptoms?.toLowerCase().includes('severe bleeding')) {
        guidelines.push('Apply direct pressure to bleeding site immediately');
        guidelines.push('Initiate large bore IV access and prepare for possible transfusion');
      }
    } else if (hasCriticalConditions || hasSymptoms) {
      riskLevel = 'HIGH';
      summary = 'Patient has critical conditions or active symptoms requiring urgent attention';

      if (data.conditions?.toLowerCase().includes('diabetes')) {
        guidelines.push('Check blood glucose immediately (fingerstick)');
        guidelines.push('Monitor for signs of DKA or hypoglycemia');
        guidelines.push('Avoid medications that may affect glucose levels');
      }

      if (data.conditions?.toLowerCase().includes('asthma')) {
        guidelines.push('Administer bronchodilators (albuterol) via nebulizer');
        guidelines.push('Monitor oxygen saturation continuously');
        guidelines.push('Consider systemic corticosteroids for severe cases');
      }

      if (hasSymptoms) {
        guidelines.push('Perform complete vital signs assessment every 15 minutes');
        guidelines.push('Establish IV access for possible medication administration');
      }
    } else if (hasAllergies) {
      riskLevel = 'MODERATE';
      summary = 'Patient has medication allergies that require special consideration';
      guidelines.push(`STRICT AVOIDANCE of ${data.allergies} and related medications`);
      guidelines.push('Have alternative medications prepared and verified');
      guidelines.push('Document allergies prominently in all medical records');
    }

    return {
      level: riskLevel,
      analysisDate: data.timestamp
        ? new Date(data.timestamp).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        })
        : new Date().toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        }),
      summary,
      guidelines,
      vitalSigns
    };
  };

  const riskAssessment = generateRiskAssessment(profileData);

  const reportData = {
    generatedDate: profileData.timestamp
      ? new Date(profileData.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
      : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
    generatedTime: profileData.timestamp
      ? new Date(profileData.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      })
      : new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
    profile: {
      name: profileData.name || 'Not provided',
      age: profileData.age ? parseInt(profileData.age, 10) || 0 : 0,
      gender: profileData.gender || 'Not provided',
      bloodGroup: profileData.bloodGroup || 'Not provided',
      conditions: profileData.conditions || 'None reported',
      medications: profileData.medications || 'None reported',
      allergies: profileData.allergies || 'None reported',
      symptoms: profileData.symptoms || 'None reported',
      emergencyContact: profileData.emergencyContactName
        ? `${profileData.emergencyContactName} (${profileData.emergencyContactNumber || 'No number'})`
        : 'Not provided'
    },
    riskAssessment
  };

  const handleShareLink = async () => {
    const shareData = {
      title: 'PulseID Health Report',
      text: `Health report for ${reportData.profile.name}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Report link copied to clipboard!', {
          position: 'bottom-right',
        });
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link', {
          position: 'bottom-right',
        });
      }
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition-colors print:hidden"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="text-center mb-8 print:mb-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center print:bg-emerald-500">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 print:text-2xl">
              Medical Emergency Report
            </h1>
          </div>
          <p className="text-lg text-slate-600 print:text-sm print:text-slate-700">
            Comprehensive medical profile and risk assessment summary
          </p>
        </div>

        {/* Emergency Alert Banner for Critical Cases */}
        {riskAssessment.level === 'CRITICAL' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg animate-pulse print:animate-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">🚨 IMMEDIATE ACTION REQUIRED</h2>
              </div>
              <span className="px-3 py-1 bg-white text-red-800 rounded-full font-bold">
                CODE RED
              </span>
            </div>
            <p className="mt-2 text-white">
              This patient requires emergency medical attention. Activate emergency protocols immediately.
            </p>
          </div>
        )}

        <div className="medical-card mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 print:border print:bg-white print:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-emerald-600 print:text-slate-600" />
              <div>
                <p className="font-semibold text-slate-800">Report Generated</p>
                <p className="text-sm text-slate-600 print:text-xs">
                  {reportData.generatedDate} at {reportData.generatedTime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 print:text-xs">Patient ID</p>
              <p className="font-mono text-sm text-slate-800 print:text-xs">
                {profileData.name ? profileData.name.substring(0, 3).toUpperCase() + '-' +
                  Math.floor(Math.random() * 9000 + 1000) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card mb-6 print:break-inside-avoid">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-6 h-6 text-slate-500" />
            <h2 className="text-2xl font-bold text-slate-800 print:text-xl">Profile Overview</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4">
            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg print:p-2 print:bg-white print:border print:border-slate-200">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600 print:text-xs">Name</p>
                  <p className="font-semibold text-slate-800 print:text-sm">
                    {reportData.profile.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg print:p-2 print:bg-white print:border print:border-slate-200">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600 print:text-xs">Age</p>
                  <p className="font-semibold text-slate-800 print:text-sm">
                    {reportData.profile.age} years
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg print:p-2 print:bg-white print:border print:border-slate-200">
                <Droplets className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-slate-600 print:text-xs">Blood Group</p>
                  <p className="font-semibold text-slate-800 print:text-sm">
                    {reportData.profile.bloodGroup}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg print:p-2 print:bg-white print:border print:border-slate-200">
                <Heart className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600 print:text-xs">Gender</p>
                  <p className="font-semibold text-slate-800 print:text-sm">
                    {reportData.profile.gender}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 print:space-y-2">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200 print:p-2 print:bg-white print:border print:border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-700 print:text-xs">Allergies</p>
                  <p className="font-semibold text-yellow-800 print:text-sm">
                    {reportData.profile.allergies}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 print:p-2 print:bg-white print:border print:border-blue-200">
                <Pill className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700 print:text-xs">Medications</p>
                  <p className="font-semibold text-blue-800 print:text-sm">
                    {reportData.profile.medications}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200 print:mt-4 print:pt-4 print:gap-3">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 print:p-3 print:bg-white print:border print:border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 print:text-sm">Medical Conditions</h4>
              <p className="text-red-700 print:text-sm">{reportData.profile.conditions}</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 print:p-3 print:bg-white print:border print:border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2 print:text-sm">Current Symptoms</h4>
              <p className="text-orange-700 print:text-sm">{reportData.profile.symptoms}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 print:p-3 print:bg-white print:border print:border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2 print:text-sm">Emergency Contact</h4>
              <p className="text-purple-700 print:text-sm">{reportData.profile.emergencyContact}</p>
            </div>
          </div>
        </div>

        {/* Vital Signs Section */}
        {riskAssessment.vitalSigns && (
          <div className="medical-card mb-6 print:break-inside-avoid">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-slate-800 print:text-xl">Vital Signs</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none">
                <div className="flex items-center space-x-2 mb-2">
                  <Thermometer className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600 print:text-xs">Temperature</span>
                </div>
                <p className="text-xl font-bold text-slate-800 print:text-lg">
                  {riskAssessment.vitalSigns.temperature}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-slate-600 print:text-xs">Blood Pressure</span>
                </div>
                <p className="text-xl font-bold text-slate-800 print:text-lg">
                  {riskAssessment.vitalSigns.bloodPressure}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-slate-600 print:text-xs">Heart Rate</span>
                </div>
                <p className="text-xl font-bold text-slate-800 print:text-lg">
                  {riskAssessment.vitalSigns.heartRate}
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm print:shadow-none">
                <div className="flex items-center space-x-2 mb-2">
                  <Droplets className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-600 print:text-xs">SpO2</span>
                </div>
                <p className="text-xl font-bold text-slate-800 print:text-lg">
                  {riskAssessment.vitalSigns.oxygenSaturation}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="medical-card mb-6 print:break-inside-avoid">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-slate-800 print:text-xl">
              🧠 RiskAI Assessment
            </h2>
          </div>

          <div className={`flex items-center justify-between mb-6 p-4 rounded-lg border ${riskAssessment.level === 'CRITICAL'
            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
            : riskAssessment.level === 'HIGH'
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
              : riskAssessment.level === 'MODERATE'
                ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
                : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
            } print:bg-white print:border print:border-slate-200`}>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${riskAssessment.level === 'CRITICAL'
                ? 'bg-white text-red-600'
                : riskAssessment.level === 'HIGH'
                  ? 'bg-red-500'
                  : riskAssessment.level === 'MODERATE'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${riskAssessment.level === 'CRITICAL' ? 'text-white' : 'text-slate-800'} print:text-slate-800`}>
                  Risk Level
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${riskAssessment.level === 'CRITICAL'
                  ? 'bg-white text-red-600'
                  : riskAssessment.level === 'HIGH'
                    ? 'bg-red-100 text-red-800'
                    : riskAssessment.level === 'MODERATE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                  {riskAssessment.level === 'CRITICAL' ? '🚨 CRITICAL EMERGENCY' :
                    riskAssessment.level === 'HIGH' ? '🛑 HIGH RISK' :
                      riskAssessment.level === 'MODERATE' ? '⚠️ MODERATE RISK' : '✅ LOW RISK'}
                </span>
              </div>
            </div>
            <div className={`text-right ${riskAssessment.level === 'CRITICAL' ? 'text-white' : 'text-slate-600'} print:text-slate-600`}>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{riskAssessment.analysisDate}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 print:bg-white print:border print:border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-3 print:text-sm">AI Analysis Summary</h4>
            <p className="text-slate-700 leading-relaxed print:text-sm">
              {riskAssessment.summary}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4 print:text-sm">
              Emergency Treatment Guidelines
            </h4>
            <div className="space-y-3 print:space-y-2">
              {riskAssessment.guidelines.length > 0 ? (
                riskAssessment.guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 print:p-2 print:bg-white print:border print:border-slate-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full text-white text-sm font-bold flex-shrink-0 print:bg-emerald-600">
                      {index + 1}
                    </div>
                    <p className="text-emerald-800 print:text-sm print:text-slate-700">
                      {guideline}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 print:p-2 print:bg-white">
                  No specific treatment guidelines required based on current assessment.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="medical-card print:hidden">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Report Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <PDFDownloadLink
              document={<ReportPDF reportData={reportData} />}
              fileName={`medical-report-${reportData.profile.name || 'patient'}.pdf`}
              className="flex-1"
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${loading
                    ? 'bg-indigo-400 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                >
                  <Download className="w-5 h-5" />
                  <span>{loading ? 'Generating PDF...' : 'Download as PDF'}</span>
                </button>
              )}
            </PDFDownloadLink>

            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center space-x-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg transition-colors"
              disabled={isPrinting}
            >
              <FileText className="w-5 h-5" />
              <span>{isPrinting ? 'Preparing...' : 'Print Report'}</span>
            </button>

            <button
              onClick={handleShareLink}
              className="flex-1 flex items-center justify-center space-x-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg transition-colors"
            >
              {copied ? <Clipboard className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
              <span>{copied ? 'Copied!' : 'Share Link'}</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                <strong className="font-semibold">Confidentiality Notice:</strong> This report contains
                protected health information (PHI) under HIPAA regulations. Unauthorized disclosure is
                prohibited by law. Ensure proper authorization before sharing.
              </p>
            </div>
          </div>
        </div>

        <div className="hidden print:block mt-8 pt-4 border-t border-slate-300 text-xs text-slate-500">
          <div className="flex justify-between">
            <div>
              <p>Generated by PulseID Medical System</p>
            </div>
            <div className="text-right">
              <p>Page 1 of 1</p>
              <p>Printed on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;