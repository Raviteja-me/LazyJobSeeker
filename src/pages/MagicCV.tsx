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

// Remove the WEBHOOK_URL constant and replace with:
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds

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

// Add after other interfaces
interface ResumeStyle {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

const RESUME_STYLES: ResumeStyle[] = [
  {
    id: 'blackmagic',
    name: 'Black Magic',
    description: 'Bold and sophisticated dark theme design'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional and professional layout'
  },
  {
    id: 'decor',
    name: 'Decor',
    description: 'Elegantly decorated with stylish elements'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined and graceful presentation'
  },
  {
    id: 'simple',
    name: 'Simple',
    description: 'Clean and minimalist approach'
  },
  {
    id: 'straight',
    name: 'Straight',
    description: 'Direct and structured format'
  }
];

export default function Dashboard() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  // Add selectedStyle state initialization
  const [selectedStyle, setSelectedStyle] = useState<string>('classic');
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
    
    // Extract job ID from either format
    const jobIdMatch = url.match(/(?:currentJobId=|jobs\/view\/)(\d+)/);
    if (!jobIdMatch) {
      return 'Please enter a valid LinkedIn job URL. Only LinkedIn job postings are supported at this time.';
    }
    
    return null;
  };
  
  const handleJobUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    
    // Extract job ID and transform URL to canonical format
    const jobIdMatch = url.match(/(?:currentJobId=|jobs\/view\/)(\d+)/);
    
    if (jobIdMatch) {
      const jobId = jobIdMatch[1];
      const canonicalUrl = `https://www.linkedin.com/jobs/view/${jobId}`;
      setJobUrl(canonicalUrl);
    } else {
      setJobUrl(url);
    }
    
    // Clear job description when URL is entered
    setJobDescription('');
    setError(validateLinkedInUrl(url));
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

    // Check for all required elements
    if (!file) {
      setError('Please upload your resume to continue.');
      return;
    }

    if (!jobUrl && !jobDescription) {
      setError('Please provide either a job URL or job description.');
      return;
    }

    if (!selectedStyle) {
      setError('Please select a resume style to continue.');
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
      // Add selected style to form data
      formData.append('style', selectedStyle); // This adds the selected style ID (e.g., 'blackmagic', 'elegant', etc.)

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      console.log('Sending request to webhook:', WEBHOOK_URL);
      console.log('Selected style:', selectedStyle); // Add logging for debugging
      
      // Add mode: 'cors' explicitly and credentials
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

      // Rest of your code remains the same
      const pdfBlob = await response.blob();
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Received empty response from server');
      }
      
      // Update usage count after confirming valid response
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

      // Create new resume entry
      const newResume: TempProcessedResume = {
        id: Date.now().toString(),
        jobTitle: 'Enhanced Resume',
        processedAt: Timestamp.now(),
        status: 'completed',
        jobUrl: jobUrl,
        pdfBlob: pdfBlob
      };

      setProcessedResumes(prev => [newResume, ...prev]);
      setUsageCount(prev => prev + 1);
      setDailyUsageCount(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFile(null);
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
          <div className="bg-white rounded-xl shadow-enhanced p-6 transform hover:scale-[1.01] transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-primary-50 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Upload Your Resume</h2>
            </div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl transition-all min-h-[140px] flex items-center justify-center
                ${dragActive ? 'border-primary-500 bg-primary-50/30' : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50/50'}
                ${file ? 'bg-green-50/20 border-green-400 p-4' : 'p-6'}`}
            >
              {file ? (
                <div className="w-full max-w-md mx-auto">
                  <div className="flex items-center bg-white rounded-xl p-4 border border-primary-100 hover:border-primary-200 transition-all">
                    <div className="bg-primary-50 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-primary-500 flex-shrink-0" />
                    </div>
                    <span className="text-gray-700 font-medium truncate ml-3">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="ml-auto flex items-center px-3 py-1.5 text-primary-600 hover:text-primary-700 transition-colors rounded-lg hover:bg-primary-50 text-sm"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Change
                    </button>
                  </div>
                  <div className="flex items-center justify-center mt-3">
                    <p className="text-xs text-gray-500">
                      File ready for processing
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-sm mx-auto">
                  <div className="bg-primary-50/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-primary-500" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-700 font-medium">Drag and drop your resume here, or</p>
                    <label className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 cursor-pointer transition-all hover:shadow-md">
                      <Upload className="h-4 w-4 mr-2" />
                      Browse to upload
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.odt,.txt"
                        onChange={handleFileInput}
                      />
                    </label>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-50 rounded-full">PDF</span>
                      <span className="px-2 py-1 bg-gray-50 rounded-full">DOC</span>
                      <span className="px-2 py-1 bg-gray-50 rounded-full">DOCX</span>
                      <span className="text-gray-400">Max 5MB</span>
                    </div>
                  </div>
                </div>
              )}
              {dragActive && (
                <div className="absolute inset-0 border-2 border-primary-500 rounded-xl bg-primary-50/20 flex items-center justify-center">
                  <div className="text-primary-500 font-medium">Drop your file here</div>
                </div>
              )}
            </div>
          </div>

          {/* Job Details Section */}
          <div className="bg-white rounded-xl shadow-enhanced p-8 transform hover:scale-[1.01] transition-all">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-6 w-6 text-primary-500" />
              <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste LinkedIn Job URL Here
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="jobUrl"
                    value={jobUrl}
                    onChange={handleJobUrlChange}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all
                      ${jobDescription ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'}`}
                    disabled={!!jobDescription}
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-sm text-gray-500">Or</span>
                </div>
              </div>
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Job Description Here
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  rows={4}
                  placeholder="Copy and paste the complete job description here..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-300 transition-all
                    ${jobUrl ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'}`}
                  disabled={!!jobUrl}
                />
              </div>
            </div>
          </div>
        </div>

        {/* After Job Details Section */}
              <div className="bg-white rounded-lg shadow-enhanced p-6 col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Resume Style</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {RESUME_STYLES.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all
                        ${selectedStyle === style.id 
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-50' 
                          : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{style.name}</h3>
                        {selectedStyle === style.id && (
                          <CheckCircle className="h-5 w-5 text-primary-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{style.description}</p>
                    </div>
                  ))}
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

        {/* Processed Resumes Table - Moved to top */}
        <div className="bg-white rounded-lg shadow-enhanced overflow-hidden mb-8">
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

        {/* Usage Tracker - Moved to bottom */}
        {/* Usage Tracker */}
        <div className="bg-white rounded-lg shadow-enhanced p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              Daily Resume Processing Limit
            </h3>
            <span className="text-sm text-gray-600">{dailyUsageCount}/{maxUsage} resumes today</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-in-out"
              style={{
                width: `${(dailyUsageCount / maxUsage) * 100}%`,
                backgroundColor: dailyUsageCount === 1 
                  ? '#4ade80' 
                  : dailyUsageCount === 2 
                  ? '#fbbf24' 
                  : dailyUsageCount >= 3 
                  ? '#f87171' 
                  : '#4ade80'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
