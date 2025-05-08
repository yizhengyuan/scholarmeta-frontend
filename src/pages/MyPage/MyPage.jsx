import React, { useRef, useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEdit, FaComment, FaHeart, FaLink, FaSignOutAlt, FaChartLine, FaFileAlt, FaUserEdit, FaExternalLinkAlt, FaWallet, FaCog, FaPlus, FaCheck, FaTimes, FaEnvelope, FaPhone, FaPlay } from 'react-icons/fa';
import { Web3Context } from '../../context/Web3Context';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './MyPage.css';
import LoginPage from '../../components/LoginPage';
import Settings from '../../components/Settings';
import Loading from '../../components/public_base_component/loading';
import { authAPI } from '../../router';
import ForumGrid from '../../components/ForumGrid';
import ErrorUI from '../../components/public_base_component/error';
import ErrorWindow from '../../components/public_base_component/ErrorWindow';

// 在组件顶部添加缓存相关的常量
const USER_DATA_CACHE_KEY = 'mypage_user_data_cache';

// 预加载缓存数据的函数
const getInitialUserData = () => {
  try {
    const cachedData = localStorage.getItem(USER_DATA_CACHE_KEY);
    const token = localStorage.getItem('access_token');
    
    // 如果有缓存数据且有token，使用缓存数据
    if (cachedData && token) {
      return JSON.parse(cachedData);
    }
  } catch (e) {
    console.error('解析缓存数据失败:', e);
  }
  
  // 默认返回空对象
  return {
    username: '',
    nickname: '',
    avatar: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    url: '',
    tags: [],
    self_page: '',
    settings: {
      public_posts: false,
      public_activities: false,
      public_profile: true,
      public_statistics: false,
      public_contact: false
    },
    stats: {
      posts: 0,
      comments: 0,
      likes: 0,
      activity_level: ''
    },
    posts: [],
    comments: [],
    likes: [],
    created_at: new Date().toISOString()
  };
};

// 预加载编辑值
const getInitialEditValues = (userData) => {
  return {
    username: userData.username || '',
    title: userData.title || '',
    bio: userData.bio || '',
    url: userData.url || ''
  };
};

// 检查是否需要显示登录页面
const shouldShowLogin = () => {
  return !localStorage.getItem('access_token');
};

// 添加视频预览图生成函数
const generateVideoThumbnail = (videoUrl, videoElement) => {
  return new Promise((resolve, reject) => {
    // 如果已经有视频元素，使用它
    const video = videoElement || document.createElement('video');
    
    // 设置视频属性
    video.autoplay = false;
    video.muted = true;
    video.src = videoUrl;
    video.crossOrigin = "anonymous"; // 允许跨域视频处理
    
    // 监听元数据加载完成事件
    video.onloadedmetadata = () => {
      // 设置视频时间到第一帧
      video.currentTime = 0.1; // 略微偏移以确保加载第一帧
    };
    
    // 监听视频可以播放事件
    video.oncanplay = () => {
      // 创建一个 canvas 元素
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 在 canvas 上绘制视频当前帧
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 将 canvas 转换为图片 URL
      try {
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        // 清理资源
        if (!videoElement) {
          video.pause();
          video.src = '';
          video.load();
        }
        resolve(thumbnailUrl);
      } catch (e) {
        console.error("无法生成视频缩略图:", e);
        reject(e);
      }
    };
    
    // 错误处理
    video.onerror = (e) => {
      console.error("视频加载失败:", e);
      reject(new Error("视频加载失败"));
    };
    
    // 设置超时
    const timeout = setTimeout(() => {
      if (!videoElement) {
        video.pause();
        video.src = '';
        video.load();
      }
      reject(new Error("视频缩略图生成超时"));
    }, 5000);
    
    // 清除超时
    video.oncanplay = function() {
      clearTimeout(timeout);
      // 在 canvas 上绘制视频当前帧
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // 将 canvas 转换为图片 URL
      try {
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        // 清理资源
        if (!videoElement) {
          video.pause();
          video.src = '';
          video.load();
        }
        resolve(thumbnailUrl);
      } catch (e) {
        console.error("无法生成视频缩略图:", e);
        reject(e);
      }
    };
  });
};

// 在渲染视频的地方使用这个函数
const renderVideoWithThumbnail = (videoUrl, videoId) => {
  const videoRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(true);
  
  useEffect(() => {
    // 尝试生成缩略图
    if (videoUrl && videoRef.current) {
      setIsGeneratingThumbnail(true);
      generateVideoThumbnail(videoUrl, videoRef.current)
        .then(thumbnailUrl => {
          setThumbnail(thumbnailUrl);
          setIsGeneratingThumbnail(false);
        })
        .catch(err => {
          console.error("生成缩略图失败:", err);
          setIsGeneratingThumbnail(false);
          // 使用默认的 Web3 图片作为备用
          setThumbnail("https://images.unsplash.com/photo-1642059889111-25b8f7975aec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");
        });
    }
  }, [videoUrl]);
  
  return (
    <div className="video-container">
      {isGeneratingThumbnail && (
        <div className="thumbnail-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      <video 
        ref={videoRef}
        id={`video-${videoId}`}
        src={videoUrl}
        className="post-video"
        poster={thumbnail || "https://images.unsplash.com/photo-1642059889111-25b8f7975aec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"}
        controls={false}
        playsInline
        onError={(e) => {
          console.log("视频加载失败，显示备用图片");
          const imgElement = document.createElement('img');
          imgElement.src = "https://images.unsplash.com/photo-1642059889111-25b8f7975aec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
          imgElement.className = "post-image";
          imgElement.alt = "Web3 visualization";
          e.target.parentNode.replaceChild(imgElement, e.target);
        }}
      />
      <div className="video-play-button">
        <FaPlay />
      </div>
    </div>
  );
};

function MyPage() {
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();
  const { isConnected, address, disconnect } = useContext(Web3Context);
  const [activeTab, setActiveTab] = useState('profile');
  
  // 使用预加载的数据初始化状态
  const [showLogin, setShowLogin] = useState(shouldShowLogin());
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [userData, setUserData] = useState(getInitialUserData);
  const [loading, setLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState({
    username: false,
    title: false,
    url: false
  });
  const [editValues, setEditValues] = useState(() => getInitialEditValues(getInitialUserData()));
  const fileInputRef = useRef(null);
  const [errorWindow, setErrorWindow] = useState(null);
  
  // 处理头像加载失败 - 使用更可靠的备用图片资源
  const handleAvatarError = (e) => {
    e.target.onerror = null; // 防止无限循环
    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.username || 'User'); // 使用基于用户名生成的头像
  };
  
  // 在 useEffect 中修改初始化逻辑
  useEffect(() => {
    const initPage = async () => {
      console.log('MyPage 初始化开始');
      
      // 检查是否有 token
      const token = localStorage.getItem('access_token');
      console.log('Token 存在:', !!token);
      
      if (!token) {
        console.log('无 token，显示登录页面');
        setShowLogin(true);
        return;
      }
      
      // 检查缓存中是否有用户数据
      const cachedUserData = localStorage.getItem(USER_DATA_CACHE_KEY);
      console.log('缓存数据存在:', !!cachedUserData);
      
      if (cachedUserData) {
        try {
          // 如果有缓存数据，我们已经在初始状态中使用了它
          // 这里只需要验证一下数据是否有效，不需要再次设置状态
          console.log('缓存数据已在初始化时加载');
          
          // 可选：在后台静默更新数据
          // 如果不需要后台更新，可以注释或删除以下代码
          if (false) { // 将此处改为 false 以禁用后台更新
            console.log('将在后台静默更新数据');
            setTimeout(() => {
              refreshUserData(false);
            }, 1000);
          } else {
            console.log('使用缓存数据，不进行后台更新');
          }
          
          return;
        } catch (error) {
          console.error('缓存数据解析失败:', error);
          // 如果解析缓存数据出错，继续获取新数据
        }
      }
      
      // 如果没有缓存数据，则从后端获取
      console.log('没有缓存数据，从后端获取');
      await refreshUserData(true);
    };
    
    // 从后端刷新用户数据的函数
    const refreshUserData = async (showLoading) => {
      console.log('从后端获取数据, 显示加载状态:', showLoading);
      
      if (showLoading) {
        setLoadingStartTime(Date.now());
        setLoading(true);
      }
      
      try {
        const data = await authAPI.getMe();
        console.log('后端数据获取成功');
        
        setUserData(data);
        setEditValues({
          username: data.username || '',
          title: data.title || '',
          bio: data.bio || '',
          url: data.url || ''
        });
        setIsAuthenticated(true);
        
        // 将获取的数据存入缓存
        localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(data));
        console.log('数据已缓存');
        
        // 如果显示加载状态，确保加载动画至少显示1秒
        if (showLoading) {
          const elapsedTime = Date.now() - loadingStartTime;
          const minDuration = 1000;
          if (elapsedTime < minDuration) {
            await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
          }
        }
      } catch (error) {
        console.error('获取用户数据失败:', error);
        if (showLoading) {
          setError('Failed to load user data. Please try again.');
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        }
        console.log('MyPage 初始化完成');
      }
    };
    
    initPage();
  }, []);
  
  // 修改 handleLoginSuccess 函数，简化调试日志
  const handleLoginSuccess = async (initialUserData) => {
    console.log('登录成功，开始处理');
    
    setIsAuthenticated(true);
    setUserData(initialUserData);
    setShowLogin(false);
    
    // 开始加载状态
    setLoadingStartTime(Date.now());
    setLoading(true);
    
    try {
      // 获取完整的用户数据
      console.log('获取完整用户数据');
      const data = await authAPI.getMe();
      
      // 更新用户数据
      const updatedUserData = {
        ...initialUserData,
        ...data,
        settings: {
          ...initialUserData.settings,
          ...(data.settings || {})
        },
        stats: {
          ...initialUserData.stats,
          ...(data.stats || {})
        },
        posts: data.posts || [],
        comments: data.comments || [],
        likes: data.likes || []
      };
      
      // 设置状态
      setUserData(updatedUserData);
      
      // 更新编辑值
      setEditValues({
        username: data.username || initialUserData.username,
        title: data.title || initialUserData.title,
        bio: data.bio || '',
        url: data.url || initialUserData.url
      });
      
      // 将完整数据存入缓存
      localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(updatedUserData));
      console.log('完整数据已缓存');
      
      // 确保加载动画至少显示1秒
      const elapsedTime = Date.now() - loadingStartTime;
      const minDuration = 1000;
      if (elapsedTime < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
      }
    } catch (error) {
      console.error('获取完整用户数据失败:', error);
    } finally {
      setLoading(false);
      console.log('登录处理完成');
    }
  };
  
  // 修改 handleLogout 函数，添加清除缓存
  const handleLogout = async () => {
    console.log('开始注销');
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('注销失败:', error);
    } finally {
      // 清除 token 和缓存数据
      localStorage.removeItem('access_token');
      localStorage.removeItem(USER_DATA_CACHE_KEY); // 清除缓存的用户数据
      console.log('已清除 token 和缓存');
      
      setIsAuthenticated(false);
      setShowLogin(true);
      setUserData({
        username: 'Guest User',
        nickname: 'Guest',
        avatar: 'https://i.pravatar.cc/300?img=68',
        title: 'New Member',
        bio: 'Welcome to my profile page. I haven\'t added a bio yet.',
        email: 'user@example.com',
        phone: '+1 (555) 123-4567',
        url: 'https://example.com',
        tags: ['new', 'member'],
        self_page: 'my-page',
        settings: {
          public_posts: false,
          public_activities: false,
          public_profile: true,
          public_statistics: false,
          public_contact: false
        },
        stats: {
          posts: 0,
          comments: 0,
          likes: 0,
          activity_level: 'Beginner'
        },
        posts: [],
        comments: [],
        likes: [],
        created_at: new Date().toISOString()
      });
    }
  };
  
  useEffect(() => {
    // Reset scroll position
    window.scrollTo(0, 0);
    
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
    
    // Particles background effect
    const canvas = particlesRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(97, 218, 251, ${Math.random() * 0.5 + 0.2})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const createParticles = () => {
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const connectParticles = () => {
      const maxDistance = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            const opacity = 1 - (distance / maxDistance);
            ctx.strokeStyle = `rgba(97, 218, 251, ${opacity * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', resizeCanvas);
      particles = [];
    };
  }, [showLogin]);
  
  const handleNewPost = () => {
    navigate('/upload');  // 跳转到上传页面
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    
    // 检查文件类型是否为图片
    if (!file.type.startsWith('image/')) {
      setErrorWindow({
        message: 'Invalid file type',
        details: 'Please upload an image file (PNG, JPEG, etc.)',
        type: 'error',
        duration: 5000
      });
      return;
    }

    // 保存更新前的状态，以便在失败时回退
    const previousState = { ...userData };
    
    try {
      // 创建临时的本地预览URL
      const previewUrl = URL.createObjectURL(file);
      
      // 立即更新前端显示
      setUserData(prev => ({
        ...prev,
        avatar: previewUrl
      }));
      
      // 将文件直接发送到后端
      const userId = userData._id || '';
      await authAPI.updateAvatar(userId, file);
      console.log('Successfully updated avatar on backend');
      
      // 更新缓存
      updateLocalCache('avatar', previewUrl);
    } catch (error) {
      console.error('Failed to update avatar on backend:', error);
      
      // 回退到之前的状态
      setUserData(previousState);
      
      setErrorWindow({
        message: 'failed to update avatar',
        details: error.message || 'please try again later',
        type: 'error',
        duration: 5000
      });
    }
  };

  const handleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: true });
    setEditValues({ ...editValues, [field]: userData[field] });
  };

  const handleInputChange = (field, value) => {
    setEditValues({ ...editValues, [field]: value });
  };

  const handleSave = async (field) => {
    try {
      // 保存更新前的状态，以便在失败时回退
      const previousState = { ...userData };
      
      // 立即更新前端显示，提升用户体验
      setUserData({ ...userData, [field]: editValues[field] });
      setIsEditing({ ...isEditing, [field]: false });
      
      // 获取用户ID
      const userId = userData._id || '';
      
      // 根据字段类型选择不同的API调用
      if (field === 'title') {
        try {
          await authAPI.updateTitle(userId, editValues[field]);
          console.log(`Successfully updated ${field} on backend`);
          
          // 更新成功后，更新缓存
          updateLocalCache(field, editValues[field]);
        } catch (error) {
          console.error(`Failed to update ${field} on backend:`, error);
          
          // 回退到之前的状态
          setUserData(previousState);
          
          // 显示错误提示窗口
          setErrorWindow({
            message: 'failed to update title',
            details: error.message || 'please try again later',
            type: 'error',
            duration: 5000
          });
        }
      } else if (field === 'bio') {
        try {
          await authAPI.updateBio(userId, editValues[field]);
          console.log(`Successfully updated ${field} on backend`);
          
          // 更新成功后，更新缓存
          updateLocalCache(field, editValues[field]);
        } catch (error) {
          console.error(`Failed to update ${field} on backend:`, error);
          
          // 回退到之前的状态
          setUserData(previousState);
          
          // 显示错误提示窗口
          setErrorWindow({
            message: 'failed to update bio',
            details: error.message || 'please try again later',
            type: 'error',
            duration: 5000
          });
        }
      } else if (field === 'url') {
        try {
          await authAPI.updateUrl(userId, editValues[field]);
          console.log(`Successfully updated ${field} on backend`);
          
          // 更新成功后，更新缓存
          updateLocalCache(field, editValues[field]);
        } catch (error) {
          console.error(`Failed to update ${field} on backend:`, error);
          
          // 回退到之前的状态
          setUserData(previousState);
          
          // 显示错误提示窗口
          setErrorWindow({
            message: 'failed to update url',
            details: error.message || 'please try again later',
            type: 'error',
            duration: 5000
          });
        }
      } else {
        // 处理其他字段的更新
        try {
          await authAPI.updateUserProfile({ [field]: editValues[field] });
          console.log(`Successfully updated ${field} on backend`);
          
          // 更新成功后，更新缓存
          updateLocalCache(field, editValues[field]);
        } catch (error) {
          console.error(`Failed to update ${field} on backend:`, error);
          
          // 回退到之前的状态
          setUserData(previousState);
          
          // 显示错误提示窗口
          setErrorWindow({
            message: `failed to update ${field}`,
            details: error.message || 'please try again later',
            type: 'error',
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error(`Error in handleSave for ${field}:`, error);
      
      // 如果发生严重错误，可以回滚到原始状态
      setEditValues({ ...editValues, [field]: userData[field] });
      
      // 显示错误提示窗口
      setErrorWindow({
        message: 'failed to update',
        details: error.message || 'please try again later',
        type: 'error',
        duration: 5000
      });
    }
  };

  // 添加一个辅助函数来更新本地缓存
  const updateLocalCache = (field, value) => {
    const cachedUserData = localStorage.getItem(USER_DATA_CACHE_KEY);
    if (cachedUserData) {
      try {
        const parsedData = JSON.parse(cachedUserData);
        parsedData[field] = value;
        localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(parsedData));
      } catch (error) {
        console.error('Failed to update cached user data:', error);
      }
    }
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    setEditValues({ ...editValues, [field]: userData[field] });
  };

  // 处理设置更新
  const handleSettingsUpdate = async (updatedSettings) => {
    // 获取用户ID
    const userId = userData._id || '';
    
    // 保存更新前的状态，以便在失败时回退
    const previousState = { ...userData };
    
    // 立即更新前端显示
    setUserData(prevData => {
      // 如果更新包含设置
      if (updatedSettings.settings) {
        return {
          ...prevData,
          settings: {
            ...prevData.settings,
            ...updatedSettings.settings
          }
        };
      }
      // 如果更新包含其他字段（如联系信息）
      return {
        ...prevData,
        ...updatedSettings
      };
    });
    
    // 检查是否更新了邮箱
    if (updatedSettings.email) {
      try {
        await authAPI.updateEmail(userId, updatedSettings.email);
        console.log('Successfully updated email on backend');
        
        // 更新缓存中的邮箱
        updateLocalCache('email', updatedSettings.email);
      } catch (error) {
        console.error('Failed to update email on backend:', error);
        
        // 回退到之前的状态
        setUserData(previousState);
        
        // 显示错误提示窗口
        setErrorWindow({
          message: 'Failed to update email',
          details: error.message || 'Please try again later',
          type: 'error',
          duration: 5000
        });
      }
    }
    
    // 检查是否更新了电话
    if (updatedSettings.phone) {
      try {
        await authAPI.updatePhone(userId, updatedSettings.phone);
        console.log('Successfully updated phone on backend');
        
        // 更新缓存中的电话
        updateLocalCache('phone', updatedSettings.phone);
      } catch (error) {
        console.error('Failed to update phone on backend:', error);
        
        // 回退到之前的状态
        setUserData(previousState);
        
        // 显示错误提示窗口
        setErrorWindow({
          message: 'Failed to update phone',
          details: error.message || 'Please try again later',
          type: 'error',
          duration: 5000
        });
      }
    }
    
    // 检查是否更新了设置
    if (updatedSettings.settings) {
      try {
        // 调用更新设置的API
        await authAPI.updateSettings(userId, updatedSettings.settings);
        console.log('Successfully updated settings on backend');
        
        // 更新缓存中的设置
        const cachedUserData = localStorage.getItem(USER_DATA_CACHE_KEY);
        if (cachedUserData) {
          try {
            const parsedData = JSON.parse(cachedUserData);
            parsedData.settings = {
              ...parsedData.settings,
              ...updatedSettings.settings
            };
            localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(parsedData));
          } catch (error) {
            console.error('Failed to update cached settings data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to update settings on backend:', error);
        
        // 回退到之前的状态
        setUserData(previousState);
        
        // 显示错误提示窗口
        setErrorWindow({
          message: 'Failed to update settings',
          details: error.message || 'Please try again later',
          type: 'error',
          duration: 5000
        });
      }
    }
    
    console.log('Sending settings update to backend:', updatedSettings);
  };

  // 处理重试
  const handleRetry = () => {
    setError(null);
    checkAuthAndFetchData();
  };

  // 处理错误页面的返回按钮 - 清除 token 并跳转到登录页面
  const handleErrorBack = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setShowLogin(true);
    setError(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-title">
                <h2>Posts</h2>
                <span className="mp-post-count">({userData.posts.length} posts)</span>
              </div>
              <button className="mp-new-post-btn" onClick={handleNewPost}>
                <FaPlus />
                <span>New Post</span>
              </button>
            </div>
            
            {userData.posts && userData.posts.length > 0 ? (
              <ForumGrid 
                posts={userData.posts}
                loading={false}
                error={null}
                searchTerm=""
                sortBy={null}
              />
            ) : (
              <div className="mp-empty-state">
                <div className="mp-empty-icon">
                  <FaFileAlt />
                </div>
                <h3>No Posts Yet</h3>
                <p>You haven't created any posts yet. Share your thoughts with the community!</p>
                <button className="mp-create-first-btn" onClick={handleNewPost}>
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="mp-profile-section">
            <div className="mp-profile-section-header">
              <h2>Profile</h2>
              <button className="mp-edit-button" onClick={() => handleEdit('bio')} title="Edit Bio">
                <FaEdit />
              </button>
            </div>
            {isEditing.bio ? (
              <div className="mp-bio-edit-field">
                <textarea
                  value={editValues.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) handleSave('bio');
                    if (e.key === 'Escape') handleCancel('bio');
                  }}
                  placeholder="Write something about yourself..."
                  maxLength={500}
                  autoFocus
                />
                <div className="mp-edit-actions">
                  <FaCheck onClick={() => handleSave('bio')} />
                  <FaTimes onClick={() => handleCancel('bio')} />
                </div>
              </div>
            ) : (
              <div className="mp-bio">
                <pre>{userData.bio}</pre>
              </div>
            )}
            
            <div className="mp-stats-cards">
              <div className="mp-stat-card" data-aos="fade-up">
                <div className="mp-stat-icon">
                  <FaFileAlt />
                </div>
                <div className="mp-stat-value">{userData.stats.posts}</div>
                <div className="mp-stat-label">Posts</div>
              </div>
              
              <div className="mp-stat-card" data-aos="fade-up" data-aos-delay="100">
                <div className="mp-stat-icon">
                  <FaComment />
                </div>
                <div className="mp-stat-value">{userData.stats.comments}</div>
                <div className="mp-stat-label">Comments</div>
              </div>
              
              <div className="mp-stat-card" data-aos="fade-up" data-aos-delay="200">
                <div className="mp-stat-icon">
                  <FaHeart />
                </div>
                <div className="mp-stat-value">{userData.stats.likes}</div>
                <div className="mp-stat-label">Likes</div>
              </div>
            </div>
          </div>
        );

      case 'comments':
        return (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-title">
                <h2>Comments</h2>
                <span className="mp-post-count">({userData.comments.length} comments)</span>
              </div>
            </div>
            
            {userData.comments && userData.comments.length > 0 ? (
              <ForumGrid 
                posts={userData.comments}
                loading={false}
                error={null}
                searchTerm=""
                sortBy={null}
              />
            ) : (
              <div className="mp-empty-state">
                <div className="mp-empty-icon">
                  <FaComment />
                </div>
                <h3>No Comments Yet</h3>
                <p>You haven't commented on any posts yet. Join the conversation!</p>
                <button className="mp-browse-posts-btn" onClick={() => navigate('/forum')}>
                  Browse Posts
                </button>
              </div>
            )}
          </div>
        );

      case 'likes':
        return (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-title">
                <h2>Likes</h2>
                <span className="mp-post-count">({userData.likes.length} likes)</span>
              </div>
            </div>
            
            {userData.likes && userData.likes.length > 0 ? (
              <ForumGrid 
                posts={userData.likes}
                loading={false}
                error={null}
                searchTerm=""
                sortBy={null}
              />
            ) : (
              <div className="mp-empty-state">
                <div className="mp-empty-icon">
                  <FaHeart />
                </div>
                <h3>No Likes Yet</h3>
                <p>You haven't liked any posts yet. Explore the forum to find content you enjoy!</p>
                <button className="mp-browse-posts-btn" onClick={() => navigate('/forum')}>
                  Discover Content
                </button>
              </div>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className="mp-stats-section">
            <h2>Statistics</h2>
            
            <div className="mp-stats-grid">
              <div className="mp-stat-block" data-aos="fade-up">
                <div className="mp-stat-block-header">
                  <FaFileAlt className="mp-stat-block-icon" />
                  <h3>Posts</h3>
                </div>
                <div className="mp-stat-block-value">{userData.stats.posts}</div>
                <div className="mp-stat-block-desc">Total posts published</div>
                <div className="mp-stat-block-chart">
                  <div className="mp-chart-bar" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div className="mp-stat-block" data-aos="fade-up" data-aos-delay="100">
                <div className="mp-stat-block-header">
                  <FaComment className="mp-stat-block-icon" />
                  <h3>Comments</h3>
                </div>
                <div className="mp-stat-block-value">{userData.stats.comments}</div>
                <div className="mp-stat-block-desc">Total comments</div>
                <div className="mp-stat-block-chart">
                  <div className="mp-chart-bar" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="mp-stat-block" data-aos="fade-up" data-aos-delay="200">
                <div className="mp-stat-block-header">
                  <FaHeart className="mp-stat-block-icon" />
                  <h3>Likes</h3>
                </div>
                <div className="mp-stat-block-value">{userData.stats.likes}</div>
                <div className="mp-stat-block-desc">Total likes</div>
                <div className="mp-stat-block-chart">
                  <div className="mp-chart-bar" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="mp-stat-block" data-aos="fade-up" data-aos-delay="300">
                <div className="mp-stat-block-header">
                  <FaChartLine className="mp-stat-block-icon" />
                  <h3>Activity</h3>
                </div>
                <div className="mp-stat-block-value">87%</div>
                <div className="mp-stat-block-desc">Last 30 days activity</div>
                <div className="mp-stat-block-chart">
                  <div className="mp-chart-bar" style={{ width: '87%' }}></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="my-page-root">
        <canvas ref={particlesRef} className="particles-bg"></canvas>
        <div className="mp-loading-container">
          <Loading text="Loading user data" size="large" transparent={true} />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="my-page-root">
        <canvas ref={particlesRef} className="particles-bg"></canvas>
        <div className="mp-error-container">
          <ErrorUI 
            message={error.message}
            details={error.details}
            size="large"
            transparent={true}
            onRetry={handleRetry}
            showBack={true}
            onBack={handleErrorBack}
          />
        </div>
      </div>
    );
  }
  
  if (showLogin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (!userData || !userData.username) {
    return (
      <div className="my-page-root">
        <canvas ref={particlesRef} className="particles-bg"></canvas>
        <div className="mp-loading-spinner">Loading user data...</div>
      </div>
    );
  }
  
  return (
    <div className="my-page-root">
      <canvas ref={particlesRef} className="particles-bg"></canvas>
      
      <div className="my-page-content">
        <div className="mp-user-profile">
          <div className="mp-profile-header">
            <div className="mp-profile-info">
              <div className="mp-profile-avatar" onClick={handleAvatarClick}>
                <img 
                  src={userData.avatar} 
                  alt={userData.username} 
                  onError={handleAvatarError}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <div className="mp-profile-details">
                <div className="mp-profile-name">
                  {isEditing.username ? (
                    <div className="mp-edit-field">
                      <input
                        type="text"
                        value={editValues.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        maxLength={20}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('username');
                          if (e.key === 'Escape') handleCancel('username');
                        }}
                        autoFocus
                      />
                      <div className="mp-edit-actions">
                        <FaCheck onClick={() => handleSave('username')} />
                        <FaTimes onClick={() => handleCancel('username')} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {userData.username}
                      <button className="mp-edit-button" onClick={() => handleEdit('username')} title="Edit Username">
                        <FaEdit />
                      </button>
                    </>
                  )}
                </div>

                <div className="mp-profile-title">
                  {isEditing.title ? (
                    <div className="mp-edit-field">
                      <input
                        type="text"
                        value={editValues.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        maxLength={40}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('title');
                          if (e.key === 'Escape') handleCancel('title');
                        }}
                        autoFocus
                      />
                      <div className="mp-edit-actions">
                        <FaCheck onClick={() => handleSave('title')} />
                        <FaTimes onClick={() => handleCancel('title')} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {userData.title}
                      <button className="mp-edit-button" onClick={() => handleEdit('title')} title="Edit Title">
                        <FaEdit />
                      </button>
                    </>
                  )}
                </div>
                
                <div className="mp-profile-url">
                  {isEditing.url ? (
                    <div className="mp-edit-field">
                      <FaLink />
                      <input
                        type="text"
                        value={editValues.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        maxLength={60}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('url');
                          if (e.key === 'Escape') handleCancel('url');
                        }}
                        autoFocus
                      />
                      <div className="mp-edit-actions">
                        <FaCheck onClick={() => handleSave('url')} />
                        <FaTimes onClick={() => handleCancel('url')} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <FaLink />
                      <a href={userData.url} target="_blank" rel="noopener noreferrer">
                        {userData.url}
                        <FaExternalLinkAlt style={{ fontSize: '0.8rem', marginLeft: '4px' }} />
                      </a>
                      <button className="mp-edit-button" onClick={() => handleEdit('url')} title="Edit URL">
                        <FaEdit />
                      </button>
                    </>
                  )}
                </div>

                <div className="mp-profile-contact">
                  <div className="mp-contact-item">
                    <FaEnvelope />
                    <span>{userData.email}</span>
                  </div>
                  <div className="mp-contact-item">
                    <FaPhone />
                    <span>{userData.phone}</span>
                  </div>
                </div>
              </div>
              <div className="mp-action-buttons">
                <button 
                  className="mp-settings-button" 
                  onClick={() => setShowSettings(!showSettings)} 
                  title="Settings"
                >
                  <FaCog />
                  <span>Settings</span>
                </button>
                <button 
                  className="mp-logout-button" 
                  onClick={handleLogout} 
                  title="Logout"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
          
          {isConnected && (
            <div className="mp-wallet-info" data-aos="fade-up">
              <div className="mp-info-card">
                <div className="mp-card-header">
                  <div className="mp-card-title">
                    <FaWallet className="mp-card-icon" />
                    <h3>My Wallet</h3>
                  </div>
                  <div className="mp-network-badge">
                    {address}
                  </div>
                </div>
                <div className="mp-wallet-details">
                  <div className="mp-detail-row">
                    <div className="mp-detail-label">
                      <span className="mp-label-icon">📬</span>
                      Address
                    </div>
                    <div className="mp-address-container">
                      <span className="mp-detail-value">{address}</span>
                      <button 
                        className="mp-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(address);
                        }}
                      >
                        <FaFileAlt />
                      </button>
                    </div>
                  </div>
                  <div className="mp-detail-row">
                    <div className="mp-detail-label">
                      <span className="mp-label-icon">🌐</span>
                      Network
                    </div>
                    <span className="mp-detail-value network">{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mp-tabs">
            <div 
              className={`mp-tab ${activeTab === 'profile' ? 'mp-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser />
              <span>Profile</span>
            </div>
            <div 
              className={`mp-tab ${activeTab === 'posts' ? 'mp-active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <FaFileAlt />
              <span>Posts</span>
            </div>
            <div 
              className={`mp-tab ${activeTab === 'comments' ? 'mp-active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <FaComment />
              <span>Comments</span>
            </div>
            <div 
              className={`mp-tab ${activeTab === 'likes' ? 'mp-active' : ''}`}
              onClick={() => setActiveTab('likes')}
            >
              <FaHeart />
              <span>Likes</span>
            </div>
            <div 
              className={`mp-tab ${activeTab === 'stats' ? 'mp-active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <FaChartLine />
              <span>Statistics</span>
            </div>
          </div>
          
          <div className="mp-content-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mp-tab-content"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {showSettings && (
          <div className="mp-settings-modal">
            <Settings 
              onClose={() => setShowSettings(false)} 
              userData={userData} 
              onSettingsUpdate={handleSettingsUpdate}
            />
          </div>
        )}

        {/* 错误窗口 */}
        {errorWindow && (
          <ErrorWindow 
            message={errorWindow.message}
            details={errorWindow.details}
            type={errorWindow.type || 'error'}
            duration={errorWindow.duration || 5000}
            onClose={() => setErrorWindow(null)}
          />
        )}
      </div>
    </div>
  );
}

export default MyPage;