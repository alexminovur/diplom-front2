import api from './api';

export const login = async (phone, code) => {
    const response = await api.post('/auth/verify', { phone, code });
    return response.data;
};

export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return token ? { token, role } : null;
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
