import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './ErrorWindow.css';

function ErrorWindow({ 
  message = "操作失败", 
  details = null,
  type = "error", // error, warning, success, info
  duration = 5000, // 自动关闭时间，单位毫秒
  onClose = null, // 关闭回调
  position = "top", // top, bottom
  showIcon = true, // 是否显示图标
  showProgress = true, // 是否显示进度条
}) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // 处理关闭
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(() => {
        onClose();
      }, 300); // 等待关闭动画完成
    }
  };

  // 设置自动关闭和进度条
  useEffect(() => {
    if (duration > 0) {
      // 计算进度条更新间隔
      const updateInterval = 16; // 约60fps
      const steps = duration / updateInterval;
      const decrementPerStep = 100 / steps;
      
      // 设置进度条更新
      const id = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrementPerStep;
          if (newProgress <= 0) {
            clearInterval(id);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, updateInterval);
      
      // 设置自动关闭
      const timeoutId = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => {
        clearInterval(id);
        clearTimeout(timeoutId);
      };
    }
  }, [duration]);

  // 根据类型获取图标和颜色
  const getIconAndColor = () => {
    switch (type) {
      case 'error':
        return { 
          icon: <FaExclamationTriangle />, 
          color: 'var(--error-color, #ff5252)',
          bgColor: 'var(--error-bg, rgba(255, 82, 82, 0.1))',
          borderColor: 'var(--error-border, rgba(255, 82, 82, 0.5))'
        };
      case 'warning':
        return { 
          icon: <FaExclamationTriangle />, 
          color: 'var(--warning-color, #ffb300)',
          bgColor: 'var(--warning-bg, rgba(255, 179, 0, 0.1))',
          borderColor: 'var(--warning-border, rgba(255, 179, 0, 0.5))'
        };
      case 'success':
        return { 
          icon: <FaExclamationTriangle />, 
          color: 'var(--success-color, #4caf50)',
          bgColor: 'var(--success-bg, rgba(76, 175, 80, 0.1))',
          borderColor: 'var(--success-border, rgba(76, 175, 80, 0.5))'
        };
      case 'info':
        return { 
          icon: <FaExclamationTriangle />, 
          color: 'var(--info-color, #2196f3)',
          bgColor: 'var(--info-bg, rgba(33, 150, 243, 0.1))',
          borderColor: 'var(--info-border, rgba(33, 150, 243, 0.5))'
        };
      default:
        return { 
          icon: <FaExclamationTriangle />, 
          color: 'var(--error-color, #ff5252)',
          bgColor: 'var(--error-bg, rgba(255, 82, 82, 0.1))',
          borderColor: 'var(--error-border, rgba(255, 82, 82, 0.5))'
        };
    }
  };

  const { icon, color, bgColor, borderColor } = getIconAndColor();
  const positionClass = `errwin-${position}`;

  if (!visible) return null;

  return (
    <div 
      className={`errwin-container ${positionClass} ${visible ? 'errwin-visible' : 'errwin-hidden'}`}
      style={{
        '--errwin-color': color,
        '--errwin-bg-color': bgColor,
        '--errwin-border-color': borderColor
      }}
    >
      {showIcon && (
        <div className="errwin-icon">
          {icon}
        </div>
      )}
      <div className="errwin-content">
        <p className="errwin-message">{message}</p>
        {details && <p className="errwin-details">{details}</p>}
      </div>
      <button className="errwin-close-btn" onClick={handleClose}>
        <FaTimes />
      </button>
      {showProgress && (
        <div className="errwin-progress-container">
          <div 
            className="errwin-progress-bar" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default ErrorWindow;
