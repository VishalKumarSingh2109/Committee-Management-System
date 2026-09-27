import api from '../api/axiosInstance';

export const getPayments = (params) => api.get('/payments', { params });
export const getMonthlyPayments = (month, year) => api.get('/payments/monthly', { params: { month, year } });
export const getPaymentsDirectory = (month, year) => api.get('/payments/directory', { params: { month, year } });
export const getMemberPayments = (memberId) => api.get(`/payments/member/${memberId}`);
export const submitPayment = (payload) => api.post('/payments', payload);
export const updatePayment = (id, payload) => api.put(`/payments/${id}`, payload);
export const verifyPayment = (id, payload) => api.put(`/payments/${id}/verify`, payload);
export const downloadReceipt = (id) => api.get(`/payments/${id}/receipt`, { responseType: 'blob' });
export const exportPaymentsCsv = (params) => api.get('/payments/export', { params, responseType: 'blob' });
