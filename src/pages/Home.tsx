
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  QrCode, 
  Brain, 
  Users, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Github
} from 'lucide-react';
import Layout from '../components/Layout';

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: 'Medical Profile',
      description: 'Store comprehensive health information securely'
    },
    {
      icon: Brain,
      title: 'AI Risk Report',
      description: 'Get intelligent health risk analysis powered by AI'
    },
    {
      icon: QrCode,
      title: 'QR Code Generator',
      description: 'Instant access to medical info in emergencies'
    },
    {
      icon: Shield,
      title: 'Secure Cloud Sync',
      description: 'Your data is encrypted and always accessible'
    }
  ];

  const benefits = [
    'Instant access to critical medical information',
    'AI-powered risk assessment and recommendations',
    'Emergency QR code for first responders',
    'Secure, HIPAA-compliant data storage'
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-6xl font-bold text-slate-800 mb-6">
              PulseID: Your Emergency
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                Medical Passport
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Store, Analyze, and Share Critical Medical Info Instantly — Backed by AI
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 medical-button-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Why Choose PulseID?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              In emergencies, every second counts. PulseID ensures your critical medical information 
              is instantly accessible to healthcare providers when you need it most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="medical-card text-center group hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Instant Access</h3>
              <p className="text-slate-600">
                Access your complete medical profile in seconds, anywhere, anytime
              </p>
            </div>

            <div className="medical-card text-center group hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">AI-Based Risk Scoring</h3>
              <p className="text-slate-600">
                Get intelligent health risk analysis and personalized recommendations
              </p>
            </div>

            <div className="medical-card text-center group hover:shadow-lg transition-shadow duration-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Emergency QR</h3>
              <p className="text-slate-600">
                Scannable QR code for instant medical information sharing
              </p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="medical-card bg-gradient-to-r from-slate-50 to-sky-50">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
              Key Benefits
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need for comprehensive emergency medical preparedness
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="medical-card text-center group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">PulseID</span>
          </div>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Empowering individuals with AI-driven healthcare insights and emergency medical preparedness.
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
            <span>Built with ❤️ for healthcare</span>
            <div className="flex items-center space-x-1">
              <Github className="w-4 h-4" />
              <span>Open Source</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-700 text-sm text-slate-400">
            <p>&copy; 2025 PulseID. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Home;
