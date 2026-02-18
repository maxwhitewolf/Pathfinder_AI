import React, { useState } from 'react';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a PDF or DOC file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const response = await userAPI.uploadResume(file);
      setUploadResult(response.data);
      setFile(null);
      document.getElementById('file-input').value = '';
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to upload resume'));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(droppedFile.type)) {
        setError('Please select a PDF or DOC file');
        return;
      }
      setFile(droppedFile);
      setError('');
      setUploadResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-cyan-300 text-sm font-medium">AI-Powered Resume Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-100 mb-6">
              Upload Your
              <span className="block bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                Resume
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Let our AI analyze your resume and unlock personalized career insights, skill extraction, and job recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="glass-card glass-card-hover overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-cyan-300">Resume Analysis</h2>
                <p className="text-slate-300 mt-1">Upload your resume to unlock AI-powered career insights</p>
              </div>
            </div>

          {error && (
            <div className="glass-card glass-card-hover p-4 mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-red-300 font-medium">
                  {typeof error === 'string' ? error : String(error || 'An error occurred')}
                </span>
              </div>
            </div>
          )}

          {uploadResult && (
            <div className="glass-card glass-card-hover p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-green-300 mb-3">
                    ✨ {uploadResult.message}
                  </h3>
                  
                  {uploadResult.extraction_error && (
                    <div className="glass-card glass-card-hover p-4 mb-4">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-yellow-300 font-medium mb-1">Skill Extraction Warning</p>
                          <p className="text-yellow-200 text-sm">
                            {typeof uploadResult.extraction_error === 'string' 
                              ? uploadResult.extraction_error 
                              : String(uploadResult.extraction_error || 'Skill extraction encountered an issue')}
                          </p>
                          <p className="text-yellow-300 text-xs mt-2">You can manually add skills in your profile.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {uploadResult.extracted_skills && (
                    <div className="space-y-4">
                      <h4 className="text-base font-semibold text-green-300 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI-Extracted Skills
                      </h4>
                      
                      {uploadResult.extracted_skills.technical_skills && uploadResult.extracted_skills.technical_skills.length > 0 && (
                        <div className="glass-card glass-card-hover p-4">
                          <p className="text-sm font-semibold text-blue-300 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Technical Skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {uploadResult.extracted_skills.technical_skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                              >
                                <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {uploadResult.extracted_skills.soft_skills && uploadResult.extracted_skills.soft_skills.length > 0 && (
                        <div className="glass-card glass-card-hover p-4">
                          <p className="text-sm font-semibold text-purple-300 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Soft Skills:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {uploadResult.extracted_skills.soft_skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                              >
                                <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(!uploadResult.extracted_skills.technical_skills || uploadResult.extracted_skills.technical_skills.length === 0) &&
                       (!uploadResult.extracted_skills.soft_skills || uploadResult.extracted_skills.soft_skills.length === 0) && (
                        <div className="glass-card glass-card-hover p-4 text-center">
                          <p className="text-slate-300 text-sm mb-2">No skills were automatically extracted from your resume.</p>
                          <p className="text-slate-400 text-xs">You can manually add skills in your profile settings.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Upload Section */}
            <div className="glass-card glass-card-hover p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-cyan-300">Upload Your Resume</h3>
                  <p className="text-slate-300 mt-1">Drag & drop or click to upload • PDF, DOC, DOCX (Max: 10MB)</p>
                </div>
              </div>

              <div
                className="group relative flex justify-center px-8 py-12 border-2 border-cyan-500/40 border-dashed rounded-2xl hover:border-cyan-400 hover:bg-cyan-500/5 transition-all duration-300 cursor-pointer overflow-hidden glass-card"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative space-y-4 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg
                        className="w-12 h-12 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    
                    {/* Floating upload icons */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300">
                      Drop your resume here
                    </div>
                    <div className="flex items-center justify-center text-slate-300">
                      <span>or</span>
                      <label
                        htmlFor="file-input"
                        className="ml-2 relative cursor-pointer btn-primary px-6 py-2"
                      >
                        <span>Browse Files</span>
                        <input
                          id="file-input"
                          name="file-input"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-6 pt-4">
                    <div className="flex items-center text-sm text-cyan-300 font-medium">
                      <div className="w-6 h-6 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-red-300">PDF</span>
                      </div>
                      PDF Files
                    </div>
                    <div className="flex items-center text-sm text-cyan-300 font-medium">
                      <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/40 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-xs font-bold text-blue-300">DOC</span>
                      </div>
                      Word Files
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {file && (
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-cyan-300">{file.name}</span>
                        <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <p className="text-sm text-green-300 mt-1">
                        ✓ Ready for upload - File format validated
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      document.getElementById('file-input').value = '';
                    }}
                    className="group flex items-center px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/40 rounded-xl hover:bg-red-500/30 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            )}

            {file && (
              <div className="flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="btn-primary group flex items-center justify-center px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {uploading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      <span>Analyzing Resume...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload & Analyze Resume</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;