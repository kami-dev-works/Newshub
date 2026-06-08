import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  return '';
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}

export const newsApi = {
  getAll: (params) => api.get('/news', { params }),
  getById: (id) => api.get(`/news/${id}`),
  getByShortId: (shortId) => api.get(`/news/short/${shortId}`),
  getTop: () => api.get('/news/top'),
  getRecent: () => api.get('/news/recent'),
  getLocal: (location) => api.get('/news/local', { params: { location } }),
  getPending: (params) => api.get('/news/pending', { params }),
  getMySubmissions: () => api.get('/news/my-submissions'),
  create: (data) => api.post('/news', data),
  submit: (data) => api.post('/news/submit', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  updateStats: (id, data) => api.put(`/news/${id}/stats`, data),
  delete: (id) => api.delete(`/news/${id}`),
  approve: (id) => api.put(`/news/approve/${id}`),
  reject: (id) => api.put(`/news/reject/${id}`),
  like: (id) => api.post(`/news/${id}/like`),
  rate: (id, rating) => api.post(`/news/${id}/rate`, { rating }),
  getTRP: () => api.get('/news/trp'),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userApi = {
  getAll: (params) => api.get('/users', { params }),
  getAllWithPasswords: () => api.get('/users/with-passwords'),
  getStats: () => api.get('/users/stats'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, password) => api.put(`/users/${id}/password`, { password }),
  getLiked: () => api.get('/users/liked'),
  likeNews: (newsId) => api.post(`/users/like/${newsId}`),
};

export const uploadApi = {
  uploadProfile: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadNewsImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadNewsImageBase64: async (base64Image) => {
    return api.post('/upload/news/base64', { image: base64Image });
  },
};

export const commentApi = {
  getByNews: (newsId) => api.get(`/comments/${newsId}`),
  create: (newsId, content) => api.post(`/comments/${newsId}`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
};

export const adsApi = {
  getAll: () => api.get('/ads'),
  getAllAdmin: () => api.get('/ads/all'),
  create: (data) => api.post('/ads', data),
  delete: (id) => api.delete(`/ads/${id}`),
  click: (id) => api.post(`/ads/${id}/click`),
};

export default api;