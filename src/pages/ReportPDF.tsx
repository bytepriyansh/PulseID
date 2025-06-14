import { useLocation } from 'react-router-dom';
import { Page, Text, View, Document, StyleSheet, Font, PDFViewer, Image } from '@react-pdf/renderer';
import Layout from '../components/Layout';
import type { ReportData } from '@/utils/reportData';

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZg.ttf', fontWeight: 600 },
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZg.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Inter'
    },
    headerBar: {
        backgroundColor: '#1E40AF',
        padding: 15,
        marginHorizontal: -40,
        marginTop: -40,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold'
    },
    headerDate: {
        color: '#FFFFFF',
        fontSize: 10,
        opacity: 0.9
    },
    emergencyBanner: {
        backgroundColor: '#DC2626',
        padding: 10,
        marginBottom: 20,
        borderRadius: 4
    },
    emergencyText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 4,
        border: '1px solid #E2E8F0'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 12,
        backgroundColor: '#F1F5F9',
        padding: 8,
        borderRadius: 4
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    infoItem: {
        flexBasis: '48%',
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 4,
        border: '1px solid #E2E8F0'
    },
    label: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 4
    },
    value: {
        fontSize: 12,
        color: '#0F172A',
        fontWeight: 'bold'
    },
    riskHigh: {
        backgroundColor: '#FEE2E2',
        borderColor: '#FECACA'
    },
    riskModerate: {
        backgroundColor: '#FEF3C7',
        borderColor: '#FDE68A'
    },
    riskLow: {
        backgroundColor: '#DCFCE7',
        borderColor: '#BBF7D0'
    },
    guidelinesList: {
        marginTop: 10
    },
    guidelineItem: {
        fontSize: 11,
        color: '#374151',
        marginBottom: 6,
        flexDirection: 'row'
    },
    bulletPoint: {
        width: 10,
        marginRight: 5
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 10,
        color: '#64748B',
        borderTop: '1px solid #E2E8F0',
        paddingTop: 10
    }
});

const ReportPDF = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const encodedData = searchParams.get('data');
    
    let profileData: ReportData | null = null;
    try {
        profileData = encodedData ? JSON.parse(atob(encodedData)) : null;
    } catch (error) {
        console.error('Error parsing profile data:', error);
    }

    if (!profileData) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">Error</h1>
                        <p className="text-gray-600">Invalid or missing profile data</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const isEmergency = profileData.type === 'emergency';
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRiskStyle = (level: 'HIGH' | 'MODERATE' | 'LOW') => {
        switch (level) {
            case 'HIGH':
                return styles.riskHigh;
            case 'MODERATE':
                return styles.riskModerate;
            case 'LOW':
                return styles.riskLow;
        }
    };

    return (
        <Layout>
            <div className="p-4">
                <PDFViewer className="w-full h-[calc(100vh-8rem)] rounded-lg shadow-lg">
                    <Document>
                        <Page size="A4" style={styles.page}>
                            <View style={styles.headerBar}>
                                <View>
                                    <Text style={styles.headerTitle}>
                                        {isEmergency ? '🚨 Emergency Medical Profile' : 'Medical Profile Report'}
                                    </Text>
                                    <Text style={styles.headerDate}>
                                        Generated: {formatDate(profileData.timestamp || new Date().toISOString())}
                                    </Text>
                                </View>
                            </View>

                            {isEmergency && (
                                <View style={styles.emergencyBanner}>
                                    <Text style={styles.emergencyText}>
                                        ⚠️ EMERGENCY MEDICAL INFORMATION ⚠️
                                    </Text>
                                </View>
                            )}

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Essential Information</Text>
                                <View style={styles.infoGrid}>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Full Name</Text>
                                        <Text style={styles.value}>{profileData.name}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Age</Text>
                                        <Text style={styles.value}>{profileData.age} years</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Blood Type</Text>
                                        <Text style={styles.value}>{profileData.bloodGroup}</Text>
                                    </View>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Gender</Text>
                                        <Text style={styles.value}>{profileData.gender}</Text>
                                    </View>
                                </View>
                            </View>

                            {profileData.riskAssessment && (
                                <View style={[styles.section, getRiskStyle(profileData.riskAssessment.level)]}>
                                    <Text style={styles.sectionTitle}>Risk Assessment</Text>
                                    <View style={styles.infoItem}>
                                        <Text style={styles.label}>Risk Level</Text>
                                        <Text style={styles.value}>{profileData.riskAssessment.level}</Text>
                                    </View>
                                    <View style={[styles.infoItem, { marginTop: 10 }]}>
                                        <Text style={styles.label}>Assessment</Text>
                                        <Text style={styles.value}>{profileData.riskAssessment.summary}</Text>
                                    </View>
                                    <View style={styles.guidelinesList}>
                                        {profileData.riskAssessment.guidelines.map((guideline, index) => (
                                            <View key={index} style={styles.guidelineItem}>
                                                <Text style={styles.bulletPoint}>•</Text>
                                                <Text style={[styles.value, { fontSize: 11 }]}>{guideline}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <View style={[styles.section, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                                <Text style={styles.sectionTitle}>Critical Medical Information</Text>
                                <View style={styles.infoGrid}>
                                    <View style={[styles.infoItem, { flexBasis: '100%' }]}>
                                        <Text style={styles.label}>Medical Conditions</Text>
                                        <Text style={styles.value}>{profileData.conditions || 'None reported'}</Text>
                                    </View>
                                    <View style={[styles.infoItem, { flexBasis: '100%' }]}>
                                        <Text style={styles.label}>Current Medications</Text>
                                        <Text style={styles.value}>{profileData.medications || 'None'}</Text>
                                    </View>
                                    <View style={[styles.infoItem, { flexBasis: '100%' }]}>
                                        <Text style={styles.label}>Allergies</Text>
                                        <Text style={styles.value}>{profileData.allergies || 'None reported'}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                                <View style={styles.infoGrid}>
                                    {profileData.emergencyContacts?.map((contact, index) => (
                                        <View key={index} style={[styles.infoItem, { flexBasis: '100%' }]}>
                                            <Text style={styles.label}>Emergency Contact {index + 1}</Text>
                                            <Text style={styles.value}>
                                                {contact.name} ({contact.relationship})
                                            </Text>
                                            <Text style={[styles.value, { color: '#2563EB' }]}>
                                                {contact.number}
                                            </Text>
                                        </View>
                                    ))}
                                    {profileData.emergencyDoctorName && (
                                        <View style={[styles.infoItem, { flexBasis: '100%', backgroundColor: '#F0FDF4' }]}>
                                            <Text style={styles.label}>Primary Physician</Text>
                                            <Text style={styles.value}>
                                                Dr. {profileData.emergencyDoctorName}
                                            </Text>
                                            <Text style={[styles.value, { color: '#2563EB' }]}>
                                                {profileData.emergencyDoctorNumber}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <Text style={styles.footer}>
                                This medical profile was generated by PulseID • For emergency use • Valid as of {formatDate(profileData.timestamp || new Date().toISOString())}
                            </Text>
                        </Page>
                    </Document>
                </PDFViewer>
            </div>
        </Layout>
    );
};

export default ReportPDF;