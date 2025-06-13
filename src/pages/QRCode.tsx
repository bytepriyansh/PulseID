import  { useState } from 'react';
import { QrCode, Download, Share2, Eye, Shield, Copy, Check, AlertTriangle, User, Pill } from 'lucide-react';
import Layout from '../components/Layout';
import QRCode from 'react-qr-code';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';

const QRCodePage = () => {
  const { profileData } = useProfile();
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  const generateProfileLink = () => {
    const baseUrl = window.location.origin;
    const encodedData = encodeURIComponent(JSON.stringify({
      ...profileData,
      timestamp: new Date().toISOString()
    }));
    return `${baseUrl}/report?data=${encodedData}`;
  };

  const profileLink = generateProfileLink();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };
 
  const handleDownloadQR = async () => {
    try {
      // Find the SVG element inside the container
      const container = document.getElementById("qr-code-svg");
      const svg = container?.querySelector('svg');

      if (!svg) {
        console.error("QR code SVG not found");
        return;
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
              const downloadUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = 'pulseid-emergency-qr.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(downloadUrl);
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

    } catch (error) {
      console.error('Download failed:', error);
      toast("Failed to download QR code. Please try again.")
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
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePreviewReport = () => {
    navigate(`/report?data=${encodeURIComponent(JSON.stringify(profileData))}`);
  };

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
                  <QRCode
                    value={profileLink}
                    size={192}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadQR}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download QR Code</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share QR Code</span>
                </button>

                <button
                  onClick={handlePreviewReport}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>Preview Medical Report</span>
                </button>
              </div>
            </div>
          </div>

          

          <div className="flex-1 space-y-6">
      
           

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
                  <span className="text-sm text-slate-700">Emergency Contact Information</span>
                </div>
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
            
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QRCodePage;