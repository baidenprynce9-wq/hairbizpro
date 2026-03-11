import api from './axiosInstance';

export const loginAdmin = (data) => api.post('/admin/login', data);
export const registerAdmin = (data) => api.post('/admin/register', data);
export const getAdminProfile = () => api.get('/admin/profile');
export const getBusinessInfo = (adminId) => api.get(`/admin/business/${adminId}`);
