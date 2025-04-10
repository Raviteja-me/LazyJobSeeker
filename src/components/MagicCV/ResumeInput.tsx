import React, { useCallback } from 'react';
import { Upload, FileText, XCircle } from 'lucide-react';

interface ResumeInputProps {
  file: File | null;
  setFile: (file: File | null) => void;
  cvText: string;
  setCvText: (text: string) => void;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  setError: (error: string) => void;
}

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ResumeInput: React.FC<ResumeInputProps> = ({
  file,
  setFile,
  cvText,
  setCvText,
  dragActive,
  setDragActive,
  setError
}) => {
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Please upload only PDF files. Other document types are not supported at this time.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB.';
    }
    return null;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [setDragActive]);

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
  }, [setDragActive, setError, setFile]);

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

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-enhanced p-6 transform hover:scale-[1.01] transition-all border border-purple-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-purple-500 p-2 rounded-lg">
          <Upload className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-purple-900">Resume Input</h2>
      </div>
      
      {/* File Upload Option */}
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
  );
};

export default ResumeInput;