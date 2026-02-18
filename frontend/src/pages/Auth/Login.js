import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    
    if (result.success) {
      const { user_type } = result.data;
      if (user_type === 'user') {
        navigate('/dashboard');
      } else if (user_type === 'recruiter') {
        navigate('/recruiter/dashboard');
      }
    } else {
      // Ensure error is always a string
      const errorMsg = result.error ? (typeof result.error === 'string' ? result.error : String(result.error)) : 'Login failed';
      setError(errorMsg);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">

      {/* Centered Login Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-md">
          {/* Transparent Frosted Glass Card */}
          <div 
            className="glass-login-container"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1.5px solid #00ffff',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 6px 30px rgba(0, 255, 255, 0.04)',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}
          >
          {/* Centered Logo */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500 rounded-2xl shadow-2xl shadow-cyan-500/25">
              <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            </div>
          </div>

          {/* Centered Title */}
          <h1 className="text-4xl font-bold text-cyan-300 mb-3 text-center">
            Welcome Back! 👋
          </h1>

          {/* Centered Subtitle */}
          <p className="text-lg text-cyan-200 mb-8 text-center">
            Sign in to continue your <span className="font-semibold text-cyan-400">PathFinder AI</span> journey
          </p>

          <div className="px-2">
            <form className="space-y-8" onSubmit={handleSubmit}>
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

              <div className="space-y-2 mb-6">
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="Email Address"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                    aria-label="Email address"
                    aria-required="true"
                    aria-invalid={error && error.toLowerCase().includes('email') ? 'true' : 'false'}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-black/30 backdrop-blur-sm border border-cyan-500/30 rounded-xl text-cyan-100 placeholder:text-slate-400 px-4 py-3 w-full focus:ring-2 focus:ring-cyan-500/80 focus:border-cyan-400 outline-none transition-all"
                    placeholder="Password"
                    style={{ color: '#cffafe', WebkitTextFillColor: '#cffafe' }}
                    aria-label="Password"
                    aria-required="true"
                    aria-invalid={error && error.toLowerCase().includes('password') ? 'true' : 'false'}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-btn-signin group w-full flex items-center justify-center px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid #00ffff',
                    borderRadius: '12px',
                    color: '#00ffff',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
                      e.currentTarget.style.borderColor = '#00ffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.1)';
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
                    e.currentTarget.style.outline = '2px solid rgba(0, 255, 255, 0.5)';
                    e.currentTarget.style.outlineOffset = '2px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = 'none';
                  }}
                  aria-label={loading ? "Signing in, please wait" : "Sign in to your account"}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0" aria-hidden="true"></div>
                      <span>Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-500/30" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-cyan-300 font-medium">New to PathFinder AI?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  role="button"
                  className="bg-white/5 backdrop-blur-sm border border-cyan-500/30 text-cyan-100 font-medium rounded-2xl px-5 py-2 w-full flex items-center justify-center hover:border-cyan-400 hover:shadow-cyan-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500/60 transition-all duration-200"
                  aria-label="Create a new account"
                >
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Create an Account</span>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-6 text-center">
                <p className="text-sm text-cyan-300">
                  🚀 Join thousands of users advancing their careers with AI-powered guidance
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Placeholder Styling for Login Page Only */}
      <style>{`
        .glass-input-login::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 0.7 !important;
        }
        .glass-input-login::-webkit-input-placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 0.7 !important;
        }
        .glass-input-login::-moz-placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 0.7 !important;
        }
        .glass-input-login:-ms-input-placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 0.7 !important;
        }
        
        /* Responsive styles for pill buttons */
        @media (max-width: 640px) {
          .glass-pill-button {
            padding: 6px 12px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;