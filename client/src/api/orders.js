import api from './axiosInstance';
import axios from 'axios';

export const getMyOrders = () => api.get('/orders/my-orders');
export const updateOrderStatus = (id, status) => api.put(`/orders/update-status/${id}`, { status });
export const getRevenueSummary = () => api.get('/orders/revenue-summary');
export const getDailyRevenue = () => api.get('/orders/daily-revenue');

// Public — no auth
export const placeOrder = (formData) => axios.post('/api/orders/place-order', formData);
