/**
 * Central API Client for Career Readiness Platform
 */
const API_BASE = (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '5000')
  ? '/api'
  : 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('career_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('career_token', token);
    } else {
      localStorage.removeItem('career_token');
    }
  }

  getHeaders(isFormData = false) {
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(isFormData),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // Auth endpoints
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  register(name, email, password, role) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
  }

  demoLogin() {
    return this.request('/auth/demo-login', { method: 'POST' });
  }

  adminLogin(email, password) {
    return this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Resume endpoints
  uploadResumeFile(file) {
    const formData = new FormData();
    formData.append('resumeFile', file);
    return this.request('/resume/upload', {
      method: 'POST',
      body: formData
    });
  }

  uploadResumeText(text, name = 'Pasted Resume') {
    return this.request('/resume/upload', {
      method: 'POST',
      body: JSON.stringify({ resumeText: text, resumeName: name })
    });
  }

  getResumeSamples() {
    return this.request('/resume/samples');
  }

  // Job Description endpoints
  getJobRoles() {
    return this.request('/jd/roles');
  }

  analyzeJobDescription(payload) {
    return this.request('/jd/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Skill Gap Analysis endpoints
  analyzeGap(payload) {
    return this.request('/gap/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  getLatestAnalysis() {
    return this.request('/gap/latest');
  }

  // Roadmap endpoints
  generateRoadmap(payload) {
    return this.request('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  toggleRoadmapTask(roadmapId, taskId) {
    return this.request('/roadmap/toggle-task', {
      method: 'POST',
      body: JSON.stringify({ roadmapId, taskId })
    });
  }

  getLatestRoadmap() {
    return this.request('/roadmap/latest');
  }

  // Quiz endpoints
  generateQuiz(skills = [], count = 5) {
    return this.request('/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({ skills, count })
    });
  }

  submitQuiz(quizId, answers) {
    return this.request('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers })
    });
  }

  getQuizHistory() {
    return this.request('/quiz/history');
  }

  // Progress Dashboard
  getProgressDashboard() {
    return this.request('/progress/dashboard');
  }
}

const api = new ApiClient();
window.api = api;
window.ApiClient = api;
