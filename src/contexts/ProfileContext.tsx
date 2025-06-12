import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ProfileData {
    name: string;
    age: string;
    gender: string;
    bloodGroup: string;
    conditions: string;
    medications: string;
    allergies: string;
    symptoms: string;
    emergencyContactName: string;
    emergencyContactNumber: string;
}

interface ProfileContextType {
    profileData: ProfileData;
    updateProfile: (data: ProfileData) => void;
    isProfileComplete: () => boolean;
    resetProfile: () => void;
    lastUpdated: string | null;
}

const defaultProfileData: ProfileData = {
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    conditions: '',
    medications: '',
    allergies: '',
    symptoms: '',
    emergencyContactName: '',
    emergencyContactNumber: ''
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profileData, setProfileData] = useState<ProfileData>(defaultProfileData);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
        return requiredFields.every(field =>
            profileData[field] &&
            profileData[field].trim() !== ''
        );
    };

    const getProfileCompleteness = () => {
        const allFields = Object.keys(profileData) as (keyof ProfileData)[];
        const filledFields = allFields.filter(field =>
            profileData[field] && profileData[field].trim() !== ''
        );
        return Math.round((filledFields.length / allFields.length) * 100);
    };

    return (
        <ProfileContext.Provider value={{
            profileData,
            updateProfile,
            isProfileComplete,
            resetProfile,
            lastUpdated
        }}>
            {children}
        </ProfileContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

// Additional utility hooks
// eslint-disable-next-line react-refresh/only-export-components
export const useProfileCompleteness = () => {
    const { profileData } = useProfile();

    const getCompleteness = () => {
        const allFields = Object.keys(profileData) as (keyof ProfileData)[];
        const filledFields = allFields.filter(field =>
            profileData[field] && profileData[field].trim() !== ''
        );
        return Math.round((filledFields.length / allFields.length) * 100);
    };

    const getMissingFields = () => {
        const allFields = Object.keys(profileData) as (keyof ProfileData)[];
        return allFields.filter(field =>
            !profileData[field] || profileData[field].trim() === ''
        );
    };

    return {
        completeness: getCompleteness(),
        missingFields: getMissingFields()
    };
};