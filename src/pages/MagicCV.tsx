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

// Update the ALLOWED_FILE_TYPES constant to only include PDF and text files
const ALLOWED_FILE_TYPES = [
  'application/pdf',
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
  // Add new state for CV text input
  const [cvText, setCvText] = useState('');

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

    // Check for all required elements - update to allow either file or text
    if (!file && !cvText) {
      setError('Please upload your resume or paste resume text to continue.');
      return;
    }

    if (!jobUrl && !jobDescription) {
      setError('Please provide either a job URL or job description.');
      return;
    }

    // Temporarily remove style validation since we've hidden the section
    // if (!selectedStyle) {
    //   setError('Please select a resume style to continue.');
    //   return;
    // }

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
      } else if (cvText) {
        // Send CV text as a parameter
        formData.append('cv_text', cvText);
      }
      
      if (jobUrl) {
        formData.append('url', jobUrl);
      }
      if (jobDescription) {
        formData.append('jobDescription', jobDescription);
      }
      // Add selected style to form data
      formData.append('style', selectedStyle);

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
      
      // Create new resume entry
      const newResume: TempProcessedResume = {
        id: Date.now().toString(),
        jobTitle: 'Enhanced Resume',
        processedAt: Timestamp.now(),
        status: 'completed',
        jobUrl: jobUrl,
        pdfBlob: pdfBlob
      };

      // Update local state with correct counts first
      const newDailyCount = dailyUsageCount + 1;
      const newTotalCount = usageCount + 1;
      
      // Remove this line that causes the duplicate declaration error
      // const dailyUsageRef = doc(db, 'dailyUsage', `${user.uid}_${today}`);
      
      await updateDoc(dailyUsageRef, {
        count: newDailyCount,
        lastUpdated: Timestamp.now()
      }).catch(() => {
        // If document doesn't exist, create it
        setDoc(dailyUsageRef, {
          count: 1,
          lastUpdated: Timestamp.now()
        });
      });

      // Update local state after Firestore is updated
      setProcessedResumes(prev => [newResume, ...prev]);
      setUsageCount(newTotalCount);
      setDailyUsageCount(newDailyCount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setFile(null);
      setCvText(''); // Clear CV text
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
 // ... existing imports and interfaces remain the same


  // ... existing state declarations remain the same

  // ... existing functions remain the same

  // Updated return statement with more attractive UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         
        

        {showDataNotice && (
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
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload Section - More colorful and attractive */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-enhanced p-6 transform hover:scale-[1.01] transition-all border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-purple-900">Resume Input</h2>
            </div>
            
            {/* File Upload Option - More Compact with Button */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Upload PDF Resume
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg transition-all p-3 flex items-center justify-between
                  ${dragActive ? 'border-purple-500 bg-purple-50/50' : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/50'}
                  ${file ? 'bg-green-50/30 border-green-400' : ''}`}
              >
                {file ? (
                  <div className="flex items-center space-x-2 w-full">
                    <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">{file.name}</span>
                    <button 
                      onClick={() => setFile(null)} 
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-xs text-purple-600">Drag PDF or text file here</span>
                    <label className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white text-xs py-1.5 px-4 rounded-full cursor-pointer transition-all shadow-sm">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,text/plain"
                        onChange={handleFileInput}
                      />
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-purple-500 mt-1">Only PDF files up to 5MB</p>
            </div>
            
            {/* Divider */}
            <div className="flex items-center my-3">
              <div className="flex-grow border-t border-purple-200"></div>
              <span className="mx-3 text-xs font-medium text-purple-500 uppercase">Or</span>
              <div className="flex-grow border-t border-purple-200"></div>
            </div>
            
            {/* Text Input Option */}
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">
                Paste Resume Text
              </label>
              <textarea
                placeholder="Copy and paste your resume text here..."
                className={`w-full border border-purple-200 rounded-lg p-3 text-sm text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-300 transition-all ${file ? 'opacity-50 cursor-not-allowed' : ''}`}
                rows={5}
                disabled={!!file}
                onChange={(e) => {
                  setCvText(e.target.value);
                  if (e.target.value && file) {
                    setFile(null);
                  }
                }}
                value={cvText}
              ></textarea>
              <p className="text-xs text-purple-500 mt-1">
                {file ? 'Clear the uploaded file to use text input instead' : 'Enter your resume content directly'}
              </p>
            </div>
          </div>

          {/* Job Details Section - More colorful */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-enhanced p-6 transform hover:scale-[1.01] transition-all border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-blue-900">Job Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-blue-700 mb-2">
                  Paste LinkedIn Job URL Here
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-3.5 h-5 w-5 text-blue-400" />
                  <input
                    type="text"
                    id="jobUrl"
                    value={jobUrl}
                    onChange={handleJobUrlChange}
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    className={`w-full pl-12 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all
                      ${jobDescription ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}
                    disabled={!!jobDescription}
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-blue-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-sm text-blue-500 font-medium">Or</span>
                </div>
              </div>
              <div>
                <label htmlFor="jobDescription" className="block text-sm font-medium text-blue-700 mb-2">
                  Paste Job Description Here
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  rows={4}
                  placeholder="Copy and paste the complete job description here..."
                  className={`w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all
                    ${jobUrl ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'}`}
                  disabled={!!jobUrl}
                />
              </div>
            </div>
          </div>
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

        {/* Submit Button - More attractive */}
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

        {/* Processed Resumes Table - More attractive */}
        <div className="bg-white rounded-lg shadow-enhanced overflow-hidden mb-8 border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-xl font-bold">Your Enhanced Resumes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Date Processed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-100">
                {processedResumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-indigo-50/50 transition-colors">
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
                          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full text-sm transition-colors"
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
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FileText className="h-12 w-12 text-indigo-200 mb-2" />
                        <p className="text-indigo-500 font-medium">No resumes processed yet</p>
                        <p className="text-sm mt-1">Your enhanced resumes will appear here</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Tracker - More attractive */}
        <div className="bg-gradient-to-r from-white to-indigo-50 rounded-lg shadow-enhanced p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="font-semibold text-indigo-900">
                Daily Resume Processing Limit
              </h3>
            </div>
            <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
              {dailyUsageCount}/{maxUsage} resumes today
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden shadow-inner">
            <div
              className="h-full transition-all duration-500 ease-in-out rounded-full"
              style={{
                width: `${(dailyUsageCount / maxUsage) * 100}%`,
                background: dailyUsageCount === 0 
                  ? 'linear-gradient(to right, #4ade80, #22c55e)' 
                  : dailyUsageCount === 1 
                  ? 'linear-gradient(to right, #4ade80, #22c55e)' 
                  : dailyUsageCount === 2 
                  ? 'linear-gradient(to right, #fbbf24, #f59e0b)' 
                  : 'linear-gradient(to right, #f87171, #ef4444)'
              }}
            />
          </div>
          <p className="text-xs text-indigo-500 mt-2">
            {dailyUsageCount >= maxUsage 
              ? 'You\'ve reached your daily limit. Check back tomorrow!' 
              : `You have ${maxUsage - dailyUsageCount} resume enhancements remaining today.`}
          </p>
        </div>
      </div>
    </div>
  );
}
