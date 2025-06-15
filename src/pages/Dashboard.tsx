import React, { useState, useEffect } from 'react';
import { Heart, AlertTriangle, FileText, Activity, Link, Shield, Clock, Users, Zap, Phone, AlertCircle, Stethoscope } from 'lucide-react';
import { MedicationProvider } from '@/contexts/MedicationContext';
import { MedicationReminderDialog } from '@/components/MedicationReminderDialog';
import Navigation from '@/components/Navigation';

// Mock ProfileContext for demonstration
const useProfile = () => ({
  profileData: {
    name: 'Kaushal Singh',
    age: 28,
    gender: 'Male',
    bloodGroup: 'B+',
    emergencyContactName: 'Priya Singh',
    emergencyContactNumber: '+91 98765 43210',
    conditions: 'Diabetes Type 2',
    medications: 'Metformin 500mg',
    allergies: 'Penicillin',
    lastUpdated: '2025-06-10'
  }
});

const DashboardContent = () => {
  const { profileData } = useProfile();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getConditionCount = () => {
    if (!profileData.conditions || profileData.conditions === 'None') return 0;
    return profileData.conditions.split(',').filter(condition => condition.trim()).length;
  };

  const isProfileComplete = () => {
    const requiredFields = ['name', 'age', 'gender', 'bloodGroup', 'emergencyContactName', 'emergencyContactNumber'];
    return requiredFields.every(field => !!profileData[field]);
  };

  const dashboardCards = [
    {
      title: 'Profile Status',
      icon: Heart,
      value: isProfileComplete() ? 'Complete' : 'Incomplete',
      description: isProfileComplete() ? 'Your medical profile is up to date' : 'Update your medical profile',
      color: isProfileComplete() ? 'text-emerald-600' : 'text-amber-600',
      bgColor: isProfileComplete() ? 'from-emerald-50 to-emerald-100' : 'from-amber-50 to-amber-100',
      borderColor: isProfileComplete() ? 'border-emerald-200' : 'border-amber-200',
      link: '/profile'
    },
    {
      title: 'Medical Conditions',
      icon: AlertTriangle,
      value: getConditionCount().toString(),
      description: getConditionCount() === 1 ? '1 condition noted' : `${getConditionCount()} conditions noted`,
      color: 'text-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      link: '/profile'
    },
    {
      title: 'Emergency Info',
      icon: FileText,
      value: 'View',
      description: 'Access your emergency medical card',
      color: 'text-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      link: '/qrcode'
    },
    {
      title: 'Risk Analysis',
      icon: Activity,
      value: 'Check Now',
      description: 'Get personalized health insights',
      color: 'text-rose-600',
      bgColor: 'from-rose-50 to-rose-100',
      borderColor: 'border-rose-200',
      link: '/riskai'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {profileData.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Monitor your health information and access emergency medical details quickly.
          </p>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {dashboardCards.map((card, index) => (
            <div key={index} className="group cursor-pointer">
              <div className={`p-6 rounded-xl text-center bg-gradient-to-br ${card.bgColor} border ${card.borderColor} transition-all duration-200 hover:shadow-md hover:-translate-y-1`}>
                <div className={`w-12 h-12 bg-white/80 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200 ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-800">{card.title}</h3>
                <p className={`text-xl font-bold mt-1 ${card.color}`}>
                  {card.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {card.description}
                </p>
                <div className={`mt-3 inline-flex items-center text-sm font-medium ${card.color}`}>
                  <span>View Details</span>
                  <Link className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Profile Update</p>
                <p className="font-semibold text-gray-900">{profileData.lastUpdated || 'Never'}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">QR Code Status</p>
                <p className="font-semibold text-gray-900">Active & Ready</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>        {/* Healthcare Network & Partnerships */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 mb-8 border border-teal-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Stethoscope className="w-6 h-6 text-teal-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Healthcare Network</h2>
            </div>
          </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  Quick Health Actions
                </h3>
                   <div className="space-y-3">
                <MedicationReminderDialog />

                <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-teal-100 hover:bg-white/80 transition-colors cursor-pointer">
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">Emergency Contacts</p>
                    <p className="text-sm text-gray-600">Manage emergency contact information</p>
                    <p className="text-xs text-blue-600 mt-1">✓ 1 contact configured</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
              </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Emergency Services</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/60 rounded-lg border border-teal-100 hover:bg-red-50 transition-colors cursor-pointer"
                       onClick={() => window.open('tel:108')}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Ambulance (108)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <Phone className="w-4 h-4 text-red-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">24/7 Emergency Medical Services</p>
                    <p className="text-xs text-green-600 mt-1">✓ Tap to call</p>
                  </div>
                  
                  <div className="p-3 bg-white/60 rounded-lg border border-teal-100 hover:bg-blue-50 transition-colors cursor-pointer"
                       onClick={() => window.open('tel:100')}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Police (100)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <Shield className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Emergency Police Assistance</p>
                    <p className="text-xs text-green-600 mt-1">✓ Tap to call</p>
                  </div>
                  
                  <div className="p-3 bg-white/60 rounded-lg border border-teal-100 hover:bg-orange-50 transition-colors cursor-pointer"
                       onClick={() => window.open('tel:101')}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Fire (101)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Fire & Rescue Services</p>
                    <p className="text-xs text-green-600 mt-1">✓ Tap to call</p>
                  </div>
                </div>            </div>
          </div>
        </div>

        {/* Profile Incomplete Warning */}
          {!isProfileComplete() && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 mb-1">Update your medical profile</p>
                <p className="text-amber-700 text-sm mb-3">
                  Complete your medical profile to get personalized health insights and ensure emergency preparedness.
                </p>
                <button className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                  Complete Profile
                </button>
              </div>
            </div>
          )}        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">
            Your medical data is encrypted and secure. Access is time-bound and privacy-controlled.
          </p>
        </div>
        </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <MedicationProvider>
      <DashboardContent />
    </MedicationProvider>
  );
};

export default Dashboard;