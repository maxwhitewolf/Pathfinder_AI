import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills_required: [],
    location: '',
    salary: '',
    industry: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.skills_required.length === 0) {
      setError('Please add at least one required skill');
      setLoading(false);
      return;
    }

    try {
      await jobAPI.createJob(formData);
      setSuccess('Job posted successfully!');
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 2000);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to create job posting'));
    } finally {
      setLoading(false);
    }
  };

  const commonSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'SQL', 'AWS', 'Docker',
    'Leadership', 'Communication', 'Project Management', 'Problem Solving',
    'Data Analysis', 'Machine Learning', 'DevOps', 'Git'
  ];

  const addCommonSkill = (skill) => {
    if (!formData.skills_required.includes(skill)) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skill]
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-cyan-200 text-sm font-medium">Post New Position</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Create Job
              <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Posting
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Attract top talent with detailed job descriptions and AI-powered candidate matching
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="glass-card glass-card-hover overflow-hidden">
          <div className="px-8 py-10">
            {/* Header */}
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-cyan-300">🚀 Post New Job</h2>
                <p className="text-slate-300 mt-1">Create a detailed job posting to attract the right candidates</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error/Success Messages */}
              {error && (
                <div className="glass-card glass-card-hover p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-red-300 font-medium">
                      {typeof error === 'string' ? error : String(error || 'An error occurred')}
                    </span>
                  </div>
                </div>
              )}

              {success && (
                <div className="glass-card glass-card-hover p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-green-300 font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* Basic Information Section */}
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">📄 Basic Information</h3>
                </div>

                <div className="space-y-6">
                  {/* Job Title */}
                  <div>
                    <label htmlFor="title" className="flex items-center text-sm font-semibold text-cyan-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                      </svg>
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="input-dark block w-full px-4 py-4 text-lg"
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  {/* Job Description */}
                  <div>
                    <label htmlFor="description" className="flex items-center text-sm font-semibold text-cyan-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Job Description *
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={8}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="input-dark block w-full px-4 py-4 text-lg resize-none"
                      placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting..."
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    />
                    <div className="mt-2 text-sm text-slate-400">
                      {formData.description.length}/2000 characters
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details Section */}
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">🏢 Job Details</h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="flex items-center text-sm font-semibold text-cyan-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="input-dark block w-full px-4 py-4 text-lg"
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label htmlFor="salary" className="flex items-center text-sm font-semibold text-cyan-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Salary Range
                    </label>
                    <input
                      type="text"
                      name="salary"
                      id="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="input-dark block w-full px-4 py-4 text-lg"
                      placeholder="e.g., $80,000 - $120,000"
                    />
                  </div>

                  {/* Industry */}
                  <div className="md:col-span-2">
                    <label htmlFor="industry" className="flex items-center text-sm font-semibold text-cyan-300 mb-2">
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Industry
                    </label>
                    <select
                      name="industry"
                      id="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="input-dark block w-full px-4 py-4 text-lg"
                    >
                      <option value="">Select an industry</option>
                      <option value="Technology">🔬 Technology</option>
                      <option value="Healthcare">🏥 Healthcare</option>
                      <option value="Finance">💼 Finance</option>
                      <option value="Education">🎓 Education</option>
                      <option value="Marketing">📢 Marketing</option>
                      <option value="Manufacturing">🏭 Manufacturing</option>
                      <option value="Retail">🛍️ Retail</option>
                      <option value="Consulting">💡 Consulting</option>
                      <option value="Other">🌟 Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">⚡ Required Skills</h3>
                </div>

                <div className="space-y-6">
                  {/* Added Skills */}
                  {formData.skills_required.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-300 mb-3">Added Skills:</h4>
                      <div className="flex flex-wrap gap-3">
                        {formData.skills_required.map((skill, index) => (
                          <span
                            key={index}
                            className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(index)}
                              className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 group-hover:scale-110 transition-all duration-200"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Skill */}
                  <div>
                    <h4 className="text-sm font-semibold text-cyan-300 mb-3">Add Custom Skill:</h4>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="block w-full border-2 border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter a required skill"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addSkill}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Common Skills */}
                  <div className="glass-card glass-card-hover p-4">
                    <h4 className="text-sm font-semibold text-cyan-300 mb-4 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      💡 Quick Add - Common Skills:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {commonSkills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addCommonSkill(skill)}
                          disabled={formData.skills_required.includes(skill)}
                          className={`text-sm px-3 py-2 rounded-xl border-2 transition-all duration-200 ${
                            formData.skills_required.includes(skill)
                              ? 'bg-black/20 text-slate-500 border-cyan-500/20 cursor-not-allowed'
                              : 'bg-black/40 border-cyan-500/40 text-cyan-300 hover:border-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:scale-105 shadow-sm hover:shadow-lg'
                          }`}
                        >
                          {skill}
                          {formData.skills_required.includes(skill) && (
                            <svg className="w-4 h-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Preview */}
              <div className="glass-card glass-card-hover p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-300">👀 Job Preview</h3>
                </div>
                <div className="glass-card glass-card-hover p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-400">Title:</span>
                      <p className="text-lg font-bold text-cyan-300">{formData.title || 'Job Title'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-400">Location:</span>
                      <p className="text-lg font-bold text-cyan-300">{formData.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-400">Salary:</span>
                      <p className="text-lg font-bold text-cyan-300">{formData.salary || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-400">Industry:</span>
                      <p className="text-lg font-bold text-cyan-300">{formData.industry || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-400">Skills ({formData.skills_required.length}):</span>
                    <div className="mt-2">
                      {formData.skills_required.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills_required.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No skills added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/dashboard')}
                  className="btn-secondary group inline-flex items-center justify-center px-8 py-4 text-lg"
                  disabled={loading}
                >
                  <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary group flex items-center justify-center flex-1 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      <span>Posting Job...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Post Job</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 glass-card glass-card-hover p-8">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
              <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center">
                <span className="mr-3">💡</span>
                Tips for Better Job Postings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/40 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-cyan-300 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300">Be Specific</h4>
                      <p className="text-slate-300 text-sm">Clearly define the role and required skills to attract the right candidates.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-green-300 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300">Clear Responsibilities</h4>
                      <p className="text-slate-300 text-sm">Include detailed job responsibilities and growth opportunities.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/40 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-300 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300">Company Culture</h4>
                      <p className="text-slate-300 text-sm">Highlight your company culture, benefits, and what makes you unique.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-yellow-300 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300">SEO Keywords</h4>
                      <p className="text-slate-300 text-sm">Use relevant keywords to improve discoverability on job boards.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-red-500/20 border border-red-500/40 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-red-300 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300">Experience Level</h4>
                      <p className="text-slate-300 text-sm">Specify required experience level and any preferred qualifications.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-indigo-500/20 border border-indigo-500/40 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-indigo-300 font-bold text-sm">6</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-300">AI Matching</h4>
                      <p className="text-slate-300 text-sm">Our AI will match your posting with candidates based on skills and interests.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;