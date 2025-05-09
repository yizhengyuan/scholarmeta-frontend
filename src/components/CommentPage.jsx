import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 导入 createPortal
import { FaTimes, FaImage } from 'react-icons/fa';
import { mediaAPI } from '../router'; // 导入 API
import LoginPage from './LoginPage'; // 导入 LoginPage 组件
import './CommentPage.css';

function CommentPage({ isOpen, onClose, postId, onCommentSubmit, parentId = null, rootId = null }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false); // 添加登录页面状态
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
  }, [showLogin]); // 添加 showLogin 作为依赖，以便在登录后重新获取用户信息

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
      
      // 检查是否是 401 Unauthorized 错误 - 增强错误检测
      if (
        (err.response && err.response.status === 401) || 
        (err.message && err.message.includes('401')) ||
        (err.toString().includes('401')) ||
        (err.toString().includes('Unauthorized'))
      ) {
        console.log('401 错误被检测到，显示登录页面');
        // 显示登录页面
        setShowLogin(true);
        setError('Please login to submit your comment');
      } else {
        setError('Failed to submit comment. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理登录成功
  const handleLoginSuccess = (userData) => {
    console.log('登录成功，用户数据:', userData);
    // 更新用户信息
    setAuthorInfo({
      authorId: localStorage.getItem('userId') || '',
      authorName: localStorage.getItem('username') || 'Anonymous',
      authorAvatar: localStorage.getItem('userAvatar') || ''
    });
    
    // 关闭登录页面
    setShowLogin(false);
    
    // 清除错误信息
    setError(null);
    
    // 注意：这里不会自动重新提交评论，让用户重新决定是否要提交
    setCommentText(commentText); // 保留用户之前输入的评论内容
  };

  if (!isOpen) return null;

  // 渲染评论页面到 body 元素
  const commentPortal = createPortal(
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
    document.body // 将评论弹窗渲染到 body 元素
  );
  
  // 将登录页面渲染到 document.body，确保它在最顶层
  const loginPortal = showLogin ? createPortal(
    <div id="login-portal-container" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      paddingLeft: '100px',
      zIndex: 10000 
    }}>
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onClose={() => setShowLogin(false)} 
      />
    </div>,
    document.body
  ) : null;

  // 调试输出
  console.log('showLogin 状态:', showLogin);

  return (
    <>
      {commentPortal}
      {loginPortal}
    </>
  );
}

export default CommentPage;