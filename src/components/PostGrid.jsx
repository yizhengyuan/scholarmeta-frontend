import React from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import './PostGrid.css';

function PostGrid({ post, onPostClick, playingVideo, onVideoPlay }) {
  const handleVideoPlay = (event) => {
    event.stopPropagation();
    const videoEl = document.getElementById(`video-${post.id}`);
    if (videoEl) {
      onVideoPlay(post.id, videoEl);
    }
  };

  // 获取媒体URL (处理单个URL或URL数组)
  const getMediaUrl = () => {
    if (post.file_paths && post.file_paths.length > 0) {
      return post.file_paths[0]; // 使用第一个文件路径
    } else if (post.media) {
      return post.media; // 兼容旧数据结构
    }
    return '';
  };

  // 获取缩略图URL
  const getThumbnailUrl = () => {
    if (post.thumbnail) {
      return post.thumbnail;
    } else if (post.file_paths && post.file_paths.length > 0) {
      return post.file_paths[0]; // 使用第一个文件作为缩略图
    }
    return '';
  };

  // 获取作者名称
  const getAuthorName = () => {
    return post.user_name || post.author || 'Anonymous';
  };

  // 获取预览文本
  const getPreviewText = () => {
    return post.summary || post.preview || '';
  };

  // 获取时间戳
  const getTimestamp = () => {
    return post.created_at || post.timestamp || new Date().toISOString();
  };

  // 获取媒体类型
  const getMediaType = () => {
    return post.media_type || post.mediaType || 'image';
  };

  // 获取头像URL
  const getAvatarUrl = () => {
    return post.user_avatar || post.avatar || '';
  };

  // 格式化时间为中国时间
  const formatChineseTime = (timestamp) => {
    if (!timestamp) return '';
    
    // 创建日期对象 - 自动处理 ISO 格式和时区
    const date = new Date(timestamp);
    
    // 格式化为中国日期格式
    return date.toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取文档类型的备用图片
  const getDocumentFallbackImage = () => {
    return "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80";
  };

  // 获取视频类型的备用图片 (使用不同的网图)
  const getVideoFallbackImage = () => {
    return "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80";
  };

  return (
    <div 
      className="forum-post-card" 
      data-aos="fade-up"
      onClick={(e) => onPostClick(post.id, e)}
      style={{ cursor: 'pointer' }}
    >
      <div className="post-glow"></div>
      
      {(post.media || (post.file_paths && post.file_paths.length > 0)) && (
        <div className="forum-post-media">
          {getMediaType() === 'image' ? (
            <img 
              src={getMediaUrl()} 
              alt={post.title}
              className="forum-post-image"
            />
          ) : getMediaType() === 'video' ? (
            <div className="forum-post-video-container">
              <img 
                src={getVideoFallbackImage()}
                alt={post.title}
                className="forum-post-image"
              />
              <div className="video-type-indicator">Video</div>
              <button 
                className="forum-post-video-play"
                onClick={handleVideoPlay}
              >
                {playingVideo?.id === post.id ? <FaPause /> : <FaPlay />}
              </button>
            </div>
          ) : getMediaType() === 'document' ? (
            <div className="forum-post-document">
              <img 
                src={getDocumentFallbackImage()} 
                alt={post.title}
                className="forum-post-image"
              />
              <div className="document-type-indicator">Document</div>
            </div>
          ) : null}
        </div>
      )}

      <div className="forum-post-header">
        <h3 className="forum-post-title">{post.title}</h3>
        <div className="forum-post-meta">
          <span className="forum-post-author">
            <span className="forum-post-author-avatar">
              {getAvatarUrl() ? (
                <img src={getAvatarUrl()} alt={getAuthorName()} className="forum-post-avatar-img" />
              ) : (
                getAuthorName().charAt(0)
              )}
            </span>
            {getAuthorName()}
          </span>
          <span className="forum-post-time">
            {formatChineseTime(getTimestamp())}
          </span>
        </div>
      </div>
      
      <p className="forum-post-preview">{getPreviewText()}</p>
      
      <div className="forum-post-footer">
        <div className="forum-post-tags">
          {(post.tags || []).map(tag => (
            <span key={tag} className="forum-post-tag">#{tag}</span>
          ))}
        </div>
        
        <div className="forum-post-stats">
          <span className="forum-stat-item">
            <span className="stat-icon">👍</span>
            {post.likes || 0}
          </span>
          <span className="forum-stat-item">
            <span className="stat-icon">💬</span>
            {post.comments || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PostGrid;