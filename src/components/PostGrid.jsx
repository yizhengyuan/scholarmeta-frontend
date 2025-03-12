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

  return (
    <div 
      className="forum-post-card" 
      data-aos="fade-up"
      onClick={(e) => onPostClick(post.id, e)}
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
                playsInline
              />
              <button 
                className="forum-post-video-play"
                onClick={handleVideoPlay}
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
  );
}

export default PostGrid;
