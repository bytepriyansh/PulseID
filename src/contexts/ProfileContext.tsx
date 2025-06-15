import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MedicalReport {
    id: string;
    type: string;
    date: string;
    summary: string;
    details: string;
    concerns: string[];
    fileUrl?: string;
    fileName?: string;
    fileType?: string; // pdf, docx, image
    extractedText?: string;
}

export interface EmergencyContact {
    name: string;
    number: string;
    relationship: string;
}

export interface DoctorContact {
    name: string;
    number: string;
    specialization: string;
}

export interface RiskAssessment {
    level: 'HIGH' | 'MODERATE' | 'LOW';
    summary: string;
    guidelines: string[];
    timestamp: string;
    conditions: string[];
    symptoms: string[];
}

export interface ProfileData {
    id?: string; // Unique identifier for the profile
    name: string;
    age: string;
    gender: string;
    height?: string;
    heightUnit?: 'cm' | 'ft';
    heightFeet?: string;
    heightInches?: string;
    weight?: string;
    weightUnit?: 'kg' | 'lbs';
    bloodGroup: string;
    conditions: string;
    medications: string;
    allergies: string;
    symptoms: string;
    emergencyContacts: EmergencyContact[];
    doctorContacts: DoctorContact[];
    emergencyDoctorName: string;
    emergencyDoctorNumber: string;
    medicalReports: MedicalReport[];
    riskAssessment?: RiskAssessment;
    timestamp?: string; // Add timestamp for report generation
    // Additional fields for medical report
    medicalConditions?: string[];
    emergencyGuidelines?: string[];
    doctors?: DoctorContact[];
}

interface ProfileContextType {
    profileData: ProfileData;
    updateProfile: (data: ProfileData) => void;
    isProfileComplete: () => boolean;
    resetProfile: () => void;
    lastUpdated: string | null;
    isLoading: boolean;
}

// Helper function to check if a value is a string array
const isStringArray = (value: any): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Helper function to check if a value is a MedicalReport array
const isMedicalReportArray = (value: any): value is MedicalReport[] => {
    return Array.isArray(value) && value.every(item =>
        typeof item === 'object' &&
        'id' in item &&
        'type' in item &&
        'date' in item
    );
};

// Helper function to check if a value is an EmergencyContact array
const isEmergencyContactArray = (value: any): value is EmergencyContact[] => {
    return Array.isArray(value) && value.every(item =>
        typeof item === 'object' &&
        'name' in item &&
        'number' in item &&
        'relationship' in item
    );
};

// Helper function to check if a value is a DoctorContact array
const isDoctorContactArray = (value: any): value is DoctorContact[] => {
    return Array.isArray(value) && value.every(item =>
        typeof item === 'object' &&
        'name' in item &&
        'number' in item &&
        'specialization' in item
    );
};

// Helper function to check if a value is a RiskAssessment
const isRiskAssessment = (value: any): value is RiskAssessment => {
    return typeof value === 'object' &&
        value !== null &&
        'level' in value &&
        'summary' in value &&
        'guidelines' in value &&
        'timestamp' in value;
};

// Helper function to check if a field is empty
const isFieldEmpty = (value: string | MedicalReport[] | EmergencyContact[] | DoctorContact[] | RiskAssessment | undefined): boolean => {
    if (value === undefined) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return !value || value.trim() === '';
};

// Helper function to check if a field is filled
const isFieldFilled = (value: string | MedicalReport[] | EmergencyContact[] | DoctorContact[] | RiskAssessment | undefined): boolean => {
    return !isFieldEmpty(value);
};

const defaultProfileData: ProfileData = {
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    height: '',
    heightUnit: 'cm',
    heightFeet: '',
    heightInches: '',
    weight: '',
    weightUnit: 'kg',
    conditions: '',
    medications: '',
    allergies: '',
    symptoms: '',
    emergencyContacts: [],
    doctorContacts: [],
    emergencyDoctorName: '',
    emergencyDoctorNumber: '',
    medicalReports: [],
    riskAssessment: undefined,
    timestamp: undefined
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load profile data from localStorage on component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedProfile = localStorage.getItem('medicalProfile');
                const savedTimestamp = localStorage.getItem('profileLastUpdated');

                if (savedProfile) {
                    const parsedProfile = JSON.parse(savedProfile);
                    setProfileData({ ...defaultProfileData, ...parsedProfile });
                }

                if (savedTimestamp) {
                    setLastUpdated(savedTimestamp);
                }
            } catch (error) {
                console.error('Error loading profile from localStorage:', error);
                // If there's an error, use default profile
                setProfileData(defaultProfileData);
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    const updateProfile = (data: ProfileData) => {
        const timestamp = new Date().toISOString();

        setProfileData(data);
        setLastUpdated(timestamp);

        // Save to localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('medicalProfile', JSON.stringify(data));
                localStorage.setItem('profileLastUpdated', timestamp);
            } catch (error) {
                console.error('Error saving profile to localStorage:', error);
            }
        }
    };

    const resetProfile = () => {
        setProfileData(defaultProfileData);
        setLastUpdated(null);

        // Clear localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('medicalProfile');
                localStorage.removeItem('profileLastUpdated');
            } catch (error) {
                console.error('Error clearing profile from localStorage:', error);
            }
        }
    };

    const isProfileComplete = () => {
        const requiredFields: (keyof ProfileData)[] = ['name', 'age', 'gender', 'bloodGroup'];
        return requiredFields.every(field => {
            const value = profileData[field];
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value).length > 0;
            }
            return typeof value === 'string' && value.trim() !== '';
        });
    };

    const getProfileCompleteness = () => {
        const allFields = Object.keys(profileData) as (keyof ProfileData)[];
        const filledFields = allFields.filter(field => {
            const value = profileData[field];
            if (field === 'riskAssessment') {
                return isRiskAssessment(value);
            }
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value).length > 0;
            }
            return typeof value === 'string' && value.trim() !== '';
        });
        return Math.round((filledFields.length / allFields.length) * 100);
    };

    const isEmptyField = (field: keyof ProfileData) => {
        const value = profileData[field];
        if (field === 'riskAssessment') {
            return !isRiskAssessment(value);
        }
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length === 0;
        }
        return typeof value !== 'string' || value.trim() === '';
    };

    const checkFieldFilled = (field: keyof ProfileData) => !isEmptyField(field);

    return (
        <ProfileContext.Provider value={{
            profileData,
            updateProfile,
            isProfileComplete,
            resetProfile,
            lastUpdated,
            isLoading
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

// Hook for using profile context
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

// Hook for checking profile completeness
export const useProfileCompleteness = () => {
    const { profileData } = useProfile();

    const getCompleteness = () => {
        const allFields = Object.keys(profileData) as (keyof ProfileData)[];
        const filledFields = allFields.filter(field => {
            const value = profileData[field];
            if (field === 'riskAssessment') {
                return isRiskAssessment(value);
            }
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value).length > 0;
            }
            return typeof value === 'string' && value.trim() !== '';
        });
        return Math.round((filledFields.length / allFields.length) * 100);
    };

    const getMissingFields = () => {
        const allFields = Object.keys(profileData) as (keyof ProfileData)[];
        return allFields.filter(field => {
            const value = profileData[field];
            if (field === 'riskAssessment') {
                return !isRiskAssessment(value);
            }
            if (Array.isArray(value)) {
                return value.length === 0;
            }
            if (typeof value === 'object' && value !== null) {
                return Object.keys(value).length === 0;
            }
            return typeof value !== 'string' || value.trim() === '';
        });
    };

    return {
        completeness: getCompleteness(),
        missingFields: getMissingFields()
    };
};