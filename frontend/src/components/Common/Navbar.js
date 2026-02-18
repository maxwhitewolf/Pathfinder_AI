import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isUser, isRecruiter } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-black/40 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
                PathFinder AI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isUser && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/dashboard' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/profile' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/recommendations" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/recommendations' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Recommendations
                    </Link>
                    <Link 
                      to="/job-matching" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/job-matching' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Job Matching
                    </Link>
                    <Link 
                      to="/jobs" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/jobs' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Search Jobs
                    </Link>
                    <Link 
                      to="/roadmaps" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/roadmaps' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Roadmaps
                    </Link>
                  </>
                )}
                
                {isRecruiter && (
                  <>
                    <Link 
                      to="/recruiter/dashboard" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/recruiter/dashboard' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/recruiter/jobs" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/recruiter/jobs' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      My Jobs
                    </Link>
                    <Link 
                      to="/recruiter/create-job" 
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === '/recruiter/create-job' 
                          ? 'text-cyan-300 border-b-2 border-cyan-400' 
                          : 'text-cyan-100 hover:text-cyan-300'
                      }`}
                    >
                      Post Job
                    </Link>
                  </>
                )}
                
                <span className="text-sm text-slate-400 hidden sm:inline">
                  Welcome, {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="group flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 hover:border-red-400 text-red-300 hover:text-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/30 hover:scale-105"
                  aria-label="Logout"
                >
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;