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
  detailedAnalysis?: string;
}

const RiskAI = () => {
  const { profileData, isProfileComplete } = useProfile();
  const router = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({});
  const [streamedText, setStreamedText] = useState('');

  const parseGeminiResponse = (text: string): AnalysisResult => {
    try {
      const riskLevelMatch = text.match(/Risk Level:\s*(Low|Moderate|High)/i);

      const summaryMatch = text.match(/Summary:([\s\S]*?)(?=\n###|\n##|\n---|\n\*\*)/i);

      const concernsMatch = text.match(/Concerns:([\s\S]*?)(?=\n###|\n##|\n---|\n\*\*)/i);
      const concerns = concernsMatch?.[1]
        ?.split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0) || [];

      const actionsMatch = text.match(/Recommended Actions:([\s\S]*?)(?=\n###|\n##|\n---|\n\*\*)/i);
      const actions = actionsMatch?.[1]
        ?.split('\n')
        .map(line => line.replace(/^[-•*]\s*/, '').trim())
        .filter(line => line.length > 0) || [];

      return {
        riskLevel: riskLevelMatch ? riskLevelMatch[1] : 'Unknown',
        summary: summaryMatch ? summaryMatch[1].trim() : text,
        concerns,
        actions,
        detailedAnalysis: text,
        completedAt: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        riskLevel: 'Error',
        summary: text,
        completedAt: new Date().toLocaleString(),
        detailedAnalysis: text
      };
    }
  };

  const handleRunAnalysis = async () => {
    if (!isProfileComplete()) {
      toast.error('Please complete your medical profile first');
      router('/dashboard');
      return;
    }

    setIsAnalyzing(true);
    setStreamedText('');
    setAnalysisResult({});

    try {
      const prompt = `Act as a medical expert AI. Analyze this patient profile and provide a comprehensive risk assessment:

Patient Data:
- Name: ${profileData.name}
- Age: ${profileData.age}
- Gender: ${profileData.gender}
- Blood Group: ${profileData.bloodGroup}
- Conditions: ${profileData.conditions || 'None'}
- Medications: ${profileData.medications || 'None'}
- Allergies: ${profileData.allergies || 'None'}
- Symptoms: ${profileData.symptoms || 'None'}

Provide output in this structured format:

### Risk Level: [Low/Moderate/High]
### Summary: [2-3 sentence overview]
### Concerns: [bullet points]
### Recommended Actions: [bullet points]
### Detailed Analysis: [in-depth markdown formatted analysis]`;

      let fullResponse = '';
      await streamRiskAnalysis(prompt, (chunk) => {
        fullResponse += chunk;
        setStreamedText(fullResponse);
      });

      setAnalysisResult(parseGeminiResponse(fullResponse));
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        riskLevel: 'Error',
        summary: 'Analysis failed. Please try again.',
        completedAt: new Date().toLocaleString()
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskBadge = (riskLevel?: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide";

    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>🛑 High Risk</span>;
      case 'moderate':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>⚠️ Moderate Risk</span>;
      case 'low':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>✅ Low Risk</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>❓ Unknown Risk</span>;
    }
  };

  const getRiskCardClasses = (riskLevel?: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'border-red-500 bg-gradient-to-r from-red-50 to-red-100';
      case 'moderate':
        return 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 'low':
        return 'border-green-500 bg-gradient-to-r from-green-50 to-green-100';
      default:
        return 'border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100';
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
            <h1 className="text-3xl font-bold text-slate-800">Health Risk Assessment</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered analysis of your medical profile to identify potential health risks
          </p>
        </div>

        {!isProfileComplete() && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 mb-8 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">Profile Incomplete</h3>
                  <p className="text-orange-700">
                    Complete your medical profile for accurate analysis
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

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
              <User className="w-6 h-6 text-slate-600 mr-2" />
              Patient Profile Summary
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isProfileComplete() ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
              {isProfileComplete() ? 'Complete' : 'Incomplete'}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <ProfileDetail label="Name" value={profileData.name} />
              <ProfileDetail label="Age" value={profileData.age} />
              <ProfileDetail label="Gender" value={profileData.gender} />
              <ProfileDetail label="Blood Type" value={profileData.bloodGroup} />
            </div>
            <div className="space-y-4">
              <ProfileDetail label="Conditions" value={profileData.conditions || 'None'} />
              <ProfileDetail label="Medications" value={profileData.medications || 'None'} />
              <ProfileDetail label="Allergies" value={profileData.allergies || 'None'} />
              <ProfileDetail label="Symptoms" value={profileData.symptoms || 'None'} />
            </div>
          </div>

          {profileData.emergencyContactName && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Emergency Contact
              </h3>
              <p className="text-slate-700 mt-1">
                {profileData.emergencyContactName} - {profileData.emergencyContactNumber}
              </p>
            </div>
          )}
        </div>

        {!analysisResult.riskLevel && (
          <div className="text-center mb-8">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !isProfileComplete()}
              className={`flex items-center justify-center space-x-3 mx-auto px-8 py-4 rounded-xl text-lg font-medium transition-all ${isAnalyzing || !isProfileComplete()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                }`}
            >
              <Brain className="w-6 h-6" />
              <span>{isAnalyzing ? 'Analyzing...' : 'Run AI Risk Assessment'}</span>
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              )}
            </button>
          </div>
        )}

        {analysisResult.riskLevel && (
          <div className="space-y-6 animate-fade-in">
            <div className={`rounded-xl border-l-4 p-6 ${getRiskCardClasses(analysisResult.riskLevel)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 w-12 h-12 rounded-full flex items-center justify-center ${analysisResult.riskLevel?.toLowerCase() === 'high' ? 'bg-red-500' :
                    analysisResult.riskLevel?.toLowerCase() === 'moderate' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Health Risk Assessment
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      {getRiskBadge(analysisResult.riskLevel)}
                      <span className="text-slate-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {analysisResult.completedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Summary</h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {analysisResult.summary || 'No summary available.'}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Detailed Analysis</h3>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {analysisResult?.detailedAnalysis?.trim() ||
                      streamedText?.trim() ||
                      '### ⚠️ No detailed analysis available.'}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Activity className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-800">Key Concerns</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.concerns?.length ? (
                      analysisResult.concerns.map((concern, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1">•</span>
                          <span>
                            <ReactMarkdown>
                              {concern}
                            </ReactMarkdown>
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">No specific concerns identified</li>
                    )}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-slate-800">Recommended Actions</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysisResult.actions?.length ? (
                      analysisResult.actions.map((action, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          <span>
                            <ReactMarkdown>
                              {action}
                            </ReactMarkdown>
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-500">No immediate actions required</li>
                    )}
                  </ul>
                </div>
              </div>

              {analysisResult.guidelines?.length ? (
                <div className="mt-4 bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-slate-800">Emergency Guidelines</h3>
                  </div>
                  <ol className="space-y-3">
                    {analysisResult.guidelines.map((guideline, i) => (
                      <li key={i} className="flex items-start">
                        <span className="bg-emerald-100 text-emerald-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span>
                          <ReactMarkdown>
                            {guideline}
                            </ReactMarkdown>                       
                          </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleRunAnalysis}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Re-run Analysis
              </button>
              <button
                onClick={() => router('/dashboard')}
                className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors flex items-center"
              >
                <EditIcon className="w-5 h-5 mr-2" />
                Update Profile
              </button>
              <button
                onClick={() => {
                  toast.success("Report saved successfully");
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <SaveIcon className="w-5 h-5 mr-2" />
                Save Report
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const ProfileDetail = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <h4 className="text-sm font-medium text-slate-600">{label}</h4>
    <p className="text-slate-800 font-medium">{value || 'Not provided'}</p>
  </div>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
  </svg>
);

export default RiskAI;