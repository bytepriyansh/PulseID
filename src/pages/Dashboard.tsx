import React from 'react';
import { Heart, AlertTriangle, FileText, Activity, Link } from 'lucide-react';
import Layout from '../components/Layout';
import { useProfile } from '@/contexts/ProfileContext';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  const { profileData } = useProfile();

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
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {profileData.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Monitor your health information and access emergency medical details quickly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardCards.map((card, index) => (
            <RouterLink
              key={index}
              to={card.link}
              className="group"
            >
              <div className={`medical-card text-center bg-gradient-to-br ${card.bgColor} ${card.borderColor} transition-all duration-200 hover:shadow-md`}>
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
            </RouterLink>
          ))}
        </div>

        {!isProfileComplete() && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 mb-1">Update your medical profile</p>
              <p className="text-amber-700 text-sm mb-3">
                Complete your medical profile to get personalized health insights and ensure emergency preparedness.
              </p>
              <RouterLink
                to="/profile"
                className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Complete Profile
              </RouterLink>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;