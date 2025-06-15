import {
  FileText,
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { ProfileData, RiskAssessment } from '@/contexts/ProfileContext';

import { calculateBMI, formatDate, formatDateOnly } from '@/utils/formatters';

const Report = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add print-specific styles when component mounts
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: white !important;
          font-size: 14px !important;
        }

        /* Hide UI elements */
        .print\\:hidden {
          display: none !important;
        }

        /* Container */
        .max-w-4xl {
          max-inline-size: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        /* Header */
        header {
          margin-block-end: 2rem !important;
          break-inside: avoid !important;
        }

        h1 {
          font-size: 24px !important;
          color: #111827 !important;
          margin-block-end: 0.25rem !important;
        }

        header p {
          font-size: 12px !important;
          color: #6B7280 !important;
        }

        /* Sections */
        section {
          break-inside: avoid !important;
          margin-block-end: 1.5rem !important;
          background: white !important;
        }

        section > div:first-child {
          padding: 1rem !important;
          background: #F8FAFC !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 0.375rem !important;
          margin-block-end: 1rem !important;
        }

        /* Section titles */
        h2 {
          font-size: 16px !important;
          color: #111827 !important;
          margin: 0 !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }

        /* Grid layout */
        .grid {
          display: grid !important;
          gap: 1rem !important;
        }

        /* Personal details grid */
        .grid-cols-2.lg\\:grid-cols-4 {
          grid-template-columns: repeat(4, 1fr) !important;
        }

        /* Metrics grid */
        .grid-cols-2.lg\\:grid-cols-3 {
          grid-template-columns: repeat(3, 1fr) !important;
        }

        /* Cards */
        .bg-slate-50,
        .bg-gradient-to-br,
        [class*='from-'] {
          background: white !important;
          border: 1px solid #E2E8F0 !important;
          padding: 1rem !important;
          border-radius: 0.375rem !important;
        }

        /* Card labels */
        label {
          font-size: 12px !important;
          color: #6B7280 !important;
          margin-block-end: 0.25rem !important;
        }

        /* Card values */
        p.text-xl,
        p.text-lg {
          font-size: 14px !important;
          color: #111827 !important;
          font-weight: 600 !important;
        }

        /* Contacts sections */
        .sm\\:grid-cols-2 {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 1.5rem !important;
        }

        /* Contact cards */
        .bg-red-50, .bg-blue-50 {
          background: white !important;
          padding: 1rem !important;
          border-radius: 0.375rem !important;
        }

        .bg-red-50 {
          border: 1px solid #FCA5A5 !important;
        }

        .bg-blue-50 {
          border: 1px solid #BFDBFE !important;
        }

        /* Risk assessment */
        .bg-red-50 .text-red-800,
        .bg-blue-50 .text-blue-800 {
          color: #111827 !important;
        }

        .text-red-600 {
          color: #DC2626 !important;
        }

        .text-blue-600 {
          color: #2563EB !important;
        }

        /* Footer */
        footer {
          margin-block-start: 2rem !important;
          text-align: center !important;
        }

        footer p {
          font-size: 12px !important;
          color: #6B7280 !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const encodedData = searchParams.get('data');

  useEffect(() => {
    if (!encodedData) {
      setError('No report data provided');
      return;
    }

    try {
      const compressed = JSON.parse(decodeURIComponent(encodedData));
      console.log('QR Data received:', compressed);
      console.log('Height and weight:', { height: compressed.h, weight: compressed.w });
      
      // Expand the compressed data back to full format
      const decodedData: ProfileData = {
        name: compressed.n || '',
        age: compressed.a || '',
        gender: compressed.g || '',
        bloodGroup: compressed.b || '',
        height: compressed.h,
        heightUnit: compressed.hu,
        weight: compressed.w,
        weightUnit: compressed.wu,
        conditions: compressed.c || '',
        medications: compressed.m || '',
        allergies: compressed.al || '',
        symptoms: compressed.s || '',
        // Expand emergency contacts
        emergencyContacts: (compressed.ec || []).map(c => ({
          name: c.n || '',
          number: c.p || '',
          relationship: c.r || ''
        })),
        // Expand doctor contacts
        doctorContacts: (compressed.dc || []).map(d => ({
          name: d.n || '',
          number: d.p || '',
          specialization: d.s || ''
        })),
        // Emergency doctor info
        emergencyDoctorName: compressed.ed?.n || '',
        emergencyDoctorNumber: compressed.ed?.p || '',
        // Add risk assessment if present
        riskAssessment: compressed.r ? {
          level: compressed.r.l as 'HIGH' | 'MODERATE' | 'LOW',
          summary: compressed.r.s || '',
          guidelines: compressed.r.g || [],
          timestamp: compressed.r.t || '',
          conditions: compressed.r.conditions || [],
          symptoms: compressed.r.symptoms || []
        } : undefined,
        medicalReports: [],
        timestamp: compressed.t || new Date().toISOString()
      };

      // Validate required fields
      const requiredFields = ['name', 'age'];
      const missingFields = requiredFields.filter(field => !decodedData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      setProfileData(decodedData);
      console.log('Decoded profile data:', decodedData); // For debugging
    } catch (err) {
      console.error('Error parsing report data:', err);
      setError(err instanceof Error ? err.message : 'Invalid report data');
    }
  }, [encodedData]);

  const getRiskLevelStyles = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-500'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-500'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-500'
        };
    }
  };

  const formatDoctorName = (name: string | undefined) => {
    if (!name) return 'Not specified';
    // If name already includes "Dr.", don't add it again
    return name.toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
  };

  const handlePrint = () => {
    if (!profileData) {
      toast.error('No profile data available');
      return;
    }
    window.print();
  };

  if (error) {
    return (
      <Layout hideNavigation>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
            <h2 className="text-xl font-semibold text-red-700">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-4 inline-flex items-center text-sm text-red-600 hover:text-red-800"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profileData) {
    return (
      <Layout hideNavigation>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const riskStyles = getRiskLevelStyles(profileData.riskAssessment?.level || 'LOW');

  return (
    <Layout hideNavigation>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Medical Emergency Report</h1>
          <p className="text-slate-500 mt-2">
            Generated on {formatDate(profileData?.timestamp || new Date())}
          </p>
        </header>

        {error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Error Loading Report</h2>
            <p className="text-slate-600">{error}</p>
          </div>
        ) : !profileData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Personal Information */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Personal Details
                </h2>
              </div>
              
              {/* Basic Info Cards */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Name</label>
                    <p className="text-xl font-bold text-slate-800">{profileData.name}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Age</label>
                    <p className="text-xl font-bold text-slate-800">{profileData.age}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Gender</label>
                    <p className="text-xl font-bold text-slate-800">{profileData.gender || 'Not specified'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <label className="text-sm font-medium text-slate-600 mb-1 block">Blood Group</label>
                    <p className="text-xl font-bold text-slate-800">{profileData.bloodGroup || 'Not specified'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <label className="text-sm font-medium text-slate-600 mb-1 block">BMI</label>
                    <p className="text-xl font-bold text-slate-800">
                      {(() => {
                        console.log('Profile Data for BMI:', {
                          height: profileData.height,
                          weight: profileData.weight,
                          heightUnit: profileData.heightUnit,
                          weightUnit: profileData.weightUnit
                        });
                        return calculateBMI(
                          profileData.height,
                          profileData.weight,
                          profileData.heightUnit || 'cm',
                          profileData.weightUnit || 'kg'
                        );
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Medical Information */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  Medical Information
                </h2>
              </div>
              <div className="p-6 grid gap-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-rose-50 rounded-lg p-4 border border-rose-100">
                    <label className="text-sm font-medium text-rose-600 block mb-2">Medical Conditions</label>
                    <p className="text-base font-bold text-rose-900 whitespace-pre-wrap">
                      {profileData.conditions || 'None reported'}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <label className="text-sm font-medium text-amber-600 block mb-2">Allergies</label>
                    <p className="text-base font-bold text-amber-900 whitespace-pre-wrap">
                      {profileData.allergies || 'None reported'}
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <label className="text-sm font-medium text-purple-600 block mb-2">Current Medications</label>
                    <p className="text-base font-bold text-purple-900 whitespace-pre-wrap">
                      {profileData.medications || 'None reported'}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <label className="text-sm font-medium text-emerald-600 block mb-2">Current Symptoms</label>
                    <p className="text-base font-bold text-emerald-900 whitespace-pre-wrap">
                      {profileData.symptoms || 'None reported'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency and Healthcare Contacts - Side by Side */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Emergency Contacts */}
              <section className="bg-red-50 rounded-xl border border-red-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-200">
                  <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Emergency Contacts
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {profileData.emergencyContacts?.map((contact, index) => (
                      <div key={index} className="bg-white rounded-lg border border-red-100 p-4">
                        <p className="font-bold text-red-800 text-lg">{contact.name}</p>
                        <p className="font-semibold text-red-600">{contact.number}</p>
                        <p className="text-sm font-medium text-red-500">{contact.relationship}</p>
                      </div>
                    ))}
                    {(!profileData.emergencyContacts || profileData.emergencyContacts.length === 0) && (
                      <p className="text-red-600 font-medium">No emergency contacts provided</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Healthcare Providers */}
              <section className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-blue-200">
                  <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-600" />
                    Healthcare Providers
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {profileData.doctorContacts?.map((doctor, index) => (
                      <div key={index} className="bg-white rounded-lg border border-blue-100 p-4">
                        <p className="font-bold text-blue-800 text-lg">{doctor.name}</p>
                        <p className="font-semibold text-blue-600">{doctor.number}</p>
                        <p className="text-sm font-medium text-blue-500">{doctor.specialization}</p>
                      </div>
                    ))}
                    {(!profileData.doctorContacts || profileData.doctorContacts.length === 0) && (
                      <p className="text-blue-600 font-medium">No healthcare providers listed</p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Risk Assessment - Moved to Bottom */}
            {profileData.riskAssessment && (
              <section className={`rounded-xl border overflow-hidden ${getRiskLevelStyles(profileData.riskAssessment.level).bg} ${getRiskLevelStyles(profileData.riskAssessment.level).border}`}>
                <div className="px-6 py-4 border-b border-opacity-20">
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${getRiskLevelStyles(profileData.riskAssessment.level).text}`}>
                    <Activity className={`w-5 h-5 ${getRiskLevelStyles(profileData.riskAssessment.level).icon}`} />
                    Risk Assessment & Critical Care Information
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Risk Level and Date */}
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-base font-bold ${getRiskLevelStyles(profileData.riskAssessment.level).bg} ${getRiskLevelStyles(profileData.riskAssessment.level).text}`}>
                      {profileData.riskAssessment.level} RISK PATIENT
                    </span>

                  </div>

                  {/* Medical Alert Box */}
                  <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-orange-200">
                    <h3 className="text-lg font-bold text-orange-800 mb-2">⚠️ Critical Medical Information</h3>
                    <p className="text-base font-semibold text-orange-900">
                      {profileData.riskAssessment.summary}
                    </p>
                  </div>

                  {/* Emergency Care Guidelines */}
                  <div className="space-y-4">
                    <h3 className={`text-lg font-bold ${getRiskLevelStyles(profileData.riskAssessment.level).text}`}>
                      Emergency Care Instructions
                    </h3>
                    
                    {/* Primary Concerns */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-red-200">
                      <h4 className="text-base font-bold text-red-800 mb-2">Primary Medical Concerns:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {profileData.riskAssessment.conditions.map((condition, index) => (
                          <li key={index} className="text-base font-medium text-red-900">
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Emergency Protocol */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-4">
                      <h4 className="text-base font-bold text-slate-800 mb-2">Emergency Protocol:</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-base font-medium text-slate-800">
                            Check for medical ID bracelet/necklace - Patient has multiple pre-existing conditions
                          </p>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-base font-medium text-slate-800">
                            Monitor vital signs closely - History of {profileData.conditions}
                          </p>
                        </li>
                        <li className="flex items-start gap-2">
                          <Pill className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-base font-medium text-slate-800">
                            Check for allergies before administering medication - Patient has allergies to: {profileData.allergies || 'None reported'}
                          </p>
                        </li>
                        {profileData.medications && (
                          <li className="flex items-start gap-2">
                            <Activity className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <p className="text-base font-medium text-slate-800">
                              Current Medications: {profileData.medications}
                            </p>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Emergency Response Guidelines */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="text-base font-bold text-blue-800 mb-2">Emergency Response Guidelines:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="font-bold text-blue-600">1</span>
                          </div>
                          <p className="text-base font-medium text-slate-800">
                            Contact emergency contact immediately (See contacts above)
                          </p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="font-bold text-blue-600">2</span>
                          </div>
                          <p className="text-base font-medium text-slate-800">
                            Notify primary physician {formatDoctorName(profileData.doctorContacts?.[0]?.name)} of the emergency
                          </p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="font-bold text-blue-600">3</span>
                          </div>
                          <p className="text-base font-medium text-slate-800">
                            Share this medical report with emergency responders
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
              {/* Print Button */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
                >
                  <FileText className="h-4 w-4" />
                  Print
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Medical Emergency Report',
                      text: `Medical Emergency Report for ${profileData.name}`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Report link copied to clipboard');
                  }
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share Report
              </button>
            </div>

            <footer className="text-center text-sm text-slate-500">
              <p className="font-medium">Report generated by PulseID Emergency Medical System</p>
              <p className="mt-1">Generated on {formatDate(profileData.timestamp || new Date())}</p>
            </footer>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Report;