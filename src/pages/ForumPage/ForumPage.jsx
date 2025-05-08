import React, { useRef, useEffect, useState } from 'react';
import './ForumPage.css';
import ForumGrid from '../../components/ForumGrid';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaSearch, FaFire, FaClock, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { mediaAPI } from '../../router'; // 导入 mediaAPI

function ForumPage() {
  const particlesRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(null); // null, 'hot-desc', 'hot-asc', 'recent-desc', 'recent-asc'
  // 新增状态用于存储帖子数据
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 只在初始加载时重置滚动位置
    if (isInitialLoad) {
      setIsInitialLoad(false);
      window.scrollTo(0, 0);
    } else {
      // 从 ForumDetail 返回时，恢复之前的滚动位置
      const savedScrollPosition = sessionStorage.getItem('forumScrollPosition');
      if (savedScrollPosition) {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('forumScrollPosition'); // 清除保存的位置
      }
    }
    
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // 粒子动画效果
    const canvas = particlesRef.current;
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
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 添加连线效果
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
      
      // 更新和绘制粒子
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      sessionStorage.setItem('forumScrollPosition', window.scrollY.toString());
    };
  }, [isInitialLoad]);

  // 修改数据获取逻辑，使用后端 API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        // 准备API参数
        const apiParams = {
          skip: 0,
          limit: 20
        };
        
        // 根据排序设置参数
        if (sortBy) {
          // 将前端排序格式转换为API格式
          // 'hot-desc' -> 'likes_desc', 'recent-desc' -> 'time_desc'
          const [type, direction] = sortBy.split('-');
          const sortType = type === 'hot' ? 'likes' : 'time';
          apiParams.sort_by = `${sortType}_${direction}`;
        }
        
        // 如果有搜索词，添加搜索参数
        if (searchTerm) {
          apiParams.search = searchTerm;
        }
        
        // 调用API获取帖子
        const data = await mediaAPI.getPosts(apiParams);
        
        // 处理返回的数据
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Unexpected data format:", data);
          setPosts([]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load posts:", err);
        setError('Failed to load posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchTerm, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    // 搜索时会触发 useEffect 重新获取数据
    setLoading(true);
  };

  const handleSortChange = (newSortType) => {
    // 如果当前排序类型是 null，设置为降序
    if (sortBy === null) {
      setSortBy(`${newSortType}-desc`);
    } 
    // 如果当前是降序，切换为升序
    else if (sortBy === `${newSortType}-desc`) {
      setSortBy(`${newSortType}-asc`);
    } 
    // 如果当前是升序或者其他排序类型，取消排序
    else {
      setSortBy(null);
    }
  };

  // 获取排序类型和方向
  const getSortType = () => {
    if (!sortBy) return null;
    return sortBy.split('-')[0]; // 'hot' 或 'recent'
  };

  const getSortDirection = () => {
    if (!sortBy) return null;
    return sortBy.split('-')[1]; // 'asc' 或 'desc'
  };

  // 获取排序图标
  const getSortIcon = (type) => {
    if (sortBy && sortBy.startsWith(type)) {
      return getSortDirection() === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />;
    }
    return type === 'hot' ? <FaFire /> : <FaClock />;
  };

  return (
    <div className="forum-root">
      <canvas ref={particlesRef} className="particles-bg"></canvas>
      
      <div className="forum-hero" data-aos="fade-down">
        <h1 className="forum-title">
          Community Forum
          <span className="forum-title-accent">Share & Discuss</span>
        </h1>
        <p className="forum-description">
          Join our vibrant community to discuss Web3, blockchain, and the future of technology
        </p>
        <div className="forum-stats">
          <div className="stat-item" data-aos="fade-up" data-aos-delay="100">
            <span className="stat-number">1.2K</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="stat-item" data-aos="fade-up" data-aos-delay="200">
            <span className="stat-number">3.5K</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-item" data-aos="fade-up" data-aos-delay="300">
            <span className="stat-number">12K</span>
            <span className="stat-label">Comments</span>
          </div>
        </div>
      </div>

      <div className="forum-content">
        <div className="forum-controls" data-aos="fade-up">
          <div className="forum-search">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search topics, tags, or authors..." 
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <button 
              className="search-btn"
              onClick={handleSearchClick}
            >
              Search
            </button>
          </div>
          
          <div className="forum-sort">
            <button 
              className={`sort-btn ${sortBy && sortBy.startsWith('hot') ? 
                (getSortDirection() === 'desc' ? 'sort-active-desc' : 'sort-active-asc') : ''}`}
              onClick={() => handleSortChange('hot')}
            >
              {getSortIcon('hot')} Hot
            </button>
            <button 
              className={`sort-btn ${sortBy && sortBy.startsWith('recent') ? 
                (getSortDirection() === 'desc' ? 'sort-active-desc' : 'sort-active-asc') : ''}`}
              onClick={() => handleSortChange('recent')}
            >
              {getSortIcon('recent')} Recent
            </button>
          </div>
        </div>
        
        <ForumGrid 
          posts={posts}
          loading={loading}
          error={error}
          searchTerm={searchTerm} 
          sortBy={sortBy}
        />
      </div>
    </div>
  );
}

export default ForumPage; 