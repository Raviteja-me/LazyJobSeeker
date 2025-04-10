import React from 'react';
import { Shield } from 'lucide-react';

interface PrivacyNoticeProps {
  show: boolean;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-enhanced p-6 mb-8 text-white">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">
            Your Privacy Matters
          </h3>
          <p className="leading-relaxed opacity-90">
            For your security, we process your resume in real-time and don't store any personal data. 
            Make sure to download your enhanced resume now – it's a temporary file that prioritizes your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;