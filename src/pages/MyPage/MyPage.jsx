import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEdit, FaComment, FaHeart, FaLink, FaSignOutAlt, FaChartLine, FaFileAlt, FaUserEdit, FaExternalLinkAlt } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './MyPage.css';
import LoginPage from '../../components/LoginPage';

function MyPage() {
  const particlesRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Hardcoded user data
  const userData = {
    name: "Zhang San",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    title: "Senior Frontend Developer",
    url: "https://example.com/zhangsan",
    bio: "Passionate about frontend development and blockchain technology. 5 years of React experience. Love exploring new technologies and contributing to open source projects in my spare time.",
    stats: {
      posts: 42,
      comments: 128,
      likes: 315
    },
    posts: [
      { id: 1, title: "React Hooks Best Practices", date: "2023-05-15", likes: 87, comments: 23 },
      { id: 2, title: "Getting Started with Web3 Development", date: "2023-04-22", likes: 65, comments: 18 },
      { id: 3, title: "Blockchain Applications in Frontend", date: "2023-03-10", likes: 92, comments: 31 }
    ],
    comments: [
      { id: 1, postTitle: "Understanding Blockchain Fundamentals", content: "Great explanation of consensus mechanisms!", date: "2023-05-20" },
      { id: 2, postTitle: "The Future of DeFi", content: "I think the integration with traditional finance will be key.", date: "2023-05-05" },
      { id: 3, postTitle: "Web3 UX Challenges", content: "Wallet connection is still a major friction point for new users.", date: "2023-04-18" }
    ],
    likes: [
      { id: 1, postTitle: "Zero Knowledge Proofs Explained", author: "Alex Chen", date: "2023-05-22" },
      { id: 2, postTitle: "Building Scalable React Applications", author: "Sarah Johnson", date: "2023-05-10" },
      { id: 3, postTitle: "Smart Contract Security Best Practices", author: "Michael Brown", date: "2023-04-30" }
    ]
  };
  
  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('myPageToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  
  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('myPageToken');
    setIsLoggedIn(false);
  };
  
  // 处理登录成功
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
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
        this.color = '#61dafb';
        this.alpha = Math.random() * 0.5 + 0.1;
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
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
      }
    }
    
    const createParticles = () => {
      const particleCount = Math.min(100, Math.floor(window.innerWidth * window.innerHeight / 10000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      particles = [];
    };
  }, [isLoggedIn]);
  
  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
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