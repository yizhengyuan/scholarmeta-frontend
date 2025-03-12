import axios from 'axios';

// 使用相对路径，通过代理访问 API
const api = axios.create({
  baseURL: '/api/v1',  // 修改为相对路径，会被代理到 https://47.80.10.180/api/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'  // 修改为 form-urlencoded
  }
});

// 请求拦截器
api.interceptors.request.use(config => {
  // 添加认证 token，确保格式与 Python 代码一致
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;  // 使用与 Python 相同的格式
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

// 认证相关 API
export const authAPI = {
  // 用户注册
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // 用户登录 - 修改为使用 URLSearchParams
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return api.post('/auth/token', formData);
  },

  // 获取用户信息
  getMe: async () => {
    return api.get('/auth/me');
  },

  // 用户登出
  logout: async () => {
    return api.post('/auth/logout');
  }
};

// 媒体服务相关 API
export const mediaAPI = {
  // 上传视频
  uploadVideo: async (file, title, description = '', tags = '', config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('media_type', 'video');

    return api.post('/media/upload', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传音频
  uploadAudio: async (file, title, description = '', tags = '', config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('media_type', 'audio');

    return api.post('/media/upload', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 上传普通文件到 IPFS
  uploadToIPFS: async (file, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/media/upload/ipfs', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 获取单个帖子详情
  getPostDetail: async (postId) => {
    return api.get(`/media/${postId}`);
  },

  // 获取帖子列表
  getPosts: async (params = {}) => {
    const defaultParams = {
      skip: 0,
      limit: 20,
      include_hidden: false
    };
    return api.get('/media/list', { 
      params: { ...defaultParams, ...params }
    });
  }
};

export default api;
