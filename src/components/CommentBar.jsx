import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaReply, FaEllipsisH, FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CommentPage from './CommentPage'; // 导入评论弹窗组件
import { mediaAPI } from '../router'; // 导入 API
import './CommentBar.css';

function CommentBar({ postId, comments, newComment }) {
  const [processedComments, setProcessedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repliesMap, setRepliesMap] = useState({}); // Store replies for each main comment
  const [expandedComments, setExpandedComments] = useState({}); // 跟踪哪些评论已展开
  const [replyingTo, setReplyingTo] = useState(null); // 存储正在回复的评论信息
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const navigate = useNavigate();

  // 获取当前用户信息 (从 localStorage 或其他存储中)
  const currentUser = {
    id: localStorage.getItem('userId') || '1',
    name: localStorage.getItem('username') || 'User',
    avatar: localStorage.getItem('userAvatar') || 'U'
  };

  // 当接收到外部评论数据时处理
  useEffect(() => {
    if (comments) {
      console.log('Processing comments from props:', comments);
      
      // 处理空评论数组的情况
      if (comments.length === 0) {
        setProcessedComments([]);
        setRepliesMap({});
        setLoading(false);
        return;
      }
      
      // Filter level 1 comments (main comments)
      const mainComments = comments.filter(comment => comment.level === 1);
      console.log('Filtered main comments:', mainComments);
      
      // Sort main comments by time (newest first)
      mainComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Process child comments by rootId
      const repliesData = {};
      
      // Get all non-main comments
      const childComments = comments.filter(comment => comment.level > 1);
      
      // Create reply arrays for each main comment
      mainComments.forEach(mainComment => {
        if (!repliesData[mainComment._id]) {
          repliesData[mainComment._id] = [];
        }
        
        // Find all level 2 comments for this main comment
        const level2Comments = childComments.filter(
          comment => comment.rootId === mainComment._id && comment.level === 2
        );
        
        // Sort level 2 comments by time (newest first)
        level2Comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Process each level 2 comment and its level 3 replies
        level2Comments.forEach(level2Comment => {
          repliesData[mainComment._id].push(level2Comment);
          
          // Find all level 3 comments that belong to this level 2 comment
          const level3Comments = childComments.filter(
            comment => comment.rootId === mainComment._id && 
                      comment.level === 3 && 
                      (comment.parentId === level2Comment._id || 
                        isDescendantOf(comment, level2Comment._id, childComments))
          );
          
          // Sort level 3 comments by time (oldest first)
          level3Comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          // Add all level 3 comments
          repliesData[mainComment._id].push(...level3Comments);
        });
      });
      
      // Helper function to check if a comment is a descendant of a specific comment
      function isDescendantOf(comment, ancestorId, allComments) {
        if (comment.parentId === ancestorId) return true;
        
        const parent = allComments.find(c => c._id === comment.parentId);
        if (!parent) return false;
        
        return isDescendantOf(parent, ancestorId, allComments);
      }
      
      setProcessedComments(mainComments);
      setRepliesMap(repliesData);
      setLoading(false);
    } else {
      // 如果 comments 是 undefined 或 null
      setProcessedComments([]);
      setRepliesMap({});
      setLoading(false);
    }
  }, [comments]);

  // 处理新评论
  useEffect(() => {
    if (newComment) {
      console.log('Received new comment in CommentBar:', newComment);
      
      // 如果是主评论 (level 1)
      if (newComment.level === 1) {
        // 直接添加到主评论列表开头
        setProcessedComments(prevComments => {
          // 检查评论是否已存在
          const commentExists = prevComments.some(c => c._id === newComment._id);
          if (commentExists) {
            return prevComments;
          }
          // 添加到开头
          return [newComment, ...prevComments];
        });
        
        // 初始化空回复数组
        setRepliesMap(prev => ({
          ...prev,
          [newComment._id]: []
        }));
      } 
      // 如果是回复 (level > 1)
      else if (newComment.rootId) {
        // 添加到对应主评论的回复列表
        setRepliesMap(prev => {
          const rootReplies = [...(prev[newComment.rootId] || [])];
          
          // 检查回复是否已存在
          const replyExists = rootReplies.some(r => r._id === newComment._id);
          if (replyExists) {
            return prev;
          }
          
          // 添加新回复
          rootReplies.push(newComment);
          
          return {
            ...prev,
            [newComment.rootId]: rootReplies
          };
        });
        
        // 自动展开该评论
        setExpandedComments(prev => ({
          ...prev,
          [newComment.rootId]: true
        }));
      }
    }
  }, [newComment]);

  // 处理回复按钮点击
  const handleReplyClick = (comment) => {
    // 设置正在回复的评论信息
    setReplyingTo({
      commentId: comment._id,
      rootId: comment.level === 1 ? comment._id : comment.rootId,
      parentId: comment._id,
      authorName: comment.username
    });
    
    // 打开评论弹窗
    setIsCommentModalOpen(true);
  };

  // 处理评论提交
  const handleCommentSubmit = (newComment) => {
    // 关闭评论弹窗
    setIsCommentModalOpen(false);
    
    // 如果是回复主评论 (level 1)，创建 level 2 评论
    if (newComment.level === 2) {
      setRepliesMap(prev => {
        const rootReplies = [...(prev[newComment.rootId] || [])];
        rootReplies.push(newComment);
        
        // 按时间排序 (level 2 评论按最新排序)
        rootReplies.sort((a, b) => {
          if (a.level === 2 && b.level === 2) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.level - b.level;
        });
        
        return {
          ...prev,
          [newComment.rootId]: rootReplies
        };
      });
      
      // 自动展开该评论
      setExpandedComments(prev => ({
        ...prev,
        [newComment.rootId]: true
      }));
    } 
    // 如果是回复子评论 (level 2 或 3)，创建 level 3 评论
    else if (newComment.level === 3) {
      console.log('新增level3')
      setRepliesMap(prev => {
        const rootReplies = [...(prev[newComment.rootId] || [])];
        rootReplies.push(newComment);
        
        // 按时间排序 (level 3 评论按最早排序)
        rootReplies.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return {
          ...prev,
          [newComment.rootId]: rootReplies
        };
      });
      
      // 自动展开该评论
      setExpandedComments(prev => ({
        ...prev,
        [newComment.rootId]: true
      }));
    }
    // 如果是主评论 (level 1)，添加到主评论列表
    else {
      setProcessedComments(prev => [newComment, ...prev]);
      
      // 初始化空回复数组
      setRepliesMap(prev => ({
        ...prev,
        [newComment._id]: []
      }));
    }
    
    // 重置回复状态
    setReplyingTo(null);
  };

  // 切换评论展开/折叠状态
  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Format timestamp to English format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // Handle timestamps with microseconds (e.g., "2025-05-08T10:01:16.561000")
      let dateStr = timestamp;
      
      // If timestamp contains microseconds and format is non-standard, fix it
      if (timestamp.includes('.') && timestamp.split('.')[1].length > 3) {
        // Truncate microseconds to 3 digits to ensure ISO compliance
        const parts = timestamp.split('.');
        dateStr = parts[0] + '.' + parts[1].substring(0, 3) + 'Z';
      }
      
      // Create date object
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid timestamp format:', timestamp);
        return timestamp; // Return original string
      }
      
      // Format date to English format
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return timestamp; // Return original string on error
    }
  };

  // Get the username of the parent comment for reply
  const getReplyToName = (reply) => {
    if (!reply.parentId) return '';
    
    // Find the parent comment in all replies
    for (const rootId in repliesMap) {
      const parentComment = repliesMap[rootId].find(c => c._id === reply.parentId);
      if (parentComment) {
        return parentComment.username;
      }
    }
    
    // If parent comment is a main comment
    const parentComment = processedComments.find(c => c._id === reply.parentId);
    return parentComment ? parentComment.username : '';
  };

  // Handle click on author name or avatar
  const handleAuthorClick = (userId) => {
    if (userId) {
      navigate(`/author/${userId}`);
    }
  };

  // 处理点赞
  const handleLikeClick = async (commentId) => {
    try {
      await mediaAPI.likeComment(commentId);
      
      // 更新主评论的点赞数
      setProcessedComments(prev => 
        prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      );
      
      // 更新回复的点赞数
      setRepliesMap(prev => {
        const updatedReplies = {};
        
        Object.keys(prev).forEach(rootId => {
          updatedReplies[rootId] = prev[rootId].map(reply => 
            reply._id === commentId 
              ? { ...reply, likes: reply.likes + 1 } 
              : reply
          );
        });
        
        return updatedReplies;
      });
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="web3-comments-loading">
        <div className="loading-spinner"></div>
        <p>Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return <div className="web3-comments-error">{error}</div>;
  }

  return (
    <div className="web3-comments-container">
      {processedComments.length === 0 ? (
        <div className="web3-comments-empty">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        processedComments.map(comment => (
          <div key={comment._id} className="web3-comments-item">
            <div className="web3-comments-main">
              <div className="web3-comments-avatar" onClick={() => handleAuthorClick(comment.userId)}>
                {comment.avatar ? (
                  <img 
                    src={comment.avatar} 
                    alt={comment.username} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                ) : (
                  comment.username?.charAt(0) || <FaUser />
                )}
              </div>
              <div className="web3-comments-content">
                <div className="web3-comments-header">
                  <h4 
                    className="web3-comments-author" 
                    onClick={() => handleAuthorClick(comment.userId)}
                  >
                    {comment.username}
                  </h4>
                  <span className="web3-comments-time">{formatTimestamp(comment.createdAt)}</span>
                  <button className="web3-comments-more">
                    <FaEllipsisH />
                  </button>
                </div>
                <p className="web3-comments-text">{comment.content}</p>
                <div className="web3-comments-actions">
                  <button 
                    className="web3-comments-btn"
                    onClick={() => handleLikeClick(comment._id)}
                  >
                    <FaHeart />
                    <span>{comment.likes}</span>
                  </button>
                  <button 
                    className="web3-comments-btn"
                    onClick={() => handleReplyClick(comment)}
                  >
                    <FaReply />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
            
            {repliesMap[comment._id] && repliesMap[comment._id].length > 0 && (
              <div className="web3-comments-replies">
                <div className="web3-comments-replies-list">
                  {/* 只显示最新的一条回复，或者显示全部（如果已展开） */}
                  {(expandedComments[comment._id] 
                    ? repliesMap[comment._id] 
                    : repliesMap[comment._id].slice(0, 1)
                  ).map(reply => (
                    <div 
                      key={reply._id} 
                      className="web3-comments-reply"
                    >
                      <div className="web3-comments-avatar" onClick={() => handleAuthorClick(reply.userId)}>
                        {reply.avatar ? (
                          <img 
                            src={reply.avatar} 
                            alt={reply.username} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                          />
                        ) : (
                          reply.username?.charAt(0) || <FaUser />
                        )}
                      </div>
                      <div className="web3-comments-content">
                        <div className="web3-comments-header">
                          <h4 
                            className="web3-comments-author" 
                            onClick={() => handleAuthorClick(reply.userId)}
                          >
                            {reply.username}
                          </h4>
                          <span className="web3-comments-time">{formatTimestamp(reply.createdAt)}</span>
                        </div>
                        <p className="web3-comments-text">
                          {reply.rootId !== reply.parentId && (
                            <span className="web3-comments-reply-to">
                              @{getReplyToName(reply)}
                            </span>
                          )}
                          {reply.content}
                        </p>
                        <div className="web3-comments-actions">
                          <button 
                            className="web3-comments-btn"
                            onClick={() => handleLikeClick(reply._id)}
                          >
                            <FaHeart />
                            <span>{reply.likes}</span>
                          </button>
                          <button 
                            className="web3-comments-btn"
                            onClick={() => handleReplyClick(reply)}
                          >
                            <FaReply />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 显示展开/折叠按钮，如果回复数量大于1 */}
                  {repliesMap[comment._id].length > 1 && (
                    <button 
                      className="web3-comments-expand-btn"
                      onClick={() => toggleCommentExpansion(comment._id)}
                    >
                      {expandedComments[comment._id] ? (
                        <>
                          <FaChevronUp /> Hide replies
                        </>
                      ) : (
                        <>
                          <FaChevronDown /> Show {repliesMap[comment._id].length - 1} more {repliesMap[comment._id].length - 1 === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
      
      {/* 评论回复弹窗 */}
      {isCommentModalOpen && (
        <CommentPage
          isOpen={isCommentModalOpen}
          onClose={() => {
            setIsCommentModalOpen(false);
            setReplyingTo(null);
          }}
          postId={postId}
          authorInfo={{
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorAvatar: currentUser.avatar
          }}
          onCommentSubmit={handleCommentSubmit}
          parentId={replyingTo?.parentId}
          rootId={replyingTo?.rootId}
        />
      )}
    </div>
  );
}

export default CommentBar;
