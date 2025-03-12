import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEdit, FaComment, FaHeart, FaLink, FaSignOutAlt, FaChartLine, FaFileAlt, FaUserEdit, FaExternalLinkAlt } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './MyPage.css';
import LoginPage from '../../components/LoginPage';
import { authAPI } from '../../router';

function MyPage() {
  const particlesRef = useRef(null);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          posts: 156,
          comments: 892,
          likes: 2731
        },
        activities: [
          {
            id: 1,
            type: 'post',
            title: 'Latest Blog Post',
            date: '2024-01-15'
          }
        ],
        skills: [
          { name: 'React', level: 90 },
          { name: 'JavaScript', level: 85 }
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
        posts: 156,
        comments: 892,
        likes: 2731
      },
      activities: [
        {
          id: 1,
          type: 'post',
          title: 'Latest Blog Post',
          date: '2024-01-15'
        }
      ],
      skills: [
        { name: 'React', level: 90 },
        { name: 'JavaScript', level: 85 }
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
  
  if (loading) {
    return (
      <div className="mp-page">
        <canvas ref={particlesRef} className="mp-particles-bg"></canvas>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  if (showLogin) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />;
  }
  
  if (!userData || !userData.name) {
    return (
      <div className="mp-page">
        <canvas ref={particlesRef} className="mp-particles-bg"></canvas>
        <div className="loading-spinner">Loading user data...</div>
      </div>
    );
  }
  
  return (
    <div className="mp-page">
      <canvas ref={particlesRef} className="mp-particles-bg"></canvas>
      
      <div className="mp-container">
        <div className="mp-profile-header">
          <div className="mp-profile-info">
            <div className="mp-profile-avatar">
              <img src={userData.avatar} alt={userData.name} />
            </div>
            <div className="mp-profile-details">
              <h1 className="mp-profile-name">{userData.name}</h1>
              <div className="mp-profile-title">{userData.title}</div>
              <div className="mp-profile-url">
                <FaLink />
                <a href={userData.url} target="_blank" rel="noopener noreferrer">
                  {userData.url} <FaExternalLinkAlt style={{ fontSize: '0.8rem' }} />
                </a>
                <button className="mp-edit-button" title="Edit Profile">
                  <FaUserEdit />
                </button>
              </div>
            </div>
            <button className="mp-logout-button" onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
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
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mp-tab-content"
              >
                <div className="mp-profile-section">
                  <h2>Profile</h2>
                  <p className="mp-bio">{userData.bio}</p>
                  
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
              </motion.div>
            )}
            
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mp-tab-content"
              >
                <div className="mp-posts-section">
                  <div className="mp-section-header">
                    <h2>Posts</h2>
                    <Link to="/new-post" className="mp-new-button">New Post</Link>
                  </div>
                  
                  <div className="mp-posts-list">
                    {userData.posts.map((post, index) => (
                      <div className="mp-post-card" key={post.id} data-aos="fade-up" data-aos-delay={index * 100}>
                        <h3 className="mp-post-title">{post.title}</h3>
                        <div className="mp-post-meta">
                          <span className="mp-post-date">{post.date}</span>
                          <div className="mp-post-stats">
                            <span><FaHeart /> {post.likes}</span>
                            <span><FaComment /> {post.comments}</span>
                          </div>
                        </div>
                        <div className="mp-post-actions">
                          <button className="mp-post-action-btn">View</button>
                          <button className="mp-post-action-btn">Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mp-tab-content"
              >
                <div className="mp-comments-section">
                  <h2>Comments</h2>
                  
                  <div className="mp-comments-list">
                    {userData.comments.map((comment, index) => (
                      <div className="mp-comment-card" key={comment.id} data-aos="fade-up" data-aos-delay={index * 100}>
                        <div className="mp-comment-header">
                          <h3 className="mp-comment-post-title">{comment.postTitle}</h3>
                          <span className="mp-comment-date">{comment.date}</span>
                        </div>
                        <p className="mp-comment-content">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'likes' && (
              <motion.div
                key="likes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mp-tab-content"
              >
                <div className="mp-likes-section">
                  <h2>Likes</h2>
                  
                  <div className="mp-likes-list">
                    {userData.likes.map((like, index) => (
                      <div className="mp-like-card" key={like.id} data-aos="fade-up" data-aos-delay={index * 100}>
                        <h3 className="mp-like-post-title">{like.postTitle}</h3>
                        <div className="mp-like-meta">
                          <span>By: {like.author}</span>
                          <span>{like.date}</span>
                        </div>
                        <button className="mp-view-button">View Post</button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mp-tab-content"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default MyPage;