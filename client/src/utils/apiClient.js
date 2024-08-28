import axios from 'axios';
import {API_BASE_URL} from './util.js'

// 创建一个 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL, // 后端 API 的基础 URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
