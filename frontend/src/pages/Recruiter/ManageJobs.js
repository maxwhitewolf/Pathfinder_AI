import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getRecruiterJobs();
      setJobs(response.data);
    } catch (error) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    // Handle both "active" and "open" status for backward compatibility
    if (filter === 'open') {
      return job.status === 'open' || job.status === 'active';
    }
    return job.status === filter;
  });

  const handleCloseJob = async (jobId) => {
    try {
      setError('');
      setSuccess('');
      await jobAPI.deleteJob(jobId);
      setSuccess('Job closed successfully');
      // Refresh jobs list to get updated status
      await fetchJobs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMsg = getErrorFromResponse(error, 'Failed to close job');
      setError(errorMsg);
      console.error('Error closing job:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job.id);
    setEditFormData({
      job_title: job.job_title || job.title || '',
      company_name: job.company_name || '',
      location_city: job.location_city || '',
      location_country: job.location_country || '',
      is_remote: job.is_remote || false,
      work_type: job.work_type || 'onsite',
      job_type: job.job_type || 'full_time',
      experience_level: job.experience_level || 'fresher',
      min_experience_years: job.min_experience_years || '',
      max_experience_years: job.max_experience_years || '',
      min_salary: job.min_salary || '',
      max_salary: job.max_salary || '',
      salary_currency: job.salary_currency || 'INR',
      salary_pay_period: job.salary_pay_period || 'year',
      is_salary_visible: job.is_salary_visible !== undefined ? job.is_salary_visible : true,
      industry: job.industry || '',
      jd_text: job.jd_text || job.description || '',
      skills_required: Array.isArray(job.skills_required) ? job.skills_required : (job.skills_required ? [job.skills_required] : []),
      nice_to_have_skills: Array.isArray(job.nice_to_have_skills) ? job.nice_to_have_skills : [],
      employment_level: job.employment_level || 'entry_level',
      application_url: job.application_url || '',
      application_email: job.application_email || '',
      application_deadline: job.application_deadline || '',
      status: job.status || 'active',
      // Legacy fields for backward compatibility
      title: job.job_title || job.title || '',
      description: job.jd_text || job.description || '',
      location: job.location || '',
      salary: job.salary || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setEditFormData({});
  };

  const handleUpdateJob = async (jobId) => {
    try {
      setError('');
      setSuccess('');
      setSaving(true);
      
      // Validate required fields
      if (!editFormData.job_title || !editFormData.jd_text) {
        setError('Job title and description are required');
        setSaving(false);
        return;
      }
      
      // Prepare the update data - only send fields that are in the schema
      const updateData = {
        job_title: editFormData.job_title,
        company_name: editFormData.company_name,
        location_city: editFormData.location_city,
        location_country: editFormData.location_country,
        is_remote: editFormData.is_remote || false,
        work_type: editFormData.work_type,
        job_type: editFormData.job_type,
        experience_level: editFormData.experience_level,
        min_experience_years: editFormData.min_experience_years ? parseInt(editFormData.min_experience_years) : null,
        max_experience_years: editFormData.max_experience_years ? parseInt(editFormData.max_experience_years) : null,
        min_salary: editFormData.min_salary ? parseInt(editFormData.min_salary) : null,
        max_salary: editFormData.max_salary ? parseInt(editFormData.max_salary) : null,
        salary_currency: editFormData.salary_currency,
        salary_pay_period: editFormData.salary_pay_period,
        is_salary_visible: editFormData.is_salary_visible !== undefined ? editFormData.is_salary_visible : true,
        industry: editFormData.industry,
        jd_text: editFormData.jd_text,
        skills_required: editFormData.skills_required || [],
        nice_to_have_skills: editFormData.nice_to_have_skills || [],
        employment_level: editFormData.employment_level,
        application_url: editFormData.application_url,
        application_email: editFormData.application_email,
        application_deadline: editFormData.application_deadline || null,
        status: editFormData.status || 'active'
      };
      
      await jobAPI.updateJob(jobId, updateData);
      setSuccess('Job updated successfully');
      // Refresh jobs list to get updated data
      await fetchJobs();
      setEditingJob(null);
      setEditFormData({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating job:', error);
      const errorMsg = getErrorFromResponse(error, 'Failed to update job. Please check all required fields.');
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkillToEdit = (type) => {
    const skill = type === 'required' ? newSkill.trim() : newNiceSkill.trim();
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    
    if (skill && !editFormData[field]?.includes(skill)) {
      setEditFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), skill]
      }));
      if (type === 'required') {
        setNewSkill('');
      } else {
        setNewNiceSkill('');
      }
    }
  };

  const removeSkillFromEdit = (index, type) => {
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    setEditFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const commonSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'SQL', 'AWS', 'Docker',
    'Leadership', 'Communication', 'Project Management', 'Problem Solving',
    'Data Analysis', 'Machine Learning', 'DevOps', 'Git', 'TypeScript', 'MongoDB'
  ];

  const addCommonSkillToEdit = (skill, type) => {
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    if (!editFormData[field]?.includes(skill)) {
      setEditFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), skill]
      }));
    }
  };

  const addSkill = (skill) => {
    if (skill.trim() && !editFormData.skills_required.includes(skill.trim())) {
      setEditFormData({
        ...editFormData,
        skills_required: [...editFormData.skills_required, skill.trim()]
      });
    }
  };

  const removeSkill = (index) => {
    setEditFormData({
      ...editFormData,
      skills_required: editFormData.skills_required.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-cyan-300 mb-3">🔍 Loading Your Jobs</h3>
          <p className="text-lg text-slate-300 mb-2">Fetching your job postings</p>
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
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">Job Management Center</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-cyan-100 mb-6">
                Manage
                <span className="block bg-gradient-to-r from-cyan-300 to-cyan-400 bg-clip-text text-transparent">
                  Your Jobs
                </span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
                View, edit, and manage all your job postings in one centralized dashboard
              </p>
            </div>
            <div className="hidden lg:block">
              <Link
                to="/recruiter/create-job"
                className="group inline-flex items-center justify-center glass-card glass-card-hover text-cyan-300 border-2 border-cyan-500/40 hover:border-cyan-400 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Post New Job</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Mobile Post Job Button */}
        <div className="lg:hidden mb-6">
          <Link
            to="/recruiter/create-job"
            className="group w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25"
          >
            <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card glass-card-hover p-6 mb-8 border border-red-500/50 bg-red-500/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-300 font-medium text-lg">
                {typeof error === 'string' ? error : String(error || 'An error occurred')}
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="glass-card glass-card-hover p-6 mb-8 border border-green-500/50 bg-green-500/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-300 font-medium text-lg">
                {typeof success === 'string' ? success : String(success || 'Success')}
              </span>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="glass-card glass-card-hover p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-cyan-300">📊 Filter Jobs</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`group inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 border border-slate-500/40'
              }`}
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`group inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                filter === 'open'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                  : 'bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 border border-slate-500/40'
              }`}
            >
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Active ({jobs.filter(job => job.status === 'open' || job.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`group inline-flex items-center justify-center px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                filter === 'closed'
                  ? 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/25'
                  : 'bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 border border-slate-500/40'
              }`}
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
              </svg>
              Closed ({jobs.filter(job => job.status === 'closed').length})
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job.id} className="group glass-card glass-card-hover overflow-hidden">
                {editingJob === job.id ? (
                  // Edit Mode - Enhanced Form
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-cyan-300">✏️ Edit Job Posting</h3>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">
                              Job Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="job_title"
                              value={editFormData.job_title || ''}
                              onChange={handleEditFormChange}
                              required
                              className="input-dark w-full px-4 py-2"
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Company Name</label>
                            <input
                              type="text"
                              name="company_name"
                              value={editFormData.company_name || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">City</label>
                            <input
                              type="text"
                              name="location_city"
                              value={editFormData.location_city || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                              placeholder="e.g., Bangalore"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Country</label>
                            <input
                              type="text"
                              name="location_country"
                              value={editFormData.location_country || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                              placeholder="e.g., India"
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_remote"
                              checked={editFormData.is_remote || false}
                              onChange={handleEditFormChange}
                              className="mr-2"
                            />
                            <label className="text-sm font-medium text-cyan-300">Remote Position</label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Work Type</label>
                            <select
                              name="work_type"
                              value={editFormData.work_type || 'onsite'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="onsite">Onsite</option>
                              <option value="remote">Remote</option>
                              <option value="hybrid">Hybrid</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Job Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Job Type</label>
                            <select
                              name="job_type"
                              value={editFormData.job_type || 'full_time'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="full_time">Full Time</option>
                              <option value="part_time">Part Time</option>
                              <option value="internship">Internship</option>
                              <option value="contract">Contract</option>
                              <option value="freelance">Freelance</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Experience Level</label>
                            <select
                              name="experience_level"
                              value={editFormData.experience_level || 'fresher'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="fresher">Fresher</option>
                              <option value="junior">Junior</option>
                              <option value="mid">Mid</option>
                              <option value="senior">Senior</option>
                              <option value="lead">Lead</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Min Experience (Years)</label>
                            <input
                              type="number"
                              name="min_experience_years"
                              value={editFormData.min_experience_years || ''}
                              onChange={handleEditFormChange}
                              min="0"
                              className="input-dark w-full px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Max Experience (Years)</label>
                            <input
                              type="number"
                              name="max_experience_years"
                              value={editFormData.max_experience_years || ''}
                              onChange={handleEditFormChange}
                              min="0"
                              className="input-dark w-full px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Employment Level</label>
                            <select
                              name="employment_level"
                              value={editFormData.employment_level || 'entry_level'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="entry_level">Entry Level</option>
                              <option value="mid_level">Mid Level</option>
                              <option value="senior_level">Senior Level</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Industry</label>
                            <input
                              type="text"
                              name="industry"
                              value={editFormData.industry || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                              placeholder="e.g., Technology"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Salary Information */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Salary Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Min Salary</label>
                            <input
                              type="number"
                              name="min_salary"
                              value={editFormData.min_salary || ''}
                              onChange={handleEditFormChange}
                              min="0"
                              className="input-dark w-full px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Max Salary</label>
                            <input
                              type="number"
                              name="max_salary"
                              value={editFormData.max_salary || ''}
                              onChange={handleEditFormChange}
                              min="0"
                              className="input-dark w-full px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Currency</label>
                            <select
                              name="salary_currency"
                              value={editFormData.salary_currency || 'INR'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="INR">INR</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Pay Period</label>
                            <select
                              name="salary_pay_period"
                              value={editFormData.salary_pay_period || 'year'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="year">Per Year</option>
                              <option value="month">Per Month</option>
                              <option value="hour">Per Hour</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="is_salary_visible"
                              checked={editFormData.is_salary_visible !== undefined ? editFormData.is_salary_visible : true}
                              onChange={handleEditFormChange}
                              className="mr-2"
                            />
                            <label className="text-sm font-medium text-cyan-300">Show Salary in Listing</label>
                          </div>
                        </div>
                      </div>

                      {/* Job Description */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Job Description</h2>
                        <label className="block text-sm font-medium text-cyan-300 mb-2">
                          Full Job Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="jd_text"
                          value={editFormData.jd_text || ''}
                          onChange={handleEditFormChange}
                          required
                          rows="8"
                          className="input-dark w-full px-4 py-2"
                          placeholder="Enter the complete job description, responsibilities, requirements, etc."
                          style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                        />
                      </div>

                      {/* Skills */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Skills</h2>
                        
                        {/* Required Skills */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-cyan-300 mb-2">
                            Required Skills <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToEdit('required'))}
                              placeholder="Add required skill"
                              className="input-dark flex-1 px-4 py-2"
                              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                            />
                            <button
                              type="button"
                              onClick={() => addSkillToEdit('required')}
                              className="btn-primary px-4 py-2"
                            >
                              <span>Add</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {editFormData.skills_required?.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromEdit(index, 'required')}
                                  className="ml-2 text-red-600 hover:text-red-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {commonSkills.map(skill => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => addCommonSkillToEdit(skill, 'required')}
                                className="px-3 py-1 bg-slate-500/20 text-slate-300 border border-slate-500/40 rounded-full text-sm hover:bg-slate-500/30"
                              >
                                + {skill}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Nice to Have Skills */}
                        <div>
                          <label className="block text-sm font-medium text-cyan-300 mb-2">Nice to Have Skills</label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={newNiceSkill}
                              onChange={(e) => setNewNiceSkill(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToEdit('nice'))}
                              placeholder="Add nice-to-have skill"
                              className="input-dark flex-1 px-4 py-2"
                              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                            />
                            <button
                              type="button"
                              onClick={() => addSkillToEdit('nice')}
                              className="btn-primary px-4 py-2"
                            >
                              <span>Add</span>
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editFormData.nice_to_have_skills?.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromEdit(index, 'nice')}
                                  className="ml-2 text-green-600 hover:text-green-800"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Application Details */}
                      <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Application Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Application URL</label>
                            <input
                              type="url"
                              name="application_url"
                              value={editFormData.application_url || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                              placeholder="https://company.com/apply"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Application Email</label>
                            <input
                              type="email"
                              name="application_email"
                              value={editFormData.application_email || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                              placeholder="jobs@company.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Application Deadline</label>
                            <input
                              type="date"
                              name="application_deadline"
                              value={editFormData.application_deadline || ''}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cyan-300 mb-2">Status</label>
                            <select
                              name="status"
                              value={editFormData.status || 'active'}
                              onChange={handleEditFormChange}
                              className="input-dark w-full px-4 py-2"
                            >
                              <option value="active">Active</option>
                              <option value="closed">Closed</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary group flex items-center justify-center px-8 py-4 text-lg"
                        >
                          <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => handleUpdateJob(job.id)}
                          disabled={saving}
                          className="btn-primary group flex items-center justify-center flex-1 px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="p-8">
                    {/* Job Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
                            (job.status === 'open' || job.status === 'active')
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                              : 'bg-gradient-to-r from-gray-500 to-slate-600'
                          }`}>
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-cyan-300 mb-2 group-hover:text-cyan-200 transition-colors duration-200">{job.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                              {job.location && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {job.location}
                                </span>
                              )}
                              {job.salary && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                  </svg>
                                  {job.salary}
                                </span>
                              )}
                              {job.industry && (
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {job.industry}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                          (job.status === 'open' || job.status === 'active')
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                        }`}>
                          {(job.status === 'open' || job.status === 'active') && (
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          )}
                          {(job.status === 'open' || job.status === 'active') ? '🟢 Active' : '🔴 Closed'}
                        </span>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="glass-card glass-card-hover p-6 mb-6">
                      <h4 className="flex items-center text-lg font-bold text-cyan-300 mb-3">
                        <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Job Description
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    {/* Required Skills */}
                    <div className="glass-card glass-card-hover p-6 mb-6">
                      <h4 className="flex items-center text-lg font-bold text-cyan-300 mb-4">
                        <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Required Skills ({job.skills_required.length})
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {job.skills_required.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Job Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-cyan-500/20">
                      <span className="flex items-center text-sm text-slate-400 mb-4 sm:mb-0">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Posted on {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="btn-secondary group flex items-center justify-center px-6 py-3"
                        >
                          <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit Job</span>
                        </button>
                        {(job.status === 'open' || job.status === 'active') && (
                          <button
                            onClick={() => handleCloseJob(job.id)}
                            className="group flex items-center justify-center px-6 py-3 bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 hover:border-red-400 rounded-xl font-semibold transition-all duration-200"
                          >
                            <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Close Job</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            // Empty State
            <div className="glass-card glass-card-hover overflow-hidden">
              <div className="text-center py-16 px-8">
                <div className="w-32 h-32 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <svg className="w-16 h-16 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-cyan-300 mb-4">
                    {filter === 'all' ? '🚀 Ready to Start?' : `📭 No ${filter} jobs found`}
                  </h3>
                  <p className="text-lg text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">
                  {filter === 'all' 
                    ? "You haven't posted any jobs yet. Create your first job posting to start connecting with talented candidates."
                    : `No ${filter} jobs found. Try adjusting your filter or post a new job.`}
                </p>
                {filter === 'all' && (
                  <Link
                    to="/recruiter/create-job"
                    className="btn-primary group flex items-center justify-center px-8 py-4 text-lg"
                  >
                    <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Post Your First Job</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;