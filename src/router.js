import axios from 'axios';

// 使用相对路径，通过代理访问 API
const api = axios.create({
  baseURL: '/api/v1',  // 修改为相对路径，会被代理到 https://47.80.10.180/api/v1
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
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
    // 用户注册 - 更新注册接口，添加所有必要字段
  register: async (userData) => {
    const formData = new URLSearchParams();
    
    // 必填字段
    formData.append('username', userData.name);  // 用户名
    formData.append('password', userData.password);  // 密码
    
    // 可选字段
    formData.append('email', userData.email || 'user@chemlab.edu');  // 邮箱
    formData.append('phone', userData.phone || '+852 9876 5432');  // 香港手机号
    
    // 补充其他必要字段，使用合理的默认值
    formData.append('self_page', 'my-chemistry-lab');
    formData.append('bio', 'Chemistry enthusiast and lab researcher. Interested in experimental procedures and scientific discoveries.');
    formData.append('nickname', userData.name);  // 使用用户名作为默认昵称
    formData.append('url', 'https://chemlab.edu/researchers');
    formData.append('title', 'Chemistry Lab Researcher');
    formData.append('tags', 'chemistry,laboratory,research,science');
    formData.append('avatar', 'https://i.pravatar.cc/300');  // 随机头像
    
    return api.post('/auth/register', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 用户登录
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', username);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', 'string');
    formData.append('client_secret', 'string');
    
    return api.post('/auth/token', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
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
