import React from 'react';
import { Brain, Link as LinkIcon } from 'lucide-react';

interface JobDetailsProps {
  jobUrl: string;
  setJobUrl: (url: string) => void;
  jobDescription: string;
  setJobDescription: (description: string) => void;
  setError: (error: string) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({
  jobUrl,
  setJobUrl,
  jobDescription,
  setJobDescription,
  setError
}) => {
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

  return (
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
  );
};

export default JobDetails;