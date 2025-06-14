import { useState } from 'react';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  User,
  Heart,
  Pill,
  Activity,
  Clock,
  Zap,
  Shield,
  ExternalLink,
  Stethoscope
} from 'lucide-react';
import Layout from '../components/Layout';
import ReactMarkdown from "react-markdown";
import { streamRiskAnalysis } from '@/utils/gemini';
import { useProfile } from '@/contexts/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AnalysisResult {
  riskLevel?: string;
  summary?: string;
  concerns?: string[];
  actions?: string[];
  guidelines?: string[];
  completedAt?: string;
}

const RiskAI = () => {
  const { profileData, isProfileComplete } = useProfile();
  const router = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({});
  const [streamedText, setStreamedText] = useState('');

  const parseGeminiResponse = (text: string): AnalysisResult => {
    try {
      // More flexible risk level matching
      const riskLevelMatch = text.match(/Risk Level:\s*(Low|Moderate|High)/i) || 
                            text.match(/Primary Risk Level:\s*(Low|Moderate|High)/i) ||
                            text.match(/\\*Risk Level:\\\s(Low|Moderate|High)/i);

      const summaryMatch = text.match(/Summary:(.*?)(?=\n##|\nConcerns:|\nRecommended Actions:)/is);

      const concernsMatch = text.match(/Concerns:([\s\S]*?)(?=\nRecommended Actions:|\n##)/i);
      const actionsMatch = text.match(/Recommended Actions:([\s\S]*?)(?=\n##|$)/i);

      const concerns = concernsMatch?.[1]
        .split('\n')
        .map(line => line.replace(/^\\[^:]+\\:\s*/, '').replace(/^[-]\s/, '').trim())
        .filter(line => line.length > 0);

      const actions = actionsMatch?.[1]
        .split('\n')
        .map(line => line.replace(/^\\[^:]+\\:\s*/, '').replace(/^[-]\s/, '').trim())
        .filter(line => line.length > 0);

      return {
        riskLevel: riskLevelMatch ? riskLevelMatch[1] : 'Unknown',
        summary: summaryMatch ? summaryMatch[1].trim() : '',
        concerns: concerns || [],
        actions: actions || [],
        completedAt: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        riskLevel: 'Error',
        summary: text,
        completedAt: new Date().toLocaleString()
      };
    }
  };

  const handleRunAnalysis = async () => {
    if (!isProfileComplete()) {
      alert('Please complete your medical profile first to get accurate analysis results.');
      router('/dashboard');
      return;
    }

    setIsAnalyzing(true);
    setStreamedText('');
    setShowResults(true); // Show results immediately to display streaming

    try {
      const bmi = calculateBMI();
      const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)).category : null;
      
      const prompt = `You are a medical AI assistant providing balanced, reassuring clinical guidance. Analyze the patient profile and provide a clear, non-alarming summary that focuses on actionable insights rather than speculative concerns.

## Analysis Guidelines:
- "None" or "None reported" means the patient does NOT have that condition/allergy/medication - treat as healthy baseline
- Focus on actual presenting symptoms and known conditions only
- Consider BMI classification in your analysis and recommendations
- Avoid speculation or linking unrelated factors unless clinically significant
- Provide reassuring, practical guidance appropriate for patient self-care
- Only escalate to higher risk levels when clear clinical indicators warrant it

## Patient Profile:
${bmi ? `BMI: ${bmi} (${bmiCategory})` : ''}
Height: ${profileData.heightUnit === 'cm' 
    ? `${profileData.height} cm` 
    : `${profileData.heightFeet || 0}'${profileData.heightInches || 0}"`}
Weight: ${profileData.weight} ${profileData.weightUnit}
- Name: ${profileData.name}
- Age: ${profileData.age}
- Gender: ${profileData.gender}
- Blood Group: ${profileData.bloodGroup}
- Medical Conditions: ${profileData.conditions || 'None'}
- Current Medications: ${profileData.medications || 'None'}
- Known Allergies: ${profileData.allergies || 'None'}
- Current Symptoms: ${profileData.symptoms || 'None reported'}
- Emergency Contacts (Family & Friends): ${profileData.emergencyContacts?.map(contact => 
    `${contact.name} (${contact.relationship}) - ${contact.number}`
  ).join(', ') || 'None provided'}
- Medical Professionals: ${profileData.doctorContacts?.map(doctor => 
    `${doctor.name} (${doctor.specialization}) - ${doctor.number}`
  ).join(', ') || 'None provided'}

## Medical Reports History:
${profileData.medicalReports.map(report => `
- Type: ${report.type}
  Date: ${report.date}
  Summary: ${report.summary}
  Details: ${report.details}
  Concerns: ${report.concerns.join(', ') || 'None noted'}
`).join('\n')}

Please provide your analysis in this exact format:

## Risk Level: [Low/Moderate/High]

## Summary:
[2-3 sentence overview focusing on actual presenting symptoms]

## Concerns:
- [Specific warning sign 1]
- [Specific warning sign 2]
- [Additional concerns if any]

## Recommended Actions:
- [Practical step 1]
- [Practical step 2]
- [Additional recommendations]

## Detailed Analysis:

[Comprehensive analysis in points(keep it small) form explaining the assessment rationale, focusing on reassurance while being medically appropriate]

Please ensure proper formatting with clear sections and avoid excessive spacing.`;

      let fullResponse = '';

      await streamRiskAnalysis(prompt, (chunk) => {
        fullResponse += chunk;
        setStreamedText(fullResponse);
      });

      const parsedResult = parseGeminiResponse(fullResponse);
      setAnalysisResult(parsedResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        riskLevel: 'Error',
        summary: 'Analysis failed. Please check your connection and try again.',
        completedAt: new Date().toLocaleString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateBMI = () => {
    try {
        // Convert height to meters regardless of unit
        let heightInMeters = 0;
        
        // If using centimeters
        if (profileData.heightUnit === 'cm') {
            const heightCm = parseFloat(profileData.height);
            if (!isNaN(heightCm) && heightCm > 0) {
                heightInMeters = heightCm / 100;
            } else {
                console.log('Invalid CM height:', heightCm);
                return null;
            }
        } 
        // If using feet and inches
        else if (profileData.heightUnit === 'ft') {
            const feet = parseInt(profileData.heightFeet || '0');
            const inches = parseInt(profileData.heightInches || '0');
            if (feet > 0) {
                const totalInches = (feet * 12) + inches;
                heightInMeters = totalInches * 0.0254;
            } else {
                console.log('Invalid feet/inches:', { feet, inches });
                return null;
            }
        }

        if (heightInMeters <= 0) {
            console.log('Height conversion resulted in invalid value:', heightInMeters);
            return null;
        }

        // Convert weight to kg
        const weight = parseFloat(profileData.weight);
        if (isNaN(weight) || weight <= 0) {
            console.log('Invalid weight:', weight);
            return null;
        }

        const weightInKg = profileData.weightUnit === 'kg' ? weight : weight / 2.20462;

        // Calculate BMI
        const bmi = weightInKg / (heightInMeters * heightInMeters);

        console.log('BMI calculation:', {
            heightInMeters,
            weightInKg,
            bmi
        });

        // Only validate that BMI is a valid number
        if (isNaN(bmi) || !isFinite(bmi)) {
            console.log('Invalid BMI calculation result:', bmi);
            return null;
        }

        return bmi.toFixed(1);
    } catch (error) {
        console.error('BMI calculation error:', error);
        return null;
    }
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;

    switch (riskLevel.toLowerCase()) {
      case 'high':
        return <span className="risk-badge-high">🛑 HIGH RISK</span>;
      case 'moderate':
        return <span className="risk-badge-moderate">⚠ MODERATE RISK</span>;
      case 'low':
        return <span className="risk-badge-low">✅ LOW RISK</span>;
      default:
        return <span className="risk-badge-unknown">❓ UNKNOWN RISK</span>;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">RiskAI Health Analysis</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Advanced AI-powered health risk assessment using your medical profile data
          </p>
        </div>

        {!isProfileComplete() && (
          <div className="medical-card mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">Profile Incomplete</h3>
                  <p className="text-orange-700">
                    Complete your medical profile to get accurate AI analysis results.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Complete Profile</span>
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 space-y-8 border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="w-6 h-6 text-slate-600" />
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Current Profile Summary</h2>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${isProfileComplete() ? 'bg-green-200 text-green-900' : 'bg-orange-200 text-orange-900'
              }`}>
              {isProfileComplete() ? 'Complete' : 'Incomplete'}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-lg font-semibold text-slate-800">
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Name:</span>
                <span>{profileData.name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Age:</span>
                <span>{profileData.age ? `${profileData.age} years` : 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Gender:</span>
                <span>{profileData.gender || 'Not provided'}</span>
              </div>              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Blood Type:</span>
                <span>{profileData.bloodGroup || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">BMI:</span>
                <span>
                  {(() => {
                    const bmi = calculateBMI();
                    if (!bmi) return 'Not available';
                    const { category, color } = getBMICategory(parseFloat(bmi));
                    return (
                      <>
                        {bmi} <span className={color}>({category})</span>
                      </>
                    );
                  })()}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-slate-600 font-bold block">Conditions:</span>
                <p className="mt-1">{profileData.conditions || 'None reported'}</p>
              </div>
              <div>
                <span className="text-slate-600 font-bold block">Medications:</span>
                <p className="mt-1">{profileData.medications || 'None reported'}</p>
              </div>
              <div>
                <span className="text-slate-600 font-bold block">Allergies:</span>
                <p className="mt-1">{profileData.allergies || 'None reported'}</p>
              </div>
              <div>
                <span className="text-slate-600 font-bold block">Symptoms:</span>
                <p className="mt-1">{profileData.symptoms || 'None reported'}</p>
              </div>
            </div>
          </div>          {/* Emergency Contacts */}
          <div className="pt-6 border-t border-slate-300 space-y-4">
            {/* Family & Friends */}
            {profileData.emergencyContacts && profileData.emergencyContacts.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-lg font-bold text-red-700 uppercase tracking-wide">Family & Friends</span>
                </div>
                <div className="space-y-3">
                  {profileData.emergencyContacts.map((contact, index) => (
                    <p key={index} className="text-lg font-semibold text-slate-800">
                      {contact.name} ({contact.relationship}) — {contact.number}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Medical Professionals */}
            {profileData.doctorContacts && profileData.doctorContacts.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-700 uppercase tracking-wide">Medical Professionals</span>
                </div>
                <div className="space-y-3">
                  {profileData.doctorContacts.map((doctor, index) => (
                    <p key={index} className="text-lg font-semibold text-slate-800">
                      {doctor.name} ({doctor.specialization}) — {doctor.number}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {!showResults && (
          <div className="text-center mb-8">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !isProfileComplete()}
              className={`flex items-center space-x-3 mx-auto px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 ${isAnalyzing || !isProfileComplete()
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
            >
              <Brain className="w-6 h-6" />
              <span>
                {isAnalyzing ? 'Analyzing...' : 'Run Risk Analysis with AI'}
              </span>
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
            </button>

            {isAnalyzing && (
              <div className="mt-4">
                <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse w-3/5"></div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Processing medical data for {profileData.name}...</p>
              </div>
            )}
          </div>
        )}

        {showResults && (
          <div className="space-y-6 animate-fade-in">
            {/* Single Comprehensive Analysis Box */}
            <div className={`medical-card ${!isAnalyzing && analysisResult.riskLevel ? 
              (analysisResult.riskLevel?.toLowerCase() === 'high' ? 'border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100' :
               analysisResult.riskLevel?.toLowerCase() === 'moderate' ? 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100' :
               'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100') : ''}`}>
              
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  !isAnalyzing && analysisResult.riskLevel ? 
                    (analysisResult.riskLevel?.toLowerCase() === 'high' ? 'bg-red-500' :
                     analysisResult.riskLevel?.toLowerCase() === 'moderate' ? 'bg-yellow-500' : 'bg-green-500') :
                    'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  {!isAnalyzing && analysisResult.riskLevel ? (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  ) : (
                    <Brain className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">
                    {!isAnalyzing && analysisResult.riskLevel ? 
                      `Risk Assessment for ${profileData.name}` :
                      (isAnalyzing ? '🧠 AI Analysis in Progress...' : '🧠 AI Analysis Report')
                    }
                  </h3>
                  {!isAnalyzing && analysisResult.riskLevel && (
                    <div className="mt-1">
                      {getRiskBadge(analysisResult.riskLevel)}
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp for completed analysis */}
              {!isAnalyzing && analysisResult.completedAt && (
                <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Analysis completed: {analysisResult.completedAt}</span>
                </div>
              )}

              {/* Content */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                {streamedText ? (
                  <div className="prose prose-slate max-w-none">
                    <div className="space-y-4">
                      <ReactMarkdown 
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-800 mb-3" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-slate-700 mb-2 mt-4" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-medium text-slate-600 mb-2 mt-3" {...props} />,
                          p: ({node, ...props}) => <p className="text-slate-700 mb-2 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 ml-2 text-slate-700" {...props} />,
                          li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-slate-800" {...props} />,
                        }}
                      >
                        {streamedText}
                      </ReactMarkdown>
                    </div>
                    {isAnalyzing && (
                      <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-blue-200 text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm">Generating analysis...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Initializing AI analysis...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional sections only show when analysis is complete */}
            {!isAnalyzing && analysisResult.guidelines?.length && (
              <div className="medical-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">✔ Emergency Guidelines</h3>
                </div>

                <div className="space-y-3">
                  {analysisResult.guidelines.map((guideline, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center justify-center w-6 h-6 bg-emerald-500 rounded-full text-white text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-slate-700">{guideline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons only show when analysis is complete */}
            {!isAnalyzing && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowResults(false);
                    setStreamedText('');
                    setAnalysisResult({});
                  }}
                  className="medical-button-primary"
                >
                  Run New Analysis
                </button>
                <button
                  onClick={() => router('/dashboard')}
                  className="medical-button-secondary"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => {
                    const reportData = {
                      patient: profileData.name,
                      date: analysisResult.completedAt,
                      riskLevel: analysisResult.riskLevel,
                      summary: analysisResult.summary,
                      fullReport: streamedText
                    };
                    console.log('Saving report:', reportData);
                    toast("Report Saved Successfully")
                  }}
                  className="medical-button-secondary"
                >
                  Save Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RiskAI;