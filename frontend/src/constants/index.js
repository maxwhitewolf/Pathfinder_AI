/**
 * App constants. Single place for API base URL and config.
 */
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  USER_DASHBOARD: '/user/dashboard',
  RECRUITER_DASHBOARD: '/recruiter/dashboard',
  JOBS: '/user/jobs',
  JOB_BOARD: '/user/job-board',
  ROADMAPS: '/user/roadmaps',
  PROFILE: '/user/profile',
  CHAT: '/user/chat',
};
