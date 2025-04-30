import React, { createContext, useState, useEffect } from 'react';
import GlobalError from '../components/public_base_component/GlobalError';  // 更改导入

// 创建上下文
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [deviceType, setDeviceType] = useState('desktop'); // desktop, tablet, mobile
  
  // 检测设备类型
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    // 初始检测
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    // 清理监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // 全局错误处理
  useEffect(() => {
    const handleError = (event) => {
      console.error('全局错误:', event.error);
      setGlobalError(event.error || new Error('应用发生错误，请刷新页面或联系支持团队。'));
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  // 提供给应用的上下文值
  const contextValue = {
    isLoading,
    setIsLoading,
    globalError,
    setGlobalError,
    deviceType,
    
    // 全局加载状态控制函数
    startLoading: () => setIsLoading(true),
    stopLoading: () => setIsLoading(false),
    
    // 全局错误处理函数
    handleError: (error) => {
      console.error('应用错误:', error);
      setGlobalError(error);
    },
    clearError: () => setGlobalError(null),
    
    // 设备类型检查函数
    isMobile: () => deviceType === 'mobile',
    isTablet: () => deviceType === 'tablet',
    isDesktop: () => deviceType === 'desktop'
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {globalError ? (
        <GlobalError 
          error={globalError}
          onRetry={() => setGlobalError(null)}
        />
      ) : children}
    </AppContext.Provider>
  );
};