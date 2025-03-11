import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaTwitter, FaGithub, FaLinkedin, FaHeart, FaComment, FaPen, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './AuthorPage.css';

function AuthorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    fetch('/authordata.json')
      .then(response => response.json())
      .then(data => {
        const authorData = data.authors.find(a => a.id === parseInt(id));
        if (authorData) {
          setAuthor(authorData);
        } else {
          setError('Author not found');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load author data');
        setLoading(false);
      });
  }, [id]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/forum');
    }
  };

  if (loading) {
    return (
      <div className="web3-author-page">
        <div className="web3-author-loading">
          <div className="web3-loading-spinner"></div>
          <p>Loading author profile...</p>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="web3-author-page">
        <div className="web3-author-error">
          <h2>{error}</h2>
          <button onClick={handleBack} className="web3-back-button">
            <FaArrowLeft /> Back to Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-author-page">
      <canvas ref={particlesRef} className="web3-particles-bg"></canvas>
      
      <motion.div 
        className="web3-author-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button 
          className="web3-back-button" 
          onClick={handleBack}
          data-aos="fade-right"
        >
          <FaArrowLeft /> Back to Forum
        </button>

        <div className="web3-author-header" data-aos="fade-down">
          <div className="web3-author-cover">
            <div className="web3-author-avatar-wrapper">
              <div className="web3-author-avatar-large">
                {author.avatar}
              </div>
              <div className="web3-author-status"></div>
            </div>
          </div>
          
          <div className="web3-author-info">
            <h1 className="web3-author-name">{author.name}</h1>
            <div className="web3-author-role">{author.role}</div>
            <div className="web3-author-badges">
              {author.badges.map(badge => (
                <motion.span 
                  key={badge} 
                  className="web3-badge"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {badge}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className="web3-author-content">
          <div className="web3-author-main" data-aos="fade-up">
            <div className="web3-author-section web3-about">
              <h2>About</h2>
              <p>{author.bio}</p>
              <div className="web3-join-date">
                Member since {new Date(author.joinDate).toLocaleDateString()}
              </div>
            </div>

            <div className="web3-author-section web3-expertise">
              <h2>Expertise</h2>
              <div className="web3-expertise-grid">
                {author.expertise.map(skill => (
                  <motion.div
                    key={skill}
                    className="web3-expertise-item"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="web3-author-section web3-activity">
              <h2>Recent Activity</h2>
              <div className="web3-activity-timeline">
                {author.recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="web3-activity-item"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="web3-activity-icon">
                      {activity.type === 'post' ? <FaPen /> : <FaComment />}
                    </div>
                    <div className="web3-activity-content">
                      <div className="web3-activity-title">{activity.title}</div>
                      <div className="web3-activity-time">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="web3-author-sidebar">
            <div className="web3-author-section web3-stats" data-aos="fade-left">
              <div className="web3-stats-grid">
                <motion.div 
                  className="web3-stat-card"
                  whileHover={{ y: -5 }}
                >
                  <FaPen className="web3-stat-icon" />
                  <div className="web3-stat-value">{author.stats.posts}</div>
                  <div className="web3-stat-label">Posts</div>
                </motion.div>
                <motion.div 
                  className="web3-stat-card"
                  whileHover={{ y: -5 }}
                >
                  <FaComment className="web3-stat-icon" />
                  <div className="web3-stat-value">{author.stats.comments}</div>
                  <div className="web3-stat-label">Comments</div>
                </motion.div>
                <motion.div 
                  className="web3-stat-card"
                  whileHover={{ y: -5 }}
                >
                  <FaHeart className="web3-stat-icon" />
                  <div className="web3-stat-value">{author.stats.likes}</div>
                  <div className="web3-stat-label">Likes</div>
                </motion.div>
              </div>
            </div>

            <div className="web3-author-section web3-social" data-aos="fade-left">
              <h2>Connect</h2>
              <div className="web3-social-links">
                {author.socialLinks.twitter && (
                  <motion.a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="web3-social-link twitter"
                    whileHover={{ y: -5 }}
                  >
                    <FaTwitter />
                  </motion.a>
                )}
                {author.socialLinks.github && (
                  <motion.a
                    href={author.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="web3-social-link github"
                    whileHover={{ y: -5 }}
                  >
                    <FaGithub />
                  </motion.a>
                )}
                {author.socialLinks.linkedin && (
                  <motion.a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="web3-social-link linkedin"
                    whileHover={{ y: -5 }}
                  >
                    <FaLinkedin />
                  </motion.a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthorPage;