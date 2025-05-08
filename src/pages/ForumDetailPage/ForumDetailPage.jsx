import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaComment, FaClock, FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './ForumDetailPage.css';
import CommentBar from '../../components/CommentBar';
import CommentPage from '../../components/CommentPage';
import { mediaAPI } from '../../router'; // 导入 mediaAPI

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
  const [comments, setComments] = useState([]); // 存储从API获取的评论
  const [newComment, setNewComment] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false); // 新增状态跟踪是否已点赞
  const [isProcessingLike, setIsProcessingLike] = useState(false); // 新增状态跟踪是否正在处理点赞
  const [commentsLoading, setCommentsLoading] = useState(false); // 评论加载状态

  // 使用 hardcoded 用户数据作为当前登录用户
  const currentUser = {
    id: 1, // 使用 MyPage 中的用户 ID
    name: "Zhang San", // 使用 MyPage 中的用户名
    avatar: "https://randomuser.me/api/portraits/men/32.jpg", // 使用名字缩写作为头像
  };

  // 格式化时间为中国时间
  const formatChineseTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // 处理带有微秒的时间格式 (例如 "2025-05-08T10:01:16.561000")
      let dateStr = timestamp;
      
      // 如果时间戳包含微秒部分且格式不标准，进行修正
      if (timestamp.includes('.') && timestamp.split('.')[1].length > 3) {
        // 将微秒部分截断为3位，确保符合ISO标准
        const parts = timestamp.split('.');
        dateStr = parts[0] + '.' + parts[1].substring(0, 3) + 'Z';
      }
      
      // 创建日期对象
      const date = new Date(dateStr);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的时间格式:', timestamp);
        return timestamp; // 返回原始字符串
      }
      
      // 格式化为中国日期格式
      return date.toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('时间格式化错误:', error, timestamp);
      return timestamp; // 出错时返回原始字符串
    }
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
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const postData = await mediaAPI.getPostDetail(id);
        
        // 处理头像 URL
        let avatarUrl = "https://randomuser.me/api/portraits/lego/1.jpg"; // 默认头像
        
        if (postData["author avatar url"]) {
          // 检查是否为 base64 格式
          if (typeof postData["author avatar url"] === 'string' && postData["author avatar url"].startsWith('data:image')) {
            avatarUrl = postData["author avatar url"];
          } else if (typeof postData["author avatar url"] === 'string') {
            // 普通 URL 处理
            if (postData["author avatar url"].startsWith('http')) {
              avatarUrl = postData["author avatar url"];
            } else {
              // 相对路径，添加域名
              avatarUrl = `${window.location.origin}${postData["author avatar url"]}`;
            }
          }
        }
        
        console.log("处理后的头像URL:", avatarUrl); // 调试输出
        
        // 转换 API 返回的数据格式为组件所需的格式
        const formattedPost = {
          id: id,
          title: postData.title,
          author: {
            id: postData["author id"],
            name: postData["author name"] || "Anonymous User",
            avatar: avatarUrl
          },
          summary: postData.Summary || "",
          content: postData.content || "",
          timestamp: postData.timestamp,
          likes: postData.likes || 0,
          comments: totalComments,
          tags: Array.isArray(postData.tags) ? postData.tags : [],
          mediaList: postData["media list"] || [], // 保存完整的媒体列表
          mediaType: postData["media type"] || "image",
          ai_analysis: postData.ai_analysis || null // 添加 AI 分析字段
        };
        
        setPost(formattedPost);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch post details:", err);
        setError('Failed to load post details');
        setLoading(false);
      }
    };

    fetchPostDetail();

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

    // 获取评论数据
    const fetchComments = async () => {
      if (!id) return;
      
      try {
        setCommentsLoading(true);
        const commentsData = await mediaAPI.getPostComments(id);
        
        // 获取所有评论，不仅仅是主评论
        setComments(commentsData);
        
        // 计算总评论数量：每个主评论(level=1)的replyCount + 1(主评论自身)
        const totalCommentsCount = commentsData
          .filter(comment => comment.level === 1)
          .reduce((total, comment) => {
            // 每个主评论算1，加上它的回复数
            return total + 1 + (comment.replyCount || 0);
          }, 0);
        
        setTotalComments(totalCommentsCount);
        
        setCommentsLoading(false);
      } catch (err) {
        console.error('加载评论失败:', err);
        setCommentsLoading(false);
      }
    };

    fetchComments();
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
    navigate(`/author/${post.author.id}`);
  };

  // 处理评论提交
  const handleCommentSubmit = (newComment) => {
    console.log('New comment received in ForumDetailPage:', newComment);
    
    // 不需要重复调用 API，因为 CommentPage 已经调用过了
    // 只需要更新本地状态
    setNewComment(newComment);
    
    // 更新评论总数
    setTotalComments(prev => prev + 1);
    
    // 关闭评论弹窗
    setIsCommentModalOpen(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((currentImageIndex - 1 + post.mediaList.length) % post.mediaList.length);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((currentImageIndex + 1) % post.mediaList.length);
  };

  // 处理点赞/取消点赞
  const handleLikeClick = async () => {
    // 防止重复点击导致的状态错乱
    if (isProcessingLike) return;
    setIsProcessingLike(true);
    
    // 立即更新UI状态，不等待API响应
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setPost(prev => ({
      ...prev,
      likes: prev.likes + (newLikedState ? 1 : -1)
    }));
    
    try {
      // 后台发送请求
      const response = await mediaAPI.toggleLike(id);
      
      // 如果API返回的状态与我们预期的不一致，则回滚UI状态
      if (response.status === 'success' && response.action !== (newLikedState ? 'liked' : 'unliked')) {
        setIsLiked(!newLikedState);
        setPost(prev => ({
          ...prev,
          likes: prev.likes + (newLikedState ? -1 : 1)
        }));
      }
    } catch (error) {
      // 如果请求失败，回滚UI状态
      console.error('Error toggling like:', error);
      setIsLiked(!newLikedState);
      setPost(prev => ({
        ...prev,
        likes: prev.likes + (newLikedState ? -1 : 1)
      }));
    } finally {
      // 无论成功失败，都重置处理状态
      setIsProcessingLike(false);
    }
  };

  // 修改媒体错误处理函数，确保备用图片能够正确加载
  const handleMediaError = (e) => {
    console.log("媒体加载失败，替换为备用 Web3 图片");
    
    // 使用多个备用图片源，如果一个失败可以尝试另一个
    const fallbackImages = [
      "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80",
      "https://images.unsplash.com/photo-1642059889111-25b8f7975aec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      // 添加本地备用图片作为最后的保障
      "/assets/images/fallback-web3.jpg"
    ];
    
    // 记录当前尝试的图片索引
    if (!e.target.dataset.fallbackIndex) {
      e.target.dataset.fallbackIndex = 0;
    } else {
      e.target.dataset.fallbackIndex = parseInt(e.target.dataset.fallbackIndex) + 1;
    }
    
    const index = parseInt(e.target.dataset.fallbackIndex);
    
    // 如果还有备用图片可以尝试
    if (index < fallbackImages.length) {
      e.target.src = fallbackImages[index];
    } else {
      // 所有备用图片都失败，显示一个纯色背景和文字
      const parent = e.target.parentNode;
      const placeholder = document.createElement('div');
      placeholder.className = 'media-fallback';
      placeholder.innerHTML = 'Web3 Media Content';
      
      // 移除原始图片并添加占位符
      if (parent) {
        parent.replaceChild(placeholder, e.target);
      }
      
      // 防止无限循环
      e.target.onerror = null;
    }
  };

  // 添加这个辅助函数来检测媒体是否为视频
  const isMediaVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
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
                  title={`View ${post.author.name}'s profile`}
                >
                  <img 
                    src={post.author.avatar} 
                    alt={`${post.author.name}'s avatar`} 
                    className="author-avatar-img"
                    onError={handleMediaError}
                  />
                </div>
                <div className="author-details">
                  <span 
                    className="author-name"
                    onClick={handleAuthorClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {post.author.name}
                  </span>
                  <span className="post-time">
                    Posted on {formatChineseTime(post.timestamp)}
                  </span>
                </div>
              </div>
            </div>
            <div className="meta-right">
              <div className="post-stats">
                <div 
                  className={`stat-item likes ${isLiked ? 'liked' : ''}`}
                  onClick={handleLikeClick}
                  style={{ cursor: 'pointer' }}
                >
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

        {post.mediaList && post.mediaList.length > 0 && (
          <div className="forum-detail-media" data-aos="fade-up">
            <div className="detail-image-carousel">
              <div className="carousel-container">
                {post.mediaList.map((mediaUrl, index) => (
                  <div 
                    key={index} 
                    className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
                  >
                    <div className="image-container">
                      {isMediaVideo(mediaUrl) ? (
                        <div className="detail-video-container">
                          <video
                            ref={el => el && (el.id = `detail-video-${index}`)}
                            src={mediaUrl} 
                            className="detail-video"
                            poster={post.thumbnail}
                            playsInline
                            onError={(e) => {
                              console.log("视频加载失败，显示备用图片");
                              
                              // 尝试多个备用图片
                              const fallbackImages = [
                                "https://images.unsplash.com/photo-1642059889111-25b8f7975aec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                                "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
                                "/assets/images/fallback-web3.jpg"
                              ];
                              
                              // 创建一个图片元素替换视频
                              const imgElement = document.createElement('img');
                              imgElement.src = fallbackImages[0];
                              imgElement.className = "detail-video";
                              imgElement.alt = "Web3 visualization";
                              
                              // 为新创建的图片添加错误处理
                              imgElement.onerror = function(imgError) {
                                if (!this.dataset.fallbackIndex) {
                                  this.dataset.fallbackIndex = 1; // 从第二个备用图片开始尝试
                                } else {
                                  this.dataset.fallbackIndex = parseInt(this.dataset.fallbackIndex) + 1;
                                }
                                
                                const index = parseInt(this.dataset.fallbackIndex);
                                
                                if (index < fallbackImages.length) {
                                  this.src = fallbackImages[index];
                                } else {
                                  // 创建一个纯色背景和文字作为最终备用
                                  const placeholder = document.createElement('div');
                                  placeholder.className = 'media-fallback';
                                  placeholder.innerHTML = 'Web3 Media Content';
                                  this.parentNode.replaceChild(placeholder, this);
                                }
                              };
                              
                              // 替换视频元素
                              e.target.parentNode.replaceChild(imgElement, e.target);
                              
                              // 隐藏播放按钮
                              const playButton = document.querySelector(`.detail-video-play-${index}`);
                              if (playButton) {
                                playButton.style.display = 'none';
                              }
                            }}
                          />
                          <button
                            className={`detail-video-play detail-video-play-${index}`}
                            onClick={() => {
                              const videoEl = document.getElementById(`detail-video-${index}`);
                              if (videoEl) handleVideoPlay(videoEl);
                            }}
                          >
                            {playingVideo ? <FaPause /> : <FaPlay />}
                          </button>
                        </div>
                      ) : (
                        <img 
                          src={mediaUrl} 
                          alt={`${post.title} - image ${index + 1}`} 
                          className="carousel-image"
                          onError={handleMediaError}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {post.mediaList.length > 1 && (
                <>
                  <button 
                    className="carousel-control prev" 
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    className="carousel-control next" 
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                  <div className="carousel-indicators">
                    {post.mediaList.map((_, index) => (
                      <span 
                        key={index} 
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
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
            {post.ai_analysis ? (
              <>
                <div className="ai-analysis-item">
                  <h4>Key Points:</h4>
                  {(() => {
                    const aiData = JSON.parse(post.ai_analysis);
                    const summary = aiData.summary;
                    
                    // 先分割成段落
                    const paragraphs = summary.split('\n\n');
                    
                    return paragraphs.map((paragraph, pIndex) => {
                      // 检查是否包含列表项（包括 \n- 和 - 开头的情况）
                      if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
                        // 处理段落中的列表
                        let introText = '';
                        let listItems = [];
                        
                        if (paragraph.startsWith('- ')) {
                          // 如果段落直接以 - 开头
                          listItems = paragraph.split('\n- ');
                          // 第一项需要去掉开头的 -
                          listItems[0] = listItems[0].substring(2);
                        } else {
                          // 如果段落中间包含 \n-
                          const parts = paragraph.split('\n- ');
                          introText = parts[0];
                          listItems = parts.slice(1);
                        }
                        
                        return (
                          <div key={pIndex}>
                            {introText && <p>{introText}</p>}
                            <ul className="ai-analysis-list">
                              {listItems.map((item, iIndex) => (
                                <li key={iIndex}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      } else {
                        // 普通段落
                        return <p key={pIndex}>{paragraph}</p>;
                      }
                    });
                  })()}
                </div>
                <div className="ai-analysis-item">
                  <h4>Tags Analysis:</h4>
                  <div className="sentiment-tags">
                    {JSON.parse(post.ai_analysis).tags.map((tag, index) => (
                      <span key={index} className="sentiment-tag positive">{tag}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
          
          {commentsLoading ? (
            <div className="comments-loading">
              <div className="loading-spinner"></div>
              <p>Loading comments...</p>
            </div>
          ) : (
            <CommentBar 
              postId={id} 
              comments={comments} // 传递评论数据
              newComment={newComment}
            />
          )}

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
