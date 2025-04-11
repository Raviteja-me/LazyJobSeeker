import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  AlertCircle,
  RefreshCw,
  PartyPopper,
  Sparkles
} from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Import components
import ResumeInput from '../components/MagicCV/ResumeInput';
import JobDetails from '../components/MagicCV/JobDetails';
import ProcessedResumes from '../components/MagicCV/ProcessedResumes';
import UsageTracker from '../components/MagicCV/UsageTracker';
import PrivacyNotice from '../components/MagicCV/PrivacyNotice';
import Comments from '../components/MagicCV/Comments';

// Constants
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds

// Interfaces
interface ProcessedResume {
  id: string;
  jobTitle: string;
  processedAt: Timestamp;
  status: 'completed' | 'processing' | 'error';
  downloadUrl?: string;
  originalResumeUrl?: string;
  jobUrl?: string;
  error?: string;
  userId: string;
  companyName?: string;
  generatedContent?: string;
  pdfBlob?: Blob;
}

export default function MagicCVPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState<string>('classic');
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResumes, setProcessedResumes] = useState<ProcessedResume[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(3);
  const [dragActive, setDragActive] = useState(false);
  const [showDataNotice, setShowDataNotice] = useState(false);
  const [cvText, setCvText] = useState('');

  // Fetch processed resumes
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'processedResumes'),
      where('userId', '==', user.uid),
      orderBy('processedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resumes: ProcessedResume[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        resumes.push({
          id: doc.id,
          jobTitle: data.jobTitle || 'Job Application',
          processedAt: data.processedAt,
          status: data.status,
          downloadUrl: data.downloadUrl,
          originalResumeUrl: data.originalResumeUrl,
          jobUrl: data.jobUrl,
          userId: data.userId
        });
      });
      setProcessedResumes(resumes);
      setUsageCount(resumes.length);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch daily usage
  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const dailyUsageRef = doc(db, 'dailyUsage', `${user.uid}_${today}`);

    const unsubscribe = onSnapshot(dailyUsageRef, (doc) => {
      if (doc.exists()) {
        setDailyUsageCount(doc.data().count || 0);
      } else {
        setDailyUsageCount(0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in to continue.');
      return;
    }

    // Validation
    if (!file && !cvText) {
      setError('Please upload your resume or paste resume text to continue.');
      return;
    }

    if (!jobUrl && !jobDescription) {
      setError('Please provide either a job URL or job description.');
      return;
    }

    if (jobUrl && jobDescription) {
      setError('Please provide either a job URL or a job description, not both.');
      return;
    }
  
    // LinkedIn URL validation
    if (jobUrl) {
      const jobIdMatch = jobUrl.match(/(?:currentJobId=|jobs\/view\/)(\d+)/);
      if (!jobIdMatch) {
        setError('Please enter a valid LinkedIn job URL. Only LinkedIn job postings are supported at this time.');
        return;
      }
    }

    // Usage limits
    if (usageCount >= maxUsage) {
      setError('You have reached your resume processing limit.');
      return;
    }

    if (dailyUsageCount >= maxUsage) {
      setError('You have reached your daily limit. Please try again tomorrow.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      if (file) {
        formData.append('cv', file);
      } else if (cvText) {
        formData.append('cv_text', cvText);
      }
      
      if (jobUrl) {
        formData.append('url', jobUrl);
      }
      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }
      formData.append('style', selectedStyle);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      console.log('Sending request to webhook:', WEBHOOK_URL);
      console.log('Selected style:', selectedStyle);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/pdf,*/*'
        }
      });

      clearTimeout(timeoutId);
      
      console.log('Response received:', response.status, response.statusText);
      console.log('Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Server error: ${errorText || response.statusText}`);
      }

      const pdfBlob = await response.blob();
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Received empty response from server');
      }
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `resumes/${user.uid}/${Date.now()}_enhanced.pdf`);
      await uploadBytes(storageRef, pdfBlob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      // Create new resume entry in Firestore
      const resumeData = {
        userId: user.uid,
        jobTitle: jobUrl ? 'LinkedIn Job Application' : 'Custom Job Application',
        processedAt: Timestamp.now(),
        status: 'completed',
        downloadUrl: downloadUrl,
        jobUrl: jobUrl || null,
        jobDescription: jobDescription || null,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'processedResumes'), resumeData);
      
      // Update daily usage count
      const today = new Date().toISOString().split('T')[0];
      const dailyUsageRef = doc(db, 'dailyUsage', `${user.uid}_${today}`);
      
      await updateDoc(dailyUsageRef, {
        count: dailyUsageCount + 1,
        lastUpdated: Timestamp.now()
      }).catch(() => {
        // If document doesn't exist, create it
        setDoc(dailyUsageRef, {
          count: 1,
          lastUpdated: Timestamp.now()
        });
      });

      // Update UI
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFile(null);
      setCvText('');
      setJobUrl('');
      setJobDescription('');
      setShowDataNotice(true);
    } catch (error: any) {
      console.error('Error details:', error);
      
      if (error.name === 'AbortError') {
        setError('Request timed out after 3 minutes. Please try again.');
      } else if (!navigator.onLine) {
        setError('Please check your internet connection and try again.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle resume download
  const handleDownload = (resume: ProcessedResume) => {
    if (resume.pdfBlob) {
      const downloadUrl = URL.createObjectURL(resume.pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `enhanced_resume_${Date.now()}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    } else if (resume.downloadUrl) {
      window.open(resume.downloadUrl, '_blank');
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Privacy Notice */}
        <PrivacyNotice show={showDataNotice} />

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Resume Input Component */}
          <ResumeInput 
            file={file}
            setFile={setFile}
            cvText={cvText}
            setCvText={setCvText}
            dragActive={dragActive}
            setDragActive={setDragActive}
            setError={setError}
          />

          {/* Job Details Component */}
          <JobDetails 
            jobUrl={jobUrl}
            setJobUrl={setJobUrl}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            setError={setError}
          />
        </div>

        {/* Usage Tracker */}
        <div className="mb-8">
          <UsageTracker 
            dailyUsageCount={dailyUsageCount}
            maxUsage={maxUsage}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-200 rounded-lg flex items-center text-red-700 shadow-sm">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center text-white shadow-enhanced animate-pulse">
            <PartyPopper className="h-5 w-5 mr-2" />
            Your resume has been successfully enhanced! You can download it from the table below.
          </div>
        )}

        {/* Submit Button */}
        <div className="mb-8">
          <button
            onClick={handleSubmit}
            disabled={isProcessing || isUploading || (!file && !cvText && !jobUrl && !jobDescription) || dailyUsageCount >= maxUsage}
            className={`w-full py-4 px-6 rounded-full text-white font-medium flex items-center justify-center space-x-2
              ${isProcessing || isUploading || dailyUsageCount >= maxUsage 
                ? 'bg-gray-400' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'} 
              transform hover:scale-[1.02] transition-all shadow-lg`}
          >
            {isProcessing || isUploading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{isUploading ? 'Uploading...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Enhanced Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Processed Resumes Component */}
        <ProcessedResumes 
          processedResumes={processedResumes}
          handleDownload={handleDownload}
        />
        
        {/* Comments Component */}
        <Comments />
      </div>
    </div>
  );
}