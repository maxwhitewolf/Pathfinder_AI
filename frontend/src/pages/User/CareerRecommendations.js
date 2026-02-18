import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';
import { filterValidCareers } from '../../utils/dataValidator';

const CareerRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.recommendCareers();
      // Ensure we only set valid career objects
      if (response?.data?.careers && Array.isArray(response.data.careers)) {
        const validCareers = filterValidCareers(response.data.careers);
        setRecommendations(validCareers);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch recommendations'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-cyan-300 mb-3">🔮 Analyzing Your Profile</h3>
          <p className="text-lg text-slate-300 mb-2">Our AI is crafting personalized career recommendations</p>
          <p className="text-sm text-slate-400">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-cyan-300 text-sm font-medium">AI-Powered Career Insights</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-100 mb-6">
              Your Career
              <span className="block bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                Recommendations
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Discover personalized career paths powered by advanced AI analysis of your skills, interests, and academic background
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-red-300 font-medium">
                  {typeof error === 'string' ? error : String(error || 'An error occurred')}
                </span>
              </div>
              <button
                onClick={fetchRecommendations}
                className="flex items-center justify-center btn-primary px-4 py-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="space-y-8">
            {/* AI Insights Info Card */}
            <div className="glass-card glass-card-hover p-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Career Analysis Results
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our advanced AI has analyzed your <strong>skills</strong>, <strong>academic performance</strong>, and <strong>career interests</strong> to generate these personalized recommendations. 
                    Higher similarity scores indicate stronger career matches based on your unique profile.
                  </p>
                </div>
              </div>
            </div>

            {/* Career Recommendations Grid */}
            <div className="space-y-6">
              {recommendations.map((career, index) => (
                <div key={index} className="group glass-card glass-card-hover overflow-hidden">
                  {/* Card Header with Match Score */}
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                    <div className="relative flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                            </svg>
                          </div>
                          {typeof career.similarity_score === 'number' && (
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                              career.similarity_score >= 80 
                              ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                                : career.similarity_score >= 60 
                              ? 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30' 
                              : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                          }`}>
                              <span className={`w-2 h-2 ${career.similarity_score >= 80 ? 'bg-green-400' : career.similarity_score >= 60 ? 'bg-yellow-400' : 'bg-gray-400'} rounded-full mr-2 animate-pulse`}></span>
                              {career.similarity_score >= 80 
                              ? '🏆 Excellent Match' 
                                : career.similarity_score >= 60 
                              ? '⭐ Good Match' 
                              : '💡 Potential Match'}
                          </span>
                          )}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                          {career.career}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-4xl font-bold text-white/90 mb-1">
                          {typeof career.similarity_score === 'number' ? career.similarity_score.toFixed(1) : 'N/A'}%
                        </div>
                        <div className="text-white/70 text-sm font-medium">Match Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-8">
                    {/* Required Skills */}
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-200">Required Skills</h4>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {career.required_skills && Array.isArray(career.required_skills) && career.required_skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="group/skill inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2 group-hover/skill:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {typeof skill === 'string' ? skill : String(skill)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Career Information */}
                    <div className="glass-card glass-card-hover p-6 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-300">Career Field</div>
                            <div className="text-lg font-bold text-slate-100">
                              {career.career.includes('Data') ? 'Data & Analytics' :
                               career.career.includes('Software') || career.career.includes('Developer') ? 'Software Development' :
                               career.career.includes('AI') || career.career.includes('Machine Learning') ? 'AI & ML' :
                               career.career.includes('Cyber') || career.career.includes('Security') ? 'Cybersecurity' :
                               career.career.includes('Product') ? 'Product Management' :
                               career.career.includes('DevOps') || career.career.includes('Cloud') ? 'DevOps & Cloud' :
                               'Technology'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-300">Experience Level</div>
                            <div className="text-lg font-bold text-slate-100">Entry to Mid-level</div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="glass-card glass-card-hover overflow-hidden">
            <div className="text-center py-16 px-8">
              <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">🤔 No Recommendations Yet</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Complete your profile with <strong>skills</strong>, <strong>academic details</strong>, and <strong>career interests</strong> to unlock personalized AI-powered career recommendations tailored just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={fetchRecommendations}
                  className="group flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Get My Recommendations</span>
                </button>
                <a
                  href="/profile"
                  className="group flex items-center justify-center border-2 border-cyan-500/60 text-cyan-300 hover:bg-cyan-500/10 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Complete Profile</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerRecommendations;