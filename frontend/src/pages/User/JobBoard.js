import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const JobBoard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedJobs, setSelectedJobs] = useState([]);

  const [filters, setFilters] = useState({
    keyword: '',
    location_city: '',
    location_country: '',
    remote_only: false,
    experience_level: [],
    job_type: [],
    work_type: [],
    min_salary: '',
    max_salary: '',
    industry: [],
    skills_required: [],
    posted_within: 'any',
    sort_by: 'newest',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        skip: currentPage * 20,
        limit: 20,
        ...filters,
        experience_level: filters.experience_level.join(','),
        job_type: filters.job_type.join(','),
        work_type: filters.work_type.join(','),
        industry: filters.industry.join(','),
        skills_required: filters.skills_required.join(','),
      };

      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const response = await jobAPI.searchJobs(params);
      setJobs(response.data.jobs || []);
      setTotal(response.data.total || 0);
      setHasMore(response.data.has_more || false);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch jobs'));
    } finally {
      setLoading(false);
    }
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleCompareJobs = () => {
    if (selectedJobs.length < 2) {
      alert('Please select at least 2 jobs to compare');
      return;
    }
    navigate(`/compare-jobs?jobs=${selectedJobs.join(',')}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const handleMultiSelect = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const newValue = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValue };
    });
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location_city: '',
      location_country: '',
      remote_only: false,
      experience_level: [],
      job_type: [],
      work_type: [],
      min_salary: '',
      max_salary: '',
      industry: [],
      skills_required: [],
      posted_within: 'any',
      sort_by: 'newest',
    });
    setCurrentPage(0);
  };

  const formatSalary = (job) => {
    if (!job.is_salary_visible || (!job.min_salary && !job.max_salary)) {
      return 'Salary not disclosed';
    }

    const min = job.min_salary ? job.min_salary.toLocaleString() : '';
    const max = job.max_salary ? job.max_salary.toLocaleString() : '';
    const currency = job.salary_currency || 'INR';
    const period = job.salary_pay_period === 'year' ? 'yr' :
      job.salary_pay_period === 'month' ? 'mo' :
        job.salary_pay_period === 'hour' ? 'hr' : '';

    if (min && max) {
      return `${currency} ${min} - ${max} / ${period}`;
    } else if (min) {
      return `${currency} ${min}+ / ${period}`;
    } else if (max) {
      return `Up to ${currency} ${max} / ${period}`;
    }
    return 'Salary not disclosed';
  };

  const formatLocation = (job) => {
    const parts = [];
    if (job.location_city) parts.push(job.location_city);
    if (job.location_country) parts.push(job.location_country);
    if (job.is_remote) parts.push('Remote');
    // Fallback for old jobs
    if (parts.length === 0 && job.location) {
      return job.location;
    }
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead'];
  const jobTypes = ['full_time', 'part_time', 'internship', 'contract', 'freelance'];
  const workTypes = ['onsite', 'remote', 'hybrid'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Board</h1>
          <p className="text-gray-600">Find your dream job with AI-powered matching</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search jobs by title, company, or keywords..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={filters.location_city}
                    onChange={(e) => handleFilterChange('location_city', e.target.value)}
                    placeholder="e.g., Bangalore"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={filters.location_country}
                    onChange={(e) => handleFilterChange('location_country', e.target.value)}
                    placeholder="e.g., India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.remote_only}
                      onChange={(e) => handleFilterChange('remote_only', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Remote Only</span>
                  </label>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <div className="flex flex-wrap gap-2">
                    {experienceLevels.map(level => (
                      <button
                        key={level}
                        onClick={() => handleMultiSelect('experience_level', level)}
                        className={`px-3 py-1 rounded-full text-sm ${filters.experience_level.includes(level)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => handleMultiSelect('job_type', type)}
                        className={`px-3 py-1 rounded-full text-sm ${filters.job_type.includes(type)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                  <div className="flex flex-wrap gap-2">
                    {workTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => handleMultiSelect('work_type', type)}
                        className={`px-3 py-1 rounded-full text-sm ${filters.work_type.includes(type)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    value={filters.min_salary}
                    onChange={(e) => handleFilterChange('min_salary', e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    value={filters.max_salary}
                    onChange={(e) => handleFilterChange('max_salary', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="salary_high">Salary: High to Low</option>
                    <option value="relevance">Relevance</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Found <strong>{total}</strong> jobs
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {job.job_title || job.title || 'Untitled Job'}
                      </h3>
                      <p className="text-lg text-gray-600 mb-3">{job.company_name || 'Company Not Specified'}</p>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {formatLocation(job)}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {job.job_type ? job.job_type.replace('_', ' ') : (job.job_type || 'Full Time')}
                        </span>
                        {job.experience_level && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                          </span>
                        )}
                        {(job.is_salary_visible !== false) && (job.min_salary || job.max_salary || job.salary) && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            {formatSalary(job)}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {job.jd_text?.substring(0, 200) || job.description?.substring(0, 200) || 'No description available'}...
                      </p>

                      {(job.skills_required && job.skills_required.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {Array.isArray(job.skills_required) ? (
                            <>
                              {job.skills_required.slice(0, 5).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills_required.length > 5 && (
                                <span className="px-2 py-1 text-gray-500 text-sm">
                                  +{job.skills_required.length - 5} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              Skills: {typeof job.skills_required === 'string' ? job.skills_required : 'Not specified'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                        className="w-5 h-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        title="Select for comparison"
                      />
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-block"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compare Jobs Floating Button */}
            {selectedJobs.length >= 2 && (
              <div className="fixed bottom-6 right-6 z-50">
                <button
                  onClick={handleCompareJobs}
                  className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Compare {selectedJobs.length} Jobs
                </button>
              </div>
            )}

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage + 1} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasMore}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobBoard;

