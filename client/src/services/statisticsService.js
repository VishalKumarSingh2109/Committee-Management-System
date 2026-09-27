import api from '../api/axiosInstance';

export const getSummary = () => api.get('/statistics/summary');
export const getMonthlyStatistics = (year) => api.get('/statistics/monthly', { params: { year } });
export const getAllMembersStatistics = () => api.get('/statistics/members');
export const exportMembersCsv = () => api.get('/statistics/members/export', { responseType: 'blob' });
export const getMemberStatistics = (memberId) => api.get(`/statistics/member/${memberId}`);
