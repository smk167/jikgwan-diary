import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export const getRecords = (params) => api.get('/api/records', { params });
export const getRecord = (id) => api.get(`/api/records/${id}`);
export const createRecord = (data) => api.post('/api/records', data);
export const updateRecord = (id, data) => api.put(`/api/records/${id}`, data);
export const deleteRecord = (id) => api.delete(`/api/records/${id}`);

// [PHOTOS DISABLED]
// export const uploadPhotos = (recordId, formData) =>
//   api.post(`/api/photos/${recordId}`, formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// export const deletePhoto = (id) => api.delete(`/api/photos/${id}`);

export const getStats = () => api.get('/api/stats');
export const getKboTeams = () => api.get('/api/kbo/teams');

export default api;
