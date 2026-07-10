import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_BASE = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// AUTH
// ============================================
export const registerStudent = (data) => api.post('/students/register', data);
export const loginStudent = (data) => api.post('/students/login', data);
export const getStudent = (id) => api.get(`/students/${id}`);
export const resetPassword = (data) => api.post('/students/reset-password', data);

// ============================================
// DATA INPUT
// ============================================
export const submitScores = (studentId, data) => api.post(`/scores/${studentId}`, data);
export const submitAttendance = (studentId, data) => api.post(`/attendance/${studentId}`, data);
export const getAttendancePct = (studentId) => api.get(`/attendance/${studentId}/percentage`);

// ============================================
// ANALYTICS
// ============================================
export const getAnalytics = (studentId) => api.get(`/analytics/${studentId}`);
export const getRisk = (studentId) => api.get(`/analytics/${studentId}/risk`);
export const getRecommendations = (studentId) => api.get(`/recommendations/${studentId}`);
export const runPipeline = () => api.post('/analytics/pipeline/run');
export const predictStudent = (studentId) => api.post(`/analytics/predict/${studentId}`);
export const getAnomalies = (studentId) => api.get(`/analytics/anomalies/${studentId}`);
export const getBatchAnalytics = () => api.get('/analytics/batch/overview');

// ============================================
// INSIGHTS
// ============================================
export const getBatchComparison = (studentId) => api.get(`/insights/${studentId}/batch-comparison`);
export const getCorrelationInsights = (studentId) => api.get(`/insights/${studentId}/correlations`);
export const getNarrative = (studentId) => api.get(`/insights/${studentId}/narrative`);
export const getBatchSummary = () => api.get(`/insights/batch/summary`);

// ============================================
// AI CHAT
// ============================================
export const sendChatMessage = (studentId, data) => api.post(`/chat/${studentId}`, data);

// ============================================
// SUBJECTS & SEMESTERS
// ============================================
export const getSubjectsByBranch = (branch) => api.get(`/subjects/branch/${branch}`);
export const getAllSubjects = () => api.get('/subjects/');
export const getSemesters = () => api.get('/subjects/semesters');

// ============================================
// SKILLS & ACHIEVEMENTS
// ============================================
export const addSkill = (studentId, data) => api.post(`/students/${studentId}/skills`, data);
export const getSkills = (studentId) => api.get(`/students/${studentId}/skills`);
export const addAchievement = (studentId, data) => api.post(`/students/${studentId}/achievements`, data);
export const getAchievements = (studentId) => api.get(`/students/${studentId}/achievements`);

// ============================================
// STUDY LOGS
// ============================================
export const submitStudyLog = (studentId, data) => api.post(`/students/${studentId}/studylog`, data);
export const getStudyLogs = (studentId) => api.get(`/students/${studentId}/studylogs`);

// ============================================
// LEADERBOARD
// ============================================
export const getLeaderboard = () => api.get('/analytics/leaderboard');
export const getCGPA = (studentId) => api.get(`/analytics/cgpa/${studentId}`);
export const getSubjectPerformance = (studentId) => api.get(`/analytics/subjects/${studentId}`);

// ============================================
// MSRIT SCORES
// ============================================
export const submitMsritScores = (studentId, data) => api.post(`/msrit-scores/${studentId}`, data);
export const getMsritScores = (studentId) => api.get(`/msrit-scores/${studentId}`);
export const getMsritScoreSummary = (studentId) => api.get(`/msrit-scores/${studentId}/summary`);
export const getDetentionRisk = (studentId) => api.get(`/msrit-scores/${studentId}/detention-risk`);
export const getWhatIf = (studentId, seeScore) => api.get(`/msrit-scores/${studentId}/whatif?see_score=${seeScore}`);

// ============================================
// ADMIN
// ============================================
export const adminLogin = (data) => api.post('/students/admin/login', data);
export const getAdminOverview = () => {
  const token = localStorage.getItem('admin_token');
  return api.get('/students/admin/overview', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
};
