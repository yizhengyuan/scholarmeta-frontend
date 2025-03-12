import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTwitter, FaGithub, FaLinkedin, FaHeart, FaComment, FaPen, FaArrowLeft, 
         FaUser, FaFileAlt, FaChartLine, FaCode } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './AuthorPage.css';

function AuthorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const particlesRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const containerRef = useRef(null);

  // 添加粒子效果
  const createParticle = (x, y) => {
    if (!containerRef.current) return;
    
    const particle = document.createElement('div');
    particle.className = 'author-particle';
    
    const size = Math.random() * 15 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    const rect = containerRef.current.getBoundingClientRect();
    const posX = x - rect.left;
    const posY = y - rect.top;
    
    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;
    
    containerRef.current.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode === containerRef.current) {
        containerRef.current.removeChild(particle);
      }
    }, 3000);
  };

  // 鼠标移动时创建粒子
  const handleMouseMove = (e) => {
    if (Math.random() > 0.9) {
      createParticle(e.clientX, e.clientY);
    }
  };

  // 初始化粒子背景
  useEffect(() => {
    const canvas = particlesRef.current;
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
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
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
    
    const init = () => {
      particles = [];
      const particleCount = Math.min(window.innerWidth * 0.05, 100);
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
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    init();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 初始化 AOS
  useEffect(() => {
    // Reset scroll position
    window.scrollTo(0, 0);
    
    AOS.init({
      duration: 1000,
      once: true,  // 确保动画只执行一次
      offset: 100,
    });
  }, []);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login', { state: { from: `/author/${id}` } });
    }
  }, [navigate, id]);

  // 获取作者数据
  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        // 这里可以添加获取作者数据的 API 调用
        // const response = await authorAPI.getAuthorById(id);
        // setAuthor(response.data);
        
        // 暂时保持使用模拟数据
        setTimeout(() => {
          const authorData = {
            id: id,
            name: "Sarah Williams",
            avatar: null, // 测试无头像情况
            title: "Crypto Analyst",
            bio: "Experienced crypto analyst with a focus on DeFi protocols and market trends. Contributing to various blockchain projects since 2017.",
            badges: ["Market Analyst", "DeFi Specialist"],
            stats: {
              posts: 24,
              comments: 87,
              likes: 156
            },
            expertise: [
              "Blockchain Analysis", "DeFi Protocols", "Market Trends", 
              "Technical Analysis", "Tokenomics", "Smart Contracts"
            ],
            activities: [
              { id: 1, type: "post", title: "Understanding Yield Farming Risks", date: "2023-06-15" },
              { id: 2, type: "comment", title: "On: The Future of Layer 2 Solutions", date: "2023-06-10" },
              { id: 3, type: "like", title: "Ethereum 2.0 Staking Guide", date: "2023-06-05" }
            ],
            social: {
              twitter: "https://twitter.com/sarahwilliams",
              github: "https://github.com/sarahwilliams",
              linkedin: "https://linkedin.com/in/sarahwilliams"
            },
            forumPosts: [
              { id: 1, title: "Understanding Yield Farming Risks", likes: 10, comments: 5, date: "2023-06-15" },
              { id: 2, title: "On: The Future of Layer 2 Solutions", likes: 8, comments: 3, date: "2023-06-10" },
              { id: 3, title: "Ethereum 2.0 Staking Guide", likes: 12, comments: 7, date: "2023-06-05" }
            ]
          };
          setAuthor(authorData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to load author data');
        setLoading(false);
      }
    };

    fetchAuthorData();
  }, [id]);

  // 返回论坛
  const handleBackToForum = () => {
    navigate('/forum');
  };

  if (loading) {
    return (
      <div className="author-page">
        <canvas ref={particlesRef} className="author-particles-bg"></canvas>
        <div className="author-container">
          <div className="author-loading">
            <div className="author-loading-spinner"></div>
            <p>Loading author profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="author-page">
        <canvas ref={particlesRef} className="author-particles-bg"></canvas>
        <div className="author-container">
          <div className="author-error">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={handleBackToForum}>Back to Forum</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="author-page" ref={containerRef} onMouseMove={handleMouseMove}>
      <canvas ref={particlesRef} className="author-particles-bg"></canvas>
      
      <div className="author-container">
        <div className="author-profile-header">
          <div className="author-profile-info">
            <div className="author-profile-avatar">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} />
              ) : (
                <div className="author-profile-avatar-text">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="author-profile-details">
              <h1 className="author-profile-name">{author.name}</h1>
              <div className="author-profile-title">{author.title}</div>
              <div className="author-badges">
                {author.badges.map((badge, index) => (
                  <span key={index} className="author-badge">{badge}</span>
                ))}
              </div>
            </div>
            <button className="author-back-button" onClick={handleBackToForum}>
              <FaArrowLeft />
              <span>Back to Forum</span>
            </button>
          </div>
        </div>
        
        <div className="author-tabs">
          <div 
            className={`author-tab ${activeTab === 'profile' ? 'author-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser />
            <span>Profile</span>
          </div>
          <div 
            className={`author-tab ${activeTab === 'posts' ? 'author-active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <FaFileAlt />
            <span>Posts</span>
          </div>
          <div 
            className={`author-tab ${activeTab === 'activity' ? 'author-active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <FaFileAlt />
            <span>Activity</span>
          </div>
          <div 
            className={`author-tab ${activeTab === 'stats' ? 'author-active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <FaChartLine />
            <span>Statistics</span>
          </div>
        </div>
        
        <div className="author-content-area">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="author-tab-content"
              >
                <div className="author-profile-section">
                  <h2>Profile</h2>
                  <p className="author-bio">{author.bio}</p>
                  
                  <div className="author-stats-cards">
                    <div className="author-stat-card" data-aos="fade-up">
                      <div className="author-stat-icon">
                        <FaPen />
                      </div>
                      <div className="author-stat-value">{author.stats.posts}</div>
                      <div className="author-stat-label">Posts</div>
                    </div>
                    
                    <div className="author-stat-card" data-aos="fade-up" data-aos-delay="100">
                      <div className="author-stat-icon">
                        <FaComment />
                      </div>
                      <div className="author-stat-value">{author.stats.comments}</div>
                      <div className="author-stat-label">Comments</div>
                    </div>
                    
                    <div className="author-stat-card" data-aos="fade-up" data-aos-delay="200">
                      <div className="author-stat-icon">
                        <FaHeart />
                      </div>
                      <div className="author-stat-value">{author.stats.likes}</div>
                      <div className="author-stat-label">Likes</div>
                    </div>
                  </div>
                  
                  <div className="author-social-section">
                    <h2>Connect</h2>
                    <div className="author-social-links">
                      {author.social.twitter && (
                        <a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="author-social-link twitter">
                          <FaTwitter />
                        </a>
                      )}
                      {author.social.github && (
                        <a href={author.social.github} target="_blank" rel="noopener noreferrer" className="author-social-link github">
                          <FaGithub />
                        </a>
                      )}
                      {author.social.linkedin && (
                        <a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="author-social-link linkedin">
                          <FaLinkedin />
                        </a>
                      )}
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
                className="author-tab-content"
              >
                <div className="author-posts-section">
                  <h2>Posts</h2>
                  <div className="author-posts-list">
                    {author.forumPosts.map((post, index) => (
                      <div 
                        className="author-post-card" 
                        key={post.id} 
                        data-aos="fade-up" 
                        data-aos-delay={index * 100}
                      >
                        <h3 className="author-post-title">{post.title}</h3>
                        <div className="author-post-meta">
                          <span className="author-post-date">{post.date}</span>
                          <div className="author-post-stats">
                            <span><FaHeart /> {post.likes}</span>
                            <span><FaComment /> {post.comments}</span>
                          </div>
                        </div>
                        <div className="author-post-actions">
                          <button 
                            className="author-post-action-btn"
                            onClick={() => navigate(`/forum/detail/${post.id}`)}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="author-tab-content"
              >
                <div className="author-activity-section">
                  <h2>Recent Activity</h2>
                  <div className="author-activity-list">
                    {author.activities.map((activity, index) => (
                      <div className="author-activity-item" key={activity.id} data-aos="fade-up" data-aos-delay={index * 100}>
                        <div className="author-activity-icon">
                          {activity.type === 'post' && <FaPen />}
                          {activity.type === 'comment' && <FaComment />}
                          {activity.type === 'like' && <FaHeart />}
                        </div>
                        <div className="author-activity-content">
                          <div className="author-activity-title">{activity.title}</div>
                          <div className="author-activity-time">{activity.date}</div>
                        </div>
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
                className="author-tab-content"
              >
                <div className="author-stats-section">
                  <h2>Statistics</h2>
                  <div className="author-stats-cards">
                    <div className="author-stat-card" data-aos="fade-up">
                      <div className="author-stat-icon">
                        <FaPen />
                      </div>
                      <div className="author-stat-value">{author.stats.posts}</div>
                      <div className="author-stat-label">Posts</div>
                    </div>
                    
                    <div className="author-stat-card" data-aos="fade-up" data-aos-delay="100">
                      <div className="author-stat-icon">
                        <FaComment />
                      </div>
                      <div className="author-stat-value">{author.stats.comments}</div>
                      <div className="author-stat-label">Comments</div>
                    </div>
                    
                    <div className="author-stat-card" data-aos="fade-up" data-aos-delay="200">
                      <div className="author-stat-icon">
                        <FaHeart />
                      </div>
                      <div className="author-stat-value">{author.stats.likes}</div>
                      <div className="author-stat-label">Likes</div>
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

export default AuthorPage;
