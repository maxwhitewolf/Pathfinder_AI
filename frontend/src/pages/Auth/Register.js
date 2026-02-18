import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Register = () => {
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (userType === 'user' && !formData.full_name) {
      setError('Full name is required');
      return false;
    }
    if (userType === 'recruiter' && !formData.company_name) {
      setError('Company name is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      ...(userType === 'user' ? { full_name: formData.full_name } : { company_name: formData.company_name })
    };

    const result = await register(userData, userType);
    
    if (result.success) {
      setSuccess('Registration successful! Please login with your credentials.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      // Ensure error is always a string
      const errorMsg = result.error ? (typeof result.error === 'string' ? result.error : String(result.error)) : 'Registration failed';
      setError(errorMsg);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-2xl shadow-2xl shadow-cyan-500/25 mb-6">
            <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-cyan-300 mb-3">
            Join PathFinder AI! 🚀
          </h1>
          <p className="text-lg text-slate-300">
            Start your <span className="font-semibold text-cyan-400">AI-powered career journey</span> today
          </p>
        </div>

        {/* Registration Form */}
        <div className="glass-card glass-card-hover max-w-md w-full p-6 overflow-hidden">
          <div className="px-8 py-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 shadow-lg">
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
                <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-green-300 font-medium">
                      {typeof success === 'string' ? success : String(success || 'Success')}
                    </span>
                  </div>
                </div>
              )}

              {/* Account Type Selection */}
              <div className="space-y-3">
                <label className="flex items-center text-sm font-semibold text-cyan-300">
                  <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 bg-white/5 backdrop-blur-md border border-cyan-500/30 rounded-2xl text-cyan-100 cursor-pointer transition-all duration-200 ${
                    userType === 'user' 
                      ? 'border-cyan-400 shadow-cyan-500/40 scale-[1.02]' 
                      : 'hover:border-cyan-400 hover:shadow-cyan-500/40 hover:scale-[1.02]'
                  }`}>
                    <input
                      type="radio"
                      value="user"
                      checked={userType === 'user'}
                      onChange={(e) => setUserType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center w-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                        userType === 'user' ? 'bg-cyan-500' : 'bg-cyan-500/20'
                      }`}>
                        <svg className={`w-6 h-6 ${userType === 'user' ? 'text-black' : 'text-cyan-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-semibold ${userType === 'user' ? 'text-cyan-300' : 'text-cyan-100'}`}>
                        Student/Job Seeker
                      </span>
                    </div>
                    {userType === 'user' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                  
                  <label className={`relative flex items-center p-4 bg-white/5 backdrop-blur-md border border-cyan-500/30 rounded-2xl text-cyan-100 cursor-pointer transition-all duration-200 ${
                    userType === 'recruiter' 
                      ? 'border-cyan-400 shadow-cyan-500/40 scale-[1.02]' 
                      : 'hover:border-cyan-400 hover:shadow-cyan-500/40 hover:scale-[1.02]'
                  }`}>
                    <input
                      type="radio"
                      value="recruiter"
                      checked={userType === 'recruiter'}
                      onChange={(e) => setUserType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center w-full">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                        userType === 'recruiter' ? 'bg-cyan-500' : 'bg-cyan-500/20'
                      }`}>
                        <svg className={`w-6 h-6 ${userType === 'recruiter' ? 'text-black' : 'text-cyan-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-semibold ${userType === 'recruiter' ? 'text-cyan-300' : 'text-cyan-100'}`}>
                        Recruiter
                      </span>
                    </div>
                    {userType === 'recruiter' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="flex items-center text-sm font-semibold text-cyan-300">
                  <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full pl-12 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="Enter your email address"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* User Full Name */}
              {userType === 'user' && (
                <div className="space-y-2">
                  <label htmlFor="full_name" className="flex items-center text-sm font-semibold text-cyan-300">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full pl-12 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                      placeholder="Enter your full name"
                      style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Recruiter Company Name */}
              {userType === 'recruiter' && (
                <div className="space-y-2">
                  <label htmlFor="company_name" className="flex items-center text-sm font-semibold text-cyan-300">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      id="company_name"
                      name="company_name"
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full pl-12 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                      placeholder="Enter your company name"
                      style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="flex items-center text-sm font-semibold text-cyan-300">
                  <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full pl-12 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="Create a secure password"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-cyan-300">
                  <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full pl-12 focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="Confirm your password"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white/5 backdrop-blur-sm border border-cyan-500/30 text-cyan-100 font-medium rounded-2xl px-5 py-2 w-full flex items-center justify-center hover:border-cyan-400 hover:shadow-cyan-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-cyan-500/30"
                  aria-label={loading ? "Creating account, please wait" : "Create a new account"}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-cyan-100 border-t-transparent rounded-full animate-spin flex-shrink-0 mr-2"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-500/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/40 text-slate-400 font-medium">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  role="button"
                  className="bg-white/5 backdrop-blur-sm border border-cyan-500/30 text-cyan-100 font-medium rounded-2xl px-5 py-2 w-full flex items-center justify-center hover:border-cyan-400 hover:shadow-cyan-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all duration-200"
                  aria-label="Sign in to your existing account"
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign In Instead</span>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400">
                  🌟 Join thousands of professionals advancing their careers with AI guidance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="glass-card p-4">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-cyan-300">AI Career Guidance</p>
          </div>

          <div className="glass-card p-4">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-cyan-300">Learning Roadmaps</p>
          </div>

          <div className="glass-card p-4">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-cyan-300">Job Matching</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;