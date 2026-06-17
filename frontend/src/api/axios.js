import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request Interceptor: Attach Token ────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('cc_token');
      const isAuthMe = error.config?.url?.includes('/auth/me');
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      // Only force-redirect if we had a token that the server rejected (expired/invalid).
      // Skip redirect for /auth/me (initial load check) or when no token existed.
      if (hadToken && !isAuthMe) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyOTP: (data) => API.post('/auth/verify-otp', data),
  resendOTP: (data) => API.post('/auth/resend-otp', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
  deleteAccount: (data) => API.delete('/auth/account', { data }),
};

// ─── Events ────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params) => API.get('/events', { params }),
  getOne: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/events/${id}`),
  getMyEvents: () => API.get('/events/my/events'),
  getParticipants: (id) => API.get(`/events/${id}/participants`),
  checkIn: (id, data) => API.post(`/events/${id}/checkin`, data),
};

// ─── Registrations ─────────────────────────────────────────────────────────────
export const registrationsAPI = {
  register: (data) => API.post('/registrations/register', data),
  getMyRegistrations: () => API.get('/registrations/my'),
  getOne: (id) => API.get(`/registrations/${id}`),
  cancel: (id, data) => API.put(`/registrations/${id}/cancel`, data),
  approve: (id) => API.put(`/registrations/${id}/approve`),
};

// ─── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createOrder: (data) => API.post('/payments/create-order', data),
  verifyPayment: (data) => API.post('/payments/verify', data),
  getMyPayments: () => API.get('/payments/my'),
  getEventPayments: (eventId) => API.get(`/payments/event/${eventId}`),
};

// ─── Clubs ─────────────────────────────────────────────────────────────────────
export const clubsAPI = {
  getAll: (params) => API.get('/clubs', { params }),
  getOne: (id) => API.get(`/clubs/${id}`),
  create: (data) => API.post('/clubs', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/clubs/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyClub: () => API.get('/clubs/my'),
};

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
};

// ─── Certificates ──────────────────────────────────────────────────────────────
export const certificatesAPI = {
  getMyCertificates: () => API.get('/certificates/my'),
  generate: (registrationId) => API.post(`/certificates/generate/${registrationId}`),
  verify: (code) => API.get(`/certificates/verify/${code}`),
  download: (id) => API.get(`/certificates/${id}/download`, { responseType: 'blob' }),
};

// ─── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: (params) => API.get('/admin/users', { params }),
  getAllClubs: () => API.get('/admin/clubs'),
  toggleUserActive: (id) => API.put(`/admin/users/${id}/toggle-active`),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  approveClub: (id) => API.put(`/admin/clubs/${id}/approve`),
  approveCoordinator: (id) => API.put(`/admin/coordinators/${id}/approve`),
};

export default API;
