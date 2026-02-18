import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roadmapAPI, phase2API } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';
import ChatWidget from '../../components/Common/ChatWidget';

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regeneratingTask, setRegeneratingTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const handleInteraction = async (task, actionType, rating = null) => {
    // 1. Log the interaction (always)
    try {
      await phase2API.logInteraction({
        task_id: task.task_id || task.title,
        action_type: actionType,
        difficulty_rating: rating,
        roadmap_id: parseInt(id),
        job_id: roadmap.job_id
      });
      console.log(`Logged ${actionType} for ${task.title}`);
    } catch (err) {
      console.error("Failed to log interaction", err);
    }

    // 2. Handle specific actions
    if (actionType === 'complete') {
      alert("Task marked complete! RL Model updated.");
    } else if (actionType === 'skip') {
      // Trigger Regeneration
      await handleRegenerateTask(task, 'skip');
    }
  };

  const handleRegenerateTask = async (task, feedbackType) => {
    const taskId = task.task_id || task.title;
    setRegeneratingTask(taskId);

    try {
      const response = await roadmapAPI.regenerateTask(id, taskId, feedbackType);
      const newTask = response.data.new_task;

      // Update local state to replace the task
      setRoadmap(prev => {
        const newPhases = prev.roadmap_data.roadmap.phases.map(phase => {
          return {
            ...phase,
            tasks: phase.tasks.map(t => {
              if ((t.task_id === taskId) || (t.title === taskId)) {
                return newTask;
              }
              return t;
            })
          };
        });

        return {
          ...prev,
          roadmap_data: {
            ...prev.roadmap_data,
            roadmap: {
              ...prev.roadmap_data.roadmap,
              phases: newPhases
            }
          }
        };
      });

    } catch (err) {
      console.error("Failed to regenerate task", err);
      alert("Failed to regenerate task. Please try again.");
    } finally {
      setRegeneratingTask(null);
    }
  };

  const fetchRoadmap = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await roadmapAPI.getSavedRoadmaps();
      const foundRoadmap = response.data.find(r => r.id === parseInt(id));
      if (foundRoadmap) {
        setRoadmap(foundRoadmap);
      } else {
        setError('Roadmap not found');
      }
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch roadmap'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black flex items-center justify-center">
        <div className="text-center">
          <div className="glass-card glass-card-hover p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Roadmap Not Found</h2>
            <p className="text-red-200 mb-6">
              {typeof error === 'string' ? error : String(error || 'The roadmap you are looking for does not exist.')}
            </p>
            <Link
              to="/roadmaps"
              className="inline-block btn-primary px-6 py-3"
            >
              Back to Roadmaps
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roadmapData = roadmap.roadmap_data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#020617] to-black text-slate-100">
      {/* Header Section */}
      <div className="relative overflow-hidden py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">Saved Roadmap</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-cyan-100 mb-4">
                {roadmap.title || roadmap.target_career || 'Learning Roadmap'}
              </h1>
              {roadmap.target_career && (
                <p className="text-xl text-slate-300 mb-6">{roadmap.target_career}</p>
              )}
            </div>

            <div className="ml-8">
              <Link
                to="/roadmaps"
                className="inline-flex items-center justify-center px-4 py-2 glass-card glass-card-hover text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Roadmaps</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Role Summary */}
        {roadmapData?.role_summary && (
          <div className="mb-8 glass-card glass-card-hover p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">{roadmapData.role_summary.title}</h3>
            {roadmapData.role_summary.what_you_do && roadmapData.role_summary.what_you_do.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-cyan-300 mb-2">Key Responsibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {roadmapData.role_summary.what_you_do.map((item, idx) => (
                    <li key={idx} className="pb-0.5">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {roadmapData.role_summary.required_stack && (
              <div>
                <h4 className="text-lg font-semibold text-cyan-300 mb-2">Required Tech Stack:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(roadmapData.role_summary.required_stack).map(([category, skills]) => (
                    skills && skills.length > 0 && (
                      <div key={category} className="mb-2 w-full">
                        <span className="text-sm font-medium text-cyan-300 capitalize block mb-1">{category.replace('_', ' ')}: </span>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gap Analysis */}
        {roadmapData?.gap_analysis && (
          <div className="mb-8 glass-card glass-card-hover p-6">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Gap Analysis</h3>
            {roadmapData.gap_analysis.summary && (
              <p className="text-slate-300 mb-4 leading-relaxed pb-0.5">{roadmapData.gap_analysis.summary}</p>
            )}
            {roadmapData.gap_analysis.missing_skills && roadmapData.gap_analysis.missing_skills.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-cyan-300 mb-2">Missing Skills:</h4>
                <div className="space-y-3">
                  {roadmapData.gap_analysis.missing_skills.map((skill, idx) => (
                    <div key={idx} className="glass-card glass-card-hover p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-cyan-300">{skill.skill}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${skill.priority === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                          skill.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' :
                            'bg-green-500/20 text-green-300 border-green-500/40'
                          }`}>
                          {skill.priority} priority
                        </span>
                      </div>
                      {skill.reason && (
                        <p className="text-sm text-slate-300 mt-2 pb-0.5">{skill.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roadmap Phases */}
        {roadmapData?.roadmap && roadmapData.roadmap.phases && roadmapData.roadmap.phases.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-cyan-300 mb-6">Learning Phases</h3>
            <div className="space-y-6">
              {roadmapData.roadmap.phases.map((phase, phaseIdx) => (
                <div key={phase.phase_id || phaseIdx} className="glass-card glass-card-hover p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-cyan-300 mb-2">
                        Phase {phase.phase_id || phaseIdx + 1}: {phase.phase_name}
                      </h4>
                      {phase.goal && (
                        <p className="text-slate-300 mb-2 pb-0.5">{phase.goal}</p>
                      )}
                      {phase.estimated_duration_weeks && (
                        <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-sm font-medium">
                          ⏱️ {phase.estimated_duration_weeks} weeks
                        </span>
                      )}
                    </div>
                  </div>

                  {phase.tasks && phase.tasks.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {phase.tasks.map((task, taskIdx) => {
                        const taskId = task.task_id || task.title;
                        const isRegenerating = regeneratingTask === taskId;
                        const isExpanded = expandedTasks[taskId] || isRegenerating; // Keep expanded if regenerating

                        return (
                          <div key={taskId || taskIdx} className="glass-card glass-card-hover p-4 relative group transition-all duration-300">
                            {/* Loading Overlay */}
                            {isRegenerating && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl">
                                <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <span className="text-cyan-300 text-sm font-medium animate-pulse">Adaptively Regenerating...</span>
                              </div>
                            )}

                            {/* Clickable Header */}
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleTask(taskId)}
                            >
                              <h5 className="text-lg font-semibold text-cyan-300">{task.title}</h5>
                              <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                                <svg
                                  className={`w-6 h-6 text-cyan-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Collapsible Content */}
                            <div className={`mt-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                              {task.description && (
                                <p className="text-slate-300 mb-3 pb-0.5 leading-relaxed border-l-2 border-cyan-500/30 pl-3">
                                  {task.description}
                                </p>
                              )}

                              {task.jd_alignment && task.jd_alignment.length > 0 && (
                                <div className="mb-3 mt-3">
                                  <span className="text-sm font-medium text-cyan-300">JD Alignment: </span>
                                  <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                                    {task.jd_alignment.map((align, idx) => (
                                      <li key={idx} className="pb-0.5">{align}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-cyan-300">Subtasks:</span>
                                  <ul className="list-disc list-inside text-sm text-slate-300 mt-1 space-y-1">
                                    {task.subtasks.map((subtask, idx) => (
                                      <li key={idx} className="pb-0.5">{subtask}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {task.skills_gained && task.skills_gained.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {task.skills_gained.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/40 rounded-full text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Adaptive Feedback Controls */}
                              <div className="mt-4 pt-4 border-t border-cyan-500/20 flex flex-wrap gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleInteraction(task, 'complete'); }}
                                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs rounded border border-green-500/40 transition-colors"
                                  disabled={isRegenerating}
                                >
                                  ✅ Complete
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleInteraction(task, 'skip'); }}
                                  className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs rounded border border-yellow-500/40 transition-colors"
                                  disabled={isRegenerating}
                                >
                                  ⏭ Skip & Regenerate
                                </button>
                                <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
                                  <span className="text-xs text-slate-400">Rate:</span>
                                  {[1, 2, 3, 4, 5].map(r => (
                                    <button
                                      key={r}
                                      onClick={() => handleInteraction(task, 'rate_difficulty', r)}
                                      className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-cyan-900 text-xs rounded-full border border-slate-700 hover:border-cyan-500 transition-colors"
                                      title={`Difficulty: ${r}`}
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatWidget context={{ roadmapId: id }} />
    </div>
  );
};

export default RoadmapDetail;

