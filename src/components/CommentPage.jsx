import React, { useState } from 'react';
import { FaTimes, FaImage } from 'react-icons/fa';
import './CommentPage.css';

function CommentPage({ isOpen, onClose, postId, authorInfo, onCommentSubmit }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // 创建新评论
    const newComment = {
      id: Date.now(), // 使用时间戳作为唯一ID
      postId: parseInt(postId),
      authorId: authorInfo.authorId,
      authorName: authorInfo.authorName,
      authorAvatar: "ZS",
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0,
      totalComments: 0,
      replies: []
    };

    // 调用父组件的回调，传递新评论
    onCommentSubmit(newComment);
    
    // 清空输入并关闭弹窗
    setCommentText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="web3comment-overlay" onClick={onClose}>
      <div className="web3comment-modal" onClick={e => e.stopPropagation()}>
        <div className="web3comment-header">
          <h2>Write a Comment</h2>
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
                <span className="web3comment-avatar-text">{authorInfo.authorAvatar}</span>
              )}
            </div>
            <div className="web3comment-userinfo">
              <span className="web3comment-username">{authorInfo.authorName}</span>
              <span className="web3comment-status">Writing a comment</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="web3comment-form">
            <div className="web3comment-input-wrap">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
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
                disabled={!commentText.trim()}
              >
                Post Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CommentPage;