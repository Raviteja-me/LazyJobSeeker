import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Upload,
  FileText,
  AlertCircle,
  RefreshCw,
  Download,
  Clock,
  CheckCircle,
  Brain,
  Link as LinkIcon,
  AlertTriangle,
  XCircle,
  Shield,
  PartyPopper,
  Sparkles,
  Edit3
} from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, updateDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const WEBHOOK_URL = 'https://primary-production-d5c0.up.railway.app/webhook/aac328d1-79db-4dfd-9b25-b3c926ddc1a9';

interface ProcessedResume {
  id: string;
  jobTitle: string;
  processedAt: Timestamp;
  status: 'completed' | 'processing' | 'error';
  downloadUrl?: string;
  originalResumeUrl?: string;
  jobUrl?: string;
  error?: string;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Add new interface for temporary resume
interface TempProcessedResume extends ProcessedResume {
  pdfBlob?: Blob;
}

// Add this interface near other interfaces
interface UserDailyUsage {
  date: string;
  count: number;
}

export default function Dashboard() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  // Add dailyUsageCount state
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResumes, setProcessedResumes] = useState<TempProcessedResume[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [maxUsage] = useState(3);
  const [dragActive, setDragActive] = useState(false);
  const [showDataNotice, setShowDataNotice] = useState(false);

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
          jobUrl: data.jobUrl
        });
      });
      setProcessedResumes(resumes);
      setUsageCount(resumes.length);
    });

    return () => unsubscribe();
  }, [user]);

  // Add this after your existing useEffect
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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Please upload only PDF files. Other document types are not supported at this time.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB.';
    }
    return null;
  };

  const validateLinkedInUrl = (url: string): string | null => {
    if (!url) return null; // Allow empty URL
    
    // Updated regex to match different LinkedIn URL formats
    const linkedInPattern = /^https?:\/\/(?:www\.|sg\.)?linkedin\.com\/jobs\/(?:view|search)\/[^?]+(?:\d+)/i;
    if (!linkedInPattern.test(url)) {
      return 'Please enter a valid LinkedIn job URL. Only LinkedIn job postings are supported at this time.';
    }
    
    return null;
  };
  
  const handleJobUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    
    // Clean the URL before setting state - remove query parameters and trailing slashes
    const cleanedUrl = url
      .replace(/\?.*$/, '') // Remove query parameters
      .replace(/\/$/, ''); // Remove trailing slash
    
    setJobUrl(cleanedUrl);
    // Clear job description when URL is entered
    setJobDescription('');
    setError(validateLinkedInUrl(cleanedUrl));
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
    // Clear job URL when description is entered
    setJobUrl('');
    setError(''); // Clear any URL-related errors when description is entered
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(file);
    }
  };

  // Update handleSubmit to include LinkedIn URL validation
  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in to continue.');
      return;
    }
  
    if (!file && !jobUrl && !jobDescription) {
      setError('Please upload a resume and provide either a job URL or a job description.');
      return;
    }

    if (jobUrl && jobDescription) {
      setError('Please provide either a job URL or a job description, not both.');
      return;
    }
  
    const urlError = validateLinkedInUrl(jobUrl);
    if (jobUrl && urlError) {
      setError(urlError);
      return;
    }

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
      // Add this at the start of the try block
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

      const formData = new FormData();
      if (file) {
        formData.append('cv', file);
      }
      if (jobUrl) {
        formData.append('url', jobUrl);
      }
      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // Increased timeout to 2 minutes

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText || response.statusText}`);
        }

        // Get the PDF blob from response
        const pdfBlob = await response.blob();
        if (!pdfBlob || pdfBlob.size === 0) {
          throw new Error('Received empty response from server');
        }

        // Create temporary resume entry
        const newResume: TempProcessedResume = {
          id: Date.now().toString(),
          jobTitle: 'Enhanced Resume',
          processedAt: Timestamp.now(),
          status: 'completed',
          jobUrl: jobUrl,
          pdfBlob: pdfBlob
        };

        // Update processed resumes and usage count
        setProcessedResumes(prev => [newResume, ...prev]);
        setUsageCount(prev => prev + 1);
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form
        setFile(null);
        setJobUrl('');
        setJobDescription('');
        setShowDataNotice(true);

      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error details:', error);
      setError(error.message || 'Please try again in a few moments.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add download handler
  const handleDownload = (resume: TempProcessedResume) => {
    if (resume.pdfBlob) {
      const downloadUrl = URL.createObjectURL(resume.pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `enhanced_resume_${Date.now()}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  // Remove this commented-out duplicate declaration
  // const handleJobUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const url = e.target.value;
  //   setJobUrl(url);
  //   const urlError = validateLinkedInUrl(url);
  //   if (urlError && url !== '') {
  //     setError(urlError);
  //   } else {
  //     setError('');
  //   }
  // };

  // Modify the table row in the return statement
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Add error boundary for user email
  const userDisplayName = user?.email ? user.email.split('@')[0] : 'User';

  // Update the welcome banner to use the safe display name
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-enhanced p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {userDisplayName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Upload your resume and paste a job link or description to get started.
              </p>
            </div>
            <Brain className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        {showDataNotice && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-enhanced p-6 mb-8 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Your Privacy Matters
                </h3>
                <p className="text-blue-700 leading-relaxed">
                  For your security, we process your resume in real-time and don't store any personal data. 
                  Make sure to download your enhanced resume now – it's a temporary file that prioritizes your privacy.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload Section */}
          <div className="bg-white rounded-lg shadow-enhanced p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Your Resume</h2>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
                ${file ? 'bg-green-50' : ''}`}
            >
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-6 w-6 text-green-500" />
                  <span className="text-green-700">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors rounded-full hover:bg-red-50"
                    title="Remove file"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600">Drag and drop your resume here, or</p>
                    <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                      browse to upload
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.odt,.txt"
                        onChange={handleFileInput}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">Supported formats: PDF, Word (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Job URL and Description Section */}
          <div className="bg-white rounded-lg shadow-enhanced p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Paste LinkedIn Job URL Here
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="jobUrl"
                    value={jobUrl}
                    onChange={handleJobUrlChange}
                    placeholder="Paste LinkedIn job URL here"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${jobDescription ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!!jobDescription}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Or, Paste Job Description Here
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  rows={4}
                  placeholder="Paste the job description here"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${jobUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!!jobUrl}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-green-50 rounded-lg flex items-center text-green-700">
            <PartyPopper className="h-5 w-5 mr-2" />
            Your resume has been successfully enhanced! You can download it from the table below.
          </div>
        )}

        {/* Submit Button */}
        <div className="mb-8">
          <button
            onClick={handleSubmit}
            disabled={isProcessing || isUploading || (!file && !jobUrl && !jobDescription) || dailyUsageCount >= maxUsage}
            className={`w-full py-4 px-6 rounded-lg text-white font-medium flex items-center justify-center space-x-2
              ${isProcessing || isUploading || dailyUsageCount >= maxUsage ? 'bg-gray-400' : 'bg-gradient-primary hover:opacity-90'} 
              transform hover:scale-[1.02] transition-all shadow-enhanced`}
          >
            {isProcessing || isUploading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{isUploading ? 'Uploading...' : 'Processing...'}</span>
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                <span>Generate Enhanced Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Usage Tracker */}
        <div className="bg-white rounded-lg shadow-enhanced p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              Daily Resume Processing Limit
            </h3>
            <span className="text-sm text-gray-600">{dailyUsageCount}/{maxUsage} resumes today</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${(dailyUsageCount / maxUsage) * 100}%`,
                backgroundColor: (dailyUsageCount / maxUsage) * 100 < 33 ? '#4ade80' : (dailyUsageCount / maxUsage) * 100 < 66 ? '#facc15' : '#f87171'
              }}
            />
          </div>
        </div>

        {/* Processed Resumes Table */}
        <div className="bg-white rounded-lg shadow-enhanced overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Processed Resumes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {processedResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{resume.jobTitle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {resume.processedAt.toDate().toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resume.pdfBlob && (
                        <button
                          onClick={() => handleDownload(resume)}
                          className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {processedResumes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No resumes processed yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
