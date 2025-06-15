import { useState, useMemo, useEffect } from 'react';
import { QrCode, Download, Share2, Eye, Shield, Copy, Check, AlertTriangle, User, Pill } from 'lucide-react';
import Layout from '../components/Layout';
import QRCode from 'react-qr-code';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

interface CompressedData {
  n: string; // name
  a: string; // age
  g: string; // gender
  b: string; // blood group
  c: string; // conditions
  m: string; // medications
  al: string; // allergies
  s: string; // symptoms
  ec: { n: string; p: string; r: string; }[]; // emergency contacts
  dc: { n: string; p: string; s: string; }[]; // doctor contacts
  t: string; // timestamp
}

const QRCodePage = () => {
  const { profileData, isLoading } = useProfile();
  const [isCopied, setIsCopied] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Generate profile link with validation and error handling
  const generateProfileLink = useMemo(() => {
    const baseUrl = window.location.origin;

    // Validate profile data first
    if (!profileData || !profileData.name || !profileData.age) {
      return { link: baseUrl, error: 'Name and age are required' };
    }

    try {
      // Create a compressed data object with all essential information
      const reportData = {
        // Basic Info
        n: profileData.name?.slice(0, 50) || '',
        a: profileData.age?.toString().slice(0, 10) || '',
        g: profileData.gender?.slice(0, 10) || '',
        b: profileData.bloodGroup?.slice(0, 5) || '',
        h: profileData.height || undefined,
        hu: profileData.heightUnit,
        w: profileData.weight || undefined,
        wu: profileData.weightUnit,
        
        // Medical Info - ensuring all fields are included
        c: profileData.conditions || '',
        m: profileData.medications || '',
        al: profileData.allergies || '',
        s: profileData.symptoms || '',
        
        // Risk Assessment - ensure all fields are properly included
        r: profileData.riskAssessment ? {
          l: profileData.riskAssessment.level,
          s: profileData.riskAssessment.summary || '',
          g: profileData.riskAssessment.guidelines || [],
          t: profileData.riskAssessment.timestamp,
          conditions: profileData.riskAssessment.conditions || [],
          symptoms: profileData.riskAssessment.symptoms || []
        } : null,
        
        // Emergency Contacts - ensure all fields are included
        ec: (profileData.emergencyContacts || [])
          .map(c => ({
            n: c.name?.slice(0, 30) || '',
            p: c.number || '',
            r: c.relationship || ''
          }))
          .filter(c => c.n && c.p), // Only include contacts with at least name and number
        
        // Doctor Contacts - ensure all fields are included
        dc: (profileData.doctorContacts || [])
          .map(d => ({
            n: d.name?.slice(0, 30) || '',
            p: d.number || '',
            s: d.specialization || ''
          }))
          .filter(d => d.n && d.p), // Only include contacts with at least name and number

        // Include emergency doctor info if available
        ed: profileData.emergencyDoctorName ? {
          n: profileData.emergencyDoctorName,
          p: profileData.emergencyDoctorNumber
        } : null,
        
        t: new Date().toISOString()
      };

      const encodedData = encodeURIComponent(JSON.stringify(reportData));
      return { link: `${baseUrl}/report?data=${encodedData}`, error: null };
    } catch (error) {
      console.error('Error generating profile link:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate profile link';
      return { link: baseUrl, error: message };
    }
  }, [profileData]);

  // Update error state when the generated link changes
  useEffect(() => {
    setQrError(generateProfileLink.error);
  }, [generateProfileLink]);

  // The actual link to use
  const profileLink = generateProfileLink.link;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error("Failed to copy link to clipboard");
    }
  };
 
  const handleDownloadQR = async () => {
    try {
      const container = document.getElementById("qr-code-svg");
      const svg = container?.querySelector('svg');

      if (!svg) {
        throw new Error("QR code SVG not found");
      }

      // Clone the SVG to avoid modifying the original
      const svgClone = svg.cloneNode(true) as SVGElement;

      // Ensure SVG has proper dimensions
      if (!svgClone.getAttribute('width')) {
        svgClone.setAttribute('width', '256');
        svgClone.setAttribute('height', '256');
      }

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();

      const downloadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Use larger dimensions for better quality
          const size = 512;
          canvas.width = size;
          canvas.height = size;

          // White background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size, size);

          // Draw the QR code centered and scaled up
          ctx.drawImage(img, 0, 0, size, size);

          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, 'pulseid-emergency-qr.png');
              resolve();
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        };

        img.onerror = (error) => reject(error);
      });

      img.src = url;
      await downloadPromise;
      URL.revokeObjectURL(url);
      toast.success("QR code downloaded successfully!");

    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to download QR code. Please try again.")
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PulseID Emergency Medical Profile',
          text: 'My emergency medical information',
          url: profileLink,
        });
        toast.success("Profile shared successfully!");
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          toast.error("Failed to share profile");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePreviewReport = () => {
    try {
      // We already have the validated profile link
      const reportUrl = new URL(profileLink);
      const reportData = reportUrl.searchParams.get('data');
      
      if (!reportData) {
        throw new Error('Failed to generate report data');
      }

      navigate(`/report?data=${reportData}`);
    } catch (error) {
      console.error('Error generating report preview:', error);
      toast.error('Failed to generate report preview');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Your Emergency QR Code</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Share this QR code with emergency responders for instant access to your medical information
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="medical-card text-center max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Emergency QR Code</h3>

              <div className="bg-white p-6 rounded-lg border-2 border-slate-200 mb-6 inline-block">
                <div id="qr-code-svg" className="p-2 bg-white">
                  {qrError ? (
                    <div className="w-48 h-48 flex items-center justify-center bg-red-50 text-red-500">
                      <AlertTriangle className="w-12 h-12" />
                    </div>
                  ) : (
                    <QRCode
                      value={profileLink}
                      size={192}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadQR}
                  disabled={!!qrError}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR Code</span>
                </button>

                <button
                  onClick={handleShare}
                  disabled={!!qrError}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400 px-6 py-3 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share QR Code</span>
                </button>

                <button
                  onClick={handlePreviewReport}
                  disabled={!!qrError}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>Preview Medical Report</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="medical-card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Public Profile Link</h3>
              <p className="text-sm text-slate-600 mb-4">
                This is the direct link to your public medical profile. Anyone with this link can view your emergency medical information.
              </p>

              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={profileLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded text-sm text-slate-700 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="medical-card bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Privacy & Security</h4>
                  <p className="text-sm text-yellow-700">
                    Your QR code contains only essential medical information for emergencies.
                    Personal details like full contact information and detailed medical history
                    are kept private and secure.
                  </p>
                </div>
              </div>
            </div>

            <div className="medical-card">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">What's Included</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-700">Basic Information (Name, Age, Blood Type)</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-slate-700">Medical Conditions & Allergies</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Pill className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-slate-700">Current Medications</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm text-slate-700">Emergency Contact & Doctor Information</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRCodePage;