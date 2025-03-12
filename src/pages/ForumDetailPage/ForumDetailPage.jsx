import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaComment, FaClock, FaArrowLeft } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './ForumDetailPage.css';
import CommentBar from '../../components/CommentBar';
import CommentPage from '../../components/CommentPage';

function ForumDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(false);
  const particlesRef = useRef(null);
  const [totalComments, setTotalComments] = useState(0);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [localComments, setLocalComments] = useState([]); // 用于存储临时评论
  const [newComment, setNewComment] = useState(null);

  // 使用 hardcoded 用户数据作为当前登录用户
  const currentUser = {
    id: 1, // 使用 MyPage 中的用户 ID
    name: "Zhang San", // 使用 MyPage 中的用户名
    avatar: "https://randomuser.me/api/portraits/men/32.jpg", // 使用名字缩写作为头像
  };

  useEffect(() => {
    // 进入详情页时总是滚动到顶部
    window.scrollTo(0, 0);
    
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // 获取帖子详情
    fetch('/forumdetail.json')
      .then(response => response.json())
      .then(data => {
        const postDetail = data.details.find(p => p.id === parseInt(id));
        if (postDetail) {
          setPost(postDetail);
        } else {
          setError('Post not found');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load post details');
        setLoading(false);
      });

    // 粒子动画效果
    const canvas = particlesRef.current;
    if (canvas) {
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
          this.color = `rgba(97, 218, 251, ${Math.random() * 0.3 + 0.1})`; // 降低粒子透明度
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
        const particleCount = Math.floor((canvas.width * canvas.height) / 20000); // 减少粒子数量
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
      };
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      };
    }

    // 获取评论总数
    fetch('/forumcomment.json')
      .then(response => response.json())
      .then(data => {
        const postComments = data.comments.filter(comment => comment.postId === parseInt(id));
        // 计算主评论数量和回复数量的总和
        const total = postComments.reduce((sum, comment) => {
          // 每个主评论算1，加上其回复数量
          return sum + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        
        console.log('主评论数量:', postComments.length);
        console.log('总评论数量(包含回复):', total);
        setTotalComments(total);
      })
      .catch(err => {
        console.error('加载评论数量失败:', err);
      });
  }, [id]);

  const handleVideoPlay = (videoEl) => {
    if (playingVideo) {
      videoEl.pause();
    } else {
      videoEl.play();
    }
    setPlayingVideo(!playingVideo);
  };

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/forum');
    }
  };

  const handleAuthorClick = () => {
    navigate(`/author/${post.authorId}`);
  };

  // 处理评论提交
  const handleCommentSubmit = (comment) => {
    console.log('收到新评论:', comment);
    setNewComment(comment);
    setTotalComments(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="forum-detail-page">
        <div className="forum-detail-status">
          <div className="loading-spinner"></div>
          <p>Loading post details...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="forum-detail-page">
        <div className="forum-detail-status error">
          <div className="error-icon">404</div>
          <h2>{error || 'Post not found'}</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <button className="back-button" onClick={handleBack}>
            <FaArrowLeft /> Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-detail-page">
      <canvas ref={particlesRef} className="particles-bg"></canvas>
      
      <div className="chemistry-elements">
        <div className="molecule molecule-1"></div>
        <div className="molecule molecule-2"></div>
        <div className="atom atom-1"></div>
        <div className="atom atom-2"></div>
      </div>
      
      <div className="forum-detail-container">
        <button 
          className="back-button" 
          onClick={handleBack}
          data-aos="fade-down"
          data-aos-duration="800"
        >
          <FaArrowLeft /> Back to Forum
        </button>

        <div className="forum-detail-header" data-aos="fade-down">
          <h1 className="forum-detail-title">{post.title}</h1>
          <div className="forum-detail-meta">
            <div className="meta-left">
              <div className="author-info">
                <div 
                  className="author-avatar"
                  onClick={handleAuthorClick}
                  style={{ cursor: 'pointer' }}
                  title={`View ${post.author}'s profile`}
                >
                  {post.authorAvatar}
                </div>
                <div className="author-details">
                  <span 
                    className="author-name"
                    onClick={handleAuthorClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {post.author}
                  </span>
                  <span className="post-time">
                    Posted on {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="meta-right">
              <div className="post-stats">
                <div className="stat-item likes">
                  <FaHeart />
                  <span>{post.likes}</span>
                  <span className="stat-label">Likes</span>
                </div>
                <div className="stat-item comments">
                  <FaComment />
                  <span>{totalComments}</span>
                  <span className="stat-label">Comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {post.media && (
          <div className="forum-detail-media" data-aos="fade-up">
            {post.mediaType === 'image' ? (
              <img src={post.media} alt={post.title} className="detail-image" />
            ) : (
              <div className="detail-video-container">
                <video
                  ref={el => el && (el.id = 'detail-video')}
                  src={post.media}
                  className="detail-video"
                  poster={post.thumbnail}
                  playsInline
                />
                <button
                  className="detail-video-play"
                  onClick={() => {
                    const videoEl = document.getElementById('detail-video');
                    if (videoEl) handleVideoPlay(videoEl);
                  }}
                >
                  {playingVideo ? <FaPause /> : <FaPlay />}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="forum-detail-content" data-aos="fade-up">
          <div className="content-text">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          <div className="content-tags">
            {post.tags.map(tag => (
              <span key={tag} className="detail-tag">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="ai-analysis-container" data-aos="fade-up">
          <div className="ai-analysis-header">
            <div className="ai-avatar">AI</div>
            <h3>AI Content Analysis</h3>
          </div>
          <div className="ai-analysis-content">
            <div className="ai-analysis-item">
              <h4>Key Points:</h4>
              <ul>
                <li>Web3 技术与区块链的深度融合</li>
                <li>去中心化存储的创新应用</li>
                <li>智能合约在实际场景中的应用价值</li>
              </ul>
            </div>
            <div className="ai-analysis-item">
              <h4>Sentiment Analysis:</h4>
              <div className="sentiment-tags">
                <span className="sentiment-tag positive">Technical</span>
                <span className="sentiment-tag positive">Innovative</span>
                <span className="sentiment-tag neutral">Educational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="forum-detail-comments" data-aos="fade-up">
          <div className="comments-header">
            <h3 className="comments-title">Comments ({totalComments})</h3>
            <button 
              className="write-comment-btn"
              onClick={() => setIsCommentModalOpen(true)}
            >
              <FaComment /> Write a Comment
            </button>
          </div>
          
          <CommentBar 
            postId={id} 
            newComment={newComment}
          />

          <CommentPage
            isOpen={isCommentModalOpen}
            onClose={() => setIsCommentModalOpen(false)}
            postId={id}
            authorInfo={{
              authorId: currentUser.id,
              authorName: currentUser.name,
              authorAvatar: currentUser.avatar
            }}
            onCommentSubmit={handleCommentSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export default ForumDetailPage;
