import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// 모든 요청에 로그인 토큰 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401(인증 만료/실패) 시 토큰 정리 후 로그인 화면으로
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/signup')) {
      localStorage.removeItem('token');
      localStorage.removeItem('myTeam');
      localStorage.removeItem('username');
      localStorage.removeItem('isAdmin');
      location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const signup = (data) => api.post('/api/auth/signup', data);
export const login = (data) => api.post('/api/auth/login', data);
export const getMe = () => api.get('/api/auth/me');
export const updateMyTeam = (team) => api.put('/api/auth/team', { team });
export const changePassword = (currentPassword, newPassword) =>
  api.put('/api/auth/password', { currentPassword, newPassword });
export const adminListUsers = () => api.get('/api/auth/admin/users');
export const adminResetPassword = (username, newPassword) =>
  api.post('/api/auth/admin/reset-password', { username, newPassword });

// 기록이 추가/수정/삭제되면 통계 등 다른 화면이 갱신할 수 있도록 알림
function notifyRecordsChanged() {
  window.dispatchEvent(new Event('records-changed'));
}

export const getRecords = (params) => api.get('/api/records', { params });
export const getRecord = (id) => api.get(`/api/records/${id}`);
export const createRecord = async (data) => {
  const res = await api.post('/api/records', data);
  notifyRecordsChanged();
  return res;
};
export const updateRecord = async (id, data) => {
  const res = await api.put(`/api/records/${id}`, data);
  notifyRecordsChanged();
  return res;
};
export const deleteRecord = async (id) => {
  const res = await api.delete(`/api/records/${id}`);
  notifyRecordsChanged();
  return res;
};

// [PHOTOS DISABLED]
// export const uploadPhotos = (recordId, formData) =>
//   api.post(`/api/photos/${recordId}`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// export const deletePhoto = (id) => api.delete(`/api/photos/${id}`);

export const getStats = () => api.get('/api/stats');
export const getKboTeams = () => api.get('/api/kbo/teams');
export const getGames = (date) => api.get('/api/games', { params: { date } });

export default api;
