import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const JobMatching = () => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatchedJobs();
  }, []);

  const fetchMatchedJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.matchJobs();
      setMatchedJobs(response.data.jobs || []);
      if (!response.data.jobs || response.data.jobs.length === 0) {
        setError('No matching jobs found. Try uploading a resume with more details or completing your profile.');
      }
    } catch (error) {
      const errorMsg = getErrorFromResponse(error, 'Failed to fetch matched jobs');
      setError(errorMsg);
      
      // If the error indicates no resume, provide helpful guidance
      if (errorMsg.includes('Resume not found') || errorMsg.includes('upload a resume') || errorMsg.includes('Profile not found')) {
        setError('Please complete your profile and upload your resume first to get AI-powered job matches. Go to Profile → Upload Resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const JobCard = ({ job, index }) => (
    <Link to={`/jobs/${job.job_id}`} className="group block">
      <div className="glass-card glass-card-hover p-8 relative overflow-hidden">
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300">
                  {job.job_title || job.title || 'Untitled Job'}
                </h3>
                {job.match_score && (
                  <span className="px-3 py-1 bg-cyan-500 text-black rounded-full text-sm font-bold shadow-lg">
                    {job.match_score.toFixed(1)}% Match
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-300 mb-4">{job.company_name || 'Company Not Specified'}</p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {(job.location_city || job.location_country || job.location) && (
                  <span className="flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-200 border border-cyan-500/40 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {job.location_city && job.location_country 
                      ? `${job.location_city}, ${job.location_country}`
                      : job.location || `${job.location_city || ''} ${job.location_country || ''}`.trim()}
                    {job.is_remote && ' (Remote)'}
                  </span>
                )}
                {job.industry && (
                  <span className="flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-200 border border-cyan-500/40 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1a1 1 0 001-1v-1h-2zm-2-1h2V9h-2v3zm-2 3h2v-2h-2v2zm-2 0h2v-2H9v2zm-2-2v2H6v-2h1zm0-1H6V9h1v3z" clipRule="evenodd" />
                    </svg>
                    {job.industry}
                  </span>
                )}
                {job.experience_level && (
                  <span className="flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-200 border border-cyan-500/40 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                  </span>
                )}
                {job.skill_match_percentage > 0 && (
                  <span className="flex items-center px-3 py-1 bg-cyan-500/10 text-cyan-200 border border-cyan-500/40 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {job.skill_match_percentage.toFixed(0)}% Skills Match
                  </span>
                )}
              </div>

              {job.similarity_score && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-cyan-300">Match Score:</span>
                    <div className="flex-1 bg-black/40 border border-cyan-500/30 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
                        style={{ width: `${Math.min(job.match_score || job.similarity_score * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-cyan-300">
                      {job.match_score ? job.match_score.toFixed(1) : (job.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed pb-1">
            {job.description || job.jd_text || 'No description available.'}
          </p>

          {job.skills_required && (Array.isArray(job.skills_required) ? job.skills_required.length > 0 : true) && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-cyan-300 mb-3">Required Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(job.skills_required) ? (
                  job.skills_required.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                        job.matching_skills && job.matching_skills.includes(skill)
                          ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                          : 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/40'
                      }`}
                    >
                      {skill}
                      {job.matching_skills && job.matching_skills.includes(skill) && (
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-200 border border-cyan-500/40">
                    {job.skills_required}
                  </span>
                )}
                {Array.isArray(job.skills_required) && job.skills_required.length > 6 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/40">
                    +{job.skills_required.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-cyan-500/20">
            <span className="text-xs text-slate-400">
              {job.match_score && `Match Score: ${job.match_score.toFixed(1)}%`}
              {job.similarity_score && !job.match_score && `Similarity: ${(job.similarity_score * 100).toFixed(1)}%`}
            </span>
            <span className="btn-primary px-6 py-2 text-sm font-medium transition-all duration-300 transform group-hover:scale-105">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Header Section */}
      <div className="relative overflow-hidden py-16">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-cyan-300 text-sm font-medium">AI-Powered Job Matching</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-cyan-100 mb-6">
            Job
            <span className="block bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent">
              Matching
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover personalized job matches powered by AI that align with your skills, experience, and career aspirations
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Action Bar */}
        <div className="glass-card glass-card-hover p-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={fetchMatchedJobs}
                disabled={loading}
                className="btn-primary px-6 py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Matching...' : 'Refresh Matches'}</span>
              </button>
              <Link
                to="/jobs"
                className="btn-secondary px-6 py-3 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Browse All Jobs</span>
              </Link>
            </div>
            {matchedJobs.length > 0 && (
              <div className="text-cyan-300 font-medium">
                Found <span className="text-cyan-400 font-bold">{matchedJobs.length}</span> matching jobs
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card glass-card-hover p-6 mb-8 border-red-500/40">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-red-300 font-semibold mb-2">Unable to Match Jobs</h3>
                <p className="text-red-200">
                  {typeof error === 'string' ? error : String(error || 'An error occurred')}
                </p>
                {error.includes('resume') || error.includes('profile') && (
                  <Link
                    to="/profile"
                    className="mt-4 inline-block px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
                  >
                    Go to Profile →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="mt-6 text-slate-300 text-lg">Analyzing your profile and matching jobs...</p>
          </div>
        ) : (
          <>
            {/* Matched Jobs */}
            {matchedJobs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-cyan-300">Your Matched Jobs</h3>
                  <span className="text-sm text-slate-400">Sorted by match score</span>
                </div>
                {matchedJobs.map((job, index) => (
                  <JobCard key={job.job_id || index} job={job} index={index} />
                ))}
              </div>
            ) : !error ? (
              <div className="glass-card glass-card-hover p-12 text-center">
                <div className="w-20 h-20 bg-cyan-500/20 border border-cyan-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-cyan-300 mb-4">No matching jobs found</h3>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                  We couldn't find jobs that match your profile. Try completing your profile, uploading a resume, or browse all available jobs.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={fetchMatchedJobs}
                    className="btn-primary px-6 py-3"
                  >
                    <span>Try Again</span>
                  </button>
                  <Link
                    to="/jobs"
                    className="btn-secondary px-6 py-3"
                  >
                    <span>Browse All Jobs</span>
                  </Link>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default JobMatching;


