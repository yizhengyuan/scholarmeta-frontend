import React, { useEffect, useState } from 'react';
import './loading.css';

function Loading({ 
  minDuration = 1000, 
  text = "Loading", 
  size = "medium", // small, medium, large
  containerClassName = "",
  inline = false, // 是否内联显示
  transparent = false // 是否透明背景
}) {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    // 添加动态省略号效果
    const dotTimer = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    
    return () => {
      clearInterval(dotTimer);
    };
  }, []);
  
  const sizeClass = `ld3d-${size}`;
  
  return (
    <div className={`ld3d-container ${sizeClass} ${inline ? 'ld3d-inline' : ''} ${transparent ? 'ld3d-transparent' : ''} ${containerClassName}`}>
      <div className="ld3d-cube-wrapper">
        <div className="ld3d-cube">
          <div className="ld3d-cube-face ld3d-front"></div>
          <div className="ld3d-cube-face ld3d-back"></div>
          <div className="ld3d-cube-face ld3d-right"></div>
          <div className="ld3d-cube-face ld3d-left"></div>
          <div className="ld3d-cube-face ld3d-top"></div>
          <div className="ld3d-cube-face ld3d-bottom"></div>
        </div>
      </div>
      {text && (
        <div className="ld3d-text">
          {text}<span className="ld3d-dots">{dots}</span>
        </div>
      )}
    </div>
  );
}

export default Loading;
