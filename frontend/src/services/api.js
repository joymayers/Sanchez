import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================
export const authAPI = {
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// ============================================
// EMPLOYEE ENDPOINTS
// ============================================
export const employeeAPI = {
  getAll: (page = 1, limit = 10, search = '', department_id = null) =>
    apiClient.get('/employees', {
      params: { page, limit, search, department_id },
    }),
  getById: (id) => apiClient.get(`/employees/${id}`),
  getDirectReports: (id) => apiClient.get(`/employees/${id}/reports`),
  create: (data) => apiClient.post('/employees', data),
  update: (id, data) => apiClient.put(`/employees/${id}`, data),
  delete: (id) => apiClient.delete(`/employees/${id}`),
};

// ============================================
// DEPARTMENT ENDPOINTS
// ============================================
export const departmentAPI = {
  getAll: () => apiClient.get('/departments'),
  getById: (id) => apiClient.get(`/departments/${id}`),
};

// ============================================
// LEAVE ENDPOINTS
// ============================================
export const leaveAPI = {
  getAll: (page = 1, limit = 10, status = null, employee_id = null) =>
    apiClient.get('/leave', {
      params: { page, limit, status, employee_id },
    }),
  getById: (id) => apiClient.get(`/leave/${id}`),
  create: (data) => apiClient.post('/leave', data),
  approve: (id) => apiClient.put(`/leave/${id}`, { status: 'APPROVED' }),
  reject: (id) => apiClient.put(`/leave/${id}`, { status: 'REJECTED' }),
  cancel: (id) => apiClient.delete(`/leave/${id}`),
};

// ============================================
// PERFORMANCE ENDPOINTS
// ============================================
export const performanceAPI = {
  getReviews: (page = 1, limit = 10, employee_id = null) =>
    apiClient.get('/performance', {
      params: { page, limit, employee_id },
    }),
  getReviewById: (id) => apiClient.get(`/performance/${id}`),
  createReview: (data) => apiClient.post('/performance', data),
  updateReview: (id, data) => apiClient.put(`/performance/${id}`, data),
  getFeedback: (reviewId) => apiClient.get(`/performance/${reviewId}/feedback`),
  submitFeedback: (reviewId, data) =>
    apiClient.post(`/performance/${reviewId}/feedback`, data),
  getFeedbackSubmittedBy: (employeeId) =>
    apiClient.get(`/performance/feedback-by/${employeeId}`),
};

// ============================================
// PAYROLL ENDPOINTS
// ============================================
export const payrollAPI = {
  getAll: (page = 1, limit = 10, employee_id = null, status = null) =>
    apiClient.get('/payroll', {
      params: { page, limit, employee_id, status },
    }),
  getById: (id) => apiClient.get(`/payroll/${id}`),
  create: (data) => apiClient.post('/payroll', data),
  update: (id, data) => apiClient.put(`/payroll/${id}`, data),
  getEmployeeHistory: (employeeId, limit = 12) =>
    apiClient.get(`/payroll/employee/${employeeId}/history`, {
      params: { limit },
    }),
};

// ============================================
// TRAINING ENDPOINTS
// ============================================
export const trainingAPI = {
  getAll: (page = 1, limit = 10, employee_id = null, status = null) =>
    apiClient.get('/training', {
      params: { page, limit, employee_id, status },
    }),
  getById: (id) => apiClient.get(`/training/${id}`),
  create: (data) => apiClient.post('/training', data),
  update: (id, data) => apiClient.put(`/training/${id}`, data),
  getEmployeeHistory: (employeeId) =>
    apiClient.get(`/training/employee/${employeeId}/history`),
  getAvailablePrograms: () =>
    apiClient.get('/training/programs/available'),
};

// ============================================
// RECRUITMENT ENDPOINTS
// ============================================
export const recruitmentAPI = {
  getJobPostings: (page = 1, limit = 10, status = 'OPEN', department_id = null) =>
    apiClient.get('/recruitment/postings', {
      params: { page, limit, status, department_id },
    }),
  getJobPostingById: (id) => apiClient.get(`/recruitment/postings/${id}`),
  createJobPosting: (data) => apiClient.post('/recruitment/postings', data),
  updateJobPosting: (id, data) => apiClient.put(`/recruitment/postings/${id}`, data),
  
  getApplications: (page = 1, limit = 10, job_posting_id = null, status = null) =>
    apiClient.get('/recruitment/applications', {
      params: { page, limit, job_posting_id, status },
    }),
  getApplicationById: (id) => apiClient.get(`/recruitment/applications/${id}`),
  submitApplication: (data) => axios.post(`${API_BASE_URL}/recruitment/applications`, data),
  updateApplicationStatus: (id, status, notes = null) =>
    apiClient.put(`/recruitment/applications/${id}`, { status, notes }),
  hireApplicant: (id, data) =>
    apiClient.post(`/recruitment/applications/${id}/hire`, data),
  rejectApplication: (id, notes = null) =>
    apiClient.post(`/recruitment/applications/${id}/reject`, { notes }),
};

export default apiClient;
