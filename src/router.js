import axios from 'axios';

// 使用相对路径，通过代理访问 API
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? '/api/v1'  // 生产环境使用相对路径，由 Nginx 代理
    : '/api/v1',  // 开发环境也使用相对路径，由 Vite 代理
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
  },

  // 更新用户头像
  updateAvatar: async (userId, file) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please upload an image file.');
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('new_avatar', file, file.name); // 添加文件名
    
    return api.post('/modify/modify_avatar', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // 更新用户邮箱
  updateEmail: async (userId, newEmail) => {
    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('new_email', newEmail);
    
    return api.post('/modify/modify_email', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  // 更新用户资料
  updateUserProfile: async (userData) => {
    const formData = new URLSearchParams();
    
    // 遍历对象中的所有键值对并添加到表单数据中
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    
    return api.post('/modify/modify_profile', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 更新用户头衔/职称
  updateTitle: async (userId, newTitle) => {
    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('new_title', newTitle);
    
    return api.post('/modify/modify_title', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 更新用户简介
  updateBio: async (userId, newBio) => {
    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('new_bio', newBio);
    
    return api.post('/modify/modify_bio', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 更新用户URL
  updateUrl: async (userId, newUrl) => {
    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('new_url', newUrl);
    
    return api.post('/modify/modify_url', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 更新用户设置
  updateSettings: async (userId, settings) => {
    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    
    // 添加所有设置项
    if (settings.public_posts !== undefined) {
      formData.append('new_public_posts', settings.public_posts);
    }
    if (settings.public_activities !== undefined) {
      formData.append('new_public_activities', settings.public_activities);
    }
    if (settings.public_profile !== undefined) {
      formData.append('new_public_profile', settings.public_profile);
    }
    if (settings.public_statistics !== undefined) {
      formData.append('new_public_statistics', settings.public_statistics);
    }
    if (settings.public_contact !== undefined) {
      formData.append('new_public_contact', settings.public_contact);
    }
    
    return api.post('/modify/modify_settings', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 更新用户电话
  updatePhone: async (userId, newPhone) => {
    const formData = new URLSearchParams();
    formData.append('user_id', userId);
    formData.append('new_phone', newPhone);
    
    return api.post('/modify/modify_phone', formData, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },

  // 获取用户个人信息
  getPersonInformation: async (userId) => {
    return api.get(`/auth/person_information?user_id=${userId}`);
  },
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

  // 获取帖子列表 - 更新为支持更多参数
  getPosts: async (params = {}) => {
    const defaultParams = {
      skip: 0,
      limit: 12,
      sort_by: 'time_desc', // 默认按时间降序排序
      include_hidden: false
    };
    
    // 合并默认参数和用户提供的参数
    const queryParams = { ...defaultParams, ...params };
    
    return api.get('/media/list', { 
      params: queryParams
    });
  },

  // 上传文件并创建论坛帖子
  createForumPost: async (files, postData, config = {}) => {
    const formData = new FormData();
    
    // 添加多个文件
    if (Array.isArray(files)) {
      files.forEach(file => {
        formData.append('files', file);
      });
    } else if (files) {
      // 单个文件的情况
      formData.append('files', files);
    }
    
    // 添加帖子数据
    if (postData.title) formData.append('title', postData.title);
    if (postData.summary !== undefined) formData.append('summary', postData.summary);
    if (postData.content !== undefined) formData.append('content', postData.content);
    if (postData.tags !== undefined) formData.append('tags', postData.tags);
    if (postData.ai_instruction !== undefined) formData.append('ai_instruction', postData.ai_instruction);
    if (postData.visibility !== undefined) formData.append('visibility', postData.visibility);
    
    return api.post('/media/upload', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // 点赞/取消点赞帖子
  toggleLike: async (postId) => {
    return api.post(`/media/${postId}/like`);
  },

  // 获取帖子评论
  getPostComments: async (postId, skip = 0, limit = 2000) => {
    try {
      const response = await api.get(`/comments/post/${postId}?skip=${skip}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('获取评论失败:', error);
      throw error;
    }
  },

  // 发表评论 - 更新为支持完整的评论结构
  createComment: async (commentData) => {
    try {
      // 使用 JSON 格式发送请求
      const response = await api.post('/comments/create', commentData, {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('发表评论失败:', error);
      throw error;
    }
  },
  
  // 回复评论 (level 2 或 level 3)
  replyToComment: async (postId, content, parentId, rootId) => {
    try {
      const commentData = {
        postId,
        content,
        imageUrl: "", // 暂时不支持图片
        parentId,
        rootId
      };
      
      const response = await api.post('/comments/create', commentData, {
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('回复评论失败:', error);
      throw error;
    }
  },
  
  // 点赞评论
  likeComment: async (commentId) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      return response;
    } catch (error) {
      console.error('点赞评论失败:', error);
      throw error;
    }
  }
};

export default api;

