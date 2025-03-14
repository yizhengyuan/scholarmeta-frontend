import React, { useState, useRef } from 'react';
import { FaLock, FaEnvelope, FaMobile, FaTimes } from 'react-icons/fa';
import './Settings.css';

function Settings({ onClose }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const initialMousePos = useRef({ x: 0, y: 0 });

  const [privacySettings, setPrivacySettings] = useState({
    postsPublic: true,
    commentsPublic: true,
    likesPublic: false,
    profilePublic: true,
    statisticsPublic: false
  });

  const [contactInfo, setContactInfo] = useState({
    email: 'user@example.com',
    phone: '138****5678'
  });

  const handleMouseDown = (e) => {
    if (e.target.closest('.st-settings-header')) {
      setIsDragging(true);
      initialMousePos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - initialMousePos.current.x;
      const newY = e.clientY - initialMousePos.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handlePrivacyChange = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div 
      className={`st-settings-container ${isDragging ? 'dragging' : ''}`}
      ref={dragRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="st-settings-header">
        <h2>Settings</h2>
        <button className="st-close-button" onClick={handleClose}>
          <FaTimes />
        </button>
      </div>

      <div className="st-settings-content">
        <section className="st-section">
          <h3>
            <FaLock />
            Privacy Settings
          </h3>
          <div className="st-privacy-options">
            {[
              { key: 'postsPublic', label: 'Public Posts' },
              { key: 'commentsPublic', label: 'Public Comments' },
              { key: 'likesPublic', label: 'Public Likes' },
              { key: 'profilePublic', label: 'Public Profile' },
              { key: 'statisticsPublic', label: 'Public Statistics' }
            ].map(({ key, label }) => (
              <div className="st-option" key={key}>
                <span>{label}</span>
                <label className="st-switch">
                  <input 
                    type="checkbox" 
                    checked={privacySettings[key]}
                    onChange={() => handlePrivacyChange(key)}
                  />
                  <span className="st-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="st-section">
          <h3>
            <FaEnvelope />
            Contact Information
          </h3>
          <div className="st-contact-info">
            <div className="st-info-item">
              <div className="st-info-header">
                <label>Email</label>
                <button className="st-edit-btn">Change</button>
              </div>
              <input type="email" value={contactInfo.email} readOnly />
            </div>
            <div className="st-info-item">
              <div className="st-info-header">
                <label>Phone</label>
                <button className="st-edit-btn">Change</button>
              </div>
              <input type="text" value={contactInfo.phone} readOnly />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
