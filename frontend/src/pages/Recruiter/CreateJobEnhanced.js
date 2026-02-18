import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const CreateJobEnhanced = () => {
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    location_city: '',
    location_country: '',
    is_remote: false,
    work_type: 'onsite',
    job_type: 'full_time',
    experience_level: 'fresher',
    min_experience_years: '',
    max_experience_years: '',
    min_salary: '',
    max_salary: '',
    salary_currency: 'INR',
    salary_pay_period: 'year',
    is_salary_visible: true,
    industry: '',
    jd_text: '',
    skills_required: [],
    nice_to_have_skills: [],
    employment_level: 'entry_level',
    application_url: '',
    application_email: '',
    application_deadline: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkill = (type) => {
    const skill = type === 'required' ? newSkill.trim() : newNiceSkill.trim();
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    
    if (skill && !formData[field].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], skill]
      }));
      if (type === 'required') {
        setNewSkill('');
      } else {
        setNewNiceSkill('');
      }
    }
  };

  const removeSkill = (index, type) => {
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.job_title.trim()) {
      setError('Job title is required');
      setLoading(false);
      return;
    }
    if (!formData.jd_text.trim() || formData.jd_text.trim().length < 10) {
      setError('Job description must be at least 10 characters');
      setLoading(false);
      return;
    }
    if (formData.skills_required.length === 0) {
      setError('Please add at least one required skill');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        min_experience_years: formData.min_experience_years ? parseInt(formData.min_experience_years) : null,
        max_experience_years: formData.max_experience_years ? parseInt(formData.max_experience_years) : null,
        min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
        max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
        application_deadline: formData.application_deadline || null,
      };

      await jobAPI.createJobEnhanced(submitData);
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
    'Data Analysis', 'Machine Learning', 'DevOps', 'Git', 'TypeScript', 'MongoDB'
  ];

  const addCommonSkill = (skill, type) => {
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    if (!formData[field].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], skill]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-lg shadow-cyan-500/10 p-8 transition-all duration-300 hover:border-cyan-400 hover:shadow-cyan-500/40 hover:scale-[1.01]">
          <h1 className="text-3xl font-semibold text-cyan-300 mb-2">Create New Job Posting</h1>
          <p className="text-slate-100 mb-6">Fill in all the details to post your job</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-300">
                {typeof error === 'string' ? error : String(error || 'An error occurred')}
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6">
              <p className="text-green-300">
                {typeof success === 'string' ? success : String(success || 'Success')}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    required
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="e.g., Senior Software Engineer"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">City</label>
                  <input
                    type="text"
                    name="location_city"
                    value={formData.location_city}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="e.g., Bangalore"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Country</label>
                  <input
                    type="text"
                    name="location_country"
                    value={formData.location_country}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="e.g., India"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_remote"
                    checked={formData.is_remote}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4 accent-cyan-500"
                  />
                  <label className="text-sm font-medium text-cyan-300">Remote Position</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Work Type</label>
                  <select
                    name="work_type"
                    value={formData.work_type}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  >
                    <option value="onsite" className="bg-black text-cyan-100">Onsite</option>
                    <option value="remote" className="bg-black text-cyan-100">Remote</option>
                    <option value="hybrid" className="bg-black text-cyan-100">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Job Type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  >
                    <option value="full_time" className="bg-black text-cyan-100">Full Time</option>
                    <option value="part_time" className="bg-black text-cyan-100">Part Time</option>
                    <option value="internship" className="bg-black text-cyan-100">Internship</option>
                    <option value="contract" className="bg-black text-cyan-100">Contract</option>
                    <option value="freelance" className="bg-black text-cyan-100">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Experience Level</label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  >
                    <option value="fresher" className="bg-black text-cyan-100">Fresher</option>
                    <option value="junior" className="bg-black text-cyan-100">Junior</option>
                    <option value="mid" className="bg-black text-cyan-100">Mid</option>
                    <option value="senior" className="bg-black text-cyan-100">Senior</option>
                    <option value="lead" className="bg-black text-cyan-100">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Min Experience (Years)</label>
                  <input
                    type="number"
                    name="min_experience_years"
                    value={formData.min_experience_years}
                    onChange={handleChange}
                    min="0"
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Max Experience (Years)</label>
                  <input
                    type="number"
                    name="max_experience_years"
                    value={formData.max_experience_years}
                    onChange={handleChange}
                    min="0"
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Employment Level</label>
                  <select
                    name="employment_level"
                    value={formData.employment_level}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  >
                    <option value="entry_level" className="bg-black text-cyan-100">Entry Level</option>
                    <option value="mid_level" className="bg-black text-cyan-100">Mid Level</option>
                    <option value="senior_level" className="bg-black text-cyan-100">Senior Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="e.g., Technology"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Salary Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Min Salary</label>
                  <input
                    type="number"
                    name="min_salary"
                    value={formData.min_salary}
                    onChange={handleChange}
                    min="0"
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Max Salary</label>
                  <input
                    type="number"
                    name="max_salary"
                    value={formData.max_salary}
                    onChange={handleChange}
                    min="0"
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Currency</label>
                  <select
                    name="salary_currency"
                    value={formData.salary_currency}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  >
                    <option value="INR" className="bg-black text-cyan-100">INR</option>
                    <option value="USD" className="bg-black text-cyan-100">USD</option>
                    <option value="EUR" className="bg-black text-cyan-100">EUR</option>
                    <option value="GBP" className="bg-black text-cyan-100">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Pay Period</label>
                  <select
                    name="salary_pay_period"
                    value={formData.salary_pay_period}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  >
                    <option value="year" className="bg-black text-cyan-100">Per Year</option>
                    <option value="month" className="bg-black text-cyan-100">Per Month</option>
                    <option value="hour" className="bg-black text-cyan-100">Per Hour</option>
                    <option value="fixed" className="bg-black text-cyan-100">Fixed</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_salary_visible"
                    checked={formData.is_salary_visible}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4 accent-cyan-500"
                  />
                  <label className="text-sm font-medium text-cyan-300">Show Salary in Listing</label>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Job Description</h2>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Full Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jd_text"
                value={formData.jd_text}
                onChange={handleChange}
                required
                rows="8"
                className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all resize-y"
                placeholder="Enter the complete job description, responsibilities, requirements, etc."
                style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
              />
            </div>

            {/* Skills */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Skills</h2>
              
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                    placeholder="Add required skill"
                    className="flex-1 px-4 py-2 bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('required')}
                    className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-full hover:bg-cyan-400 shadow-cyan-500/40 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills_required.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, 'required')}
                        className="ml-2 text-red-400 hover:text-red-200"
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
                      onClick={() => addCommonSkill(skill, 'required')}
                      className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 rounded-full text-sm hover:bg-cyan-500/20 transition-all"
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
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('nice'))}
                    placeholder="Add nice-to-have skill"
                    className="flex-1 px-4 py-2 bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('nice')}
                    className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-full hover:bg-cyan-400 shadow-cyan-500/40 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.nice_to_have_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, 'nice')}
                        className="ml-2 text-green-400 hover:text-green-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="border-b border-cyan-500/30 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-cyan-200 mb-4">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Application URL</label>
                  <input
                    type="url"
                    name="application_url"
                    value={formData.application_url}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="https://company.com/apply"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Application Email</label>
                  <input
                    type="email"
                    name="application_email"
                    value={formData.application_email}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 placeholder:text-slate-500 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="jobs@company.com"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cyan-300 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleChange}
                    className="bg-black/40 border border-cyan-500/40 text-cyan-100 rounded-xl w-full px-4 py-2 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/recruiter/jobs')}
                className="btn-secondary flex items-center justify-center px-6 py-3"
              >
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Posting...</span>
                  </>
                ) : (
                  <span>Post Job</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobEnhanced;

