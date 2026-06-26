import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

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
