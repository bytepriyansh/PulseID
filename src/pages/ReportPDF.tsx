import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ProfileData } from '@/contexts/ProfileContext';
import { calculateBMI, formatDate, formatDateOnly, formatDoctorName } from '@/utils/formatters';
import { FONT_SIZES, COLORS, SPACING } from '@/utils/pdfStyles';

interface ReportPDFProps {
  profileData: ProfileData;
}

const styles = StyleSheet.create({
  page: {
    padding: '15mm',
    fontSize: FONT_SIZES.base,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#374151',
  },
  title: {
    fontSize: FONT_SIZES.xl,
    marginBlockEnd: SPACING[2],
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBlockEnd: SPACING[4],
  },
  section: {
    marginBlockEnd: SPACING[3],
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    breakBefore: 'auto',
    breakAfter: 'auto',
  },
  sectionHeader: {
    padding: SPACING[2],
    backgroundColor: '#F8FAFC',
    border: '1pt solid #E2E8F0',
    borderRadius: 6,
    marginBlockEnd: SPACING[2],
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginInlineStart: -SPACING[2],
    marginInlineEnd: -SPACING[2],
    marginBlockEnd: 0,
    breakInside: 'avoid',
  },
  gridItem: {
    flexBasis: '50%',
    paddingInlineStart: SPACING[2],
    paddingInlineEnd: SPACING[2],
    marginBlockEnd: SPACING[1],
  },
  card: {
    padding: SPACING[3],
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    border: '1pt solid #E2E8F0',
    blockSize: '100%',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: '#6B7280',
    marginBlockEnd: SPACING[1],
  },
  value: {
    fontSize: FONT_SIZES.base,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  medicalInfoContainer: {
    breakInside: 'avoid',
  },
  medicalInfoGrid: {
    display: 'flex',
    flexDirection: 'row',
    gap: SPACING[3],
    breakInside: 'avoid',
    marginBlockEnd: SPACING[2],
  },
  medicalInfoColumn: {
    flex: 1,
    breakInside: 'avoid',
  },
  conditionsBox: {
    backgroundColor: '#FEF2F2',
    border: '1pt solid #FCA5A5',
    padding: SPACING[3],
    borderRadius: 6,
    marginBlockEnd: SPACING[2],
    breakInside: 'avoid',
  },
  symptomsBox: {
    backgroundColor: '#F0FDF4',
    border: '1pt solid #86EFAC',
    padding: SPACING[3],
    borderRadius: 6,
    marginBlockEnd: SPACING[2],
    breakInside: 'avoid',
  },
  allergiesBox: {
    backgroundColor: '#FEF3C7',
    border: '1pt solid #FCD34D',
    padding: SPACING[3],
    borderRadius: 6,
    marginBlockEnd: SPACING[2],
    breakInside: 'avoid',
  },
  medicationsBox: {
    backgroundColor: '#F3E8FF',
    border: '1pt solid #C4B5FD',
    padding: SPACING[3],
    borderRadius: 6,
    marginBlockEnd: SPACING[2],
    breakInside: 'avoid',
  },

  criticalInfoBlock: {
    backgroundColor: '#FEF2F2',
    border: '1pt solid #FCA5A5',
    padding: SPACING[3],
    borderRadius: 6,
    inlineSize: '100%',
    marginBlockEnd: SPACING[3],
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },
  emergencyProtocolBlock: {
    backgroundColor: '#EFF6FF',
    border: '1pt solid #BFDBFE',
    padding: SPACING[3],
    borderRadius: 6,
    inlineSize: '100%',
    marginBlockEnd: SPACING[3],
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },
  emergencyGuidelinesBlock: {
    backgroundColor: '#F0FDF4',
    border: '1pt solid #86EFAC',
    padding: SPACING[3],
    borderRadius: 6,
    inlineSize: '100%',
    marginBlockEnd: SPACING[3],
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },
  riskLevelBlock: {
    backgroundColor: '#FEF3C7',
    border: '1pt solid #FCD34D',
    padding: SPACING[3],
    borderRadius: 6,
    inlineSize: '100%',
    marginBlockEnd: SPACING[3],
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
  },
  blockTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBlockEnd: SPACING[2],
  },

  emergencyContact: {
    backgroundColor: '#FEF2F2',
    border: '1pt solid #FCA5A5',
    padding: SPACING[3],
    borderRadius: 6,
    marginBlockEnd: SPACING[1],
    breakInside: 'avoid',
  },
  doctorContact: {
    backgroundColor: '#EFF6FF',
    border: '1pt solid #BFDBFE',
    padding: SPACING[3],
    borderRadius: 6,
    marginBlockEnd: SPACING[1],
    breakInside: 'avoid',
  },
  contactName: {
    fontSize: FONT_SIZES.base,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBlockEnd: SPACING[1],
  },
  contactInfo: {
    fontSize: FONT_SIZES.base,
    color: '#374151',
    marginBlockEnd: SPACING[1],
  },
  contactRelation: {
    fontSize: FONT_SIZES.sm,
    color: '#6B7280',
  },
  listItem: {
    flexDirection: 'row',
    marginBlockEnd: SPACING[1],
    alignItems: 'flex-start',
    paddingInlineStart: SPACING[1],
  },
  listHeading: {
    fontSize: FONT_SIZES.sm,
    fontFamily: 'Helvetica-Bold',
    color: '#1E40AF',
    marginBlockEnd: SPACING[2],
  },
  bulletPoint: {
    inlineSize: '12pt',
    fontSize: FONT_SIZES.sm,
    color: '#4B5563',
    fontFamily: 'Helvetica-Bold',
  },
  listContent: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#374151',
    marginInlineStart: SPACING[1],
    paddingBlockStart: '1pt',
  },
  footer: {
    fontSize: FONT_SIZES.sm,
    color: '#6B7280',
    textAlign: 'center',
    marginBlockStart: SPACING[4],
    paddingBlockStart: SPACING[2],
    borderBlockStart: '1pt solid #E2E8F0',
  },
  riskAssessmentHeading: {
    fontSize: FONT_SIZES.xl,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBlockStart: SPACING[4],
    marginBlockEnd: SPACING[3],
    textAlign: 'center',
  },
});

const ReportPDF: React.FC<ReportPDFProps> = ({ profileData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Medical Emergency Report</Text>
        <Text style={styles.subtitle}>
          Generated on {formatDate(new Date())}
        </Text>

        {/* Personal Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <View style={styles.card}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{profileData.name}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.card}>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{profileData.age}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.card}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{profileData.gender || 'Not specified'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.card}>
                <Text style={styles.label}>Blood Group</Text>
                <Text style={styles.value}>{profileData.bloodGroup || 'Not specified'}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <View style={styles.card}>
                <Text style={styles.label}>BMI</Text>
                <Text style={styles.value}>
                  {calculateBMI(
                    profileData.height,
                    profileData.weight,
                    profileData.heightUnit || 'cm',
                    profileData.weightUnit || 'kg'
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>
          <View style={styles.medicalInfoGrid}>
            <View style={styles.medicalInfoColumn}>
              <View style={styles.conditionsBox}>
                <Text style={styles.listHeading}>Medical Conditions</Text>
                {profileData.conditions ? profileData.conditions.split(',').map((condition, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listContent}>{condition.trim()}</Text>
                  </View>
                )) : (
                  <Text style={styles.listContent}>None reported</Text>
                )}
              </View>
              
              <View style={styles.allergiesBox}>
                <Text style={styles.listHeading}>Allergies</Text>
                {profileData.allergies ? profileData.allergies.split(',').map((allergy, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listContent}>{allergy.trim()}</Text>
                  </View>
                )) : (
                  <Text style={styles.listContent}>None reported</Text>
                )}
              </View>
            </View>
            <View style={styles.medicalInfoColumn}>
              <View style={styles.symptomsBox}>
                <Text style={styles.listHeading}>Current Symptoms</Text>
                {profileData.symptoms ? profileData.symptoms.split(',').map((symptom, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listContent}>{symptom.trim()}</Text>
                  </View>
                )) : (
                  <Text style={styles.listContent}>None reported</Text>
                )}
              </View>
              
              <View style={styles.medicationsBox}>
                <Text style={styles.listHeading}>Current Medications</Text>
                {profileData.medications ? profileData.medications.split(',').map((medication, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listContent}>{medication.trim()}</Text>
                  </View>
                )) : (
                  <Text style={styles.listContent}>None reported</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          </View>
          <View style={styles.grid}>
            {profileData.emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.gridItem}>
                <View style={styles.emergencyContact}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactInfo}>{contact.number}</Text>
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Healthcare Providers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Healthcare Providers</Text>
          </View>
          <View style={styles.grid}>
            {profileData.doctorContacts.map((doctor, index) => (
              <View key={index} style={styles.gridItem}>
                <View style={styles.doctorContact}>
                  <Text style={styles.contactName}>{formatDoctorName(doctor.name)}</Text>
                  <Text style={styles.contactInfo}>{doctor.specialization}</Text>
                  <Text style={styles.contactInfo}>{doctor.number}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Assessment Heading */}
        <Text style={styles.riskAssessmentHeading}>
          Risk Assessment & Critical Care Information
        </Text>

        {/* Risk Level Block */}
        {profileData.conditions && (
          <View style={styles.riskLevelBlock}>
            <Text style={styles.blockTitle}>Risk Level Assessment</Text>
            <Text style={styles.listContent}>
              Patient requires {(profileData.riskAssessment?.level || 'MODERATE').toLowerCase()} level medical attention and monitoring due to pre-existing conditions.
            </Text>
          </View>
        )}

        {/* Critical Medical Information Block */}
        {(profileData.conditions || profileData.symptoms || profileData.medications || profileData.allergies) && (
          <View style={styles.criticalInfoBlock}>
            <Text style={styles.blockTitle}>Critical Medical Information</Text>
            <Text style={styles.listContent}>
              {`${profileData.name}, a ${profileData.age}-year-old ${profileData.gender?.toLowerCase() || 'individual'}, presents with ${profileData.symptoms || 'no reported symptoms'}. ${profileData.conditions ? `They have pre-existing ${profileData.conditions},` : 'No pre-existing conditions reported,'} and ${profileData.medications ? `are currently taking ${profileData.medications}` : 'are not on any medication'}. ${profileData.allergies ? `Patient has allergies to: ${profileData.allergies}` : 'No known allergies.'}`}
            </Text>
          </View>
        )}

        {/* Emergency Protocol Block */}
        {(profileData.conditions || profileData.allergies || profileData.medications) && (
          <View style={styles.emergencyProtocolBlock}>
            <Text style={styles.blockTitle}>Emergency Protocol</Text>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listContent}>
                Check medical ID bracelet/necklace{profileData.conditions ? ` - Patient has pre-existing conditions` : ''}
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listContent}>
                Monitor vital signs closely{profileData.conditions ? ` - History of ${profileData.conditions}` : ''}
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listContent}>
                Check allergies before medication - Allergies: {profileData.allergies || 'None reported'}
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.listContent}>
                Current Medications: {profileData.medications || 'None'}
              </Text>
            </View>
          </View>
        )}

        {/* Emergency Response Guidelines Block */}
        {(profileData.emergencyContacts.length > 0 || profileData.doctorContacts.length > 0) && (
          <View style={styles.emergencyGuidelinesBlock}>
            <Text style={styles.blockTitle}>Emergency Response Guidelines</Text>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>1.</Text>
              <Text style={styles.listContent}>
                Contact emergency contact immediately (See contacts above)
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>2.</Text>
              <Text style={styles.listContent}>
                {profileData.doctorContacts?.[0]
                  ? `Notify primary physician ${formatDoctorName(profileData.doctorContacts[0].name)} of the emergency`
                  : 'Notify primary physician of the emergency'}
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bulletPoint}>3.</Text>
              <Text style={styles.listContent}>
                Share this medical report with emergency responders
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          Report generated by PulseID Emergency Medical System
        </Text>
      </Page>
    </Document>
  );
};

export default ReportPDF;