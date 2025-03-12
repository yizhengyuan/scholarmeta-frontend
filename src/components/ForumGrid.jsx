import React, { useState } from 'react';
import './ForumGrid.css';
import PostGrid from './PostGrid';

function ForumGrid({ posts, loading, error, searchTerm, sortBy }) {
  const [playingVideo, setPlayingVideo] = useState(null);

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
    if (event.target.closest('.forum-post-video-play')) {
      return;
    }
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
        <PostGrid
          key={post.id}
          post={post}
          onPostClick={handlePostClick}
          playingVideo={playingVideo}
          onVideoPlay={handleVideoPlay}
        />
      ))}
    </div>
  );
}

export default ForumGrid;