import axios from 'axios';

const api = axios.create({

  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',

  timeout: 10000,

  headers: { 'Content-Type': 'application/json' },

});

api.interceptors.response.use(

  r => r,

  err => {

    const msg = err.response?.data?.error || err.message || 'Request failed';

    return Promise.reject(new Error(msg));

  }

);

export const employeeApi = {

  getAll: (params) => api.get('/employees', { params }).then(r => r.data),

  getById: (id) => api.get(`/employees/${id}`).then(r => r.data),

  create: (data) => api.post('/employees', data).then(r => r.data),

  update: (id, data) => api.put(`/employees/${id}`, data).then(r => r.data),

  remove: (id) => api.delete(`/employees/${id}`).then(r => r.data),

  getStats: () => api.get('/employees/stats/summary').then(r => r.data),

};

export const departmentApi = {

  getAll: () => api.get('/departments').then(r => r.data),

  create: (data) => api.post('/departments', data).then(r => r.data),

  update: (id, data) => api.put(`/departments/${id}`, data).then(r => r.data),

  remove: (id) => api.delete(`/departments/${id}`).then(r => r.data),

};
 