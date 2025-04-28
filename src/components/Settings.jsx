import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaEnvelope, FaMobile, FaTimes, FaCheck, FaUndo } from 'react-icons/fa';
import './Settings.css';

function Settings({ onClose, userData, onSettingsUpdate }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const initialMousePos = useRef({ x: 0, y: 0 });
  const updatedSettingsRef = useRef({}); // 用于跟踪所有累积的更改

  // 使用从 MyPage 传递的用户数据初始化隐私设置
  const [privacySettings, setPrivacySettings] = useState({
    postsPublic: userData?.settings?.public_posts || false,
    activitiesPublic: userData?.settings?.public_activities || false,
    profilePublic: userData?.settings?.public_profile || false,
    statisticsPublic: userData?.settings?.public_statistics || false,
    contactPublic: userData?.settings?.public_contact || false
  });

  // 使用从 MyPage 传递的用户数据初始化联系信息
  const [contactInfo, setContactInfo] = useState({
    email: userData?.email || '',
    phone: userData?.phone || ''
  });

  // 添加编辑状态
  const [isEditing, setIsEditing] = useState({
    email: false,
    phone: false
  });

  // 添加临时编辑值
  const [editValues, setEditValues] = useState({
    email: userData?.email || '',
    phone: userData?.phone || ''
  });

  // 当 userData 更新时，同步更新组件状态
  useEffect(() => {
    setPrivacySettings({
      postsPublic: userData?.settings?.public_posts || false,
      activitiesPublic: userData?.settings?.public_activities || false,
      profilePublic: userData?.settings?.public_profile || false,
      statisticsPublic: userData?.settings?.public_statistics || false,
      contactPublic: userData?.settings?.public_contact || false
    });
    
    setContactInfo({
      email: userData?.email || '',
      phone: userData?.phone || ''
    });
    
    setEditValues({
      email: userData?.email || '',
      phone: userData?.phone || ''
    });
    
    // 重置编辑状态
    setIsEditing({
      email: false,
      phone: false
    });
    
    // 重置累积的更改
    updatedSettingsRef.current = {};
  }, [userData]);

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

  useEffect(() => {
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
    
    // 关闭前发送所有累积的更改
    if (Object.keys(updatedSettingsRef.current).length > 0 && onSettingsUpdate) {
      onSettingsUpdate(updatedSettingsRef.current);
    }
    
    onClose();
  };

  const handlePrivacyChange = (key) => {
    // 更新本地状态
    setPrivacySettings(prev => {
      const newValue = !prev[key];
      const newSettings = { ...prev, [key]: newValue };
      
      // 将设置转换为后端格式
      const backendSettings = {
        public_posts: newSettings.postsPublic,
        public_activities: newSettings.activitiesPublic,
        public_profile: newSettings.profilePublic,
        public_statistics: newSettings.statisticsPublic,
        public_contact: newSettings.contactPublic
      };
      
      // 累积更改
      updatedSettingsRef.current = {
        ...updatedSettingsRef.current,
        settings: backendSettings
      };
      
      // 立即通知父组件
      if (onSettingsUpdate) {
        onSettingsUpdate({ settings: backendSettings });
      }
      
      return newSettings;
    });
  };

  // 处理编辑模式切换
  const handleEditToggle = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // 重置编辑值为当前值
    if (!isEditing[field]) {
      setEditValues(prev => ({
        ...prev,
        [field]: contactInfo[field]
      }));
    }
  };

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理保存
  const handleSave = (field) => {
    // 更新本地状态
    setContactInfo(prev => ({
      ...prev,
      [field]: editValues[field]
    }));
    
    // 累积更改
    updatedSettingsRef.current = {
      ...updatedSettingsRef.current,
      [field]: editValues[field]
    };
    
    // 立即通知父组件
    if (onSettingsUpdate) {
      onSettingsUpdate({ [field]: editValues[field] });
    }
    
    // 退出编辑模式
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // 处理取消
  const handleCancel = (field) => {
    // 重置编辑值
    setEditValues(prev => ({
      ...prev,
      [field]: contactInfo[field]
    }));
    
    // 退出编辑模式
    setIsEditing(prev => ({
      ...prev,
      [field]: false
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
              { key: 'activitiesPublic', label: 'Public Activities' },
              { key: 'profilePublic', label: 'Public Profile' },
              { key: 'statisticsPublic', label: 'Public Statistics' },
              { key: 'contactPublic', label: 'Public Contact Info' }
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
                {isEditing.email ? (
                  <div className="st-edit-actions">
                    <button 
                      className="st-action-btn st-save-btn"
                      onClick={() => handleSave('email')}
                    >
                      <FaCheck />
                    </button>
                    <button 
                      className="st-action-btn st-cancel-btn"
                      onClick={() => handleCancel('email')}
                    >
                      <FaUndo />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="st-edit-btn"
                    onClick={() => handleEditToggle('email')}
                  >
                    Edit
                  </button>
                )}
              </div>
              <input 
                type="email" 
                value={isEditing.email ? editValues.email : contactInfo.email} 
                onChange={(e) => handleInputChange('email', e.target.value)}
                readOnly={!isEditing.email}
                className={isEditing.email ? 'st-editing' : ''}
              />
            </div>
            <div className="st-info-item">
              <div className="st-info-header">
                <label>Phone</label>
                {isEditing.phone ? (
                  <div className="st-edit-actions">
                    <button 
                      className="st-action-btn st-save-btn"
                      onClick={() => handleSave('phone')}
                    >
                      <FaCheck />
                    </button>
                    <button 
                      className="st-action-btn st-cancel-btn"
                      onClick={() => handleCancel('phone')}
                    >
                      <FaUndo />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="st-edit-btn"
                    onClick={() => handleEditToggle('phone')}
                  >
                    Edit
                  </button>
                )}
              </div>
              <input 
                type="text" 
                value={isEditing.phone ? editValues.phone : contactInfo.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)}
                readOnly={!isEditing.phone}
                className={isEditing.phone ? 'st-editing' : ''}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
