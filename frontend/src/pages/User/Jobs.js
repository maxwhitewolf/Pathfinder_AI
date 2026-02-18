import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jobAPI, aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    skills: ''
  });

  useEffect(() => {
    fetchAllJobs();
    if (activeTab === 'search') {
      fetchMatchedJobs();
    }
  }, [activeTab]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab });
    }
  }, [activeTab, setSearchParams]);

  const fetchAllJobs = async () => {
    try {
      const response = await jobAPI.getAllJobs();
      setAllJobs(response.data);
    } catch (error) {
      console.log('Failed to fetch jobs');
    }
  };

  const fetchMatchedJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.matchJobs();
      setMatchedJobs(response.data.jobs);
      if (!response.data.jobs || response.data.jobs.length === 0) {
        setError('No matching jobs found. Try uploading a resume with more details.');
      }
    } catch (error) {
      const errorMsg = getErrorFromResponse(error, 'Failed to fetch matched jobs');
      setError(errorMsg);
      
      // If the error indicates no resume, provide helpful guidance
      if (errorMsg.includes('Resume not found') || errorMsg.includes('upload a resume')) {
        setError('Please upload your resume first to get AI-powered job matches. Go to Profile → Upload Resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = allJobs.filter(job => {
    const skillsArray = Array.isArray(job.skills_required) 
      ? job.skills_required 
      : typeof job.skills_required === 'string' 
        ? job.skills_required.split(',').map(s => s.trim())
        : [];
    
    return (
      (!filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())) &&
      (!filters.skills || skillsArray.some(skill => 
        skill.toLowerCase().includes(filters.skills.toLowerCase())
      ))
    );
  });

  const JobCard = ({ job, showMatchScore = false }) => (
    <div className="group glass-card glass-card-hover p-8 relative overflow-hidden">
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-cyan-300 mb-3 group-hover:text-cyan-200 transition-colors duration-300">{job.title}</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {job.location && (
                <span className="flex items-center px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.industry && (
                <span className="flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1a1 1 0 001-1v-1h-2zm-2-1h2V9h-2v3zm-2 3h2v-2h-2v2zm-2 0h2v-2H9v2zm-2-2v2H6v-2h1zm0-1H6V9h1v3z" clipRule="evenodd" />
                  </svg>
                  {job.industry}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/40 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {job.salary}
                </span>
              )}
            </div>
            {showMatchScore && job.similarity_score && (
              <div className="mb-4">
                <span className="text-lg font-bold text-cyan-400 mr-2">
                  {(job.similarity_score * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-slate-300">Match Score</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              job.status === 'open' ? 'bg-green-500/20 text-green-300 border border-green-500/40' : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed pb-1">
          {job.description}
        </p>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-cyan-300 mb-3">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const skillsArray = Array.isArray(job.skills_required) 
                ? job.skills_required 
                : typeof job.skills_required === 'string' 
                  ? job.skills_required.split(',').map(s => s.trim())
                  : [];
              
              return skillsArray.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors duration-200"
                >
                  {skill}
                </span>
              ));
            })()}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-cyan-500/20">
          <span className="text-xs text-slate-400">
            Posted on {new Date(job.created_at).toLocaleDateString()}
          </span>
          <Link
            to={`/jobs/${job.id}`}
            className="flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
          >
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Header Section */}
      <div className="relative overflow-hidden py-16">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-cyan-300 text-sm font-medium">AI-Powered Job Search</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-cyan-100 mb-6">
            Job
            <span className="block bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Search and discover personalized job opportunities powered by AI that align with your skills, experience, and career aspirations
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Modern Tab Navigation */}
        <div className="glass-card glass-card-hover p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'search'
                  ? 'bg-cyan-500 text-black shadow-lg transform scale-105'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Jobs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-cyan-500 text-black shadow-lg transform scale-105'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Jobs</span>
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'all' && !loading && (
          <div className="mb-8 glass-card glass-card-hover p-6">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="input-dark w-full px-4 py-3"
                  placeholder="e.g., San Francisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Industry</label>
                <input
                  type="text"
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  className="input-dark w-full px-4 py-3"
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-cyan-300 mb-2">Skills</label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  className="input-dark w-full px-4 py-3"
                  placeholder="e.g., Python"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-red-300 font-medium">
                  {typeof error === 'string' ? error : String(error || 'An error occurred')}
                </p>
              </div>
              {activeTab === 'search' && (
                <button
                  onClick={fetchMatchedJobs}
                  className="ml-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {loading && activeTab === 'search' ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-cyan-300 mb-2">Finding your perfect matches...</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                Our AI is analyzing thousands of job opportunities to find the best matches for your profile
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === 'search' ? (
              matchedJobs.length > 0 ? (
                <>
                  <div className="glass-card glass-card-hover p-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h3 className="text-lg font-bold text-cyan-300 mb-2">Search Results</h3>
                        <p className="text-slate-300 leading-relaxed">
                          These opportunities are specifically selected based on your resume, skills, and academic background using our advanced Doc2Vec matching algorithm.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    {matchedJobs.map((job, index) => (
                      <JobCard key={job.id || index} job={job} showMatchScore={true} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/40">
                    <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6M9 16v-2a2 2 0 012-2h2a2 2 0 012 2v2M9 16a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">No jobs found</h3>
                  <p className="text-slate-300 max-w-md mx-auto mb-8">
                    Upload your resume and complete your profile to get personalized job matches tailored to your skills and experience.
                  </p>
                  <button
                    onClick={fetchMatchedJobs}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
                  >
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh Matches</span>
                  </button>
                </div>
              )
            ) : (
              filteredJobs.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                  {filteredJobs.map((job, index) => (
                    <JobCard key={job.id || index} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-slate-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/40">
                    <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6M9 16v-2a2 2 0 012-2h2a2 2 0 012 2v2M9 16a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">No jobs found</h3>
                  <p className="text-slate-300 max-w-md mx-auto">
                    {Object.values(filters).some(filter => filter) 
                      ? 'Try adjusting your filters to see more results.'
                      : 'No jobs are currently available. Check back later for new opportunities!'}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;