import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your AI career advisor. I can help you with career guidance, skill development advice, interview preparation, and answer questions about your career path. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);

    try {
      const response = await aiAPI.chat(userMessage.content);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "How can I improve my coding skills?",
    "What are the trending technologies in data science?",
    "How do I prepare for software engineer interviews?",
    "What career path should I choose with my skills?",
    "How can I transition to a tech career?",
    "What certifications are most valuable for my field?"
  ];

  const handleSuggestedQuestion = (question) => {
    setNewMessage(question);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-12">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-cyan-200 text-sm font-medium">AI Career Assistant Online</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI Career
              <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Advisor
              </span>
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Get instant, personalized career guidance from our advanced AI assistant
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="glass-card glass-card-hover overflow-hidden" style={{height: '750px'}}>
          {/* Chat Header */}
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-6 translate-y-6"></div>
            
            <div className="relative flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">🤖 AI Career Advisor</h2>
                <p className="text-blue-100">Ready to help with your career questions</p>
              </div>
              <div className="flex items-center bg-green-500/20 text-green-100 border border-green-400/30 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-semibold">Online</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-blue-50/30 to-purple-50/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : message.isError 
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                          : 'glass-card glass-card-hover text-slate-200'
                    }`}>
                      {message.type === 'user' ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`relative group ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                      : message.isError
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 shadow-lg'
                        : 'glass-card glass-card-hover text-slate-200'
                  } px-6 py-4 rounded-2xl transition-all duration-300`}>
                    
                    {/* Message tail */}
                    <div className={`absolute top-4 ${
                      message.type === 'user' ? '-right-2' : '-left-2'
                    } w-4 h-4 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : message.isError
                          ? 'bg-red-500/20 border-l border-t border-red-500/50'
                          : 'bg-white/5 border-l border-t border-cyan-500/50'
                    } transform rotate-45`}></div>
                    
                    <div className="relative pb-0.5">
                      <div className="whitespace-pre-wrap leading-relaxed pb-0.5">
                        {formatMessage(message.content)}
                      </div>
                      <div className={`text-xs mt-2 flex items-center ${
                        message.type === 'user' ? 'text-white' : 'text-slate-300'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Message */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="glass-card glass-card-hover px-6 py-4 relative">
                    <div className="absolute top-4 -left-2 w-4 h-4 bg-white/5 border-l border-t border-cyan-500/50 transform rotate-45"></div>
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-cyan-300 font-medium">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-8 py-6 glass-card glass-card-hover border-t border-cyan-500/30">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-cyan-300">💡 Try asking about:</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="group text-left glass-card glass-card-hover px-4 py-3 text-cyan-200 hover:text-cyan-100"
                  >
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 group-hover:scale-125 transition-transform duration-200"></div>
                      <span className="text-sm leading-relaxed">{question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="px-8 py-6 glass-card glass-card-hover border-t border-cyan-500/30">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask me about your career, skills, or any guidance you need..."
                  className="input-dark w-full px-6 py-4 pr-12 text-lg disabled:opacity-50"
                  disabled={loading}
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || loading}
                className="btn-primary group px-6 py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                  </>
                ) : (
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
            <div className="mt-4 flex items-center text-sm text-slate-400">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Press <kbd className="px-2 py-1 bg-black/40 border border-cyan-500/40 rounded text-xs font-mono text-cyan-300">Enter</kbd> to send • AI can help with career guidance, skill development, and interview prep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;