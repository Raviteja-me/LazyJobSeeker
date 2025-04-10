import React from 'react';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

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

interface ProcessedResumesProps {
  processedResumes: ProcessedResume[];
  handleDownload: (resume: ProcessedResume) => void;
}

const ProcessedResumes: React.FC<ProcessedResumesProps> = ({
  processedResumes,
  handleDownload
}) => {
  return (
    <div className="bg-white rounded-lg shadow-enhanced overflow-hidden mb-7 border border-gray-200">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
        <h2 className="text-xl font-bold text-gray-800">Your Enhanced Resumes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Date Processed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedResumes.map((resume) => (
              <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
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
                  {(resume.pdfBlob || resume.downloadUrl) && (
                    <button
                      onClick={() => handleDownload(resume)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full text-sm transition-colors"
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
                    <FileText className="h-12 w-12 text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">No resumes processed yet</p>
                    <p className="text-sm mt-1">Your enhanced resumes will appear here</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessedResumes;