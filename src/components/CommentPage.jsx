import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 导入 createPortal
import { FaTimes, FaImage } from 'react-icons/fa';
import { mediaAPI } from '../router'; // 导入 API
import './CommentPage.css';

function CommentPage({ isOpen, onClose, postId, onCommentSubmit, parentId = null, rootId = null }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [authorInfo, setAuthorInfo] = useState({
    authorId: '',
    authorName: '',
    authorAvatar: ''
  });

  // Get user info from localStorage
  useEffect(() => {
    try {
      // Try to get user data from localStorage cache
      const userDataString = localStorage.getItem('mypage_user_data_cache');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setAuthorInfo({
          authorId: userData.id || localStorage.getItem('userId') || '',
          authorName: userData.username || localStorage.getItem('username') || 'Anonymous',
          authorAvatar: userData.avatar || localStorage.getItem('userAvatar') || ''
        });
      } else {
        // If cache not found, try other possible localStorage items
        setAuthorInfo({
          authorId: localStorage.getItem('userId') || '',
          authorName: localStorage.getItem('username') || 'Anonymous',
          authorAvatar: localStorage.getItem('userAvatar') || ''
        });
      }
    } catch (err) {
      console.error('Failed to get user data:', err);
      // Set default values
      setAuthorInfo({
        authorId: localStorage.getItem('userId') || '',
        authorName: 'Anonymous',
        authorAvatar: ''
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Determine comment type
      let commentData = {
        postId: postId,
        content: commentText,
        imageUrl: ""
      };

      // If parentId and rootId exist, this is a reply
      if (parentId && rootId) {
        commentData.parentId = parentId;
        commentData.rootId = rootId;
      }

      // Send comment request
      const response = await mediaAPI.createComment(commentData);
      
      // Create frontend comment object for display
      const newComment = {
        _id: response._id || Date.now().toString(),
        postId: postId,
        userId: authorInfo.authorId,
        username: authorInfo.authorName,
        avatar: authorInfo.authorAvatar,
        content: commentText,
        createdAt: new Date().toISOString(),
        likes: 0,
        level: parentId && rootId ? (parentId === rootId ? 2 : 3) : 1,
        parentId: parentId || null,
        rootId: rootId || null
      };

      // Call parent component callback with new comment
      onCommentSubmit(newComment);
      
      // Clear input and close modal
      setCommentText('');
      onClose();
    } catch (err) {
      console.error('Comment submission failed:', err);
      setError('Failed to submit comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Use Portal to render modal to body element
  return createPortal(
    <div className="web3comment-overlay" onClick={onClose}>
      <div className="web3comment-modal" onClick={e => e.stopPropagation()}>
        <div className="web3comment-header">
          <h2>{parentId ? 'Reply to Comment' : 'Write a Comment'}</h2>
          <button className="web3comment-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="web3comment-content">
          <div className="web3comment-user">
            <div className="web3comment-avatar">
              {typeof authorInfo.authorAvatar === 'string' && authorInfo.authorAvatar.startsWith('http') ? (
                <img src={authorInfo.authorAvatar} alt={authorInfo.authorName} />
              ) : (
                <span className="web3comment-avatar-text">{authorInfo.authorName.charAt(0)}</span>
              )}
            </div>
            <div className="web3comment-userinfo">
              <span className="web3comment-username">{authorInfo.authorName}</span>
              <span className="web3comment-status">{parentId ? 'Replying to comment' : 'Writing a comment'}</span>
            </div>
          </div>

          {error && <div className="web3comment-error">{error}</div>}

          <form onSubmit={handleSubmit} className="web3comment-form">
            <div className="web3comment-input-wrap">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={parentId ? "Write your reply..." : "Share your thoughts..."}
                className="web3comment-textarea"
                rows="4"
              />
              <div className="web3comment-tools">
                <button type="button" className="web3comment-tool-btn">
                  <FaImage />
                </button>
              </div>
            </div>

            <div className="web3comment-actions">
              <button 
                type="button" 
                className="web3comment-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="web3comment-submit"
                disabled={!commentText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : (parentId ? 'Reply' : 'Comment')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body // 将弹窗渲染到 body 元素
  );
}

export default CommentPage;