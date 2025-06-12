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
  ExternalLink
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
      const riskLevelMatch = text.match(/Primary Risk Level:\s*(Low|Moderate|High)/i);

      const summaryMatch = text.match(/Clinical Risk Analysis Report[^\n]*(.*?)(?=\n##)/is);

      const concernsMatch = text.match(/Risk Factors & Concerns:([\s\S]*?)(?=\n---|\n##)/i);

      const concerns = concernsMatch?.[1]
        .split('\n')
        .map(line => line.replace(/^\*\*[^:]+\*\*:\s*/, '').trim())
        .filter(line => line.length > 0);

      return {
        riskLevel: riskLevelMatch ? riskLevelMatch[1] : 'Unknown',
        summary: summaryMatch ? summaryMatch[1].trim() : text,
        concerns: concerns || [],
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
    setShowResults(false);

    try {
      const prompt = `You are a medical AI expert assistant. Given the following patient profile, perform a clinical risk analysis and return a summary in a structured, easy-to-understand format. Include:

1. Primary Risk Level (Low, Moderate, High)
2. Risk Factors & Concerns
3. Recommended Immediate Actions
4. Emergency Medical Guidelines

Format the output in professional medical report style. Use emojis for section headers to improve readability.

Patient Profile:
- Name: ${profileData.name}
- Age: ${profileData.age}
- Gender: ${profileData.gender}
- Blood Group: ${profileData.bloodGroup}
- Medical Conditions: ${profileData.conditions || 'None reported'}
- Medications: ${profileData.medications || 'None reported'}
- Allergies: ${profileData.allergies || 'None reported'}
- Symptoms: ${profileData.symptoms || 'None reported'}
- Emergency Contact: ${profileData.emergencyContactName} (${profileData.emergencyContactNumber})

Please analyze this data and generate a comprehensive clinical summary. The output should be suitable for patient-facing apps and medical staff.`;

      let fullResponse = '';

      await streamRiskAnalysis(prompt, (chunk) => {
        fullResponse += chunk;
        setStreamedText(fullResponse);
      });

      const parsedResult = parseGeminiResponse(fullResponse);
      setAnalysisResult(parsedResult);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        riskLevel: 'Error',
        summary: 'Analysis failed. Please check your connection and try again.',
        completedAt: new Date().toLocaleString()
      });
      setShowResults(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    if (!riskLevel) return null;

    switch (riskLevel.toLowerCase()) {
      case 'high':
        return <span className="risk-badge-high">🛑 HIGH RISK</span>;
      case 'moderate':
        return <span className="risk-badge-moderate">⚠️ MODERATE RISK</span>;
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
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-bold">Blood Type:</span>
                <span>{profileData.bloodGroup || 'Not provided'}</span>
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
          </div>

          {/* Emergency Contact */}
          {profileData.emergencyContactName && (
            <div className="pt-6 border-t border-slate-300">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-lg font-bold text-red-700 uppercase tracking-wide">Emergency Contact</span>
              </div>
              <p className="text-lg font-semibold text-slate-800">
                {profileData.emergencyContactName} — {profileData.emergencyContactNumber}
              </p>
            </div>
          )}
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
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Processing medical data for {profileData.name}...</p>
              </div>
            )}
          </div>
        )}

        {showResults && (
          <div className="space-y-6 animate-fade-in">
            <div className={`medical-card border-l-4 ${analysisResult.riskLevel?.toLowerCase() === 'high'
              ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100'
              : analysisResult.riskLevel?.toLowerCase() === 'moderate'
                ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100'
                : 'border-green-500 bg-gradient-to-r from-green-50 to-green-100'
              }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${analysisResult.riskLevel?.toLowerCase() === 'high'
                  ? 'bg-red-500'
                  : analysisResult.riskLevel?.toLowerCase() === 'moderate'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                  }`}>
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Risk Assessment for {profileData.name}</h3>
                  {getRiskBadge(analysisResult.riskLevel)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Analysis completed: {analysisResult.completedAt}</span>
                </div>
                <p className="text-slate-700 font-medium">
                  <strong>Primary Risk Level:</strong> {analysisResult.riskLevel || 'Unknown'}
                  <ReactMarkdown>
                    {analysisResult.summary || 'No summary available.'}
                  </ReactMarkdown>
                </p>
              </div>
            </div>

            <div className="medical-card">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">🧠 AI Analysis Report</h3>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                {streamedText ? (
                  <div className="whitespace-pre-wrap text-slate-800">
                    <ReactMarkdown>
                      {streamedText}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-800 leading-relaxed mb-4">
                      <strong>Analysis:</strong>
                      <ReactMarkdown>
                        {analysisResult.summary || 'No analysis available.'}
                      </ReactMarkdown>
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-slate-800">Primary Concerns</span>
                        </div>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {analysisResult.concerns?.length ? (
                            analysisResult.concerns.map((concern, i) => (
                              <li key={i}>• {concern}</li>
                            ))
                          ) : (
                            <li>No specific concerns identified</li>
                          )}
                        </ul>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-5 h-5 text-orange-500" />
                          <span className="font-semibold text-slate-800">Immediate Actions</span>
                        </div>
                        <ul className="text-sm text-slate-700 space-y-1">
                          {analysisResult.actions?.length ? (
                            analysisResult.actions.map((action, i) => (
                              <li key={i}>• {action}</li>
                            ))
                          ) : (
                            <li>No immediate actions required</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {analysisResult.guidelines?.length && (
              <div className="medical-card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">✔️ Emergency Guidelines</h3>
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
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RiskAI;