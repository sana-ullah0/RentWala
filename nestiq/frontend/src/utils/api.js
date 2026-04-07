import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('nestiq_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nestiq_token');
      localStorage.removeItem('nestiq_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);
export const getMe    = ()     => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// ── Properties ───────────────────────────────────────────────────────────────
export const getProperties   = (params) => API.get('/properties', { params });
export const getProperty     = (id)     => API.get(`/properties/${id}`);
export const createProperty  = (data)   => API.post('/properties', data);
export const updateProperty  = (id, data) => API.put(`/properties/${id}`, data);
export const deleteProperty  = (id)     => API.delete(`/properties/${id}`);
export const updateStatus    = (id, status) => API.put(`/properties/${id}/status`, { status });
export const getMyListings   = ()       => API.get('/properties/owner/listings');
export const uploadImages    = (id, data) => API.post(`/properties/${id}/images`, data);

// ── Favorites ────────────────────────────────────────────────────────────────
export const getFavorites    = ()    => API.get('/favorites');
export const addFavorite     = (id)  => API.post(`/favorites/${id}`);
export const removeFavorite  = (id)  => API.delete(`/favorites/${id}`);
export const checkFavorite   = (id)  => API.get(`/favorites/check/${id}`);

// ── Notifications ────────────────────────────────────────────────────────────
export const getNotifications  = ()   => API.get('/notifications');
export const markRead          = (id) => API.put(`/notifications/${id}/read`);
export const markAllRead       = ()   => API.put('/notifications/read-all');
export const deleteNotification= (id) => API.delete(`/notifications/${id}`);

// ── Reports ──────────────────────────────────────────────────────────────────
export const submitReport = (data) => API.post('/reports', data);

// ── Admin ────────────────────────────────────────────────────────────────────
export const adminGetStats        = ()       => API.get('/admin/stats');
export const adminGetPending      = ()       => API.get('/admin/properties/pending');
export const adminGetProperties   = (params) => API.get('/admin/properties', { params });
export const adminApprove         = (id)     => API.put(`/admin/properties/${id}/approve`);
export const adminReject          = (id, reason) => API.put(`/admin/properties/${id}/reject`, { reason });
export const adminDeleteProperty  = (id)     => API.delete(`/admin/properties/${id}`);
export const adminGetUsers        = (params) => API.get('/admin/users', { params });
export const adminToggleUser      = (id)     => API.put(`/admin/users/${id}/toggle`);
export const adminGetReports      = ()       => API.get('/admin/reports');
export const adminUpdateReport    = (id, status) => API.put(`/admin/reports/${id}`, { status });

export default API;
