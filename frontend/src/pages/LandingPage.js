import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-white font-bold text-xl">PathFinder AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-white hover:text-cyan-300 transition-colors duration-200 font-medium"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 glass-card rounded-full">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-cyan-300 text-sm font-medium">AI-Powered Career Intelligence</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-cyan-100 leading-tight">
                  Discover Your
                  <span className="block bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-300 bg-clip-text text-transparent">
                    Dream Career
                  </span>
                  with AI
                </h1>
                
                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                  Get personalized career recommendations, skill gap analysis, and custom learning roadmaps powered by advanced AI technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register"
                  className="group btn-primary px-8 py-4 text-lg flex items-center justify-center"
                >
                  <span>Start Your Journey</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <button className="group btn-secondary px-8 py-4 text-lg flex items-center justify-center">
                  <span>Watch Demo</span>
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">10K+</div>
                  <div className="text-slate-400 text-sm">Career Paths</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">95%</div>
                  <div className="text-slate-400 text-sm">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-300">24/7</div>
                  <div className="text-slate-400 text-sm">AI Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Dashboard Preview */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Dashboard Card */}
                <div className="glass-card glass-card-hover p-8">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-cyan-300 font-semibold text-lg">Career Analysis</h3>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    {/* Progress Chart */}
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Technical Skills</span>
                        <span className="text-cyan-400">85%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2">
                        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Soft Skills</span>
                        <span className="text-cyan-400">72%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2">
                        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-2 rounded-full" style={{width: '72%'}}></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Experience</span>
                        <span className="text-cyan-400">68%</span>
                      </div>
                      <div className="w-full bg-black/40 rounded-full h-2">
                        <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>

                    {/* Recommendation Cards */}
                    <div className="space-y-3">
                      <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-black text-xs font-bold">1</span>
                          </div>
                          <div>
                            <div className="text-cyan-100 font-medium text-sm">Software Engineer</div>
                            <div className="text-slate-400 text-xs">96% Match</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                            <span className="text-black text-xs font-bold">2</span>
                          </div>
                          <div>
                            <div className="text-cyan-100 font-medium text-sm">Data Scientist</div>
                            <div className="text-slate-400 text-xs">89% Match</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-20 blur-xl animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl opacity-20 blur-lg animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-cyan-300 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Our cutting-edge algorithms analyze your profile and provide personalized insights to accelerate your career growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group glass-card glass-card-hover p-8">
              <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">AI Career Matching</h3>
              <p className="text-slate-300">Advanced machine learning algorithms analyze your skills, interests, and goals to suggest perfect career matches.</p>
            </div>

            {/* Feature 2 */}
            <div className="group glass-card glass-card-hover p-8">
              <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">Skill Gap Analysis</h3>
              <p className="text-slate-300">Identify exactly what skills you need to develop to reach your dream career with detailed gap analysis.</p>
            </div>

            {/* Feature 3 */}
            <div className="group glass-card glass-card-hover p-8">
              <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-4">Personalized Roadmaps</h3>
              <p className="text-slate-300">Get custom learning paths with timeline, resources, and milestones tailored specifically for your career goals.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-cyan-300 mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already discovered their perfect career path with PathFinder AI.
          </p>
          <Link 
            to="/register"
            className="flex items-center justify-center btn-primary px-12 py-4 text-xl"
          >
            <span>Get Started for Free</span>
            <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;