import { MedicalReport } from '@/contexts/ProfileContext';

export interface ReportData {
    name: string;
    age: string;
    gender: string;
    bloodGroup: string;
    conditions: string;
    medications: string;
    allergies: string;
    symptoms: string;
    height?: string;
    weight?: string;
    heightUnit?: 'cm' | 'ft';
    weightUnit?: 'kg' | 'lbs';
    emergencyContacts: Array<{
        name: string;
        number: string;
        relationship: string;
    }>;
    emergencyDoctorName: string;
    emergencyDoctorNumber: string;
    medicalReports: MedicalReport[];
    timestamp?: string;
    type?: 'full' | 'emergency';
    riskAssessment?: {
        level: 'HIGH' | 'MODERATE' | 'LOW';
        summary: string;
        guidelines: string[];
        analysisDate: string;
    };
}

export const generateRiskAssessment = (profileData: ReportData) => {
    let riskLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    const guidelines: string[] = [];
    const conditions = profileData.conditions?.toLowerCase() || '';
    const medications = profileData.medications?.toLowerCase() || '';
    const allergies = profileData.allergies?.toLowerCase() || '';
    
    // Assess risk level based on conditions
    if (conditions.includes('diabetes') || 
        conditions.includes('heart') || 
        conditions.includes('asthma') ||
        conditions.includes('hypertension')) {
        riskLevel = 'HIGH';
        guidelines.push('Regular monitoring of vital signs recommended');
        guidelines.push('Keep emergency medications readily accessible');
    } else if (conditions.includes('allergy') || medications.length > 0) {
        riskLevel = 'MODERATE';
        guidelines.push('Maintain updated list of medications');
        guidelines.push('Regular check-ups recommended');
    }

    // Add allergy-specific guidelines
    if (allergies.length > 0) {
        guidelines.push('Carry allergy information at all times');
        guidelines.push('Keep emergency allergy medication accessible');
    }

    // Add medication-specific guidelines
    if (medications.length > 0) {
        guidelines.push('Maintain regular medication schedule');
        guidelines.push('Keep a medication diary for tracking');
    }

    return {
        level: riskLevel,
        summary: generateRiskSummary(riskLevel, conditions),
        guidelines,
        analysisDate: new Date().toISOString()
    };
};

const generateRiskSummary = (level: 'HIGH' | 'MODERATE' | 'LOW', conditions: string): string => {
    switch (level) {
        case 'HIGH':
            return `Patient requires immediate medical attention in case of emergency. Multiple high-risk conditions present: ${conditions}`;
        case 'MODERATE':
            return `Patient may require medical attention based on symptoms. Regular monitoring advised.`;
        case 'LOW':
            return `Patient generally stable. Regular check-ups recommended.`;
    }
};
