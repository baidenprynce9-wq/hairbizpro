import api from './axiosInstance';
import axios from 'axios';

export const getProducts = () => api.get('/products');
export const addProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getLowStockProducts = () => api.get('/products/low-stock');

// Public — for customer order form
export const getPublicProducts = (adminId) => axios.get(`/api/products/public/${adminId}`);
