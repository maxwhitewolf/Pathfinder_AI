import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const Analysis = () => {
  const [skillGapData, setSkillGapData] = useState(null);
  const [strengthsWeaknessesData, setStrengthsWeaknessesData] = useState(null);
  const [activeTab, setActiveTab] = useState('skill-gap');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSkills, setExpandedSkills] = useState(new Set());

  useEffect(() => {
    if (activeTab === 'skill-gap') {
      fetchSkillGapAnalysis();
    } else {
      fetchStrengthsWeaknesses();
    }
  }, [activeTab]);

  const fetchSkillGapAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.skillGapAnalysis();
      setSkillGapData(response.data);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch skill gap analysis'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStrengthsWeaknesses = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.strengthsWeaknesses();
      setStrengthsWeaknessesData(response.data);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch strengths and weaknesses analysis'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSkillExpansion = (index) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const SkillGapAnalysis = () => (
    <div className="space-y-8">
      {skillGapData ? (
        <>
          <div className="glass-card glass-card-hover p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-black" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h3 className="text-lg font-bold text-cyan-300 mb-2">AI-Powered Skill Gap Analysis</h3>
                <p className="text-slate-300 leading-relaxed">
                  Our advanced algorithms compare your current skills with industry requirements for your target career path, identifying precise areas for development and growth opportunities.
                </p>
              </div>
            </div>
          </div>

          {skillGapData.current_skills && (
            <div className="group glass-card glass-card-hover p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-cyan-300">Your Current Skills</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {skillGapData.current_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500/10 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-500/20 transition-colors duration-200"
                  >
                    {typeof skill === 'object' ? (skill.skill || skill.name || JSON.stringify(skill)) : skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Develop - Full Width Horizontal Layout */}
          {skillGapData.missing_skills && skillGapData.missing_skills.length > 0 && (
            <div className="w-full">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-200">Skills to Develop</h3>
              </div>
              
              {/* Desktop: Grid layout, Mobile: Horizontal scroll */}
              <div className="w-full">
                {/* Desktop: Grid with 2 columns - Full content visible */}
                <div className="hidden md:grid md:grid-cols-2 gap-6">
                  {skillGapData.missing_skills.map((skill, index) => (
                    <div key={index} className="glass-card glass-card-hover p-6 w-full flex flex-col">
                      {typeof skill === 'object' ? (
                        <>
                          <h4 className="font-bold text-slate-200 text-lg mb-4 leading-tight">
                            {skill.skill || skill.name || 'Unknown Skill'}
                          </h4>
                          {skill.reason && (
                            <p className="text-slate-200 mb-4 leading-relaxed text-sm flex-grow whitespace-pre-wrap">
                              {skill.reason}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {skill.priority && (
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                skill.priority === 'High' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' :
                                skill.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                                'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                              }`}>
                                {skill.priority} Priority
                              </span>
                            )}
                            {skill.learning_time_weeks && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200">
                                📅 {skill.learning_time_weeks} weeks
                              </span>
                            )}
                            {skill.difficulty && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                📊 {skill.difficulty}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200/50">
                          {skill}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile: 2 columns grid - Full content visible */}
                <div className="md:hidden grid grid-cols-2 gap-4">
                  {skillGapData.missing_skills.map((skill, index) => (
                    <div key={index} className="glass-card glass-card-hover p-4 w-full flex flex-col">
                      {typeof skill === 'object' ? (
                        <>
                          <h4 className="font-bold text-slate-200 text-sm mb-3 leading-tight">
                            {skill.skill || skill.name || 'Unknown Skill'}
                          </h4>
                          {skill.reason && (
                            <p className="text-slate-200 mb-3 leading-relaxed text-xs flex-grow whitespace-pre-wrap">
                              {skill.reason}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-auto">
                            {skill.priority && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                skill.priority === 'High' ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200' :
                                skill.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200' :
                                'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                              }`}>
                                {skill.priority}
                              </span>
                            )}
                            {skill.learning_time_weeks && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200">
                                📅 {skill.learning_time_weeks}w
                              </span>
                            )}
                            {skill.difficulty && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                📊 {skill.difficulty}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200/50">
                          {skill}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skillGapData.recommendations && (
            <div className="glass-card glass-card-hover p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Recommendations</h3>
              <div className="prose max-w-none">
                {typeof skillGapData.recommendations === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: skillGapData.recommendations.replace(/\n/g, '<br>') }} />
                ) : (
                  <div>{JSON.stringify(skillGapData.recommendations, null, 2)}</div>
                )}
              </div>
            </div>
          )}

          {skillGapData.learning_path && (
            <div className="glass-card glass-card-hover p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Suggested Learning Path</h3>
              <div className="prose max-w-none">
                {typeof skillGapData.learning_path === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: skillGapData.learning_path.replace(/\n/g, '<br>') }} />
                ) : (
                  <div>{JSON.stringify(skillGapData.learning_path, null, 2)}</div>
                )}
              </div>
            </div>
          )}

          {skillGapData.priority_skills && Array.isArray(skillGapData.priority_skills) && (
            <div className="glass-card glass-card-hover p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Priority Skills</h3>
              <div className="space-y-3">
                {skillGapData.priority_skills.map((skill, index) => {
                  const priorityIndex = `priority-${index}`;
                  const isExpanded = expandedSkills.has(priorityIndex);
                  const reason = (typeof skill === 'object' && skill.reason) ? skill.reason : '';
                  const shouldTruncate = reason.length > 150;
                  const displayReason = shouldTruncate && !isExpanded 
                    ? reason.substring(0, 150) + '...' 
                    : reason;

                  return (
                    <div key={index} className="glass-card glass-card-hover p-4">
                      <h4 className="font-medium text-slate-200">
                        {typeof skill === 'object' ? (skill.skill || skill.name || 'Unknown Skill') : skill}
                      </h4>
                      {typeof skill === 'object' && skill.reason && (
                        <>
                          <p className="text-sm text-slate-200 mt-1 leading-relaxed whitespace-pre-wrap">
                            {displayReason}
                          </p>
                          {shouldTruncate && (
                            <button
                              onClick={() => toggleSkillExpansion(priorityIndex)}
                              className="text-cyan-400 hover:text-cyan-300 text-xs font-medium mt-2 transition-colors duration-200 flex items-center gap-1"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Read Less</span>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <span>Read More</span>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {typeof skill === 'object' && skill.priority && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            skill.priority === 'High' ? 'bg-red-100 text-red-800' :
                            skill.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {skill.priority} Priority
                          </span>
                        )}
                        {typeof skill === 'object' && skill.learning_time_weeks && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {skill.learning_time_weeks} weeks
                          </span>
                        )}
                        {typeof skill === 'object' && skill.difficulty && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {skill.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No analysis available</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete your profile and get career recommendations to see your skill gap analysis.
          </p>
        </div>
      )}
    </div>
  );

  const StrengthsWeaknesses = () => (
    <div className="space-y-6">
      {strengthsWeaknessesData ? (
        <>
          <div className="glass-card glass-card-hover border-l-4 border-cyan-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-200 leading-relaxed">
                  <strong className="text-cyan-300">Strengths & Weaknesses Analysis:</strong> AI-powered insights into your profile to help you understand your competitive advantages and areas for improvement.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {strengthsWeaknessesData.strengths && (
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-200">Your Strengths</h3>
                </div>
                <div className="space-y-3">
                  {Array.isArray(strengthsWeaknessesData.strengths) ? (
                    strengthsWeaknessesData.strengths.map((strength, index) => (
                      <div key={index} className="border-l-4 border-green-400 pl-4 py-3 bg-green-500/10 glass-card">
                        {typeof strength === 'object' ? (
                          <>
                            <h4 className="font-medium text-green-200 mb-2">{strength.area}</h4>
                            <p className="text-sm text-slate-200 leading-relaxed">{strength.description}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-200 leading-relaxed">{strength}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="prose max-w-none text-slate-200">
                      <div className="text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: strengthsWeaknessesData.strengths.replace(/\n/g, '<br>') }} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {strengthsWeaknessesData.weaknesses && (
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-orange-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-200">Areas for Improvement</h3>
                </div>
                <div className="space-y-3">
                  {Array.isArray(strengthsWeaknessesData.weaknesses) ? (
                    strengthsWeaknessesData.weaknesses.map((weakness, index) => (
                      <div key={index} className="border-l-4 border-orange-400 pl-4 py-3 bg-orange-500/10 glass-card">
                        {typeof weakness === 'object' ? (
                          <>
                            <h4 className="font-medium text-orange-200 mb-2">{weakness.area}</h4>
                            <p className="text-sm text-slate-200 leading-relaxed">{weakness.description}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-200 leading-relaxed">{weakness}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="prose max-w-none text-slate-200">
                      <div className="text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: strengthsWeaknessesData.weaknesses.replace(/\n/g, '<br>') }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {strengthsWeaknessesData.recommendations && (
            <div className="glass-card glass-card-hover p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Improvement Recommendations</h3>
              <div className="prose max-w-none">
                {typeof strengthsWeaknessesData.recommendations === 'string' ? (
                  <div className="text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: strengthsWeaknessesData.recommendations.replace(/\n/g, '<br>') }} />
                ) : (
                  <div className="text-slate-200">{JSON.stringify(strengthsWeaknessesData.recommendations, null, 2)}</div>
                )}
              </div>
            </div>
          )}

          {strengthsWeaknessesData.action_plan && (
            <div className="glass-card glass-card-hover p-6">
              <h3 className="text-lg font-medium text-slate-200 mb-4">Action Plan</h3>
              <div className="prose max-w-none">
                {typeof strengthsWeaknessesData.action_plan === 'string' ? (
                  <div className="text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: strengthsWeaknessesData.action_plan.replace(/\n/g, '<br>') }} />
                ) : (
                  <div className="text-slate-200">{JSON.stringify(strengthsWeaknessesData.action_plan, null, 2)}</div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-200">No analysis available</h3>
          <p className="mt-2 text-sm text-slate-300">
            Complete your profile to get personalized strengths and weaknesses analysis.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-cyan-200 text-sm font-medium">AI-Powered Career Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Career
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Analysis
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Deep AI insights into your career profile, skill gaps, and personalized development recommendations
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">

        {/* Modern Tab Navigation */}
        <div className="glass-card glass-card-hover p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('skill-gap')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'skill-gap'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                </svg>
                <span>Skill Gap Analysis</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('strengths-weaknesses')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'strengths-weaknesses'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Strengths & Weaknesses</span>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-red-800 font-medium">
                  {typeof error === 'string' ? error : String(error || 'An error occurred')}
                </p>
              </div>
              <button
                onClick={activeTab === 'skill-gap' ? fetchSkillGapAnalysis : fetchStrengthsWeaknesses}
                className="ml-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-200 mb-2">Analyzing your profile...</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                {activeTab === 'skill-gap' 
                  ? 'Our AI is identifying skill gaps and development areas to accelerate your career growth' 
                  : 'Evaluating your strengths and weaknesses to provide personalized insights'}
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'skill-gap' ? <SkillGapAnalysis /> : <StrengthsWeaknesses />}
          </>
        )}
      </div>
    </div>
  );
};

export default Analysis;