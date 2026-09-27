import api from '../api/axiosInstance';

export const getMembers = (params) => api.get('/members', { params });
export const getMember = (id) => api.get(`/members/${id}`);
export const getOwnMember = () => api.get('/members/me');
export const createMember = (payload) => api.post('/members', payload);
export const updateMember = (id, payload) => api.put(`/members/${id}`, payload);
export const deleteMember = (id, hard = false) => api.delete(`/members/${id}`, { params: { hard } });
export const resetMemberPassword = (id) => api.put(`/members/${id}/reset-password`);
