import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaRedo, FaArrowLeft } from 'react-icons/fa';
import './error.css';

// 将组件名从 Error 改为 ErrorUI 以避免与内置 Error 构造函数冲突
function ErrorUI({ 
  message = "An error occurred", 
  details = null,
  size = "medium", // small, medium, large
  containerClassName = "",
  inline = false, // 是否内联显示
  transparent = false, // 是否透明背景
  showRetry = true, // 是否显示重试按钮
  showBack = true, // 是否显示返回按钮
  onRetry = null, // 重试回调
  fullPage = false, // 是否全页面显示
  icon = <FaExclamationTriangle />, // 自定义图标
  onBack = null // 自定义返回回调
}) {
  // 只在需要时使用 useNavigate
  const navigate = showBack ? useNavigate() : null;
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigate) {
      navigate(-1);
    }
  };
  
  const sizeClass = `err-${size}`;
  
  return (
    <div className={`err-container ${sizeClass} ${inline ? 'err-inline' : ''} ${transparent ? 'err-transparent' : ''} ${fullPage ? 'err-full-page' : ''} ${containerClassName}`}>
      <div className="err-cube-wrapper">
        <div className="err-cube">
          <div className="err-cube-face err-cube-front"></div>
          <div className="err-cube-face err-cube-back"></div>
          <div className="err-cube-face err-cube-right"></div>
          <div className="err-cube-face err-cube-left"></div>
          <div className="err-cube-face err-cube-top"></div>
          <div className="err-cube-face err-cube-bottom"></div>
        </div>
      </div>
      <div className="err-content">
        <h2 className="err-title">Error</h2>
        <p className="err-message">{message}</p>
        {details && <p className="err-details">{details}</p>}
      </div>
      <div className="err-actions">
        {showRetry && (
          <button className="err-button err-retry" onClick={handleRetry}>
            <FaRedo /> <span>Retry</span>
          </button>
        )}
        {showBack && (
          <button className="err-button err-back-btn" onClick={handleBack}>
            <FaArrowLeft /> <span>Back</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorUI;
