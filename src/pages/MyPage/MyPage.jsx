import React, { useRef, useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEdit, FaComment, FaHeart, FaLink, FaSignOutAlt, FaChartLine, FaFileAlt, FaUserEdit, FaExternalLinkAlt, FaWallet, FaCog, FaPlus, FaCheck, FaTimes, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Web3Context } from '../../context/Web3Context';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './MyPage.css';
import LoginPage from '../../components/LoginPage';
import Settings from '../../components/Settings';
import Loading from '../../components/loading';
import { authAPI } from '../../router';
import ForumGrid from '../../components/ForumGrid';

function MyPage() {
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();
  const { isConnected, address, disconnect } = useContext(Web3Context);
  const [activeTab, setActiveTab] = useState('profile');
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState({
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
  const [loading, setLoading] = useState(true);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState({
    username: false,
    title: false,
    url: false
  });
  const [editValues, setEditValues] = useState({
    username: '',
    title: '',
    url: ''
  });
  const fileInputRef = useRef(null);
  
  // 处理头像加载失败 - 使用更可靠的备用图片资源
  const handleAvatarError = (e) => {
    e.target.onerror = null; // 防止无限循环
    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.username || 'User'); // 使用基于用户名生成的头像
  };
  
  // 检查认证状态和获取用户数据
  const checkAuthAndFetchData = async () => {
    setLoadingStartTime(Date.now()); // 记录加载开始时间
    setLoading(true); // 确保加载状态为 true
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      setShowLogin(true);
      setIsAuthenticated(false);
      
      // 确保加载动画至少显示1秒
      const elapsedTime = Date.now() - loadingStartTime;
      const minDuration = 1000; // 最小显示时间（1秒）
      
      if (elapsedTime < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
      }
      
      setLoading(false);
      return;
    }

    try {
      // 添加延时来模拟网络延迟
      console.log("开始模拟网络延迟...");
      await new Promise(resolve => setTimeout(resolve, 3500)); // 添加3.5秒的延时
      console.log("网络延迟模拟结束，开始获取数据...");
      
      const data = await authAPI.getMe();
      console.log("数据获取成功:", data);
      
      // 确保所有必要字段都有值，使用默认值填充缺失字段
      setUserData({
        ...userData, // 使用默认值作为基础
        ...data,     // 覆盖后端返回的数据
        // 确保嵌套对象也有默认值
        settings: {
          ...userData.settings,
          ...(data.settings || {})
        },
        stats: {
          ...userData.stats,
          ...(data.stats || {})
        },
        // 使用后端返回的真实数据，而不是模拟数据
        posts: data.posts || [],
        comments: data.comments || [],
        likes: data.likes || []
      });
      
      // 更新编辑值
      setEditValues({
        username: data.username || userData.username,
        title: data.title || userData.title,
        url: data.url || userData.url
      });
      
      setIsAuthenticated(true);
      setShowLogin(false);
      
      // 确保加载动画至少显示1秒
      const elapsedTime = Date.now() - loadingStartTime;
      const minDuration = 1000; // 最小显示时间（1秒）
      
      if (elapsedTime < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
      }
      
      console.log("数据处理完成，结束加载状态");
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('access_token');
      setShowLogin(true);
      setIsAuthenticated(false);
      setError('Failed to load user data. Please try again later.');
      
      // 确保加载动画至少显示1秒
      const elapsedTime = Date.now() - loadingStartTime;
      const minDuration = 1000; // 最小显示时间（1秒）
      
      if (elapsedTime < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsedTime));
      }
      
      setLoading(false);
    }
  };
  
  // 初始化检查
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);
  
  // 处理登录成功
  const handleLoginSuccess = async (initialUserData) => {
    setIsAuthenticated(true);
    setUserData(initialUserData);
    setShowLogin(false);
    
    // 确保加载动画至少显示1秒
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('access_token');
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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        // 立即更新前端显示
        setUserData(prev => ({
          ...prev,
          avatar: reader.result
        }));
        
        // 模拟向后端发送请求
        console.log('Sending avatar update to backend');
        
        // 实际的后端请求 - 当后端准备好时可以取消注释
        try {
          // 这里可能需要将 base64 转换为文件或使用适当的 API
          // await authAPI.updateAvatar(file);
          console.log('Successfully updated avatar on backend');
        } catch (error) {
          console.error('Failed to update avatar on backend:', error);
          // 可以选择是否显示错误提示
        }
      };
      reader.readAsDataURL(file);
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
      // 立即更新前端显示，提升用户体验
      setUserData({ ...userData, [field]: editValues[field] });
      setIsEditing({ ...isEditing, [field]: false });
      
      // 模拟向后端发送请求
      console.log(`Sending update to backend for field: ${field}, value: ${editValues[field]}`);
      
      // 实际的后端请求 - 当后端准备好时可以取消注释
      try {
        await authAPI.updateUserProfile({ [field]: editValues[field] });
        console.log(`Successfully updated ${field} on backend`);
      } catch (error) {
        console.error(`Failed to update ${field} on backend:`, error);
        // 可以选择是否在这里回滚UI状态
        // 如果后端请求失败，可以显示一个小提示而不是回滚整个UI
        // 这样用户体验会更好
      }
    } catch (error) {
      console.error(`Error in handleSave for ${field}:`, error);
      // 如果发生严重错误，可以回滚到原始状态
      setEditValues({ ...editValues, [field]: userData[field] });
    }
  };

  const handleCancel = (field) => {
    setIsEditing({ ...isEditing, [field]: false });
    setEditValues({ ...editValues, [field]: userData[field] });
  };

  // 处理设置更新
  const handleSettingsUpdate = async (updatedSettings) => {
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
    
    // 模拟向后端发送请求
    console.log('Sending settings update to backend:', updatedSettings);
    
    // 实际的后端请求 - 当后端准备好时可以取消注释
    try {
      // await authAPI.updateUserSettings(updatedSettings);
      console.log('Successfully updated settings on backend');
    } catch (error) {
      console.error('Failed to update settings on backend:', error);
      // 可以选择是否显示错误提示
    }
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
  
  if (error) {
    return (
      <div className="mp-error">
        <div className="mp-error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
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
                        maxLength={100}
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
      </div>
    </div>
  );
}

export default MyPage;