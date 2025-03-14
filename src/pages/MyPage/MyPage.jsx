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
import { authAPI } from '../../router';
import ForumGrid from '../../components/ForumGrid';

// 在组件顶部添加硬编码的联系信息
const contactInfo = {
  email: "example@web3.com",
  phone: "+1 (888) 888-8888"
};

function MyPage() {
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { web3State } = useContext(Web3Context);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState({
    name: false,
    title: false,
    url: false,
    bio: false
  });
  const [editValues, setEditValues] = useState({
    name: '',
    title: '',
    url: '',
    bio: ''
  });
  const fileInputRef = useRef(null);
  
  // 检查认证状态和获取用户数据
  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setShowLogin(true);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getMe();
      setUserData({
        // 真实数据
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        title: userData.title,
        url: userData.url,
        bio: userData.bio,
        created_at: userData.created_at,
        
        // 模拟数据
        stats: {
          posts: 12,
          comments: 48,
          likes: 156
        },
        posts: [
          {
            id: 1,
            title: "氯化钠溶液配制实验",
            preview: "本实验主要介绍如何正确配制氯化钠溶液...",
            likes: 42,
            comments: 15,
            date: "2024-03-20"
          },
          {
            id: 2,
            title: "酸碱滴定实验指南",
            preview: "详细讲解酸碱滴定的步骤和注意事项...",
            likes: 38,
            comments: 23,
            date: "2024-03-19"
          }
        ],
        comments: [
          {
            id: 1,
            postTitle: "实验室安全守则",
            content: "安全护目镜的使用非常重要，建议补充更多细节",
            date: "2024-03-18"
          },
          {
            id: 2,
            postTitle: "pH值测定方法",
            content: "这个方法很实用，我在实验中获益良多",
            date: "2024-03-17"
          }
        ],
        likes: [
          {
            id: 1,
            postTitle: "化学实验基础知识",
            author: "ChemTeacher",
            date: "2024-03-16"
          },
          {
            id: 2,
            postTitle: "实验器材使用指南",
            author: "LabExpert",
            date: "2024-03-15"
          }
        ],
        activities: [
          {
            id: 1,
            type: 'post',
            title: '氯化钠溶液配制实验',
            date: '2024-03-20'
          },
          {
            id: 2,
            type: 'comment',
            title: '酸碱滴定实验指南',
            date: '2024-03-19'
          },
          {
            id: 3,
            type: 'like',
            title: '实验室安全守则',
            date: '2024-03-18'
          }
        ],
        skills: [
          { name: '实验操作', level: 90 },
          { name: '数据分析', level: 85 },
          { name: '安全管理', level: 95 },
          { name: '实验设计', level: 80 }
        ]
      });
      setIsAuthenticated(true);
      setShowLogin(false);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('access_token');
      setShowLogin(true);
      setIsAuthenticated(false);
    } finally {
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
    setUserData({
      // 真实数据
      id: initialUserData.id,
      name: initialUserData.name,
      avatar: initialUserData.avatar,
      title: initialUserData.title,
      url: initialUserData.url,
      bio: initialUserData.bio,
      created_at: initialUserData.created_at,
      
      // 模拟数据
      stats: {
        posts: 12,
        comments: 48,
        likes: 156
      },
      posts: [
        {
          id: 1,
          title: "氯化钠溶液配制实验",
          preview: "本实验主要介绍如何正确配制氯化钠溶液...",
          likes: 42,
          comments: 15,
          date: "2024-03-20"
        },
        {
          id: 2,
          title: "酸碱滴定实验指南",
          preview: "详细讲解酸碱滴定的步骤和注意事项...",
          likes: 38,
          comments: 23,
          date: "2024-03-19"
        }
      ],
      comments: [
        {
          id: 1,
          postTitle: "实验室安全守则",
          content: "安全护目镜的使用非常重要，建议补充更多细节",
          date: "2024-03-18"
        },
        {
          id: 2,
          postTitle: "pH值测定方法",
          content: "这个方法很实用，我在实验中获益良多",
          date: "2024-03-17"
        }
      ],
      likes: [
        {
          id: 1,
          postTitle: "化学实验基础知识",
          author: "ChemTeacher",
          date: "2024-03-16"
        },
        {
          id: 2,
          postTitle: "实验器材使用指南",
          author: "LabExpert",
          date: "2024-03-15"
        }
      ],
      activities: [
        {
          id: 1,
          type: 'post',
          title: '氯化钠溶液配制实验',
          date: '2024-03-20'
        },
        {
          id: 2,
          type: 'comment',
          title: '酸碱滴定实验指南',
          date: '2024-03-19'
        },
        {
          id: 3,
          type: 'like',
          title: '实验室安全守则',
          date: '2024-03-18'
        }
      ],
      skills: [
        { name: '实验操作', level: 90 },
        { name: '数据分析', level: 85 },
        { name: '安全管理', level: 95 },
        { name: '实验设计', level: 80 }
      ]
    });
    setShowLogin(false);
    setLoading(false);
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
      setUserData(null);
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
  
  // 模拟用户的帖子数据，格式与 forumdata.json 一致
  const mockUserPosts = [
    {
      id: 1,
      detailId: 101,
      title: "Web3 开发最佳实践",
      author: "Alex Z",
      content: "详细内容...",
      timestamp: "2024-03-21T10:00:00Z",
      likes: 42,
      comments: 15,
      tags: ["Web3", "开发", "教程"],
      preview: "分享一些 Web3 开发中积累的经验和最佳实践...",
      media: "/images/photo1.png",
      mediaType: "image"
    },
    {
      id: 2,
      detailId: 102,
      title: "智能合约安全指南",
      author: "Sharpen Jane",
      content: "详细内容...",
      timestamp: "2024-03-20T15:30:00Z",
      likes: 38,
      comments: 21,
      tags: ["安全", "智能合约", "DeFi"],
      preview: "如何编写更安全的智能合约，避免常见的漏洞...",
      media: "/videos/video1.mp4",
      mediaType: "video",
      thumbnail: "/images/photo1.png"
    }
  ];

  // 模拟评论数据
  const mockUserComments = [
    {
      id: 1,
      detailId: 201,
      title: "关于智能合约的见解",
      author: "我",
      content: "这个观点非常好...",
      timestamp: "2024-03-22T10:00:00Z",
      likes: 15,
      comments: 5,
      tags: ["评论", "智能合约", "讨论"],
      preview: "我觉得这个智能合约的设计模式很有创新性...",
      media: "/images/photo1.png",
      mediaType: "image"
    },
    {
      id: 2,
      detailId: 202,
      title: "DeFi 项目分析",
      author: "我",
      content: "对于这个项目...",
      timestamp: "2024-03-21T15:30:00Z",
      likes: 12,
      comments: 8,
      tags: ["DeFi", "分析", "评论"],
      preview: "这个 DeFi 项目的创新点在于...",
      media: "/videos/video1.mp4",
      mediaType: "video",
      thumbnail: "/images/photo1.png"
    }
  ];

  // 模拟点赞数据
  const mockUserLikes = [
    {
      id: 1,
      detailId: 301,
      title: "Web3 生态系统概述",
      author: "BlockMaster",
      content: "详细内容...",
      timestamp: "2024-03-23T09:00:00Z",
      likes: 56,
      comments: 23,
      tags: ["Web3", "生态", "概述"],
      preview: "一篇关于 Web3 生态系统的深度分析...",
      media: "/images/photo1.png",
      mediaType: "image"
    },
    {
      id: 2,
      detailId: 302,
      title: "去中心化存储方案",
      author: "DataPro",
      content: "详细内容...",
      timestamp: "2024-03-22T14:20:00Z",
      likes: 45,
      comments: 18,
      tags: ["存储", "IPFS", "技术"],
      preview: "探讨各种去中心化存储方案的优劣...",
      media: "/videos/video1.mp4",
      mediaType: "video",
      thumbnail: "/images/photo1.png"
    }
  ];

  const handleNewPost = () => {
    navigate('/upload');  // 跳转到上传页面
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          avatar: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (field) => {
    setEditValues(prev => ({
      ...prev,
      [field]: userData[field]
    }));
    setIsEditing(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleInputChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (field) => {
    if (field === 'name' && editValues.name.length > 20) {
      return;
    }
    if (field === 'title' && editValues.title.length > 40) {
      return;
    }
    if (field === 'url' && editValues.url.length > 100) {
      return;
    }
    setUserData(prev => ({
      ...prev,
      [field]: editValues[field]
    }));
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const handleCancel = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-title">
                <h2>Posts</h2>
                <span className="mp-post-count">({mockUserPosts.length} posts)</span>
              </div>
              <button className="mp-new-button" onClick={handleNewPost}>
                <FaPlus /> New Post
              </button>
            </div>
            <ForumGrid 
              posts={mockUserPosts}
              loading={false}
              error={null}
              searchTerm=""
              sortBy={null}
            />
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
                <span className="mp-post-count">({mockUserComments.length} comments)</span>
              </div>
            </div>
            <ForumGrid 
              posts={mockUserComments}
              loading={false}
              error={null}
              searchTerm=""
              sortBy={null}
            />
          </div>
        );

      case 'likes':
        return (
          <div className="mp-section">
            <div className="mp-section-header">
              <div className="mp-section-title">
                <h2>Likes</h2>
                <span className="mp-post-count">({mockUserLikes.length} likes)</span>
              </div>
            </div>
            <ForumGrid 
              posts={mockUserLikes}
              loading={false}
              error={null}
              searchTerm=""
              sortBy={null}
            />
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
        <div className="mp-loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (showLogin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (!userData || !userData.name) {
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
                <img src={userData.avatar} alt={userData.name} />
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
                  {isEditing.name ? (
                    <div className="mp-edit-field">
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        maxLength={20}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave('name');
                          if (e.key === 'Escape') handleCancel('name');
                        }}
                        autoFocus
                      />
                      <div className="mp-edit-actions">
                        <FaCheck onClick={() => handleSave('name')} />
                        <FaTimes onClick={() => handleCancel('name')} />
                      </div>
                    </div>
                  ) : (
                    <>
                      {userData.name}
                      <button className="mp-edit-button" onClick={() => handleEdit('name')} title="Edit Name">
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
                    <span>{contactInfo.email}</span>
                  </div>
                  <div className="mp-contact-item">
                    <FaPhone />
                    <span>{contactInfo.phone}</span>
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
          
          {web3State.connected && (
            <div className="mp-wallet-info" data-aos="fade-up">
              <div className="mp-info-card">
                <div className="mp-card-header">
                  <div className="mp-card-title">
                    <FaWallet className="mp-card-icon" />
                    <h3>My Wallet</h3>
                  </div>
                  <div className="mp-network-badge">
                    {web3State.networkName}
                  </div>
                </div>
                <div className="mp-wallet-details">
                  <div className="mp-detail-row">
                    <div className="mp-detail-label">
                      <span className="mp-label-icon">📬</span>
                      Address
                    </div>
                    <div className="mp-address-container">
                      <span className="mp-detail-value">{web3State.address}</span>
                      <button 
                        className="mp-copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(web3State.address);
                          // 可以添加一个复制成功的提示
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
                    <span className="mp-detail-value network">{web3State.networkName}</span>
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
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPage;