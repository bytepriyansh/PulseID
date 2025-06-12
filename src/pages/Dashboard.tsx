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
  AlertCircle
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

const Dashboard = () => {
  const { profileData, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(healthQuotes[0]);

  // Check if profile is complete
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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
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

    // Validate phone number format if provided
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
    { name: 'conditions', label: 'Existing Conditions', icon: Heart, type: 'text', required: false },
    { name: 'medications', label: 'Current Medications', icon: Pill, type: 'text', required: false },
    { name: 'allergies', label: 'Allergies', icon: AlertTriangle, type: 'text', required: false },
    { name: 'symptoms', label: 'Current Symptoms', icon: Stethoscope, type: 'text', required: false },
    { name: 'emergencyContactName', label: 'Emergency Contact Name', icon: User, type: 'text', required: true },
    { name: 'emergencyContactNumber', label: 'Emergency Contact Number', icon: Phone, type: 'tel', required: true }
  ];

  const getConditionCount = () => {
    if (!formData.conditions) return 0;
    return formData.conditions.split(',').filter(condition => condition.trim()).length;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Success Notification */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>Profile saved successfully!</span>
          </div>
        )}

        {/* Header Section */}
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

        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="border-b border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Medical Profile</h2>
                <p className="text-gray-500 mt-1">
                  {isProfileComplete() ? (
                    <span className="text-emerald-600">Your profile is complete</span>
                  ) : (
                    <span className="text-amber-600">Complete your profile for better insights</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${isEditing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-6">
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
                      <div className="relative">
                        <select
                          name={field.name}
                          value={formData[field.name as keyof typeof formData] || ''}
                          onChange={handleChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-2.5 rounded-lg border ${errors[field.name]
                              ? 'border-red-300 bg-red-50'
                              : isEditing
                                ? 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                : 'border-gray-200 bg-gray-50'
                            } transition-colors outline-none ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData] || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2.5 rounded-lg border ${errors[field.name]
                            ? 'border-red-300 bg-red-50'
                            : isEditing
                              ? 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                              : 'border-gray-200 bg-gray-50'
                          } transition-colors outline-none ${!isEditing ? 'cursor-not-allowed' : ''
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
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(profileData);
                      setErrors({});
                      setIsEditing(false);
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Stats Cards */}
        {!isEditing && (
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Profile Status Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isProfileComplete() ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                  {isProfileComplete() ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Profile Status</h3>
              <p className="text-gray-500 text-sm">
                {isProfileComplete()
                  ? 'All required information is provided'
                  : 'Please complete all required fields'}
              </p>
            </div>

            {/* Blood Group Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-red-100 p-2 rounded-lg w-fit mb-4">
                <Droplets className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Blood Group</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formData.bloodGroup || 'Not specified'}
              </p>
              <p className="text-gray-500 text-sm">
                {formData.bloodGroup ? 'Important for emergencies' : 'Please specify your blood group'}
              </p>
            </div>

            {/* Conditions Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-2 rounded-lg w-fit mb-4">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Health Conditions</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {getConditionCount() || 'None'}
              </p>
              <p className="text-gray-500 text-sm">
                {getConditionCount()
                  ? `${getConditionCount()} condition${getConditionCount() > 1 ? 's' : ''} noted`
                  : 'No conditions specified'}
              </p>
            </div>
          </div>
        )}

        {/* Completion Notice */}
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