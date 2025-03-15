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
  AlertTriangle
} from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, updateDoc, doc } from 'firebase/firestore';
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
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Add new interface for temporary resume
interface TempProcessedResume extends ProcessedResume {
  pdfBlob?: Blob;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState('');
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
      return 'Please upload a PDF or Word document.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB.';
    }
    return null;
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

  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in to continue.');
      return;
    }

    if (!file) {
      setError('Please upload a resume first.');
      return;
    }

    if (!jobUrl) {
      setError('Please enter a job URL.');
      return;
    }

    if (usageCount >= maxUsage) {
      setError('You have reached your resume processing limit.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('url', jobUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

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
        
        // Reset form
        setFile(null);
        setJobUrl('');
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

  // Modify the table row in the return statement
  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-lg shadow-enhanced p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome{user.email ? `, ${user.email.split('@')[0]}!` : '!'}
              </h1>
              <p className="text-gray-600 mt-2">
                Upload your resume and paste a job link to get started.
              </p>
            </div>
            <Brain className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        {showDataNotice && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Important: We don't store your resume data permanently. Please make sure to download your enhanced resume, as it will only be available temporarily.
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
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileInput}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">Supported formats: PDF, Word (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Job URL Section */}
          <div className="bg-white rounded-lg shadow-enhanced p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Job URL</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Paste Job URL Here
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    id="jobUrl"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="Enter the job posting URL"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
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

        {/* Submit Button */}
        <div className="mb-8">
          <button
            onClick={handleSubmit}
            disabled={isProcessing || isUploading || !file || !jobUrl || usageCount >= maxUsage}
            className={`w-full py-4 px-6 rounded-lg text-white font-medium flex items-center justify-center space-x-2
              ${isProcessing || isUploading || usageCount >= maxUsage ? 'bg-gray-400' : 'bg-gradient-primary hover:opacity-90'} 
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
            <h3 className="font-semibold text-gray-900">Resume Processing Limit</h3>
            <span className="text-sm text-gray-600">{usageCount}/{maxUsage} resumes</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${(usageCount / maxUsage) * 100}%` }}
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