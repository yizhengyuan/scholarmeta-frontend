import axios from 'axios';

const API_BASE_URL = 'http://47.80.10.180:8000/api/v1';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 在这里可以添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    return Promise.reject(error);
  }
);

// 媒体服务相关 API
export const mediaAPI = {
  // 上传视频
  uploadVideo: async (file, title, description = '', tags = '', config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    return api.post('/media/upload/video', formData, config);
  },

  // 上传音频
  uploadAudio: async (file, title, description = '', tags = '', config = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    return api.post('/media/upload/audio', formData, config);
  },

  // 上传普通文件到 IPFS
  uploadToIPFS: async (file, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/media/upload/ipfs', formData, config);
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

// 导出 API 实例
export default api;
