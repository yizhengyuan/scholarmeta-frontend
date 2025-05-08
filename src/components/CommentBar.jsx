import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaReply, FaEllipsisH, FaUser } from 'react-icons/fa';
import './CommentBar.css';

function CommentBar({ postId, comments, newComment }) {
  const [processedComments, setProcessedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repliesMap, setRepliesMap] = useState({}); // Store replies for each main comment
  const navigate = useNavigate();

  // 当接收到外部评论数据时处理
  useEffect(() => {
    if (comments && comments.length > 0) {
      console.log('Processing comments from props:', comments);
      
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
          // Add the level 2 comment first
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
    }
  }, [comments]);

  // 处理新评论
  useEffect(() => {
    console.log('Received new comment:', newComment);
    if (newComment) {
      if (newComment.level === 1) {
        // If it's a main comment, add to main comment list
        setProcessedComments(prevComments => {
          const updatedComments = [newComment, ...prevComments];
          console.log('Updated comment list:', updatedComments);
          return updatedComments;
        });
      } else if ((newComment.level === 2 || newComment.level === 3) && newComment.rootId) {
        // If it's a child comment, need to refetch all comments for this post
        const fetchUpdatedComments = async () => {
          try {
            const commentsData = await mediaAPI.getPostComments(postId);
            
            // Filter level 1 comments (main comments)
            const mainComments = commentsData.filter(comment => comment.level === 1);
            
            // Sort main comments by time (newest first)
            mainComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            // Process child comments by rootId
            const repliesData = {};
            
            // Get all non-main comments
            const childComments = commentsData.filter(comment => comment.level > 1);
            
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
                // Add the level 2 comment first
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
          } catch (err) {
            console.error('Failed to update comments:', err);
          }
        };
        
        fetchUpdatedComments();
      }
    }
  }, [newComment, postId]);

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

  // Get the username of the comment being replied to
  const getReplyToName = (comment) => {
    if (!comment.parentId) return '';
    
    // Find the parent comment in all replies
    for (const rootId in repliesMap) {
      const parentComment = repliesMap[rootId].find(c => c._id === comment.parentId);
      if (parentComment) {
        return parentComment.username;
      }
    }
    
    // If parent comment is a main comment
    const parentComment = processedComments.find(c => c._id === comment.parentId);
    return parentComment ? parentComment.username : '';
  };

  // Handle click on author name or avatar
  const handleAuthorClick = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
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
                </div>
                <p className="web3-comments-text">{comment.content}</p>
                <div className="web3-comments-actions">
                  <button className="web3-comments-btn">
                    <FaHeart />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="web3-comments-btn">
                    <FaReply />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
            
            {repliesMap[comment._id] && repliesMap[comment._id].length > 0 && (
              <div className="web3-comments-replies">
                <div className="web3-comments-replies-list">
                  {repliesMap[comment._id].map(reply => (
                    <div 
                      key={reply._id} 
                      className="web3-comments-reply"
                      style={{ 
                        marginLeft: '20px' // All level 2 and level 3 comments have the same indentation
                      }}
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
                          {/* Only show @username when rootId is not equal to parentId */}
                          {reply.rootId !== reply.parentId && (
                            <span className="web3-comments-reply-to">
                              @{getReplyToName(reply)}
                            </span>
                          )}
                          {reply.content}
                        </p>
                        <div className="web3-comments-actions">
                          <button className="web3-comments-btn">
                            <FaHeart />
                            <span>{reply.likes}</span>
                          </button>
                          <button className="web3-comments-btn">
                            <FaReply />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CommentBar;
