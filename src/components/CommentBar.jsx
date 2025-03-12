import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaReply, FaEllipsisH } from 'react-icons/fa';
import './CommentBar.css';

function CommentBar({ postId, newComment }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 初始加载评论
  useEffect(() => {
    console.log('加载评论，postId:', postId); // 添加日志
    fetch('/forumcomment.json')
      .then(response => response.json())
      .then(data => {
        // 过滤出当前帖子的评论
        const postComments = data.comments.filter(comment => comment.postId === parseInt(postId));
        console.log('已加载的评论:', postComments); // 添加日志
        setComments(postComments);
        setLoading(false);
      })
      .catch(err => {
        console.error('加载评论失败:', err); // 添加日志
        setError('Failed to load comments');
        setLoading(false);
      });
  }, [postId]);

  // 当收到新评论时，将其添加到评论列表
  useEffect(() => {
    console.log('收到新评论:', newComment); // 添加日志
    if (newComment) {
      setComments(prevComments => {
        const updatedComments = [newComment, ...prevComments];
        console.log('更新后的评论列表:', updatedComments);
        return updatedComments;
      });
    }
  }, [newComment]);

  const handleAuthorClick = (authorId) => {
    navigate(`/author/${authorId}`);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="web3-comments-loading">
        <div className="web3-comments-loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="web3-comments-error">{error}</div>;
  }

  return (
    <div className="web3-comments-container">
      {comments.map(comment => (
        <div key={comment.id} className="web3-comments-thread">
          <div className="web3-comments-main">
            <div className="web3-comments-avatar" onClick={() => handleAuthorClick(comment.authorId)}>
              {comment.authorAvatar}
            </div>
            <div className="web3-comments-content">
              <div className="web3-comments-header">
                <h4 className="web3-comments-author" onClick={() => handleAuthorClick(comment.authorId)}>
                  {comment.authorName}
                </h4>
                <span className="web3-comments-time">{formatTimestamp(comment.timestamp)}</span>
                <button className="web3-comments-more">
                  <FaEllipsisH />
                </button>
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

          {comment.replies && comment.replies.length > 0 && (
            <div className="web3-comments-replies">
              {comment.replies.map(reply => (
                <div key={reply.id} className="web3-comments-reply">
                  <div className="web3-comments-avatar" onClick={() => handleAuthorClick(reply.authorId)}>
                    {reply.authorAvatar}
                  </div>
                  <div className="web3-comments-content">
                    <div className="web3-comments-header">
                      <h4 className="web3-comments-author" onClick={() => handleAuthorClick(reply.authorId)}>
                        {reply.authorName}
                      </h4>
                      <span className="web3-comments-time">{formatTimestamp(reply.timestamp)}</span>
                    </div>
                    <p className="web3-comments-text">{reply.content}</p>
                    <div className="web3-comments-actions">
                      <button className="web3-comments-btn">
                        <FaHeart />
                        <span>{reply.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CommentBar;
