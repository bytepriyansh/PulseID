import React, { useEffect } from 'react';
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
  const data = searchParams.get('data');

  useEffect(() => {
    if (data) {
      // Redirect to PDF view with the same data
      navigate(`/report-pdf?data=${data}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [data, navigate]);

  return null; // Component will redirect, no need to render anything
};

export default Report;