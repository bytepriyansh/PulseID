import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Droplets,
  Heart,
  Pill,
  AlertTriangle,
  Stethoscope,
  Phone,
  Save,
  Edit3,
  CheckCircle,
  Quote,
  AlertCircle,
  History,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import Layout from '../components/Layout';
import { useProfile } from '@/contexts/ProfileContext';

const healthQuotes = [
  "Your health is an investment, not an expense.",
  "Prevention is better than cure.",
  "Small steps today lead to a healthier tomorrow.",
  "Your medical profile is your health passport.",
  "Complete information saves lives in emergencies."
];

const conditionOptions = [
  'Diabetes',
  'Hypertension',
  'Asthma',
  'Epilepsy',
  'Heart Disease',
  'Allergies',
  'HIV/AIDS',
  'Thyroid Disorder',
  'Depression',
  'Arthritis',
  'COPD',
  'None'
];

const Dashboard = () => {
  const { profileData, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(healthQuotes[0]);
  const [showConditionsDropdown, setShowConditionsDropdown] = useState(false);
  const [showReports, setShowReports] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pastReports, setPastReports] = useState<any[]>([]);

  useEffect(() => {
    const loadReports = () => {
      const sampleReports = [
        {
          id: 1,
          date: '2025-05-15',
          riskLevel: 'MODERATE',
          summary: 'Showed signs of seasonal allergies',
          conditions: ['Allergies', 'Asthma']
        },
        {
          id: 2,
          date: '2025-02-28',
          riskLevel: 'LOW',
          summary: 'Routine checkup - all clear',
          conditions: []
        },
        {
          id: 3,
          date: '2024-11-10',
          riskLevel: 'HIGH',
          summary: 'Diabetes management check',
          conditions: ['Diabetes']
        }
      ];
      setPastReports(sampleReports);
    };

    loadReports();
  }, []);

  const isProfileComplete = () => {
    const requiredFields = ['name', 'age', 'gender', 'bloodGroup', 'emergencyContactName', 'emergencyContactNumber'];
    return requiredFields.every(field => !!formData[field]);
  };

  useEffect(() => {
    setFormData(profileData);
    const quoteInterval = setInterval(() => {
      setCurrentQuote(healthQuotes[Math.floor(Math.random() * healthQuotes.length)]);
    }, 8000);
    return () => clearInterval(quoteInterval);
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleConditionSelect = (condition: string) => {
    const currentConditions = formData.conditions ? formData.conditions.split(',') : [];

    if (condition === 'None') {
      setFormData({
        ...formData,
        conditions: 'None'
      });
      return;
    }

    if (currentConditions.includes('None')) {
      currentConditions.splice(currentConditions.indexOf('None'), 1);
    }

    if (currentConditions.includes(condition)) {
      const updatedConditions = currentConditions.filter(c => c !== condition);
      setFormData({
        ...formData,
        conditions: updatedConditions.join(',')
      });
    } else {
      setFormData({
        ...formData,
        conditions: [...currentConditions, condition].join(',')
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['name', 'age', 'gender', 'bloodGroup', 'emergencyContactName', 'emergencyContactNumber'];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.emergencyContactNumber && !/^\d{10,15}$/.test(formData.emergencyContactNumber)) {
      newErrors.emergencyContactNumber = 'Enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    updateProfile(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const formFields = [
    { name: 'name', label: 'Full Name', icon: User, type: 'text', required: true },
    { name: 'age', label: 'Age', icon: Calendar, type: 'number', required: true },
    { name: 'gender', label: 'Gender', icon: User, type: 'select', options: ['Male', 'Female', 'Other'], required: true },
    { name: 'bloodGroup', label: 'Blood Group', icon: Droplets, type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    { name: 'medications', label: 'Current Medications', icon: Pill, type: 'text', required: false },
    { name: 'allergies', label: 'Allergies', icon: AlertTriangle, type: 'text', required: false },
    { name: 'symptoms', label: 'Current Symptoms', icon: Stethoscope, type: 'text', required: false },
    { name: 'emergencyContactName', label: 'Emergency Contact Name', icon: User, type: 'text', required: true },
    { name: 'emergencyContactNumber', label: 'Emergency Contact Number', icon: Phone, type: 'tel', required: true }
  ];

  const getConditionCount = () => {
    if (!formData.conditions || formData.conditions === 'None') return 0;
    return formData.conditions.split(',').filter(condition => condition.trim()).length;
  };

  const generateReport = () => {
    const jsonString = JSON.stringify(formData);

    const encodedData = encodeURIComponent(jsonString);

    window.open(`/report?data=${encodedData}`, '_blank');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {formData.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Keep your medical profile updated for better healthcare insights and emergency preparedness
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Quote className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-700 italic">{currentQuote}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Medical Profile</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowReports(!showReports)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              <span>{showReports ? 'Hide Reports' : 'View Reports'}</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isEditing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {showReports && (
          <div className="medical-card mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              Past Medical Reports
            </h3>
            <div className="space-y-3">
              {pastReports.length > 0 ? (
                pastReports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                        <p className="text-sm text-gray-600">{report.summary}</p>
                        {report.conditions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {report.conditions.map((condition: string) => (
                              <span key={condition} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {condition}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                          report.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                        }`}>
                        {report.riskLevel}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No past reports available</p>
              )}
            </div>
          </div>
        )}

        <div className="medical-card">
          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {formFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <field.icon className="w-4 h-4 text-gray-500" />
                    <span>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </label>

                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name as keyof typeof formData] || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`medical-input ${errors[field.name] ? 'border-red-300 bg-red-50' : ''} ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData] || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`medical-input ${errors[field.name] ? 'border-red-300 bg-red-50' : ''} ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                  )}
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              {/* Custom Conditions Selector */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span>Existing Conditions</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowConditionsDropdown(!showConditionsDropdown)}
                    disabled={!isEditing}
                    className={`medical-input flex justify-between items-center ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                  >
                    <span>
                      {formData.conditions
                        ? formData.conditions === 'None'
                          ? 'None'
                          : formData.conditions.split(',').join(', ')
                        : 'Select conditions'}
                    </span>
                    {showConditionsDropdown ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showConditionsDropdown && isEditing && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 space-y-1">
                        {conditionOptions.map((condition) => (
                          <div
                            key={condition}
                            className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${formData.conditions?.includes(condition)
                                ? 'bg-blue-50 text-blue-700'
                                : 'hover:bg-gray-50'
                              }`}
                            onClick={() => handleConditionSelect(condition)}
                          >
                            <input
                              type="checkbox"
                              checked={formData.conditions?.includes(condition)}
                              readOnly
                              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{condition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profileData);
                    setErrors({});
                    setIsEditing(false);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
               
              </div>
            )}
          </form>
        </div>

        {!isEditing && (
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            <div className="medical-card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Profile Status</h3>
              <p className={`text-2xl font-bold ${isProfileComplete() ? 'text-blue-600' : 'text-amber-600'}`}>
                {isProfileComplete() ? 'Complete' : 'Incomplete'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {isProfileComplete() ? 'All required fields completed' : `${6 - Object.keys(formData).filter(k => !!formData[k as keyof typeof formData]).length} fields missing`}
              </p>
            </div>

            <div className="medical-card text-center bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Blood Type</h3>
              <p className="text-2xl font-bold text-emerald-600">
                {formData.bloodGroup || 'Not set'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {formData.bloodGroup ? 'Important for emergencies' : 'Please update your profile'}
              </p>
            </div>

            <div className="medical-card text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">Conditions</h3>
              <p className="text-2xl font-bold text-purple-600">
                {getConditionCount()}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getConditionCount() ? 'Conditions noted' : 'No conditions reported'}
              </p>
            </div>
          </div>
        )}

        {!isProfileComplete() && !isEditing && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 mb-1">Complete your profile</p>
              <p className="text-amber-700 text-sm">
                Please fill all required fields (marked with *) to get accurate health insights and emergency preparedness.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;