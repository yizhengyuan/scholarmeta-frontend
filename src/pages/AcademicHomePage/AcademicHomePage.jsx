// 这是AcademicHomePage.jsx的内容
import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaBook, FaFlask, FaGraduationCap, FaLightbulb } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './AcademicHomePage.css';

function AcademicHomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('综合');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/forum?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 模拟推荐问题数据 - 删除头像，添加新问题
  const recommendedQuestions = [
    {
      id: 1,
      icon: '🧪',
      question: '生态系统模拟的最佳实践框架什么？'
    },
    {
      id: 2,
      icon: '🧬',
      question: '苏木精核性质与反应的关键因子什么？'
    },
    {
      id: 3,
      icon: '🔬',
      question: '表面羟基在催化剂中的作用是什么？'
    },
    {
      id: 4,
      icon: '🧮',
      question: '如何设计支持机器学习的高效数据架构？'
    },
    {
      id: 5,
      icon: '🌟',
      question: '如何实现跨学科的有效合作？'
    },
    {
      id: 6,
      icon: '⚡',
      question: '量子计算在化学模拟中的应用前景如何？'
    }
  ];

  // 模拟推荐内容数据
  const recommendedContent = [
    {
      id: 1,
      title: 'Computer Vision and Pattern Recognition',
      author: '张磊 (Jin Zhang)',
      institution: '北京大学深度学习实验室',
      date: '2024-11-30',
      views: 878,
      likes: 2,
      description: 'Advancing Myopia To Holism: Fully Contrastive Learning for Myopia Holistic Training',
      tags: ['计算机视觉', '深度学习', '模式识别', '全息训练'],
      avatar: 'https://i.pravatar.cc/40?img=6'
    },
    {
      id: 2,
      title: 'Nature Photonics',
      author: 'Nature Photonics',
      institution: '光子学研究所',
      date: '2023-04-17',
      views: 636,
      likes: 33,
      description: 'Fully on-chip photonic turnkey quantum source for entangled qubit state generation',
      tags: ['光子学', '量子计算', '芯片技术', '量子纠缠'],
      avatar: 'https://i.pravatar.cc/40?img=7'
    }
  ];

  return (
    <div className="academic-home">
      {/* 侧边栏 - 添加更多按钮 */}
      <aside className="sidebar">
        <nav className="nav-menu">
          <div className="nav-item">
            <FaUser className="nav-icon" />
            <span>订阅</span>
          </div>
          <div className="nav-item">
            <FaFlask className="nav-icon" />
            <span>期刊库</span>
          </div>
          <div className="nav-item">
            <FaLightbulb className="nav-icon" />
            <span>学者</span>
          </div>
          <div className="nav-item">
            <FaGraduationCap className="nav-icon" />
            <span>知识库</span>
          </div>
          
          <div className="nav-item">
            <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>课程</span>
          </div>
          <div className="nav-item">
            <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10,8 16,12 10,16 10,8"/>
            </svg>
            <span>比赛</span>
          </div>
          <div className="nav-item">
            <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>计算任务</span>
          </div>
          
          {/* 新增更多按钮 */}
          <div className="nav-item">
            <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
            <span>更多</span>
          </div>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="main-content">
        {/* 头部 - 修改标题 */}
        <header className="header">
          <div className="header-content">
            <div className="university-info">
              <div className="university-text">
                <h1>AI学术搜索</h1>
              </div>
            </div>
          </div>
        </header>

        {/* 搜索区域 - 调整按钮位置和功能 */}
        <section className="search-section">
          <div className="search-container">
            <div className="search-box">
              {/* 上半部分：搜索输入（移除右侧按钮） */}
              <div className="search-input-area">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="请输入您的问题"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              {/* 下半部分：左侧搜索按钮，右侧发送和上传按钮 */}
              <div className="search-bottom">
                <div className="search-filters">
                  <button 
                    type="button"
                    className={`filter-btn ${searchType === '深度搜索' ? 'active' : ''}`}
                    onClick={() => setSearchType('深度搜索')}
                  >
                    🔍 深度思考·R1
                  </button>
                  <button 
                    type="button"
                    className={`filter-btn ${searchType === '综合' ? 'active' : ''}`}
                    onClick={() => setSearchType('综合')}
                  >
                    📚 领域·全学科
                  </button>
                </div>
                
                <div className="search-actions">
                  <button type="button" className="action-btn upload-btn" title="上传图片">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </button>
                  <button type="submit" className="action-btn send-btn" title="发送">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 推荐问题区域 */}
        <section className="questions-section">
          <div className="questions-grid">
            {recommendedQuestions.map((item) => (
              <div key={item.id} className="question-card">
                <div className="question-icon">{item.icon}</div>
                <div className="question-text">{item.question}</div>
              </div>
            ))}
          </div>
          <div className="refresh-questions">
            <button className="refresh-btn">🔄 换一批问题</button>
          </div>
        </section>

        {/* 推荐内容区域 */}
        <section className="recommendations-section">
          <div className="section-header">
            <h2>为你推荐</h2>
            <div className="view-options">
              <button className="view-btn active">更多</button>
            </div>
          </div>
          
          <div className="content-grid">
            {recommendedContent.map((item) => (
              <div key={item.id} className="content-card">
                <div className="content-header">
                  <div className="author-info">
                    <img src={item.avatar} alt={item.author} className="author-avatar" />
                    <div className="author-details">
                      <div className="author-name">{item.author}</div>
                      <div className="author-institution">{item.institution}</div>
                    </div>
                  </div>
                  <div className="content-meta">
                    <span className="content-date">{item.date}</span>
                    <span className="content-views">👁 {item.views}</span>
                    <span className="content-likes">❤ {item.likes}</span>
                  </div>
                </div>
                
                <h3 className="content-title">{item.title}</h3>
                <p className="content-description">{item.description}</p>
                
                <div className="content-tags">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AcademicHomePage;