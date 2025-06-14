import React from 'react';
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
  ChevronLeft
} from 'lucide-react';
import Layout from '../components/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';

interface MedicalReport {
  id: string;
  type: string;
  date: string;
  summary: string;
  details: string;
  concerns: string[];
}

interface ProfileData {
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  conditions: string;
  medications: string;
  allergies: string;
  symptoms: string;
  emergencyContacts: Array<{
    name: string;
    number: string;
    relationship: string;
  }>;
  emergencyDoctorName: string;
  emergencyDoctorNumber: string;
  medicalReports: MedicalReport[];
  timestamp?: string;
}

// Risk assessment helper functions
interface RiskAssessment {
  level: 'HIGH' | 'MODERATE' | 'LOW';
  summary: string;
  guidelines: string[];
  completedAt: string;
  analysisDate: string;
}

const generateRiskAssessment = (profileData: ProfileData): RiskAssessment => {
  const summary = 'Based on the provided information, a personalized risk assessment has been generated.';
  const guidelines = [
    'Regular health check-ups recommended',
    'Follow prescribed medication schedule',
    'Maintain emergency contact information',
    'Keep medical reports up to date'
  ];

  if (profileData.conditions) {
    guidelines.push('Monitor existing health conditions closely');
  }

  if (profileData.medications) {
    guidelines.push('Take medications as prescribed');
  }

  if (profileData.allergies) {
    guidelines.push('Be aware of allergic triggers and carry necessary medication');
  }

  if (profileData.symptoms) {
    guidelines.push('Track symptoms and report changes to healthcare provider');
  }

  if (profileData.medicalReports && profileData.medicalReports.length > 0) {
    guidelines.push('Follow up on findings from recent medical reports');
  }

  // Determine risk level based on conditions and symptoms
  let level: RiskAssessment['level'] = 'LOW';

  if (profileData.conditions || profileData.symptoms) {
    level = 'MODERATE';
  }

  if ((profileData.conditions && profileData.symptoms) ||
    (profileData.medicalReports && profileData.medicalReports.some(report =>
      report.concerns && report.concerns.length > 0))) {
    level = 'HIGH';
  }

  return {
    level,
    summary,
    guidelines,
    completedAt: formatDate(new Date()),
    analysisDate: new Date().toLocaleString()
  };
};

const formatDate = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const Report = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const encodedData = searchParams.get('data');    // Parse the profile data from URL
  const profileData: ProfileData = encodedData
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
      emergencyContacts: [],
      emergencyDoctorName: '',
      emergencyDoctorNumber: '',
      medicalReports: []
    };

  const reportData = {
    generatedDate: new Date().toLocaleDateString(),
    generatedTime: new Date().toLocaleTimeString(),
    profile: {
      name: profileData.name,
      age: parseInt(profileData.age),
      gender: profileData.gender,
      bloodGroup: profileData.bloodGroup,
      conditions: profileData.conditions || 'None',
      medications: profileData.medications || 'None',
      allergies: profileData.allergies || 'None',
      symptoms: profileData.symptoms || 'None',
      emergencyContact: profileData.emergencyContacts && profileData.emergencyContacts.length > 0 ?
        profileData.emergencyContacts.map(contact =>
          `${contact.name} (${contact.relationship}) - ${contact.number}`
        ).join('\n') : 'Not provided',
      emergencyDoctor: profileData.emergencyDoctorName ?
        `Dr. ${profileData.emergencyDoctorName} (${profileData.emergencyDoctorNumber})` : 'Not provided',
      medicalReports: profileData.medicalReports || []
    },
    riskAssessment: generateRiskAssessment(profileData)
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
        alert('Report link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Medical Emergency Report</h1>
          </div>
          <p className="text-lg text-slate-600">
            Comprehensive medical profile and risk assessment summary
          </p>
        </div>

        <div className="medical-card mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-800">Report Generated</p>
                <p className="text-sm text-slate-600">
                  {reportData.generatedDate} at {reportData.generatedTime}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Patient ID</p>
              <p className="font-mono text-sm text-slate-800">
                {profileData.name ? profileData.name.substring(0, 3).toUpperCase() + '-' +
                  Math.floor(Math.random() * 9000 + 1000) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <User className="w-6 h-6 text-slate-500" />
            <h2 className="text-2xl font-bold text-slate-800">Profile Overview</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <User className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold text-slate-800">{reportData.profile.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Age</p>
                  <p className="font-semibold text-slate-800">{reportData.profile.age}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Droplets className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-slate-600">Blood Group</p>
                  <p className="font-semibold text-slate-800">{reportData.profile.bloodGroup}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Heart className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Gender</p>
                  <p className="font-semibold text-slate-800">{reportData.profile.gender}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-700">Allergies</p>
                  <p className="font-semibold text-yellow-800">{reportData.profile.allergies}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Pill className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-700">Medications</p>
                  <p className="font-semibold text-blue-800">{reportData.profile.medications}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Medical Conditions</h4>
              <p className="text-red-700">{reportData.profile.conditions}</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Current Symptoms</h4>
              <p className="text-orange-700">{reportData.profile.symptoms}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Emergency Contact</h4>
              <p className="text-purple-700">{reportData.profile.emergencyContact}</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Emergency Doctor</h4>
              <p className="text-blue-700">
                {profileData.emergencyDoctorName ?
                  `${profileData.emergencyDoctorName} — ${profileData.emergencyDoctorNumber || 'No number'}`
                  : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <div className="medical-card mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-slate-800">🧠 RiskAI Assessment</h2>
          </div>

          <div className={`flex items-center justify-between mb-6 p-4 rounded-lg border ${reportData.riskAssessment.level === 'HIGH'
            ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
            : reportData.riskAssessment.level === 'MODERATE'
              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
              : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
            }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${reportData.riskAssessment.level === 'HIGH'
                ? 'bg-red-500'
                : reportData.riskAssessment.level === 'MODERATE'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
                }`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Risk Level</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${reportData.riskAssessment.level === 'HIGH'
                  ? 'bg-red-100 text-red-800'
                  : reportData.riskAssessment.level === 'MODERATE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  }`}>
                  {reportData.riskAssessment.level === 'HIGH' ? '🛑 HIGH RISK' :
                    reportData.riskAssessment.level === 'MODERATE' ? '⚠ MODERATE RISK' : '✅ LOW RISK'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{reportData.riskAssessment.analysisDate}</span>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-slate-800 mb-3">AI Analysis Summary</h4>
            <p className="text-slate-700 leading-relaxed">{reportData.riskAssessment.summary}</p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4">Emergency Treatment Guidelines</h4>
            <div className="space-y-3">
              {reportData.riskAssessment.guidelines.map((guideline, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-emerald-800">{guideline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="medical-card">
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
              onClick={handleShareLink}
              className="flex-1 flex items-center justify-center space-x-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Link</span>
            </button>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <strong>Note:</strong> This report contains sensitive medical information.
              Please ensure it's shared only with authorized healthcare providers or emergency personnel.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Report;