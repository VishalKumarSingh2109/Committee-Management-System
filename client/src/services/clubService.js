import api from '../api/axiosInstance';

export const getClubInfo = () => api.get('/club');
