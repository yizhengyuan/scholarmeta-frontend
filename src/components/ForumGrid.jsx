import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForumGrid.css';
import { FaPlay, FaPause } from 'react-icons/fa';

function ForumGrid() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    fetch('/forumdata.json')
      .then(response => response.json())
      .then(data => {
        setPosts(data.posts);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load forum posts');
        setLoading(false);
      });
  }, []);

  const handleVideoPlay = (postId, videoRef) => {
    if (playingVideo && playingVideo.id !== postId) {
      playingVideo.ref.pause();
    }
    
    if (videoRef.paused) {
      videoRef.play();
      setPlayingVideo({ id: postId, ref: videoRef });
    } else {
      videoRef.pause();
      setPlayingVideo(null);
    }
  };

  const handlePostClick = (detailId, event) => {
    // 如果点击的是视频播放按钮，不进行跳转
    if (event.target.closest('.forum-post-video-play')) {
      return;
    }
    // 在新窗口打开详情页
    window.open(`/forum/detail/${detailId}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="forum-loading">
        <div className="loading-spinner"></div>
        <span>Loading discussions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forum-error">
        <span className="error-icon">⚠️</span>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="forum-grid">
      {posts.map(post => (
        <div 
          key={post.id} 
          className="forum-post-card" 
          data-aos="fade-up"
          onClick={(e) => handlePostClick(post.detailId, e)}
          style={{ cursor: 'pointer' }}
        >
          <div className="post-glow"></div>
          
          {post.media && (
            <div className="forum-post-media">
              {post.mediaType === 'image' ? (
                <img 
                  src={post.media} 
                  alt={post.title}
                  className="forum-post-image"
                />
              ) : post.mediaType === 'video' && (
                <div className="forum-post-video-container">
                  <video 
                    ref={el => el && (el.id = `video-${post.id}`)}
                    src={post.media}
                    className="forum-post-video"
                    poster={post.thumbnail}
                    playsInline // 移动端内联播放
                  />
                  <button 
                    className="forum-post-video-play"
                    onClick={() => {
                      const videoEl = document.getElementById(`video-${post.id}`);
                      if (videoEl) {
                        handleVideoPlay(post.id, videoEl);
                      }
                    }}
                  >
                    {playingVideo?.id === post.id ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="forum-post-header">
            <h3 className="forum-post-title">{post.title}</h3>
            <div className="forum-post-meta">
              <span className="forum-post-author">
                <span className="author-avatar">
                  {post.author.charAt(0)}
                </span>
                {post.author}
              </span>
              <span className="forum-post-time">
                {new Date(post.timestamp).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <p className="forum-post-preview">{post.preview}</p>
          
          <div className="forum-post-footer">
            <div className="forum-post-tags">
              {post.tags.map(tag => (
                <span key={tag} className="forum-post-tag">#{tag}</span>
              ))}
            </div>
            
            <div className="forum-post-stats">
              <span className="forum-stat-item">
                <span className="stat-icon">👍</span>
                {post.likes}
              </span>
              <span className="forum-stat-item">
                <span className="stat-icon">💬</span>
                {post.comments}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ForumGrid;